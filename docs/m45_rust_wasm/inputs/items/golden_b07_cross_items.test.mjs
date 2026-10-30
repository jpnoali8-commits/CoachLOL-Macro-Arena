// M45 Chat 3 B02B-ITEMS L07 — cross-item PvP source oracle (no new gameplay).
// Requires a complete checkout on the audit branch, no Actions budget.
// node docs/m45_rust_wasm/inputs/items/golden_b07_cross_items.test.mjs
// node docs/m45_rust_wasm/inputs/items/golden_b07_cross_items.test.mjs --write
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../../../engine.mjs';
import {assertFrozenSourcesB03} from './oracle_source_lock_b03.mjs';
import {runCrossItemsB07} from './cross_items_b07_cases.mjs';

const source_lock=assertFrozenSourcesB03({shop:true});
const read=file=>JSON.parse(readFileSync(new URL('../../../../data/'+file,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const args={Arena,map,mask,checksumV40};
const first=runCrossItemsB07(args);
const second=runCrossItemsB07(args);
assert.equal(first.summary.planned,46,'23 cross-item scenarios x both PvP teams');
assert.equal(first.scenarios.length,23,'keep all 23 authored scenario types');
assert.equal(first.summary.failed,0,JSON.stringify(first.cases.filter(x=>x.status!=='PASS')));
assert.equal(first.summary.passed,46,'no missing/blocked cases');
assert.deepEqual(second.cases,first.cases,'seed + same source must produce same receipts/checksums');
assert.equal(first.cases.filter(x=>x.team==='blue').length,23);
assert.equal(first.cases.filter(x=>x.team==='red').length,23);
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const output={schema:'coachlol.m45.items.golden.cross.b07.v1',
 source_commit:source_lock.source_commit,source_lock,
 execution:'EXECUTED_NODE_ESM',meaning:'Legacy source cross-item combat; not Rust/WASM parity',
 cases: first.cases,summary:first.summary,scenario_ids:first.scenarios,replay_equal:true};
if(process.argv.includes('--write'))
 writeFileSync(new URL('./GOLDEN_B07_CROSS_ITEMS_EXECUTED.json',import.meta.url),
  JSON.stringify({...output,sha256:digest(output)},null,2)+'\n');
console.log(JSON.stringify({status:'PASS_SOURCE_NODE_ESM_ONLY',tested:first.summary.planned,
 replay_equal:true,sha256:digest(output)},null,2));
