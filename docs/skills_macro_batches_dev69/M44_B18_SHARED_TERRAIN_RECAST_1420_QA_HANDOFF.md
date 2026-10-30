# CoachLOL Macro Arena — M44 B18: reusable authored terrain, A*, recast and dash interception

**Date:** 2026-10-30. **Branch:** `dev69/skills-batch2`. **Input HEAD:** `13bd771164de4f95ba37e05e539e8ace2022c4ce`. **PR #9:** stays Draft to `dev69/integration`, **NO MERGE**.

## Scope and production

The M44 B18 milestone hardens the universal deterministic **board/PvP mechanics engine** without inventing generic champion substitutes and without duplicating Sylas/Viego mechanics:

- Shared `m44B18SkillWallsV453` derives active, source-owner-linked and serializable collision shapes from the **existing** original Yorick.W (closed circle), Taliyah.R (finite segment) and Azir.R (finite segment perpendicular to command). The source champion's original executor owns creation, even after Sylas steals Azir R or Viego takes Yorick W.
- `m44B18SkillWallPointV453`, `m44B18SkillWallLineV453`, `m44B18SegmentDistanceV453` are reusable world-distance geometry primitives. They are integrated into `walkable`, `obstacleLine`, and `findPath`, not independent per-champion ad-hoc callbacks.
- **A* anti-wall-crossing fix:** 128x128 grid-cell samples alone allowed a path to escape a closed Yorick ring. The solver now rejects **edges crossing an authored barrier**, checks start adjustment against the barrier and validates source-to-first and last-to-destination segments; the physical wall remains finite and can be routed around if an external path exists. Skill-wall geometry is precomputed once within each A* call for local edge tests.
- **Lissandra E original recast:** queue-time `m44B17GlacialPath` stage check, owner-claw arrival token and commit-time revalidation, no second mana/CD debit, realm/landing constraints, serializable state, old claw state consumed only on successful teleport. Copies use the same source descriptor.
- **Poppy W pre-debit dash interception:** shared `m44B18DashBlockerV453` computes proximity of the dash **segment** to the defender, including targeted Samira E, Briar R, Diana E, Poppy E and ordinary move-point dashes. Keeps Bard E terrain portal and Taliyah R wall traversal outside this class and excludes Lissandra E claw's first-stage projectile. If blocked, returns the established `m44_b17_poppy_anti_dash` before spending mana or starting cooldown.

## QA actually executed against one candidate source blob

**Candidate engine blob:** `3f092cdc291cd72b331fa6ecf79236fe28e0c07d`.

- All 36 committed M44 B01–B17 suites rerun in JavaScript V8 against this same B18 engine source, map and mask fixture: **1392/1392 PASS, 36/36 suites**.
- New committed suite `tests/audit/v453_m44_b18_shared_terrain_recast_interception_pvp.test.mjs` executes **14 scenarios mirrored across 2 sides = 28/28 PASS** with deterministic checkpoints. Cases: Yorick W ring closes A*, Yorick expiry reopens, Taliyah R wall/serialization/expiry, Azir R finite detour with no illegal edge, Lissandra E recast zero cost, premature-flight reject, post-queue blocked landing reject without debit, four targeted/point dash denials against Poppy W, non-dash Taliyah R and Bard E exceptions, Sylas-stolen Azir R wall under Sylas actor, and Viego-possession Yorick W wall under Viego actor.
- **Total M44: 37/37 suites and 1420/1420 V8 scenarios PASS**, no formerly passing M44 regression observed.

### Important QA boundaries / work still due

- This is **executed** V8-directed QA (not source scanning); JavaScript export tokens are unwrapped and the Node test imports (`assert`, `fs`, `URL`) are narrowly shimmed, while real source and real map/mask JSON are used.
- **Native Node `npm test`, the full project test corpus, visual browser/gameplay, networked two-player server, `engine.browser.js` synchronization and live route performance remain NOT RUN.** GitHub Actions/Codespaces/workers were not used.
- Wall representation here is a conservative shared physics obstacle, not yet a full LoL-parity material/ownership-filtered collider. **Team-specific pass-through, projectile-specific collision, LoS, minimap/UI wall rendering, fog secrecy, player hitboxes, all dash variants outside the explicitly guarded subset, full charge mechanics and one-by-one champion parity still need further milestones**. Never certify complete P/QWER passive kits from this milestone; **0 newly certified complete kits**.
- Existing unrelated map / Rift / Jarvan walls remain in their own earlier primitives; B18 adds authored champion walls only.
- No modifications permitted outside skills branch; do not merge PR #9, update `main`, `dev69/integration`, items, UI, `engine.browser.js`, version or CI here.

## Next priority (M44 B19)

Add actor/team-aware wall traversal and charge-based wall strength, integrate the same pre-commit dash and geometry checks into remaining diverse authored dash types, plus authored projectile-wall interactions where the original champion requires them; then cover whole-champion P/QWER identity/AA/passive cross-interactions. Continue source-registry reuse for Sylas R and Viego copied passive/QWE with no duplicate logic.
