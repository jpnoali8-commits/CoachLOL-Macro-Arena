// M45 B02B-I13: source-only integrity check. DOES NOT compile/execute Rust.
// Run: node tools/m45_b02b_i13_run_source_audit.mjs
export function auditM45I13RustSources(s) {
  const must=(cond,label)=>{if(!cond)throw Error('M45_I13_AUDIT_FAIL:'+label)};
  const expected={lib:3,skill_admission:13,skill_wire:6,
    skill_authority:8,pvp_projection:9,pvp_session:15};
  let total=0;
  for(const [name,number] of Object.entries(expected)){
    must(typeof s[name]==='string'&&s[name].length>0,'missing:'+name);
    const found=(s[name].match(/#\[test\]/g)||[]).length;
    must(found===number,'test_declarations:'+name+':'+found);
    total+=found;
  }
  must(total===54,'total_rust_tests');
  const a=s.skill_admission,w=s.skill_wire,v=s.skill_authority,p=s.pvp_projection,
    g=s.pvp_session,l=s.lib;
  must(a.includes('pub(crate) fn admit('),'private_admit');
  must(a.includes('if result.decision == AdmissionDecision::Queued {')
    &&a.includes('self.receipts.insert(key, CachedRequest {'),
    'accepted_only_receipts');
  must(a.includes('invalid_flood_cannot_exhaust_accepted_receipt_capacity')
    &&a.includes('corrected_payload_can_reuse_rejected_request_id'),
    'rejected_flood_coverage');
  must(a.includes('self.receipts.get(&key)')&&a.includes('RequestIdPayloadConflict'),
    'success_ack_pin');
  must(a.includes('in_flight: HashMap<u64')&&a.includes('std::mem::take(&mut self.pending)'),
    'temporal_tracking');
  must(w.includes('pub(crate) fn admit_authorial(')&&w.includes('AbilityNotMigrated'),
    'authorial_registry');
  must(v.includes('pub fn from_authoritative_units_in_room(')&&v.includes('source_room_id'),
    'world_room_binding');
  must(p.includes('pub(crate) fn from_private(')
    &&p.includes('PrivatePvPEventKind::HiddenObjective { .. } => None'),
    'public_event_allowlist');
  must(g.includes('world.source_room_id() != Some(self.room_id.as_str())')
    &&(g.match(/let seat = self.authorize_world\(bearer, world\)\?;/g)||[]).length===2,
    'session_world_binding');
  must(g.includes('replacement == self.blue.secret || replacement == self.red.secret')
    &&g.includes('replacement == self.red.secret || replacement == self.blue.secret'),
    'token_noop_block');
  must(l.includes('pub mod pvp_session;')&&l.includes('pub mod skill_authority;'),
    'core_modules');
  return {status:'PASS_SOURCE_ONLY_NOT_RUST_COMPILATION',
    module_test_declarations:expected,total_rust_test_declarations:total,
    rust_tests_executed:0,action_runs_started:0};
}
