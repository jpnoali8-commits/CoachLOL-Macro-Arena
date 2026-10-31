#!/usr/bin/env node
/** S18 static cross-pin gate; no full Node, native Rust, WASM or HTTP run. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
export function validateInputs({receipt,testSource,rustSource,s17Receipt,s16Receipt,goldenPlan}){
 let checks=0;
 const eq=(a,b,why)=>{assert.deepEqual(a,b,why);checks++};
 const ok=(v,why)=>{assert.ok(v,why);checks++};
 eq(receipt.source_commit,'f0b1147ac46e585a1d5374a178b1ea462f5dc278','frozen source');
 const blobs={
  engine:'41679f7328a42e379fdfb8de5b92006e1bfb529f',
  map:'ad853bbb6f110c0d2b6b8b4995ac4e80169f7109',
  mask:'ecddcee76f3bce20a483ff7545ce2231696270e2',
  gateway_dev44:'4be23bdd9df6d9918a0c32b6ea699be8974bf9de',
  gateway_dev47:'adf6900a20b1b2c162ec9769b18bf1cc2c23867f',
  room_dev47:'d5d5c36c2f967ed294f6d5e9fcedcd32348eacb5',
  test:'e5a9a3ced7b42e485aeb3049a5a6c569daa9d9eb',
  rust:'cf364d9ab0384c351e47839cbf5a410dbf6f7041'
 };
 for(const [name,sha] of Object.entries(blobs))eq(receipt.git_blobs[name],sha,'Git source '+name);
 eq(receipt.v8_actual.status,'V8_PASS_BUG_WITNESSED_NOT_RUST_PARITY','bug characterized, not port parity');
 eq(receipt.v8_actual.assertions_attempted,121,'executed 121 source assertions');
 eq(receipt.v8_actual.assertions_passed,121,'121 succeeded');
 eq(receipt.v8_actual.scenarios,4,'4 bilateral room scenarios');
 eq(receipt.v8_actual.scenarios_passed,4,'4 passed');
 eq(receipt.v8_actual.masked_stable_id_exposures,4,'stable enemy IDs leaked');
 eq(receipt.v8_actual.after_synthetic_fog_exposures,4,'also leaked after simulated fog');
 eq(receipt.v8_actual.snapshot_room_restore_checks,4,'room restored per case');
 eq(receipt.witnesses.length,4,'four explicit witness records');
 for(const [i,t,enemy,internal,alias] of [
  [0,'blue','Neeko','red_TOP','appearance_1'],
  [1,'blue','Shaco','red_MID','appearance_3'],
  [2,'red','Neeko','blue_TOP','appearance_1'],
  [3,'red','Shaco','blue_MID','appearance_3']]){
  const w=receipt.witnesses[i];
  eq(w.defending_seat,t,'defending seat '+i);
  eq(w.masked_enemy,enemy,'masked source '+i);
  eq(w.internal_actor,internal,'internal source '+i);
  eq(w.public_alias,alias,'correct public projection '+i);
  eq(w.room_pending_enemy_id,internal,'room leaked source '+i);
  eq(w.after_fog_pending_enemy_id,internal,'fog did not repair '+i);
 }
 eq(receipt.defect.id,'S18_PUBLIC_ROOM_PENDING_DECISION_STABLE_ENEMY_ID','P1 identity bug');
 eq(receipt.defect.severity,'P1_PRIVACY_PROTOCOL_CONTRACT','P1 security');
 eq(receipt.defect.status,'SOURCE_V8_BILATERAL_REPRODUCED_NOT_FIXED','unfixed');
 eq(receipt.v8_actual.native_rust,'NOT_RUN','native unrun');
 eq(receipt.v8_actual.wasm,'NOT_RUN','wasm unrun');
 eq(receipt.v8_actual.actual_http,'NOT_RUN','HTTP unrun');
 eq(receipt.v8_actual.original_node_esm,'NOT_RUN','original Node unrun');
 eq(receipt.rust.rust_unit_tests_prepared,5,'5 Rust tests only prepared');
 eq(receipt.rust.rust_unit_tests_executed,0,'Rust tests unexecuted');
 eq(receipt.legacy_matrix_unchanged.s10_v8_pass,22,'S10 unchanged passed');
 eq(receipt.legacy_matrix_unchanged.s10_v8_fail,2,'S10 unchanged failed');
 eq(receipt.legacy_matrix_unchanged.s10_not_run,2,'S10 unchanged unrun');
 eq(receipt.prior_s17.v8_assertions_pass,149,'S17 source QA preserved');
 eq(s17Receipt.execution.assertions_pass,149,'S17 receipt ground');
 eq(s16Receipt.execution.assertions_pass,295,'S16 receipt ground');
 eq(goldenPlan.suites.length,26,'S10 goldens unchanged');
 eq(goldenPlan.source_commit,receipt.source_commit,'S10 pin exact');
 ok(testSource.includes('new PvPRoomV453Dev47('),'original room used in test');
 ok(testSource.includes("a.pauseForDecision('combat_reaction',defender.id,enemy.id)"),'real decision API used');
 ok(testSource.includes('view.pendingDecision?.enemyId,enemy.id'),'actual stable ID leaked in room view');
 ok(testSource.includes('initial.projection.units.some(v=>v.id===alias)'),'alias is visible');
 ok(testSource.includes('room.view(enemySeatPlayer).pendingDecision,null'),'opposite seat ACL checked');
 ok(testSource.includes('checkpoint.room.view(checkpoint.player).pendingDecision'),'checkpoint room reload compared');
 ok(testSource.includes("a.canSeePoint=()=>false"),'synthetic fog change explicit');
 ok(testSource.includes('witness(sourceFixture(defendingTeam),targetType)'),'all cases invoked');
 ok(rustSource.includes('pub fn safe_public_reaction('),'Rust reference public reaction sanitizer');
 ok(rustSource.includes('pub trait RealRustPvPRoomRunner'),'native interface requires real room');
 ok(rustSource.includes('pub fn validate_real_rust_room'),'Rust acceptance gate');
 ok(rustSource.includes('public_enemy_reference_after_fog.is_some()'),'fogged hidden attacker never stable ID');
 ok(rustSource.includes('row.internal_actor_id_disclosed_anywhere_in_json'),'no hidden internal ID anywhere in room payload');
 ok(rustSource.includes('pub const REQUIRED_ADVERSARIAL_NEGATIVES:[&str;8]'),'8 future adversarial requirements');
 const prepared=[...rustSource.matchAll(/#\[test\]\s*fn\s+(\w+)/g)].map(x=>x[1]);
 eq(prepared.length,5,'5 source-only Rust tests');
 eq(receipt.gates.G8,'NOT_CERTIFIED','no false full certification');
 ok(receipt.no_actions&&receipt.no_merges&&receipt.no_original_branch_modifications,'workflow unchanged');
 return {status:'V8_STATIC_CONTRACT_PASS',checks,dynamic_source_assertions:121,
    room_identity_leaks:4,rust_unit_tests_prepared:5,
    full_node:'NOT_RUN',native:'NOT_RUN',wasm:'NOT_RUN',http:'NOT_RUN'};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const root=new URL('./',import.meta.url);
 const json=n=>JSON.parse(readFileSync(new URL(n,root),'utf8'));
 const txt=n=>readFileSync(new URL(n,root),'utf8');
 console.log('M45_S18_STATIC '+JSON.stringify(validateInputs({
  receipt:json('S18_PVP_ROOM_IDENTITY_V8_RECEIPT.json'),
  testSource:txt('s18_pvp_room_pending_identity_pvp.test.mjs'),
  rustSource:txt('s18_room_reaction_identity_rust_acceptance.rs'),
  s17Receipt:json('S17_EVENT_HISTORY_V8_RECEIPT.json'),
  s16Receipt:json('S16_ALIAS_TEMPORAL_V8_RECEIPT.json'),
  goldenPlan:json('golden_plan.json')
 })));
}
