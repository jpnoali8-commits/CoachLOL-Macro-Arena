/* M44 B17A+B original descriptors: 24 authored slots on both human PvP seats. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B17A_KITS_V453,M44_B17B_KITS_V453,m44B14DOriginalBoardRuleV453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const cases=[];
for(const [cohort,kits] of [['A',M44_B17A_KITS_V453],['B',M44_B17B_KITS_V453]])
 for(const [champ,slots] of Object.entries(kits))
  for(const [slot,rule] of Object.entries(slots))cases.push({cohort,champ,slot,rule});
assert.equal(cases.length,24);
let passed=0,snapshots=0;const failures=[];
for(const side of ['blue','red'])for(const spec of cases){
 try{
  const enemy=side==='blue'?'red':'blue';
  const a=new Arena(map,mask,{seed:1717,mode:'pvp',
   draft:{[side]:{MID:spec.champ},[enemy]:{MID:'Annie'}}});
  for(const v of a.units)Object.assign(v,{x:.07,y:.07,hp:20000,maxHp:20000,
   armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
  for(const v of a.minions)Object.assign(v,{x:.07,y:.07});
  a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
  const u=a.units.find(v=>v.id===side+'_MID'),victim=a.units.find(v=>v.id===enemy+'_MID');
  Object.assign(u,{x:.5,y:.5,level:16,mana:10000,maxMana:10000,
   skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0},
   m44B13JayceMode:'hammer',m44B17SamiraStyle:6});
  Object.assign(victim,{x:.516,y:.5});
  const original=m44B14DOriginalBoardRuleV453(spec.champ,spec.slot,u);
  assert.equal(original,spec.rule,'original descriptor must be first choice');
  const ally=a.units.find(v=>v.team===side&&v.id!==u.id);
  const args=spec.rule.shape==='target_enemy'?{targetId:victim.id}:
   spec.rule.shape==='target_ally'?{targetId:ally.id}:
   spec.rule.shape==='self'?{}:{point:{x:victim.x,y:victim.y}};
  const q=a.queueBoardSkillV453Dev69(side,u.id,spec.slot,args);
  assert.equal(q.ok,true,JSON.stringify(q));
  const originalExecutor=a.executeBoardSkillV453Dev69.bind(a);let receipt;
  a.executeBoardSkillV453Dev69=(actor,order)=>(receipt=originalExecutor(actor,order));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=originalExecutor}
  assert.equal(receipt?.ok,true,JSON.stringify(receipt));
  assert.equal(u.id,side+'_MID');assert.equal(u.team,side);
  assert.equal(u.pendingBoardV453Dev69,null);
  assert.ok(u.skillCds[spec.slot]>a.gameTime);
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;snapshots++;
 }catch(e){failures.push({side,champ:spec.champ,slot:spec.slot,error:String(e?.stack||e)})}
}
for(const f of failures)console.error('M44_B17_AUTHORED_FAIL',JSON.stringify(f));
console.log('M44_B17_AUTHORED '+JSON.stringify({cohortSlots:cases.length,
 seats:2,passed,snapshots,failures:failures.length,certifiedFullKits:0}));
assert.equal(failures.length,0);assert.equal(passed,48);
