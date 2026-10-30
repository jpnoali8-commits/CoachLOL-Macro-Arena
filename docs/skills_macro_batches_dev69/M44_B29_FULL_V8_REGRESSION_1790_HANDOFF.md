# CoachLOL Macro Arena — M44 B29 full V8 regression addendum

## Confirmed source
- Tested M44 B29 source commit: `7fd2a01758a36da8a5b11e9f6abe0e6eae62510f`.
- Source engine blob: `cfbbdbadefc137ad8f0753933017163e1c0d1ed0`, from the published commit.
- Repository map and mask JSON loaded from this exact GitHub commit.
- 48 `tests/audit/v453_m44_*.test.mjs` suites (all B01–B29), fetched from the same commit and executed under in-memory V8.
- Node-specific ESM imports and file loader were adapted into equivalent in-memory bindings for source execution; actual test bodies, assertions, map/mask and engine logic were used.

## Full results (run after implementation was published)
| Group | Suites | Passed scenarios | Reported failures |
| --- | ---: | ---: | ---: |
| M44 files 1–10 (B01–B10) | 10 | 582 | 0 |
| M44 files 11–20 (B11–B13A) | 10 | 256 | 0 |
| M44 files 21–30 (B13B–B15) | 10 | 346 | 0 |
| M44 files 31–40 (B16–B21) | 10 | 290 | 0 |
| M44 files 41–48 (B22–B29) | 8 | 316 | 0 |
| **Total** | **48** | **1,790** | **0** |

New B29 scenarios: 16 source-specific cases × 2 PvP colors = 32 pass, each with V40 snapshot/checksum restoration. Previous B28 regression was 47 suites / 1,758 cases.

## Authorial QA dimensions
- Kennen P repeated stuns, source-scoped mark ledger, energy restoration/cap.
- Kennen E refund once even when multiple targets are hit, no hit refund, actual damage, manual and automatic end, four-second attack interval boost, no duplicate AS extension.
- Katarina Q first-victim dagger placement, full bounce damage, exact 1.02s dagger landing, rank/level Shunpo refund and realm ownership.
- Historical Sylas/Viego, traps, missiles, channel interruption, shared wall collision, simultaneous PvP, previous B26–B28 behaviors.
- Historical B26 suite updated for intentional rule changes: Katarina Q timing and Kennen E energy refund. No test assertion was removed or bypassed.

## Validation limits and isolation
These results certify **only the executed M44 V8 contracts**, not complete official P+QWER parity, native Node integration, browser builds or two-human network PvP. No kit is labelled certified. No Actions, Codespaces, worker, merge or changes to other branches. `engine.browser.js`, `version.json`, `main`, and `dev69/integration` remain untouched.

## Next priority (M44 B30)
1. Anivia Q: authoritative 950 units/sec projectile with independent passage slow/damage, per-target hit ledger, and 225-radius detonation stun. Preserve legal early recast and shield/realm/collision semantics.
2. Kennen R per-target storm hit/mark immunity after the third stack and exact 6-tick cadence.
3. Katarina Q trajectory and visibility/terrain fallback improvements; E on-hit interactions without generic attack substitution.
4. Then resume broader source-authored champion cohort expansion, mirrored PvP tests and snapshots.
