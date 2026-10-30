# CoachLOL Macro Arena — M44 B33A | Sion, Ornn, Yasuo Q/W authored (55 suites, 1,960 PvP checks)

## Scope
- Parent: `90a04712f71d81c93ed2ad0d461d84aa1e9a60ff`, branch `dev69/skills-batch2`, PR #9 Draft (unmerged).
- New original authorial registry `M44_B33A_KITS_V453`: six slots in three champions that previously had **no** original board Q/W entries: Sion Q/W; Ornn Q/W; Yasuo Q/W.
- Gameplay implemented directly in the V40-authoritative owner/team/realm/queue/commit pipeline, with no generic ability fallback, no duplicate asset or engine.browser.js, no item/integration/main changes.
- Original executor `m44B14DOriginalBoardRuleV453` is shared by ordinary champions and Viego's original borrowed Q/W. No per-champion manual Viego copy list.

## Mechanic contracts and honest fidelity limits
- **Sion Q / Decimating Smash**: aimed physical smash in 750u/250u corridor, `chargeSeconds` accepted from 0.5 to 2 seconds, scaled damage; stun after 1s charge, knock-up after 1.5s. Queue and commit gates protect mana/cooldown. Tactical **predeclared charge-strength adapter**: does not yet model interruptible in-flight/channel hold or release animation.
- **Sion W / Soul Furnace**: shield with 6s state and owner ID, recast available no earlier than 1s and only while the shield still holds. Recast causes AoE magic damage, removes the Sion-specific shield, and costs zero extra mana/CD; destroyed/expired shield invalidates before commit. Scaling and absorbed damage use existing V41 layered shield engine. Missing passive permanent HP stacking on kills.
- **Ornn Q / Volcanic Rupture**: physical line, slow, and owner-scoped delayed magma pillar at authored position (activates at +1.125s, remains 4s). Pillar is linked to shared B18 `walkable`/obstacleLine/A* skill-wall path, with 65u collision radius rather than true production mesh. Q projectile flight and displaced first-champion stop are pending.
- **Ornn W / Bellows Breath**: directional 500u cone, percent target maximum-health bonus, source-scoped Brittle mark (3s); Ornn's own next basic attack consumes mark and grants bonus magic damage + short knockup, without recursive basic attacks. Existing skill-shield, line-of-sight, realm/owner filtering apply. CC-amplification and unstoppable channel still pending.
- **Yasuo Q / Steel Tempest**: 450u physical stab with owner-scoped timed stack (6s), third Q launches long-range 1100u tornado and knocks up hit champions; Q range revalidated after opposite team intent before debit. Accurate cast animation/projectile travel pending.
- **Yasuo W / Wind Wall**: four-second owner/team-aware projectile barrier registered in `projectileBarriersV453Dev43`, intercepted by shared B21 projectile blocker, ignores allied projectiles and expires on server time. Tactical radial interceptor approximation rather than correct directional rectangular mobile wall; needs production mesh and all-missile compatibility.

## Focused bilateral PvP evidence
- New `tests/audit/v453_m44_b33a_three_champions_qw_authorial_pvp.test.mjs`:
  * **34/34** scenarios PASS, 17 cases mirrored blue/red, **34/34** V40 snapshot restores.
  * Registry, missing E/R remains explicit null; Sion weak/full charge, invalid charge, delayed/broken W recast with no second cost, queue/commit revalidation, Ornn pillar timing and expiry, Brittle damage and AA consumption, off-axis miss, Yasuo Q stacks/reach/tornado/stale-stack denial, Wind Wall team filter and expiration, Viego Sion Q original source reproduction.
- Regression: **54/54** previous M44 suites B01–B32B PASS on the exact B33A candidate blob. Historical **1,926/1,926** test scenarios.
- **Total 55/55 M44 suites, 1,960/1,960 PvP scenarios, 0 failures** in JavaScript V8 with in-memory assert/fs/URL adapters and real repo map/mask fixtures.
- Not run: native Node `node --test`/npm, browser build, gameplay over network, full match replay, release or patch 26.21 P+QWER certification. Fully certified kits: 0.

## Artifacts / status
- Engine blob: `41679f7328a42e379fdfb8de5b92006e1bfb529f`.
- New tests blob: `a0855ca4c8b2bf3f763f27dde706803d08b5da64`.
- Files changed: `engine.mjs`, `tests/audit/v453_m44_b33a_three_champions_qw_authorial_pvp.test.mjs`, this handoff.
- No GitHub Actions, Codespaces, workers, merges, rebases or force pushes.

## Next priority
- B33B: extend authorial P/Q/W/E/R identities across more previously absent champions; do not duplicate already-authored alternate legacy Nami/Vex/Irelia/Ezreal paths. Validate future Ornn pillar projectile/terrain physics and Sion interruptible charge, Yasuo directional wind wall.
- Keep full 55-suite M44 V8 regression for any next engine commit. Target larger 25–40 champion cohorts over multiple focused sub-batches with clear partially-implemented counts.

## References
- https://www.leagueoflegends.com/en-us/champions/sion/
- https://www.leagueoflegends.com/en-us/champions/ornn/
- https://wiki.leagueoflegends.com/en-us/Yasuo
