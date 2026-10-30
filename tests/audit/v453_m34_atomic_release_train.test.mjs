/**
 * M34 release train: 173 official champion references + real runtime/B01
 * identities. Cannot claim kits complete merely from routing, names, 2-seat
 * witness tests, generic effects, or unexecuted QA file strings.
 */
import assert from 'node:assert/strict';
import {buildM34AtomicReleaseTrain,M34_DIMS} from '../../tools/skills_m34_atomic_release_train.mjs';
import {M27_CERTIFICATION_DIMENSIONS} from '../../tools/skills_m27_b01_completeness_audit.mjs';
import {BOARD_M20_B01_V453} from '../../engine.mjs';
const train=buildM34AtomicReleaseTrain();
assert.equal(train.schema,'coachlol.skills.atomic-release.v1');
assert.deepEqual(M34_DIMS,M27_CERTIFICATION_DIMENSIONS);
assert.equal(train.metrics.champions,173);
assert.equal(train.metrics.qwer,692);
assert.equal(train.metrics.batches,5);
assert.equal(train.metrics.readyBatches,0);
assert.equal(train.metrics.fullyCertified,0);
assert.deepEqual(train.batches.map(b=>b.expected),[35,35,35,35,33]);
assert.ok(train.batches.every(b=>b.status==='BLOCKED_UNTIL_ALL_KITS_CERTIFIED'));
const seen=new Set();
for(const row of train.champions){
 assert.ok(!seen.has(row.champion),'duplicate '+row.champion);seen.add(row.champion);
 assert.deepEqual(Object.keys(row.slots),['P','Q','W','E','R']);
 assert.ok(row.slots.P.reference);
 for(const slot of ['Q','W','E','R']){
  assert.ok(row.slots[slot].reference);
  assert.ok(row.slots[slot].riotId);
 }
 assert.equal(row.certification,'BLOCKED_NOT_CERTIFIED');
 assert.ok(row.blockers.includes('kit_evidence_not_submitted'));
 if(BOARD_M20_B01_V453[row.champion]){
  assert.ok(row.identityWitness,'B01 champion missing unique authored witness');
  assert.ok(row.blockers.some(b=>b.startsWith('descriptor_still_partial_')),
   'B01 cannot silently promote partial kit '+row.champion);
 }
}
assert.equal(seen.size,173);
assert.equal(train.champions.filter(c=>c.batch==='B01').length,35);
const forged=buildM34AtomicReleaseTrain({claims:{
 Alistar:{status:'READY_FOR_CERTIFICATION',
  slots:Object.fromEntries(['P','Q','W','E','R'].map(s=>[s,{
   suite:'tests/audit/v453_m31_b01_35_identity_witnesses.test.mjs',
   case:'unexecuted test',identity:'claimed unique identity'
  }])),
  dimensions:Object.fromEntries(M34_DIMS.map(s=>[s,{
   suite:'tests/audit/v453_m31_b01_35_identity_witnesses.test.mjs',
   case:'not a full kit proof',identity:'claimed dimension'
  }]))
 }
}});
assert.equal(forged.metrics.fullyCertified,0,'fabricated file references certify no kit');
const alistar=forged.champions.find(c=>c.champion==='Alistar');
assert.ok(alistar.blockers.includes('missing_identity_proof_P'),
 'generic previous tests are not runnable per-kit release proof');
assert.ok(alistar.blockers.some(x=>x.startsWith('descriptor_still_partial_')),
 'cannot disregard engine source partial flag');
assert.throws(()=>buildM34AtomicReleaseTrain({claims:{NotAChampion:{}}}),
 /Unknown certification claims/);
console.log('M34_ATOMIC_TRAIN_QA '+JSON.stringify({
 champions:train.metrics.champions,slots:train.metrics.qwer,macroBatches:5,
 batchSizes:train.batches.map(x=>x.expected),b01Identities:35,
 falseCertificationsBlocked:true,verifiedCertified:0,dimensions:M34_DIMS.length
}));
