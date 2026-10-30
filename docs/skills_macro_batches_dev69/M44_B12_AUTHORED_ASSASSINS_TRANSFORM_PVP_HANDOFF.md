# CoachLOL Macro Arena — M44 B12: Assassin / Transformation / Projectile Cohort

**Date:** 2026-10-29. **Starting HEAD:** `0198ec6710b06cbe721d62a92ce9de616be98b66` (M44 B11). **Exclusive branch:** `dev69/skills-batch2`. **PR:** #9, base `dev69/integration`, Draft, no merge.

## Delivery — 8 distinct champions / 18 newly authored active QWER slot contracts

M44 B12A `M44_B12_KITS_V453` (10 slots across 4 champions):
- **Evelynn E** Whiplash: targeted percent-HP magic damage, interacts with matured, owner-scoped existing W Allure mark (charm and temporary magic-shred state), temporary mobility. **Evelynn R** Last Caress: front-facing cone, low-health amplified damage, actual collision-checked backward escape and a short evasion window.
- **Rengar Q** Savagery: one genuine enhanced AA with Ferocity accounting, normal vs empowered branch. **W** Battle Roar: local magic damage, heals based on recently received actual damage, empowered cleanse for supported status types. **E** Bola Strike: real authored travelling projectile; regular contact slow, empowered root; spell shield and wall checked on contact.
- **Kha'Zix Q** Taste Their Fear: true isolation check across nearby friendly teammates / realm, bonus physical damage and evolved-Q cooldown interaction. **E** Leap: real destination relocation, area damage and terrain checks.
- **Wukong/MonkeyKing Q** Crushing Blow: one enhanced actual basic attack, authentic physical armor-reduction ledger. **E** Nimbus Strike: gap close plus maximum two authored secondary phantom targets. **R** Cyclone: moving owner-anchored multi-tick physical damage zone, one knockup per target and a movement buff. W invisibility/clone from M16 remains.

M44 B12B `M44_B12B_KITS_V453` (8 slots; 5 champion names, Khazix already in B12A):
- **Akshan Q** Avengerang: travelling, extending boomerang with separate out/return hit ledgers; actual wall and travel handling.
- **Talon Q** Noxian Diplomacy: near-melee critical branch vs longer-distance leap, with pre-debit terrain revalidation. **W** Rake: projectile out-and-back, return-amplified physical hit and slow.
- **Viego Q** Blade of the Ruined King: direct short sword thrust, owner-marked basic-attack double-hit. **R** Heartbreaker: point-based blink, lower-health-target priority, damage to nearby enemies, 150-unit collision-checked secondary physical knockback and slow.
- **Kha'Zix W** Void Spike: real projectile with impact splash; caster heals when sufficiently near the impact point.
- **Kai'Sa/Kaisa Q** Icathian Rain: target-seeking six missiles; evolved version twelve missiles, no generic omniscient long-range targeting. **R** Killer Instinct: requires actual Kaisa-owned Plasma mark from her W projectile / basic attack, target validation, terrain-safe dash and temporary shield; dynamically invalid pre-commit mark or wall never spends mana.

**Contract counts:** B12A 10 + B12B 8 = **18 new active slots**, across **8 distinct champions**: Evelynn, Rengar, Khazix, MonkeyKing, Akshan, Talon, Viego, Kaisa. Do NOT count this as 8 fully certified kits. Existing M16 stealth kits are still the dispatch precedence for established unique slots. M44 B12 adds precise per-champion semantics only for its explicit flags; it does not remove legacy training placeholders elsewhere.

## Executed QA — real JavaScript V8, offline PvP

Actual published `engine.mjs` was read directly from the branch, compiled and exercised in V8 with the repository's real `data/coachlol_map_v6.json` and `data/masks_128.json`. All scenario fixtures include checksum equality after `Arena.fromSnapshotV40` round-trip (not merely a JSON stringify). Neither GitHub Actions nor Codespaces nor a background worker was invoked.

Persistent test files in `tests/audit`:
- `v453_m44_b12a_authored_assassins_pvp.test.mjs`: **42/42 PASS**, blue/red named QWER mechanics, Ferocity, isolation, armor reduction, stun/knockup, health recovery, delayed timing, walls and snapshots.
- `v453_m44_b12b_authored_return_plasma_pvp.test.mjs`: **32/32 PASS**, two-seat boomerangs, return legs, Wukong/Talon/Kaisa/Viego specific ownership, Heartbreaker *actual secondary displacement*, Plasma precondition/revalidation and snapshots.
- `v453_m44_b12_mixed_simultaneous_pvp.test.mjs`: **16/16 PASS**, 8 distinct mixed-champion pairings with both blue↔red swaps; both players queue in the same planning phase before the authoritative two-sided resolution.
- `v453_m44_b12_negative_pvp.test.mjs`: **20/20 PASS**, shielding, invalid cast/realm/terrain changes, spell ownership, no unearned marks and no mana debit on invalid recasts/commits.

