/**
 * M43: real authored persistent visibility, upgraded grenade collision,
 * moving-projectile blocker receipts and channel cancellation safety.
 * Both 5-champion PvP seats, deterministic time/snapshot, no full-kit
 * certifications (all 35 B01 champions remain indivisible).
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
import {buildM35B01WorkQueue} from '../../tools/skills_m35_b01_cohort_work_queue.mjs';
const raw=name=>JSON.parse(readFileSync(new URL('../../data/'+name,import.meta.url)));
const map=raw('coachlol_map_v6.json'),mask=raw('masks_128.json');
const failures=[],labels=[];
let snapshots=0,negative=0;
function setup(champ,team){
 const foe=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:434343,mode:'pvp',
  draft:{[team]:{MID:champ},[foe]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:5000,maxHp:5000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===foe+'_MID'),
  another=a.units.find(v=>v.id===foe+'_TOP'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:4200,maxHp:4200,level:16,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.525,y:.5,hp:8000,maxHp:8000,armor:0,mr:0});
 Object.assign(another,{x:.08,y:.08,hp:8000,maxHp:8000,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;
 a.walkable=()=>true;a.obstacleLine=()=>false;
 const queue=(slot,o={})=>a.queueBoardSkillV453Dev69(team,u.id,slot,o);
 const commit=()=>{let receipt;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,q)=>(receipt=original(v,q));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original}
  return receipt;
 };
 const cast=(slot,o={})=>{
  const q=queue(slot,o);assert.equal(q.ok,true,champ+' '+slot+' queue '+JSON.stringify(q));
  const r=commit();assert.equal(r?.ok,true,champ+' '+slot+' commit '+JSON.stringify(r));
  return r;
 };
 const advance=(time=1)=>{
  a.gameTime+=time;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69();
 };
 const snap=()=>{
  const s=a.snapshotV40();
  assert.equal(checksumV40(s),checksumV40(Arena.fromSnapshotV40(map,mask,s).snapshotV40()));
  snapshots++;
 };
 return {a,u,e,another,ally,foe,team,queue,commit,cast,advance,snap};
}
function run(champ,team,title,fn){
 try{fn(setup(champ,team));labels.push(team+' '+champ+' '+title)}
 catch(err){failures.push({champ,team,title,error:String(err?.stack||err)})}
}
for(const team of ['blue','red']){
 run('Quinn',team,'W observes new entrant without fog leak',({a,u,e,another,cast,advance,snap})=>{
  e.x=.54;e.y=.5;
  cast('W',{point:{x:.55,y:.5}});
  const z=a.boardTemporalV453Dev69.find(z=>z.kind==='m43_quinn_heightened'&&z.ownerId===u.id);
  assert.ok(z);
  assert.ok(e.m20MarksV453?.['harrier_'+u.id]>a.gameTime,'initial revealed Harrier');
  assert.deepEqual(z.hitIds,[e.id]);
  const key='harrier_'+u.id;
  another.x=.551;another.y=.5;
  a.visible=(seat,v)=>v.id!==another.id;
  advance(1);
  assert.equal(another.m20MarksV453?.[key],undefined,'hidden entering champion may not be disclosed');
  assert.equal(z.hitIds.includes(another.id),false);
  negative++;
  a.visible=()=>true;
  advance(1);
  assert.ok(another.m20MarksV453?.[key]>a.gameTime,'sighted late entrant acquires own Harrier');
  assert.equal(z.hitIds.filter(x=>x===another.id).length,1);
  snap();
 });
 run('Quinn',team,'W watch expires and cannot mark after lifetime',({a,u,e,another,cast,advance,snap})=>{
  e.x=.54;cast('W',{point:{x:.55,y:.5}});
  advance(4);
  assert.equal(a.boardTemporalV453Dev69.some(z=>z.kind==='m43_quinn_heightened'),false);
  another.x=.551;another.y=.5;
  advance(1);
  assert.equal(another.m20MarksV453?.['harrier_'+u.id],undefined);
  negative++;snap();
 });
 run('Heimerdinger',team,'upgraded grenade center stun and fringe slow',({a,u,e,another,cast,advance,snap})=>{
  e.x=.53;e.y=.5;
  another.x=.54;another.y=.5083;
  cast('R');
  assert.ok(u.m23HeimerEmpowerV453?.until>a.gameTime);
  a.round++;a.actionLocksV40={};
  cast('E',{point:{x:.53,y:.5}});
  let zone=a.boardTemporalV453Dev69.find(z=>z.kind==='m24_heimer_grenades');
  assert.ok(zone,'R+E must schedule its own 5-point grenade cluster');
  a.effectResolverV41().remove(e,{ccOnly:true});
  a.effectResolverV41().remove(another,{ccOnly:true});
  const before=e.hp,fringeBefore=another.hp;
  advance(1);
  assert.ok(e.hp<before);
  assert.ok(another.hp<fringeBefore);
  assert.equal(a.effectResolverV41().has(e,'stun'),true,'center only stuns');
  assert.equal(a.effectResolverV41().has(another,'slow'),true,'satellite fringe slows');
  assert.equal(a.effectResolverV41().has(another,'stun'),false,'fringe cannot inherit center stun');
  const hp=e.hp;
  advance(1);
  assert.equal(e.hp,hp,'cluster may only hit once');
  snap();
 });
 run('Heimerdinger',team,'upgraded grenade blocked or spell-shielded cannot stun',({a,u,e,another,cast,advance,snap})=>{
  e.x=.53;another.x=.54;another.y=.5083;
  cast('R');a.round++;a.actionLocksV40={};
  cast('E',{point:{x:.53,y:.5}});
  a.effectResolverV41().remove(e,{ccOnly:true});
  a.effectResolverV41().remove(another,{ccOnly:true});
  a.obstacleLine=(p,v)=>v?.id===another.id;
  a.applyEffectV41(e,'spell_shield',{source:e,duration:3,
   key:'m43_test_shield_'+team});
  advance(1);
  assert.equal(a.effectResolverV41().has(e,'stun'),false);
  assert.equal(a.effectResolverV41().has(another,'slow'),false);
  negative++;snap();
 });
 run('Mel',team,'Q wave receipts stop at first blocked body',({a,u,e,another,cast,advance,snap})=>{
  e.x=.52;e.y=.5;another.x=.53;another.y=.5;
  cast('Q',{point:{x:.54,y:.5}});
  const z=a.boardTemporalV453Dev69.find(z=>z.kind==='m28_mel_volley');
  assert.ok(z);
  const hp=another.hp;
  a.obstacleLine=(from,v)=>v?.id===e.id;
  advance(1);
  assert.equal(z.m30ProjectileReceipts.length,3);
  const middle=z.m30ProjectileReceipts.find(s=>s.shot===1);
  assert.equal(middle.blocked,true,'center ray hit a blocked first body');
  assert.equal(middle.targetId,null);
  assert.equal(another.hp,hp,'second body cannot be hit through blocked first collision');
  negative++;
  a.obstacleLine=()=>false;e.x=.08;
  advance(1);
  assert.equal(z.m30ProjectileReceipts.length,6);
  assert.equal(z.m30ProjectileReceipts.filter(s=>s.shot===1).length,2);
  assert.ok(another.hp<hp,'following wave reaches previously protected target');
  snap();
 });
 run('Viktor',team,'R interrupts Karthus channel and removes pending Requiem',({a,u,e,foe,cast,advance,snap})=>{
  e.champ='Karthus';e.x=.53;e.y=.5;
  e.level=16;e.mana=10000;e.maxMana=10000;
  e.skillRanks={Q:5,W:5,E:5,R:3};
  e.skillCds={Q:0,W:0,E:0,R:0};
  const qr=a.queueBoardSkillV453Dev69(foe,e.id,'R');
  assert.equal(qr.ok,true,'enemy team can cast Karthus R');
  a.resolveBoardSkillsV453Dev69();
  const channel=a.boardTemporalV453Dev69.find(z=>z.kind==='m20_requiem_channel'&&z.ownerId===e.id);
  assert.ok(channel);
  const hp=u.hp;
  cast('R',{point:{x:.53,y:.5}});
  assert.ok(e.hp<8000);
  assert.equal(channel.m43InterruptedAt,a.gameTime);
  assert.equal(a.boardTemporalV453Dev69.includes(channel),false);
  assert.equal(e.boardChannelUntilV453Dev69,0);
  advance(4);
  assert.equal(u.hp,hp,'interrupted Requiem cannot resolve later');
  snap();
 });
}
const cohort=buildM35B01WorkQueue();
assert.equal(cohort.metrics.champions,35);
assert.equal(cohort.metrics.qwer,140);
assert.equal(cohort.metrics.unresolvedLegacyTags,20);
assert.equal(cohort.metrics.certifiedKits,0);
for(const x of failures)console.error('M43_AUTHORED_FAMILY_FAIL',JSON.stringify(x));
console.log('M43_B01_PERSISTENT_INTERACTIONS '+JSON.stringify({
 championIdentities:['Quinn','Heimerdinger','Mel','Viktor'],
 twoHumanSeats:2,scenarios:labels.length,expected:12,
 snapshotChecks:snapshots,negativeChecks:negative,
 legacyDebt:cohort.metrics.unresolvedLegacyTags,
 certifiedKits:cohort.metrics.certifiedKits,failures:failures.length
}));
assert.equal(failures.length,0);
assert.equal(labels.length,12);
assert.equal(snapshots,12);
