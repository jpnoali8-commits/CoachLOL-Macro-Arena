#!/usr/bin/env node
/** M45 S17 source+Rust-spec integrity check; V8 static only, not Rust native QA. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

export function validateInputs({receipt,s17Test,rustSource,s16Receipt,s15Receipt,goldenPlan}){
 let n=0;
 const eq=(a,b,description)=>{assert.deepEqual(a,b,description);n++};
 const ok=(v,description)=>{assert.ok(v,description);n++};
 eq(receipt.original_source.commit,'f0b1147ac46e585a1d5374a178b1ea462f5dc278','original source');
 eq(receipt.original_source.engine_blob,'41679f7328a42e379fdfb8de5b92006e1bfb529f','original engine sha');
 eq(receipt.original_source.map_blob,'ad853bbb6f110c0d2b6b8b4995ac4e80169f7109','map sha');
 eq(receipt.original_source.mask_blob,'ecddcee76f3bce20a483ff7545ce2231696270e2','mask sha');
 eq(receipt.original_source.gateway_dev44_blob,'4be23bdd9df6d9918a0c32b6ea699be8974bf9de','gateway dev44');
 eq(receipt.original_source.gateway_dev47_blob,'adf6900a20b1b2c162ec9769b18bf1cc2c23867f','gateway dev47');
 eq(receipt.supplemental_test.git_blob_sha,'b4c8aa8ebdf5984869dac60d00aa7620ff9a53d4','saved test pinned');
 eq(receipt.rust_acceptance.git_blob_sha,'0e54ec9a3d11061441cff50d857833b235b569e6','Rust accepted source blob');
 eq(receipt.execution.status,'V8_PASS_BUG_REPRODUCED','dynamic source bug characterized');
 eq(receipt.execution.assertions_executed,149,'149 actually tested');
 eq(receipt.execution.assertions_pass,149,'149 source assertions PASS');
 eq(receipt.execution.bilateral_seat_scenarios,2,'two real owner seats in source V8');
 eq(receipt.execution.old_event_leaks_observed,4,'2 old events times 2 seats leaked');
 eq(receipt.execution.old_neeko_event_relabelings_observed,2,'both old Neeko events re-aliased');
 eq(receipt.execution.checkpoint_restored_continuations,2,'full continuation after snapshot on both seats');
 eq(receipt.privacy_witnesses.length,2,'two recorded witness traces');
 eq(receipt.privacy_witnesses[0].owner_team,'blue','blue side');
 eq(receipt.privacy_witnesses[1].owner_team,'red','red side');
 eq(receipt.privacy_witnesses[0].expired_event_stable_id,'blue_MID','blue Shaco stable ID leak');
 eq(receipt.privacy_witnesses[0].cancelled_event_stable_id,'blue_TOP','blue Neeko stable ID leak');
 eq(receipt.privacy_witnesses[1].expired_event_stable_id,'red_MID','red Shaco stable ID leak');
 eq(receipt.privacy_witnesses[1].cancelled_event_stable_id,'red_TOP','red Neeko stable ID leak');
 eq(receipt.privacy_witnesses[0].first_neeko_alias,'appearance_1','blue old alias');
 eq(receipt.privacy_witnesses[0].remasked_neeko_alias,'appearance_7','blue new alias');
 eq(receipt.privacy_witnesses[1].remasked_neeko_alias,'appearance_7','red new alias');
 eq(receipt.privacy_witnesses[0].post_continuation_state_checksumV40,'8d47314d','blue resumed state checksum');
 eq(receipt.privacy_witnesses[1].post_continuation_state_checksumV40,'b33b4dd2','red resumed state checksum');
 eq(receipt.defect.id,'S17_RETROACTIVE_HISTORICAL_EVENT_ID_AND_TEXT_DISCLOSURE','P1 name');
 eq(receipt.defect.severity,'P1_PRIVACY_PROTOCOL_CONTRACT','P1 privacy severity');
 eq(receipt.defect.status,'V8_SOURCE_BILATERAL_REPRODUCED_NOT_FIXED','source bug, not fixed');
 eq(receipt.rust_acceptance.rust_unit_tests_prepared,4,'four Rust source-only tests');
 eq(receipt.rust_acceptance.rust_unit_tests_executed,0,'Rust zero executed');
 eq(receipt.rust_acceptance.production_workspace_member,false,'no workspace crate');
 eq(receipt.execution.original_full_node,'NOT_RUN','full Node ESM not run');
 eq(receipt.execution.real_http,'NOT_RUN','real HTTP not run');
 eq(receipt.execution.native_rust,'NOT_RUN','native Rust not run');
 eq(receipt.execution.wasm,'NOT_RUN','WASM not run');
 eq(receipt.coordinator.crates_available.join(','),'core-state','only coordinator crate at recorded HEAD');
 eq(receipt.original_s10_matrix_unchanged.v8_pass,22,'source matrix PASS unchanged');
 eq(receipt.original_s10_matrix_unchanged.v8_fail,2,'source matrix FAIL unchanged');
 eq(receipt.original_s10_matrix_unchanged.not_run,2,'source matrix NOT_RUN unchanged');
 eq(receipt.original_s10_matrix_unchanged.full_node,0,'original Node zero');
 eq(goldenPlan.suites.length,26,'S10 original 26 suites remain');
 eq(goldenPlan.source_commit,receipt.original_source.commit,'S10 original pin matches');
 eq(s16Receipt.execution.assertions_pass,295,'S16 source dynamic remains 295');
 eq(s16Receipt.execution.cases_pass,18,'S16 source cases remain 18');
 eq(s15Receipt.original_m15.v8_status,'V8_FAIL_PARTIAL_20_PASS_ONE_FAILED','S15 prior original M15 fail not overwritten');
 eq(s15Receipt.s15_supplemental.assertions,88,'S15 witness unaffected');
 eq(receipt.gates.G8,'NOT_CERTIFIED','Rust certification still blocked');
 ok(s17Test.includes("function evolve(f)"),'saved test has future state progression');
 ok(s17Test.includes("recovered.restore(f.gate.exportSession())"),'actual gateway restore applied');
 ok(s17Test.includes("Arena.fromSnapshotV40(map,mask,checkpoint)"),'arena restored');
 ok(s17Test.includes("assert.deepEqual(resumed,orig"),'both evolutions compared');
 ok(s17Test.includes("assert.equal(checksumV40(f.a.snapshotV40()),"),'state continuation compared');
 ok(s17Test.includes("assert.deepEqual(f.gate.exportSession(),restored.gate.exportSession()"),'receipts continuation compared');
 ok(s17Test.includes("assert.deepEqual(f.a.perspective(f.other),restored.a.perspective(f.other)"),'public continuation compared');
 ok(s17Test.includes("a.canSeePoint=()=>false"),'source synthetic fog loss explicit');
 ok(s17Test.includes("rawLeakedEvent(eventFor(a,other,eventShacoId)"),'Shaco historical bug witnessed');
 ok(s17Test.includes("rawLeakedEvent(eventFor(a,other,eventNeekoId)"),'Neeko historical bug witnessed');
 ok(s17Test.includes("maskedEvent(eventFor(a,other,eventNeekoId),newAlias)"),'old event is re-aliased witnessed');
 ok(rustSource.includes("pub trait ActualRustMatchEventRunner"),'future actual native runner required');
 ok(rustSource.includes("pub struct TimelineBatch"),'two independent historical event witnesses');
 ok(rustSource.includes("neeko_old_event: TimelineWitness"),'Neeko event mandatory');
 ok(rustSource.includes("shaco_old_event: TimelineWitness"),'Shaco event mandatory');
 ok(rustSource.includes("e.after_neeko_cancel!=*first"),'no old event text/ID disclosure after cancel');
 ok(rustSource.includes("e.after_new_disguise!=*first"),'no old event relabel');
 ok(rustSource.includes("pub fn seal_sensitive_event("),'historical public event is frozen at emission');
 ok(rustSource.includes("pub fn historical_event("),'historical event read does not use current actor');
 ok(rustSource.includes("pub const REQUIRED_NEGATIVE_CASES: [&str; 8]"),'eight negative privacy tests specified');
 const nativeSpecs=[...rustSource.matchAll(/#\[test\]\s*fn\s+(\w+)/g)].map(m=>m[1]);
 eq(nativeSpecs.length,4,'four Rust tests source only');
 ok(receipt.no_actions&&receipt.no_merges&&receipt.no_original_branch_edits,'no forbidden workflow');
 return {status:'V8_STATIC_SOURCE_INTEGRITY_PASS',checks:n,source_dynamic_assertions:149,
  source_old_event_leaks:4,source_replay_continuations:2,
  native_rust_tests_prepared:4,rust_native:'NOT_RUN',wasm:'NOT_RUN',http:'NOT_RUN'};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const root=new URL('./',import.meta.url);
 const json=n=>JSON.parse(readFileSync(new URL(n,root),'utf8'));
 const txt=n=>readFileSync(new URL(n,root),'utf8');
 console.log('M45_S17_STATIC '+JSON.stringify(validateInputs({
  receipt:json('S17_EVENT_HISTORY_V8_RECEIPT.json'),
  s17Test:txt('s17_event_reprojection_and_reconnect_pvp.test.mjs'),
  rustSource:txt('s17_sealed_event_history_rust_acceptance.rs'),
  s16Receipt:json('S16_ALIAS_TEMPORAL_V8_RECEIPT.json'),
  s15Receipt:json('S15_CLONE_IDENTITY_V8_RECEIPT.json'),
  goldenPlan:json('golden_plan.json')
 })));
}
