#!/usr/bin/env node
/** M45 S14 source integrity validator; NOT Rust execution or native combat parity. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

export function validateInputs({receipt, s10Plan, rustSource}) {
 let checks=0;
 function eq(a,b,why){assert.deepEqual(a,b,why);checks++;}
 function ok(v,why){assert.ok(v,why);checks++;}
 const pin='f0b1147ac46e585a1d5374a178b1ea462f5dc278';
 const engine='41679f7328a42e379fdfb8de5b92006e1bfb529f';
 eq(receipt.source_commit,pin,'immutable source commit');
 eq(receipt.engine_git_blob,engine,'immutable engine blob');
 eq(s10Plan.source_commit,pin,'S10 immutable source');
 eq(s10Plan.engine_git_blob_sha,engine,'S10 engine matches');
 eq(receipt.summary.suites_total,4,'4 original legacy suites');
 eq(receipt.summary.suites_pass,4,'4 original legacy passes');
 eq(receipt.summary.source_scenarios,154,'154 distinct executions this rerun');
 eq(receipt.summary.source_scenarios_pass,154,'154 passed');
 eq(receipt.summary.assertions,1894,'1894 source assertions');
 eq(receipt.summary.assertions_pass,1894,'1894 assertions passed');
 eq(receipt.summary.snapshots_checked,154,'154 endpoint snapshot checks');
 eq(receipt.suites.length,4,'four suite receipts saved');
 const expected=[
  ['M44_B14C_SYLAS','122014a5690277ab1ee3ea88054545d63569901d',22,266],
  ['M44_B14C_VIEGO','df33700bb71565d10665f8be763e3dce41429366',22,192],
  ['M44_B14D_COPY','c720308368d3ce474f2d5eae767b4f849ad05a37',78,974],
  ['M44_B17_COPY','f84512a69664f46beaf4949fb57d6269138269ce',32,462],
 ];
 for(let i=0;i<4;i++){
  const r=receipt.suites[i],e=expected[i];
  eq(r.id,e[0],'source suite ID '+i);
  eq(r.blob_sha,e[1],'source git SHA '+i);
  eq(r.cases,e[2],'cases '+i);
  eq(r.checks,e[3],'assertions '+i);
  eq(r.snapshots,e[2],'snapshot count '+i);
  eq(r.status,'V8_PASS','V8 result '+i);
  ok(r.original_log.includes('"failures":0'),'original source summary '+i);
 }
 eq(receipt.suites.reduce((a,b)=>a+b.cases,0),154,'no missing cases');
 eq(receipt.suites.reduce((a,b)=>a+b.checks,0),1894,'no missing assertions');
 eq(receipt.suites.reduce((a,b)=>a+b.snapshots,0),154,'all snapshots');
 const s10=s10Plan.suites.filter(s=>s.test_git_blob_sha==='c720308368d3ce474f2d5eae767b4f849ad05a37');
 eq(s10.length,1,'B14D included in S10 source set exactly once');
 eq(s10[0].v8_isolated_s10.status,'V8_PASS','S10 B14D already passing');
 eq(receipt.uncoupled_evidence.three_original_suites_outside_s10_cases,76,
  'Only 76 source cases are outside prior S10 selection');
 eq(receipt.uncoupled_evidence.three_original_suites_outside_s10_assertions,920,
  'Only 920 source assert checks are outside prior S10 selection');
 eq(receipt.s10_matrix_unchanged.v8_pass,22,'S10 passes remain 22');
 eq(receipt.s10_matrix_unchanged.v8_fail,2,'S10 failures remain 2');
 eq(receipt.s10_matrix_unchanged.not_run,2,'S10 unrun remain 2');
 eq(receipt.s10_matrix_unchanged.full_node,0,'original node remain unrun');
 eq(receipt.not_run.rust_native,true,'Rust native unrun');
 eq(receipt.not_run.wasm,true,'WASM unrun');
 eq(receipt.not_run.server_session_http,true,'real HTTP unrun');
 ok(rustSource.includes('pub trait AuthoritativeBorrowRunner'),'actual Rust interface');
 ok(rustSource.includes('pub fn validate_against_actual_rust'),'acceptance requires real Rust runner');
 ok(rustSource.includes('extra_mana_for_stolen_r!=0'),'no double-cost R');
 ok(rustSource.includes('borrowed_p_qwe_source.as_deref()!=Some(case.source_champion)'),'source QWE identity');
 ok(rustSource.includes('native_viego_r_retained'),'Viego native R required');
 ok(rustSource.includes('donor_passive_leaked_to_sylas'),'no cross-passive contamination');
 ok(rustSource.includes('authenticated_owner != seat'),'seat authority invariant');
 ok(rustSource.includes('replay_state_equivalent'),'snapshot replay invariant');
 const syl=rustSource.match(/pub const SYLAS_ORIGINAL_R:[^=]+=[\s\S]*?\];/);
 const vie=rustSource.match(/pub const VIEGO_BORROW_P_QWE:[^=]+=[\s\S]*?\];/);
 ok(!!syl && !!vie,'two explicit source corpora');
 const champs=segment=>[...segment.matchAll(/"([A-Za-z]+)"/g)].map(m=>m[1]);
 const actualSyl=champs(syl[0]),actualVie=champs(vie[0]);
 eq(actualSyl.length,15,'15 original R champions in Rust acceptance');
 eq(new Set(actualSyl).size,15,'no R duplicates');
 eq(actualVie.length,12,'12 original P/QWE champions in Rust acceptance');
 eq(new Set(actualVie).size,12,'no P/QWE duplicates');
 for(const champion of ['Bard','Malzahar','Viego','Kalista'])
  ok(actualSyl.includes(champion),'original R '+champion+' included');
 for(const champion of ['Hwei','Azir','Bard','Twitch','Teemo','Nidalee'])
  ok(actualVie.includes(champion),'donor '+champion+' included');
 eq(rustSource.includes('pub const REQUIRED_NEGATIVE_CASES: [&str; 10]'),true,
  'ten security and identity negative cases remain explicit');
 const rustPrepared=[...rustSource.matchAll(/#\[test\]\s*fn\s+(\w+)/g)].map(m=>m[1]);
 eq(rustPrepared.length,4,'four source-only Rust unit tests prepared, not executed');
 return {
  status:'V8_STATIC_CONTRACT_PASS',source_suite_reexecution:'154/154',
  source_assertions:'1894/1894',source_prior_s10_overlap:78,
  source_new_outside_s10:76,checks,
  rust_reference_unit_tests_prepared:4,rust_executed:0,
  native:'NOT_RUN',wasm:'NOT_RUN',node_esm:'NOT_RUN',http:'NOT_RUN',
 };
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const root=new URL('./',import.meta.url);
 const json=n=>JSON.parse(readFileSync(new URL(n,root),'utf8'));
 const rust=readFileSync(new URL('s14_sylas_viego_rust_acceptance.rs',root),'utf8');
 console.log('M45_S14_CONTRACT '+JSON.stringify(validateInputs({
  receipt:json('S14_SYLAS_VIEGO_ORIGINAL_V8_RECEIPT.json'),
  s10Plan:json('golden_plan.json'),rustSource:rust
 })));
}
