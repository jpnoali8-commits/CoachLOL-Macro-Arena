/** M44 B14C Sylas Hijack: explicit B13 R identity, two PvP seats, snapshots. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B14C_STEALABLE_R_V453,m44B14CSylasUltimateRuleV453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let passed=0,snapshots=0;const failures=[];
for(const side of ['blue','red'])for(const champ of M44_B14C_STEALABLE_R_V453){
 try{
  const other=side==='blue'?'red':'blue';
  const a=new Arena(map,mask,{seed:144415,mode:'pvp',
   draft:{[side]:{MID:'Sylas'},[other]:{MID:champ}}});
  for(const x of a.units)Object.assign(x,{x:.08,y:.08,hp:15000,maxHp:15000,
   autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
  for(const m of a.minions)Object.assign(m,{x:.08,y:.08});
  const syl=a.units.find(x=>x.id===side+'_MID'),
   victim=a.units.find(x=>x.id===other+'_MID');
  Object.assign(syl,{x:.5,y:.5,mana:10000,maxMana:10000,level:16,
   skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
  Object.assign(victim,{x:.528,y:.5,mr:0,armor:0});
  a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;
  a.obstacleLine=()=>false;
  const rule=m44B14CSylasUltimateRuleV453(champ);
  assert.ok(rule?.m44B13BId||rule?.m44B13Id,'authored R');
  assert.equal(a.queueSylasHijackV453M14(side,syl.id,victim.id).ok,true);
  const mana=syl.mana;
  a.resolveSylasHijacksV453M14();
  assert.equal(syl.sylasStolenV453M14?.sourceChamp,champ);
  assert.equal(syl.mana,mana-75);
  assert.equal(a.boardKitForV453Dev69('Sylas','R',syl),rule);
  const options=['target_enemy','target_any'].includes(rule.shape)?
   {targetId:victim.id}:
   ['line_enemy','circle_enemy','cone_enemy','move_point'].includes(rule.shape)?
   {point:{x:victim.x,y:victim.y}}:{};
  assert.equal(a.queueBoardSkillV453Dev69(side,syl.id,'R',options).ok,true);
  let receipt;const native=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(u,q)=>(receipt=native(u,q));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=native;}
  assert.equal(receipt?.ok,true,'stolen cast '+champ);
  assert.equal(receipt.hijacked,true);
  assert.equal(receipt.spentMana,0);
  assert.equal(syl.champ,'Sylas');
  assert.equal(syl.sylasStolenV453M14,null);
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;snapshots++;
 }catch(e){failures.push({side,champ,error:String(e?.stack||e)})}
}
for(const f of failures)console.error('M44_B14C_SYLAS_FAIL',JSON.stringify(f));
console.log('M44_B14C_SYLAS '+JSON.stringify({
 ultimates:M44_B14C_STEALABLE_R_V453.length,passed,snapshots,
 failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,22);
