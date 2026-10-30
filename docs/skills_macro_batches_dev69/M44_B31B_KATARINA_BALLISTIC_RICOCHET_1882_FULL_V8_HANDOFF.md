# CoachLOL Macro Arena — M44 B31B | Katarina Q ballistic ricochet (52 suites / 1,882 PvP)

## Parent and scope
- 2026-10-30, parent `62787cf1b866dd393387022f7d130dcefce479e8`, branch `dev69/skills-batch2`, PR #9 Draft, no merge.
- Focused changes to `engine.mjs` and three existing Katarina contract tests plus new mirrored B31B PvP suite. No browser bundle, Items, integration branch, or main edits.

## Source-authoritative Katarina Bouncing Blade
- Replaced **instant on-cast Q damage** with a serialized source-specific temporal projectile `m44_b31_katarina_q_flight`, registered as a projectile rather than channel. Owner, team, launch realm, stage, hit IDs, first contact time, and next scheduled impact stay under game-time/V40 checkpoint ownership.
- Initial target-locked flight: **1600 world units/second** with authoritative 625 cast range. Moving target shifts arrival time based on actual initial-target distance; no damage before real first contact. An already-launched Q survives caster movement, CC and death; dead initial victim remains a valid geometric impact anchor but never receives damage again.
- At most **two additional bounces**, each **0.15 simulated seconds** after its preceding contact; each enemy is hit at most once per Q. Secondary victims are selected using the engine's currently visible enemy pool and world geometry **when the prior bounce arrives**, not from the opponent's queue or at cast time. Targeted subsequent bounce remains locked if it later moves out of vision.
- Fixed secondary acquisition radius at **450 world units**. Uses launch-realm eligibility, shared `obstacleLine` terrain checks and target projectile-guard protection. Spell shields negate contact damage but do not silently erase the thrown dagger. No generic-skill fallback.
- Official Q per-rank magical damage **80/115/150/185/220 +40% AP**; mana remains zero; cooldown 11/10/9/8/7.
- **Owned dagger drops 1.023 seconds AFTER the FIRST actual hit**, at ~350 world units opposite the first target at that impact. Subsequent bounces cannot move or postpone the ground dagger. The existing B31A deterministic nearest legal terrain fallback remains in effect; no legal terrain means no fake dagger. Q ground drop continues even if Katarina dies or changes realms after launch, with the original launch realm stored; other W dagger behavior is unchanged.
- The shared Voracity, Shunpo, one-time on-hit item pipeline, mana/cooldown, and Sylas/Viego original-source execution were not duplicated or replaced.

## Tests and intentional B26/B29/B31A contract migration
- Engine source blob: `7da7847f72e9cd72f7c195fc315fcc09c29cb1f6`.
- Modified B26 `070b0bf17f0b8617d375f12336bb2a0d767fbb02`: deferred Q hit and drop assertions, no instant damage.
- Modified B29 `66ff88f9bf162032b4df0314ce37937f96ed4a18`: first-target opposite 350 units, Q initial hit +1.023s delayed landing, three actual bounce times, equal damage.
- Modified B31A `2e3cceecc9d70b71a22c9b2aca535579e80e3479`: delayed legal-ground/no-ground tests and a **source-corrected** secondary visibility contract. This explicitly replaces B31A's former inaccurate 'bounce reaches hidden secondary' assertion, following https://wiki.leagueoflegends.com/en-us/Katarina (currently visible secondary targets). Tests were revised for changed mechanics, not removed.
- New B31B test `5fd8a6cd5b1991ba8bf76f1b92debe3b9f94e8a2`: **20 scenarios × blue/red = 40/40 PASS**, each with V40 snapshot/checksum reconstruction. Includes arrival speed, mana and source-authored Q damage, two 0.15s bounce stages, three-hit ceiling, first-impact independent fixed dagger timing, first target movement/death, caster death/movement, shields, fog acquisition and post-lock loss, secondary projectile guard, wall block, realm transition, item-targetable dagger only after landing, checkpoint continuation and duplicate-frame denial.
- All **50** pre-B31A M44 suites B01–B30B passed on the same candidate; B31A **18/18** and B31B **40/40** also passed.
- **TOTAL 52/52 suites and 1,882/1,882 PvP scenarios, zero failures.**
- Actual source `engine.mjs`, map and mask JSON, original authored test bodies, and JS V8 engine execution with in-memory Node ESM/assert/fs adapters; NOT native Node `node --test`, full npm tests, native browser, multiplayer network, full champion P+QWER certification, or production release QA.

## Safeguards
- No GitHub Actions, Codespaces, workers, forced writes, merges or branch rebases.
- Do not merge PR #9; remains Draft on `dev69/skills-batch2`.
- Still no complete P+QWER champion kit certified. Future priority: accelerate authored skill coverage through larger champion cohorts (25–40 champions per macro-package where shared primitives are ready), prioritizing missing passives/QWER and individual counters without generic fallbacks.
