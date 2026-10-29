/** M36 B01 actual distinct champion effects across both human PvP seats. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,BOARD_M20_B01_V453} from '../../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const SCENARIOS=['Xerath','Gragas','Sejuani','TahmKench','JarvanIV','Urgot'];
const results={champions:SCENARIOS.length,seats:2,passed:0,snapshots:0,negative:0,failures:0,certifiedKits:0};
const failures=[];
function setup(champ,team){
 const foe=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:363636,mode:'pvp',draft:{[team]:{MID:champ},[foe]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:3500,maxHp:3500,
  autoAttack:false,autoFarm:false,autoFollow:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),e=a.units.find(v=>v.id===foe+'_MID'),
  second=a.units.find(v=>v.id===foe+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:3500,maxHp:3500,level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.52,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(second,{x:.56,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,opts={})=>{
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(q?.ok,true,champ+' '+slot+' queue '+JSON.stringify(q));
  let output;const old=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,x)=>(output=old(v,x));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=old}
  assert.equal(output?.ok,true,champ+' '+slot+' commit '+JSON.stringify(output));
  return output;
 };
 const advance=(seconds=1)=>{a.gameTime+=seconds;a.round++;a.actionLocksV40={};};
 const snapshot=()=>{
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  results.snapshots++;
 };
 return {a,u,e,second,team,foe,cast,advance,snapshot};
}
function verify(champ,team,fn){
 try{fn(setup(champ,team));results.passed++}
 catch(error){results.failures++;failures.push({champ,team,error:String(error?.stack||error)})}
}
for(const team of ['blue','red']){
 verify('Xerath',team,({a,u,e,second,cast,advance,snapshot})=>{
  // Shocking Orb stun scales with actual travel, not generic 1.5s.
  second.x=.08;e.x=.52;cast('E',{point:{x:.55,y:.5}});
  const first=a.effectResolverV41().list(e).filter(x=>x.type==='stun');
  assert.ok(first.length,'Xerath close E must stun');
  const short=Math.max(...first.map(x=>x.until??x.duration??0));
  advance(14);u.skillCds.E=0;e.x=.565;e.hp=7000;
  cast('E',{point:{x:.57,y:.5}});
  const far=a.effectResolverV41().list(e).filter(x=>x.type==='stun');
  assert.ok(far.length,'Xerath far E must stun');
  const long=Math.max(...far.map(x=>x.until??x.duration??0));
  assert.ok(long-short>14.1,'Longer travel must produce a proportionally longer stun');
  assert.ok(BOARD_M20_B01_V453.Xerath.E.m36XerathShockingOrb);
  snapshot();
 });
 verify('Gragas',team,({u,e,second,cast,snapshot})=>{
  e.x=.535;second.x=.545;
  cast('R',{point:{x:.54,y:.5}});
  assert.ok(e.x<.535,'left victim displaced away from impact CENTER');
  assert.ok(second.x>.545,'right victim displaced away from impact CENTER');
  assert.ok(e.m36GragasCaskKnockback?.travelled>0);
  assert.ok(second.m36GragasCaskKnockback?.travelled>0);
  snapshot();
 });
 verify('Sejuani',team,({u,e,second,cast,snapshot})=>{
  e.x=.515;second.x=.539;
  cast('Q',{point:{x:.54,y:.5}});
  assert.ok(u.x>.5&&u.x<.53,'Arctic Assault stops at first actual contact');
  assert.ok(e.hp<7000,'first champion hit');
  assert.equal(second.hp,7000,'no extra full-path remote hit');
  assert.ok(BOARD_M20_B01_V453.Sejuani.Q.m36SejuaniArcticAssault);
  snapshot();
 });
 verify('TahmKench',team,({a,u,e,second,cast,advance,snapshot})=>{
  e.x=.53;second.x=.08;
  const mana=u.mana;
  const result=cast('W',{point:{x:.53,y:.5}});
  assert.equal(result.scheduled,true,'W must emerge later');
  assert.equal(u.x,.5,'no instant generic dash');
  assert.equal(e.hp,7000,'no damage before emergence');
  assert.ok(u.mana<mana,'one skill receipt');
  const cooldown=u.skillCds.W;
  advance(1.1);a.advanceBoardTemporalV453Dev69();
  assert.ok(u.x>.52,'Tahm physically surfaced at specified location');
  assert.ok(e.hp<7000,'emergence dealt damage');
  assert.equal(u.skillCds.W,cooldown,'timed hit cannot charge cooldown twice');
  snapshot();
 });
 verify('JarvanIV',team,({a,u,e,second,cast,snapshot})=>{
  e.x=.512;second.x=.518;
  cast('W');
  assert.equal(u.m36JarvanAegisTargets,2,'count actual nearby enemy champions');
  assert.ok(a.effectResolverV41().list(u).some(x=>x.type==='shield'&&
   x.key?.startsWith('m36_jarvan_aegis_')),'authored extra shield exists');
  assert.ok(BOARD_M20_B01_V453.JarvanIV.W.m36JarvanGoldenAegis);
  snapshot();
 });
 verify('Urgot',team,({a,u,e,second,cast,advance,snapshot,team:seat})=>{
  e.x=.515;second.x=.53;
  cast('Q',{point:{x:.515,y:.5}});
  assert.ok(e.m36UrgotCorrosive?.[u.id]>a.gameTime,
   'Q only marks a real successfully hit enemy');
  advance(1);u.skillCds.W=0;
  const q=a.queueBoardSkillV453Dev69(seat,u.id,'W');
  assert.equal(q.ok,true,'W auto-prioritizes enemy recently hit by Q');
  assert.equal(u.pendingBoardV453Dev69.targetId,e.id);
  a.resolveBoardSkillsV453Dev69();
  assert.ok(a.boardTemporalV453Dev69.some(t=>t.kind==='m27_urgot_purge'&&
   t.targetId===e.id),'Urgot Purge locks exactly its prioritized victim');
  snapshot();
 });
}
for(const x of failures)console.error('M36_REAL_IDENTITY_FAIL',JSON.stringify(x));
console.log('M36_B01_6_REAL_IDENTITIES '+JSON.stringify(results));
assert.equal(results.failures,0);
assert.equal(results.passed,12);
assert.equal(results.snapshots,12);
