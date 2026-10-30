/** M44 B13B — fourteen distinct champion slots: two PvP sides and snapshots. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B13B_KITS_V453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const entries=[
 ['Malzahar','R','enemy','netherGrasp'],
 ['Fiddlesticks','R','point','crowstorm'],
 ['Volibear','R','point','stormbringer'],
 ['Samira','W','self','bladeWhirl'],
 ['Yorick','R','self','maiden'],
 ['Ryze','R','point','realmWarp'],
 ['Skarner','R','point','impale'],
 ['Nocturne','R','enemy','paranoia'],
 ['Briar','W','self','bloodFrenzy'],
 ['Belveth','E','self','royalMaelstrom'],
 ['Rakan','W','point','grandEntrance'],
 ['Pantheon','E','self','aegisAssault'],
 ['Diana','R','self','moonfall'],
 ['Shyvana','E','point','flameBreath']
];
let passed=0,snapshots=0;const failures=[];
for(const team of ['blue','red'])for(const [champ,slot,mode,flag] of entries){
 try{
  const other=team==='blue'?'red':'blue';
  const a=new Arena(map,mask,{seed:131314,mode:'pvp',
   draft:{[team]:{MID:champ,TOP:'Annie'},[other]:{MID:'Annie',TOP:'Malphite'}}});
  for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:8000,maxHp:8000,
   autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
  for(const v of a.minions)Object.assign(v,{x:.08,y:.08});
  const u=a.units.find(v=>v.id===team+'_MID'),
   e=a.units.find(v=>v.id===other+'_MID'),
   ally=a.units.find(v=>v.id===team+'_TOP');
  Object.assign(u,{x:.5,y:.5,hp:5000,maxHp:9000,mana:10000,maxMana:10000,
   level:16,skillRanks:{Q:5,W:5,E:5,R:3},
   skillCds:{Q:0,W:0,E:0,R:0}});
  Object.assign(e,{x:.525,y:.5,hp:15000,maxHp:15000,mr:0,armor:0});
  Object.assign(ally,{x:.51,y:.5,hp:5000,maxHp:9000});
  a.visible=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
  const opts=mode==='point'?{point:{x:.526,y:.5}}:
   mode==='enemy'?{targetId:e.id}:{};
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(q.ok,true,'queue '+champ+' '+JSON.stringify(q));
  let receipt;const native=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,plan)=>(receipt=native(actor,plan));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=native;}
  assert.equal(receipt?.ok,true,'commit '+champ);
  assert.equal(receipt?.[flag],true,'authored '+champ);
  if(champ==='Yorick')assert.ok(a.boardSummonsV453Dev69.some(v=>
   v.kind==='yorick_maiden'&&v.ownerId===u.id&&v.power>0));
  if(champ==='Nocturne')assert.ok(a.teams[e.team].m44B13ParanoiaUntil>a.gameTime);
  if(champ==='Skarner')assert.ok(receipt.victims>=1);
  if(champ==='Ryze')assert.ok(a.boardTemporalV453Dev69.some(v=>
   v.variant==='ryze_r'&&v.ownerId===u.id));
  if(champ==='Pantheon')assert.ok(u.m44B13Aegis.until>a.gameTime);
  if(champ==='Samira')assert.ok(u.m44B13SamiraWhirlUntil>a.gameTime);
  if(champ==='Briar')assert.ok(u.m44B13Frenzy.until>a.gameTime);
  if(champ==='Belveth')assert.ok(u.m44B13Maelstrom.until>a.gameTime);
  if(champ==='Shyvana')assert.ok(receipt.hits>0);
  a.gameTime++;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69();
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;snapshots++;
 }catch(error){
  failures.push({team,champ,slot,error:String(error?.stack||error)});
 }
}
for(const e of failures)console.error('M44_B13B_FAIL',JSON.stringify(e));
console.log('M44_B13B '+JSON.stringify({champions:entries.length,
 passed,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,28);
