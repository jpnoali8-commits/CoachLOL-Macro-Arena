/** M33 focused runtime regression: real directional counterplay and charge/upgrade ownership.
 * This suite is NOT a 17-dimension kit certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const scenarios=['Cassiopeia','Milio','Heimerdinger','Shen'];
let cases=0,snapshots=0;const failures=[];
function setup(champ,team){
 const foe=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:331217,mode:'pvp',
  draft:{[team]:{MID:champ},[foe]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:3500,maxHp:3500,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID');
 const e=a.units.find(v=>v.id===foe+'_MID');
 const ally=a.units.find(v=>v.id===team+'_TOP');
 const spawnBlade=u.m29ShenBladePoint?{...u.m29ShenBladePoint}:null;
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:3500,maxHp:3500,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(ally,{x:.504,y:.5,hp:2600,maxHp:3500});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const next=(seconds=1)=>{a.gameTime+=seconds;a.round++;a.actionLocksV40={};};
 const cast=(slot,opts={})=>{
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(queued.ok,true,champ+' '+slot+' queue '+JSON.stringify(queued));
  let resolved;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,q)=>(resolved=original(v,q));
  try{a.resolveBoardSkillsV453Dev69();}finally{a.executeBoardSkillV453Dev69=original;}
  assert.equal(resolved?.ok,true,champ+' '+slot+' commit '+JSON.stringify(resolved));
  return resolved;
 };
 const snapshot=()=>{
  const s=a.snapshotV40();assert.equal(checksumV40(s),
   checksumV40(Arena.fromSnapshotV40(map,mask,s).snapshotV40()));
  snapshots++;
 };
 return {a,u,e,ally,team,foe,cast,next,snapshot,spawnBlade};
}
function run(champ,team,name,fn){
 try{fn(setup(champ,team));cases++;}
 catch(error){failures.push({champ,team,name,error:String(error.stack||error)});}
}
for(const team of ['blue','red']){
 run('Cassiopeia',team,'player facing toward -> petrify',({a,u,e,foe,cast,snapshot})=>{
  const initial=checksumV40(a.snapshotV40());
  assert.equal(a.queueBoardFacingV453Dev69(team,e.id,{x:u.x,y:u.y}).ok,false,'cannot rotate enemy');
  assert.equal(a.queueBoardFacingV453Dev69(foe,e.id,{x:NaN,y:.5}).ok,false,'invalid direction');
  assert.equal(checksumV40(a.snapshotV40()),initial,'illegal orders must not mutate state');
  assert.equal(a.queueBoardFacingV453Dev69(foe,e.id,{x:u.x,y:u.y}).ok,true);
  cast('R',{point:{x:.55,y:.5}});
  assert.equal(a.effectResolverV41().has(e,'stun'),true,'facing caster must petrify');
  snapshot();
 });
 run('Cassiopeia',team,'facing away -> slow only',({a,u,e,foe,cast,snapshot})=>{
  assert.equal(a.queueBoardFacingV453Dev69(foe,e.id,{x:.9,y:.5}).ok,true);
  cast('R',{point:{x:.55,y:.5}});
  assert.equal(a.effectResolverV41().has(e,'stun'),false,'away facing must not petrify');
  assert.equal(a.effectResolverV41().has(e,'slow'),true,'away facing receives slow');
  snapshot();
 });
 run('Milio',team,'two independent E shield receipts, reject third',({a,u,ally,cast,next,snapshot})=>{
  const mana=u.mana;
  cast('E',{targetId:ally.id});
  assert.equal(u.m29MilioEStock.charges,1);
  next(.1);
  cast('E',{targetId:ally.id});
  assert.equal(u.m29MilioEStock.charges,0);
  assert.equal(u.m29MilioEStock.nextAt> a.gameTime,true);
  const after=u.mana,now=checksumV40(a.snapshotV40());
  next(.1);
  const denied=a.queueBoardSkillV453Dev69(team,u.id,'E',{targetId:ally.id});
  assert.equal(denied.ok,false);assert.equal(denied.reason,'m29_milio_no_charges');
  assert.equal(u.mana,after);assert.ok(mana>after,'two real E costs');
  assert.ok(a.effectResolverV41().list(ally).some(e=>e.type==='shield'),'real ally shield');
  assert.ok(u.skillCds.E<=a.gameTime,'stock not unrelated generic cooldown');
  snapshot();
 });
 run('Heimerdinger',team,'R+Q deploys empowered despite empty base stocks',({a,u,cast,next,snapshot})=>{
  u.m28HeimerStock={charges:0,nextAt:a.gameTime+20};
  const blocked=a.queueBoardSkillV453Dev69(team,u.id,'Q',{point:{x:.515,y:.5}});
  assert.equal(blocked.ok,false);
  cast('R');next(1);
  const mana=u.mana;
  cast('Q',{point:{x:.515,y:.5}});
  const turrets=a.boardSummonsV453Dev69.filter(v=>v.ownerId===u.id&&v.kind==='heimer_turret_upgraded');
  assert.equal(turrets.length,1,'R+Q creates actual upgraded entity');
  assert.equal(turrets[0].beamEvery,3);
  assert.equal(u.m28HeimerStock.charges,0,'R+Q must not consume normal turret stock');
  assert.equal(u.m23HeimerEmpowerV453,null,'R empowerment is consumed exactly once');
  assert.ok(u.mana<mana);
  snapshot();
 });
 run('Shen',team,'Spirit Blade anchors at spawn then travels on real Q',({a,u,e,spawnBlade,cast,snapshot})=>{
  assert.ok(spawnBlade&&Number.isFinite(spawnBlade.x)&&Number.isFinite(spawnBlade.y),
   'Shen blade must exist from champion spawn, not appear after first Q');
  assert.notDeepEqual(spawnBlade,{x:u.x,y:u.y},'blade persists before Shen moves');
  e.x=(spawnBlade.x+u.x)/2;e.y=(spawnBlade.y+u.y)/2;
  cast('Q');
  assert.deepEqual(u.m29ShenBladePoint,{x:u.x,y:u.y},'Spirit Blade follows real Q pull');
  assert.equal(a.effectResolverV41().has(e,'slow'),true,'blade travelling across enemy slows');
  snapshot();
 });
}
for(const f of failures)console.error('M33_B01_FAIL',JSON.stringify(f));
console.log('M33_B01_IDENTITY_QA '+JSON.stringify({champions:scenarios.length,seats:2,cases,expected:10,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(cases,10);
