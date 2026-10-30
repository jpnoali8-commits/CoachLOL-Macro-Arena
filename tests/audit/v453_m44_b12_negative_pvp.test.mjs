/** M44 B12 adversarial PvP gates: shield, owner, fog, wall and changed orders. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let passed=0,snapshots=0;const failures=[];
function scenario(team,champ,label,fn){
 const other=team==='blue'?'red':'blue';
 try{
  const a=new Arena(map,mask,{seed:441215,mode:'pvp',
   draft:{[team]:{MID:champ},[other]:{MID:'Annie',TOP:'Malphite'}}});
  for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:8000,maxHp:8000,
   autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
  for(const m of a.minions)Object.assign(m,{x:.08,y:.08});
  const u=a.units.find(v=>v.id===team+'_MID'),
   e=a.units.find(v=>v.id===other+'_MID'),
   second=a.units.find(v=>v.id===other+'_TOP');
  Object.assign(u,{x:.5,y:.5,hp:5000,maxHp:5000,level:16,mana:10000,maxMana:10000,
   skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
  Object.assign(e,{x:.52,y:.5,hp:12000,maxHp:12000,mr:0,armor:0});
  Object.assign(second,{x:.08,y:.08,hp:12000,maxHp:12000,mr:0,armor:0});
  a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;
  a.obstacleLine=()=>false;
  function cast(slot,opts={}){
   const q=a.queueBoardSkillV453Dev69(team,u.id,slot,{
    targetId:opts.targetId??null,point:opts.point??null});
   assert.equal(q.ok,true,'queue '+JSON.stringify(q));
   let rec;const original=a.executeBoardSkillV453Dev69.bind(a);
   a.executeBoardSkillV453Dev69=(actor,intent)=>(rec=original(actor,intent));
   try{a.resolveBoardSkillsV453Dev69()}
   finally{a.executeBoardSkillV453Dev69=original;}
   assert.equal(rec?.ok,true,'execute '+JSON.stringify(rec));return rec;
  }
  function tick(){a.gameTime++;a.round++;a.actionLocksV40={};
   a.advanceBoardPassivesV453Dev69();}
  fn({a,u,e,second,cast,tick});
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;snapshots++;
 }catch(error){failures.push({team,champ,label,error:String(error?.stack||error)});}
}
for(const team of ['blue','red']){
 scenario(team,'Evelynn','R evasion prevents simultaneous hit',({a,u,e,cast})=>{
  cast('R',{point:{x:.54,y:.5}});
  const hp=u.hp;assert.equal(a.damage(u,500,e,'magic','spell'),0);
  assert.equal(u.hp,hp);
 });
 scenario(team,'Evelynn','E wrong-owner charm mark ineffective',({a,u,e,cast})=>{
  e.m16EvelynnMark={ownerId:'wrong_owner',maturesAt:-2,until:5};
  assert.equal(cast('E',{targetId:e.id}).charmed,false);
 });
 scenario(team,'Rengar','E empowered shield absorbs root',({a,u,e,cast,tick})=>{
  u.m44B12Ferocity=4;
  a.applyEffectV41(e,'spell_shield',{source:e,duration:4,key:'b12rengar'});
  cast('E',{point:{x:.56,y:.5}});tick();
  assert.equal(a.effectResolverV41().has(e,'root'),false);
 });
 scenario(team,'Khazix','Q with nearby ally is not isolated',({e,second,cast})=>{
  second.x=.523;second.y=.5;
  assert.equal(cast('Q',{targetId:e.id}).isolated,false);
 });
 scenario(team,'MonkeyKing','R shield prevents first knockup',({a,e,cast,tick})=>{
  a.applyEffectV41(e,'spell_shield',{source:e,duration:4,key:'b12cyclone'});
  cast('R');tick();assert.equal(a.effectResolverV41().has(e,'knockup'),false);
 });
 scenario(team,'Akshan','Q collision wall before travel stops damage',({a,e,cast,tick})=>{
  const hp=e.hp;cast('Q',{point:{x:.565,y:.5}});
  a.obstacleLine=()=>true;tick();tick();assert.equal(e.hp,hp);
 });
 scenario(team,'Talon','Q terrain changed between queue/commit costs zero',({a,u,e})=>{
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'Q',{targetId:e.id}).ok,true);
  const mana=u.mana;a.obstacleLine=()=>true;
  const result=a.executeBoardSkillV453Dev69(u,u.pendingBoardV453Dev69);
  assert.equal(result.ok,false);assert.equal(u.mana,mana);
 });
 scenario(team,'Viego','Q blocked by spell shield cannot plant mark',({a,u,e,cast})=>{
  a.applyEffectV41(e,'spell_shield',{source:e,duration:4,key:'b12viego'});
  cast('Q',{point:{x:.56,y:.5}});
  assert.equal(e.m44B12ViegoMark?.[u.id],undefined);
 });
 scenario(team,'Kaisa','R destination wall appears after queue no debit',({a,u,e})=>{
  e.m44B12KaisaPlasma={[u.id]:a.gameTime+5};
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'R',{targetId:e.id}).ok,true);
  const mana=u.mana;a.obstacleLine=()=>true;
  const result=a.executeBoardSkillV453Dev69(u,u.pendingBoardV453Dev69);
  assert.equal(result.ok,false);assert.equal(u.mana,mana);
 });
 scenario(team,'Khazix','E wall appears after queue cannot leap',({a,u,e})=>{
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'E',
   {point:{x:e.x,y:e.y}}).ok,true);
  const mana=u.mana,x=u.x;a.obstacleLine=()=>true;
  const result=a.executeBoardSkillV453Dev69(u,u.pendingBoardV453Dev69);
  assert.equal(result.ok,false);assert.equal(u.mana,mana);assert.equal(u.x,x);
 });
}
for(const e of failures)console.error('M44_B12_NEGATIVE_FAIL',JSON.stringify(e));
console.log('M44_B12_NEGATIVE '+JSON.stringify({
 passed,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,20);
