/**
 * M37: All five remaining individually unhooked B01 QWER slots.
 * Real champion-specific behaviors, both PvP seats, receipts and replay.
 * This is never a complete P+QWER kit certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,BOARD_M20_B01_V453} from '../../engine.mjs';
import {buildM35B01WorkQueue} from '../../tools/skills_m35_b01_cohort_work_queue.mjs';

const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const cases=[],failures=[];let snapshots=0,checks=0;
const now=()=>buildM35B01WorkQueue();
const queue=now();
assert.equal(queue.metrics.champions,35);
assert.equal(queue.metrics.qwer,140);
assert.equal(queue.metrics.slotsWithNativeHooks,140,'ALL B01 slots have at least one authored mechanic');
assert.equal(queue.metrics.certifiedKits,0,'mechanic hooks cannot certify complete kits');
const expected=[
 ['Corki','Q','m37CorkiPhosphorus'],
 ['Alistar','Q','m37AlistarPulverize'],
 ['Alistar','W','m37AlistarHeadbutt'],
 ['Locke','W','m37LockeSoulIgnition'],
 ['Locke','R','m37LockePurgatory']
];
for(const [name,slot,flag] of expected)assert.equal(BOARD_M20_B01_V453[name][slot][flag],true);
function fixture(champ,team){
 const enemy=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:373737,mode:'pvp',draft:{[team]:{MID:champ},[enemy]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:4000,maxHp:4000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===enemy+'_MID'),
  other=a.units.find(v=>v.id===enemy+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:3500,maxHp:3500,level:16,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(other,{x:.08,y:.08,hp:7000,maxHp:7000});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,props={})=>{
  const ret=a.queueBoardSkillV453Dev69(team,u.id,slot,props);
  assert.equal(ret.ok,true,champ+' '+slot+' queue '+JSON.stringify(ret));
  let receipt;const orig=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,q)=>(receipt=orig(v,q));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=orig}
  assert.equal(receipt?.ok,true,champ+' '+slot+' commit '+JSON.stringify(receipt));
  checks++;
  return receipt;
 };
 const advance=(seconds=1)=>{a.gameTime+=seconds;a.round++;a.actionLocksV40={};};
 const snap=()=>{
  const current=a.snapshotV40();
  assert.equal(checksumV40(current),
   checksumV40(Arena.fromSnapshotV40(map,mask,current).snapshotV40()));
  snapshots++;
 };
 return {a,u,e,other,team,enemy,cast,advance,snap};
}
function run(label,champ,team,fn){
 try{fn(fixture(champ,team));cases.push(label+' '+team)}
 catch(error){failures.push({label,champ,team,error:String(error?.stack||error)})}
}
for(const team of ['blue','red']){
 run('Corki Phosphorus Bomb reveal and fog','Corki',team,
 ({a,u,e,other,cast,snap})=>{
  const hp=e.hp;
  cast('Q',{point:{x:.518,y:.5}});
  assert.ok(e.hp<hp,'Corki Q deals own magic area damage');
  assert.ok(e.revealedUntil?.[team]>a.gameTime,'only contacted champion gets exposed');
  assert.equal(other.revealedUntil?.[team],undefined,'unhit champion is not falsely exposed');
  assert.ok(a.boardVisionV453Dev69.some(v=>v.team===team&&v.x===.518&&v.until>a.gameTime));
  snap();
 });
 run('Alistar W contact and Q exact victim follow-up','Alistar',team,
 ({a,u,e,other,cast,advance,snap})=>{
  cast('W',{targetId:e.id});
  const state=u.m37AlistarHeadbutt;
  assert.equal(state?.targetId,e.id);
  const afterW=e.hp;
  assert.ok(e.x>.53,'headbutt still knocks victim back');
  advance(1);
  assert.ok(a.mapDistance(u,e)>365,'headbutt target is outside ordinary Q radius');
  cast('Q');
  assert.ok(e.hp<afterW,'pulverize catches its own W target in combo window');
  assert.equal(u.m37AlistarHeadbutt,null,'combo consumed once');
  assert.equal(other.hp,7000,'far-away champion not included in combo');
  assert.ok(a.effectResolverV41().has(e,'knockup'),'Q knocks combo victim up');
  snap();
 });
 run('Alistar expired combo cannot gain global Q range','Alistar',team,
 ({a,u,e,cast,advance,snap})=>{
  cast('W',{targetId:e.id});
  const hp=e.hp;advance(3);
  cast('Q');
  assert.equal(e.hp,hp,'expired combo cannot re-hit knockback victim outside natural Q');
  assert.ok(u.m37AlistarHeadbutt?.until<a.gameTime,
   'expired combo state has no effect on execution');
  snap();
 });
 run('Locke Soul Ignition own HP, attack speed and actual damage recovery','Locke',team,
 ({a,u,e,cast,advance,snap})=>{
  const hp=u.hp,base=a.basicAttackIntervalV452c(u),mana=u.mana;
  cast('W');
  assert.ok(u.hp<hp&&u.hp>0,'W spends HP and cannot self-kill');
  assert.ok(u.mana<mana,'normal committed W mana cost maintained');
  assert.ok(a.basicAttackIntervalV452c(u)<base,'W increases actual attack speed');
  const old=u.hp;
  const real=a.damage(u,200,e,'physical','basic');
  assert.ok(real>0&&u.hp<old,'real incoming damage counts after mitigation');
  assert.equal(u.m37LockeIgnition?.damageTaken,real);
  advance(3.1);a.advanceBoardTemporalV453Dev69();
  assert.equal(u.m37LockeIgnition,null,'state expires after one recovery');
  const healed=u.hp;
  assert.ok(healed>old-real,'end-of-W heals some actual damage');
  assert.equal(a.basicAttackIntervalV452c(u),base,'attack-speed bonus naturally expires');
  a.advanceBoardTemporalV453Dev69();
  assert.equal(u.hp,healed,'replay tick cannot heal twice');
  snap();
 });
 run('Locke Purgatory champion execute and nonfarming unique seal power','Locke',team,
 ({a,u,e,other,cast,advance,snap})=>{
  e.hp=1350;e.maxHp=7000;other.hp=7000;
  cast('R',{point:{x:.55,y:.5}});
  assert.equal(e.hp,0,'authoritative execution completes below health threshold');
  assert.equal(u.m37LockeSealPower,1);
  assert.equal(u.m37LockeSeals?.[e.id],a.gameTime,'one champion contributes one seal');
  advance(1);u.skillCds.R=0;e.hp=1350;
  cast('R',{point:{x:.55,y:.5}});
  assert.equal(e.hp,0);
  assert.equal(u.m37LockeSealPower,1,'same champion cannot farm repeat seals');
  advance(1);u.skillCds.R=0;other.x=.52;other.y=.5;other.hp=1350;
  e.x=.08;e.y=.08;
  cast('R',{point:{x:.55,y:.5}});
  assert.equal(other.hp,0,'a different champion can be executed');
  assert.equal(u.m37LockeSealPower,2,'two unique champions grant two seals');
  snap();
 });
}
for(const x of failures)console.error('M37_AUTHORED_FAIL',JSON.stringify(x));
console.log('M37_FIVE_B01_SLOTS '+JSON.stringify({
 champions:35,qwer:140,authoredHooks:now().metrics.slotsWithNativeHooks,
 slotIdentities:5,scenarioCount:cases.length,casts:checks,snapshots,failures:failures.length,
 legacyDebtTags:now().metrics.unresolvedLegacyTags,certifiedKits:0}));
assert.equal(failures.length,0);
assert.equal(cases.length,10);
assert.equal(snapshots,10);
