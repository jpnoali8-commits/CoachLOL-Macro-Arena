import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditM45I13RustSources} from '../../tools/m45_b02b_i13_source_audit.mjs';
const names=['lib','skill_admission','skill_wire','skill_authority',
'pvp_projection','pvp_session'];
const s=Object.fromEntries(names.map(name=>[name,
 readFileSync(new URL('../../crates/core-state/src/'+name+'.rs',import.meta.url),'utf8')
]));
test('Rust module source contract is not mislabeled as native compilation',()=>{
  const r=auditM45I13RustSources(s);
  assert.equal(r.status,'PASS_SOURCE_ONLY_NOT_RUST_COMPILATION');
  assert.equal(r.total_rust_test_declarations,54);
  assert.equal(r.rust_tests_executed,0);
});
test('removing accepted-only cache protection fails source audit',()=>{
  const changed={...s,skill_admission:s.skill_admission.replace(
    'if result.decision == AdmissionDecision::Queued {','if true {'
  )};
  assert.throws(()=>auditM45I13RustSources(changed),/accepted_only_receipts/);
});
test('removing room boundary or public event allowlist fails audit',()=>{
  const noRoom={...s,pvp_session:s.pvp_session.replace(
    'world.source_room_id() != Some(self.room_id.as_str())','false'
  )};
  assert.throws(()=>auditM45I13RustSources(noRoom),/session_world_binding/);
  const noFilter={...s,pvp_projection:s.pvp_projection.replace(
    'PrivatePvPEventKind::HiddenObjective { .. } => None','PrivatePvPEventKind::HiddenObjective { .. } => Some()'
  )};
  assert.throws(()=>auditM45I13RustSources(noFilter),/public_event_allowlist/);
});
