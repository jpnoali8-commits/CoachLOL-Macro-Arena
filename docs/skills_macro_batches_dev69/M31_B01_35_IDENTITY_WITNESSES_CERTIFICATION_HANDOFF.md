# CoachLOL Macro Arena — M31 B01: 35 individual champion identity witnesses and full-kit certification ledger

**Date:** 2026-10-29  
**Branch:** `dev69/skills-batch2` (exclusive Skills)  
**PR:** [#9](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/pull/9), Draft, base `dev69/integration`, **NOT MERGED**  
**Implementation QA HEAD:** `e9e01915b1272b51f432e858d978d749ff13d14f`

## Scope, purpose and honest certification

CoachLOL is a **strategic board PvP game with simultaneous tactical turns**, two human players and exactly five owned champion units each. This is *not* a real-time MOBA. Reusable geometry, damage, owner-based entities, effects, deterministic scheduler and snapshots are correct **infrastructure**, but shared ability placeholders must **never** be used to claim a particular champion is finished.

**M31 coverage is 35/35 champion-specific native identities, not full-kit certification**. Every named identity has a **distinct actual server-side effect**, validated in BLUE and RED teams with deterministic checkpoint parity. Across these 35 there are **140 partially executable QWER descriptors**, not **140 certified final skills**. M27's **17-dimensional P+QWER certification remains 0/35**. No passive or kit has been relabeled complete by the new ledger.

## Published files

- `tools/skills_m31_b01_contract_ledger.mjs`: the **35 individually authored identities and per-champion named witness contracts**, mapping every champion to its real slot, signature and behavioral intent, automatic descriptors for all 140 QWER and all 17 M27 dimension debts. Exports `M31_B01_CHAMPION_WITNESSES`, `buildM31B01ContractLedger`; `--out` writes the JSON manifest.
- `tests/audit/v453_m31_b01_35_identity_witnesses.test.mjs`: **35 distinct champion witnesses × two human seats = 70 real champion-authored effects**, checks ten-unit roster, actual queue + authoritative commit, no duplicate second resolution, invalid action no state mutation, owner states, **70 V40 snapshots with identical checksums**. Exactly **0 full certifications**.
- `engine.mjs`: **Rell W authentic starting mounted state**. First W is `crash_down` (dismount) and next W is `mount_up` (remount), with separate action states and speed handling, carried in snapshots. Rell's full Crash Down/Mount Up effects and full champion kit are **not yet fully certified**.
- `tests/audit/v453_m25_b01_identity_matrix.test.mjs`: legacy Rell assumptions corrected from inverted initial mount/dismount to correct starting mounted, crash then remount.
- `.github/workflows/skills-entity-targetability-p1.yml`: requires M31 witness QA plus ledger generator, uploads manifest with existing macro-batch artifact.

## Certified QA evidence

At `e9e01915`:
- [Skills specialist QA SUCCESS #40901263159](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40901263159).
  - `M31_B01_35_AUTHORED_WITNESSES`: **35 champions, 2 human seats, 70/70 passed, 70 snapshots, 0 certified**.
  - `M31_B01_IDENTITY_LEDGER`: **35 champions, 140 QWER, 17 dimensions, 0 certified**.
  - `M27_B01_FULL_CERTIFICATION_GATE`: **35 champions, 35 passives, 140 QWER, 17 dimensions, 0 certified**, zero generic fallback falsely certified.
  - M20 legacy **280/280 casts, 70/70 snapshots** and all M21–M30 specialist cases remain green.
- [Logic SUCCESS #40901273818](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40901273818).
- [Projectile SUCCESS #40901273891](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40901273891).
- [Integrated QA BLOCKED #40901274122](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40901274122): integrator-owned `engine.browser.js` Node→browser regeneration reproducibility step fails on diff; full npm integration run skipped. Skills did not and must not modify `engine.browser.js`.

## Macro family inventory (all distinct champion identities)

| Champion set | Named individual witnesses (NOT full kits) |
|---|---|
| Corki, Cassiopeia, Karthus, Seraphine, Xerath, Zac, Zilean | missile magazine; directional petrification; toggle; CC ladder; artillery channel; goo blobs; cooldown rewind |
| Yunara, Alistar, Gragas, LeeSin, Lulu, Mel, Rell | transcendent stance; Unbreakable; barrel fuse; Flurry; Pix; follow-up projectiles; Crash Down/Mount Up |
| Sejuani, Sett, TahmKench, Galio, Locke, Lucian, Milio | two Frost swings; Q next two on-hit; grey health; ally arrival; owned marks; real Q initial target; two shield charges |
| Quinn, Syndra, Urgot, Varus, Viktor, Fizz, JarvanIV | Harrier reveal; sphere generation; W purge; W→Q enhancement; chosen Hex evolution; leap untargetable phase; flag |
| MasterYi, Shen, Vi, Braum, Heimerdinger, Kassadin, KogMaw | Meditation; allied teleport; charged Q; directional shield; 3 turret charges; Null Sphere interrupt; persistent ooze |

Each of the above **has a separate witness assertion on both blue and red**. This is an evidence matrix, not a completion table. The ledger also retains legacy `m20Missing` tags and explicit pending requirements; no reported count conflates tests with finished champions.

## M32 priority: convert evidence into completed indivisible P+QWER kits

Stop accumulating superficial progress by counting one behavior per champion. Next engineering stage must use the **35-row M31 ledger** to drive **cohort-wide closure of all passives and Q/W/E/R**, including exact owner-only buffs, optional recasts, forms, timing/interruption, fog, collision, entity identity, items/runes/summoner spells, both PvP seats, undo and snapshots. No generic replacements, no fake certification. Group related capability work into **large 25–35 champion macrolots** while tracking actual *per-champion completion*. Particularly urgent:
1. High-risk spatial/temporal: Cassiopeia facing orders, charge/release phase and interrupted casts (Varus/Xerath/Vi/Zac), projectile flight and owner-target propagation, fog and Realm.
2. Forms/pets/recasts: Rell crash vs remount complete behavior; Jarvan, Syndra, Heimer, Lulu Pix, Fizz, Urgot, LeeSin, Zac, Shaco/Neeko/Sylas crossovers. Avoid editing parallel Items files.
3. Passive/active resource identity: Viktor human evolution UI and undo, Milio E stock/tempo, Tahm/Rell/Zilean unique passives, champion-specific item/rune/spell gates.
4. Integrator handles one-time official Node→browser sync and all final mixed Skills+Items merged QA. **Do not merge the Draft PR without integrator approval**.

**State at M31:** 35/35 distinct B01 identity witnesses × both teams passing, 70/70 snapshots, 140/140 executable QWER historically, **0/35 full P+QWER kits certified**, Draft PR remains open. Nothing merged.
