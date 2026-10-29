# M44 B02 — Authored Sejuani, Milio, Lucian impact stages

Date: 2026-10-29. Skills-only branch `dev69/skills-batch2`.
PR #9 remains Draft -> `dev69/integration`. Never merge here.

## Engine source
- Starting HEAD: `1d6fe1d27ce0b7df4dc14ff1a40459e85e969a06`.
- Engine implementation commit: `809064f7f8af79d3808a34ff95dc8aea7e66ed32`.
- `engine.mjs` alone implements M44 contact dispatch. No Items, version, browser or infrastructure edits.
- Existing six M44 B01 identities preserved.

## Three authored projectile families (NOT kit certification)
1. **Sejuani R**: travels, ignores ordinary minions, first champion-shaped contact stuns according to traveled distance, then queues one finite Glacial Prison storm dealing secondary magic damage/slow (also at ground range expiry).
2. **Milio Q**: first body, including minion, takes primary Q damage; first champion is displaced only when not spell-shielded; the ball bounces forward and on a later turn deals separate area damage/slow without replaying primary damage.
3. **Lucian W**: travelling first-body projectile; no launch damage; actual collision/terminal landing triggers four authored crossing star rays. Only enemies physically struck and not shielded get Ardent marks, used by the existing Lucian attack/passive speed handler.

All stages use deterministic world coordinates, collision order, source ownership, finite `nextAt/until`, same combat realm, blocked terrain and serializable temporal records. No generic QWER substitute. M44 still incomplete; 0 kits certified.

## QA and limitations
- Full source V8 syntax parse after removing ESM declarations in the isolated environment: **PASS**.
- Methods extracted from the actual M44 engine and run with mock Arena services: **24/24 PASS** (2 sides × 3 identities × normal/minion/spell-shield/miss). This tests the M44 temporal scheduler/impact code, **not** the full game.
- New full-engine regression: `tests/audit/v453_m44_b02_authored_impact_stages.test.mjs`, 18 two-seat scenarios with V40 snapshot checks; **NOT_RUN** in the current chat because Node runtime of the complete repository is unavailable.
- `node --check`, `npm test`, browser/Chromium, simultaneous multi-client PvP, real snapshots/reconnection, M44/M43 historical regressions: **NOT_RUN** (do not call PASS).
- Continue authoring projectile and counterplay cohorts, prioritizing 25–40 champions when complexity permits. Full P+QWER 17-dimension and integration certification stay at Skills milestone; fix observed severe regressions immediately.

## Next production
Expand M44 to further individually authored projectile families, then prioritize real snapshot and simultaneous PvP regressions when the complete Node environment is accessible. Do not create infra branches, Codespaces or Actions. No merge / force push / reset.
