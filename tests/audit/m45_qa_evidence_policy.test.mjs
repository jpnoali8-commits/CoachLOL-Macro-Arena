import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gateG1, statusFromSpawn, TASKS } from '../../tools/m45_qa_evidence.mjs';
const verified = Object.fromEntries(['native', 'fmt', 'clippy', 'target', 'wasmBuild', 'wasmSmoke'].map(k => [k, {status:'PASS'}]));
test('mock JS adapter PASS cannot promote G1', () => {
  assert.equal(gateG1({adapter:{status:'PASS'}}), 'NOT_RUN');
  assert.equal(gateG1({...verified, wasmSmoke:{status:'NOT_RUN'}, adapter:{status:'PASS'}}), 'NOT_RUN');
});
test('G1 only advances with all six native/target/WASM baseline checks PASS', () => {
  assert.equal(gateG1(verified), 'PASS_BASELINE_ONLY');
});
test('any compiler failure makes G1 FAIL, not PASS or skipped', () => {
  assert.equal(gateG1({...verified, native:{status:'FAIL'}}), 'FAIL');
  assert.equal(gateG1({...verified, wasmBuild:{status:'FAIL'}}), 'FAIL');
  assert.equal(gateG1({...verified, clippy:{status:'FAIL'}}), 'FAIL');
});
test('missing Rust is BLOCKED; process exit nonzero is FAIL', () => {
  assert.equal(statusFromSpawn({status:null,error:{code:'ENOENT'}}),'BLOCKED');
  assert.equal(statusFromSpawn({status:101}), 'FAIL');
  assert.equal(statusFromSpawn({status:0}), 'PASS');
  assert.equal(Object.keys(TASKS).length, 9);
});
