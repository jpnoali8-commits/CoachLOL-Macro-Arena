/** M44 B13A — actual Arena authored identities, mirrored teams and snapshots. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B13A_KITS_V453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const entries=[
 ['Bard','R','point','temperedFate'],['AurelionSol','E','point','singularity'],
 ['Anivia','R','point','glacialStorm'],['Kalista','E','self','rend'],
 ['Leblanc','W','point','distortion'],['Jayce','R','self','transformed'],
 ['Rumble','Q','point','flamespitter'],['Taliyah','W','point','seismicShove'],
 ['Lissandra','R','enemy','frozenTomb'],['Ekko','R','self','chronobreak'],
 ['Zed','W','point','livingShadow'],['Katarina','E','enemy','shunpo'],
 ['Nami','W','enemy','ebbFlow'],['Azir','W','point','arise']
];
let passed=0,snapshots=0;const failures=[];
for(const team of ['blue','red'])for(const [champ,slot,shape,flag] of entries){
 try{
  const other=team==='blue'?'red':'blue';
  const a=new Arena(map,mask,{seed:133713,mode:'pvp',
   draft:{[team]:{MID:champ,TOP:'Annie'},[other]:{MID:'Annie',TOP:'Malphite'}}});
  for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:5000,maxHp:5000,
   autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
  for(const v of a.minions)Object.assign(v,{x:.08,y:.08});
  const u=a.units.find(v=>v.id===team+'_MID'),
   e=a.units.find(v=>v.id===other+'_MID'),
   ally=a.units.find(v=>v.id===team+'_TOP');
  Object.assign(u,{x:.5,y:.5,hp:3500,maxHp:5000,mana:10000,maxMana:10000,
   level:16,skillRanks:{Q:5,W:5,E:5,R:3},
   skillCds:{Q:0,W:0,E:0,R:0}});
  Object.assign(e,{x:.525,y:.5,hp:10000,maxHp:10000,mr:0,armor:0});
  Object.assign(ally,{x:.53,y:.5,hp:2000,maxHp:5000});
  a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;
  a.obstacleLine=()=>false;
  if(champ==='Kalista')a.damage(e,35,u,'physical','basic');
  if(champ==='Ekko'){a.advanceBoardPassivesV453Dev69();a.gameTime=3;u.x=.54;}
  const opts=shape==='point'?{point:{x:.526,y:.5}}:
   shape==='enemy'?{targetId:e.id}:{};
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(queued.ok,true,'queued '+champ+' '+JSON.stringify(queued));
  let receipt;const native=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,plan)=>(receipt=native(actor,plan));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=native;}
  assert.equal(receipt?.ok,true,'committed '+champ);
  assert.equal(receipt?.[flag],true,'champion-owned effect '+champ);
  if(champ==='Bard'){
   assert.equal(a.effectResolverV41().has(e,'stasis'),true);
   assert.equal(a.effectResolverV41().has(ally,'stasis'),true);
  }
  if(champ==='Kalista')assert.equal(e.m44B13KalistaSpears?.[u.id],undefined);
  if(champ==='Leblanc'||champ==='Zed')
   assert.ok(u.m44B13Return?.until>a.gameTime);
  if(champ==='Jayce')assert.equal(u.m44B13JayceMode,'hammer');
  if(champ==='Azir')assert.ok(a.boardSummonsV453Dev69.some(v=>
   v.kind==='azir_soldier'&&v.ownerId===u.id&&v.nonCombat));
  if(champ==='Rumble')assert.equal(u.m44B13RumbleHeat,20);
  if(champ==='Ekko')assert.ok(u.x<.54,'rewind to prior location');
  if(champ==='Nami')assert.ok(receipt.hops.length>=1);
  a.gameTime++;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69();
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;snapshots++;
 }catch(error){failures.push({team,champ,slot,error:String(error?.stack||error)});}
}
for(const e of failures)console.error('M44_B13A_FAIL',JSON.stringify(e));
console.log('M44_B13A '+JSON.stringify({champions:entries.length,passed,
 snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,28);
