/** M14 global ultimate regression contracts. Effects that remain approximations are explicitly noted. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
const file=x=>JSON.parse(readFileSync(new URL('../data/'+x,import.meta.url)));
const map=file('coachlol_map_v6.json'),mask=file('masks_128.json');
let count=0;function check(name,fn){fn();count++;console.log('✓ M14 GLOBAL '+name)}
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:6918,mode:'pvp',draft:{[team]:{MID:champ}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),enemy=a.units.find(v=>v.id===other+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,level:6,mana:1000,maxMana:1000,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:.53,y:.5,hp:1500,maxHp:1500,mr:0,armor:0});
 Object.assign(ally,{x:.52,y:.5,hp:200,maxHp:1300});
 a.visible=()=>true;return {a,u,enemy,ally,team,other};
}
function launchDelayed(t,champ,power=180){
 t.a.round=2;t.a.gameTime=4;
 t.a.delayedEffects.push({id:'fx_m14_'+champ,kind:champ==='Karthus'?'karthus_channel':'global_projectile',
  owner:t.u.id,team:t.team,champ,origin:{x:t.u.x,y:t.u.y},
  dueRound:2,dueAt:4,power,point:{x:.9,y:.5}});
 t.a.resolveDelayedEffects();
}
for(const team of ['blue','red']){
 check(team+' Soraka R heals all allies without enemy HP modification',()=>{
  const s=fixture('Soraka',team),enemyHp=s.enemy.hp,allyHp=s.ally.hp;
  assert.equal(s.a.queueKitSkillV42(team,s.u.id,'R',null).ok,true);
  s.a.resolveBoardSkillsV453Dev69();
  assert.ok(s.ally.hp>allyHp);assert.equal(s.enemy.hp,enemyHp);
  const mana=s.u.mana;s.a.resolveBoardSkillsV453Dev69();assert.equal(s.u.mana,mana);
 });
 check(team+' Jinx global rocket explodes on the first champion and splashes nearby',()=>{
  const s=fixture('Jinx',team),other=s.a.units.find(v=>v.id===s.other+'_TOP');
  Object.assign(other,{x:.537,y:.5,hp:1500,maxHp:1500,mr:0,armor:0});
  const far=s.a.units.find(v=>v.id===s.other+'_JG');
  Object.assign(far,{x:.8,y:.8,hp:1500,maxHp:1500,mr:0,armor:0});
  launchDelayed(s,'Jinx',180);
  assert.ok(s.enemy.hp<1500);
  assert.ok(other.hp<1500,'splash damage around first hit');
  assert.equal(far.hp,1500,'unrelated enemy outside explosion remains untouched');
 });
 check(team+' Jinx explosion damage increases with traveled distance',()=>{
  const near=fixture('Jinx',team),far=fixture('Jinx',team);
  near.enemy.x=.52;far.enemy.x=.61;
  launchDelayed(near,'Jinx');launchDelayed(far,'Jinx');
  assert.ok(1500-far.enemy.hp>1500-near.enemy.hp);
 });
 check(team+' Ezreal R penetrates champions and minions on its line',()=>{
  const s=fixture('Ezreal',team),enemy2=s.a.units.find(v=>v.id===s.other+'_TOP');
  Object.assign(enemy2,{x:.58,y:.5,hp:1500,maxHp:1500,mr:0,armor:0});
  const minion={id:'test_m14_minion',team:s.other,kind:'melee',lane:'mid',
   x:.56,y:.5,hp:900,maxHp:900,armor:0,mr:0,spawnAt:0};
  s.a.minions.push(minion);
  launchDelayed(s,'Ezreal',180);
  assert.ok(s.enemy.hp<1500);
  assert.ok(enemy2.hp<1500);
  assert.ok(minion.hp<900,'minion pierced');
  assert.ok(900-minion.hp<1500-s.enemy.hp,'minion hit is attenuated');
 });
 check(team+' Ashe R stun duration scales with travel distance',()=>{
  const near=fixture('Ashe',team),far=fixture('Ashe',team);
  near.enemy.x=.523;far.enemy.x=.65;
  for(const t of [near,far]){
   assert.equal(t.a.queueDirectionalSkill(team,t.u.id,'R',{x:.9,y:.5}).ok,true);
   t.a.resolveBoardSkillsV453Dev69();
  }
  const effect=t=>t.a.effectResolverV41().list(t.enemy).find(x=>x.type==='stun');
  assert.ok(effect(near));assert.ok(effect(far));
  assert.ok(effect(far).until>effect(near).until);
 });
 check(team+' Karthus channel stops on CC and never damages global enemies',()=>{
  const s=fixture('Karthus',team);
  s.a.delayedEffects.push({id:'fx_karthus',kind:'karthus_channel',
   owner:s.u.id,team:s.team,champ:'Karthus',
   origin:{x:s.u.x,y:s.u.y},dueRound:2,dueAt:4,power:250});
  s.a.round=1;s.a.gameTime=1;
  s.a.applyEffectV41(s.u,'stun',{source:s.enemy,duration:5});
  s.a.resolveDelayedEffects();
  assert.equal(s.a.delayedEffects.length,0);
  assert.equal(s.enemy.hp,1500);
 });
 check(team+' Karthus un-interrupted Requiem damages alive enemies globally',()=>{
  const s=fixture('Karthus',team);
  launchDelayed(s,'Karthus',200);
  assert.ok(s.enemy.hp<1500);
  const restored=Arena.fromSnapshotV40(map,mask,s.a.snapshotV40());
  assert.equal(checksumV40(s.a.snapshotV40()),checksumV40(restored.snapshotV40()));
 });
}
console.log('DEV69 GLOBAL M14 '+count+'/'+count+' PASS');
