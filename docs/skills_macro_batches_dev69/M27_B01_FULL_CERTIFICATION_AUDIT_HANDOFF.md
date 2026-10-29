# M27/B01 — full 35-champion certification audit + 25 champion-authored passives

**Scope:** Skills only, `dev69/skills-batch2`, [PR #9](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/pull/9), Draft → `dev69/integration`, no merge.  
**Verified implementation HEAD:** `1b091786a7988c85da0ac1d0c1ce3a9e2de7c9ef`.  
**Date:** 2026-10-29.  
**Result:** all 35 B01 champions inventoried for passive + four slots, all 17 certification dimensions marked unresolved; **25 distinct champion identities newly deepened** and **52/52 blue/red PvP behavior+snapshot cases** passed. **0 full champion certifications**.

## Production policy

CoachLOL Macro Arena is a strategic **simultaneous-turn board game**: two humans control five champions apiece. Never try to build a frame-by-frame MOBA, and never replace an individual P/Q/W/E/R, recast, form, mark, passive, vision or unique counterplay with an anonymous training fallback. Shared executable infrastructure (timing, collision, range, CC, damage, fog, Realm, queued receipts, undo and deterministic checkpoints) is correct. Champion identity belongs in champion-authored data/behavior.

Do not confuse a successfully executed slot with a complete LoL kit. This M27 closes *the audit/proof gap*, not complete champion parity.

## Full B01 certification audit

- `tools/skills_m27_b01_completeness_audit.mjs` consumes the real `BOARD_M20_B01_V453` registry, enumerates all **35 champions**, checks all **140 QWER**, and produces JSON with per-champion passive ID, rule shape/range, unique rule hooks, unreconciled legacy `m20Missing` tags, all required QA dimensions, and explicit `NOT_CERTIFIED` states.
- `tests/audit/v453_m27_b01_certification_gate.test.mjs` ensures none of the 35 is accidentally called certified, requires real rule descriptors and records all 17 certification dimensions.
- The Skills workflow generates `docs/skills_macro_batches_dev69/M27_B01_COMPLETENESS_MANIFEST.json` in its **Actions artifact** `coachlol-skills-m19-173-pqwer-macro-batches` and checks the generator. To regenerate locally or in GitHub Actions: `node tools/skills_m27_b01_completeness_audit.mjs --out docs/skills_macro_batches_dev69/M27_B01_COMPLETENESS_MANIFEST.json`.
- Audit dimensions: passive, Q, W, E, R, recast, transform, summon/entity, terrain/collision, fog/reveal, Realm, items, runes, summoner spells, two-human PvP, snapshot/replay, undo/receipts.
- Historical M19 accounting is unchanged: 173 champion/passive routes, 692 QWER, 369 training fallback, 323 routed unverified; **0 certified**. M27 adds gameplay to existing routes and audits **only the fixed B01 cohort**, not all 173.

## Twenty-five champion-specific M27 mechanics with observable behavior

| Champion | M27 board identity implementation, not generic fallback |
|---|---|
| Cassiopeia | Serpentine Grace gives level-scaled movement speed during the deterministic board phase |
| Master Yi | E Wuju adds a true-damage packet exclusively after a real basic hit |
| Kog'Maw | W Bio-Arcane adds world-unit attack reach and max-health magic on-hit, monster capped |
| Quinn | Q blinds its actual enemy hit, not only a generic slow |
| Lucian | After E Pursuit, subsequent confirmed basics reduce the E cooldown; unrelated spells do not |
| Kassadin | W next confirmed basic restores mana once, then disarms the refund |
| Milio | Fired Up marks allies receiving W/E/R support; next actual basic burns an enemy with Milio ownership |
| Rell | E links nearby ally with speed and one empowered on-hit; passive Break the Mold steals armor/MR on actual basic |
| Jarvan IV | Martial Cadence first basic applies target-specific %max HP physical bonus, then six-second per-victim lockout |
| Sett | Pit Grit extra punch triggers on every second confirmed basic, not proc damage |
| Xerath | Mana Surge restores mana on first basic with 12s internal cooldown |
| Gragas | Happy Hour restores HP after a committed spell, with eight-second passive cooldown |
| Karthus | A confirmed kill restores mana; retained post-death, delayed Q and toggled Defile constraints |
| Galio | Colossal Smash splash on first basic damages nearby secondary opponents once per cooldown |
| Tahm Kench | Damage suffered builds Grey Health; E converts accumulated health into an additional shield and consumes it |
| Urgot | W Purge fires three target-locked, visible, in-range, interruptible authoritative follow-up shots |
| Shen | Ki Barrier after committed skill grants an internal-cooldown shield |
| Fizz | Nimble Fighter reduces incoming real basic attack damage without negating unrelated spells |
| Sejuani | Fury of the North gives reduced damage on one initial hit, then timed cooldown |
| Heimerdinger | Hextech Affinity grants movement speed while near a living own turret |
| Seraphine | Stage Presence produces bounded notes from allied proximity when casting and consumes them on the next basic |
| Lulu | Pix attached with E fires an independent owner-attributed magical follow-up on attached ally's basic |
| Mel | Overwhelm mark from spell damage is consumed by one valid subsequent basic to deliver her own damage |
| Varus | Living Vengeance triggers a timed movement/tempo state after a real kill, with champion-victim distinction |
| Yunara | Four successful basics build Vow; Q spends full stacks for a bounded empowered on-hit interval |

**Limitations:** Timings, pulse sizes, resource approximations and PvP tempo are intentionally modeled as discrete turns, but all unique LoL details, cross-system combinations and effects still require certification review. The no-boots restriction for Cassiopeia and remaining per-champion shop/rune parity are **not certified** by her movement speed test. A named mechanic passing one test does not prove the complete P+QWER kit.

## Final QA evidence (implementation HEAD)

- [Specialist Skills #40886348804](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40886348804) — **SUCCESS**.
  - M27 passive identities **52/52** across 25 champion families × blue/red with V40 snapshot equivalence, 0 failures.
  - M27 certification gate **35/35**, **140 QWER**, 17 dimensions, **0 certified**.
  - M26 identities **58/58**; M25 **50/50**; M24 **32/32**.
  - M20 original **280/280** executable slots on two seats and **70/70** snapshot replays; M21–M23 and older regressions preserved.
- [Logic QA #40886361301](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40886361301) — **SUCCESS**.
- [Skills projectile QA #40886361369](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40886361369) — **SUCCESS**.
- [Integrated QA #40886361481](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40886361481) — **FAIL at Node→browser generation/sync gate**, expected until the integrator reconciles and regenerates `engine.browser.js`. Skills engineer must NOT change that file.

## Files changed in M27

- `engine.mjs` — discrete authored passives, real attack receipts, champion-owned marks/status, no client-only damage.
- `tests/audit/v453_m27_b01_passive_identities.test.mjs` — **52 cases/25 champs**, both teams, effects not merely success flags, round-trip snapshot equivalence.
- `tests/audit/v453_m27_b01_certification_gate.test.mjs` — complete 35/140 blocker.
- `tools/skills_m27_b01_completeness_audit.mjs` — reproducible structured JSON output.
- `.github/workflows/skills-entity-targetability-p1.yml` — M27 tests and JSON artifact enforced.

## Next recommended M28

Use the generated M27 per-champion manifest to **close a real P+QWER functional family across the 35 fixed B01 champions**, not to merely increment a count of partial casts. Prioritize unresolved recast, terrain, directional targeting, summon/charge stock, item/rune/spell interoperability, fog/Realm adversarial checks, and ability-specific counterplay. Add negative tests on both seats (no fog leak, no wall piercing, no extra mana or cooldown on recast, correct owner, interruption, snapshot replay). Preserve 25–40 champion-scale macro-batch throughput, with **only genuinely complete individual kits becoming CERTIFIED**.

B02–B05 are fixed cohorts from M19 and should begin large authored groups without erasing unique identities. Throughput should be improved by tooling/data and parallel audited cohorts, not by generic effects or premature certification. The integrator, NOT this role, owns reconciliation and one-time Node→browser regeneration.

**No merge; no edits to `engine.browser.js`, `main`, `dev69/integration`, `version.json` or the Items branch.**
