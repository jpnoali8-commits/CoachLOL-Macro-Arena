/**
 * M20 / B01 matrix. 35 distinct champions x QWER x two human PvP teams.
 * Validates actual queue->commit->effect and snapshot equality, NOT official
 * 1:1 LoL passives/recasts/transformations. No false COMPLETE status.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,abilityRule,BOARD_M20_B01_V453,checksumV40} from '../../engine.mjs';
const data=name=>JSON.parse(readFileSync(new URL('../../data/'+name,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const expected='Corki Cassiopeia Karthus Seraphine Xerath Zac Zilean Yunara Alistar Gragas LeeSin Lulu Mel Rell Sejuani Sett TahmKench Galio Locke Lucian Milio Quinn Syndra Urgot Varus Viktor Fizz JarvanIV MasterYi Shen Vi Braum Heimerdinger Kassadin KogMaw'.split(' ');
assert.deepEqual(Object.keys(BOARD_M20_B01_V453).sort(),expected.sort());
const slots=['Q','W','E','R'];
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:20269320,mode:'pvp',
  draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{
  x:.08,y:.08,hp:2000,maxHp:2000,autoAttack:false,autoFollow:false,
  autoFarm:false,autoJungle:false,deadUntil:0,combatUntil:0});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,team,x:.5,y:.5,level:16,hp:1400,maxHp:2000,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.508,y:.5,level:16,hp:2000,maxHp:2000,armor:0,mr:0});
 Object.assign(ally,{x:.503,y:.5,hp:1100,maxHp:2000});
 a.canSeePoint=()=>true;a.visible=()=>true;a.walkable=()=>true;
 a.obstacleLine=()=>false;
 return {a,u,e,ally};
}
let count=0,proofCount=0,snapshots=0;const failures=[];
for(const champ of expected)for(const slot of slots)for(const team of ['blue','red']){
 try{
  const {a,u,e,ally}=fixture(champ,team);
  const s=BOARD_M20_B01_V453[champ][slot];
  assert.equal(s.m20Status,'partial_executable',champ+slot+' must remain uncertified');
  assert.equal(abilityRule(u,slot),s,'registry must reach actual cast dispatcher');
  // Setup legitimate prior marks for skills whose rules require them.
  if(s.m20MarkRequired)e.m20MarksV453={[s.m20MarkRequired+'_'+u.id]:a.gameTime+10};
  if(s.m21FrostRequired)e.m21FrostV453={sourceId:u.id,stacks:4,until:a.gameTime+10};
  // M24: Devour an enemy only after three valid Taste stacks; ally R needs none.
  if(s.m24Devour)e.m24TasteV453={[u.id]:{stacks:3,until:a.gameTime+10}};
  if(s.m20OrbConsume||s.m20OrbConsumeAll)
   u.m20SyndraOrbsV453=[{x:.51,y:.5,until:a.gameTime+10}];
  if(s.m20Rewind){u.skillCds.Q=a.gameTime+30;u.skillCds.E=a.gameTime+30;}
  const before={
   mana:u.mana,cd:u.skillCds[slot]||0,enemyHp:e.hp,
   enemyFx:e.statusEffectsV41?.length||0,allyHp:ally.hp,
   allyFx:ally.statusEffectsV41?.length||0,
   selfFx:u.statusEffectsV41?.length||0,
   x:u.x,y:u.y,summons:a.boardSummonsV453Dev69.length,
   vision:a.boardVisionV453Dev69.length,
   cds:{...u.skillCds},orbs:u.m20SyndraOrbsV453?.length||0
  };
  const opts=['target_enemy','target_any'].includes(s.shape)?{targetId:e.id}:
   ['target_ally'].includes(s.shape)?{targetId:ally.id}:
   ['circle_enemy','line_enemy','cone_enemy','move_point','vision_point','deploy_point'].includes(s.shape)&&
    !s.originSelf?{point:{x:.51,y:.5}}:{};
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(queued.ok,true,'queue '+champ+' '+slot+' '+team+': '+queued.reason);
  assert.equal(u.mana,before.mana,'queue must not charge mana early');
  let execution;
  const originalExecute=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,payload)=>{
   execution=originalExecute(actor,payload);
   return execution;
  };
  a.resolveBoardSkillsV453Dev69();
  assert.equal(execution?.ok,true,
   'executor rejected '+champ+slot+' '+team+': '+JSON.stringify(execution));
  assert.ok(u.skillCds[slot]>a.gameTime||u.mana<before.mana,
   'commit did not charge cooldown or resource: '+JSON.stringify({
    execution,slot,now:a.gameTime,cd:u.skillCds[slot],mana:u.mana,previous:before.mana}));
  const changed=e.hp!==before.enemyHp||
   (e.statusEffectsV41?.length||0)>before.enemyFx||
   ally.hp!==before.allyHp||(ally.statusEffectsV41?.length||0)>before.allyFx||
   (u.statusEffectsV41?.length||0)>before.selfFx||
   !!u.boardNextBasicV453Dev69||!!u.boardSpeedV453Dev69||
   u.x!==before.x||u.y!==before.y||
   a.boardSummonsV453Dev69.length>before.summons||
   a.boardVisionV453Dev69.length>before.vision||
   (u.m20SyndraOrbsV453?.length||0)!==before.orbs||
   (s.m20Rewind&&(u.skillCds.Q<before.cds.Q||u.skillCds.E<before.cds.E))||
   a.boardTemporalV453Dev69.some(v=>v.ownerId===u.id)||
   !!ally.m21ChronoshiftV453||!!u.m23HeimerEmpowerV453||
   // Fizz E has an authoritative untargetable phase, damage only on landing.
   !!u.m24FizzLeapV453||!!u.m24DevourV453;
  assert.ok(changed,'no gameplay effect after actual cast '+champ+' '+slot+' '+team);
  proofCount++;
  // Re-entry must not double-charge/double-apply the already drained queue.
  const digest=checksumV40(a.snapshotV40());
  a.resolveBoardSkillsV453Dev69();
  assert.equal(checksumV40(a.snapshotV40()),digest,'resolve replay duplicated effects');
  if(slot==='R'){
   const state=a.snapshotV40(),restored=Arena.fromSnapshotV40(map,mask,state);
   assert.equal(checksumV40(restored.snapshotV40()),checksumV40(state),'snapshot divergence');
   snapshots++;
  }
  count++;
 }catch(e){failures.push({champ,slot,team,error:String(e?.stack||e)});}
}
for(const f of failures.slice(0,20))console.error('M20_B01_FAIL',JSON.stringify(f));
console.log('M20_B01_QA',JSON.stringify({champions:expected.length,slots:expected.length*4,
 teamSeats:2,expectedCasts:expected.length*4*2,confirmedCasts:count,effectsVerified:proofCount,
 snapshotReplays:snapshots,failures:failures.length,certifiedChampions:0,
 caution:'B01 board adaptation is not passives/recasts/global LoL parity'}));
assert.equal(failures.length,0,'M20 B01 matrix failed');
assert.equal(count,280);assert.equal(proofCount,280);assert.equal(snapshots,70);
