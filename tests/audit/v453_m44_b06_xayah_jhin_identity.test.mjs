/**
 * M44 B06 — Authored Xayah P/Q/E/R geometry + Jhin Curtain Call (both PvP teams).
 * Tests real Arena, deterministic V40 snapshot/replay. NOT full kit certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
let passed=0,snapshots=0;const failures=[];
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:450606,mode:'pvp',
  draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:6000,maxHp:6000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 for(const m of a.minions||[])Object.assign(m,{x:.08,y:.08});
 const u=a.units.find(v=>v.id===team+'_MID'),e=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{x:.5,y:.5,level:16,mana:10000,maxMana:10000,
  hp:5000,maxHp:5000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.527,y:.5,hp:10000,maxHp:10000,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;
 a.walkable=()=>true;a.obstacleLine=()=>false;
 function fire(slot,point={x:.56,y:.5}){
  const queue=a.queueBoardSkillV453Dev69(team,u.id,slot,{point});
  if(!queue.ok)return {queue,receipt:null};
  let receipt;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,q)=>(receipt=original(v,q));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original}
  return {queue,receipt};
 }
 function cast(slot,point){const result=fire(slot,point);
  assert.equal(result.queue?.ok,true,'queue '+champ+' '+slot);
  assert.equal(result.receipt?.ok,true,'commit '+champ+' '+slot+' '+JSON.stringify(result.receipt));
  return result.receipt;
 }
 function tick(){
  a.gameTime++;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69();
 }
 return {a,u,e,cast,fire,tick,team,other};
}
function run(champ,team,label,fn){
 const f=fixture(champ,team);
 try{fn(f);const snapshot=f.a.snapshotV40();
  assert.equal(checksumV40(snapshot),checksumV40(
   Arena.fromSnapshotV40(map,mask,snapshot).snapshotV40()),'V40 replay');
  passed++;snapshots++;
 }catch(error){failures.push({champ,team,label,error:String(error?.stack||error)})}
}
for(const team of ['blue','red']){
 run('Xayah',team,'R untargetable but existing DoT still damages',({a,u,e,cast,tick})=>{
  cast('R');
  assert.equal(a.effectResolverV41().has(u,'invulnerable'),false);
  assert.ok(u.m44XayahUntargetableUntil>a.gameTime);
  assert.equal(a.boardCombatEnemyPoolV453Dev69(e).some(v=>v.id===u.id),false);
  const hp=u.hp;
  assert.equal(a.damage(u,100,e,'physical','basic'),0);
  assert.equal(a.damage(u,100,e,'magic','spell'),0);
  assert.equal(u.hp,hp);
  assert.ok(a.damage(u,100,e,'magic','dot')>0);
  tick();assert.ok(a.damage(u,100,e,'physical','basic')>0);
 });
 run('Xayah',team,'Q produces independent angled feather trajectories',({a,u,cast,tick})=>{
  cast('Q');
  const rays=a.boardTemporalV453Dev69.filter(z=>z.champ==='Xayah'&&z.slot==='Q');
  assert.equal(rays.length,2);
  assert.ok(Math.abs(rays[0].point.y-rays[1].point.y)>.001);
  tick();tick();assert.equal(u.m44XayahFeathers?.length,2);
  assert.notEqual(u.m44XayahFeathers[0].y,u.m44XayahFeathers[1].y);
 });
 run('Xayah',team,'E recalls to updated caster location',({a,u,e,cast,tick})=>{
  for(let i=0;i<3;i++)a.m44XayahPlantFeatherV453Dev69(u,{x:.56,y:.5});
  const hp=e.hp;cast('E');
  u.y=.53;tick();assert.equal(e.hp,hp,'should miss now-moved caster');
 });
 run('Xayah',team,'E does not pass hard wall',({a,u,e,cast,tick})=>{
  for(let i=0;i<3;i++)a.m44XayahPlantFeatherV453Dev69(u,{x:.56,y:.5});
  const hp=e.hp;cast('E');a.obstacleLine=()=>true;tick();
  assert.equal(e.hp,hp);assert.equal(a.effectResolverV41().has(e,'root'),false);
 });
 run('Jhin',team,'R bullet has travel time and bypasses minion',({a,e,cast,tick,team})=>{
  const min={id:'b06_min_'+team,kind:'minion',team:e.team,x:.516,y:.5,
   hp:900,maxHp:900,armor:0,mr:0,spawnAt:0};
  a.minions.push(min);cast('R');tick();
  const hp=e.hp,s=cast('R');assert.equal(s.shot,1);
  assert.equal(e.hp,hp,'no damage before impact');
  tick();assert.ok(e.hp<hp);assert.equal(min.hp,900);
 });
 run('Jhin',team,'R maintains exactly four individually committed shots',({a,u,e,cast,tick})=>{
  e.hp=e.maxHp=100000;const mana=u.mana;cast('R');
  for(let shot=1;shot<=4;shot++){
   tick();const r=cast('R');assert.equal(r.shot,shot);
   assert.equal(r.spentMana,0);assert.equal(r.scheduled,true);tick();
  }
  assert.equal(u.m16JhinChannel,null);
  assert.ok(e.hp<100000);assert.ok(u.mana<mana);
 });
 run('Jhin',team,'spellshield blocks bullet status and wall blocks follow-up',({a,e,cast,tick,team})=>{
  cast('R');tick();
  a.applyEffectV41(e,'spell_shield',{source:e,duration:6,key:'b06shield'});
  const hp=e.hp;cast('R');tick();assert.equal(e.hp,hp);
  assert.equal(a.effectResolverV41().has(e,'slow'),false);
  assert.equal(e.m16TrueSightUntil?.[team],undefined);
  tick();cast('R');a.obstacleLine=()=>true;tick();assert.equal(e.hp,hp);
 });
 run('Jhin',team,'R clone intercept and 60-degree firing sector',({a,u,e,cast,fire,tick,team})=>{
  const clone={id:'b06_decoy_'+team,kind:'neeko_clone',team:e.team,
   ownerId:e.id,x:.517,y:.5,hp:900,maxHp:900,until:30,
   stealthUntil:0,appearance:{kind:'champion',champ:'Annie'}};
  a.boardSummonsV453Dev69.push(clone);
  cast('R');tick();cast('R');tick();
  assert.ok(clone.hp<900);assert.equal(e.hp,10000,'first bullet hits clone');
  tick();const remaining=u.m16JhinChannel.remaining;
  const denied=fire('R',{x:.5,y:.56});
  assert.equal(denied.queue?.ok,true);
  assert.equal(denied.receipt?.ok,false,'sector prevents 90-degree rotation');
  assert.equal(u.m16JhinChannel.remaining,remaining);
 });
}
for(const f of failures)console.error('M44_B06_FAIL',JSON.stringify(f));
console.log('M44_B06_IDENTITY '+JSON.stringify({
 champions:['Xayah','Jhin'],seats:2,passed,snapshots,
 failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
assert.equal(passed,16);assert.equal(snapshots,16);
