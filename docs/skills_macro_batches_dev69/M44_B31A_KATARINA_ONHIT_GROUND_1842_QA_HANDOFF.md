# CoachLOL Macro Arena — M44 B31A | Katarina Q ground fallback, E/P on-hit (51 suites / 1,842 PvP)

**Date:** 2026-10-30. **Parent:** `f242ca8267acba07bf2328b5a6ff0fd8b8b38e57`. **Branch:** `dev69/skills-batch2` only. PR #9 Draft, unmerged.

## Implemented in canonical engine.mjs
- Katarina E (Shunpo) on both target-unit and owned-ground-dagger paths now sends its **single genuine ability damage packet** through the existing `ability_onhit_v453_dev40` source-specific pipeline. This applies equipped on-hit item procs, retains target spell shield behavior, does **not** masquerade as a basic attack, and never grants basic-only Energize spending, attack charge, Guinsoo Fury or attack-stack state.
- A successful Shunpo resets the player's basic-attack readiness time (`attackAt`), without inventing a new AA attack and without changing `lastAttackAt`. The existing cooldown and mana debit are still single-use.
- Katarina passive dagger pickup uses that same ability-on-hit pipeline **only for enemy champions** struck by the authored dagger AoE. Enemy non-champions retain ordinary spell classification. Original passive E cooldown refund and owner-only pickup remain unchanged.
- Katarina Q keeps the previously authored first-target bounce/dagger landing at 1.02s; its ground point now uses deterministic nearest-valid 16-angle rings at 0/25/50/75/100/125/175/225/300 world units around the preferred landing, preserving map/realm legality. If no legal ground is found, the Q hit still resolves but **no fake dagger entity** is spawned. No second debit and no generic fallback.
- Source-specific Q visibility rule intentionally allows a secondary **bounce** to hit an unseen target. First target remains subject to queue-time visibility/range validation.
- **Not implemented here:** precise temporal missile flight for Katarina Q. Q contact damage remains its existing on-cast tactical proxy and should not be described as projectile-speed parity.

## QA evidence (candidate)
- `engine.mjs` source blob `7db81d6db7a6e6024683be63de04008bdd22ecfa`
- New test suite `tests/audit/v453_m44_b31a_katarina_shunpo_onhit_ground_pvp.test.mjs` blob `1e2b35ad711fd980be9a0f34bb724bafc27c1c3b`
- New B31A: **9 focused scenarios × 2 PvP seats = 18/18 PASS**, with V40 checksum restoration. Includes Shunpo items, dagger AoE, attack timer reset, spell shield negation, fake dagger denial, walkability, missing ground, secondary bounce visibility.
- Historical M44 B01–B30B: **50/50 suites and 1,824/1,824 scenarios PASS** on identical candidate source in four + one batches of 10 suites. Original test bodies, map and masks were used; no historical assertion was removed or bypassed.
- **TOTAL: 51/51 M44 V8 suites, 1,842/1,842 mirrored PvP scenarios, zero failures.**
- Environment: isolated JS V8 execution of canonical engine with in-memory Node ESM/import/fs/assert adapters, **not** native `node --test`, not full `npm test`, not browser/net multiplayer or UI/GLB QA.

## Safeguards and remaining scope
No Actions, Codespaces, worker, merge, branch reset, `engine.browser.js`, `version.json`, `main`, `dev69/integration` or Items modifications. No P+QWER kit certified. Original-source dispatch for Sylas/Viego preserved.

## Next priority — M44 B31B
Implement actual Katarina Q target-to-target projectile trajectory with per-bounce travel, first victim acquisition, collision/realm rules, exact fixed 1.02s ground arrival after first hit, and no target visibility leakage. Migrate historical instant-contact test expectations deliberately. Then expand authored champion P+Q/W/E/R cohorts; keep full Node/browser/net QA gated until integration.

Source references: https://wiki.leagueoflegends.com/en-us/Katarina ; https://wiki.leagueoflegends.com/en-us/On-hit_effects
