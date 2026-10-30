# CoachLOL Macro Arena — M44 B23: authorial holds, realm-frozen projectiles and interruption exceptions

**Date:** 2026-10-30. **Branch:** `dev69/skills-batch2`. **Parent:** `683f03a97afb7ecad86372bc22b6f2bf22f9c684` (M44 B22). **PR #9:** Draft into `dev69/integration`; no merge.

## Scope: engine.mjs
- B23 keeps separate delivery identities: `irelia_w_dance` is a **defensive channel**, `m40_sett_haymaker` an interruptible **windup**, `galio_durand` an interruptible **charge**. Other unknown abilities stay `unknown`; no invented fallback casts and no full kit certification.
- `m44B23HoldInterruptReasonV453` is a shared deterministic reason calculator for death, realm change, hard CC and displacement. An authored opt-out for CC and (after release) movement protects Irelia's exception.
- `m44B23InterruptAuthoredHoldV453` replaces duplicated interruption cleanup for existing Sett, Galio and Master Yi states; emits bounded source-attributed receipts using the B22 journal. Viktor R and Kassadin Q reuse this adapter for charge/windup cancellation instead of deleting unrelated missiles or locked-in impacts.
- **Irelia W:** remains immune to CC *after starting*, including Viktor R and Kassadin Q's interruption behavior; manually recasting the active hold keeps the original mana and cooldown. Death, forced relocation (>60 world units during charge), and realm changes cancel an unreleased hit and stop defensive reduction. The released 0.5-second protection tail can move. Physical/magic reduction is not applied to true damage.
- **Sett W:** Grit shield is granted on cast and survives interruption; only the scheduled Haymaker hit for the matching owner and token is removed on CC, movement, death, realm changes, or valid interrupts. A noninterrupted 0.75-second delayed cone still hits.
- **Galio W:** no mana is charged for beginning an authored charge. Its active hold records its realm and is invalidated before release by CC, displacement, death, realm changes, or valid skill interruption. A legitimate release still grants Galio's distinct mitigation tail; an interrupted charge cannot later get a free release.
- **Projectiles:** existing `m44_authored_projectile` packets, including Jhin R bullets, store `m44B23LaunchRealmId` at launch. `m44B23ProjectileRealmMatchV453` and the existing enemy pool retain impact targeting in the projectile's originating realm after its caster dies or enters a different realm. This also applies to authored Seraphine Encore allied extension and Kha'Zix splash. Projectiles are not reclassified as channels and are not retrospectively canceled. Older packets without the new optional field continue through the previous realm behavior for snapshot compatibility.

## QA executed on the exact B23 candidate engine
- **Engine blob:** `75addccd1f054451891a3eb222da890373acca1c`
- **B23 suite blob:** `b4ac517c332dd531bff0ff0fadbf8a64e59fd156`
- 41 existing M44 suites B01–B22: **1,504/1,504 PvP scenarios passed** on the new engine blob, across blue/red fixtures; previous suites were not edited.
- New B23 suite: **23 cases × 2 PvP seats = 46/46 passed**, snapshot/checksum restoration checked for each scenario. Covers CC-immune Irelia W, no-free-cost recast, death/displacement/realm cancellation, true-damage exception, Sett scheduled hit and shield persistence, Viktor/Kassadin source attribution, Galio charge and release, and fired missiles after death and realm relocation.
- Combined **42/42 suites; 1,550/1,550 PvP scenarios; zero test failures**, in isolated JavaScript V8 using the exact candidate `engine.mjs` plus real repository map and mask JSON, Node file/assert adapters in memory.
- The QA verifies simulated PvP mechanics and snapshots. It is **not** an execution of native Node `node --test`, the full npm test matrix, real network multiplayer, browser/UI/GLB visuals, complete matches, or full patch fidelity. Those remain `NOT_RUN` / not certified for B23.

## Scope and integration safety
- Only three files in `dev69/skills-batch2`: `engine.mjs`, the new B23 audit suite, and this handoff.
- No merges, Actions, Codespaces, background worker, other branches, version bump, item/catalog edits, UI changes, or full engine/browser synchronization in this isolated skills batch.
- If integration later generates `engine.browser.js`, regenerate it from this tested canonical engine and execute browser/Node and multiplayer QA before integrating or releasing.
- Previous code remains recoverable from parent commit `683f03a97afb7ecad86372bc22b6f2bf22f9c684`; rollback means reverting this one B23 commit if needed, not resetting history.

## Next M44 priority — B24
Resume larger **authored champion identity** batches after the shared infrastructure. Select unfinished Q/W/E/R and passive slots from the actual implementation maturity matrix; implement real champion-specific cast, recast, movement, targeting and CC exceptions in the original executor, **not** generic stand-ins. Mirror each new case blue/red and repeat targeted M44 regression before any new milestone claim. Keep the draft PR isolated and do not merge until integration gates are intentionally opened.
