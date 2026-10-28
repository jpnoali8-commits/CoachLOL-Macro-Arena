/** Dev69 multi-champion milestone: 16.21.1 verified data + individual Nami/Vex spell paths.
 * Do not certify complete kits until all champion-specific passives/interactions pass.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,CHAMPION_LEVEL_STATS_V453_DEV69_M1,championLevelStatsV453Dev69M1} from '../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
let count=0;function test(n,fn){fn();count++;console.log('✓ M1 '+n);}
const champions=['Nami','Vex','Lux','Jinx','Ahri','Ezreal','Irelia','Caitlyn','Leona','Volibear'];
const prepared=(champ='Vex',team='blue')=>{
 const enemyTeam=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:6920,roundSeconds:10,draft:{[team]:{MID:champ}}});
 for(const w of a.units)Object.assign(w,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(w=>w.id===team+'_MID'),ally=a.units.find(w=>w.id===team+'_TOP'),enemy=a.units.find(w=>w.id===enemyTeam+'_MID');
 Object.assign(u,{x:.5,y:.5,champ,ap:0,mana:500,maxMana:500,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(ally,{x:.532,y:.5,autoAttack:false});
 Object.assign(enemy,{x:.532,y:.5,hp:2000,maxHp:2000,armor:0,mr:0,shield:0});
 a.visible=()=>true;
 return {a,u,ally,enemy,team,enemyTeam};
};
test('registry holds 10 individual source records, not generic class defaults',()=>{
 assert.deepEqual(Object.keys(CHAMPION_LEVEL_STATS_V453_DEV69_M1).sort(),champions.slice().sort());
 assert.equal(championLevelStatsV453Dev69M1('Nami',0),null);
 assert.equal(championLevelStatsV453Dev69M1('NoSuchChampion',18),null);
});
for(const champ of champions){
 const a=prepared(champ).a,u=a.units.find(v=>v.id==='blue_MID');
 const lvl1=championLevelStatsV453Dev69M1(champ,1),lvl18=championLevelStatsV453Dev69M1(champ,18);
 test(champ+' base stats are source-specific and world AA range matches meters',()=>{
  for(const [k,got] of [['hp',u.maxHp],['mana',champ==='Vex'||champ==='Nami'?u.maxMana:championLevelStatsV453Dev69M1(champ,1).mana],['ad',u.ad],['armor',u.armor],['mr',u.mr],['hpRegen',u.hpRegen],['manaRegen',u.manaRegen]])
   assert.ok(Math.abs(lvl1[k]-got)<1e-8,k+' '+got+' expected '+lvl1[k]);
  assert.equal(Math.round(u.range*15000),lvl1.attackRange);
  assert.equal(u.moveSpeed,lvl1.moveSpeed);
  assert.ok(lvl1.attackSpeed>0);
 });
 a.gainXP(u,100000);
 test(champ+' levels 1 through 18 using nonlinear official progression',()=>{
  assert.equal(u.level,18);
  for(const [k,got] of [['hp',u.maxHp],['ad',u.ad],['armor',u.armor],['mr',u.mr],['hpRegen',u.hpRegen],['manaRegen',u.manaRegen]])
   assert.ok(Math.abs(lvl18[k]-got)<1e-5,k+' '+got+' expected '+lvl18[k]);
  assert.ok(Math.abs(u.attackSpeedRealV453Dev69M1-lvl18.attackSpeed)<1e-8);
  assert.ok(lvl18.hp>lvl1.hp&&lvl18.mana>lvl1.mana);
  assert.equal(lvl18.adGrowthVerified,['Nami','Vex','Lux','Jinx','Ahri'].includes(champ));
 });
}
for(const team of ['blue','red']){
 const n=prepared('Nami',team);const {a,u,ally,enemy}=n;
 test(team+' Nami E ally-target authorization and zero cost on illegal enemy target',()=>{
  const bad=a.queueTargetedSkill(team,u.id,'E',enemy.id);
  assert.equal(bad.ok,false);assert.equal(u.mana,500);
  assert.equal(a.queueTargetedSkill(team,u.id,'E',ally.id).ok,true);
 });
 a.resolveTargetedCasts();
 test(team+' Nami E charges, mana/cooldown and passive are initialized exactly once',()=>{
  assert.equal(u.mana,445);assert.equal(ally.namiTidecallerV453Dev69M1?.charges,3);
  assert.ok(a.namiSurgingSpeedV453Dev69B2(ally)>0);
  assert.ok(u.skillCds.E>0);
 });
 const hpBefore=enemy.hp;
 a.attack(ally,enemy,50);
 test(team+' Nami E first AA is an actual bonus damage + slow proc',()=>{
  assert.ok(enemy.hp<hpBefore-50);
  assert.equal(ally.namiTidecallerV453Dev69M1.charges,2);
  assert.ok(a.effectResolverV41().has(enemy,'slow'));
 });
 const snapshot=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 test(team+' Nami E remaining charges survive deterministic snapshot',()=>{
  assert.equal(checksumV40(a.snapshotV40()),checksumV40(snapshot.snapshotV40()));
  assert.equal(snapshot.units.find(v=>v.id===ally.id).namiTidecallerV453Dev69M1.charges,2);
 });
 a.attack(ally,enemy,50);a.attack(ally,enemy,50);const after3=enemy.hp;
 a.attack(ally,enemy,50);
 test(team+' Nami E exactly 3 attacks, no repeated 4th proc',()=>{
  assert.equal(ally.namiTidecallerV453Dev69M1,null);
  assert.ok(Math.abs((after3-enemy.hp)-50)<.05);
 });
 const w=prepared('Nami',team);w.ally.hp=300;
 assert.equal(w.a.queueTargetedSkill(team,w.u.id,'W',w.ally.id).ok,true);
 w.a.resolveTargetedCasts();
 test(team+' Nami W healing applies normal Surging Tides',()=>{
  assert.ok(w.ally.hp>300);assert.ok(w.a.namiSurgingSpeedV453Dev69B2(w.ally)>0);
 });
 const q=prepared('Vex',team);
 const cast=q.a.castVexBasicV453Dev69M1(q.u,'Q',{x:.56,y:.5});
 test(team+' Vex Q spawns temporal accelerating missile, with one cast cost',()=>{
  assert.ok(cast.ok&&cast.pending);assert.equal(q.u.mana,455);
  assert.equal(q.enemy.hp,2000);assert.equal(q.a.championProjectilesV453Dev42[0]?.kind,'vex_q');
  assert.ok(q.u.vexDoomReadyAtV453Dev69M1>0);
 });
 q.a.gameTime=.3;q.a.advanceChampionProjectilesV453Dev42();
 test(team+' Vex Q cannot damage before actual swept contact',()=>assert.equal(q.enemy.hp,2000));
 q.a.gameTime=1.0;q.a.advanceChampionProjectilesV453Dev42();
 test(team+' Vex Q hits once, deals rank damage and Doom fear',()=>{
  assert.ok(q.enemy.hp<2000);assert.ok(q.a.effectResolverV41().has(q.enemy,'fear'));
  assert.equal(q.a.championProjectilesV453Dev42[0]?.hitIds.filter(id=>id===q.enemy.id).length,1);
 });
 const qSave=Arena.fromSnapshotV40(map,mask,q.a.snapshotV40());
 test(team+' Vex Q flight/hits replay in serializable state',()=>{
  assert.equal(checksumV40(q.a.snapshotV40()),checksumV40(qSave.snapshotV40()));
 });
 const wv=prepared('Vex',team);wv.enemy.x=.527;const shield=wv.a.castVexBasicV453Dev69M1(wv.u,'W');
 test(team+' Vex W has self shield plus close-range magic hit and Doom CC',()=>{
  assert.ok(shield.ok);assert.ok(wv.a.effectResolverV41().has(wv.u,'shield'));
  assert.ok(wv.enemy.hp<2000);assert.ok(wv.a.effectResolverV41().has(wv.enemy,'fear'));
 });
 const ev=prepared('Vex',team);const zone=ev.a.castVexBasicV453Dev69M1(ev.u,'E',{x:.532,y:.5});
 test(team+' Vex E travels before applying damage/slow/Gloom',()=>{
  assert.ok(zone.ok&&zone.pending);assert.equal(ev.enemy.hp,2000);
  assert.equal(ev.a.vexEZonesV453Dev69M1.length,1);
 });
 ev.a.gameTime=.5;ev.a.advanceVexEZonesV453Dev69M1();
 test(team+' Vex E cannot impact before travel-time',()=>assert.equal(ev.enemy.hp,2000));
 ev.a.gameTime=.75;ev.a.advanceVexEZonesV453Dev69M1();
 test(team+' Vex E mark/slow and single-impact after travel',()=>{
  assert.ok(ev.enemy.hp<2000);assert.equal(ev.enemy.vexGloomV453Dev69M1?.ownerId,ev.u.id);
  assert.ok(ev.a.effectResolverV41().has(ev.enemy,'slow'));
  assert.equal(ev.a.vexEZonesV453Dev69M1.length,0);
 });
 const prev=ev.enemy.hp;
 ev.a.vexConsumeGloomV453Dev69M1(ev.u,ev.enemy);
 test(team+' Vex Gloom consumes mark once and damages with refund',()=>{
  assert.ok(ev.enemy.hp<prev);assert.equal(ev.enemy.vexGloomV453Dev69M1,null);
  const hp=ev.enemy.hp;ev.a.vexConsumeGloomV453Dev69M1(ev.u,ev.enemy);
  assert.equal(ev.enemy.hp,hp);
 });
 const z=prepared('Vex',team);const failed=z.a.castVexBasicV453Dev69M1(z.u,'Q',{x:z.u.x,y:z.u.y});
 test(team+' invalid zero-direction Q must not cost mana or cooldown',()=>{
  assert.equal(failed.ok,false);assert.equal(z.u.mana,500);assert.equal(z.u.skillCds.Q,0);
 });
}
console.log('DEV69 MULTI CHAMPIONS M1 '+count+'/'+count+' PASS');
