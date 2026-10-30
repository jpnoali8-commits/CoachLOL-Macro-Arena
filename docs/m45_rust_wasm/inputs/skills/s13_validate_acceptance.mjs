#!/usr/bin/env node
/** S13 source-and-contract verification. Explicitly NOT Rust compiler, parity, or E2E. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

export function validateInputs({matrix,sourceS12,receiptS12,receiptS10,contractS11,arbiterRust,projectileRust}) {
 let checks=0;
 const equal=(a,b,why)=>{assert.deepEqual(a,b,why);checks++;};
 const ok=(v,why)=>{assert.ok(v,why);checks++;};
 const PIN='f0b1147ac46e585a1d5374a178b1ea462f5dc278';
 const ENGINE='41679f7328a42e379fdfb8de5b92006e1bfb529f';
 equal(matrix.source_commit,PIN,'source pinned');
 equal(matrix.source_engine_git_blob,ENGINE,'engine pinned');
 equal(sourceS12.source_commit,PIN,'S12 source');
 equal(sourceS12.engine_git_blob_sha,ENGINE,'S12 engine');
 equal(receiptS12.engine_git_blob_sha,ENGINE,'S12 receipt engine');
 equal(contractS11.source_commit,PIN,'S11 source');
 equal(contractS11.engine_git_blob_sha,ENGINE,'S11 engine');
 equal(receiptS10.source_commit,PIN,'S10 source');
 equal(receiptS10.engine_git_blob_sha,ENGINE,'S10 engine');
 for(const [field,expected] of [['planned',26],['passed',22],['failed',2],['not_run',2]])
  equal(receiptS10.counts[field],expected,'S10 original suite '+field);
 equal(matrix.executable_legacy_evidence.S10.full_original_node,0,'no full Node certification');
 equal(matrix.executable_legacy_evidence.S11.assertions_v8_pass,66,'S11 source V8');
 equal(matrix.executable_legacy_evidence.S12.assertions_v8_pass,438,'S12 source V8');
 equal(receiptS12.verifications.assertions,438,'S12 measured assertions');
 equal(receiptS12.verifications.scenarios,34,'S12 measured scenarios');
 equal(receiptS12.verifications.inflight_snapshot_restore_scenarios,8,'S12 restoration measured');
 equal(sourceS12.snapshot_at_tick_1.length,8,'8 independent seed/seat snapshots');
 equal(new Set(sourceS12.snapshot_at_tick_1.map(x=>x.team+'_'+x.champ+'_'+x.spell_shield)).size,8,'unique snapshot setups');
 equal(matrix.rust_projectile_parity.distinct_cases_per_seat,13,'exclude known legacy input bug');
 equal(matrix.rust_projectile_parity.total_expected_case_executions,26,'26 planned Rust projectile checks');
 const srcIds=sourceS12.cases.map(x=>x.id);
 equal(new Set(srcIds).size,14,'14 distinct legacy source cases');
 const approved=matrix.rust_projectile_parity.approved_source_characterization_ids;
 equal(new Set(approved).size,13,'13 accepted authored cases');
 equal(srcIds.filter(x=>x!=='AHRI_E_LEGACY_INPUT').sort(),[...approved].sort(),'all non-bug source cases covered');
 equal(matrix.rust_projectile_parity.legacy_bug_excluded_from_parity_id,'AHRI_E_LEGACY_INPUT','intentional fix separated');
 const rustIds=[...projectileRust.matchAll(/Case\{id:"([^"]+)",slot:/g)].map(m=>m[1]);
 equal(rustIds.length,13,'Rust typed fixture count');
 equal(rustIds.sort(),[...approved].sort(),'Rust authored ids match S12 accepted fixtures');
 ok(projectileRust.includes('pub trait AuthoredProjectileRunner'),'typed Rust runner interface');
 ok(projectileRust.includes('pub fn check_runner'),'typed runner acceptance gate');
 ok(projectileRust.includes('pub const FIXTURES: [Case; 13]'),'typed fixture count pinned');
 ok(arbiterRust.includes('pub fn submit(&mut self, seat: Seat, cmd: PrimaryCast)'),'seat comes from authority');
 ok(arbiterRust.includes('RequestIdPayloadConflict'),'request id cannot silently be reused');
 ok(arbiterRust.includes('SlotAlreadyPending'),'single primary per slot');
 ok(arbiterRust.includes('RecastRequiresAuthorialExecutor'),'recast cannot be mistaken for ordinary cast');
 ok(arbiterRust.includes('pub fn take_for_commit'),'terminal consume');
 ok(arbiterRust.includes('pub fn begin_next_turn'),'turn gate');
 ok(arbiterRust.includes('fn nami_w_both_seats_both_queue_orders_cannot_double_commit'),'P0 negative test prepared');
 const testsArbiter=[...arbiterRust.matchAll(/#\[test\]\s*fn\s+(\w+)/g)].map(m=>m[1]);
 const testsProjectile=[...projectileRust.matchAll(/#\[test\]\s*fn\s+(\w+)/g)].map(m=>m[1]);
 equal(testsArbiter.length,6,'6 Rust arbiter unit tests prepared');
 equal(testsProjectile.length,2,'2 Rust source-data unit tests prepared');
 equal(matrix.rust_reference_sources[0].unit_tests_prepared,6,'Rust model test count');
 equal(matrix.rust_reference_sources[1].unit_tests_prepared,2,'Rust data test count');
 equal(matrix.prerequisites_not_yet_present.includes('core-combat'),true,'combat crate not available in pinned coordinator HEAD');
 equal(matrix.prerequisites_not_yet_present.includes('core-champions'),true,'champion crate not available in pinned coordinator HEAD');
 equal(matrix.gates.G8,'NOT_CERTIFIED','no certification claim');
 ok(matrix.deliberate_fidelity_fixes.some(x=>x.id==='M45_SKILLS_NAMI_W_STALE_INTENT'),'anti-ghost not dropped');
 ok(matrix.deliberate_fidelity_fixes.some(x=>x.id==='M45_SKILLS_AHRI_E_DISPATCH'),'authored adapter bug not dropped');
 return {status:'PASS_STATIC_CONTRACT_ONLY',checks,rust_arbiter_unit_tests_prepared:testsArbiter.length,
  rust_fixture_data_tests_prepared:testsProjectile.length,authored_projectile_future_native_cases:26,
  original_node:'NOT_RUN',rust_native:'NOT_RUN',wasm:'NOT_RUN',network:'NOT_RUN'};
}

// NODE_RUNNER_START (in isolated V8 the validation function above can run unchanged)
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const root=new URL('./',import.meta.url);
 const json=name=>JSON.parse(readFileSync(new URL(name,root),'utf8'));
 const source=name=>readFileSync(new URL(name,root),'utf8');
 const report=validateInputs({
  matrix:json('S13_RUST_ACCEPTANCE_MATRIX.json'),
  sourceS12:json('S12_AUTHORIAL_PROJECTILE_RUST_FIXTURES.json'),
  receiptS12:json('S12_V8_RUNTIME_RECEIPT.json'),
  receiptS10:json('S10_V8_EXECUTION_RECEIPT.json'),
  contractS11:json('S11_SKILL_ARBITER_RUST_CONTRACT.json'),
  arbiterRust:source('s13_intent_arbiter_reference.rs'),
  projectileRust:source('s13_projectile_acceptance.rs'),
 });
 console.log('M45_S13_STATIC_CONTRACT '+JSON.stringify(report));
}
