// M45 B02B-06: B06 adversarial golden execution on the frozen Node ESM engine.
// Usage: node docs/m45_rust_wasm/inputs/items/golden_b06_adversarial.test.mjs
//        node docs/m45_rust_wasm/inputs/items/golden_b06_adversarial.test.mjs --write
// Source implementation is shared with the V8 audit, without duplicated cases.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../../../engine.mjs';
import {AuthoritativeActionsV453Dev47} from '../../../../multiplayer/authoritative_actions_v453_dev47.mjs';
import {runAdversarialItemsB06} from './adversarial_b06_cases.mjs';
import {assertFrozenSourcesB03} from './oracle_source_lock_b03.mjs';

const source_lock=assertFrozenSourcesB03({server:true});
const read=file=>JSON.parse(readFileSync(new URL('../../../../data/'+file,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const opts={Arena,Gateway:AuthoritativeActionsV453Dev47,map,mask,checksumV40};
const first=runAdversarialItemsB06(opts);
const replay=runAdversarialItemsB06(opts);
assert.equal(first.summary.planned,92,'B06 expected 92 cases including legacy gap');
assert.equal(first.summary.passed,92,'B06 adversarial conditions must all match');
assert.equal(first.summary.failed,0,'B06 must not silently suppress failures');
assert.equal(first.summary.negative_gap_cases,2,'Missing legacy trinket route remains an OPEN functional defect');
assert.equal(first.summary.gateway_cases,29);
assert.equal(first.summary.economy_cases,60);
assert.equal(first.summary.replay_contract_cases,1);
assert.deepEqual(replay.cases,first.cases,'All 92 source-run scenarios must reproduce with the same seed');
const sha256=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const output={schema:'coachlol.m45.items.golden.adversarial.b06.v1',
 source_commit:source_lock.source_commit,source_lock,
 tested_with:'Node ESM source (Arena + authoritative gateway dev47)',
 explicit_p1_open:true,
 replay_equal_92:true,execution:'EXECUTED',summary:first.summary,cases:first.cases};
const digest=sha256(output);
if(process.argv.includes('--write'))
 writeFileSync(new URL('./GOLDEN_B06_ADVERSARIAL_EXECUTED.json',import.meta.url),
   JSON.stringify({...output,sha256:digest},null,2)+'\n');
console.log(JSON.stringify({status:'PASS_WITH_OPEN_P1_TRINKET_GAP',cases:first.summary.planned,
 replay_equal:true,sha256:digest},null,2));
