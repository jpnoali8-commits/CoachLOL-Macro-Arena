// M45 Chat3 L08 — frozen Node ESM golden for 22 legacy effects and 4 skill-action/item adapters.
// Usage: node docs/m45_rust_wasm/inputs/items/golden_b08_effects_and_actions.test.mjs
//        node docs/m45_rust_wasm/inputs/items/golden_b08_effects_and_actions.test.mjs --write
// Never write executed results unless all assertions and repeat verification pass.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Arena,checksumV40} from '../../../../engine.mjs';
import {assertFrozenSourcesB03} from './oracle_source_lock_b03.mjs';
import {runEffectGapsB08} from './legacy_effect_gaps_b08_cases.mjs';
import {runSkillItemGateB08} from './skill_item_action_gate_b08_cases.mjs';

const lock=assertFrozenSourcesB03({shop:true});
const read=file=>JSON.parse(readFileSync(new URL('../../../../data/'+file,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const opts={Arena,map,mask,checksumV40};
const effects=runEffectGapsB08(opts),effectsReplay=runEffectGapsB08(opts);
const skillGate=runSkillItemGateB08(opts),skillReplay=runSkillItemGateB08(opts);
assert.equal(effects.summary.rule_ids.length,22,'22 previously uncovered rule ids');
assert.equal(new Set(effects.summary.rule_ids).size,22,'unique item ids');
assert.equal(effects.summary.planned,44,'22 effects x two teams');
assert.equal(effects.summary.passed,44,'all item cases must pass');
assert.equal(effects.summary.failed,0,JSON.stringify(effects.cases.filter(x=>x.status!=='PASS')));
assert.deepEqual(effectsReplay.cases,effects.cases,'44 case replay equality');
assert.equal(skillGate.summary.planned,8,'4 skill action adapters x two teams');
assert.equal(skillGate.summary.passed,8,'skill action gate expectations');
assert.equal(skillGate.summary.failed,0,JSON.stringify(skillGate.cases.filter(x=>x.status!=='PASS')));
assert.deepEqual(skillReplay.cases,skillGate.cases,'8 case replay equality');
assert.equal(effects.cases.filter(x=>x.team==='blue').length,22);
assert.equal(effects.cases.filter(x=>x.team==='red').length,22);
const output={schema:'coachlol.m45.items.golden.b08.v1',source_lock:lock,
 execution:'EXECUTED_NODE_ESM',warning:'legacy JS behavior only; no complete QWER or Rust/WASM parity',
 effects_summary:effects.summary,skill_action_summary:skillGate.summary,
 effects_cases:effects.cases,skill_action_cases:skillGate.cases,replay_equal_52:true};
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
if(process.argv.includes('--write'))
 writeFileSync(new URL('./GOLDEN_B08_EFFECTS_ACTIONS_EXECUTED.json',import.meta.url),
  JSON.stringify({...output,sha256:hash(output)},null,2)+'\n');
console.log(JSON.stringify({status:'PASS_SOURCE_NODE_ESM_ONLY',cases:52,
 repeated_equal:52,sha256:hash(output)}));
