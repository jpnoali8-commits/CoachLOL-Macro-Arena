/** M38: 32 already-proven legacy tags retired + distinct PvP edge cases.
 * Retired historic labels DO NOT certify individual full skills or kits.
 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Arena,checksumV40,BOARD_M20_B01_V453} from '../../engine.mjs';
import {buildM35B01WorkQueue} from '../../tools/skills_m35_b01_cohort_work_queue.mjs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const raw=path=>JSON.parse(readFileSync(new URL(path,import.meta.url)));
const map=raw('../../data/coachlol_map_v6.json');
const mask=raw('../../data/masks_128.json');
const debt=raw('../../docs/skills_macro_batches_dev69/M38_B01_RETIREMENT_EVIDENCE.json');
assert.equal(debt.schema,'coachlol.skills.m38-debt-evidence.v1');
assert.equal(debt.entries.length,32);
assert.equal(new Set(debt.entries.map(x=>x.champion+':'+x.slot)).size,32);
for(const {champion,slot,legacyTag,nativeFlag,proofTest} of debt.entries){
 const skill=BOARD_M20_B01_V453[champion]?.[slot];
 assert.ok(skill,'missing '+champion+slot);
 assert.ok(skill[nativeFlag],'native behavior flag missing '+champion+slot);
 assert.equal(skill.m20Missing,undefined,'debt not retired '+champion+slot+': '+legacyTag);
 assert.ok(existsSync(resolve(dir,'../..',proofTest)),proofTest+' must execute in CI');
 assert.equal(skill.m20Status,'partial_executable','historical retirement cannot certify skill');
}
const q=buildM35B01WorkQueue();
assert.deepEqual([q.metrics.champions,q.metrics.passives,q.metrics.qwer,
 q.metrics.slotsWithNativeHooks,q.metrics.unresolvedLegacyTags,q.metrics.certifiedKits],
 [35,35,140,140,20,0],'M38 cannot fake full kit certification');

const failed=[],stats={championsAudited:35,retired:32,remaining:20,
 newRealBehaviors:2,seats:2,scenarios:0,snapshots:0,casts:0,negative:0,certifiedKits:0};
function setup(champ,team){
 const otherTeam=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:383838,mode:'pvp',
  draft:{[team]:{MID:champ},[otherTeam]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:5000,maxHp:5000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===otherTeam+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP'),
  adc=a.units.find(v=>v.id===team+'_ADC'),
  far=a.units.find(v=>v.id===otherTeam+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:5000,maxHp:5000,mana:10000,maxMana:10000,
  level:16,skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(ally,{x:.51,y:.5,range:.01});
 Object.assign(adc,{x:.51,y:.5,range:.05});
 Object.assign(far,{x:.08,y:.08,hp:14000,maxHp:14000});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,p={})=>{
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,p);
  assert.equal(queued?.ok,true,champ+' '+slot+' queue '+JSON.stringify(queued));
  let committed;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,q)=>(committed=original(v,q));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original}
  assert.equal(committed?.ok,true,champ+' '+slot+' receipt '+JSON.stringify(committed));
  stats.casts++;return committed;
 };
 const snap=()=>{
  const state=a.snapshotV40(),repeat=Arena.fromSnapshotV40(map,mask,state).snapshotV40();
  assert.equal(checksumV40(state),checksumV40(repeat));
  stats.snapshots++;
 };
 return {a,u,e,ally,adc,far,team,otherTeam,cast,snap};
}
function test(champ,team,label,fn){
 try{fn(setup(champ,team));stats.scenarios++}
 catch(error){failed.push({champ,team,label,error:String(error?.stack||error)})}
}
for(const team of ['blue','red']){
 test('Syndra',team,'real minion throw',({a,u,e,otherTeam,cast,snap})=>{
  a.minions=[];const m={id:'m38_enemy_throw_'+team,kind:'melee',
   team:otherTeam,lane:'mid',x:.508,y:.5,hp:600,maxHp:600,armor:0,mr:0,
   path:[]};
  a.minions.push(m);
  const hp=e.hp;
  cast('W',{point:{x:.522,y:.5}});
  assert.equal(u.m38SyndraLastThrow?.kind,'minion');
  assert.equal(u.m38SyndraLastThrow?.id,m.id);
  assert.equal(m.x,.522,'actual enemy minion relocated at the target destination');
  assert.equal(m.m38SyndraThrown?.ownerId,u.id);
  assert.ok(e.hp<hp,'throw impact still dealt W damage');
  snap();
 });
 test('Syndra',team,'owned sphere preferred over minion',({a,u,otherTeam,cast,snap})=>{
  a.minions=[];
  const m={id:'m38_spare_'+team,kind:'melee',team:otherTeam,
   lane:'mid',x:.511,y:.5,hp:600,maxHp:600};
  a.minions.push(m);
  u.m20SyndraOrbsV453=[{x:.506,y:.5,until:a.gameTime+8}];
  cast('W',{point:{x:.522,y:.5}});
  assert.equal(u.m38SyndraLastThrow?.kind,'sphere');
  assert.equal(m.x,.511,'cannot also teleport a minion when a sphere was thrown');
  assert.equal(u.m20SyndraOrbsV453[0].x,.522);
  snap();
 });
 test('Sett',team,'grit decay on simulated time',({a,u,e,snap})=>{
  const hit=a.damage(u,300,e,'physical','basic');
  assert.ok(hit>0);
  const amount=u.m23GritV453?.value;
  assert.ok(amount>0&&amount<=hit);
  a.gameTime+=4;a.advanceBoardPassivesV453Dev69();
  assert.equal(u.m23GritV453.value,amount,'grit remains full before five seconds');
  a.gameTime+=2;a.advanceBoardPassivesV453Dev69();
  assert.ok(u.m23GritV453.value<amount,'grit decays after five seconds');
  const decayed=u.m23GritV453.value;
  a.advanceBoardPassivesV453Dev69();
  assert.equal(u.m23GritV453.value,decayed,'same-tick advances do not double-decay');
  snap();
 });
 test('Sett',team,'Q retains distinct percent max hp basic followup',
 ({a,u,e,far,cast,snap})=>{
  far.x=.522;far.y=.5;
  const before=e.hp,farBefore=far.hp;
  cast('Q');
  a.damage(e,60,u,'physical','basic');
  a.damage(far,60,u,'physical','basic');
  const first=before-e.hp,second=farBefore-far.hp;
  assert.ok(first>60,'first target takes real Q on-hit packet');
  assert.ok(second>first,'higher max-HP target takes larger Q on-hit packet');
  assert.equal(u.boardNextBasicV453Dev69,null,'two Q charges consumed, no free third proc');
  snap();
 });
 test('Sejuani',team,'ally melee basics supply owned Frost and E consume',
 ({a,u,e,ally,cast,snap})=>{
  for(let i=0;i<4;i++){
   const hit=a.damage(e,30,ally,'physical','basic');
   assert.ok(hit>0);
   a.gameTime++;
  }
  assert.equal(e.m21FrostV453?.sourceId,u.id);
  assert.equal(e.m21FrostV453?.stacks,4);
  cast('E',{targetId:e.id});
  assert.ok(!e.m21FrostV453,'Sejuani E consumes her four actual frost stacks');
  snap();
 });
 test('Sejuani',team,'ranged allied basic cannot forge melee frost',
 ({a,u,e,adc,team:seat,snap})=>{
  for(let i=0;i<4;i++){a.damage(e,30,adc,'physical','basic');a.gameTime++}
  assert.ok(!e.m21FrostV453?.sourceId,'ranged ADC cannot grant Sejuani frost');
  const beforeMana=u.mana,queued=a.queueBoardSkillV453Dev69(seat,u.id,'E',{targetId:e.id});
  assert.equal(queued.ok,false,'no unauthorized ice prison');
  assert.equal(u.mana,beforeMana);
  stats.negative++;
  snap();
 });
}
for(const f of failed)console.error('M38_REAL_DEBT_FAIL',JSON.stringify(f));
console.log('M38_B01_RETIREMENT_AND_RUNTIME '+JSON.stringify({...stats,failed:failed.length}));
assert.equal(failed.length,0);
assert.equal(stats.scenarios,12);
assert.equal(stats.snapshots,12);
