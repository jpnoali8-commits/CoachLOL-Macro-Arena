# CoachLOL Macro Arena — M44 B20: mobile projectile shields and long-range dash interception

**Date:** 2026-10-30. **Branch:** `dev69/skills-batch2`. **Input HEAD:** `50bd10d131c9aa72d75831244bb5ec0a21f0bed5`. **PR #9:** Draft into `dev69/integration`; NO MERGE.

## Original-authorial implementation
- New universal `m44B20ProjectileBarrierCenterV453` resolves the live center of authorial projectile interception volumes at projectile collision time. Volumes declared `anchor:'owner'` move with their living original-source unit. Fixed projectile barriers stay fixed; dead or missing owners and expired barriers do not give phantom protection.
- Samira **original W**, including Viego possession of Samira, now uses an owner-attached projectile barrier rather than freezing at its first cast position. The swept projectile resolver and returning Ahri orb both use the same shared source-center accessor. The existing B19 training radius/duration (360 units, 2 seconds) are preserved to avoid unrelated rebalance; these values are NOT certified as exact current-LoL patch values.
- Poppy W's shared pre-debit dash interception now checks the entire directed segment rather than rejecting dash attempts only when the caster starts within 600 units. A dash from >600 units crossing Poppy's active field is rejected before mana or cooldown debit, while a remote segment that misses the field is unaffected.

## QA executed on the exact B20 candidate engine blob
**Engine blob SHA:** `ca5d65d7a5ab3a8bbddf50b303a8d2f32c9faa65`.
All candidate tests ran in isolated JavaScript V8 with the full real `engine.mjs`, real `coachlol_map_v6.json` and `masks_128.json`; Node-only imports/assertions/file-reading were narrowly adapted. This is actual source-executed PvP QA, not source matching.

- B01–B17: **36/36 suites; 1392/1392 scenarios PASS**.
- B18: **28/28 PASS**.
- B19: **16/16 PASS**.
- New B20: **8 scenarios mirrored across blue/red = 16/16 PASS**, with real authoritative skills, snapshot round trips, caster motion, projectile block at the moved position, former-position not shielded, dead/expired barrier cleanup, static barrier unaffected, far-range Briar R anti-dash before resources and Viego borrowed Samira W.
- **Grand total: 39/39 suites and 1452/1452 PvP scenarios PASS on one B20 engine blob.** Additional assertion checks execute inside suites.
- B20, B19 and B18 tests were run together against the candidate in one JavaScript isolate (521 assertions on those three suites); historical 36 suites were re-executed against the same candidate in additional V8 isolates.

## Boundaries and future work
- Native Node `npm test` and complete project corpus, networked multiplayer server, UI/browser visual QA, effects/3D cinematics and `engine.browser.js` sync were **NOT** executed/certified.
- This does not certify any new champion's complete passive/QWER kit; **0 new complete kits certified**. Additional projectile subclasses, precise patch values and interruption/cancellation behavior still need authorial milestones.
- No GitHub Actions, Codespaces, workers, merge, other branches, items, UI, version or CI changes were used.

## Next priority: M44 B21
Extend projectile-barrier material to other authored projectile types, strengthen source-specific interrupt semantics and cross-realm filtering, then return to larger authorial champion identity batches without generic fallbacks. Run per-batch V8 QA, defer all-project native/UI QA until catalog parity milestone.
