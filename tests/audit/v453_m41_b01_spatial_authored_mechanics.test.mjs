/**
 * M41: three authored spatial identities on the simultaneous-turn board.
 * No anonymous ranged rays or generic circle fallbacks.
 * Both PvP seats, temporal receipts, collision, visual fog, snapshot/restore.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
import {buildM35B01WorkQueue} from '../../tools/skills_m35_b01_cohort_work_queue.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
let cases=0,snaps=0,negative=0,commands=0;const errors=[];
function fixture(champ,team){
 const foe=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:414141,mode:'pvp',
  draft:{[team]:{MID:champ},[foe]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:5000,maxHp:5000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===foe+'_MID'),
  far=a.units.find(v=>v.id===foe+'_TOP'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:4000,maxHp:4000,
  mana:10000,maxMana:10000,level:16,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.54,y:.5,hp:7500,maxHp:7500,armor:0,mr:150});
 Object.assign(far,{x:.52,y:.5,hp:7500,maxHp:7500,armor:0,mr:150});
 a.visible=()=>true;a.canSeePoint=()=>true;
 a.walkable=()=>true;a.obstacleLine=()=>false;
 const queue=(slot,props={})=>a.queueBoardSkillV453Dev69(team,u.id,slot,props);
 const resolve=()=>{let result;const run=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,q)=>(result=run(v,q));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=run}
  return result;
 };
 const cast=(slot,props={})=>{
  const receipt=queue(slot,props);
  assert.equal(receipt.ok,true,champ+' '+slot+' queue '+JSON.stringify(receipt));
  const commit=resolve();
  assert.equal(commit?.ok,true,champ+' '+slot+' commit '+JSON.stringify(commit));
  return commit;
 };
 const tick=(seconds=1)=>{
  a.gameTime+=seconds;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69();
 };
 const snap=()=>{
  const s=a.snapshotV40();
  assert.equal(checksumV40(s),checksumV40(Arena.fromSnapshotV40(map,mask,s).snapshotV40()));
  snaps++;
 };
 const zones=kind=>a.boardTemporalV453Dev69.filter(z=>z.kind===kind&&z.ownerId===u.id);
 return {a,u,e,far,ally,team,foe,queue,resolve,cast,tick,snap,zones};
}
function check(champ,team,label,fn){
 try{fn(fixture(champ,team));cases++}
 catch(error){errors.push({champ,team,label,error:String(error?.stack||error)})}
}
for(const team of ['blue','red']){
 check('Galio',team,'two flight receipts and only then center vortex',({a,u,e,far,cast,tick,snap,zones})=>{
  e.x=.525;e.y=.5;far.x=.528;far.y=.52;
  const hp=e.hp,mana=u.mana;
  cast('Q',{point:{x:.53,y:.5}});
  assert.equal(e.hp,hp,'Q may not deal instant full-circle fallback damage');
  assert.ok(u.mana<mana);
  let z=zones('m28_galio_converge')[0];
  assert.equal(z.m41Phase,'flight');
  tick(1);
  z=zones('m28_galio_converge')[0];
  assert.equal(z.m41Wings.length,2);
  assert.equal(z.m41Wings[0].side,-1);
  assert.equal(z.m41Wings[1].side,1);
  assert.notEqual(z.m41Wings[0].from.y,z.m41Wings[1].from.y);
  assert.ok(e.hp<hp,'at least one wing collision must hit at convergence');
  const wingHp=e.hp;
  tick(1);
  assert.ok(e.hp<wingHp,'first vortex pulse missing');
  tick(1);
  assert.equal(zones('m28_galio_converge').length,0,'vortex should expire');
  const after=e.hp;tick(1);
  assert.equal(e.hp,after,'expired vortex must not deal further damage');
  snap();
 });
 check('Galio',team,'both wings blocked by solid geometry',({a,u,e,cast,tick,snap,zones})=>{
  e.x=.53;e.y=.5;const hp=e.hp;
  cast('Q',{point:{x:.53,y:.5}});
  a.obstacleLine=(from,to)=>to?.x===.53&&to?.y===.5;
  tick(1);
  assert.equal(e.hp,hp);
  assert.equal(zones('m28_galio_converge').length,0);
  negative++;snap();
 });
 check('Galio',team,'restored temporal windblasts hit once',({a,u,e,cast,snap})=>{
  e.x=.525;e.y=.5;cast('Q',{point:{x:.53,y:.5}});
  const source=a.snapshotV40(),clone=Arena.fromSnapshotV40(map,mask,source);
  clone.visible=()=>true;clone.canSeePoint=()=>true;
  clone.walkable=()=>true;clone.obstacleLine=()=>false;
  const enemy=clone.units.find(v=>v.id===e.id),before=enemy.hp;
  clone.gameTime+=1;clone.advanceBoardPassivesV453Dev69();
  assert.ok(enemy.hp<before);
  const hp=enemy.hp;clone.advanceBoardPassivesV453Dev69();
  assert.equal(enemy.hp,hp,'no duplicate projectile or temporal tick on replay');
  snap();
 });
 check('Karthus',team,'perpendicular wall touches end, not caster-to-end ray',({a,u,e,far,ally,cast,tick,snap,zones})=>{
  e.x=.54;e.y=.5;far.x=.52;far.y=.5;
  cast('W',{point:{x:.54,y:.5}});
  const z=zones('m28_karthus_wall')[0];
  assert.ok(z.m41HalfSpan>0);
  assert.ok(a.effectResolverV41().has(e,'slow'),'enemy on the wall has slow');
  assert.equal(a.effectResolverV41().has(far,'slow'),false,
   'unit on the old generic ray but not wall must not be slowed');
  assert.equal(a.effectResolverV41().has(ally,'slow'),false);
  assert.equal(e.m41KarthusWallMR?.sourceId,u.id);
  assert.equal(far.m41KarthusWallMR,undefined);
  tick(1);assert.ok(zones('m28_karthus_wall').length>0);
  snap();
 });
 check('Karthus',team,'MR shred changes actual incoming magic, not physical',({a,u,e,cast,tick,snap})=>{
  e.x=.54;e.y=.5;
  const before=a.damage(e,200,u,'magic','spell');
  e.hp=e.maxHp;
  cast('W',{point:{x:.54,y:.5}});
  const after=a.damage(e,200,u,'magic','spell');
  assert.ok(after>before,'15 percent magic resistance shred must raise magic damage');
  tick(5);
  assert.ok((e.m41KarthusWallMR?.until||0)<a.gameTime,'shred expires');
  snap();
 });
 check('Karthus',team,'entry during wall life and exit after it',({a,e,cast,tick,snap,zones})=>{
  e.x=.52;e.y=.5;
  cast('W',{point:{x:.54,y:.5}});
  assert.equal(e.m41KarthusWallMR,undefined);
  e.x=.54;tick(1);
  assert.ok(e.m41KarthusWallMR?.until>a.gameTime);
  e.x=.52;tick(5);
  assert.equal(zones('m28_karthus_wall').length,0);
  assert.ok(e.m41KarthusWallMR.until<a.gameTime);
  negative++;snap();
 });
 check('Viktor',team,'R interrupts owned Yi channel exactly once',({a,u,e,cast,snap,zones})=>{
  e.champ='MasterYi';e.x=.53;e.y=.5;
  e.m40AuthoredChannelV453={kind:'master_yi_meditate',slot:'W',
   startedAt:a.gameTime,until:a.gameTime+4,
   nextAt:a.gameTime+.5,ticks:0,origin:{x:e.x,y:e.y}};
  e.m29YiMeditateUntil=a.gameTime+4;e.boardChannelUntilV453Dev69=a.gameTime+4;
  const hp=e.hp;
  cast('R',{point:{x:.53,y:.5}});
  assert.ok(e.hp<hp);
  assert.equal(e.m40AuthoredChannelV453,null);
  assert.equal(e.m29YiMeditateUntil,0);
  assert.equal(e.boardChannelUntilV453Dev69,0);
  assert.equal(zones('m28_viktor_storm').length,1);
  snap();
 });
 check('Viktor',team,'one paid cast, recast commands storm under same cooldown',({a,u,e,cast,tick,snap,zones})=>{
  e.x=.53;e.y=.5;
  cast('R',{point:{x:.53,y:.5}});
  const z=zones('m28_viktor_storm')[0],paid=u.mana,cd=u.skillCds.R;
  tick(.1);
  const cmd=cast('R',{point:{x:.57,y:.5}});
  assert.equal(cmd.recast,true);
  assert.equal(cmd.spentMana,0);
  assert.equal(cmd.commandedStormId,z.id);
  assert.equal(u.mana,paid);
  assert.equal(u.skillCds.R,cd);
  assert.ok(z.m41CommandPoint);
  const origin=z.point.x;
  tick(1);
  assert.ok(z.point.x>origin,'the commanded storm must move');
  commands++;snap();
 });
 check('Viktor',team,'queue vs commit storm removed cannot spend',({a,u,cast,tick,queue,resolve,snap,zones})=>{
  cast('R',{point:{x:.53,y:.5}});
  tick(.1);const mana=u.mana,cd=u.skillCds.R;
  assert.equal(queue('R',{point:{x:.54,y:.5}}).ok,true);
  a.boardTemporalV453Dev69=a.boardTemporalV453Dev69.filter(z=>z.kind!=='m28_viktor_storm');
  const denied=resolve();
  assert.equal(denied.ok,false);
  assert.equal(denied.reason,'m41_viktor_command_lost_before_commit');
  assert.equal(u.mana,mana);assert.equal(u.skillCds.R,cd);
  negative++;snap();
 });
 check('Viktor',team,'storm cannot track unseen target or move through collision',({a,u,e,cast,tick,snap,zones})=>{
  e.x=.58;e.y=.5;
  cast('R',{point:{x:.54,y:.5}});
  const z=zones('m28_viktor_storm')[0],x=z.point.x;
  a.visible=(team,v)=>v.id!==e.id;
  tick(1);
  assert.equal(z.point.x,x,'storm must not automatically know hidden position');
  a.visible=()=>true;a.obstacleLine=(from,to)=>to?.id===e.id||to?.x>x;
  tick(1);
  assert.equal(z.point.x,x,'blocked storm must not phase through terrain');
  negative++;snap();
 });
}
for(const f of errors)console.error('M41_SPATIAL_FAIL',JSON.stringify(f));
console.log('M41_B01_SPATIAL '+JSON.stringify({scenarios:cases,expected:20,
 seats:2,snapshots:snaps,negative,commands,
 certifiedKits:0,legacyDebt:buildM35B01WorkQueue().metrics.unresolvedLegacyTags,
 failures:errors.length}));
assert.equal(errors.length,0);
assert.equal(cases,20);
assert.equal(snaps,20);
