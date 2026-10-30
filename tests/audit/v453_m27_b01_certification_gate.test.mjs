import assert from 'node:assert/strict';
import {buildM27B01Audit,M27_CERTIFICATION_DIMENSIONS} from '../../tools/skills_m27_b01_completeness_audit.mjs';
import {BOARD_M20_B01_V453} from '../../engine.mjs';
const audit=buildM27B01Audit();
assert.deepEqual(audit.metrics,{champions:35,QWER:140,certifiedChampions:0});
assert.equal(audit.champions.length,35);
assert.equal(new Set(audit.champions.map(v=>v.champion)).size,35);
for(const champion of audit.champions){
 assert.ok(BOARD_M20_B01_V453[champion.champion]);
 assert.equal(champion.certification,'NOT_CERTIFIED');
 assert.ok(typeof champion.passiveId==='string'&&champion.passiveId.length);
 assert.deepEqual(Object.keys(champion.QWER),['Q','W','E','R']);
 assert.deepEqual(Object.keys(champion.dimensionGates),M27_CERTIFICATION_DIMENSIONS);
 for(const slot of ['Q','W','E','R']){
  const rule=champion.QWER[slot];
  assert.equal(rule.status,'EXECUTABLE_PARTIAL_NOT_CERTIFIED');
  assert.ok(typeof rule.shape==='string',champion.champion+' '+slot);
  assert.equal(rule.requires.effect,true);
  assert.equal(rule.requires.snapshot,true);
  assert.equal(rule.requires.counterplay,true);
 }
 for(const state of Object.values(champion.dimensionGates))
  assert.equal(state,'NOT_CERTIFIED_PENDING_ADVERSARIAL_KIT_QA');
}
console.log('M27_B01_FULL_CERTIFICATION_GATE '+JSON.stringify({
 champions:audit.metrics.champions,passives:audit.champions.length,
 QWER:audit.metrics.QWER,dimensions:M27_CERTIFICATION_DIMENSIONS.length,
 certifiedChampions:0,trainingFallbackDeclaredAsCertified:0
}));