**B12 increment:** 110/110 directional scenarios approved, 110 snapshot roundtrips. **All previous M44 B01–B11:** 650/650 approved again. **Consolidated on final code:** **760/760 passed, zero observed failures in 17 targeted suites**; zero complete champion kits certified.

### Explicit QA limitations

NOT RUN / NOT CERTIFIED: all-repository `npm test`, native Node/browser compilation, built `engine.browser.js` synchronization, Chrome E2E, two actually network-connected PvP clients, full 17-axis P+QWER kit certification, live-patch numeric balance correctness, security against malicious network packet manipulation, and complete roster interactions. Tests deliberately provide deterministic visibility/terrain fixtures and do not substitute for final fog/pathfinding verification in a real match.

Identity details still **partial** and require follow-ups:
- Evelynn full Hate Spike casts/recasts, Whiplash enhanced movement and advanced stealth; Rengar full brush leap/unique Ferocity behavior while hard-CCed; Kha'Zix evolution variants; Wukong ult recast, W decoy agency; Akshan E swing and W Scoundrel revive; Talon unique E wall vault; Viego passive possession; Kai'Sa evolving equipment, full plasma proc/combo; calibrating LoL v16.21 values for strategic board pacing.
- B12 numbers are board-game mechanical adaptations, not an exact live-patch certificate. Existing Riot 16.21.1 champion JSON stored in `data/riot_reference/source_16_21_1/riot/16.21.1/en_US/champion/` provided qualitative spell names and identities.

## Committed code/test history

- `824d2a1c887f4caf7fab37f375062dcd7c50d4c1` — B12A ten authored slots.
- `f32d4ca85f1568a4b6f8ad0de8bb20f8d62ecd03` — B12A real temporal/proc identities.
- `b445007c4f8aa457edd42c9fad5a19ea514d6a97` — B12A 42-case suite.
- `34f0432a5f3fc0605493f79dd8ff07b006ee6c85` — B12B new slots, queue guards.
- `9e88263298fbab4b86c43f6183ef5a61ace74b2a` — B12B individual spell effects.
- `c398ecaa1698127c9900ab5c610efccbb7029cc7` — B12B boomerang, Plasma, W proc.
- `4a3078865a51a1efa6dbb6330a7691d8090a2da5` — B12B 32-case suite.
- `380916bfc0dc7f589683d4a1cd99cadea63876b6` — 16 mixed PvP cases.
- `b1c8128c239e6a7919efd1af5bea278efa702613` — pre-commit terrain guards.
- `6cedd3e8b0ca3f34fac65d8b81148fbcee3dc85b` — 20 negative cases.
- `f58fa445d22e1b3e0c07c2dc77e2153150ca45d7` — Viego R true displacement.
- `e782e6df65c7fc97a0b30f52ecad2722801320d1` — Viego R displacement regression.
- This file: final B12 handoff.

**Never** merge PR #9, delete unrelated branches, touch `main`, `dev69/integration`, `engine.browser.js`, `version.json`, item catalog, Actions/workers/Codespaces, or inflate kit completeness counters from these scoped results.

## Next recommended M44 B13 priority

Move to a **larger author-owned roster batch** rather than a small number of one-off spells, selecting approximately **25–40 champion identities** according to actual complexity. Optimize a shared engine of genuine primitives but keep **explicit champion+slot metadata, individual unique mechanics, persistent ownership and legal PvP actions**. Strong candidates: LeBlanc deception and recast, Shaco decoys + clone, Neeko deception, Viego possession, Akshan swing and Scoundrel, Hwei stance, Aphelios weapons, Azir soldiers, Aurelion Sol evolution, Bard stasis and portal, Kalista ally-bound ult, Sylas R hijack, Jayce form-specific casts, Nidalee/Elise transformations and Wukong R recast. Treat each champion as partial until a real P+QWER/interaction matrix is complete. Retain both-side 5-unit human PvP command semantics (one player per side), commit specific tested slots, and preserve deterministic V40 snapshots.
