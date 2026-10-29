# M35 B01 — 35 champion work queue and live two-human PvP authority

**Date:** 2026-10-29. **Branch:** dev69/skills-batch2. **PR:** #9 Draft → dev69/integration, NOT MERGED.

## Scope and acceptance

CoachLOL is a simultaneous-turn strategic PvP board game with two human owners of five units each. Shared engine geometry, resources, timing, collision, CC, fog, Realm and receipts are reusable; individual champion P+QWER, marks, forms, skills and counterplay are not generic substitutes.

M34's 173 champion / 692 QWER release train and 17 dimensions remain binding. B01 still has **35 unfinished full kits**, despite authored partial QWER and unique identity witnesses. No kit is promoted by this milestone.

## Cohesive 35-champion production queue

The new source file tools/skills_m35_b01_cohort_work_queue.mjs derives an ordered inventory of all 35 B01 champions, all 35 passives, all 140 QWER and each individual identity/debt from actual engine descriptors and the M31 per-champion witness ledger.

Every champion skill can be grouped across these shared-engine work families without losing its unique source and authored rules: charge/channel, recast/form, owned entities/terrain, marks/stacks, spatial targeting, and owner buffs. Work on shared primitives once for ALL affected B01 champions, test each author's skill separately, and ship B01 only when all 35 kits pass the entire 17-dimensional gate. Do not turn 2–5 isolated mechanics into false package completions.

Regenerate the full JSON queue:

    node tools/skills_m35_b01_cohort_work_queue.mjs --out docs/skills_macro_batches_dev69/M35_B01_35_KIT_WORK_QUEUE.json

The specialist workflow publishes this JSON beside M19, M27, M31 and M34 audit artifacts.

## PvP multiplayer input boundary

The dev47 gateway used by the real two-seat room now accepts five additional author-specific action contracts:
- skill.charge.start with slot, and skill.charge.release with slot and optional point. No client-supplied chargeSeconds; it is derived from authoritative gameTime.
- skill.face with point for actual ordered facing and Cassiopeia/Braum directional counterplay, using owner, phase and Realm rules.
- skill.viktor.evolve with learned Q, W or E, consuming only earned Viktor fragments.
- skill.viktor.undo with no parameters, using same-round LIFO rollback.

The secure charge API preserves the five different authored identities: Xerath Q Arcanopulse, Varus Q Piercing Arrow, Vi Q Vault Breaker, Zac E Elastic Slingshot and Galio W Shield of Durand. All their unique ranges, resources, damage, displacement and CC continue to run through the engine.

For those five slot+champion pairs, incoming legacy skill.directional, skill.ground, skill.targeted, skill.self, order.combo and decision.reaction cannot bypass the staging requirement. The gateway validates strict request shapes, trusted seat ownership, idempotent sequence receipts, target visibility and phased actions. Invalid chargeSeconds fields are rejected. The legacy in-process engine queue remains for historical tests but must not be a multiplayer ingress.

Client HUD buttons for these newly secured interactions are still needed; do not call these features visually integrated or claim LoL 1:1 patch parity. This is the live PvP action gateway, not a replacement ability engine.

## QA and next steps

- tests/audit/v453_m35_b01_work_queue.test.mjs: 35 champions, 140 individual QWER, 17 dimensions and no manufactured certifications.
- tests/audit/v453_m35_b01_pvp_ingress_atomic.test.mjs: 35×2 human-seat facing and ownership cases, repeat receipts, five native charges × both seats, rejection of legacy bypass and forged durations, full owner-controlled Viktor research rollback, V40 snapshot parity.
- M20–M34 specialized QA stays in the workflow, and all original gameplay identities are retained.
- Integration owner exclusively handles engine.browser.js Node→browser synchronization and final merged test matrix. Skills changes do not merge PR #9.

Next M36 implementation must attack full per-champion P+QWER debts in groups across ALL 35 B01 champions with individual executable 17-dimension evidence. A ready release requires 35/35 actual kits, never a tally of action routes.

**Status at M35:** 0/35 full B01 kits certified; 0/173 full total kits certified. This honest status does not erase individual gameplay improvements or previously validated authored identities.
