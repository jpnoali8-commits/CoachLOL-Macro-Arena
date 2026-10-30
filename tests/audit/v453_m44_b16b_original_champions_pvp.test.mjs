/* M44 B16B: 12 source-authorial actions, bilateral PvP, delayed effects, original reuse. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B16B_KITS_V453,m44B14DOriginalBoardRuleV453} from '../../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const traits={Azir:'emperorsDivide',Zed:'deathMark',Ekko:'phaseDive',
 Rumble:'equalizer',Sylas:'abscondAbduct',Briar:'chillingScream',
 Fiddlesticks:'reap',Skarner:'ixtalsImpact',Nocturne:'shroudOfDarkness',
 Pantheon:'grandStarfall',Diana:'lunarRush',Bard:'magicalJourney'};
let pass=0,checkpoint=0;const failures=[];
function run(side,champ,label,fn){
 try{
  const other=side==='blue'?'red':'blue';
  const a=new Arena(map,mask,{mode:'pvp',seed:16161,
   draft:{[side]:{MID:champ},[other]:{MID:'Annie'}}});
  for(const v of a.units)Object.assign(v,{x:.07,y:.07,hp:20000,maxHp:20000,
   armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
  for(const v of a.minions)Object.assign(v,{x:.07,y:.07});
  a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;
  a.obstacleLine=()=>false;
  const u=a.units.find(v=>v.id===side+'_MID'),
   victim=a.units.find(v=>v.id===other+'_MID');
  Object.assign(u,{x:.5,y:.5,level:16,mana:10000,maxMana:10000,
   skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
  Object.assign(victim,{x:.528,y:.5});
  const cast=(slot,options={})=>{
   const queue=a.queueBoardSkillV453Dev69(side,u.id,slot,options);
   assert.equal(queue.ok,true,'queue '+JSON.stringify(queue));
   let receipt;const original=a.executeBoardSkillV453Dev69.bind(a);
   a.executeBoardSkillV453Dev69=(unit,order)=>(receipt=original(unit,order));
   try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original}
   assert.equal(receipt?.ok,true,JSON.stringify(receipt));
   return receipt;
  };
  fn({a,u,victim,other,cast});
  const snapshot=a.snapshotV40();
  assert.equal(checksumV40(snapshot),
   checksumV40(Arena.fromSnapshotV40(map,mask,snapshot).snapshotV40()));
  pass++;checkpoint++;
 }catch(err){failures.push({side,champ,label,error:String(err?.stack||err)})}
}
for(const side of ['blue','red']){
 for(const [champ,entry] of Object.entries(M44_B16B_KITS_V453))
  run(side,champ,'native',({a,u,victim,cast})=>{
   const [slot,rule]=Object.entries(entry)[0];
   assert.equal(m44B14DOriginalBoardRuleV453(champ,slot,u),rule);
   const options=rule.shape==='target_enemy'?{targetId:victim.id}:
    ['cone_enemy','circle_enemy','line_enemy','move_point'].includes(rule.shape)?
     {point:{x:.53,y:.5}}:{};
   if(champ==='Bard')a.obstacleLine=(from,to)=>
    from?.id===u.id&&to?.x===.53&&to?.y===.5;
   assert.equal(cast(slot,options)[traits[champ]],true);
   assert.equal(u.id,side+'_MID');assert.equal(u.team,side);
  });
 run(side,'Pantheon','delayed starfall',({a,u,victim,cast})=>{
  assert.equal(cast('R',{point:{x:.53,y:.5}}).grandStarfall,true);
  assert.ok(u.m44B16GrandStarfall);
  const hp=victim.hp;a.gameTime+=1;a.advanceBoardPassivesV453Dev69();
  assert.equal(u.m44B16GrandStarfall,null);
  assert.ok(victim.hp<hp);
 });
 run(side,'Zed','owner death mark detonation',({a,u,victim,cast})=>{
  cast('R',{targetId:victim.id});
  assert.ok(victim.m44B16DeathMark?.[u.id]);
  a.damage(victim,110,u,'physical','basic');
  assert.ok(victim.m44B16DeathMark[u.id].accumulated>0);
  const hp=victim.hp;a.gameTime+=3;a.advanceBoardPassivesV453Dev69();
  assert.ok(victim.hp<hp);
  assert.equal(victim.m44B16DeathMark[u.id],undefined);
 });
 run(side,'Diana','own Q mark resets E',({a,u,victim,cast})=>{
  victim.m44B15DianaMoonlight={[u.id]:a.gameTime+4};
  assert.equal(cast('E',{targetId:victim.id}).reset,true);
  assert.equal(u.skillCds.E,a.gameTime);
  assert.equal(victim.m44B15DianaMoonlight[u.id],undefined);
 });
 run(side,'Bard','must cross wall, no debit',({a,u})=>{
  assert.equal(a.queueBoardSkillV453Dev69(side,u.id,'E',
   {point:{x:.53,y:.5}}).ok,false);
  assert.equal(u.mana,10000);
 });
 run(side,'Nocturne','real spell shield',({a,cast,u})=>{
  cast('W');
  assert.equal(a.effectResolverV41().has(u,'spell_shield'),true);
 });
 run(side,'Sylas','future Pantheon R theft',({a,u,victim,cast})=>{
  u.champ='Sylas';victim.champ='Pantheon';
  assert.equal(a.queueSylasHijackV453M14(side,u.id,victim.id).ok,true);
  a.resolveSylasHijacksV453M14();
  assert.equal(cast('R',{point:{x:.53,y:.5}}).grandStarfall,true);
  assert.equal(u.champ,'Sylas');assert.equal(u.team,side);
 });
 run(side,'Viego','future Ekko E possession',({a,u,victim,other,cast})=>{
  u.champ='Viego';victim.champ='Ekko';victim.hp=100;
  a.damage(victim,300,u,'true','spell');
  const soul=u.m44B14CSouls?.[0];assert.ok(soul);
  assert.equal(a.queueViegoPossessV453M44B14C(side,u.id,soul.id).ok,true);
  a.resolveBoardSkillsV453Dev69();
  assert.equal(u.champ,'Ekko');u.skillCds.E=0;
  assert.equal(cast('E',{point:{x:.53,y:.5}}).phaseDive,true);
  assert.equal(u.id,side+'_MID');assert.equal(u.team,side);
 });
 run(side,'Bard','wall removed before commit => no debit',({a,u})=>{
  const point={x:.53,y:.5};
  a.obstacleLine=(origin,dest)=>origin?.id===u.id&&
   dest?.x===point.x&&dest?.y===point.y;
  assert.equal(a.queueBoardSkillV453Dev69(side,u.id,'E',{point}).ok,true);
  const mana=u.mana,cd=u.skillCds.E,start={x:u.x,y:u.y};
  a.obstacleLine=()=>false;
  let receipt;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,order)=>(receipt=original(actor,order));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original}
  assert.equal(receipt?.ok,false);
  assert.equal(receipt?.reason,'m44_b16_bard_wall_lost_before_commit');
  assert.equal(u.mana,mana);assert.equal(u.skillCds.E,cd);
  assert.equal(u.x,start.x);assert.equal(u.y,start.y);
 });
}
for(const fail of failures)console.error('M44_B16B_FAIL',JSON.stringify(fail));
console.log('M44_B16B '+JSON.stringify({authored:12,pass,checkpoint,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(pass,40);
