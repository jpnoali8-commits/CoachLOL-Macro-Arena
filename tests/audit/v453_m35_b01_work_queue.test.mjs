import assert from 'node:assert/strict';
import {buildM35B01WorkQueue,M35_ENGINE_FAMILIES} from '../../tools/skills_m35_b01_cohort_work_queue.mjs';
import {BOARD_M20_B01_V453} from '../../engine.mjs';
const q=buildM35B01WorkQueue();
assert.equal(q.schema,'coachlol.skills.m35-b01-work-queue.v1');
assert.equal(q.metrics.champions,35);assert.equal(q.metrics.qwer,140);
assert.equal(q.metrics.passives,35);assert.equal(q.metrics.certifiedKits,0);
assert.equal(q.groups.length,M35_ENGINE_FAMILIES.length);
const seen=new Set(),teams=['blue','red'];
for(const c of q.champions){
 assert.equal(c.kitStatus,'NOT_CERTIFIED');
 assert.equal(c.dimensions.length,17);
 assert.ok(c.passiveId&&c.witness?.identity);
 assert.equal(c.abilities.length,4);
 for(const skill of c.abilities){
  assert.deepEqual(skill.blocking.includes('not_full_ability'),true,
   'partial slots must never be promoted by scheduling');
  assert.ok(skill.referenceIdentity);
  assert.equal(skill.status,'PENDING_FULL_KIT_CERTIFICATION');
  assert.equal(skill.workFamilies.length>=1,true);
  assert.ok(BOARD_M20_B01_V453[c.champion]?.[skill.slot]);
  const key=c.champion+skill.slot;
  assert.equal(seen.has(key),false,'duplicate slot '+key);seen.add(key);
 }
}
assert.equal(seen.size,140);
assert.equal(q.metrics.unresolvedLegacyTags,20); // M38: 32 previously-proven debts retired
console.log('M35_B01_COHORT_QUEUE_QA '+JSON.stringify({
 champions:35,qwer:140,dimensions:17,workFamilies:q.groups.length,
 legacyTags:q.metrics.unresolvedLegacyTags,certifiedKits:0}));
