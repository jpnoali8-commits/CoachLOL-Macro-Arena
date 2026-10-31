#!/usr/bin/env node
/** CoachLOL M45 B02 Skills S18.
 * Real ORIGINAL Arena + original PvPRoom + original gateway source,
 * original skills-batch2 @ f0b1147ac46e585a1d5374a178b1ea462f5dc278.
 * Intentional legacy vulnerability witness: room.view()->publicInfo()
 * exposes private stable enemyId during pending combat reaction, even though
 * Arena.perspective() has the proper appearance_... alias.
 * This PASS identifies actual frozen-source bugs; NOT acceptable Rust parity.
 * Synthetic controlled vision and pendingDecision method, no HTTP/real fight.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../../../engine.mjs';
import {PvPRoomV453Dev47} from '../../../../multiplayer/room_v453_dev47.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const roles=['MID','TOP','JG','ADC','SUP'];
const opposite=t=>t==='blue'?'red':'blue';
function participants(){
 return [{seatId:'p1',team:'blue',role:'MID',unitId:'blue_MID',tokenHash:'test-only-blue'},
         {seatId:'p2',team:'red',role:'MID',unitId:'red_MID',tokenHash:'test-only-red'}];
}
function sourceFixture(defendingTeam){
 const sourceTeam=opposite(defendingTeam);
 const a=new Arena(map,mask,{seed:1818,mode:'pvp',
  draft:{[sourceTeam]:{TOP:'Neeko',MID:'Shaco'},[defendingTeam]:{MID:'Ahri'}}});
 for(const u of a.units)Object.assign(u,{
  x:.08,y:.08,autoAttack:false,autoFarm:false,autoJungle:false,autoFollow:false});
 const neeko=a.units.find(u=>u.id===sourceTeam+'_TOP'),
  shaco=a.units.find(u=>u.id===sourceTeam+'_MID'),
  defender=a.units.find(u=>u.id===defendingTeam+'_MID');
 for(const u of [neeko,shaco,defender])Object.assign(u,{
  level:6,hp:1500,maxHp:1500,mana:1000,maxMana:1000,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(neeko,{x:.52,y:.5});
 Object.assign(shaco,{x:.53,y:.5});
 Object.assign(defender,{x:.5,y:.5});
 a.canSeePoint=()=>true;
 assert.equal(a.queueNeekoDisguiseV453M15(sourceTeam,neeko.id,shaco.id).ok,true);
 assert.equal(a.queueKitSkillV42(sourceTeam,shaco.id,'R',{x:.54,y:.5}).ok,true);
 a.resolveBoardSkillsV453Dev69();
 a.gameTime=1;
 const clone=a.boardSummonsV453Dev69.find(s=>s.kind==='shaco_clone');
 assert.ok(clone);
 const room=new PvPRoomV453Dev47({id:'m45_s18',arena:a,maxSeats:2,
  restored:{players:participants()}});
 const defendingPlayer=room.players.find(p=>p.team===defendingTeam);
 return {a,room,defendingPlayer,defendingTeam,sourceTeam,
  neeko,shaco,defender,clone};
}
function snapshotRoom(f){
 const snapshot=f.a.snapshotV40();
 const loaded=Arena.fromSnapshotV40(map,mask,snapshot);
 loaded.canSeePoint=()=>true;
 assert.equal(checksumV40(snapshot),checksumV40(loaded.snapshotV40()),
  'full original arena checkpoint lossless');
 const room=new PvPRoomV453Dev47({id:'m45_s18',arena:loaded,maxSeats:2,
  restored:{players:participants(),gateway:f.room.gateway.exportSession()}});
 const p=room.players.find(x=>x.team===f.defendingTeam);
 return {arena:loaded,room,player:p};
}
function teamProjectionsIsolation(f,view){
 // Explicit source ledger fixtures: proof of filtering behavior, NOT a
 // claim that these objective/teamfight records arose from an actual match.
 const a=f.a,foo={time:1,objective:'dragon',owner:f.sourceTeam,
  finisherId:f.neeko.id,participants:[f.neeko.id],damageByActor:{[f.neeko.id]:500}};
 const prior=a.objectiveLedgerV44||[];
 a.objectiveLedgerV44=[...prior,foo];
 const witness=a.perspective(f.defendingTeam);
 assert.ok(!witness.objectiveLedger.some(v=>v.finisherId===f.neeko.id),
  'enemy objective contributor ledger does not leak through perspective');
 a.objectiveLedgerV44=prior;
 assert.ok(Array.isArray(witness.teamfights));
 assert.ok(Number.isFinite(witness.team.kills));
 assert.ok(!Object.prototype.hasOwnProperty.call(view.projection,'actionJournalV40'),
  'internal debug journal not sent through room projection');
 assert.ok(!Object.prototype.hasOwnProperty.call(view.projection,'lastTacticalAlerts'),
  'internal tactical alerts not sent through room projection');
 assert.ok(!Object.prototype.hasOwnProperty.call(view.projection,'pendingDecision'),
  'room decision is top-level metadata, not projection property');
}
function witness(f,targetType){
 const {a,room,defendingPlayer,defender,sourceTeam}=f;
 const enemy=targetType==='Neeko'?f.neeko:f.shaco;
 const alias=targetType==='Neeko'?f.neeko.neekoDisguiseV453M15.publicId:
  f.shaco.shacoPublicAliasV453M15;
 const initial=room.view(defendingPlayer);
 assert.equal(initial.pendingDecision,null);
 assert.ok(initial.projection.units.some(v=>v.id===alias));
 assert.ok(!initial.projection.units.some(v=>v.id===enemy.id));
 assert.ok(!initial.projection.events.some(e=>e.unitId===enemy.id));
 teamProjectionsIsolation(f,initial);
 // pauseForDecision() is a REAL method used by processAmbushResponses().
 // We stage its valid decision boundary; no unperformed combat is claimed.
 a.phase='decision';
 assert.equal(a.pauseForDecision('combat_reaction',defender.id,enemy.id),true);
 const view=room.view(defendingPlayer);
 assert.equal(view.pendingDecision?.kind,'combat_reaction');
 assert.equal(view.pendingDecision?.unitId,defender.id,'own actor ID authorized');
 assert.equal(view.pendingDecision?.enemyId,enemy.id,
  'BUG: public room metadata reveals a masked enemy stable ID');
 assert.notEqual(view.pendingDecision?.enemyId,alias,
  'enemy ID is NOT the actual public appearance alias');
 assert.ok(view.projection.units.some(v=>v.id===alias));
 assert.ok(!view.projection.units.some(v=>v.id===enemy.id));
 assert.equal(view.projection.units.length,11,
  'projection contains 10 champions plus one public clone decoy');
 assert.equal(a.units.length,10);
 const checkpoint=snapshotRoom(f);
 assert.deepEqual(checkpoint.room.view(checkpoint.player).pendingDecision,
  view.pendingDecision,'server metadata privacy bug persists after source checkpoint');
 assert.deepEqual(checkpoint.room.view(checkpoint.player).projection,
  view.projection,'room PvP projection survives checkpoint');
 assert.deepEqual(checkpoint.room.gateway.exportSession(),
  room.gateway.exportSession(),'gateway receipts/ACL restored in room');
 a.canSeePoint=()=>false;
 checkpoint.arena.canSeePoint=()=>false;
 const noVision=room.view(defendingPlayer);
 const noVisionRestored=checkpoint.room.view(checkpoint.player);
 assert.ok(!noVision.projection.units.some(v=>v.id===alias),
  'enemy alias no longer visible after synthetic vision lost');
 assert.equal(noVision.pendingDecision.enemyId,enemy.id,
  'BUG: pending decision still returns stable enemy ID after fog is lost');
 assert.deepEqual(noVisionRestored.pendingDecision,noVision.pendingDecision,
  'hidden-foe stable ID leak survives room reload');
 return {defendingTeam:f.defendingTeam,targetType,stableId:enemy.id,
  visibleAlias:alias,leakedEnemyId:view.pendingDecision.enemyId,
  leakedAfterVisionLost:noVision.pendingDecision.enemyId,
  roomRestored:true};
}
const results=[];
for(const defendingTeam of ['blue','red'])
 for(const targetType of ['Neeko','Shaco'])
  results.push(witness(sourceFixture(defendingTeam),targetType));
assert.equal(results.length,4);
console.log('M45_S18_PVP_ROOM_PRIVACY '+JSON.stringify({
 scenarios:4,exposed_stable_enemy_ids:4,
 checkpoint_room_restores:4,synthetic_fog_leak_cases:4,
 results,status:'FROZEN_LEGACY_P1_BUG_WITNESSED_NOT_RUST_PARITY'}));
