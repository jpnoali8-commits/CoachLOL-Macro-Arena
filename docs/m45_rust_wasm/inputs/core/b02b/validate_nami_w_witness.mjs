/**
 * M45 B02B: deterministic receipt validation, NOT gameplay execution or Rust parity.
 * Pure JS: can run in Node or in the ChatGPT V8 connector environment.
 */
export function validateNamiWLegacyWitness(data) {
  function ensure(ok, message) { if (!ok) throw Error('M45 NAMI W: '+message); }
  ensure(data?.schema==='coachlol.m45.b02b.nami-w.v8-executed.v1','bad schema');
  ensure(data.source.commit==='f0b1147ac46e585a1d5374a178b1ea462f5dc278','source SHA changed');
  ensure(data.source.engine_blob==='41679f7328a42e379fdfb8de5b92006e1bfb529f','engine blob changed');
  ensure(data.source.map_blob==='ad853bbb6f110c0d2b6b8b4995ac4e80169f7109','map changed');
  ensure(data.source.mask_blob==='ecddcee76f3bce20a483ff7545ce2231696270e2','mask changed');
  ensure(data.execution.not_node_esm && data.execution.not_rust && data.execution.not_wasm,'unsupported runtime assertion');
  ensure(data.execution.not_real_fog && data.execution.not_server_http,'missing isolated caveats');
  ensure(data.cases.length===8 && data.failures.length===0,'case count or failures');
  ensure(data.rules.abilityRuleW.m44B13Id==='Nami.W','authored W overwritten');
  ensure(data.rules.abilityRuleW.bounceRange===null,'W authored bounce range changed');
  ensure(data.rules.kitSpellV42Bounce===800,'W V42 range changed');
  const expectedRoutes=['targeted_only','board_only','targeted_then_board','board_then_targeted'];
  const unique=new Set();
  let ghost=0,control=0;
  for (const row of data.cases) {
    ensure(['blue','red'].includes(row.team),'unexpected team');
    ensure(expectedRoutes.includes(row.route),'unexpected route');
    const id=row.team+'|'+row.route;
    ensure(!unique.has(id),'duplicate '+id);
    unique.add(id);
    ensure(row.seed===450209 && row.foreignSeatDenied===true,'seed/ACL '+id);
    ensure(row.manaAfterQueue===500,'queue debited mana '+id);
    ensure(row.first.mana===430 && row.first.cd===10,'first W charge/cooldown '+id);
    ensure(row.afterCooldown.gameTime===10.25,'clock '+id);
    ensure(row.first.pendingBoard===false && row.afterCooldown.pendingBoard===false,'board pending '+id);
    ensure(row.afterCooldown.pendingTargeted===false,'uncleared pending '+id);
    ensure(row.restoreChecksum===row.afterCooldown.checksum,'checkpoint mismatch '+id);
    for (const checksum of [row.beforeChecksum,row.first.checksum,row.afterCooldown.checksum]) {
      ensure(/^[a-f0-9]{8}$/.test(checksum),'bad checksum '+id);
    }
    const competing=row.queue.length===2;
    if (competing) {
      ghost++;
      ensure(row.ghostCast===true && row.first.pendingTargeted===true,'missing stale W '+id);
      ensure(row.afterCooldown.mana===360,'ghost W cost '+id);
      ensure(row.first.allyHp===475 && row.afterCooldown.allyHp===590,'ghost W effects '+id);
    } else {
      control++;
      ensure(row.ghostCast===false && row.first.pendingTargeted===false,'unexpected stale W '+id);
      ensure(row.afterCooldown.mana===430,'single route double W '+id);
      const hp=row.route==='targeted_only'?515:475;
      ensure(row.first.allyHp===hp && row.afterCooldown.allyHp===hp,'control W effects '+id);
    }
  }
  ensure(unique.size===8 && ghost===4 && control===4,'route coverage');
  return {status:'PASS_RECEIPT_ONLY',cases:8,controls:control,legacy_ghost_casts:ghost,blue:4,red:4,rust_certified:false,node_esm_certified:false};
}
