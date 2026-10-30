# CoachLOL M45 B02 Skills S11 — Ahri E routing, Ashe R temporal impact, single-slot Rust contract

**Date:** 2026-10-30. **Branch:** `dev69/m45-audit-skills`. **Source fixed:** `dev69/skills-batch2` @ `f0b1147ac46e585a1d5374a178b1ea462f5dc278`. **Engine Git blob:** `41679f7328a42e379fdfb8de5b92006e1bfb529f`.

## Runtime results (real engine in isolated V8, no Actions)

- **Ahri E, both teams:** `queueKitSkillV42` forces directional; `abilityRule(E).kind=board_effect` makes directional reject. Same input to direct `queueBoardSkillV453Dev69` succeeds, consumes **60 mana**, schedules authored temporal projectile. This is a **player input adapter mismatch**, not absence of authored E.
- **Ashe R, both teams:** R spends **100 mana** at cast, schedules `m44_authored_projectile`, **no immediate stun**. In clear corridor from (0.5,0.5), near target (0.523,0.5) receives 200 damage / 1.039973 s stun at t=1; farther target (0.58,0.5) receives 200 / 1.802857 s stun at t=3. Source snapshots restored to same hash in blue/red. Prior M14 far target (0.65,0.5) crosses an actual map obstacle and can miss, independently of its obsolete instant-stun assertion.
- **Nami W:** S10 confirms a stale second W when dual queues share a slot. Rust should not reproduce it.

See `S11_V8_RUNTIME_WITNESSES.json` for literal observations and `S11_SKILL_ARBITER_RUST_CONTRACT.json` for the intended Rust state machine. New supplementary executable Node test `s11_ahri_ashe_temporal.test.mjs` characterizes source drift. The saved S11 test body itself **ran in isolated V8 and passed 66 assertions** against original Arena code with import/assert shims; full unmodified Node module loader still **NOT_RUN**. It intentionally asserts Ahri's **buggy legacy behavior**; it is not the Rust acceptance test.

## Coordinator contract

Resolve champion+slot+form to **one authored executor** before sealing. Only one primary actor/slot intent at a time; replayed request ID returns same ACK, conflicting commands reject unless explicitly replaced. Recast must be an explicit transition of the same cast instance, not a second primary cast. Validate seat, fog, realm, CC, range, cooldown and resources before atomic debit. On commit/cancel/reject or interrupt, clear stale same-slot representations; cooldown expiry cannot run old intents. Store terminal request/cast IDs for replay/reconnect. See JSON for required Rust tests.

## QA / publication boundaries

S10 source-suite matrix **unchanged:** 22 V8_PASS, 2 V8_FAIL (Ahri M2, Ashe M14), 2 NOT_RUN. **0/26 full unmodified Node** test files executed, Rust native/WASM and two-seat HTTP **NOT_RUN**. S11's 6 cast witnesses and 4 impacts are **supplemental**, not increments to the 26-suite tally.

This is **MIGRATION_ONLY**; no JS engine, authoritative Rust, frozen source, existing PR, or main branch edited. No merges, Actions or Codespaces.

**Next S12:** verify Ahri's actual temporal impact, obstruction and spell-shield, plus Ashe true blocker/reconnect checkpoints with source pinned; hand off fail-fix acceptance fixtures once core-combat and core-champions crates exist. Explicit G6 partial/G8 not certified.
