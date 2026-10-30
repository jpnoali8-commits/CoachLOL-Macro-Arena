# M28/B01 — authored tactical identity implementation handoff

**Date:** 2026-10-29  
**Repository:** https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena  
**Skills branch:** `dev69/skills-batch2` only  
**Existing PR:** https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/pull/9 (Draft → `dev69/integration`, NOT MERGED)  
**Verified implementation HEAD before this handoff:** `e3b6a704884afe804f65eec61eb0f524767f84fb`.

## Architecture and QA interpretation

CoachLOL Macro Arena is a board strategy game, with two **human** players controlling five champions each, submitting orders simultaneously and resolving them through an authoritative server. Champion identity is authored; only infrastructure primitives are reused. No 60 FPS physics, no generic skill replacement, and no artificial `CERTIFIED` status.

The **M28 authored increment spans 12 distinct B01 champions**, not the requested 25–35 champion complete macrolot. These are **specific functional deltas** in an existing 35-champion cohort; none has been proven end-to-end P+QWER plus all 17 certification dimensions. **Certified champions: 0.** Existing M19–M28 work preserved.

## Committed champion behaviors

| Champion | New authored mechanic / observable effect | Outstanding work |
|---|---|---|
| Cassiopeia | R uses opponent's committed combat facing to distinguish stun from slow | Facing order UX, broader counterplay, full kit |
| Karthus | W persistent line slows champions entering after cast | Comprehensive wall interactions and total passive QA |
| Sejuani | W first swing and delayed second swing separately damage and build Frost | Allied melee Frost contribution and full interactions |
| Heimerdinger | Q has stored three charges, 20s sequential recharge and zero-resource denial; E center stun versus outer slow | Full upgraded grenade, turret choices and lifecycle |
| Kog'Maw | E leaves a persistent damaging/slowing line | Full trail terrain/fog interactions |
| Urgot | E flips hit opponent back to caster's prior square when collision allows | More sophisticated flip/interrupt and R dependencies |
| Viktor | Q grants his own shield; E takes optional two-point laser start/end and delayed aftershock from new origin; R follows nearest eligible visible target with periodic damage | Evolution/hexcore contract, storm interrupt/steer and complete kit |
| Varus | Q explicit 0–2 tactical charge parameter modifies line range and damage (and preserves existing Blight detonation) | W empowered-Q, charge phases and complete kit |
| Xerath | Q explicit 0–2 tactical charge parameter modifies line range and damage | Formal charged-skill state and complete kit |
| Galio | Q adds delayed convergent wind damage-over-time; W optional charge enlarges self-centered taunt radius | Channel interruption/damage reduction and complete kit |
| Mel | Q has two additional timed projectile pulses; E root core / slow outer region | Individual projectile tracking/collision and R/overwhelm interactions |
| Lucian | W Ardent marks are consumed by a real basic attack to grant movement speed | Q initial-target requirement, W shape, full passive/combo |

**Important:** optional `chargeSeconds` and `laserEnd` are board-tactical parameters: they are validated before committing mana/cooldown. They do not create realtime animations. Existing unparametrized M20 commands keep working to avoid invalidating the older UI/parser while explicit commands can exercise authored semantics.

All effect scheduling uses the existing board temporal runtime, authoritative damage and CC, line/circle geometries, visibility/Realm where present, plus snapshot/replay state.

## Git commits (this increment)

- `373d8aa18f2392a83855d969aea53d7c6227f835` — initial seven champion authored runtime mechanisms.
- `37d4f15cf860fe3f5f44fd4df7318fc8cf3389ef` — seven-champion 14-case authored QA.
- `77a55560fd6bc20f02bab487d95cb855e7020b90` — CI wiring.
- `de7ac93cd5f61166a994a389881803e4ea9e0a6c` — M20 Heimer turret stock legacy regression alignment.
- `e2e8889757a47291005e8f2309917d35b2b10094` — M21 Sejuani sequential W Frost test.
- `cb84221152a964bd16bb15e16800b1d92235776c` — Varus/Xerath Q tactical charge, Viktor Q/E.
- `3e1c903c1709d1d242f137505c86727a51402cb0` — Galio/Mel/Heimer/Lucian authored identities.
- `ea113faa42acd7e97def0a2785a88b14cd0dfaf4` — seven-champion extension behavior tests.
- `dbb691fbf907dd24cc75fd72824737c3b4562301` — extension CI wiring.
- `ecc2ebd58bf084635a2e63441cadbe08ab2b441e` — fix QA attack positions.
- `e3b6a704884afe804f65eec61eb0f524767f84fb` — separate charged Q cases across authoritative phases.

## QA — proven versus not proven

**PASS, implementation HEAD `e3b6a704`:**
- Specialist: https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40891777751
- M28 authored suite: `M28_AUTHORED_BEHAVIOR` **14/14**, 7 champions × blue/red.
- M28 extended suite: `M28_EXTENDED_QA` **14/14**, 7 champion scenarios × blue/red.
- **Total new focused cases: 28/28, 12 unique champions**, including authoritative queue denial and snapshot parity.
- Existing M28 adversarial: 35 kits and two seats, 0 failures. Existing M27 35/140, 17 dimensions, still 0 certified.
- Existing M20 QA: 280 casts/effects and 70 snapshot replays, successful.
- Logic workflow: https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40891788787 — SUCCESS.
- Skills projectile workflow: https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40891788798 — SUCCESS.

**BLOCKED by integrator-owned Node→browser synchronization:**
- Integrated QA: https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40891788699 — failed specifically at `Verify official Node to browser regeneration` (`python tools/sync_browser_v43.py` produced `git diff --exit-code -- engine.browser.js`). No browser sync commit was made on Skills branch. The merged/full npm test job was skipped.

**Interpretation:** passing 28 authored behavior cases and existing 280 casts does not certify the individual P+QWER of any champion. New tests cover named interactions and determinism, not every 17-dimensional complete kit contract.

## Next macro-scale priority

Continue M28 B01 across large batches, targeting 25–35 **completed** champion identities instead of stopping at 1–2 champion delivery. Expand the remaining B01 deficits by families, focusing on Viktor evolution, Lucian Q mandatory primary target, Galio full W, Mel Q individual projectiles, Varus W/blight empowerment, Heimer upgraded effects, charge/interrupt contracts, remaining passive/recast dependencies and Locke W/R **only after reference verification**. Preserve all previously implemented unique identities and write both-seat QA with gameplay effects, interruptions, invalid targets, Realm/fog, economy and snapshot/replay.

Do not edit `engine.browser.js`, `version.json`, `main`, `dev69/integration` or Items; do not merge PR #9. The integrator owns branch reconciliation and browser sync. Update this handoff with each subsequent large authored increment.
