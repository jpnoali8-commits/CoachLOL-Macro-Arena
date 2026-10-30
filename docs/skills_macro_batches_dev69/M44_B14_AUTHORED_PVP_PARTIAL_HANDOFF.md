# CoachLOL Macro Arena — M44 B14 (A+B) authored PvP handoff

**Date:** 2026-10-29. **Base B13 SHA:** `818aa05a4e3b5d9311ce9226ea1f7ab78a0f0b74`.
**Only edited branch:** `dev69/skills-batch2`. PR #9 remains **open, Draft and unmerged**, targeting `dev69/integration`. No GitHub Actions, Codespaces, workers, branch merge or browser regeneration were invoked.

## Scope delivered: 11 champion identities, 13 new authored slots

B14A (`M44_B14A_KITS_V453`): 8 individual active slots across 7 champions.

| Champion | Slot | Author-owned behavior |
| --- | --- | --- |
| Azir | Q | Commands **only Azir's own** live soldiers; advances their position over walkable terrain, resolves line contacts from each original soldier location |
| Zed | Q | Shuriken fan projected separately from caster and his live shadows; owner IDs and repeated-target attenuation |
| Jayce | Q | Hammer AoE slam versus Cannon ranged blast, dependent on genuine R transformation |
| Rumble | W | Scrap Shield with shield, movement speed and accumulated Heat |
| Kalista | R | Oathsworn-only ally displacement, shield and eligible knockup near actual enemy; mismatch rejected before canonical resource debit |
| LeBlanc (`Leblanc`) | R | Mimic **Distortion W** relocation/damage, requires prior W and retains authorized return; only that mimicked spell supported |
| Aphelios | Q | Weapon-specific effects: Calibrum projectile, Severum drain hits, Gravitum owner-root on basic-hit mark, Infernum spread and Crescendum owned sentry; explicit owner ammo ledger |
| Aphelios | W | Swaps primary and offhand weapon, persisted on champion |

B14A follow-up prevents Aphelios Q on insufficient ammo and Kalista oath mismatch **before** mana/cooldown debit. Gravitum hit mark attaches to a real basic hit while Gravitum is primary.

B14B (`M44_B14B_KITS_V453`): 5 individual active slots across 4 additional champions.

| Champion | Slot | Author-owned behavior |
| --- | --- | --- |
| Hwei | Q | Player-selected **QQ** Devastating Fireball / **QW** Severing Bolt / **QE** Molten Fissure persistent area; queue stores and validates `m44B14Variant` |
| Hwei | W | Player-selected **WQ** Fleeting Current / **WW** Pool of Reflection / **WE** Stirring Lights; speed, shield, empowered basic distinct |
| Ekko | W | Parallel Convergence: delayed board zone, shield only if Ekko enters, stun on exposed enemies inside at detonation |
| Bard | W | Caretaker's Shrine: delayed, owner-scoped ally healing at real map position |
| Aurelion Sol | Q | Breath of Light, directional temporal area damage with stasis/CC/movement/death cancellation |

All numbers remain **CoachLOL turn-board tactical approximations**, not audited Riot patch coefficients. These contracts execute through real Arena/board skill commit paths rather than anonymous placeholders.

**Count:** 11 distinct champion identities affected by new authored behaviors, **13 distinct new Q/W/R slot contracts**, **0 complete certified P+QWER champion kits**. Existing B13 28-champion coverage remains separate, and older generic fallback debt is not eradicated.

## QA: 948 / 948 directed scenarios in 24 suites, run in this ChatGPT session

Actual branch `engine.mjs`, `data/coachlol_map_v6.json` and `data/masks_128.json` were fetched through the GitHub connector. The engine and all test bodies were executed with **JavaScript V8** inside this conversation, with imports mapped to local in-memory fixtures (not a fake engine). Directed scenarios resolve actual `Arena` skills and verify `snapshotV40` → `Arena.fromSnapshotV40` checksum invariance. Fixtures explicitly stub visibility/walkability/obstacle LOS where noted; those are **not** proof of the complete fog/terrain matrix.

