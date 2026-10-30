#!/usr/bin/env node
/** M45 S16 cross-pin audit. Static source evidence, NOT Rust certification. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

export function verify({receipt,s16test,s16rust,goldenPlan,s15Receipt}){
 let checks=0;
 const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++};
 const ok=(v,m)=>{assert.ok(v,m);checks++};
 eq(receipt.original_source.commit,'f0b1147ac46e585a1d5374a178b1ea462f5dc278','frozen origin');
 eq(receipt.original_source.engine_blob,'41679f7328a42e379fdfb8de5b92006e1bfb529f','engine blob');
 eq(receipt.original_source.map_blob,'ad853bbb6f110c0d2b6b8b4995ac4e80169f7109','map');
 eq(receipt.original_source.mask_blob,'ecddcee76f3bce20a483ff7545ce2231696270e2','mask');
 eq(receipt.original_source.gateway_dev44_blob,'4be23bdd9df6d9918a0c32b6ea699be8974bf9de','dev44 gateway');
 eq(receipt.original_source.gateway_dev47_blob,'adf6900a20b1b2c162ec9769b18bf1cc2c23867f','dev47 gateway');
 eq(receipt.supplementary_source.git_blob_sha,'6446595bf421c367eb26eed9f868ebca473b8daf','saved test pin');
 eq(receipt.rust_reference.git_blob_sha,'5321e3e5c1e3ea5d54510411adb4f468036e4085','Rust contract pin');
 eq(receipt.execution.status,'V8_PASS_LEGACY_CHARACTERIZATION','actual source V8 result');
 eq(receipt.execution.assertions_attempted,295,'executed asserts');
 eq(receipt.execution.assertions_pass,295,'passed asserts');
 eq(receipt.execution.cases_attempted,18,'source cases');
 eq(receipt.execution.cases_pass,18,'passed cases');
 eq(receipt.execution.bilateral_seats,2,'2 seats');
 eq(receipt.execution.simultaneous_alias_cases,2,'two simultaneous alias cases');
 eq(receipt.execution.temporal_clone_projectile_cases,16,'16 temporal cases');
 eq(receipt.execution.visible_decoy_impact_cases,8,'8 visible clone hits');
 eq(receipt.execution.visibility_removed_at_impact_cases,8,'8 fog sweep variations');
 eq(receipt.execution.source_snapshot_restore_equivalence_checks,38,'38 snapshot restore comparisons');
 eq(receipt.alias_witness.blue.alias_neeko,'appearance_1','neeko alias');
 eq(receipt.alias_witness.blue.alias_shaco_owner,'appearance_3','shaco actor alias');
 eq(receipt.alias_witness.blue.alias_clone,'appearance_2','shaco decoy alias');
 eq(receipt.alias_witness.red.alias_neeko,'appearance_1','other seat alias');
 eq(receipt.alias_witness.red.alias_shaco_owner,'appearance_3','other seat actor alias');
 eq(receipt.alias_witness.red.alias_clone,'appearance_2','other seat clone alias');
 eq(receipt.alias_witness.game_roster,'exactly 10 real champions, never 11','roster preserved');
 eq(receipt.temporal_witness.visible_first_collision_results_per_seat.length,4,'four visible combinations per seat');
 eq(receipt.temporal_witness.hidden_before_impact_results_per_seat.length,4,'four hidden combinations per seat');
 eq(receipt.temporal_witness.visible_first_collision_results_per_seat.map(x=>x.clone_hp),
    [1420,1380,1300,1200],'source-specific clone HP visible');
 eq(receipt.temporal_witness.hidden_before_impact_results_per_seat.map(x=>x.clone_hp),
    [1500,1500,1500,1500],'hidden clone bypass state');
 eq(receipt.temporal_witness.hidden_before_impact_results_per_seat.map(x=>x.real_owner_hp),
    [1500,1500,1346,1348],'Ashe hidden collision outcome');
 eq(receipt.risk.status,'POTENTIAL_FIDELITY_RISK_NOT_YET_CLASSIFIED_AS_GAMEPLAY_BUG','no premature bug designation');
 eq(receipt.risk.fix_status,'UNDECIDED_NEEDS_AUTHORED_RULES_AND_REAL_SERVER_TESTS','no unapproved Rust rule');
 eq(receipt.coordinator.present_crates.join(','),'core-state','Rust latest at source inspection');
 eq(receipt.rust_reference.unit_tests_executed,0,'Rust tests unrun');
 eq(receipt.execution.actual_node_esm,'NOT_RUN','original Node unrun');
 eq(receipt.execution.rust_native,'NOT_RUN','native Rust unrun');
 eq(receipt.execution.wasm,'NOT_RUN','wasm unrun');
 eq(receipt.execution.real_authenticated_http,'NOT_RUN','real HTTP unrun');
 eq(receipt.original_s10_fixed_matrix.v8_pass,22,'S10 unchanged pass');
 eq(receipt.original_s10_fixed_matrix.v8_fail,2,'S10 unchanged fail');
 eq(receipt.original_s10_fixed_matrix.not_run,2,'S10 unchanged not run');
 eq(goldenPlan.suites.length,26,'original S10 source selection');
 eq(goldenPlan.source_commit,receipt.original_source.commit,'S10 pinned same original');
 eq(s15Receipt.s15_supplemental.assertions,88,'S15 supplemental ledger');
 eq(s15Receipt.original_clone_targetability_strict.passed,24,'S15 strict clone ledger');
 eq(s15Receipt.original_m15.v8_status,'V8_FAIL_PARTIAL_20_PASS_ONE_FAILED','S15 M15 failure preserved');
 ok(s16test.includes('function multi(team)'),'real test multi alias setup');
 ok(s16test.includes('function temporal(team,champ,cloneChamp,loseVision)'),'real tested temporal combos');
 ok(s16test.includes("assert.equal(cases,18)"),'actual case count asserted');
 ok(s16test.includes("assert.equal(temporalCases.length,16)"),'actual temporal count asserted');
 ok(s16test.includes("assert.equal(new Set(aliases).size,3)"),'unique aliases asserted');
 ok(s16test.includes("a.canSeePoint=lookingTeam=>lookingTeam!==team"),'fog transition explicitly toggled');
 ok(s16test.includes("assert.equal(attack(3,aliases[0]).ok,false"),'same sequence payload attack rejected');
 ok(s16test.includes('checkpoint(a)'), 'source snapshot restore check invoked');
 ok(s16rust.includes('pub trait ActualAuthoritativeRustMatchRunner'),'real Rust runner required');
 ok(s16rust.includes('pub const OPEN_GATE:'),'uncertainty registered as gate');
 ok(s16rust.includes('visibility-collision as intended'),'legacy behavior not automatically endorsed');
 ok(s16rust.includes('SOURCE_HIDDEN_ASHE_OWNER_HP: [i32;2] = [1346,1348]'),'source fog damage pinned');
 ok(s16rust.includes('pub const REQUIRED_ADVERSARIAL_NEGATIVE_CASES: [&str; 8]'),'negative cases specified');
 const rustTests=[...s16rust.matchAll(/#\[test\]\s*fn\s+(\w+)/g)].map(x=>x[1]);
 eq(rustTests.length,3,'3 Rust data tests prepared not run');
 eq(receipt.gate_status.G8,'NOT_CERTIFIED','no premature Rust parity');
 ok(receipt.no_actions && receipt.no_merges && receipt.no_original_engine_edit,'no CI/quota and no original source changes');
 return {status:'V8_STATIC_SOURCE_CONTRACT_PASS',checks,
  source_dynamic_cases:18,source_dynamic_assertions:295,
  source_snapshot_checks:38,rust_data_tests_prepared:rustTests.length,
  actual_rust_compiler:'NOT_RUN',wasm:'NOT_RUN',original_node:'NOT_RUN'};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const root=new URL('./',import.meta.url);
 const json=n=>JSON.parse(readFileSync(new URL(n,root),'utf8'));
 const txt=n=>readFileSync(new URL(n,root),'utf8');
 console.log('M45_S16_STATIC '+JSON.stringify(verify({
  receipt:json('S16_ALIAS_TEMPORAL_V8_RECEIPT.json'),
  s16test:txt('s16_multi_alias_temporal_clone_pvp.test.mjs'),
  s16rust:txt('s16_visibility_collision_rust_acceptance.rs'),
  goldenPlan:json('golden_plan.json'),
  s15Receipt:json('S15_CLONE_IDENTITY_V8_RECEIPT.json')
 })));
}
