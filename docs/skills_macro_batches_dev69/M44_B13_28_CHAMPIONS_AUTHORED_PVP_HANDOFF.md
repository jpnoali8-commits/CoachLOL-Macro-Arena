# CoachLOL Macro Arena — M44 B13: authored PvP champion cohort (28 identities)

Date: 2026-10-29. **Starting verified head:** `e2ae064df055a5ab79bbeb9b74f2fd64ded5e064` (M44 B12).
**Only branch edited:** `dev69/skills-batch2`. PR #9 targets `dev69/integration`, remains **Draft / open / unmerged**.

## Delivered scope

Added **28 distinct champion/slot descriptors** with named, champion-owned behavior, split equally:

### B13A: 14 champions, 14 slots — `M44_B13A_KITS_V453`

| Champion | Slot | Authored gameplay |
| --- | --- | --- |
| Bard | R | Tempered Fate applies real stasis to enemy and allied champions in its impact area; minions get stasis timer |
| Aurelion Sol | E | Singularity is a persistent pulling/damage zone with terrain-bounded relocation |
| Anivia | R | Glacial Storm is a persistent icy damage zone with slow |
| Kalista | E | Rend consumes **Kalista-owner-scoped** spear stacks earned on real basic hits, slows and refreshes E on kill |
| LeBlanc (`Leblanc`) | W | Distortion damages on real dash and reactivates free to the ORIGINAL start point; no generic pre-move |
| Jayce | R | Level-one Hammer/Cannon mode switching with specific attack/movement empowerment, including the fixed gate |
| Rumble | Q | Flamespitter makes a directional, owner-anchored tick zone and accumulates Heat |
| Taliyah | W | Seismic Shove displaces local targets subject to walkability and actual terrain |
| Lissandra | R | Frozen Tomb: distinct self-stasis/healing and enemy stun/damage with icy field |
| Ekko | R | Chronobreak reads only persisted earlier owner positions/HP; restores position and heals with area damage |
| Zed | W | Server-owned shadow entity and legal no-cost swap while alive; does not become another champion |
| Katarina | E | Shunpo teleports to an actual valid target point and damages enemies only |
| Nami | W | Ebb and Flow chains up to three alternating enemy damage and allied healing, no target reuse |
| Azir | W | Arise creates owned, finite-life non-champion soldier; real basic attack interaction with nearby soldier |

### B13B: 14 champions, 14 slots — `M44_B13B_KITS_V453`

| Champion | Slot | Authored gameplay |
| --- | --- | --- |
| Malzahar | R | Nether Grasp suppression plus a time-dependent tethered damage field with range/CC checks |
| Fiddlesticks | R | Crowstorm: collision-aware relocation and local repeated magical damage |
| Volibear | R | Stormbringer: local landing damage and temporary enemy tower disable respected by real tower fire loop |
| Samira | W | Blade Whirl damages nearby enemies and intercepts actual opposing travelling projectile **swept segment**, not merely its origin |
| Yorick | R | Maiden as a server-owned fighting pet, never an eleventh human champion |
| Ryze | R | Realm Warp relocates allied units on the delayed simulated clock; not an instant teleport on cast |
| Skarner | R | Impale affects max three valid cone enemies, suppression and bounded follow drag |
| Nocturne | R | Paranoia dives selected visible enemy and restricts the victim team's remote vision sources during darkness |
| Briar | W | Blood Frenzy auto-targets nearby visible enemies, attacks at owned game-clock ticks and heals from landed damage |
| Bel'Veth (`Belveth`) | E | Royal Maelstrom: timed real damage to local targets and temporary incoming damage reduction |
| Rakan | W | Grand Entrance physically travels to the target area and applies a delayed AoE knockup |
| Pantheon | E | Aegis Assault reduces front-facing incoming damage and damages units in front on ending |
| Diana | R | Moonfall pulls nearby enemies toward her position, then deals amplified delayed damage based on targets |
| Shyvana | E | Flame Breath line contact and caster-owned burn; dragon form leaves a persistent detonation zone |

**Count carefully:** 28 new individual active slot contracts across **28 distinct champions**, **zero complete certified P+QWER kits**. Each uses its identity name, typed ledger, movement or channel as appropriate. Numbers are CoachLOL strategic-turn approximations, not certified Riot 16.21 patch numerical parity. Existing M14/M15/M16 systems remain in dispatch precedence for their previously implemented slots. No new anonymous training fallback behavior has been authored for these slots; older global training fallback debt elsewhere in the engine remains.

### Notable bug fix during the milestone

The inherited generic `move_point` operation moved Leblanc *before* her new authored W handler could record the original location, making W2 return to the wrong place. Fixed by excluding `m44B13Id` and `m44B13BId` from generic pre-movement. B13 movement now happens only once per legal named receipt. Added permanent regression in the adversarial suite, on both PvP sides.

Fixed the `queueBoardSkillV453Dev69` R-level gate: it now respects existing `SPECIAL_R_FROM_LEVEL_ONE` rather than hard-coding only Nidalee/Elise, so Jayce transformation R is actually castable at level 1. Permanent bilateral tests included.

