// M45 B02B: immutable legacy witness assertions. Does not run Rust or a gameplay engine.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateNamiWLegacyWitness } from '../../docs/m45_rust_wasm/inputs/core/b02b/validate_nami_w_witness.mjs';

const file = new URL('../../docs/m45_rust_wasm/inputs/core/b02b/B02B_NAMI_W_V8_EXECUTED.json', import.meta.url);
const plan = new URL('../../docs/m45_rust_wasm/inputs/core/b02b/skills_s09_golden_plan.json', import.meta.url);
const blob = data => createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');
const bytes = readFileSync(file);
const data = JSON.parse(bytes.toString('utf8'));
test('Nami W V8 receipt is the GitHub-pinned witness blob', () => {
  assert.equal(blob(bytes),'06d36ff35a4bc44f45c6a1806f947833b1a2a14b');
});
test('blue/red, isolated and concurrent routes reproduce 4 stale W out of 8', () => {
  const result = validateNamiWLegacyWitness(data);
  assert.deepEqual(result, {
    status:'PASS_RECEIPT_ONLY',cases:8,controls:4,legacy_ghost_casts:4,
    blue:4,red:4,rust_certified:false,node_esm_certified:false,
  });
});
test('receipt verifier rejects altered mana and accidental fabricated PASS', () => {
  const modified=structuredClone(data);
  modified.cases[0].afterCooldown.mana=360;
  assert.throws(()=>validateNamiWLegacyWitness(modified),/M45 NAMI W/);
});
test('specialist plan preserves full Node skills suite NOT_RUN', () => {
  const p=JSON.parse(readFileSync(plan,'utf8'));
  assert.equal(p.suites.length,26);
  assert.equal(p.suites.filter(s=>s.run_result!==null).length,0);
  assert.ok(p.suites.some(s=>s.id==='s09_nami_w_stale_intent'));
});
