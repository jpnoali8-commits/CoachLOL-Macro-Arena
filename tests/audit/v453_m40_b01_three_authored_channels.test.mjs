/**
 * M40 shared lifecycle, three non-generic identities:
 * Sett W: delayed cone, immediate real Grit shield and interrupt cancellation.
 * Galio W: server-authored charge, physical/magic defence, release taunt.
 * Yi W: 0.5s healing pulses, time-based mana and interruptible damage reduction.
 * PvP both seats, V40 snapshots, no kit certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
import {buildM35B01WorkQueue} from '../../tools/skills_m35_b01_cohort_work_queue.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
let scenarios=0,snapshots=0,negative=0,impacts=0;const failures=[];
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:404040,mode:'pvp',
  draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:5000,maxHp:5000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),e=a.units.find(v=>v.id===other+'_MID'),
  far=a.units.find(v=>v.id===other+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:4000,maxHp:5000,level:16,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.525,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(far,{x:.524,y:.509,hp:7000,maxHp:7000,armor:130,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const queue=(slot,options={})=>a.queueBoardSkillV453Dev69(team,u.id,slot,options);
 const resolve=()=>{
  let receipt;const execute=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(unit,q)=>(receipt=execute(unit,q));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=execute}
  return receipt;
 };
 const cast=(slot,options={})=>{
  const q=queue(slot,options);assert.equal(q.ok,true,champ+slot+' queue '+JSON.stringify(q));
  const receipt=resolve();assert.equal(receipt?.ok,true,
   champ+slot+' execute '+JSON.stringify(receipt));return receipt;
 };
 const advance=(n=1)=>{
  a.gameTime+=n;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69();
 };
 const snapshot=()=>{
  const s=a.snapshotV40();
  assert.equal(checksumV40(s),checksumV40(Arena.fromSnapshotV40(map,mask,s).snapshotV40()));
  snapshots++;
 };
 return {a,u,e,far,team,other,cast,queue,resolve,advance,snapshot};
}
function check(champ,team,label,fn){
 try{fn(fixture(champ,team));scenarios++}
 catch(error){failures.push({champ,team,label,error:String(error?.stack||error)})}
}
for(const team of ['blue','red']){
 check('Sett',team,'shield on commit, center delayed true, outer physical',({a,u,e,far,cast,advance,snapshot})=>{
  a.damage(u,300,e,'physical','basic');
  const grit=u.m23GritV453.value;
  const mana=u.mana,centerHp=e.hp,outerHp=far.hp;
  const receipt=cast('W',{point:{x:.54,y:.5}});
  assert.equal(receipt.scheduled,true);
  assert.equal(e.hp,centerHp,'Haymaker cannot damage before 0.75s');
  assert.equal(far.hp,outerHp);
  assert.equal(u.m23GritV453.value,0);
  assert.ok(a.effectResolverV41().list(u).some(v=>v.type==='shield'&&v.power>=grit));
  assert.ok(u.mana<=mana);assert.ok(u.m40AuthoredChannelV453);
  a.gameTime+=.5;a.advanceBoardTemporalV453Dev69();
  assert.equal(e.hp,centerHp,'cannot fire during windup');
  advance(.5);assert.ok(e.hp<centerHp);
  assert.ok(far.hp<outerHp);
  assert.ok(centerHp-e.hp>outerHp-far.hp,'true center vs resisted physical edge');
  const hp=e.hp;a.advanceBoardTemporalV453Dev69();
  assert.equal(e.hp,hp,'no repeated delayed W damage');
  impacts++;snapshot();
 });
 check('Sett',team,'stun during windup cancels outgoing hit, no refund',({a,u,e,cast,advance,snapshot})=>{
  a.damage(u,200,e,'physical','basic');
  const before=e.hp;
  cast('W',{point:{x:.54,y:.5}});
  const mana=u.mana,cd=u.skillCds.W;
  a.applyEffectV41(u,'stun',{source:e,duration:2,key:'m40_sett_interrupt'});
  advance(1);
  assert.equal(e.hp,before,'interrupted cast cannot hit');
  assert.equal(u.m40AuthoredChannelV453,null);
  assert.equal(u.mana,mana);assert.equal(u.skillCds.W,cd);
  assert.equal(a.boardTemporalV453Dev69.some(z=>z.kind==='m40_sett_haymaker'),false);
  negative++;snapshot();
 });
 check('Galio',team,'authoritative charge grants distinct physical/magic defense',({a,u,e,team:seat,queue,resolve,advance,snapshot})=>{
  const baseline=a.damage(u,200,e,'physical','basic');
  u.hp=4000;
  assert.equal(a.queueBoardChargeStartV453Dev69(seat,u.id,'W').ok,true);
  assert.equal(resolve().chargeStarted,true);
  assert.equal(u.m40AuthoredChannelV453?.kind,'galio_durand');
  const defended=a.damage(u,200,e,'physical','basic');
  assert.ok(defended<baseline,'physical protection while charging');
  const magic=a.damage(u,200,e,'magic','spell');
  assert.ok(magic<defended,'magic mitigation stronger than physical');
  advance(2);
  const queued=a.queueBoardChargeReleaseV453Dev69(seat,u.id,'W');
  assert.equal(queued.ok,true,JSON.stringify(queued));
  const committed=resolve();
  assert.equal(committed.ok,true);assert.equal(u.m34ChargeStateV453,null);
  assert.equal(a.effectResolverV41().has(e,'taunt'),true);
  assert.ok(u.m40GalioWDefenseUntil>a.gameTime);
  snapshot();
 });
 check('Galio',team,'charge displacement cancels release without cost',({a,u,team:seat,resolve,advance,snapshot})=>{
  assert.equal(a.queueBoardChargeStartV453Dev69(seat,u.id,'W').ok,true);
  resolve();u.x=.525;advance(.5);
  assert.equal(u.m40AuthoredChannelV453,null);
  assert.equal(u.m34ChargeStateV453,null);
  const mana=u.mana;
  const denied=a.queueBoardChargeReleaseV453Dev69(seat,u.id,'W');
  assert.equal(denied.ok,false);
  assert.equal(u.mana,mana);negative++;snapshot();
 });
 check('MasterYi',team,'real healing tick, persistent rank defence and idempotency',({a,u,e,cast,advance,snapshot})=>{
  u.hp=1900;
  const hp=u.hp;
  cast('W');
  assert.equal(u.hp,hp,'no instant phantom full-channel heal');
  assert.equal(u.m40AuthoredChannelV453?.kind,'master_yi_meditate');
  assert.ok(u.boardChannelUntilV453Dev69>a.gameTime);
  const mana=u.mana;
  advance(.5);
  assert.ok(u.hp>hp,'first real healing pulse');
  assert.ok(u.mana<mana,'channel pays ongoing mana');
  const healed=u.hp,spent=u.mana;
  a.advanceBoardPassivesV453Dev69();
  assert.equal(u.hp,healed,'one heal per .5 simulated seconds');
  assert.equal(u.mana,spent);
  const baseline=fixture('MasterYi',team);
  baseline.u.hp=4000;
  const raw=baseline.a.damage(baseline.u,900,baseline.e,'physical','basic');
  const guarded=a.damage(u,900,e,'physical','basic');
  assert.ok(guarded<raw,'Meditate has true rank defence while channeling');
  advance(4);
  assert.equal(u.m40AuthoredChannelV453,null);
  assert.equal(u.m29YiMeditateUntil,0);
  snapshot();
 });
 check('MasterYi',team,'hard CC interrupts heal and defence',({a,u,e,cast,advance,snapshot})=>{
  u.hp=2100;cast('W');
  const hp=u.hp,mana=u.mana;
  a.applyEffectV41(u,'stun',{source:e,duration:3,key:'m40_yi_stun'});
  advance(.5);
  assert.equal(u.m40AuthoredChannelV453,null);
  assert.equal(u.m29YiMeditateUntil,0);
  assert.equal(u.hp,hp);
  assert.equal(u.mana,mana);
  negative++;snapshot();
 });
}
for(const f of failures)console.error('M40_CHANNEL_FAIL',JSON.stringify(f));
console.log('M40_B01_THREE_CHANNELS '+JSON.stringify({scenarios,expected:12,
 snapshots,negative,impacts,certifiedKits:0,failures:failures.length,
 legacyDebt:buildM35B01WorkQueue().metrics.unresolvedLegacyTags}));
assert.equal(failures.length,0);
assert.equal(scenarios,12);
assert.equal(snapshots,12);
