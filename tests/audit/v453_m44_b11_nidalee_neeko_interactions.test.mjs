/** M44 B11: Nidalee authored owner-specific Hunted + Neeko real clone W2. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const failures=[];let passed=0,snapshots=0;
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:441122,mode:'pvp',
  draft:{[team]:{MID:champ,TOP:'Annie'},[other]:{MID:'Annie',TOP:'Malphite'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:8000,maxHp:8000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 for(const m of a.minions)Object.assign(m,{x:.08,y:.08});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{x:.5,y:.5,level:16,hp:5000,maxHp:5000,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.53,y:.5,hp:12000,maxHp:12000,mr:0,armor:0});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 function cast(slot,opts={}){
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,
   {point:opts.point??null,targetId:opts.targetId??null});
  assert.equal(q.ok,true,'queue '+JSON.stringify(q));
  const old=a.executeBoardSkillV453Dev69.bind(a);let receipt;
  a.executeBoardSkillV453Dev69=(actor,payload)=>(receipt=old(actor,payload));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=old;}
  assert.equal(receipt?.ok,true,'cast '+JSON.stringify(receipt));
  return receipt;
 }
 function tick(){a.gameTime++;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69();}
 return {a,u,e,cast,tick};
}
function check(team,champ,label,fn){
 try{
  const f=fixture(champ,team);fn(f);
  const snap=f.a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;snapshots++;
 }catch(error){
  failures.push({team,champ,label,error:String(error?.stack||error)});
 }
}
for(const team of ['blue','red']){
 check(team,'Nidalee','human spear applies author-owned Hunted',({u,e,cast,tick})=>{
  cast('Q',{point:{x:.56,y:.5}});tick();
  assert.ok(e.m44B11NidaleeHunted?.[u.id]>1);
 });
 check(team,'Nidalee','cougar Q consumes no generic fallback',({u,e,cast,tick})=>{
  cast('Q',{point:{x:.56,y:.5}});tick();
  u.boardFormV453M14='cougar';u.skillCds.Q=0;e.x=.508;
  const rec=cast('Q',{targetId:e.id});
  assert.equal(rec.cougarQ,true);assert.equal(rec.hunted,true);
 });
 check(team,'Nidalee','Hunted expires',({a,u,e,cast,tick})=>{
  cast('Q',{point:{x:.56,y:.5}});tick();a.gameTime+=5;
  u.boardFormV453M14='cougar';u.skillCds.Q=0;e.x=.508;
  assert.equal(cast('Q',{targetId:e.id}).hunted,false);
 });
 check(team,'Nidalee','human W trap applies author-owned Hunted',({a,u,e,tick})=>{
  const trap=a.m16TrapCreate(u,'nidalee_bushwhack',{x:e.x,y:e.y});
  assert.ok(trap);tick();assert.ok(e.m44B11NidaleeHunted?.[u.id]>a.gameTime);
 });
 check(team,'Nidalee','another owner cannot empower cougar Q',({a,u,e,cast})=>{
  e.m44B11NidaleeHunted={wrong_owner:a.gameTime+5};
  u.boardFormV453M14='cougar';e.x=.508;
  assert.equal(cast('Q',{targetId:e.id}).hunted,false);
 });
 check(team,'Neeko','W creates genuine owner-scope clone',({a,cast})=>{
  const rec=cast('W',{point:{x:.53,y:.5}});
  assert.ok(a.boardSummonsV453Dev69.find(v=>v.id===rec.entityId&&
   v.kind==='neeko_clone'));
 });
 check(team,'Neeko','W2 no mana and no clone duplication',({a,u,cast})=>{
  cast('W',{point:{x:.53,y:.5}});
  const amount=a.boardSummonsV453Dev69.length,mana=u.mana;
  const r=cast('W',{point:{x:.54,y:.5}});
  assert.equal(r.recast,true);assert.equal(r.spentMana,0);
  assert.equal(u.mana,mana);
  assert.equal(a.boardSummonsV453Dev69.length,amount);
 });
 check(team,'Neeko','W2 wall change after queue cannot redirect',({a,u,cast})=>{
  const r=cast('W',{point:{x:.53,y:.5}});
  const clone=a.boardSummonsV453Dev69.find(v=>v.id===r.entityId);
  assert.equal(a.queueBoardSkillV453Dev69(u.team,u.id,'W',
   {point:{x:.54,y:.5}}).ok,true);
  const x=clone.commandPoint?.x;a.obstacleLine=()=>true;
  const result=a.executeBoardSkillV453Dev69(u,u.pendingBoardV453Dev69);
  assert.equal(result.ok,false);assert.equal(clone.commandPoint?.x,x);
 });
 check(team,'Neeko','W2 realm change after queue cannot redirect',({a,u,cast})=>{
  const r=cast('W',{point:{x:.53,y:.5}});
  const clone=a.boardSummonsV453Dev69.find(v=>v.id===r.entityId);
  assert.equal(a.queueBoardSkillV453Dev69(u.team,u.id,'W',
   {point:{x:.54,y:.5}}).ok,true);
  const x=clone.commandPoint?.x;
  a.sameCombatRealmV453Dev69=(x,y)=>y.id!==clone.id;
  const result=a.executeBoardSkillV453Dev69(u,u.pendingBoardV453Dev69);
  assert.equal(result.ok,false);assert.equal(clone.commandPoint?.x,x);
 });
 check(team,'Neeko','W2 distance changes after queue, no illegitimate move',({a,u,cast})=>{
  const r=cast('W',{point:{x:.53,y:.5}});
  const clone=a.boardSummonsV453Dev69.find(v=>v.id===r.entityId);
  assert.equal(a.queueBoardSkillV453Dev69(u.team,u.id,'W',
   {point:{x:.54,y:.5}}).ok,true);
  clone.x=.85;
  const result=a.executeBoardSkillV453Dev69(u,u.pendingBoardV453Dev69);
  assert.equal(result.ok,false);
 });
}
for(const failure of failures)console.error('M44_B11_INTERACTION_FAIL',JSON.stringify(failure));
console.log('M44_B11_HUNTED_CLONE '+JSON.stringify({
 champions:['Nidalee','Neeko'],scenarios:passed,snapshots,
 failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,20);
