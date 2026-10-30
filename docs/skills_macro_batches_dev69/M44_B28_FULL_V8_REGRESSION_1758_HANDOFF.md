# CoachLOL Macro Arena — M44 B28 | Complete V8 regression addendum

## Verified source
- Engine commit: `f0d579b42be1cb0e0cb7d051960ceb609f4e32c6`, branch `dev69/skills-batch2`.
- Engine blob SHA: `b1f4e3446ceaebc8a38749c4c336b4d29415481c`.
- Tests: the 47 `tests/audit/v453_m44_*.test.mjs` files from B01 through B28, fetched from the same commit and executed in source order.
- Data: `data/coachlol_map_v6.json` and `data/masks_128.json` from the exact tested commit.

## Results
- **47/47 suites PASS** with zero reported test failures.
- **1,758/1,758 scenarios PASS**: historical B01–B27 reported 1,726; new B28 has 16 authored checks mirrored across blue/red = 32 additional scenarios.
- All eleven B11–B13 suites, ten B14–B16 suites, ten B16A–B22 suites, ten B01–B10 suites, and six B23–B28 suites passed.
- Includes copied-source Sylas/Viego, projectiles, walls, channel interruptions, snapshots, and newly authored Anivia/Katarina/Kennen operations.

## Truthful execution limits
The exact GitHub candidate source was parsed and its test bodies executed directly in a JavaScript V8 isolate, replacing Node-only `import` and `readFileSync` harness bindings with in-memory equivalents while preserving the test bodies and the real map/mask JSON. This is **not native Node.js CI**, browser QA, item integration or an end-to-end networked PvP match. Do not promote any champion to `certified`.

## Isolation
No GitHub Actions, Codespaces, worker, merge, force push, `main`, `dev69/integration`, `engine.browser.js`, `version.json` or item branch changes. PR #9 remains Draft.

## Highest-value B29
1. Anivia Q: continuous missile travel at true speed, independent pass-through hit ledger, slow, first-contact and explicit second explosion without forced five-tenths-second impact.
2. Katarina: dagger drop geometry/vision, pickup damage and Shunpo targeting parity, anti-dash and on-hit interactions.
3. Kennen: real energy restoration on E, E-end attack-speed window, shared mark diminishing stun duration and precise R cadence.
4. Next multi-champion cohort, using original-source executor with bilateral PvP checks and no generic slots.
