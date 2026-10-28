/** Dev69 M4: Ahri P/Q/W/E/R all routes in server-owned turn based PvP. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,kitSpellV42} from '../engine.mjs';
const get=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=get('coachlol_map_v6.json'),mask=get('masks_128.json');
let passed=0;function test(name,fn){fn();passed++;console.log('✓ M4 '+name)}
function setup(team='blue'){
 const rival=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:6944,roundSeconds:10,draft:{[team]:{MID:'Ahri'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFarm:false,autoFollow:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),enemy=a.units.find(v=>v.id===rival+'_MID'),
  enemy2=a.units.find(v=>v.id===rival+'_TOP'),ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{x:.5,y:.5,champ:'Ahri',mana:500,maxMana:500,hp:250,maxHp:1000,
  ap:0,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:.533,y:.5,hp:2000,maxHp:2000,mr:0,armor:0});
 Object.assign(enemy2,{x:.54,y:.5,hp:2000,maxHp:2000,mr:0,armor:0});
 Object.assign(ally,{x:.55,y:.53});
 a.visible=()=>true;
 return {a,u,enemy,enemy2,ally,team,rival};
}
test('Ahri five real kit slots P,Q,W,E,R, individual rank contracts',()=>{
 const q=kitSpellV42('Ahri','Q'),w=kitSpellV42('Ahri','W'),
 e=kitSpellV42('Ahri','E'),r=kitSpellV42('Ahri','R');
 assert.equal(q.kind,'line_return');assert.equal(e.kind,'line_projectile');
 assert.equal(w.fireCount,3);assert.equal(r.charges,3);assert.equal(r.kind,'dash_recast');
 assert.deepEqual(r.damage,[75,125,175]);
 assert.deepEqual(w.cooldown,[9,8,7,6,5]);assert.deepEqual(r.cooldown,[130,115,100]);
});
for(const team of ['blue','red']){
 const {a,u,enemy,enemy2,team:seat,rival}=setup(team);
 test(team+' other seat cannot queue Ahri W/R',()=>{
  assert.equal(a.queueKitSkillV42(rival,u.id,'W',{x:.5,y:.5}).ok,false);
  assert.equal(a.queueDirectionalSkill(rival,u.id,'R',{x:.6,y:.5}).ok,false);
 });
 const initial=a.effectiveMS(u);
 const w=a.queueKitSkillV42(seat,u.id,'W',{x:.6,y:.5});
 test(team+' W queue costs no mana, cannot duplicate',()=>{
  assert.equal(w.ok,true);assert.equal(u.mana,500);
  assert.equal(a.queueKitSkillV42(seat,u.id,'W',{x:.6,y:.5}).ok,false);
 });
 a.resolveKitSkillsV42();
 test(team+' Fox-Fire W commits once, gives move speed and three scheduled shots',()=>{
  assert.equal(u.mana,470);assert.ok(u.skillCds.W>0);
  assert.ok(a.effectiveMS(u)>initial);
  assert.equal(a.ahriFoxFiresPendingV453Dev69M4[0].remaining,3);
  assert.equal(enemy.hp,2000);
 });
 a.advanceAhriFoxFireV453Dev69M4();
 test(team+' one fox fire hits nearby visible champion at launch, not all three',()=>{
  assert.ok(enemy.hp<2000);assert.equal(a.ahriFoxFiresPendingV453Dev69M4[0].remaining,2);
 });
 const checkpoint=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 test(team+' pending foxfire checkpoint survives restore',()=>{
  assert.equal(checksumV40(a.snapshotV40()),checksumV40(checkpoint.snapshotV40()));
 });
 a.gameTime=.45;checkpoint.gameTime=.45;
 a.advanceAhriFoxFireV453Dev69M4();checkpoint.advanceAhriFoxFireV453Dev69M4();
 test(team+' all three W projectiles apply once, no extra mana on advancement',()=>{
  assert.equal(a.ahriFoxFiresPendingV453Dev69M4.length,0);
  assert.ok(enemy.hp<2000&&enemy2.hp<2000);
  assert.equal(u.mana,470);
  assert.equal(checksumV40(a.snapshotV40()),checksumV40(checkpoint.snapshotV40()));
 });
 a.gameTime=3;
 test(team+' W movement speed expires without permanent mutation',()=>{
  assert.equal(a.effectiveMS(u),initial);
 });
 const r=setup(team),R=r.a;
 const prior=r.u.mana;
 test(team+' R invalid direction has no cost',()=>{
  assert.equal(R.castAhriSpiritRushV453Dev69M4(r.u,{x:r.u.x,y:r.u.y}).ok,false);
  assert.equal(r.u.mana,prior);
 });
 const first=R.queueDirectionalSkill(team,r.u.id,'R',{x:.56,y:.5});
 test(team+' R authorized queued intent, no immediate dash/cost',()=>{
  assert.equal(first.ok,true);assert.equal(r.u.x,.5);assert.equal(r.u.mana,prior);
 });
 R.resolveDirectionalSkills();
 test(team+' Spirit Rush first dash costs mana only once and fires bolts',()=>{
  assert.equal(r.u.mana,400);assert.ok(r.u.x>.5);
  assert.equal(r.u.ahriSpiritRushV453Dev69M4.charges,2);
  assert.ok(r.enemy.hp<2000&&r.enemy2.hp<2000);
 });
 const state=Arena.fromSnapshotV40(map,mask,R.snapshotV40());
 test(team+' Ahri R state persists in checkpoint',()=>assert.equal(checksumV40(R.snapshotV40()),checksumV40(state.snapshotV40())));
 const recast=R.queueDirectionalSkill(team,r.u.id,'R',{x:.6,y:.5});
 test(team+' R can recast while original cooldown is active',()=>{
  assert.equal(recast.ok,true);assert.equal(r.u.mana,400);
 });
 R.resolveDirectionalSkills();
 const second=R.castAhriSpiritRushV453Dev69M4(r.u,{x:.65,y:.5});
 test(team+' R subsequent 2 dashes use charges and never charge mana twice',()=>{
  assert.equal(second.ok,true);assert.equal(r.u.mana,400);
  assert.equal(r.u.ahriSpiritRushV453Dev69M4.charges,0);
 });
 test(team+' exhausted R charges fail without a second mana cost',()=>{
  const result=R.castAhriSpiritRushV453Dev69M4(r.u,{x:.7,y:.5});
  assert.equal(result.ok,false);assert.equal(r.u.mana,400);
 });
 const e=setup(team);
 const wSlow=e.a.queueKitSkillV42(team,e.u.id,'W',{x:.5,y:.5});
 e.a.resolveKitSkillsV42();
 const before=e.u.hp;e.a.ahriEssenceDeathV453Dev69M4(e.u,{champion:true});
 test(team+' Essence Theft heals only on confirmed champion takedown and grants R charge when active',()=>{
  assert.ok(wSlow.ok);assert.ok(e.u.hp>before);
  const h=e.u.hp;e.a.ahriEssenceDeathV453Dev69M4(e.ally,{champion:true});assert.equal(e.u.hp,h);
 });
 const essence=setup(team);
 for(let i=0;i<8;i++)essence.a.ahriEssenceDeathV453Dev69M4(essence.u);
 test(team+' minion Essence Theft does not heal before ninth kill',()=>{
  assert.equal(essence.u.ahriEssenceMinionsV453Dev69M4,8);assert.equal(essence.u.hp,250);
 });
 essence.a.ahriEssenceDeathV453Dev69M4(essence.u);
 test(team+' minion Essence Theft heals on ninth kill and resets counter',()=>{
  assert.ok(essence.u.hp>250);assert.equal(essence.u.ahriEssenceMinionsV453Dev69M4,0);
 });
 const fog=setup(team);fog.a.visible=(observer,v)=>v.team===observer;const shot=fog.a.castAhriFoxFireV453Dev69M4(fog.u);
 fog.a.advanceAhriFoxFireV453Dev69M4();
 test(team+' Ahri W does not target enemy champion hidden by fog',()=>{
  assert.ok(shot.ok);assert.equal(fog.enemy.hp,2000);assert.equal(fog.enemy2.hp,2000);
 });
}
console.log('DEV69 MULTI CHAMPIONS M4 '+passed+'/'+passed+' PASS');
