/** M33 B01: 35 committed aim directions + two champion-authored state families.
 * No general ability fallback and NO complete-kit certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,BOARD_M20_B01_V453,checksumV40} from '../../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const aimed=new Set(['target_enemy','target_ally','target_any','line_enemy',
 'cone_enemy','circle_enemy','move_point','deploy_point','vision_point']);
let facing=0,championCases=0,snapshots=0;const failures=[];
function setup(champ,team){
 const foe=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:333535,mode:'pvp',
  draft:{[team]:{MID:champ},[foe]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:3500,maxHp:3500,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID');
 const e=a.units.find(v=>v.id===foe+'_MID');
 const ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:3500,maxHp:3500,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.514,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(ally,{x:.509,y:.5,hp:3000,maxHp:3500});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const next=(seconds=1)=>{a.gameTime+=seconds;a.round++;a.actionLocksV40={};};
 const cast=(slot,opts={})=>{
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(q.ok,true,champ+' '+slot+' queue: '+JSON.stringify(q));
  let commit;const old=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,c)=>(commit=old(v,c));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=old}
  assert.equal(commit?.ok,true,champ+' '+slot+' commit: '+JSON.stringify(commit));
  return commit;
 };
 const snap=()=>{
  const s=a.snapshotV40();
  assert.equal(checksumV40(s),checksumV40(Arena.fromSnapshotV40(map,mask,s).snapshotV40()));
  snapshots++;
 };
 return {a,u,e,ally,team,foe,cast,next,snap};
}
function run(champ,team,scenario,fn){
 try{fn(setup(champ,team))}
 catch(err){failures.push({champ,team,scenario,error:String(err.stack||err)})}
}
for(const team of ['blue','red']){
 for(const [champ,kit] of Object.entries(BOARD_M20_B01_V453)){
  run(champ,team,'real committed facing',({a,u,e,ally,cast,snap})=>{
   const slot=['Q','W','E'].find(key=>aimed.has(kit[key].shape)&&!kit[key].originSelf);
   assert.ok(slot,champ+' must have a directed QWE');
   const shape=kit[slot].shape,opts=(champ==='Lucian'&&slot==='Q')?
    {targetId:e.id}:shape==='target_ally'?{targetId:ally.id}:
    ['target_enemy','target_any'].includes(shape)?
    {targetId:e.id}:{point:{x:.516,y:.5}};
   const initial={x:u.x,y:u.y};
   cast(slot,opts);
   const direction=shape==='target_ally'?ally:shape.startsWith('target_')?e:
    {x:.516,y:.5};
   const dx=(direction.x-initial.x)*a.worldWidth,
    dy=(direction.y-initial.y)*a.worldHeight,len=Math.hypot(dx,dy);
   assert.ok(u.m28FacingV453&&len>1,'committed aimed spell updates orientation');
   assert.ok(Math.abs(u.m28FacingV453.x-dx/len)<1e-6&&
    Math.abs(u.m28FacingV453.y-dy/len)<1e-6,
    champ+' must face real committed aim (not stale queued target)');
   snap();facing++;
  });
 }
 run('Viktor',team,'research LIFO undo + snapshot',({a,u,e,next,snap})=>{
  const opponent=team==='blue'?'red':'blue';
  u.m30ViktorFragments=300;
  const baseline=e.hp;
  assert.equal(a.undoBoardViktorEvolutionV453Dev69(opponent,u.id).ok,false);
  for(const slot of ['Q','W','E'])
   assert.equal(a.queueBoardViktorEvolutionV453Dev69(team,u.id,slot).ok,true);
  assert.equal(u.m30ViktorAugments.R,true);
  assert.equal(u.m30ViktorFragments,0);
  assert.equal(a.undoBoardViktorEvolutionV453Dev69(team,u.id).ok,true);
  assert.equal(u.m30ViktorAugments.R,undefined,'undo removes derived R evolution');
  assert.equal(u.m30ViktorFragments,100);
  assert.equal(a.undoBoardViktorEvolutionV453Dev69(team,u.id).ok,true);
  assert.equal(u.m30ViktorAugments.W,undefined);
  assert.equal(u.m30ViktorFragments,200);
  next();
  const before=checksumV40(a.snapshotV40());
  assert.equal(a.undoBoardViktorEvolutionV453Dev69(team,u.id).ok,false,
   'cannot undo research after planning round');
  assert.equal(checksumV40(a.snapshotV40()),before);
  assert.equal(e.hp,baseline);
  snap();championCases++;
 });
 run('LeeSin',team,'first-cast energy, Q2, Flurry and regen',({a,u,e,cast,next,snap})=>{
  assert.equal(a.m33LeeEnergyAvailableV453Dev69(u),200);
  cast('Q',{point:{x:.535,y:.5}});
  assert.ok(u.m21SonicRecastV453?.targetId===e.id,'Q1 real hit owns sonic mark');
  assert.equal(a.m33LeeEnergyAvailableV453Dev69(u),150);
  next(1);
  cast('Q',{targetId:e.id});
  assert.equal(a.m33LeeEnergyAvailableV453Dev69(u),130,'Q2 costs 30 after 10 regen');
  next(1);
  cast('W',{targetId:u.id});
  assert.equal(a.m33LeeEnergyAvailableV453Dev69(u),90,'W1 costs 50 after 10 regen');
  const before=a.m33LeeEnergyAvailableV453Dev69(u);
  a.damage(e,25,u,'physical','basic');
  assert.ok(a.m33LeeEnergyAvailableV453Dev69(u)>before,'Flurry refunds energy on real basic');
  u.m33LeeEnergyV453={value:10,at:a.gameTime};
  const checksum=checksumV40(a.snapshotV40());
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'E').ok,false);
  assert.equal(checksumV40(a.snapshotV40()),checksum,'no debit on denied energy queue');
  assert.ok(a.m33LeeEnergyAvailableV453Dev69(u)<=10.001);
  next(5);
  assert.ok(a.m33LeeEnergyAvailableV453Dev69(u)>=60,'time-derived energy regeneration');
  snap();championCases++;
 });
}
for(const failure of failures)console.error('M33_MACRO_FAIL',JSON.stringify(failure));
console.log('M33_MACRO_QA '+JSON.stringify({champions:35,teamSeats:2,
 facingPassed:facing,expectedFacing:70,championCases,expectedChampionCases:4,
 snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
assert.equal(facing,70);
assert.equal(championCases,4);
