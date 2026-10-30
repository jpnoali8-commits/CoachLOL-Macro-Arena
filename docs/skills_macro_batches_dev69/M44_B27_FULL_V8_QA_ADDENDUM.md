# M44 B27 — Comprehensive V8 Regression QA Addendum

## Frozen source and scope
- Source commit tested: `9fe3e47ed9f923132f8ffa83c984c1b78b3efcb3`
- Branch: `dev69/skills-batch2` (Draft PR #9, no merge)
- Candidate engine blob: `c3d6b410b4f430afb58a3cb2e5d866e0f463693f`
- Actual repository `data/coachlol_map_v6.json` and `data/masks_128.json`
- Direct in-memory V8 evaluation of exact engine and test-suite source, with Node assertion compatibility and memory-mapped map/mask. No GitHub Actions, Codespaces, worker, remote runner or local checkout.

## Full M44 suite run
- **46 / 46 V8 suites PASS** (every `tests/audit/v453_m44_*.test.mjs` from B01 through B27).
- **1,726 / 1,726 historical + B27 individual scenarios PASS**.
- Zero assertion failures across the 46 suites.
- Previous B26 baseline: 45 suites / 1,698 scenarios; B27 contributes 28 new mirrored cases, yielding 1,726.
- All suites exercised authored PvP contracts and the suite-specific board/snapshot conditions. Bilateral seats, fog and temporal interactions retain their own coverage, as defined by the individual suites.
- Historical B26 Viego versus Anivia fixture updated legitimately: lethal damage now creates Rebirth egg, so Viego waits for the genuine second kill. No loosening of assertions was used to pass the regression.
- Includes known B01–B21 authored projectile/identity/mixed PvP checks and B22–B25 channels/interception/skills; B26 and B27 suites also passed.

## Limitations and truth status
- V8 testing required adapting ESM import/Node fs harness to direct in-memory execution of equivalent test bodies; it is not identical to running `node --test` in a native checkout.
- NOT performed: native Node `node --check` and `npm test`, browser engine generation and visual QA, websocket/two-client network sessions, full Nexus match QA, item integration, assets or all official Riot patch interactions.
- No champion P+QWER kit promoted to `certified`; these milestone contracts remain WIP.
- `engine.browser.js`, `main`, `dev69/integration`, `version.json` and item branches were not changed; PR #9 remains Draft and unmerged.

## Future production
Proceed to B28 with source-authored recasts/real target identities (Anivia Q, Katarina E-to-dagger, Kennen E/R) and the next missing-skill cohort, preserving shared original-executor Sylas/Viego and this baseline gate.
