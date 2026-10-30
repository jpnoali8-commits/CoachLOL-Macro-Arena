/** Dev69 M6 — precise Ahri Q return and independent Jinx E traps.
 * Added to the same unmerged PR #9, both player seats tested.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,kitSpellV42} from '../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let passed=0;function test(name,fn){fn();passed++;console.log('✓ DEV69 M6 '+name);}
function fresh(champ,team){
 const rival=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:6966,roundSeconds:10,draft:{[team]:{MID:champ}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFarm:false,autoFollow:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),enemy=a.units.find(v=>v.id===rival+'_MID'),
  enemy2=a.units.find(v=>v.id===rival+'_TOP'),ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{x:.5,y:.5,champ,mana:500,maxMana:500,ap:0,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 for(const v of [enemy,enemy2])Object.assign(v,{hp:2000,maxHp:2000,armor:0,mr:0,shield:0});
 a.visible=()=>true;
 return {a,u,enemy,enemy2,ally,team,rival};
}
test('Ahri audited 26.21 Q .50 AP and W second wisp .40, R 75/125/175',()=>{
 assert.equal(kitSpellV42('Ahri','Q').apRatio,.5);
 assert.equal(kitSpellV42('Ahri','W').subsequentRatio,.40);
 assert.deepEqual(kitSpellV42('Ahri','R').damage,[75,125,175]);
 assert.deepEqual(kitSpellV42('Ahri','R').cooldown,[130,115,100]);
});
for(const team of ['blue','red']){
 const t=fresh('Ahri',team),{a,u,enemy,enemy2}=t;
 Object.assign(enemy,{x:.534,y:.5});Object.assign(enemy2,{x:.54,y:.515});
 assert.equal(a.launchChampionDirectionalV453Dev69M2(u,'Q',{x:.8,y:.5}).ok,true);
 a.gameTime=.7;a.advanceChampionProjectilesV453Dev42();
 test(team+' Ahri Q outbound hit only on straight first leg',()=>{
  assert.ok(enemy.hp<2000);assert.equal(enemy2.hp,2000);
  assert.equal(a.championProjectilesV453Dev42[0].kind,'ahri_q_back');
 });
 const first=enemy.hp;
 u.y=.54; // Actual moving caster; old fixed reverse ray would miss enemy2.
 const checkpoint=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 a.gameTime=checkpoint.gameTime=1.08;
 a.advanceChampionProjectilesV453Dev42();checkpoint.advanceChampionProjectilesV453Dev42();
 test(team+' Ahri Q returns toward current Y and hits off-axis champion',()=>{
  assert.ok(enemy2.hp<2000);
  assert.equal(enemy.hp,first);
  assert.equal(checksumV40(a.snapshotV40()),checksumV40(checkpoint.snapshotV40()));
  const p=a.championProjectilesV453Dev42[0];
  assert.equal(p.kind,'ahri_q_back');
  assert.ok(p.returnPositionV453Dev69M6.y>.5);
 });
 a.gameTime=2;a.advanceChampionProjectilesV453Dev42();
 const final=enemy2.hp;a.gameTime=3;a.advanceChampionProjectilesV453Dev42();
 test(team+' Ahri Q return completes and never damages same target twice',()=>{
  assert.equal(enemy2.hp,final);assert.equal(a.championProjectilesV453Dev42.length,0);
 });
 const j=fresh('Jinx',team),l={x:.54,y:.5};
 // Three traps are laid perpendicular to the cast direction at +/-90 units.
 Object.assign(j.enemy,{x:.54,y:.488});
 Object.assign(j.enemy2,{x:.08,y:.08});
 assert.equal(j.a.castJinxChompersV453Dev69M5(j.u,l).ok,true);
 j.a.gameTime=1;j.a.advanceJinxChompersV453Dev69M5();
 test(team+' Jinx trap 1 triggers separately; other two remain armed',()=>{
  const p=j.a.jinxChompersV453Dev69M5[0];
  assert.ok(j.enemy.hp<2000);
  assert.deepEqual(p.detonatedCenters,[0]);
  assert.equal(j.enemy2.hp,2000);
 });
 const health=j.enemy.hp;
 j.enemy2.x=.54;j.enemy2.y=.512;j.a.gameTime=1.2;j.a.advanceJinxChompersV453Dev69M5();
 test(team+' Jinx trap 3 independently explodes for a second champion',()=>{
  const p=j.a.jinxChompersV453Dev69M5[0];
  assert.ok(j.enemy2.hp<2000);
  assert.equal(p.detonatedCenters.length,2);
  assert.equal(j.enemy.hp,health);
  assert.equal(p.hitIds.filter(id=>id===j.enemy.id).length,1);
 });
 const snapshot=Arena.fromSnapshotV40(map,mask,j.a.snapshotV40());
 test(team+' independent trap state survives checkpoint/reconnect',()=>{
  assert.equal(checksumV40(j.a.snapshotV40()),checksumV40(snapshot.snapshotV40()));
 });
 j.a.gameTime=snapshot.gameTime=6;
 j.a.advanceJinxChompersV453Dev69M5();
 snapshot.advanceJinxChompersV453Dev69M5();
 test(team+' untriggered middle trap detonates at expiry and no champion double-procs',()=>{
  assert.equal(j.a.jinxChompersV453Dev69M5.length,0);
  assert.equal(j.enemy.hp,health);
  assert.equal(checksumV40(j.a.snapshotV40()),checksumV40(snapshot.snapshotV40()));
 });
}
console.log('DEV69 MULTI CHAMPIONS M6 '+passed+'/'+passed+' PASS');
