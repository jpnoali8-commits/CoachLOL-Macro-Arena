import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateGatewayKitEvidence } from '../../docs/m45_rust_wasm/inputs/core/b02b/validate_gateway_kit_evidence.mjs';

const dir = new URL('../../docs/m45_rust_wasm/inputs/core/b02b/', import.meta.url);
const pin = Object.freeze({
  wire:['B02B_GATEWAY_KIT_V8_EXECUTED.json','30375b17c600b65eef953988f149c6408c588da1'],
  catalog:['B02B_CLIENT_KIT_SOURCE_DISCOVERY.json','4dec9b0da3e40252b1929217f87455652fa05ff8'],
});
const blobSha = bytes => createHash('sha1')
  .update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
const evidence = {};
for (const [name,[file,sha]] of Object.entries(pin)) {
  const bytes=readFileSync(new URL(file,dir));
  assert.equal(blobSha(bytes),sha,'evidence changed: '+file);
  evidence[name]=JSON.parse(bytes.toString('utf8'));
}
test('gateway reachability: 14 real V8 routes + 4 first/followup combo witnesses',()=>{
  assert.deepEqual(validateGatewayKitEvidence(evidence.wire,evidence.catalog),{
    status:'PASS_EVIDENCE_ONLY',gateway_routes:14,gateway_accepted:2,
    gateway_denied:12,ahri_denied:6,nami_other_routes_denied:6,
    combo_synthetic:4,combo_deferred_w:0,authorial_m44_not_in_legacy_kits:14,
    node_esm_certified:false,rust_certified:false,
  });
});
test('truncated or fabricated success for Ahri E must not pass the evidence gate',()=>{
  const copy=structuredClone(evidence.wire);
  copy.routes.find(c=>c.champ==='Ahri').ack.ok=true;
  assert.throws(()=>validateGatewayKitEvidence(copy,evidence.catalog),/B02B_GATEWAY_INTEGRITY/);
});
test('missing M44 authored champion in old /api/kits is NOT a Rust gameplay PASS',()=>{
  assert.equal(evidence.catalog.inspected.actual_http_get_kits,'NOT_RUN');
  assert.equal(evidence.catalog.inspected.two_real_browsers,'NOT_RUN');
  assert.equal(evidence.catalog.catalog.m44_not_in_legacy_board_kits.length,14);
});