The B13 Samira blade whirl interception also uses a swept projectile **segment** (deflect a flight that passes through the whirl's area), rather than looking solely at the projectile's previous position. Test persists in adversarial suite.

## QA evidence: real offline JavaScript V8

Every suite ran against `engine.mjs` retrieved from this branch, with the repository's real `data/coachlol_map_v6.json` and `data/masks_128.json` loaded into a JavaScript V8 runtime. Every B13 case checks that snapshot → `Arena.fromSnapshotV40` → snapshot has the same `checksumV40`, preserving deterministic actor and owner state. Test harness has explicit deterministic fog/LOS fixture stubs where appropriate. It is **not** a connected browser test or whole-program QA.

New permanent test files:

- `tests/audit/v453_m44_b13a_authored_identities_pvp.test.mjs`: **28/28 PASS** (14 champions, blue and red seats).
- `tests/audit/v453_m44_b13b_authored_identities_pvp.test.mjs`: **28/28 PASS** (14 champions, blue and red seats).
- `tests/audit/v453_m44_b13_adversarial_pvp.test.mjs`: **30/30 PASS** (15 assertions per seat, LeBlanc/Zed free swaps, Bard both-side stasis, Kalista owner Rend, Nocturne vision, Samira real swept intercept, Malz suppression, Ryze deferred warp, Pantheon Aegis, Jayce level-one transformation, snapshots).
- `tests/audit/v453_m44_b13_mixed_simultaneous_pvp.test.mjs`: **20/20 PASS** (10 different pairs mirrored blue/red, both player intents queued before joint resolution, actual authoritative receipts, roundtrip).

**B13 added:** 106/106 PASS. **Regressions B01–B12:** 760/760 PASS, rerun on the final engine blob `6418de0d837aaa841aea445822ef2ab517dab682`. **Final M44 B01–B13 combined:** **866/866 PASS**, 21 suites, zero observed directed failures, **0 certified complete kits**. All four B13 files are committed and rerunnable under Node at a later integration gate.

### Explicit NOT_RUN/NOT_CERTIFIED

- Repository-wide `npm test`, native `node --check`, web browser `engine.browser.js` sync/parity, Chromium E2E, two genuinely connected human PvP clients, full 17-axis P+QWER certification, 5v5 ranked/match pacing, live patch coefficient accuracy, complete fog/privacy/red-team matrices, all unusual forms/colliders and system-wide security checks.
- Directed V8 evaluation does **not** certify a full champion kit or LoL 1:1 behavior. Important remaining subtleties: Bard stasis interactions with epic monsters and towers, Ryze portal enemy player collision/teleport veto, Wukong/Zed/Neeko clone identity, Rengar and Kha'Zix evolutions, Aphelios ammunition, Hwei 10 spells, Viego possession, Kalista R ally-bound behavior, Fiddle/Wolf passives and Kalista elite stacking. A number of B13 abilities have intentionally bounded approximations of complex LoL mechanics; report them as *partial*.

## Significant B13 commits

- `65ac7517dd31b22e072f91b9e292cbc3f01650de` B13A declarations.
- `06e8b8fdcc7eab0bc6420814c6b1c0fc83913b80` owner records and recasts.
- `669874458c75a7e5bac08d07f3213a42ea8123f9` B13A named effects.
- `9039553f9810e51dc4ae68083d1bf47c476f5f97` B13A temporal zones.
- `f756f3729f223c0d828000b015601309fe844f24` B13A QA 28.
- `8c75e60026dbffb330d76b093a79190922f9db5b` B13B declarations.
- `6ba30f6f06445a9d39293719aacdd3953c4bae14` B13B named behavior.
- `78e9cb4a89a0d298ed6c2c325c096ef09a8562f5` B13B temporal channels.
- `cb3bf5dee14e01d61df42ede52060ac97842e327` B13B fog, movement, impact.
- `1466c15f2f325a1a0aeb55b75e2036761befb03c` B13B QA 28.
- `3743858cc023fdfe854dc32e47ddd352cdb39d14` Samira swept collision.
- `c85d67a34d07face6d1c6962220fb5ca875020bc` fix LeBlanc pre-move.
- `fe5ec1a5c7fa1cb26ef0e531794e541fb53acb3b` adversarial 28 initial.
- `109e9467e723dacb5fb78c07b9353590fc03effe` mixed 20.
- `a752cdbfb1c18f2d8f6d20e25bb812cc409d8a37` Jayce lvl1 gate.
- `fb5e11d7e6de970d00b6c3bdf5f44bad0bb9e166` adversarial extended to 30.
- This handoff commit.

## Next recommended priority M44 B14

**Aim:** expand substantial additional authored content in another roughly 25–40 champion/unique slot batch, preserving the correct 1-human-vs-1-human five-unit-board PvP mechanics, simultaneous orders, owner states, fog and snapshots. Especially close identity gaps and recasts of Hwei, Aphelios, Jayce human/hammer full QWER, Viego P possession, Akshan W Scoundrel resurrections and E swing, Sylas Hijack of M44-era ultimate metadata, Kalista ally binding/R, Nidalee/Elise/Shyvana transformations, Azir soldier Q/E/R collision, Zed multi-shadow projectiles, LeBlanc Mimic, Bard portal, Aurelion Sol growth. Favor actual coherent multi-champion work packages, without copying an entire MOBA or adding generic substitute abilities. Zero full-kit certification until each kit passes the complete P+QWER gate.

**Production isolation remains mandatory:** do not touch `main`, `dev69/integration`, `engine.browser.js`, `version.json`, item catalog, GitHub Actions, Codespaces, or workers; do not merge PR #9. No Actions minutes consumed by the ChatGPT tests.
