// M45 B02A — tests the actual JS public adapter against a mock ABI.
// This is NOT a native Rust/WASM parity or compiled-binary test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { m45PublicHashFromWasm } from '../../src/wasm/m45_public_hash.mjs';

function fnvUtf16(units) {
  let hash = 0x811c9dc5;
  for (const codeUnit of units) hash = Math.imul(hash ^ codeUnit, 0x01000193) >>> 0;
  return hash;
}
function mockPublicAbi({ version = 45, allocationFails = false, hashThrows = false } = {}) {
  const memory = new WebAssembly.Memory({ initial: 2 });
  const record = { allocations: [], frees: [], hashes: [] };
  const exports = {
    memory,
    coachlol_m45_version: () => version,
    coachlol_m45_alloc_utf16: len => {
      record.allocations.push(len);
      return allocationFails ? 0 : 1024;
    },
    coachlol_m45_free_utf16: (ptr, len) => record.frees.push([ptr, len]),
    coachlol_m45_fnv1a_utf16: (ptr, len) => {
      if (hashThrows) throw new Error('simulated ABI failure');
      const words = [...new Uint16Array(memory.buffer, ptr, len)];
      record.hashes.push(words);
      return fnvUtf16(words);
    },
  };
  return { exports, record };
}
const fixture = readFileSync(new URL('../fixtures/m45_no_smite.tsv', import.meta.url), 'utf8');
const cases = fixture.split(/\r?\n/).filter(line => line && !line.startsWith('#'));

test('frozen 18-case Smite table is still internally consistent against the public JS ABI contract', () => {
  assert.equal(cases.length, 18);
  let contested = 0, uncontested = 0;
  for (const line of cases) {
    const [seed, camp, spawn, tick, blueRaw, redRaw, hashRaw, winnerRaw] = line.split('\t');
    const blue = Math.min(5, Math.max(0, Number(blueRaw)));
    const red = Math.min(5, Math.max(0, Number(redRaw)));
    if (blue === 0 || red === 0) {
      assert.equal(hashRaw, '-', line);
      assert.equal(winnerRaw, '-', line);
      uncontested++;
      continue;
    }
    const abi = mockPublicAbi();
    const hash = m45PublicHashFromWasm(abi, Number(seed), camp, Number(spawn), Number(tick));
    assert.equal(hash, Number(hashRaw), line);
    const roll = hash / 4294967296;
    assert.equal(roll < blue / (blue + red) ? 'blue' : 'red', winnerRaw, line);
    assert.equal(abi.record.allocations.length, 1);
    assert.equal(abi.record.frees.length, 1);
    assert.equal(abi.record.hashes.length, 1);
    contested++;
  }
  assert.equal(contested, 15);
  assert.equal(uncontested, 3);
});

test('UTF-16 surrogate pairs and signed coordinates use charCodeAt semantics', () => {
  const abi = mockPublicAbi();
  const hash = m45PublicHashFromWasm(abi, 315, 'elder🐉', 2, 40);
  assert.equal(hash, 2842739212);
  const key = '315|elder🐉|2|40';
  assert.deepEqual(abi.record.hashes[0], [...key].flatMap(s => s.length===2 ? [s.charCodeAt(0),s.charCodeAt(1)] : [s.charCodeAt(0)]));
});

test('adapter rejects malformed/version-mismatched public ABI and invalid integer/string inputs', () => {
  const abi = mockPublicAbi();
  assert.throws(() => m45PublicHashFromWasm(mockPublicAbi({ version: 44 }), 1, 'dragon', 1, 1), /invalid M45/);
  for (const bad of [NaN, Infinity, 2 ** 53, 1.5, '11']) {
    assert.throws(() => m45PublicHashFromWasm(abi, bad, 'dragon', 1, 1), /integer coordinates/);
  }
  assert.throws(() => m45PublicHashFromWasm(abi, 1, {}, 1, 1), /campId must be a string/);
  assert.equal(abi.record.allocations.length, 0);
});

test('allocation failure and trap never claim a successful hash; allocated memory is freed on trap', () => {
  const failed = mockPublicAbi({ allocationFails: true });
  assert.throws(() => m45PublicHashFromWasm(failed, 1, 'dragon', 1, 1), /allocation failed/);
  assert.equal(failed.record.frees.length, 0);
  const trapped = mockPublicAbi({ hashThrows: true });
  assert.throws(() => m45PublicHashFromWasm(trapped, 1, 'dragon', 1, 1), /simulated ABI failure/);
  assert.deepEqual(trapped.record.frees, [[1024, '1|dragon|1|1'.length]]);
});
