/** M44 B14B: Hwei's selected verses, real timed owner zones, PvP mirrors. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B14B_KITS_V453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const variants=[
 ['Hwei','Q','QQ','devastatingFireball'],['Hwei','Q','QW','severingBolt'],
 ['Hwei','Q','QE','moltenFissure'],['Hwei','W','WQ','fleetingCurrent'],
 ['Hwei','W','WW','poolReflection'],['Hwei','W','WE','stirringLights'],
 ['Ekko','W',null,'parallelConvergence'],
 ['Bard','W',null,'caretakersShrine'],
 ['AurelionSol','Q',null,'breathOfLight']
];
let passed=0,snapshots=0;const failures=[];
function fixture(team,champ){
 const enemyTeam=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:144516,mode:'pvp',
  draft:{[team]:{MID:champ,TOP:'Annie'},[enemyTeam]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:8000,maxHp:8000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 for(const v of a.minions)Object.assign(v,{x:.08,y:.08});
 const u=a.units.find(v=>v.id===team+'_MID'),
  enemy=a.units.find(v=>v.id===enemyTeam+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{x:.5,y:.5,hp:6000,maxHp:9000,mana:10000,maxMana:10000,
  level:16,skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:.528,y:.5,hp:12000,maxHp:12000,mr:0,armor:0});
 Object.assign(ally,{x:.515,y:.5,hp:2000,maxHp:9000});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,options={})=>{
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,options);
  assert.equal(q.ok,true,'queue '+champ+' '+JSON.stringify(q));
  let receipt;const fn=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,p)=>(receipt=fn(v,p));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=fn;}
  assert.equal(receipt?.ok,true,'receipt '+champ+' '+JSON.stringify(receipt));
  return receipt;
 };
 const tick=()=>{a.gameTime++;a.round++;a.actionLocksV40={};
  a.advanceBoardTemporalV453Dev69()};
 const snapshot=()=>{
  const s=a.snapshotV40();
  assert.equal(checksumV40(s),checksumV40(Arena.fromSnapshotV40(map,mask,s).snapshotV40()));
  snapshots++;
 };
 return {a,u,enemy,ally,team,cast,tick,snapshot};
}
function run(team,champ,label,fn){
 try{const f=fixture(team,champ);fn(f);f.snapshot();passed++}
 catch(e){failures.push({team,champ,label,error:String(e?.stack||e)})}
}
for(const team of ['blue','red']){
 for(const [champ,slot,variant,flag] of variants)run(team,champ,flag,({u,enemy,ally,cast,tick})=>{
  const opts=champ==='Bard'?{targetId:ally.id}:
   slot==='Q'||champ==='Ekko'?{point:{x:.52,y:.5}}:{};
  if(variant)opts.m44B14Variant=variant;
  const receipt=cast(slot,opts);
  assert.equal(receipt[flag],true,'owned '+flag);
  if(variant)assert.equal(receipt.verse,variant);
  if(champ==='Ekko')assert.ok(receipt.zoneId>0);
  if(champ==='Bard')assert.ok(receipt.zoneId>0);
  if(champ==='Hwei'&&variant==='WW')
   assert.equal(u.boardNextBasicV453Dev69?.sourceSlot==='W',false);
  tick();tick();
 });
 run(team,'Hwei','invalid Q verse cannot commit',({a,u,team})=>{
  const mana=u.mana;
  const q=a.queueBoardSkillV453Dev69(team,u.id,'Q',
   {point:{x:.52,y:.5},m44B14Variant:'QZ'});
  assert.equal(q.ok,false);assert.equal(q.reason,'m44_b14_hwei_q_variant');
  assert.equal(u.mana,mana);
 });
 run(team,'Hwei','invalid W verse cannot commit',({a,u,team})=>{
  const q=a.queueBoardSkillV453Dev69(team,u.id,'W',{m44B14Variant:'WR'});
  assert.equal(q.ok,false);assert.equal(q.reason,'m44_b14_hwei_w_variant');
 });
 run(team,'Hwei','QE persists and damages later',({a,enemy,cast,tick})=>{
  const hp=enemy.hp;
  const r=cast('Q',{point:{x:.528,y:.5},m44B14Variant:'QE'});
  assert.equal(r.moltenFissure,true);assert.equal(enemy.hp,hp);
  tick();assert.ok(enemy.hp<hp);
  assert.ok(a.boardTemporalV453Dev69.some(v=>
   v.variant==='hwei_qe'&&v.ownerId===a.units.find(t=>t.champ==='Hwei').id));
 });
 run(team,'Ekko','W is delayed and requires owner inside',({a,u,enemy,cast,tick})=>{
  cast('W',{point:{x:.52,y:.5}});
  assert.equal(a.effectResolverV41().has(enemy,'stun'),false);
  tick();assert.equal(a.effectResolverV41().has(enemy,'stun'),false);
  tick();assert.equal(a.effectResolverV41().has(enemy,'stun'),true);
  assert.equal(a.effectResolverV41().has(u,'shield'),true);
 });
 run(team,'Bard','shrine heals on timed arrival',({ally,cast,tick})=>{
  const hp=ally.hp;
  cast('W',{targetId:ally.id});
  assert.equal(ally.hp,hp);
  tick();assert.ok(ally.hp>hp);
 });
 run(team,'AurelionSol','breath ticks only down its cone',({enemy,cast,tick})=>{
  const hp=enemy.hp;
  cast('Q',{point:{x:.529,y:.5}});
  assert.equal(enemy.hp,hp);
  tick();assert.ok(enemy.hp<hp);
 });
 run(team,'AurelionSol','stasis interrupts owner channel',({a,u,enemy,cast,tick})=>{
  cast('Q',{point:{x:.529,y:.5}});
  const hp=enemy.hp;
  a.applyEffectV41(u,'stasis',{source:u,duration:2,
   key:'m44_b14_owner_interrupt_test'});
  tick();assert.equal(enemy.hp,hp);
  assert.equal(a.boardTemporalV453Dev69.some(z=>
   z.variant==='aurelion_q'&&z.ownerId===u.id),false);
 });
}
for(const f of failures)console.error('M44_B14B_FAIL',JSON.stringify(f));
console.log('M44_B14B '+JSON.stringify({champions:4,newSlots:5,passed,
 snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,32);
