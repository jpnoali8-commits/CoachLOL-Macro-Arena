import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  resolveNoSmiteObjectiveV452d4Dev9,
  resolveSimultaneousSmiteV452d4Dev9,
} from '../fixtures/m45_integration_smite_source_snapshot.mjs';

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const sha1Blob = content => createHash('sha1').update(`blob ${content.length}\0`).update(content).digest('hex');
const originalEngineBlob = '1737f4f675bd9cc5ed0a48defc68b2fddc124d71';
const sourceSnapshot = readFileSync(new URL('../fixtures/m45_integration_smite_source_snapshot.mjs', import.meta.url), 'utf8');
const sourceSnapshotBlobSha = '5226234262b5ce9dfa10d61e40e6131b03530db5';
test('isolated source snapshot is the pinned reviewed blob', () => {
  assert.equal(sha1Blob(Buffer.from(sourceSnapshot, 'utf8')), sourceSnapshotBlobSha);
});
const names = ['resolveSimultaneousSmiteV452d4Dev9', 'resolveNoSmiteObjectiveV452d4Dev9'];
function originalFunction(source, name) {
  const start = source.indexOf(`export function ${name}(`);
  assert.ok(start >= 0, `Missing legacy ${name}`);
  const end = source.indexOf('\n}\n', start);
  assert.ok(end >= start, `Malformed legacy ${name}`);
  return source.slice(start, end + 3);
}

// In a complete checkout, reject drift against the actual pinned engine source.
// In an isolated source snapshot, only the copied functions are executed.
const originalPath = resolve(repoRoot, 'engine.mjs');
if (existsSync(originalPath)) {
  test('source snapshot exactly matches the pinned integration engine', () => {
    const original = readFileSync(originalPath);
    assert.equal(sha1Blob(original), originalEngineBlob,
      'Use dev69/integration@374d87d5 (or frozen Rust branch), not a different engine');
    const text = original.toString('utf8');
    for (const name of names) assert.ok(sourceSnapshot.includes(originalFunction(text, name)), name);
  });
} else {
  console.log('M45_SOURCE_SNAPSHOT_ONLY: engine.mjs absent; original file SHA cannot be checked locally');
}
const lines = readFileSync(new URL('../fixtures/m45_no_smite.tsv', import.meta.url), 'utf8')
  .split(/\r?\n/).filter(line => line && !line.startsWith('#'));
assert.equal(lines.length, 18, 'Fixture corpus changed');
for (const [index, line] of lines.entries()) {
  test(`isolated legacy no-Smite golden ${index + 1}/18`, () => {
    const [s, camp, cy, tick, b, r, expectedHash, expectedWinner] = line.split('\t');
    const actual = resolveNoSmiteObjectiveV452d4Dev9(+s, camp, +cy, +tick, +b, +r);
    assert.equal(actual.winner, expectedWinner === '-' ? null : expectedWinner, line);
    const blue = Math.max(0, Math.min(5, Math.trunc(Number(b) || 0)));
    const red = Math.max(0, Math.min(5, Math.trunc(Number(r) || 0)));
    assert.equal(actual.blue, blue, line);
    assert.equal(actual.red, red, line);
    assert.equal(actual.blueProbability, blue / (blue + red || 1), line);
    assert.equal(actual.roll, expectedHash === '-' ? null : Number(expectedHash) / 4294967296, line);
  });
}
for (const [index, [hp, impacts, expectedWinner, expectedTotal]] of [
  [1500, [{actorId:'blue_JG',hit:1200},{actorId:'red_JG',hit:900}], 'blue_JG', 2100],
  [1100, [{actorId:'red_JG',hit:1200},{actorId:'blue_JG',hit:1200}], 'blue_JG', 2400],
  [100, [{actorId:'red_JG',hit:NaN},{actorId:'blue_JG',hit:0}], null, 0],
].entries()) {
  test(`isolated legacy simultaneous Smite ${index + 1}/3`, () => {
    const result = resolveSimultaneousSmiteV452d4Dev9(hp, impacts);
    assert.equal(result.winner?.actorId ?? null, expectedWinner);
    assert.equal(result.total, expectedTotal);
  });
}
