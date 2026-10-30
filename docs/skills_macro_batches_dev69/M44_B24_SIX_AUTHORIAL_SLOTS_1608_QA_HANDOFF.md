# M44 B24 — six source-authored board slots (1,608 bilateral PvP QA scenarios)

## Canonical base and scope
- Parent commit: `d067bd6ac8244b7eff17ab1282a43cd4a3f60775` (B23).
- Branch: `dev69/skills-batch2`, PR #9 remains Draft targeting `dev69/integration`.
- Engine: `engine.mjs`; candidate blob: `97f626a9db05055a08f093a1902b250082ac026a`.
- New test: `tests/audit/v453_m44_b24_six_authored_slots_pvp.test.mjs`; blob: `69bb47ad6abfe3fa63d6f107a9f18cd2facafe44`.
- Exactly **six new Q/W/E/R board definitions across five champions**, registered in `M44_B24_KITS_V453`, before earlier authored kit tables and before old generic/training rules. **Not a full-kit certification.**

## Authored slot behaviors

1. **Jhin Q — Dancing Grenade:** up to four distinct enemy contacts, deterministic next-target selection within 400 units, first-target range validation, 35% damage amplification for each killing bounce (capped), no obstacle-spanning bounce, one mana/CD receipt.
2. **Nautilus W — Titan's Wrath:** six-second personal shield with max-health contribution; valid basic attacks apply bonus magic damage and small, enemy-only splash while the buff is active. No recursive attack dispatch.
3. **Nautilus E — Riptide:** three timed expanding shockwaves (260/440/620 board units, 0.35-second spacing), diminishing repeat hits and slow; one per-target receipt per wave. Scheduled effect is serializable, fixed to the original cast position and stops if the owner changes realm.
4. **Thresh E — Flay:** oriented contact wedge with magic damage, slow, obstacle-safe displacement in the chosen cast direction. Spell shield blocks displacement/slow. This is a **directional approximation**; full push/pull controls and passive Flay buildup remain not certified.
5. **Senna R — Dawning Shadow:** large directional line with a narrower central enemy damage ray and a wider allied shield ray, champion-team and realm separation, deterministic target enumeration. Zero-length directions are rejected before cost. Instant tactical resolution does not certify actual projectile animation/travel parity.
6. **Caitlyn R — Ace in the Hole:** champion-only target lock and 0.8-second deferred shot. Intercepts at the closest enemy champion crossing the aim segment; shared channel interruption handles hard CC, death, movement, realm change, Viktor R, and cancelling the pending shot. Invalid nonchampion targets are rejected before cost.

- Source-authored R logic automatically reused by **Sylas** (Senna R, Caitlyn R) through the B14D original executor. **Viego** possession reuses Jhin Q and Nautilus W/E with the existing copied owner/appearance/ultimate rules. No new per-champion copy lists.
- All B24 rules reject malformed authored intent before mana/CD debit; unsupported IDs cannot silently fall back into generic combat.
- Snapshot-compatible timed fields are plain JSON data, and skill receipts are one-time, server-authoritative.

## Exact QA performed
- **42 prior M44 suites** B01–B23 run against the **exact final B24 engine blob** in V8 with authentic repo map/masks, in-memory Node assert/file adapters: **1,550 / 1,550** PvP scenarios, **0 failures**. Covers existing authored projectiles, collision barriers, channel cancellation, Sylas/Viego, snapshots, and mirrored seats.
- **New B24 suite: 29 cases mirrored for blue and red = 58 / 58** scenarios, all with V40 snapshot/checksum roundtrip; **0 failures**. Includes all six source-authored slots, timing, bounces, on-hit/splash, cast direction, spell-shield defenses, geometric interception, CC/death/Viktor interruption, Sylas stolen R, Viego possessed Q/W/E, malformed intent without debit, and realm-change isolation.
- **Combined: 43/43 suites, 1,608/1,608 PvP scenarios; no failures.** Exact source and test blobs listed above, no estimated counts.
- **NOT RUN**: native Node `node --test`, complete `npm test` suite, browser UI, `engine.browser.js` bundle synchronization, network multiplayer, GLB effects, full match loops, complete LoL patch fidelity. This QA does **not** certify full champion P/Q/W/E/R kits or full production release.

## Isolation and next priority
- Only `engine.mjs`, one new B24 audit suite, and this handoff changed.
- No GitHub Actions, Codespaces, workers, merges, external branch changes, or version bump. Actions may be used selectively later if native environment testing is required, per user authorization.
- Prior engine history remains available at B23 parent commit above; no force-push.
- **M44 B25 candidate:** complete additional genuinely missing authored slots (e.g., Thresh R, Pyke R, Senna remaining R now added, Caitlyn R now added, Evelynn Q), cross-check live engine rather than stale dev44 champion coverage. Prioritize multi-champion cohorts and strict authored cast/target/CC/terrain/realm contracts. Test both PvP seats before commit. Keep PR #9 Draft.
