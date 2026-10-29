/**
 * M39: real two-seat mechanics, not kit certification.
 * Syndra W selects an actual sphere or enemy minion BEFORE paying, and
 * revalidates the selection at the server commit boundary.
 * Heimerdinger R can be cancelled as a free recast; Q upgrade still works.
 * Sett has one server-owned, deterministic Grit decay timer.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,BOARD_M20_B01_V453} from '../../engine.mjs';
import {buildM35B01WorkQueue} from '../../tools/skills_m35_b01_cohort_work_queue.mjs';
const load=name=>JSON.parse(readFileSync(new URL('../../data/'+name,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const queue=buildM35B01WorkQueue();
assert.equal(queue.metrics.champions,35);
assert.equal(queue.metrics.qwer,140);
assert.equal(queue.metrics.unresolvedLegacyTags,20);
assert.equal(queue.metrics.certifiedKits,0);
assert.equal(BOARD_M20_B01_V453.Syndra.W.m24OrbThrow,true);
assert.equal(BOARD_M20_B01_V453.Heimerdinger.R.m23EmpowerNext,true);
let scenarios=0,snapshots=0,negative=0;
const errors=[];
function fixture(champ,team){
 const enemy=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:393939,mode:'pvp',
  draft:{[team]:{MID:champ},[enemy]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:5000,maxHp:5000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID');
 const e=a.units.find(v=>v.id===enemy+'_MID');
 Object.assign(u,{champ,x:.5,y:.5,hp:5000,maxHp:5000,mana:10000,maxMana:10000,
  level:16,skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 a.minions=[];a.visible=()=>true;a.canSeePoint=()=>true;
 a.walkable=()=>true;a.obstacleLine=()=>false;
 const plan=(slot,props={})=>a.queueBoardSkillV453Dev69(team,u.id,slot,props);
 const commit=()=>{
  let result;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,q)=>(result=original(v,q));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original}
  return result;
 };
 const cast=(slot,props={})=>{
  const result=plan(slot,props);
  assert.equal(result.ok,true,champ+' '+slot+' cannot queue: '+JSON.stringify(result));
  const receipt=commit();assert.equal(receipt?.ok,true,
   champ+' '+slot+' rejected by server: '+JSON.stringify(receipt));
  return receipt;
 };
 const tick=(n=1)=>{a.gameTime+=n;a.round++;a.actionLocksV40={}};
 const snap=()=>{
  const state=a.snapshotV40(),clone=Arena.fromSnapshotV40(map,mask,state).snapshotV40();
  assert.equal(checksumV40(state),checksumV40(clone));snapshots++;
 };
 return {a,u,e,enemy,plan,commit,cast,tick,snap};
}
function test(label,champ,team,fn){
 try{fn(fixture(champ,team));scenarios++}
 catch(e){errors.push({label,champ,team,error:String(e?.stack||e)})}
}
for(const team of ['blue','red']){
 test('Syndra invalid empty pickup is free','Syndra',team,
  ({a,u,plan,snap})=>{
   const mana=u.mana,cd=u.skillCds.W;
   const r=plan('W',{point:{x:.522,y:.5}});
   assert.equal(r.ok,false);
   assert.equal(r.reason,'m39_syndra_no_valid_pickup');
   assert.equal(u.mana,mana);assert.equal(u.skillCds.W,cd);
   assert.equal(u.pendingBoardV453Dev69,undefined);
   negative++;snap();
  });
 test('Syndra minion actual throw after validation','Syndra',team,
  ({a,u,e,enemy,cast,snap})=>{
   const m={id:'m39_throw_'+team,kind:'melee',team:enemy,lane:'mid',
    x:.508,y:.5,hp:500,maxHp:500,armor:0,mr:0,path:[]};
   a.minions.push(m);const hp=e.hp,mana=u.mana;
   cast('W',{point:{x:.522,y:.5}});
   assert.equal(u.m38SyndraLastThrow?.id,m.id);
   assert.equal(m.x,.522);
   assert.equal(m.m38SyndraThrown?.ownerId,u.id);
   assert.ok(e.hp<hp);assert.ok(u.mana<mana);snap();
  });
 test('Syndra queue pickup lost in simultaneous PvP','Syndra',team,
  ({a,u,enemy,plan,commit,snap})=>{
   const m={id:'m39_lost_'+team,kind:'melee',team:enemy,
    x:.506,y:.5,hp:500,maxHp:500};
   a.minions.push(m);
   assert.equal(plan('W',{point:{x:.522,y:.5}}).ok,true);
   const mana=u.mana,cd=u.skillCds.W;
   m.hp=0;
   const r=commit();
   assert.equal(r?.ok,false,'dead minion cannot cause unbacked area spell');
   assert.equal(r?.reason,'m39_syndra_pickup_lost_before_commit');
   assert.equal(u.mana,mana);assert.equal(u.skillCds.W,cd);
   assert.equal(u.m38SyndraLastThrow,undefined);
   negative++;snap();
  });
 test('Syndra owned orb wins and fog blocks minion','Syndra',team,
  ({a,u,enemy,plan,cast,snap})=>{
   const m={id:'m39_hidden_'+team,kind:'melee',team:enemy,
    x:.509,y:.5,hp:500,maxHp:500};
   a.minions.push(m);a.canSeePoint=()=>false;
   assert.equal(plan('W',{point:{x:.522,y:.5}}).ok,false);
   a.canSeePoint=()=>true;
   u.m20SyndraOrbsV453=[{x:.506,y:.5,until:a.gameTime+8}];
   cast('W',{point:{x:.522,y:.5}});
   assert.equal(u.m38SyndraLastThrow?.kind,'sphere');
   assert.equal(m.x,.509);
   negative++;snap();
  });
 test('Heimer R recast cancels but never double charges','Heimerdinger',team,
  ({a,u,cast,tick,snap})=>{
   const first=cast('R');
   assert.equal(first.ok,true);
   assert.ok(u.m23HeimerEmpowerV453?.until>a.gameTime);
   const mana=u.mana,cd=u.skillCds.R;
   tick(1);
   const second=cast('R');
   assert.equal(second.cancelled,true);
   assert.equal(second.spentMana,0);
   assert.equal(u.m23HeimerEmpowerV453,null);
   assert.equal(u.mana,mana);
   assert.equal(u.skillCds.R,cd);
   const rejected=a.queueBoardSkillV453Dev69(team,u.id,'R');
   assert.equal(rejected.ok,false,'cannot bypass cooldown after cancel');
   negative++;snap();
  });
 test('Heimer R+Q still summons upgraded turret','Heimerdinger',team,
  ({a,u,cast,tick,snap})=>{
   cast('R');tick(1);
   cast('Q',{point:{x:.51,y:.5}});
   const turret=a.boardSummonsV453Dev69.find(v=>
    v.ownerId===u.id&&v.kind==='heimer_turret_upgraded');
   assert.ok(turret,'upgraded Q remains authored and present on board');
   assert.equal(u.m23HeimerEmpowerV453,null);
   snap();
  });
 test('Sett Grit decays once at 0.8 per simulated second','Sett',team,
  ({a,u,e,snap})=>{
   const hit=a.damage(u,200,e,'physical','basic');
   assert.ok(hit>0);
   const start=u.m23GritV453.value;
   a.gameTime+=6;a.advanceBoardPassivesV453Dev69();
   const expected=start*.8*.8;
   assert.ok(Math.abs(u.m23GritV453.value-expected)<1e-5);
   a.advanceBoardPassivesV453Dev69();
   assert.ok(Math.abs(u.m23GritV453.value-expected)<1e-5);
   snap();
  });
}
for(const problem of errors)console.error('M39_B01_FAIL',JSON.stringify(problem));
console.log('M39_B01_ATOMIC_AND_RECAST '+JSON.stringify({
 scenarios,snapshots,negative,champions:35,qwer:140,legacyDebt:20,
 certifiedKits:0,errors:errors.length}));
assert.equal(errors.length,0);
assert.equal(scenarios,14);
assert.equal(snapshots,14);
