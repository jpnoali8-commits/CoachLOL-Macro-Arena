/** M19 bulk P+QWER manifest gate: all 173 in five 33–35-champion batches. */
import assert from 'node:assert/strict';
import {buildMacroBatches,assertMacroCoverage} from '../../tools/skills_macro_batch_planner_v453_dev69.mjs';
const plan=buildMacroBatches();
assert.equal(assertMacroCoverage(plan),true);
const {totals,batches,roster}=plan;
assert.equal(roster.length,173);
assert.equal(batches.reduce((n,b)=>n+b.count,0),173);
assert.ok(batches.every(b=>b.count>=33),'No tiny packs');
assert.ok(roster.every(x=>x.passive&&x.abilities.every(y=>y.name&&y.riotId)));
assert.ok(roster.every(x=>x.certification==='UNVERIFIED'&&!x.kitComplete),
 'Routing is not gameplay certification');
assert.ok(roster.every(x=>x.abilities.filter(a=>a.runtimeKind==='training').length===x.trainingSlots));
assert.ok(roster.every(x=>x.abilities.every(a=>a.description&&a.status)));
assert.ok(totals.fallback<=509,'A new unimplemented fallback may not increase baseline debt');
console.log('M19_BATCH_GATE '+JSON.stringify(totals));
for(const b of batches)console.log('M19_BATCH_GATE_ROW '+JSON.stringify({
 id:b.id,champions:b.count,trainingSlots:b.trainingSlots,
 names:b.champions}));
console.log('M19_BATCH_GATE_PASS '+roster.length+' champions + '+totals.passives+' passives + '+totals.qwerSlots+
 ' QWER in '+batches.length+' macro-batches; zero declared certified');
