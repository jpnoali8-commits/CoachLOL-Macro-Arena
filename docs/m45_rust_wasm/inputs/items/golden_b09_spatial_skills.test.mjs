// M45 Chat 3 B02B-ITEMS B09 — real minion-body collision and actual skill resolution.
// Executes frozen Node ESM source. Never fake a result when checkout is absent.
// node docs/m45_rust_wasm/inputs/items/golden_b09_spatial_skills.test.mjs
// node docs/m45_rust_wasm/inputs/items/golden_b09_spatial_skills.test.mjs --write
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Arena,checksumV40} from '../../../../engine.mjs';
import {assertFrozenSourcesB03} from './oracle_source_lock_b03.mjs';
import {runSpatialSkillsB09} from './spatial_skill_b09_cases.mjs';
const lock=assertFrozenSourcesB03({shop:true});
const read=file=>JSON.parse(readFileSync(new URL('../../../../data/'+file,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const args={Arena,map,mask,checksumV40};
const first=runSpatialSkillsB09(args);
const replay=runSpatialSkillsB09(args);
assert.equal(first.summary.planned,30,'Expected 15 original-source scenarios x both seats');
assert.equal(first.summary.spatial_cases,12,'Six real-wave/terrain cases x two seats');
assert.equal(first.summary.actual_skill_cases,18,'Nine actual Ezreal Q/Nami W tests x two seats');
assert.equal(first.summary.failed,0,JSON.stringify(first.cases.filter(x=>x.status!=='PASS')));
assert.equal(first.summary.passed,30,'No missing scenarios');
assert.deepEqual(replay.cases,first.cases,'30 seeded cases must repeat identically');
assert.equal(first.cases.filter(x=>x.team==='blue').length,15);
assert.equal(first.cases.filter(x=>x.team==='red').length,15);
const output={schema:'coachlol.m45.items.spatial_skills.golden.b09.v1',
 source_lock:lock,execution:'EXECUTED_NODE_ESM',
 warning:'Original JS engine only; test fixture swaps champion identity for Ezreal/Nami source paths; not complete QWER/HTTP/Rust/WASM parity',
 summary:first.summary,cases:first.cases,deterministic_repeat:true};
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
if(process.argv.includes('--write')){
 writeFileSync(new URL('./GOLDEN_B09_SPATIAL_SKILLS_EXECUTED.json',import.meta.url),
  JSON.stringify({...output,sha256:digest(output)},null,2)+'\n');
}
console.log(JSON.stringify({status:'PASS_LEGACY_NODE_ESM_ONLY',cases:first.summary.planned,sha256:digest(output)}));
