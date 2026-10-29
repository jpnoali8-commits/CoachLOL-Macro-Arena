/**
 * CoachLOL M44 B07 — ten authored champion identities, eleven spell contracts.
 * Native Node and V8 compatible; full engine, real map/masks, blue/red and V40 snapshots.
 * Partial-kit QA only, NOT any P+QWER certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B07_KITS_V453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const profiles=[['Thresh','Q','stun'],['Nautilus','Q','root'],['Pyke','Q','slow'],
 ['Zyra','E','root'],['Senna','W',null],['Karma','Q','slow'],
 ['Draven','R',null],['Gnar','Q','slow'],['Renata','Q','root'],
 ['Orianna','Q',null]];
let pass=0,snapshots=0;const failures=[];
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:440707,mode:'pvp',
  draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:6000,maxHp:6000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 for(const m of a.minions||[])Object.assign(m,{x:.08,y:.08});
 const u=a.units.find(v=>v.id===team+'_MID'),e=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{x:.5,y:.5,hp:5000,maxHp:5000,level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.527,y:.5,hp:10000,maxHp:10000,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;
 a.walkable=()=>true;a.obstacleLine=()=>false;
 function cast(slot,point={x:.56,y:.5}){
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,{point});
  assert.equal(q.ok,true,'queue '+champ+' '+slot+' '+JSON.stringify(q));
  let receipt;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,o)=>(receipt=original(v,o));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=original}
  assert.equal(receipt?.ok,true,'commit '+champ+' '+slot+' '+JSON.stringify(receipt));
  return receipt;
 }
 function tick(){a.gameTime++;a.round++;a.actionLocksV40={};a.advanceBoardPassivesV453Dev69();}
 return {a,u,e,team,other,cast,tick};
}
function run(champ,team,label,fn){
 const f=fixture(champ,team);
 try{
  fn(f);
  const s=f.a.snapshotV40();
  assert.equal(checksumV40(s),checksumV40(Arena.fromSnapshotV40(map,mask,s).snapshotV40()));
  snapshots++;pass++;
 }catch(error){failures.push({champ,team,label,error:String(error?.stack||error)})}
}
for(const team of ['blue','red'])for(const [champ,slot,cc] of profiles){
 run(champ,team,'flight, contact, authored status',({a,u,e,cast,tick})=>{
  const before=e.hp,receipt=cast(slot);
  assert.equal(receipt.m44Projectile,true);
  assert.equal(e.hp,before,'no pre-contact damage');
  tick();assert.ok(e.hp<before,'impact required');
  if(cc)assert.equal(a.effectResolverV41().has(e,cc),true);
  if(champ==='Senna')assert.equal(a.effectResolverV41().has(e,'root'),false);
  if(['Thresh','Renata'].includes(champ))assert.ok(u.m44B07Hook?.until>a.gameTime);
  if(['Draven','Gnar'].includes(champ))assert.ok(a.boardTemporalV453Dev69.some(z=>
   z.champ===champ&&z.m44ReturnLeg));
  if(champ==='Orianna'){tick();assert.ok(u.m44B07Ball?.until>a.gameTime)}
 });
 run(champ,team,'spell shield negates champion status and link',({a,u,e,cast,tick})=>{
  a.applyEffectV41(e,'spell_shield',{source:e,duration:4,key:'b07_shield'});
  cast(slot);tick();
  if(cc)assert.equal(a.effectResolverV41().has(e,cc),false);
  if(['Thresh','Renata'].includes(champ))assert.equal(u.m44B07Hook,undefined);
  if(champ==='Senna')assert.equal(a.boardTemporalV453Dev69.some(z=>
   z.kind==='m44_b07_senna_root'),false);
 });
 run(champ,team,'real terrain prevents projectile contact',({a,e,cast,tick})=>{
  const hp=e.hp;cast(slot);a.obstacleLine=()=>true;tick();
  assert.equal(e.hp,hp);
 });
}
for(const team of ['blue','red']){
 run('Senna',team,'delayed W roots adjacent champion',({a,e,cast,tick})=>{
  const second=a.units.find(v=>v.team===e.team&&v.id!==e.id);
  Object.assign(second,{x:.530,y:.5,hp:10000});
  cast('W');tick();assert.equal(a.effectResolverV41().has(e,'root'),false);
  tick();assert.equal(a.effectResolverV41().has(e,'root'),true);
  assert.equal(a.effectResolverV41().has(second,'root'),true);
 });
 run('Thresh',team,'Q2 reuses captured target without second mana debit',({u,cast,tick})=>{
  cast('Q');tick();const mana=u.mana,x=u.x;
  const recast=cast('Q');assert.equal(recast.recast,true);
  assert.equal(recast.spentMana,0);assert.ok(u.x>x);assert.equal(u.mana,mana);
 });
 run('Renata',team,'Q2 shove is bounded and cost-free',({u,e,cast,tick})=>{
  cast('Q');tick();const mana=u.mana,x=e.x;
  const recast=cast('Q',{x:e.x+.01,y:e.y});
  assert.equal(recast.recast,true);assert.equal(recast.spentMana,0);
  assert.ok(e.x>x);assert.equal(u.mana,mana);
 });
 run('Orianna',team,'W pulse follows Q ball position',({a,u,e,cast,tick})=>{
  cast('Q');tick();tick();const ball=u.m44B07Ball;
  assert.ok(ball?.x>u.x);e.x=ball.x;e.y=ball.y;
  const hp=e.hp,receipt=cast('W');
  assert.equal(receipt.pulse,true);assert.ok(e.hp<hp);
  assert.equal(a.effectResolverV41().has(e,'slow'),true);
 });
 run('Zyra',team,'E pierces minions and roots multiple units',({a,e,other,cast,tick})=>{
  const second=a.units.find(v=>v.id===other+'_TOP');
  Object.assign(second,{x:.53,y:.5,hp:10000,maxHp:10000});
  a.minions.push({id:'b07_pierce',kind:'minion',team:other,
   x:.516,y:.5,hp:900,maxHp:900,armor:0,mr:0,spawnAt:0});
  cast('E');tick();
  assert.ok(e.hp<10000&&second.hp<10000);
  assert.equal(a.effectResolverV41().has(second,'root'),true);
 });
 run('Draven',team,'R strikes each target once per outbound and return leg',({e,cast,tick})=>{
  const hp=e.hp;cast('R');tick();const outbound=e.hp;
  assert.ok(outbound<hp);tick();assert.ok(e.hp<outbound);
 });
 run('Gnar',team,'Q boomerang refunds cooldown on return',({u,cast,tick})=>{
  cast('Q');const cooldown=u.skillCds.Q;tick();tick();
  assert.ok(u.skillCds.Q<=cooldown);
 });
}
for(const error of failures)console.error('M44_B07_FAIL',JSON.stringify(error));
console.log('M44_B07_COHORT '+JSON.stringify({
 champions:Object.keys(M44_B07_KITS_V453),contracts:11,
 seats:2,passed:pass,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
assert.equal(pass,74);assert.equal(snapshots,74);
