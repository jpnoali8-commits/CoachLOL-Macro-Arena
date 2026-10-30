# CoachLOL Macro Arena — M44 B21: shared projectile interceptors, authored missiles and realm isolation

**Date:** 2026-10-30. **Branch:** `dev69/skills-batch2`. **Input HEAD:** `703ee82d8adafdeb6623ffe8e2bfb1206d75f819`. **PR #9:** Draft to `dev69/integration`, unmerged.

## Implementation in original engine
- Added `m44B21ProjectileBarrierHitV453(from,to,team,source,now)`, a single reusable finite-segment circle-intersection procedure returning the earliest contact and stable barrier-ID tie break. Source-owned and fixed barriers reuse B20 live/fixed centers; expired/dead sources cannot intercept.
- The routine excludes same-team projectile interception. When a known barrier owner is in a different combat realm from the projectile source, it will not intercept across Death Realm isolation.
- Added `m44B21AuthoredProjectileBarrierHitV453`, which computes the actual next temporal step rather than the entire future path before checking contact.
- Removed the legacy `v.champ==='Samira'` interception branch from `m44_authored_projectile`; all registered authorial interceptors (including original Samira W and the same code executed by Viego copying her W) now work with authored projectiles using the same shared geometry.
- Temporal projectile interception occurs before body collision, secondary damage, marks, CC, impact bursts and boomerang/return stages. A bounded serializable `m44B21ProjectileInterceptHistory` retains the intercepted projectile, owner, original champion and slot, barrier ID and collision point.
- Existing V42 incremental outgoing missiles and returning Ahri Q also use the shared segment intersection. No anonymous fallback skills, generic champion effects or new fabricated QWER kits.

## Exact QA evidence — same B21 engine blob
**Engine blob SHA:** `5cbeec9348b0274392e012449de58f7d237445e1`.
**B21 test blob SHA:** `f9caf7fe9bcc79a8d11c6fd5c72d760a137cfaea`.

- Ran all historical M44 B01–B17 suites: **36/36 suites, 1392/1392 mirrored PvP scenarios passed**.
- Re-ran B18: **28/28**; B19: **16/16**; B20: **16/16**.
- Ran new B21 authorial integration suite: **11 scenarios mirrored on blue and red = 22/22**, 129 assertions, **0 failures**. Tests include finite segments, own-team non-interception, missed segment, expiry and owner death, original Morgana Q, moving Samira W versus Ashe R, non-Samira barrier intercepting Morgana Q, deterministic barrier tie break independent of array order, persisted interception history across snapshots, suppressed Sejuani secondary impact, and Death Realm isolation.
- **Grand total 40/40 M44 suites, 1474/1474 PvP scenarios PASSED**, zero failures on the B21 candidate.

## Test environment and limitations
Actual `engine.mjs` and repository map/mask JSON were run in JavaScript V8 isolates, adapting Node-only imports, file read and assertion APIs in memory. These are real engine execution tests, not a static source scan. Native `node --test`, complete project corpus and `npm test`, browser, server-authoritative networked multiplayer synchronization, 3D/visual/UI QA and Riot patch-perfect identity parity remain **not certified**. **0 additional complete P/QWER kits certified.** Source-linked registry is future-friendly but individual champion mechanics still require authorial implementations.
No GitHub Actions, Codespaces, workers, merge, UI, version, item, CI or other-branch changes.

## Next recommended milestone M44 B22
Audit and implement source-authored projectile classification for beam vs projectile vs channel, explicit interrupt/cancel semantics (including CC, caster death, target realm changes and boomerang returns), with PvP differential tests before moving to large new champion batches.
