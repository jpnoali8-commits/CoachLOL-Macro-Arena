# M42 / B01 — Atomic ownership, fog and resource-ledger cohort

**Date:** 2026-10-29.
**Repository:** `jpnoali8-commits/CoachLOL-Macro-Arena`.
**Branch:** `dev69/skills-batch2`.
**Existing PR:** #9 (Draft → `dev69/integration`), **DO NOT MERGE**.
**Previous M41 HEAD:** `bd8b9214285ebf711a262ef6c27ac927a0057808`.
**Tested M42 code HEAD:** `00fd7941565aaac7ce7b212ef1152747b7453793`.

## Scope: one 35-champion shared-engine cohort, distinct champion semantics

This is a board-game **simultaneous-turn** PvP engine. One human controls five
blue champions and one other human controls five red champions. No MMO-like
real-time frame simulation, AI bot focus, or generic skill fallback was added.

M42 tightens **three champion-specific vulnerabilities** and audits all 140
B01 QWER identities at the same authoritative ownership boundary:

1. **Corki R / Missile Barrage / Big One.**
   - `m42CorkiAmmoV453Dev69` calculates reloaded ammunition without
     modifying `u.m22MagazineV453` during `queueBoardSkillV453Dev69`.
     Planning, rejected orders, inspection and redo do not mutate ammo.
   - Before skill cost commit, the server calculates remaining missile
     count again; an exhausted inventory after the simultaneous order
     phase rejects the shot **before mana/CD debit**.
   - A successful commit refreshes the ledger and spends exactly one
     missile, preserving `shots`, `bigEvery` and cooldown identity.
     Retained the base authored R's distinct physical damage and rocket
     range. **This does not implement the missing ammunition HUD.**

2. **Mel R / Golden Eclipse mark detonation.**
   - `m42MelMarkedEnemiesV453Dev69` resolves only live, opposing,
     **visible, same-realm** champions bearing `overwhelm_<ownerId>`
     marks still active at server game time.
   - Applies at queue time and again before consuming mana/CD, so
     a mark that expires or becomes hidden during the simultaneous
     execution window cannot grant a no-target cast.
   - Actual global R hit pool is also restricted to valid visible owner
     marks: invisible enemies are **not damaged or revealed**.
     Karthus Requiem's separate true-global identity is unchanged.
   - Failure uses the same `m32_global_mark_expired_before_commit`
     reason for expired or hidden target, avoiding new fog-information
     leaks through distinguishable denial codes.

3. **Lee Sin W2 / Iron Will.**
   - The shared second-stage executor now rechecks the champion's
     server-owned 30-energy requirement **before applying life steal,
     grip or slow**. A concurrent energy drain between queue and
     commit cannot grant a free secondary effect or clear the valid
     recast ledger. The existing champion-specific secondary stage
     and resource expenditure remain the same.
   - Q2 and E2, allied W1 movement/shield, and Flurry remain distinct
     author-authored contracts; this is not Lee Sin kit certification.

## QA and safety gates

New test:
`tests/audit/v453_m42_b01_owner_atomic_cohort.test.mjs`
included by
`.github/workflows/skills-entity-targetability-p1.yml`.

- All **35 B01 champions × 4 QWER × 2 owners** deny opponent-owner
  spoofed action orders: **280/280** checks. Rejections leave no
  pending action or state mutation. Each identity remains
  `PENDING_FULL_KIT_CERTIFICATION`.
- Additional **8 negative race/visibility checks** across two
  PvP seats for the champion-specific interactions; total **288**
  negative checks. **Six** individual double-seat positive/negative
  champion mechanics cases.
- **76/76** V40 snapshot checks with checksum-stable replay;
  **0 failures**. Does not certify all 17 per-kit dimensions.
- [Specialist Skills 40930452713](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40930452713): **PASS** at code HEAD.
  - Historical M20 **280/280** QWER calls successful.
  - Historical M32 **280/280** adversarial commit checks passed.
  - M38–M41 tests and other specialist suites passed.
- [Logic 40930463102](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40930463102): **PASS**.
- [Projectiles 40930463349](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40930463349): **PASS**.
- [Integrated 40930463072](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40930463072): **FAIL** in
  `Verify official Node to browser regeneration`. Full `npm test`
  **skipped**. The integrator is responsible for `engine.browser.js`
  synchronization; do not change that file from Skills.

## Cohort status and remaining work

M35 work queue remains: **35 champions, 35 passives, 140 QWER,
140 slots with authored native hooks**, and **17 evidence dimensions
per full P+QWER kit**. M42 does **not** establish those 17 dimensions
as complete. Still **0 certified B01 kits** and **20 unretired
legacy debt markers**. No change to roster release gate, no new
fictitious certified champions.

This work does *not* complete Corki's visual ammunition HUD, Mel's
full multi-projectile/mark semantics, Lee's travelling Q and energy
balance by current Riot patch, or all LoL parity details. The M20
`m20Status='partial_executable'` contract remains correct. Do
not ship any of these as independent completed champion kits.

**M43 next ideal priority:** accelerate gameplay coverage by grouping
all **20 remaining B01 legacy tags** into shared mechanical families
(vision/mark/realm, stage recast/charge, owned projectile/geometry,
passive/resource/attack, UX-only). Implement multiple unique
champion behaviors per engine-family increment, with full 35-champion
cohort regression and increasingly thorough P+QWER 17-dimension
witnesses. Do not mark partial champions certified. Prioritize
pending real behavior over cosmetic or HUD-only tags; keep
B01's 35 champions as the indivisible ship unit. Bot AI is deferred
until PvP and playable kits are complete.

**No merge; PR #9 remains Draft.**
