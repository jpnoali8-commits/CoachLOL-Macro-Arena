/** CoachLOL Dev69 M3: Lux R/Prismatic Barrier real temporal contracts.
 * Branch dev69/skills-batch2; Nami/Vex/Ahri/Jinx bundles remain untouched.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,kitSpellV42} from '../engine.mjs';
const load=x=>JSON.parse(readFileSync(new URL('../data/'+x,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let pass=0;
function test(label,fn){fn();pass++;console.log('✓ DEV69 M3 '+label);}
function make(team){
 const foe=team==='blue'?'red':'blue',a=new Arena(map,mask,{
  seed:6931,draft:{[team]:{MID:'Lux'}},roundSeconds:10});
 for(const w of a.units)Object.assign(w,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(w=>w.id===team+'_MID');
 const enemy=a.units.find(w=>w.id===foe+'_MID'),enemy2=a.units.find(w=>w.id===foe+'_TOP');
 const ally=a.units.find(w=>w.id===team+'_TOP');
 Object.assign(u,{x:.5,y:.5,champ:'Lux',mana:500,maxMana:500,ap:0,skillRanks:{Q:1,W:1,E:1,R:1},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:.54,y:.5,hp:2000,maxHp:2000,armor:0,mr:0});
 Object.assign(enemy2,{x:.56,y:.5,hp:2000,maxHp:2000,armor:0,mr:0});
 Object.assign(ally,{x:.53,y:.5,hp:2000,maxHp:2000});
 a.visible=()=>true;
 return {a,u,ally,enemy,enemy2,team,foe};
}
test('Lux R patch rule: 3 ranks, 3400 range, 200 width and 1s required windup',()=>{
 const r=kitSpellV42('Lux','R');
 assert.deepEqual(r.damage,[300,400,500]);assert.equal(r.range,3400);assert.equal(r.width,200);
});
for(const team of ['blue','red']){
 const {a,u,enemy,enemy2,ally,foe}=make(team);
 const invalid=a.castLuxFinalSparkV453Dev69M3(u,{x:u.x,y:u.y});
 test(team+' invalid R has zero resource cost / no pending beam',()=>{
  assert.equal(invalid.ok,false);assert.equal(u.mana,500);
  assert.equal(a.luxFinalSparkPendingV453Dev69M3?.length||0,0);
 });
 const denied=a.queueDirectionalSkill(foe,u.id,'R',{x:.9,y:.5});
 test(team+' unauthorized opposing seat cannot queue Lux R',()=>assert.equal(denied.ok,false));
 const queued=a.queueDirectionalSkill(team,u.id,'R',{x:.9,y:.5});
 test(team+' R is queued, paid only on server execution',()=>{
  assert.equal(queued.ok,true);assert.equal(u.mana,500);
  assert.equal(enemy.hp,2000);
 });
 a.resolveDirectionalSkills();
 test(team+' R launches delayed beam with exactly one mana charge and cooldown',()=>{
  assert.equal(u.mana,400);assert.ok(u.skillCds.R>a.gameTime);
  assert.equal(enemy.hp,2000);assert.equal(a.luxFinalSparkPendingV453Dev69M3.length,1);
  assert.equal(a.luxFinalSparkPendingV453Dev69M3[0].impactAt,a.gameTime+1);
 });
 a.gameTime=.9;a.advanceLuxFinalSparkV453Dev69M3();
 test(team+' R is not instantaneous before its full windup',()=>assert.equal(enemy.hp,2000));
 const save=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 test(team+' pending windup survives checkpoint deterministically',()=>{
  assert.equal(checksumV40(a.snapshotV40()),checksumV40(save.snapshotV40()));
 });
 u.x=.52;u.y=.54;save.units.find(x=>x.id===u.id).x=.52;save.units.find(x=>x.id===u.id).y=.54;
 a.gameTime=save.gameTime=1;
 a.advanceLuxFinalSparkV453Dev69M3();save.advanceLuxFinalSparkV453Dev69M3();
 test(team+' beam targets original line, damages 2 enemies and not ally',()=>{
  assert.ok(enemy.hp<2000&&enemy2.hp<2000);
  assert.equal(ally.hp,2000);
  assert.equal(enemy.hp,save.units.find(x=>x.id===enemy.id).hp);
  assert.equal(a.luxFinalSparkPendingV453Dev69M3.length,0);
  assert.ok(enemy.revealedUntil?.[team]>=2.5);
  assert.equal(enemy.luxIlluminationV453Dev69M2?.ownerId,u.id);
 });
 const after=enemy.hp;a.gameTime=1.5;a.advanceLuxFinalSparkV453Dev69M3();
 test(team+' R cannot deal duplicate damage/recharge when reprocessed',()=>{
  assert.equal(enemy.hp,after);assert.equal(u.mana,400);
 });
 const shield=make(team);
 shield.a.applyEffectV41(shield.enemy,'spell_shield',{source:shield.enemy,duration:4});
 const shot=shield.a.castLuxFinalSparkV453Dev69M3(shield.u,{x:.9,y:.5});
 shield.a.gameTime=1;shield.a.advanceLuxFinalSparkV453Dev69M3();
 test(team+' spell shield prevents R damage/reveal/mark and is consumed',()=>{
  assert.ok(shot.ok);assert.equal(shield.enemy.hp,2000);
  assert.equal(shield.enemy.luxIlluminationV453Dev69M2??null,null);
  assert.equal(shield.a.effectResolverV41().has(shield.enemy,'spell_shield'),false);
 });
 const dead=make(team);
 assert.ok(dead.a.castLuxFinalSparkV453Dev69M3(dead.u,{x:.9,y:.5}).ok);
 dead.u.hp=0;dead.a.gameTime=1;dead.a.advanceLuxFinalSparkV453Dev69M3();
 test(team+' death during windup cancels damage without refund or second R',()=>{
  assert.equal(dead.enemy.hp,2000);assert.equal(dead.a.luxFinalSparkPendingV453Dev69M3.length,0);
  assert.equal(dead.u.mana,400);
 });
 const wall=make(team);
 wall.a.projectileBarriersV453Dev43.push({id:'wall-'+team,x:.52,y:.5,team:wall.foe,radius:180,until:3});
 wall.a.castLuxFinalSparkV453Dev69M3(wall.u,{x:.9,y:.5});wall.a.gameTime=1;
 wall.a.advanceLuxFinalSparkV453Dev69M3();
 test(team+' non-projectile Lux laser crosses Wind Wall to damage targets',()=>{
  assert.ok(wall.enemy.hp<2000);
 });
 const w=make(team);const cast=w.a.launchChampionDirectionalV453Dev69M2(w.u,'W',{x:.9,y:.5});
 test(team+' W starts with one self shield and single resource cost',()=>{
  assert.ok(cast.ok);assert.equal(w.u.mana,440);
  assert.equal(w.a.effectResolverV41().list(w.u).filter(x=>x.type==='shield').length,1);
 });
 w.a.gameTime=.32;w.a.advanceChampionProjectilesV453Dev42();
 test(team+' W shields ally on real outward contact',()=>{
  assert.equal(w.a.effectResolverV41().list(w.ally).filter(x=>x.type==='shield').length,1);
 });
 w.a.gameTime=.53;w.a.advanceChampionProjectilesV453Dev42();
 test(team+' outward W starts homing return but does not instantly shield self again',()=>{
  assert.equal(w.a.championProjectilesV453Dev42[0].kind,'lux_w_back');
  assert.equal(w.a.effectResolverV41().list(w.u).filter(x=>x.type==='shield').length,1);
 });
 w.u.y=.53;w.ally.x=.55;w.ally.y=.511; // Ally moves into caster-tracking return line.
 w.a.gameTime=.93;w.a.advanceChampionProjectilesV453Dev42();
 const copy=Arena.fromSnapshotV40(map,mask,w.a.snapshotV40());
 test(team+' W return follows moving caster, second ally shield from swept segment',()=>{
  assert.equal(w.a.effectResolverV41().list(w.ally).filter(x=>x.type==='shield').length,2);
  assert.equal(checksumV40(w.a.snapshotV40()),checksumV40(copy.snapshotV40()));
 });
 w.a.gameTime=copy.gameTime=1.3;w.a.advanceChampionProjectilesV453Dev42();copy.advanceChampionProjectilesV453Dev42();
 test(team+' W returns physically, double shields caster, stops and snapshots equal',()=>{
  assert.equal(w.a.championProjectilesV453Dev42.length,0);
  assert.equal(w.a.effectResolverV41().list(w.u).filter(x=>x.type==='shield').length,2);
  assert.equal(checksumV40(w.a.snapshotV40()),checksumV40(copy.snapshotV40()));
 });
}
console.log('DEV69 MULTI CHAMPIONS M3 '+pass+'/'+pass+' PASS');
