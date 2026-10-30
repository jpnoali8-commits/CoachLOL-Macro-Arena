# CoachLOL Macro Arena — M45 B02 Skills S12

**Date:** 2026-10-30 · **Branch:** `dev69/m45-audit-skills` · **Original source:** `dev69/skills-batch2` @ `f0b1147ac46e585a1d5374a178b1ea462f5dc278`.

## Executed evidence, no Actions

Replayed the saved `s12_projectile_fidelity_pvp.test.mjs` test body against the pinned real legacy `engine.mjs` Git blob `41679f7328a42e379fdfb8de5b92006e1bfb529f` in an isolated V8 environment with only Node import/assert/FS bootstrap shims. **438/438 assertions, 34/34 scenario cases, 8/8 in-flight snapshots**, including live vs restored transitions t2-t4, PASS. Both blue and red used. This is NOT execution by the original full Node module loader.

### Source-based authored fidelity

- **Ahri E:** authored board effect at 975 range, 60 mana, 550 units/tick, 80 damage and 1.6-second charm. Cast creates a missile, x=.54 hits at simulated tick 2, x=.58 is beyond range and misses. A real synthetic minion at x=.52 consumes the projectile and takes 80 damage. Shield consumes and prevents damage/CC. Legacy *normal* `queueKitSkillV42` **still rejects** due to the stale `queueDirectionalSkill` shortcut, despite successful authored board execution. Rust desired path = route normal user command to correct authored projectile once; do not copy the broken shortcut.
- **Ashe R:** 100 mana, 550 units/tick and temporal champion-first impact; x=.58 hits at tick 3 for 200 damage and approx 1.802857s stun. It ignores a minion at x=.52, but wall toward x=.65 and an opposing projectile barrier block. Explosion within 250 units delivers 35% of initial damage (70 in test) plus 35% slow for 2s to an unshielded nearby champion; a spell shield prevents the splash.
- Both projectile types honour a launched missile crossing opposing projectile barrier x=.53. **No immediate hit/CC at cast**.
- Snapshots at **t1** of both champions, both sides, with and without shield match original `checksumV40` after restoration. Advancing both original/restored engines at t2,t3,t4 yields identical snapshot hash, target HP and effect states. Check `S12_AUTHORIAL_PROJECTILE_RUST_FIXTURES.json` for source-hash pinned values.

### Rust migration requirements

`core-champions` resolves unique champion+slot authored executor after normal command adaptation. `core-combat` owns projectile type, champion/minion first-hit filtering, shield interception, splash, timeline, and explicit CC at **impact only**. `core-map` supplies wall and temporary barrier intersection. `core-clock` controls integer ticks; `core-replay` saves missile in flight and consumable shield. `core-protocol` filters team/private snapshots. Preserve single-slot seal arbitration and anti-ghost Nami W contract from S11; these observed fixtures do not certify the Rust fix.

Use:
- `s12_projectile_fidelity_pvp.test.mjs`: standalone original Node regression once full checkout available.
- `S12_AUTHORIAL_PROJECTILE_RUST_FIXTURES.json`: expectations and 8 checkpoint hashes.
- `S12_V8_RUNTIME_RECEIPT.json`: exact execution mode, sample counts and gate status.

## Unresolved gates and boundaries

S10 original 26-suite matrix stays **22 V8_PASS, 2 V8_FAIL (Ahri M2/Ashe M14), 2 NOT_RUN**. S11 66/66 and S12 438/438 are *separate supplemental* V8 suites. Full original Node, Rust native, WASM, true HTTP/ACL, full LoL wave simulation all **NOT_RUN**; **G8 NOT_CERTIFIED**. Frozen JS engine, production branches and existing PRs untouched. No Actions/Codespaces/merge.

**Next S13:** convert these pinned stage-by-stage fixtures into Rust typed contracts and acceptance tests only after core-combat/core-champions/crate dependencies actually exist; if unavailable, audit additional casts with deterministic state and keep Rust certification blocked. Coordination via Draft PR #19 comment rather than direct branch merge.
