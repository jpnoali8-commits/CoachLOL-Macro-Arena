# CoachLOL Macro Arena — M44 B17A+B: 24 original tactical slots, V8 PvP QA

**Date:** 2026-10-30. **Branch:** `dev69/skills-batch2`. **Input HEAD:** `1a4fdf1bf65cd01cb0339480c89bf96decde30ed`. **PR:** #9 remains Draft to `dev69/integration` and MUST NOT be merged without user authorization.

## Executive summary

This continuation adds **24 champion-authored QWER slots for 14 source champions** in two explicit registries, `M44_B17A_KITS_V453` (12) and `M44_B17B_KITS_V453` (12). The descriptors resolve via `m44B14DOriginalBoardRuleV453`, `executeBoardSkillV453Dev69`, and authoritative serialized turn ticks. **No generic training ability was used to implement these authored slots.** Sylas R and Viego possession use exactly the same owner descriptor and core executor; no champion-specific copy or clone fork.

### B17A — 12 slots

| Champion | Slot | Identity implemented |
|---|---|---|
| Lissandra | E | Glacial claw flight damage and serialized travel endpoint; recast incomplete |
| Malzahar | W | Up to 3 owner-bound Voidling entities with deterministic attacks prioritizing Malefic Visions victims |
| Rakan | R | The Quickness movement boost and per-target one-time timed charm |
| Sylas | Q | Chain Lash initial burst plus delayed detonation |
| Briar | R | Certain Death target rush, impact fear and owner frenzy hunt |
| Kalista | W | Oathsworn-aware sentinel summon/entity (sentinel vision/path AI not yet certified) |
| Jayce | E | Hammer knockback; acceleration gate self-boost in ranged mode (full shared allied gate geometry not yet certified) |
| Hwei | R | Spiraling Despair application slow followed by timed explosion |
| Samira | Q | Flair tactical melee-versus-ranged split and unique style advancement |
| Volibear | Q | Thundering Smash stun and movement boost |
| Volibear | W | Frenzied Maul owner-keyed wound and repeat bite heal |
| Yorick | W | Dark Procession timed cage/slow; true blocker collision not yet certified |

### B17B — 12 slots

| Champion | Slot | Identity implemented |
|---|---|---|
| Volibear | E | Delayed Sky Splitter damage and self-shield |
| Kindred | Q | Dance of Arrows dash plus up to 3 localized arrows, Wolf W cooldown synergy |
| Kindred | W | Owner timed Wolf's Frenzy zone attacks |
| Kindred | E | Mounting Dread mark: 3 real owner basic hits and physical detonation |
| Kindred | R | Lamb's Respite: shared 10% HP floor through actual damage pipeline for BOTH teams, plus expiration heal |
| Poppy | Q | Hammer Shock initial hit and serialized second shock |
| Poppy | W | Steadfast Presence boosted speed, anti-dash owner zone; guarded at commit before spending resources for move_point casts |
| Poppy | E | Heroic Charge tackle: wall contact adds stun, otherwise push |
| Poppy | R | Keeper's Verdict cone knockback; full charge distance and knockback map path not yet certified |
| Samira | E | Wild Rush target dash and style progression |
| Samira | R | Inferno Trigger requires six style stacks in queue AND commit; consumes stacks and creates timed AoE pulse |
| Taliyah | R | Weaver's Wall timed route and tactical relocation; physical wall collider generation explicitly not certified |

All owner timers are stored in snapshot-compatible arena/unit state (no JS timers, client-authoritative state or worker).

## Executed tests

The **actual corrected engine candidate blob** `d59255c4e6de4934ca7947fbac9bd7836c367af2` was compiled with JavaScript V8. Three new saved `tests/audit` files run executable gameplay against the actual map and mask JSON files:
- `v453_m44_b17_authored_cohort_pvp.test.mjs` — **48/48 PASS**, 24 explicit descriptors twice (blue/red), receipt, cooldown, stable identity, snapshot restore.
- `v453_m44_b17_adversarial_pvp.test.mjs` — **16/16 PASS**, Kindred bilateral minimum HP and expiry healing, three-hit Kindred E, Poppy anti-dash denial with no debit, Samira R two-stage grade gates, Voidling owner attack, Volibear repeat wound healing, Poppy wall stun, delayed Volibear E.
- `v453_m44_b17_shared_sylas_viego_pvp.test.mjs` — **32/32 PASS**, Sylas R steals Kindred/Poppy/Rakan/Hwei, Viego Q/W/E from Kindred/Poppy/Volibear/Malzahar, both seats; identical source descriptors, preserved actor ID/team and snapshot integrity.

Previous **33 M44 B01–B16 suites: 1296/1296 PASS**, rerun against the same B17 engine blob, including B16 Bard corrected portal, B14D Sylas/Viego and simultaneous PvP. **Total 36 M44 V8 suites, 1392/1392 cases PASS** (1296 old + 96 new); no previously passing M44 regression detected.

### QA constraints and incomplete work

This is *real executable V8-directed game QA*, not native Node `npm test`: Node assertion and file imports are narrowly mocked; actual JavaScript engine source and actual map/masks are loaded. No GitHub Actions, Codespaces, workers, or GitHub minutes were used. Browser bundle `engine.browser.js`, complete browser/game client synchronization, online two-client networking, art/VFX, authoritative multiplayer server, UI, full kit patch-parity and complete item economy were **not** tested in this milestone.

**No complete champion P+QWER kit certified (0).** The 24 new authored slots are partial fidelity until all passive interactions, variants, range/ranks, recasts, channels, collision and fog/privacy audits pass. Explicitly preserve B17 partial status: Lissandra claw recast, Kalista sentinel vision, Jayce ranged gate, Yorick W wall collider, Taliyah R wall collider, Poppy W non-move-point dash hooks, Poppy R channel/release, and full Samira style/AA rules remain future work, not silently certified.

Do not merge PR #9; do not edit main/integration/items/engine.browser.js/version.json/CI.

**Next:** M44 B18 — close incomplete champion P+QWER interactions rather than count visually present spell names; prioritize generic but *identity-aware, reusable* game-system primitives (authored wall colliders, terrain-aware displacement, entity vision, movement interception across dash types, projectile/recast staging) so missing champion behaviors need no duplicate Sylas/Viego source implementations.
