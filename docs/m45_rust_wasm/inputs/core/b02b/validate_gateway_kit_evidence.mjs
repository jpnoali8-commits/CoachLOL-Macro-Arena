// Validates pinned B02B V8 evidence only; does NOT run a match or prove Rust parity.
export function validateGatewayKitEvidence(wire, catalog) {
  const req=(condition,why)=>{if(!condition)throw Error('B02B_GATEWAY_INTEGRITY '+why);};
  req(wire?.schema==='coachlol.m45.b02b.gateway-skills-reachability.v1','wire schema');
  req(catalog?.schema==='coachlol.m45.b02b.client-kit-wire-discovery.v1','catalog schema');
  req(wire.source.engine_sha===catalog.source.engine_blob && wire.source.gateway_sha==='4be23bdd9df6d9918a0c32b6ea699be8974bf9de','source mismatch');
  req(wire.source.commit===catalog.source.commit,'source commit mismatch');
  req(wire.mode.node_module_loader==='NOT_RUN' && wire.mode.rust==='NOT_RUN' && wire.mode.server_http==='NOT_RUN','overstated runtime');
  req(wire.routes.length===14 && wire.combo.length===4 && wire.errors.length===0,'case coverage');
  req(wire.totals.accepted_routes===2 && wire.totals.denied_routes===12 && wire.totals.combo_second_debit===0,'totals');
  const wanted=new Set();
  let pass=0,deny=0,ahriDenied=0,namiDenied=0;
  for(const c of wire.routes) {
    const id=c.champ+'-'+c.team+'-'+c.route;
    req(c.id===id && !wanted.has(id),'duplicate route '+id);wanted.add(id);
    req(['blue','red'].includes(c.team) && ['Ahri','Nami'].includes(c.champ),'team/champ');
    req(c.retry_idempotent===true,'idempotent retry '+id);
    const valid=c.champ==='Nami'&&c.route==='targeted';
    req(c.ack.ok===valid,'route reachability changed '+id);
    if(valid) {
      req(c.ack.kind==='skill.targeted'&&c.mana_after_resolution===930&&c.ally_hp_after_resolution===515,'Nami targeted '+id);
      req(c.pending_before_resolution.targeted===true&&c.pending_before_resolution.board===false,'pending targeted '+id);
      pass++;
    } else {
      req(c.ack.ok===false && typeof c.ack.reason==='string','denial '+id);
      req(c.mana_after_resolution===1000 && c.ally_hp_after_resolution===400,'denied route mutated '+id);
      req(c.pending_before_resolution.targeted===false && c.pending_before_resolution.board===false,'denied route pending '+id);
      req(c.checksums.before===c.checksums.after,'denied route state mutation '+id);
      deny++;
      if(c.champ==='Ahri')ahriDenied++;else namiDenied++;
    }
  }
  req(wanted.size===14 && pass===2 && deny===12 && ahriDenied===6 && namiDenied===6,'bilateral counts');
  let acceptedCombo=0;
  const pairKeys=new Set();
  for(const c of wire.combo){
    req(['blue','red'].includes(c.team),'combo seat');
    req(c.kinds.length===2 && new Set(c.kinds).size===2 && c.kinds.includes('targeted') && c.kinds.includes('combo'),'combo kinds');
    const k=c.team+'-'+c.kinds.join('_then_');req(!pairKeys.has(k),'duplicate pair');pairKeys.add(k);
    req(c.acks.length===2 && c.acks.every(x=>x.ok===true),'combo acceptance');
    req(c.before.pendingTargeted===true && c.before.pendingBoard===false && c.before.order==='attack','queue combination');
    req(c.first.mana===930 && c.later.mana===930 && c.first.pendingTargeted===false && c.later.pendingTargeted===false,'no deferred debit');
    req(c.later.time===10.25 && c.followup_mana_debit===false,'forced later tick');
    acceptedCombo++;
  }
  req(acceptedCombo===4,'combo coverage');
  const a=catalog.catalog;
  req(a.legacy_board_kit_count===30&&a.m44_authored_count===14&&a.m44_not_in_legacy_board_kits.length===14,'catalog counts');
  req(a.m44_authored_champions.every(x=>a.m44_not_in_legacy_board_kits.includes(x)),'catalog missing mapping');
  req(a.api_kits_builds_from_BOARD_KITS_ONLY===true && a.m44_overlap.length===0,'catalog source precedence');
  req(catalog.cases.nami_w_authored.shape==='target_any'&&catalog.cases.nami_w_authored.access_via_legacy_board_kit===false,'Nami source shape');
  req(catalog.cases.ahri_e.ability_rule_kind==='board_effect'&&catalog.cases.ahri_e.access_via_legacy_board_kit===false,'Ahri source dispatch');
  req(catalog.client_dispatch.no_target_any_supported_in_target_button===true,'target_any UI');
  req(catalog.inspected.actual_http_get_kits==='NOT_RUN'&&catalog.inspected.two_real_browsers==='NOT_RUN','catalog not HTTP');
  return {status:'PASS_EVIDENCE_ONLY',gateway_routes:14,gateway_accepted:2,gateway_denied:12,ahri_denied:6,nami_other_routes_denied:6,combo_synthetic:4,combo_deferred_w:0,authorial_m44_not_in_legacy_kits:14,node_esm_certified:false,rust_certified:false};
}
