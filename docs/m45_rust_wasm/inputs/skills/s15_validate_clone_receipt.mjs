#!/usr/bin/env node
/** M45 S15 receipt cross-check; static QA only, NOT Rust or true HTTP. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
export function validateInputs({receipt,rustSource,supplementalSource,s10Plan}){
 let checks=0;
 const equal=(a,b,msg)=>{assert.deepEqual(a,b,msg);checks++};
 const ok=(value,msg)=>{assert.ok(value,msg);checks++};
 equal(receipt.source_commit,'f0b1147ac46e585a1d5374a178b1ea462f5dc278','frozen source pin');
 equal(receipt.blobs.engine,'41679f7328a42e379fdfb8de5b92006e1bfb529f','engine pin');
 equal(receipt.blobs.gateway_dev44,'4be23bdd9df6d9918a0c32b6ea699be8974bf9de','input gateway dev44');
 equal(receipt.blobs.gateway_dev47,'adf6900a20b1b2c162ec9769b18bf1cc2c23867f','input gateway dev47');
 equal(receipt.blobs.original_m15_test,'a5ce2444d721960c80554c8d0e231b0ec75fe7a2','original M15 source');
 equal(receipt.blobs.original_clone_targetability_audit,'1094fb6b475b1331f28a887978e522f6b2b8d677','strict source audit');
 equal(receipt.blobs.s15_supplemental_test,'556ddbed60b4254c1c3c3eea9d202da0bf6415cf','supplemental source');
 equal(receipt.blobs.rust_typed_acceptance,'795ff430ab133a1d3de3f2e6d70b07a348ae2722','Rust contract blob');
 equal(receipt.original_m15.original_total_expected,25,'original 24 sync + 1 HTTP');
 equal(receipt.original_m15.original_synchronous_checks_pass_before_first_failure,20,'20 original source cases passed');
 equal(receipt.original_m15.first_failure.index,21,'first source failure index');
 equal(receipt.original_m15.first_failure.expected_clone_appearance_champ,'Sylas','source demand');
 equal(receipt.original_m15.first_failure.actual_clone_appearance_champ,'Shaco','observed mismatch');
 equal(receipt.original_m15.v8_status,'V8_FAIL_PARTIAL_20_PASS_ONE_FAILED','M15 not falsely approved');
 equal(receipt.original_m15.original_http_manifest_and_ui_case,'NOT_RUN_NODE_SERVER_MODULE_GRAPH','server case left unrun');
 equal(receipt.original_clone_targetability_strict.expected_cases,24,'strict original source cases');
 equal(receipt.original_clone_targetability_strict.passed,24,'strict source cases pass');
 equal(receipt.original_clone_targetability_strict.confirmed_code_path_failures,0,'no remaining original P1 clone hits in this source');
 equal(receipt.original_clone_targetability_strict.unexpected_failures,0,'strict no unexpected');
 equal(receipt.original_clone_targetability_strict.exit_code,0,'strict exits zero');
 equal(receipt.s15_supplemental.assertions,88,'88 actual new witness checks');
 equal(receipt.s15_supplemental.cases,8,'eight bilateral scenarios');
 equal(receipt.s15_supplemental.known_wrong_sylas_clone_appearance_reproductions,2,'both teams wrong');
 equal(receipt.s15_supplemental.checksums.length,2,'both seat snapshots');
 equal(receipt.s15_supplemental.checksums[0].source_checksumV40,'a38375d5','blue witness checksum');
 equal(receipt.s15_supplemental.checksums[1].source_checksumV40,'e582a349','red witness checksum');
 equal(receipt.s15_supplemental.checksums[0].wrong_public_decoy_champ,'Shaco','wrong blue public view');
 equal(receipt.s15_supplemental.checksums[1].wrong_public_decoy_champ,'Shaco','wrong red public view');
 equal(receipt.root_cause.change_class,'DELIBERATE_FIDELITY_FIX','intentional Rust fix not source parity');
 equal(receipt.rust.prospective_two_seat_cases,12,'six typed cases two seats');
 equal(receipt.rust.prospective_negative_cases,8,'eight security negatives');
 equal(receipt.rust.native_executed,0,'no actual Rust execution');
 equal(receipt.rust.wasm_executed,0,'no WASM execution');
 equal(receipt.s10_original_matrix_unchanged.passed_v8,22,'S10 original PASS unchanged');
 equal(receipt.s10_original_matrix_unchanged.failed_v8,2,'S10 original FAIL unchanged');
 equal(receipt.s10_original_matrix_unchanged.not_run,2,'S10 original NOT_RUN unchanged');
 equal(receipt.s10_original_matrix_unchanged.full_node,0,'original Node unrun');
 const sourceEntry=s10Plan.suites.find(x=>x.test_git_blob_sha===receipt.blobs.original_m15_test);
 ok(!!sourceEntry,'M15 included in original S10 plan');
 equal(sourceEntry.v8_isolated_s10.status,'NOT_RUN','S10 status frozen rather than backfilled');
 equal(receipt.gates.G8,'NOT_CERTIFIED','no unsupported certification');
 ok(supplementalSource.includes("assert.equal(clone.appearance.champ,'Shaco'"),'legacy bug tested as legacy fact');
 ok(supplementalSource.includes("assert.equal(real?.champ,'Sylas'"),'public real owner identity examined');
 ok(supplementalSource.includes("assert.equal(decoy?.champ,'Shaco'"),'public clone mismatch examined');
 ok(supplementalSource.includes("assert.equal(knownAppearanceBugs,2)"),'both seats explicit');
 ok(rustSource.includes('pub trait ActualRustCloneRunner'),'real engine required for acceptance');
 ok(rustSource.includes('pub fn check_real_rust'),'actual engine acceptance gate not canned');
 ok(rustSource.includes('v.public_decoy_champion.as_deref()!=Some("Sylas")'),'Rust deliberately fixes clone donor visual');
 ok(rustSource.includes('v.real_roster_size!=10'),'roster identity preserved');
 ok(rustSource.includes('v.stable_id_visible_to_enemy'),'private actor ID may not leak');
 ok(rustSource.includes('v.internal_decoy_id_visible_to_enemy'),'internal entity ID may not leak');
 ok(rustSource.includes('pub const SCENARIOS: [Scenario; 6]'),'six typed cases');
 ok(rustSource.includes('pub const REQUIRED_NEGATIVE_CASES: [&str; 8]'),'negative ACL cases');
 const rustTestNames=[...rustSource.matchAll(/#\[test\]\s*fn\s+(\w+)/g)].map(m=>m[1]);
 equal(rustTestNames.length,3,'three Rust tests prepared not executed');
 return {status:'V8_STATIC_CONTRACT_PASS',checks,original_m15:'20_PASS_THEN_1_FAIL',clone_targetability:'24/24_PASS',
  supplemental:'88/88_PASS_WITH_2_LEGACY_BUG_WITNESSES',rust_unit_tests_prepared:3,
  rust_native:'NOT_RUN',wasm:'NOT_RUN',node_full:'NOT_RUN',http:'NOT_RUN'};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const root=new URL('./',import.meta.url);
 const json=name=>JSON.parse(readFileSync(new URL(name,root),'utf8'));
 const txt=name=>readFileSync(new URL(name,root),'utf8');
 console.log('M45_S15_STATIC '+JSON.stringify(validateInputs({
  receipt:json('S15_CLONE_IDENTITY_V8_RECEIPT.json'),
  rustSource:txt('s15_clone_disguise_rust_acceptance.rs'),
  supplementalSource:txt('s15_clone_identity_security.test.mjs'),
  s10Plan:json('golden_plan.json')
 })));
}
