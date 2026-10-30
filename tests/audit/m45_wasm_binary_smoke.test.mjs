// Executes the actual Rust wasm32-unknown-unknown binary. Not a JS approximation.
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const url = new URL('../../target/wasm32-unknown-unknown/release/coachlol_core_state.wasm', import.meta.url);
const bytes = readFileSync(url);
const { instance } = await WebAssembly.instantiate(bytes, {});
const e = instance.exports;
function wasmHash(text) {
  const units = Uint16Array.from({ length: text.length }, (_, i) => text.charCodeAt(i));
  const ptr = e.coachlol_m45_alloc_utf16(units.length);
  assert.notEqual(ptr, 0, 'WASM allocation failed');
  try {
    new Uint16Array(e.memory.buffer, ptr, units.length).set(units);
    return e.coachlol_m45_fnv1a_utf16(ptr, units.length) >>> 0;
  } finally {
    e.coachlol_m45_free_utf16(ptr, units.length);
  }
}
test('WASM exposes only public hash ABI, no hidden gameplay decision API', () => {
  assert.equal(e.coachlol_m45_version(), 45);
  for (const sym of ['coachlol_m45_alloc_utf16','coachlol_m45_fnv1a_utf16','coachlol_m45_free_utf16'])
    assert.equal(typeof e[sym], 'function');
  assert.ok(e.memory instanceof WebAssembly.Memory);
  assert.ok(!Object.keys(e).some(k => /smite|resolve|winner|hidden|private|seed/i.test(k)));
  assert.equal(e.coachlol_m45_alloc_utf16(1_048_577), 0);
});
test('WASM public UTF-16 hash agrees with 18 frozen legacy objective fixtures', () => {
  const fixture = readFileSync(new URL('../fixtures/m45_no_smite.tsv', import.meta.url), 'utf8');
  let count = 0;
  for (const line of fixture.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const [seed, camp, spawn, tick, blue, red, hash] = line.split('\t');
    if (hash !== '-') {
      assert.ok(Number(blue) > 0 && Number(red) > 0);
      assert.equal(wasmHash(`${seed}|${camp}|${spawn}|${tick}`), Number(hash), line);
    }
    count++;
  }
  assert.equal(count, 18);
  assert.equal(wasmHash('🦊🌟'), 2651728568);
});
