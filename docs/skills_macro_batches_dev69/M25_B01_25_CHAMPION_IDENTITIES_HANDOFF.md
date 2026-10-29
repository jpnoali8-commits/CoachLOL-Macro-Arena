# M25/B01 — 25 individual champion identities on the authoritative turn board

**Status:** implementation and focused PvP QA PASS; **zero kits certified**.  
**Head validated:** `ef34c7c8e9fc886c937adc833065722f5d326e59` (2026-10-29).  
**Scope:** same branch `dev69/skills-batch2`, same Draft PR #9 → `dev69/integration`; NO MERGE.  
**Production principle:** a board game is **not an RTS/MOBA simulator**, but each champion's passive and Q/W/E/R must remain distinct. Shared code is permitted only for geometry, target rules, damage, CC, fog/Realm, timed states, receipts and snapshots; an arbitrary generic fallback never equals a playable champion kit.

## M25 — individually authored, gameplay-relevant behavior (25 champions)

| Champion | Mechanic implemented/tested at both PvP seats | Known limitations — still PARTIAL |
|---|---|---|
| Gragas | E Body Slam stops on the first enemy hit | All Q/W/R precise interactions not certified |
| Lee Sin | R knockback collision with actual blocking terrain applies stun | Wall thickness and full kick chain not certified |
| Master Yi | Q Alpha Strike hits nearby distinct enemies and grants short untargetable interval | Multi-hit timings/reset and meditation details pending |
| Shen | W Spirit Refuge protects nearby allies against basic hits, not spells | Spirit blade position/drag and E/R details pending |
| Vi | Three successful basic attacks trigger denting damage/mark | Armor shred effects/charged Q need full parity |
| Kassadin | R Riftwalk stacks duration, extra mana and bonus damage | Rift stacking vs official values and resource system need audit |
| Kog'Maw | Repeated R casts scale cost/damage | R delay and hunger/passive resource specifics pending |
| Corki | W Burning Trail applies persistent damage | Package variants / ammo and passive specifics pending |
| Karthus | Q Lay Waste delayed impact and isolated damage | E toggle/DoT and R full interruptions pending |
| Yunara | R state enables W transcendent root | Other transformed Q/E state and resource pending |
| Mel | W absorbs/reflects one enemy skill | Reflection metadata/proj ownership/potential chaining needs security QA |
| Sejuani | R initial stun plus nearby ice-storm damage/slow | Other Frost stack/secondary family details pending |
| Galio | R shields ally first, then delayed landing knockup/damage | Landing collision/interrupt details pending |
| Lucian | R Culling is four server-time scheduled projectile volleys | R projectile count and precise targeting simplified for board |
| Cassiopeia | W Miasma applies grounded and poison | Terrain grounding interactions / R directional stun pending |
| Seraphine | Third basic skill is Echo; Q extra impact, W heal, E root upgrade | Detailed note passive and multi-cast timing pending |
| Xerath | W center deals stronger damage | Q charging and R target recharge pending |
| Zac | W spawns finite Goo, pickup heals and reduces W cooldown | Q2 and blob-passive already exist but full passive kit pending |
| Alistar | E Trample gains stacks through timed pulses and stuns on five hits | AA-based stack parity pending |
| Lulu | Pix relocation with E enables secondary Q bolt from attached allied origin | Pix movement and allied attacks pending |
| Rell | W toggles mounted state with board speed | Distinct mounted/unmounted moves and ally link pending |
| Milio | W campfire pulses ally healing and AA range | Campfire following/attack passive pending |
| Quinn | E Vault dashes to target then bounces and adds Harrier mark | R flight and blind details pending |
| Varus | R root spreads through time to a nearby, visible second target | Blight interactions, full spreading chain pending |
| Viktor | W gravity pulses slow first, stun second | Q augment, two-point E and R movement pending |

**Important:** All 25 are *mechanics added and tested*, NOT 25 full certified P+QWER kits. M24 independently implemented six champion families (Jarvan IV, Syndra, Fizz, Tahm Kench, Sett, Heimerdinger) with 32 additional focused cases; overlap with M25 is avoided in the count.

## QA evidence at validated HEAD

- [Skills/identity specialist #40816024007](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40816024007) **PASS**.
  - M25 new **50/50** behavior tests, 25 named champions × blue/red; serialized snapshot checked per case.
  - M24 **32/32** independent mechanics tests.
  - M20 B01 **280/280** 35 champions × QWER × two teams; **70/70** M20 snapshot replays.
  - M19 coverage **173 passives, 692 QWER, 369 training fallbacks, 323 routed unverified, 0 certified champions**. Counts unchanged — M25 deepens existing routed slots rather than claiming 25 newly routed kits.
  - Earlier M15–M23 regression gates PASS.
- [Logic QA #40816031166](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40816031166): **PASS**.
- [Projectile QA #40816031135](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40816031135): **PASS**.
- [Integrated QA #40816031136](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40816031136): **FAIL** at generated `engine.browser.js` synchronization gate ONLY; this file is owned by the integrator and must not be modified by Skills.

## Files

- `engine.mjs`: champion-specific M25 descriptors and authoritative mechanics in existing engine; no new generic fallback.
- `tests/audit/v453_m25_b01_identity_matrix.test.mjs`: 50 focused cases, 25 distinct champions, both teams and snapshot checks.
- `tests/audit/v453_m23_b01_death_state.test.mjs`: Karthus post-death Q correctly waits for delayed impact; preserves one cast per turn.
- `.github/workflows/skills-entity-targetability-p1.yml`: M25 enforced after M24 in specialist CI.

## Safety and contract debt

All existing records remain **partial/unverified** until P+QWER, passives, transformations, recasts, marks, on-hits, channel interrupts, vision/Realm, collision, ward/item/rune interoperability, 2-human PvP, snapshot/replay and result flow have proper adversarial coverage. Testing a particular mechanic is not a replacement for complete champion certification. B01 fixed roster still has 35 champions; 25 were deepened in M25, and previous M20–M24 code is retained. No changes to B01–B05 roster composition.

Some board simplifications (four tactical volleys, timed approximations) intentionally avoid realtime animation but must still preserve target-selection constraints, champion identity and counterplay.

## Recommended next macro step

**M26/B01 — finish 35-person batch with complete per-champion missing-move ledger.** Begin with neglected unique interactions: **Zilean** Q2 attachment/extra stun, **Braum** W/E/R/Concussive counterplay, **Urgot** R timed execute/suppression/interruption and **Locke** unique nail/recast. Then address high-impact missing P/Q/W/E/R and passive interactions across the *other 31* champions with batch-sized QA, not a 2-champion PR. Export a machine-readable champion×slot×feature audit, make tests verify *observable state/effect* rather than only successful casts, and do not assign CERTIFIED until the whole kit passes.

Do not merge from the Skills chat or change `main`, `dev69/integration`, `engine.browser.js`, `version.json` or the Items branch. The integrator merges and regenerates browser once after reconciliation.
