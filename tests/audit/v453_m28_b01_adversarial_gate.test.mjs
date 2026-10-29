/** M28/B01 first gate: real authoritative denial tests across all fixed 35 kits.
 * Negative scenarios are infrastructure requirements, NOT champion certification.
 * Never certify P+QWER on this evidence alone.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,BOARD_M20_B01_V453,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const champs=Object.keys(BOARD_M20_B01_V453).sort();
assert.equal(champs.length,35);
const seats=['blue','red'],slots=['Q','W','E','R'];
const failures=[],counts={outOfBounds:0,hiddenEnemy:0,blockedDash:0,nonRoster:0,untouchedResources:0,snapshots:0};
function fixture(champ,team){
 const opposite=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:20262801,mode:'pvp',
  draft:{[team]:{MID:champ},[opposite]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:3000,maxHp:3000,
  autoFollow:false,autoFarm:false,autoJungle:false,autoAttack:false,deadUntil:0});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===opposite+'_MID');
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:3000,maxHp:3000,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:7000,maxHp:7000});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;
 a.obstacleLine=()=>false;
 return {a,u,e};
}
function frozen(a,u,callback,reason){
 const mana=u.mana,cd={...u.skillCds},
  before=checksumV40(a.snapshotV40());
 const ret=callback();
 assert.equal(ret?.ok,false,reason+': operation should be rejected');
 assert.equal(u.pendingBoardV453Dev69??null,null,reason+': no pending orders');
 assert.equal(u.mana,mana,reason+': no mana spent');
 assert.deepEqual(u.skillCds,cd,reason+': no cooldowns spent');
 assert.equal(checksumV40(a.snapshotV40()),before,
  reason+': invalid order changed authoritative match');
 counts.untouchedResources++;
 return ret;
}
function check(champ,team,label,fn){
 try{fn()}catch(err){failures.push({champ,team,label,error:String(err?.stack||err)})}
}
for(const champ of champs)for(const team of seats){
 const kit=BOARD_M20_B01_V453[champ];
 check(champ,team,'unknown champion never alters 10-entity roster',()=>{
  const {a}=fixture(champ,team);
  assert.equal(a.units.length,10);
  assert.equal(new Set(a.units.map(v=>v.id)).size,10);
  counts.nonRoster++;
 });
 const aimed=slots.find(slot=>
  ['line_enemy','cone_enemy','circle_enemy','move_point','deploy_point','vision_point']
   .includes(kit[slot]?.shape)&&!kit[slot]?.originSelf);
 if(aimed)check(champ,team,'out-of-board '+aimed,()=>{
  const {a,u}=fixture(champ,team);
  frozen(a,u,()=>a.queueBoardSkillV453Dev69(team,u.id,aimed,
   {point:{x:-.1,y:.51}}),'invalid coordinates '+champ+' '+aimed);
  counts.outOfBounds++;
 });
 // Target-ID fog gate: only accept an adversarial scenario if the same rule
 // was queueable against that champion when visible (no false coverage claim).
 const target=slots.find(slot=>{
  const s=kit[slot];return ['target_enemy','target_any'].includes(s?.shape)&&
   !s.m21FrostRequired&&!s.m20MarkRequired&&!s.m24Devour&&
   !s.m23ExecuteThreshold&&(s.range??0)<=3000;
 });
 if(target)check(champ,team,'enemy direct target hidden '+target,()=>{
  const visible=fixture(champ,team);
  const allowed=visible.a.queueBoardSkillV453Dev69(team,visible.u.id,target,
   {targetId:visible.e.id});
  if(!allowed.ok)return;
  const {a,u,e}=fixture(champ,team);
  a.visible=(t,v)=>v.id!==e.id;
  const ret=frozen(a,u,()=>a.queueBoardSkillV453Dev69(team,u.id,target,
   {targetId:e.id}),'fog denies direct target '+champ+' '+target);
  assert.equal(ret.reason,'alvo_oculto_ou_reino');
  counts.hiddenEnemy++;
 });
 const dash=slots.find(slot=>kit[slot]?.shape==='move_point');
 if(dash)check(champ,team,'solid terrain denies '+dash,()=>{
  const {a,u}=fixture(champ,team),destination={x:.515,y:.5};
  const queued=a.queueBoardSkillV453Dev69(team,u.id,dash,{point:destination});
  if(!queued.ok)return;
  const mana=u.mana,cd={...u.skillCds};
  a.obstacleLine=()=>true;
  let actual=null;const execute=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,q)=>(actual=execute(actor,q));
  a.resolveBoardSkillsV453Dev69();a.executeBoardSkillV453Dev69=execute;
  assert.equal(actual?.ok,false,'blocked movement must reject at executor');
  assert.equal(actual.reason,'destino_bloqueado');
  assert.equal(u.mana,mana);
  assert.deepEqual(u.skillCds,cd);
  assert.equal(u.x,.5);assert.equal(u.y,.5);
  counts.blockedDash++;
 });
 check(champ,team,'snapshot identity',()=>{
  const {a}=fixture(champ,team);
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  counts.snapshots++;
 });
}
for(const fail of failures)console.error('M28_B01_ADVERSARIAL_FAIL',JSON.stringify(fail));
console.log('M28_B01_ADVERSARIAL_QA '+JSON.stringify({
 champions:champs.length,teamSeats:2,failures:failures.length,
 cases:counts,certifiedChampions:0,
 caution:'Negative shared contracts are not champion-specific P/QWER certification'
}));
assert.equal(failures.length,0,'M28 B01 adversarial contracts failed');
assert.equal(counts.nonRoster,70);
assert.equal(counts.outOfBounds+counts.hiddenEnemy+counts.blockedDash>70,true);
assert.equal(counts.snapshots,70);
