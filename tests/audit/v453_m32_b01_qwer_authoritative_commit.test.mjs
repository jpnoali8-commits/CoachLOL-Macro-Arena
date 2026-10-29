/**
 * M32 B01: 35 distinct P+QWER queue→server-commit interruption gates, both
 * human PvP seats, plus bespoke recast/charge/mark race scenarios.
 * This tests execution integrity, NEVER claims full champion certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,BOARD_M20_B01_V453,checksumV40} from '../../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const CHAMPS=Object.keys(BOARD_M20_B01_V453).sort(),SLOTS=['Q','W','E','R'],TEAMS=['blue','red'];
assert.equal(CHAMPS.length,35);
const metrics={champions:35,qwerSlots:140,seats:2,queued:0,ccDenied:0,
 noDebit:0,replays:0,markRace:0,chargeRace:0,rellForms:0,failed:0,certified:0};
const failures=[];
function setup(champ,team){
 const foe=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:320032,mode:'pvp',
  draft:{[team]:{MID:champ},[foe]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{
  x:.08,y:.08,hp:3500,maxHp:3500,autoFollow:false,autoAttack:false,
  autoJungle:false,autoFarm:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===foe+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:3500,maxHp:3500,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.511,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(ally,{x:.508,y:.5,hp:3000,maxHp:3500});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const snap=()=>{const v=a.snapshotV40();assert.equal(checksumV40(v),
  checksumV40(Arena.fromSnapshotV40(map,mask,v).snapshotV40()));metrics.replays++};
 const capture=()=>{let result;const orig=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,q)=>(result=orig(actor,q));
  a.resolveBoardSkillsV453Dev69();a.executeBoardSkillV453Dev69=orig;return result;};
 return {a,u,e,ally,team,foe,snap,capture};
}
function optsFor(rule,champ,slot,e,ally){
 if(champ==='Lucian'&&slot==='Q')return {targetId:e.id};
 if(rule.m24Devour){e.m24TasteV453={};}
 const shape=rule.shape;
 if(shape==='target_enemy'||shape==='target_any')return {targetId:e.id};
 if(shape==='target_ally')return {targetId:ally.id};
 if(['circle_enemy','line_enemy','cone_enemy','move_point','vision_point','deploy_point']
  .includes(shape)&&!rule.originSelf)return {point:{x:.515,y:.5}};
 return {};
}
function readyMark(s,u,e,a){
 if(s.m20MarkRequired)
  (e.m20MarksV453??={})[s.m20MarkRequired+'_'+u.id]=a.gameTime+10;
 if(s.m21FrostRequired){
  e.m21FrostV453={sourceId:u.id,stacks:4,until:a.gameTime+10};
  (e.m20MarksV453??={})['frost_'+u.id]=a.gameTime+10;
 }
 if(s.m24Devour)(e.m24TasteV453??={})[u.id]={stacks:3,until:a.gameTime+10};
 if(s.m20OrbConsume||s.m20OrbConsumeAll)
  u.m20SyndraOrbsV453=[{x:.51,y:.5,until:a.gameTime+10}];
 if(s.m20Rewind){u.skillCds.Q=a.gameTime+30;u.skillCds.E=a.gameTime+30;}
}
function test(label,fn){try{fn()}catch(err){metrics.failed++;failures.push({label,error:String(err?.stack||err)})}}
for(const champ of CHAMPS)for(const slot of SLOTS)for(const team of TEAMS)
 test(champ+' '+slot+' '+team,()=>{
  const {a,u,e,ally,snap,capture}=setup(champ,team);
  const rule=BOARD_M20_B01_V453[champ][slot];
  readyMark(rule,u,e,a);
  const order=a.queueBoardSkillV453Dev69(team,u.id,slot,optsFor(rule,champ,slot,e,ally));
  assert.equal(order?.ok,true,champ+slot+team+' queue '+JSON.stringify(order));metrics.queued++;
  // Opponent can commit CC during same simultaneous board phase. An ability
  // disabled at resolution must not fire or get charged for a queued intent.
  const cc=a.applyEffectV41(u,'stun',{source:e,duration:4,key:'m32_counter_'+u.id});
  assert.equal(cc.ok,true,'opponent must be able to stun caster');
  assert.equal(a.effectResolverV41().has(u,'stun'),true);
  const mana=u.mana,cd={...u.skillCds},ehp=e.hp,
   bSummons=a.boardSummonsV453Dev69.length,bTemporal=a.boardTemporalV453Dev69.length;
  const r=capture();
  assert.equal(r?.ok,false,'stunned ability executed: '+JSON.stringify(r));metrics.ccDenied++;
  assert.equal(u.mana,mana,'denied spell spent mana');
  assert.deepEqual(u.skillCds,cd,'denied spell spent cooldown');
  assert.equal(e.hp,ehp,'denied spell still dealt damage');
  assert.equal(a.boardSummonsV453Dev69.length,bSummons,'denied spell spawned entity');
  assert.equal(a.boardTemporalV453Dev69.length,bTemporal,'denied spell scheduled hit');
  metrics.noDebit++;snap();
 });
for(const team of TEAMS){
 test(team+' Sejuani E: Frost consumed during simultaneous orders',()=>{
  const {a,u,e,snap,capture}=setup('Sejuani',team);const s=BOARD_M20_B01_V453.Sejuani.E;
  readyMark(s,u,e,a);
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'E',{targetId:e.id}).ok,true);
  e.m21FrostV453=null;
  const mana=u.mana,cd=u.skillCds.E,r=capture();
  assert.equal(r?.reason,'m32_frost_expired_before_commit');
  assert.equal(u.mana,mana);assert.equal(u.skillCds.E,cd);metrics.markRace++;snap();
 });
 test(team+' Tahm R: victim lost three Taste stacks',()=>{
  const {a,u,e,snap,capture}=setup('TahmKench',team);
  e.m24TasteV453={[u.id]:{until:a.gameTime+9,stacks:3}};
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'R',{targetId:e.id}).ok,true);
  e.m24TasteV453[u.id]=null;
  const mana=u.mana,cd=u.skillCds.R,r=capture();
  assert.equal(r?.reason,'m32_devour_mark_expired_before_commit');
  assert.equal(u.mana,mana);assert.equal(u.skillCds.R,cd);
  assert.equal(e.m24DevouredByV453??null,null);metrics.markRace++;snap();
 });
 test(team+' Mel R: owner Overwhelm mark lost before resolution',()=>{
  const {a,u,e,snap,capture}=setup('Mel',team);
  e.m20MarksV453={['overwhelm_'+u.id]:a.gameTime+8};
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'R').ok,true);
  delete e.m20MarksV453['overwhelm_'+u.id];
  const mana=u.mana,cd=u.skillCds.R,r=capture();
  assert.equal(r?.reason,'m32_global_mark_expired_before_commit');
  assert.equal(u.mana,mana);assert.equal(u.skillCds.R,cd);metrics.markRace++;snap();
 });
 for(const [champ,slot,point,after] of [
  ['Vi','Q',.526,.489],['Zac','E',.535,.49],
  ['Xerath','Q',.558,.47],['Varus','Q',.558,.47]
 ]){
  test(team+' '+champ+' charged ability release checks current actor range',()=>{
   const {a,u,snap,capture}=setup(champ,team);
   const order=a.queueBoardSkillV453Dev69(team,u.id,slot,
    {point:{x:point,y:.5},chargeSeconds:0});
   assert.equal(order.ok,true,champ+' queued charged order '+JSON.stringify(order));
   u.x=after;
   const mana=u.mana,cd=u.skillCds[slot],r=capture();
   assert.equal(r?.ok,false,'out-of-range charged release executed');
   assert.equal(u.mana,mana);assert.equal(u.skillCds[slot],cd);
   metrics.chargeRace++;snap();
  });
 }
 test(team+' Rell W: Crash Down and Mount Up are distinct',()=>{
  const {a,u,e,snap,capture}=setup('Rell',team);
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'W',{point:{x:.514,y:.5}}).ok,true);
  assert.equal(capture().ok,true);
  assert.equal(u.m31RellLastWMode,'crash_down');
  assert.equal(u.m25RellMounted,false);
  a.gameTime=11;a.round++;a.actionLocksV40={};u.skillCds.W=0;
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'W',{point:{x:.515,y:.5}}).ok,true);
  assert.equal(capture().ok,true);
  assert.equal(u.m31RellLastWMode,'mount_up');
  assert.equal(u.m25RellMounted,true);metrics.rellForms++;snap();
 });
}
for(const f of failures)console.error('M32_AUTHORITATIVE_FAIL',JSON.stringify(f));
console.log('M32_B01_35_QWER_COMMIT_QA '+JSON.stringify(metrics));
assert.equal(metrics.failed,0);assert.equal(metrics.queued,280);
assert.equal(metrics.ccDenied,280);assert.equal(metrics.noDebit,280);
assert.equal(metrics.markRace,6);assert.equal(metrics.chargeRace,8);
assert.equal(metrics.rellForms,2);
