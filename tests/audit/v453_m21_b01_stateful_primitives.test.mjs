/**
 * M21/B01: authoritative second-stage actions and passives, both PvP seats.
 * These tests demand gameplay state transitions, denial on fog/range, single
 * resource commits, exact tick scheduling and deterministic checkpoint restore.
 * They do not certify the 35 LoL champion kits.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
let count=0;const cases=[];
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:20269321,mode:'pvp',
  draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:2500,maxHp:2500,
  autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false,combatUntil:0});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP'),
  e2=a.units.find(v=>v.id===other+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:2000,maxHp:2500,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:2500,maxHp:2500,armor:0,mr:0});
 Object.assign(e2,{x:.516,y:.5,hp:2500,maxHp:2500});
 Object.assign(ally,{x:.511,y:.5,hp:1200,maxHp:2500});
 a.canSeePoint=()=>true;a.visible=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,opts={})=>{
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(queued.ok,true,champ+' '+slot+' queue '+queued.reason);
  let result=null;
  const exec=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,q)=>result=exec(actor,q);
  a.resolveBoardSkillsV453Dev69();
  a.executeBoardSkillV453Dev69=exec;
  assert.equal(result?.ok,true,champ+' '+slot+' execute '+JSON.stringify(result));
  return {queued,result};
 };
 return {a,u,e,e2,ally,team,other,cast};
}
function snapshot(a){
 const state=a.snapshotV40();
 assert.equal(checksumV40(Arena.fromSnapshotV40(map,mask,state).snapshotV40()),checksumV40(state));
}
function check(name,fn){fn();cases.push(name);count++;}
for(const team of ['blue','red']){
 check(team+' LeeSin Q first hit then Q2, no second cost',()=>{
  const {a,u,e,cast}=fixture('LeeSin',team);
  cast('Q',{point:{x:.53,y:.5}});
  assert.equal(u.m21SonicRecastV453?.targetId,e.id);
  const mana=u.mana,cd=u.skillCds.Q,hp=e.hp,at={x:u.x,y:u.y};
  const {queued,result}=cast('Q',{targetId:e.id});
  assert.equal(queued.recast,true);
  assert.equal(result.spentMana,0);
  assert.equal(u.mana,mana);assert.equal(u.skillCds.Q,cd);
  assert.ok(e.hp<hp,'Q2 missing-health damage did not apply');
  assert.notDeepEqual({x:u.x,y:u.y},at);
  assert.equal(u.m21SonicRecastV453,null);
  const snap=a.snapshotV40();snapshot(a);
  const hpAfter=e.hp;a.resolveBoardSkillsV453Dev69();assert.equal(e.hp,hpAfter);
 });
 check(team+' LeeSin Q2 cannot retarget or reveal through fog',()=>{
  const {a,u,e,e2,cast}=fixture('LeeSin',team);
  cast('Q',{point:{x:.53,y:.5}});
  const mark=u.m21SonicRecastV453;assert.equal(mark.targetId,e.id);
  const wrong=a.queueBoardSkillV453Dev69(team,u.id,'Q',{targetId:e2.id});
  assert.equal(wrong.ok,false);assert.equal(wrong.reason,'recast_alvo_divergente');
  const mana=u.mana,cd=u.skillCds.Q;
  a.visible=()=>false;
  const hidden=a.queueBoardSkillV453Dev69(team,u.id,'Q',{targetId:e.id});
  assert.equal(hidden.ok,false);
  assert.equal(u.mana,mana);assert.equal(u.skillCds.Q,cd);
  a.visible=()=>true; a.gameTime=3.1;
  const expired=a.queueBoardSkillV453Dev69(team,u.id,'Q',{targetId:e.id});
  assert.equal(expired.ok,false,'expired Q2 incorrectly bypassed cooldown');
  snapshot(a);
 });
 check(team+' Gragas Q early manual detonation without duplicate charge',()=>{
  const {a,u,e,cast}=fixture('Gragas',team);
  const hp=e.hp;cast('Q',{point:{x:.515,y:.5}});
  assert.equal(e.hp,hp,'barrel dealt damage before activation');
  assert.equal(a.boardTemporalV453Dev69.filter(z=>z.kind==='m21_gragas_barrel').length,1);
  const mana=u.mana,cd=u.skillCds.Q;
  const {result}=cast('Q');
  assert.equal(result.spentMana,0);
  assert.equal(u.mana,mana);assert.equal(u.skillCds.Q,cd);
  assert.ok(e.hp<hp,'manual detonation did not deal damage');
  assert.equal(a.boardTemporalV453Dev69.filter(z=>z.kind==='m21_gragas_barrel').length,0);
  const after=e.hp;a.gameTime=4.2;a.advanceBoardTemporalV453Dev69();assert.equal(e.hp,after);
  snapshot(a);
 });
 check(team+' Gragas Q fuse detonation after world tick',()=>{
  const {a,u,e,cast}=fixture('Gragas',team);
  const hp=e.hp;cast('Q',{point:{x:.515,y:.5}});
  a.gameTime=3.9;a.advanceBoardTemporalV453Dev69();assert.equal(e.hp,hp);
  snapshot(a);a.gameTime=4.1;a.advanceBoardTemporalV453Dev69();
  assert.ok(e.hp<hp);assert.equal(a.boardTemporalV453Dev69.some(z=>z.kind==='m21_gragas_barrel'),false);
  const after=e.hp;a.advanceBoardTemporalV453Dev69();assert.equal(e.hp,after);
 });
 check(team+' Braum 4-hit passive via ally basic and lockout',()=>{
  const {a,u,e,ally,cast}=fixture('Braum',team);
  cast('Q',{point:{x:.53,y:.5}});
  const mark=e.m21BraumConcussiveV453;assert.equal(mark.stacks,1);
  for(let i=0;i<3;i++)a.damage(e,25,ally,'physical','basic');
  assert.equal(mark.stacks,0);assert.ok(mark.lockUntil>a.gameTime);
  assert.equal(a.effectResolverV41().has(e,'stun'),true,'four hits did not stun');
  // Lock prevents an immediate new stack even after another Braum Q.
  u.skillCds.Q=0;cast('Q',{point:{x:.53,y:.5}});
  assert.equal(mark.stacks,0);
  snapshot(a);
 });
 check(team+' Zilean lethal Chronoshift stasis and single revive',()=>{
  const {a,u,e,ally,cast}=fixture('Zilean',team);
  cast('R',{targetId:ally.id});
  const buff=ally.m21ChronoshiftV453;assert.ok(buff?.until>a.gameTime);
  snapshot(a);
  const damage=a.damage(ally,9999,e,'true','spell');
  assert.ok(damage>0);assert.equal(ally.hp,1);
  assert.ok(ally.m21ChronoshiftV453?.pendingAt>a.gameTime);
  assert.equal(a.effectResolverV41().has(ally,'stasis'),true);
  const blocked=a.damage(ally,900,e,'true','spell');assert.equal(blocked,0);
  a.gameTime=1.6;a.advanceBoardPassivesV453Dev69();
  assert.ok(ally.hp>1,'revive heal missing');
  assert.equal(ally.m21ChronoshiftV453,null);
  snapshot(a);
  a.damage(ally,9999,e,'true','spell');assert.equal(ally.hp,0,'Chronoshift triggered twice');
 });
 check(team+' KogMaw Icathian Surprise after death, no repeat',()=>{
  const {a,u,e,cast}=fixture('KogMaw',team);
  // Victim Kog'Maw dies; only afterwards can the corpse explode.
  const initial=e.hp; a.damage(u,9999,e,'true','spell');
  assert.equal(u.hp,0);assert.equal(e.hp,initial);
  assert.ok(u.m21KogDeathV453?.explodeAt>a.gameTime);
  snapshot(a);
  a.gameTime=3.9;a.advanceBoardPassivesV453Dev69();assert.equal(e.hp,initial);
  a.gameTime=4.1;a.advanceBoardPassivesV453Dev69();
  assert.ok(e.hp<initial,'corpse passive did not explode');
  assert.equal(u.m21KogDeathV453,null);
  const after=e.hp;a.advanceBoardPassivesV453Dev69();assert.equal(e.hp,after);
  snapshot(a);
 });
 check(team+' expired Chronoshift cannot prevent death',()=>{
  const {a,u,e,ally,cast}=fixture('Zilean',team);
  cast('R',{targetId:ally.id});a.gameTime=5.1;
  a.advanceBoardPassivesV453Dev69();
  assert.equal(ally.m21ChronoshiftV453,null);
  a.damage(ally,9999,e,'true','spell');assert.equal(ally.hp,0);
  snapshot(a);
 });
}
console.log('M21_B01_STATEFUL_QA '+JSON.stringify({
 cases:count,teamSeats:2,zeroFalseCertifications:true,names:cases}));
assert.equal(count,16);