- B01–B13: **866 / 866 PASS**, all **21 existing suites rerun on final B14B engine blob** `625f2f49d9bc8f307de2aa8442a713d0ba772c23`.
- `tests/audit/v453_m44_b14a_authored_owner_skills_pvp.test.mjs`: **30 / 30 PASS**, blue/red mirrored casts, binding/ammunition/return/swap/states and snapshot.
- `tests/audit/v453_m44_b14b_hwei_timed_identities_pvp.test.mjs`: **32 / 32 PASS**, all Hwei Q/W variants, invalid variant refusal, deferred zone impacts, owner-stasis cancellation, Ekko stun, Bard heal, snapshot.
- `tests/audit/v453_m44_b14_mixed_simultaneous_pvp.test.mjs`: **20 / 20 PASS**, 10 two-human mixed-composition pairs mirrored, both participants queue during frozen planning, authoritative independent receipts and snapshot. One Kalista/Hwei fixture was correctly isolated beyond Kalista's ultimate knockup radius because in closer contact its real knockup **legitimately interrupts** Hwei's queued cast. We do NOT pretend that both commits must succeed when the opposing action interrupts the actor.

Total added B14: **82 / 82** scenarios. Total B01–B14: **948 / 948**, **24 suites**. This is directed V8 QA on the authored engine—not Node-native test execution, `npm test`, web browser parity or live networked two-client QA.

## Commits

- `37fc5627dedc703af32918631bbde26c4b701685` — 8 authored B14A skills.
- `984e5ad165e51b230a0f109b32dfcb3d7e388b01` — no-double-spend queue and commit validation; Gravitum on basic.
- `1d5cd77c228d7bbd2ff08d3ce5dcde8013da964a` — 30 B14A permanent tests.
- `54e851e0defde1999484d0fad6b8546927eeacd2` — Hwei and delayed owner zones.
- `e9aae7b648b820824a6ebf3c4f543884ddf342c9` — 32 B14B permanent tests.
- `722ea35b285216de79edfabd5258ccf77a830a24` — 20 simultaneous B14 permanent tests.
- This handoff commit.

## Important limitations / next technical priority

- Hwei **E variants and R**, passive, interactions among books/verse lock, exact cooldown and mana rules remain incomplete. Hwei's new Q/W verses are authored adaptations, not a complete 10-spell kit.
- Aphelios full five-gun **basic attacks consume ammo**, queue evolution, automatic ammo rotation, realistic Chakram/Crescendum stack state, weapon-moon passive and ultimate are **not complete**; current ammo ledger is currently Q-focused. Gravitum mark is only added on actual Gravitum primary basics.
- Kalista official preseason bond binding, R ally release decision/recast, valid minimap choices, exact repositioning, hostile suppression/immunity and other edge cases remain partial. Current binding is first accepted R target, not preselected in champ select.
- LeBlanc Mimic supports **W only**; Q/E and clone/passive interactions not completed.
- Bard shrine is targeted at an allied champion rather than arbitrary ground placement; Aurelion Sol Q channel is a strategic-turn approximation, not realtime geometry.
- `M44 B14C` should prioritize Viego possession with copied P+QWER state and expiry/ownership, Sylas Hijack of new B13/B14 ult descriptor metadata (without impersonating victim ownership), Akshan resurrection/Scoundrel and swing state, and expanded Hwei/Aphelios/LeBlanc/Jayce. Preserve source champion identity and PvP snapshot/fog/idempotence per ability; continue producing 25–40 identities per full production cohort where feasible. No anonymous fallback substitutes in these new slots.
- **NOT RUN / NOT CERTIFIED:** whole repository `npm test`; native Node `--check`; `engine.browser.js` parity; browser GUI, Chromium E2E; two truly connected players; complete 17-dimension P+QWER certification; accurate Riot 26.21 coefficients; full fog/anti-cheat/redaction, pet and item interactions; release QA and ZIP/assets. Zero full kits certified; do not promote Draft PR or merge without explicit user permission.

**Production isolation respected:** no writes to `main`, `dev69/integration`, `engine.browser.js`, `version.json`, item catalog, server PvP or GitHub workflow assets. No Actions minutes consumed in the ChatGPT tests.
