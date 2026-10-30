# CoachLOL Macro Arena — M44 B16C: runtime QA and Bard E correction

**Date:** 2026-10-30. **Branch:** `dev69/skills-batch2`. **Starting HEAD:** `3a7ac42d75eef53a158e63c998d06685a2915f87` (M44 B16B). **PR #9:** Draft, NO MERGE. Scope restricted to original skill owner engine, tests and this report.

## Root cause and correction

The initial B16A suite passed 48/48; B16B was **36/38**, with two symmetric Bard.E failures: `destino_bloqueado`. Bard Magical Journey correctly required obstacleLine between owner and endpoint, but the generic move-point commit check also unconditionally rejected obstacleLine **before** the Bard-specific executor. This made the authored wall-passing ability impossible.

`executeBoardSkillV453Dev69` now excludes only `s.m44B16BId==='Bard.E'` from the generic **obstacleLine move-point commit check**, while preserving all walkability/map/realm validations and the dedicated Bard queue-time and commit-time wall checks. This is not a generalized no-collision bypass; other move-point spells retain their obstacle guard.

A new B16B negative case mirrors both teams and removes the wall between queue and resolution; it asserts a denied receipt `m44_b16_bard_wall_lost_before_commit`, **no mana/cooldown debit**, unchanged actor position and checksum-consistent snapshot.

## New 24-case real simultaneous-intent suite

`tests/audit/v453_m44_b16_mixed_simultaneous_pvp.test.mjs` pairs twelve B16 champion interactions in blue/red mirrors, queues both human team orders prior to resolution, captures authoritative per-owner receipts, validates stable team/ID and rollback/snapshots. **24/24 PASS, 42 successful casts, 6 correctly denied by `incapacitado` due to an opposing CC resolving first; those six do not spend mana.** These denials are expected control interactions, not errors or skipped fixtures.

## Final V8 QA matrix (all executed against the SAME corrected source blob)

**Candidate corrected engine blob:** `3adc79c8337d7aa18c62f4ac31119dde99c56206`.

| Scope | Suites | Cases | Result |
|---|---:|---:|---|
| Previously committed M44 B01–B15 | 30 | 1184 | **PASS 1184/1184** |
| B16A, original authored identities | 1 | 48 | **PASS 48/48** |
| B16B, including new Bard adversarial guard | 1 | 40 | **PASS 40/40** |
| B16 mixed simultaneous human team intents | 1 | 24 | **PASS 24/24** |
| **Total** | **33** | **1296** | **PASS 1296/1296** |

All cases construct actual `Arena` instances, resolve original skills with the game's real `engine.mjs`, and use real GitHub-sourced map and mask JSON. The execution environment is an isolated ChatGPT JavaScript **V8** runner; ES module `export` declarations are unwrapped and Node `assert`, `fs.readFileSync` and `URL` imports are supplied by strictly scoped synchronous test shims. These are executable scenarios (not text/AST-only test inspection), but remain **V8-directed QA**, not native Node execution.

### NOT RUN / NOT certified
- Native `node --check`, native `node tests/...`, `npm test` full historical repo.
- Synchronized `engine.browser.js`, full browser, GLB/VFX, PvP with two genuinely networked clients, fog-release gates, performance/anti-cheat/redaction.
- Full patch 26.21 Riot accuracy; full Q/W/E/R/passive/ranks/charges/recasts/collision/target interactions and 17-axis champion certification. **0 new certified complete kits**.
- No Actions, Codespaces, background worker or GitHub minutes consumed.

## Isolation and handoff

M44 B16A/B preliminary reports declared the tests NOT RUN as of those commits; **this B16C QA report supersedes that preliminary status**. Only `dev69/skills-batch2` has been modified; do not merge PR #9 or alter `main`, `dev69/integration`, `engine.browser.js`, items, version or CI workflows.

**Next technical priority M44 B17:** expand original P+QWER coverage in large identity-preserving cohorts, particularly owner-specific delayed-state and AA interactions. Continue consuming the same shared original descriptor/executor for Sylas and Viego, no per-copy reimplementation and no generic training fallback for missing abilities.
