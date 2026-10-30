#!/usr/bin/env node
/** M45 Skills S17 — source-only original-authoritative Arena/gateway regression.
 * This fixture intentionally characterizes an actual legacy SECURITY DEFECT.
 * A PASS witnesses the bug, not an acceptable target Rust implementation.
 * Source branch: dev69/skills-batch2 @ f0b1147ac46e585a1d5374a178b1ea462f5dc278
 * Original engine blob: 41679f7328a42e379fdfb8de5b92006e1bfb529f
 * Original gateway dev44 blob: 4be23bdd9df6d9918a0c32b6ea699be8974bf9de
 * Original gateway dev47 blob: adf6900a20b1b2c162ec9769b18bf1cc2c23867f
 * Not a real network/fog or Rust/WASM/native test; all vision is synthetic.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../../../engine.mjs';
import {AuthoritativeActionsV453Dev47} from '../../../../multiplayer/authoritative_actions_v453_dev47.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const seats=[
 {seatId:'B',unitId:'blue_MID',unitIds:['blue_TOP','blue_JG','blue_MID','blue_ADC','blue_SUP']},
 {seatId:'R',unitId:'red_MID',unitIds:['red_TOP','red_JG','red_MID','red_ADC','red_SUP']},
];
function snapshotEqual(a){
 const snap=a.snapshotV40(),copy=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(checksumV40(snap),checksumV40(copy.snapshotV40()));
 assert.equal(copy.units.length,10);
 return checksumV40(snap);
}
function fixture(team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:171701,mode:'pvp',
  draft:{[team]:{TOP:'Neeko',MID:'Shaco'},[other]:{MID:'Ahri'}}});
 for(const u of a.units)Object.assign(u,{x:.08,y:.08,autoAttack:false,
  autoFollow:false,autoFarm:false,autoJungle:false});
 const neeko=a.units.find(v=>v.id===team+'_TOP'),
  shaco=a.units.find(v=>v.id===team+'_MID'),
  attacker=a.units.find(v=>v.id===other+'_MID');
 for(const u of [neeko,shaco,attacker])Object.assign(u,{
  hp:1500,maxHp:1500,level:6,mana:1000,maxMana:1000,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(neeko,{x:.51,y:.5});
 Object.assign(shaco,{x:.52,y:.5});
 Object.assign(attacker,{x:.46,y:.5});
 a.canSeePoint=()=>true;
 assert.equal(a.queueNeekoDisguiseV453M15(team,neeko.id,shaco.id).ok,true);
 assert.equal(a.queueKitSkillV42(team,shaco.id,'R',{x:.50,y:.5}).ok,true);
 a.resolveBoardSkillsV453Dev69();
 a.gameTime=1;
 const shacoClone=a.boardSummonsV453Dev69.find(v=>v.kind==='shaco_clone');
 assert.ok(shacoClone);
 assert.equal(a.units.length,10);
 const aliasNeeko=neeko.neekoDisguiseV453M15.publicId,
  aliasShaco=shaco.shacoPublicAliasV453M15;
 a.event('S17_NEEKO_PRIVATE_OLD',team,'skill_vfx',neeko.id,{observedBy:['blue','red']});
 a.event('S17_SHACO_PRIVATE_OLD',team,'skill_vfx',shaco.id,{observedBy:['blue','red']});
 const eventNeeko=a.events.find(v=>v.text==='S17_NEEKO_PRIVATE_OLD'),
  eventShaco=a.events.find(v=>v.text==='S17_SHACO_PRIVATE_OLD');
 assert.ok(eventNeeko&&eventShaco);
 const gate=new AuthoritativeActionsV453Dev47(a,seats),
  enemySeat=other==='blue'?'B':'R';
 return {a,neeko,shaco,attacker,gate,enemySeat,team,other,
  aliasNeeko,aliasShaco,eventNeekoId:eventNeeko.id,eventShacoId:eventShaco.id};
}
function eventFor(a,seat,id){
 return a.perspective(seat).events.find(v=>v.id===id);
}
function maskedEvent(record,alias){
 assert.ok(record,'event must remain observable');
 assert.equal(record.unitId,alias,'historical event currently bound to public alias');
 assert.equal(record.text,'Ação de uma unidade visível.','private event body is redacted');
 assert.equal(record.public,false);
}
function rawLeakedEvent(record,stable,text){
 assert.ok(record,'event must remain observable');
 // Characterizes a definite privacy regression in frozen JS. Future Rust
 // privacy policy should reject this state even after appearance changes.
 assert.equal(record.unitId,stable,'PAST event leaked stable internal actor ID');
 assert.equal(record.text,text,'PAST event retroactively unredacted private text');
}
function enemyCommand(f,sequence,targetId){
 return f.gate.submit(f.enemySeat,{
  sequence,kind:'order.attack',unitId:f.attacker.id,
  payload:{targetId}});
}
function evolve(f){
 const {a,team,other,neeko,shaco,eventNeekoId,eventShacoId}=f;
 a.canSeePoint=()=>false; // opponent cannot see either owner anymore
 a.gameTime=18.1;
 a.advanceBoardSummonsV453Dev69();
 assert.equal(a.boardSummonsV453Dev69.filter(x=>x.kind==='shaco_clone').length,0);
 rawLeakedEvent(eventFor(a,other,eventShacoId),shaco.id,'S17_SHACO_PRIVATE_OLD');
 maskedEvent(eventFor(a,other,eventNeekoId),f.aliasNeeko);
 assert.equal(enemyCommand(f,2,f.aliasShaco).ok,false,
  'expired old Shaco owner alias cannot be targeted');
 const c=a.queueNeekoDisguiseV453M15(team,neeko.id,'self');
 assert.equal(c.ok,true);
 rawLeakedEvent(eventFor(a,other,eventNeekoId),neeko.id,'S17_NEEKO_PRIVATE_OLD');
 // No visibility of old event's actor, yet its stable ID and text are exposed.
 assert.equal(a.perspective(other).units.some(v=>v.id===neeko.id),false);
 a.gameTime=19.1;a.canSeePoint=()=>true;
 assert.equal(a.queueNeekoDisguiseV453M15(team,neeko.id,shaco.id).ok,true);
 const newAlias=neeko.neekoDisguiseV453M15.publicId;
 assert.notEqual(newAlias,f.aliasNeeko);
 maskedEvent(eventFor(a,other,eventNeekoId),newAlias);
 assert.notEqual(eventFor(a,other,eventNeekoId).unitId,f.aliasNeeko,
  'old event is retroactively rewritten to new appearance');
 assert.equal(enemyCommand(f,2,f.aliasNeeko).ok,false,
  'stale former disguise alias must not be accepted');
 assert.equal(enemyCommand(f,2,newAlias).ok,true,
  'fresh disguise alias resolves to same real actor');
 snapshotEqual(a);
 return {oldAlias:f.aliasNeeko,newAlias,oldShacoAlias:f.aliasShaco,
  leakedStableIds:[shaco.id,neeko.id]};
}
const reports=[];
for(const team of ['blue','red']){
 const f=fixture(team);
 maskedEvent(eventFor(f.a,f.other,f.eventNeekoId),f.aliasNeeko);
 maskedEvent(eventFor(f.a,f.other,f.eventShacoId),f.aliasShaco);
 assert.equal(enemyCommand(f,1,f.aliasNeeko).ok,true);
 const duplicate=enemyCommand(f,1,f.aliasNeeko);
 assert.equal(duplicate.ok,true);
 assert.equal(f.gate.revision,1,'gateway ACK idempotence');
 const checkpoint=f.a.snapshotV40();
 const originalHash=checksumV40(checkpoint);
 const replay=Arena.fromSnapshotV40(map,mask,checkpoint);
 replay.canSeePoint=()=>true;
 assert.equal(checksumV40(replay.snapshotV40()),originalHash);
 const recovered=new AuthoritativeActionsV453Dev47(replay,seats);
 recovered.restore(f.gate.exportSession());
 assert.deepEqual(recovered.exportSession(),f.gate.exportSession(),
  'checkpoint retains authenticated seat receipts');
 const neeko=replay.units.find(x=>x.id===f.neeko.id),
  shaco=replay.units.find(x=>x.id===f.shaco.id),
  attacker=replay.units.find(x=>x.id===f.attacker.id);
 const restored={...f,a:replay,gate:recovered,neeko,shaco,attacker};
 assert.deepEqual(replay.perspective(f.other).events,
  f.a.perspective(f.other).events,
  'initial public event projection after checkpoint equal');
 assert.deepEqual(enemyCommand(restored,1,f.aliasNeeko),
  duplicate,'replay retry ACK has no extra dispatch');
 const orig=evolve(f),resumed=evolve(restored);
 assert.deepEqual(resumed,orig,'continuation after restore has identical event identity outcomes');
 assert.equal(checksumV40(f.a.snapshotV40()),
  checksumV40(restored.a.snapshotV40()),
  'state+RNG deterministic continuation after restore');
 assert.deepEqual(f.a.perspective(f.other),restored.a.perspective(f.other),
  'enemy public projection after continuation matches');
 assert.deepEqual(f.gate.exportSession(),restored.gate.exportSession(),
  'input receipts and revision match after restore and continuation');
 reports.push({team,bug_events_leaked:2,known_old_event_realiased:1,
  alias_sequence:[f.aliasNeeko,orig.newAlias],snapshots_replayed:1,
  final_state_hash:checksumV40(f.a.snapshotV40())});
}
assert.equal(reports.length,2);
console.log('M45_S17_EVENT_PRIVACY '+JSON.stringify({
 cases:2,bugs_leaked_events:4,retroactive_event_alias_changes:2,
 restored_continuations:2,reports,
 status:'SOURCE_BUG_REPRODUCED_NOT_RUST_ACCEPTED'}));
