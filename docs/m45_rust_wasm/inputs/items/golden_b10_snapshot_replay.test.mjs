// M45 Chat 3 B10 — Node oracle. Never mark V8 as Node execution.
// node docs/m45_rust_wasm/inputs/items/golden_b10_snapshot_replay.test.mjs [--write]
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Arena,checksumV40} from '../../../../engine.mjs';
import {assertFrozenSourcesB03} from './oracle_source_lock_b03.mjs';
import {runItemsSnapshotReplayB10} from './snapshot_replay_b10_cases.mjs';
const lock=assertFrozenSourcesB03({shop:true});
const data=n=>JSON.parse(readFileSync(new URL('../../../../data/'+n,import.meta.url),'utf8'));
const args={Arena,map:data('coachlol_map_v6.json'),mask:data('masks_128.json'),checksumV40};
const one=runItemsSnapshotReplayB10(args),two=runItemsSnapshotReplayB10(args);
assert.equal(one.summary.scenarios,12);
assert.equal(one.summary.planned,24);
assert.equal(one.summary.failed,0,JSON.stringify(one.cases.filter(c=>c.status!=='PASS')));
assert.equal(one.summary.passed,24);
assert.equal(one.cases.filter(x=>x.team==='blue').length,12);
assert.equal(one.cases.filter(x=>x.team==='red').length,12);
assert.deepEqual(one.cases,two.cases,'24 deterministic source replay cases');
const out={schema:'coachlol.m45.items.snapshot_replay.golden.b10.v1',
 execution:'EXECUTED_NODE_ESM',source_lock:lock,summary:one.summary,
 cases:one.cases,deterministic_repeat:true,
 warning:'Legacy engine test only; no PvP room, Rust native, WASM or G8 certification'};
const sha256=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
if(process.argv.includes('--write'))writeFileSync(new URL('./GOLDEN_B10_SNAPSHOT_REPLAY_EXECUTED.json',import.meta.url),JSON.stringify({...out,sha256:sha256(out)},null,2)+'\n');
console.log(JSON.stringify({status:'PASS_LEGACY_NODE_ESM_ONLY',cases:24,sha256:sha256(out)}));
