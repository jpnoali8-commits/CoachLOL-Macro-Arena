# CoachLOL M44 B06 — Xayah / Jhin targeted identity refinements

Date: 2026-10-29. Exclusive source branch `dev69/skills-batch2`, PR #9 remains **Draft**, target `dev69/integration`. No merge, no Actions, no Codespaces.

## Authored source changes (not generic champion fallback)

- **Xayah R**: replaces one-tick universal `invulnerable` proxy with a champion-owned, serialized `m44XayahUntargetableUntil` state. Enemy target selection and new basic/ability hits cannot target Xayah during the window; already-applied DoT damage remains effective. Legacy B05 test expectation updated to validate the correct status.
- **Xayah Q**: two separate dagger routes with symmetrical, independently persisted slight angles, instead of identical overlapping rays. The existing projectile scheduler and feather ownership are preserved.
- **Xayah E**: Bladecaller travels back to Xayah's position **when the recall resolves**, instead of being locked to her cast origin. Wall crossing and blocked hits are rejected. Triple-feather ownership and spell-shield behavior remain covered by B05.
- **Jhin R**: upgrades the earlier M16 four-shot direct hit to four independently scheduled traveling projectiles, one bullet per player recast. Minions do not stop the bullet; champion-shaped clones intercept; contact, terrain, spell shield, missing-health scaling, fourth-shot multiplier, slow, and team reveal use the real scheduler. No second mana/cooldown debit. The first aimed bullet fixes a 60-degree shooting sector for the following recasts, a **board adaptation**, not a claim of full Riot timing/camera/cast-cone parity.

This is 2 champions and targeted improvements of previously partial spell contracts, **0 newly certified full kits**. Do not count this as 2 completed champions or add to the B05 44 contracts as though they were new QWER slots.

## QA evidence

Performed in this ChatGPT session using the actual full `engine.mjs` evaluated in JavaScript V8 with repository `coachlol_map_v6.json` and `masks_128.json`. Test functions and V40 snapshot/checksum replay are real, not mocked gameplay.

- M44 B01: **34/34 PASS**
- M44 B02: **18/18 PASS**
- M44 B03: **106/106 PASS**
- M44 B04: **100/100 PASS**
- M44 B05 (updated semantic expectation): **104/104 PASS**
- M44 B06 (new `tests/audit/v453_m44_b06_xayah_jhin_identity.test.mjs`): **16/16 PASS**, both teams, each case includes a V40 snapshot/checksum verification
- **378/378** scoped tests passed (362 prior + 16 new).

Native `node --check`, repository `npm test`, browser Chromium / generated client parity, two connected real PvP clients, release assets and complete 17-dimension champion certification: **NOT_RUN**. No GitHub Actions minutes consumed.

## Known debts / next priorities

- **Xayah**: exact Featherstorm duration, actual R damage/cast travel, W attack speed and ally interaction, Clean Cuts attack split and terrain cases, E rank scaling/simultaneous timing and combat responses. Do not certify until P+QWER and all interactions pass.
- **Jhin**: opening Curtain Call aiming/orientation currently fixed by first projectile, not R1 cast; cone telegraph and range presentation, precise fourth-shot crit rules, channel interruption/defender response, multiple colliders/untargetability and hidden-entity information must be reviewed.
- **Future batch**: group high-identity projectile/recast/clone/trap mechanics across a substantial roster without introducing anonymous damage contracts. Verify interaction matrix and complete kits before final integration.

No changes to items, `main`, `dev69/integration`, `engine.browser.js`, server PvP, versions, workflows or unrelated work.
