# CoachLOL — M26/B01 handoff | 25 individual champion mechanics, no generic fallback

**Branch:** `dev69/skills-batch2`. **Existing PR:** [#9](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/pull/9), Draft → `dev69/integration`, **NOT MERGED**.  
**Verified engine+QA HEAD:** `cfd5afe0b74bc87f1d67cef873fe7b993ac122df`.  
**Date:** 2026-10-29.  
**Outcome:** **25 champion identities deepened / 58 blue-red PvP behavior cases passed**; NOT 25 complete champion kits and NOT 25 newly routed slots. No champion is certified.

## Invariants preserved

CoachLOL is a **two-player simultaneous-turn strategy board game**, one human controls the five blue champions and another the five red champions. No 10-human PvP or real-time frame simulator. Each champion has its **own passive and QWER** with distinct forms, marks, counters, recasts and effects; code reuse is only for collision, damage, CC, visibility, Realm, persistent entities, turn clock, receipts and snapshots. Do not substitute generic fallback or infer official LoL parity from routing status.

The M26 code lives in `engine.mjs`, uses existing `queueBoardSkillV453Dev69`, `executeBoardSkillV453Dev69`, `performActionV40`, `damage()`, `advanceBoardPassivesV453Dev69`, `advanceBoardTemporalV453Dev69`, `effectResolverV41`, serializable champion fields and authoritative V40 snapshots. Zero new champion roster units; no client-only damage and no duplicate cost on recast.

## Twenty-five champion-specific behaviors (all verified in blue/red PvP seats)

| Champion | New M26 board identity interaction |
|---|---|
| Jarvan IV | Q applies temporary armor shred, both normal hit and E+Q flag collision |
| Vi | E shockwave also damages distinct enemy units **behind** selected victim within a measured line |
| Varus | E leaves a real, time-limited Grievous Wounds antiheal zone, including later entrants |
| Gragas | W sets a time-bound incoming-damage reduction rather than generic shielding only |
| Shen | R protects ally first, then arrives after a two-second, interruptible tactical channel |
| Corki | E Gatling Gun fires three pulses and accumulates temporary armor reduction |
| Xerath | R recast bullseye center deals stronger damage than the outside artillery ring |
| Yunara | E under R transcendent state dashes toward a legal nearby enemy |
| Alistar | R temporarily reduces incoming damage in addition to existing CC immunity |
| Lee Sin | E Tempest records per-team reveal of its hit target; respects existing Realm ownership |
| Lulu | R temporarily increases allied max HP and knocks up nearby enemies; expires cleanly |
| Quinn | R flight changes next valid basic into Skystrike splash once |
| Viktor | E Death Ray creates one delayed second impact with no double detonation |
| Kog'Maw | Q reduces both physical and magic defenses through a timed target-state modifier |
| Zac | R has three extra authoritative bounce pulses and each affected champion is knocked up only once by those pulses |
| Zilean | Q can attach to an allied champion; delayed detonation follows the moving allied anchor |
| Braum | W ally/self resistances; E faces an actual front enemy and blocks the first frontal attack, not rear damage; R leaves a timed slowing fissure |
| Locke | Q accumulates bounded soul-nail stacks; E consumes valid nearby nails to deal follow-up damage and slow |
| Rell | Q removes applicable target shields; R maintains a time-limited magnetic pull after the initial impact |
| Karthus | E becomes mana-draining Defile aura, with free off-toggle and discrete damage pulses |
| Urgot | R recast starts suppressible one-second execute chain, permits CC interruption, then executes below threshold and fears nearby enemies |
| Tahm Kench | Ordinary basic attacks add Taste stacks; existing ally/enemy R respects the threshold |
| Fizz | W applies a timed DoT from a real subsequent basic attack |
| Syndra | R fires distinct additional damage packets for owned spheres, recording correct count and consuming orbs |
| Seraphine | R Encore gains extra reach only when its line crosses an allied champion |

**Cautions:** These interactions implement board-relevant identity and counterplay, not every frame-dependent LoL detail or all the other Q/W/E/R/passive variants. Some pulse counts and time durations are deliberate board adapters and still require patch-by-patch parity review. No champion is `CERTIFIED`.

## Evidence on verified implementation HEAD

- [Specialist Skills QA #40818015278](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40818015278) **PASS**:
  - M26: **58/58**, **25 champion families**, both blue and red human seats, case-level snapshot checksum, zero failures.
  - M25: **50/50** unique-mechanic cases in 25 prior champion families.
  - M24: **32/32** focused board-phase tests.
  - M20 B01: **280/280 QWER** executions, 35 fixed champions, two seats; **70/70 snapshot replays**.
  - M21/M22/M23 and earlier Skills specialist gates PASS.
- [Logic QA #40818020812](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40818020812) **PASS**.
- [Projectile Skills QA #40818020804](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40818020804) **PASS**.
- [Integrated QA #40818020845](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40818020845) **FAIL at official Node→browser regeneration gate**. The Skills branch intentionally does NOT edit `engine.browser.js`; the integrator must reconcile and regenerate the browser artifact.

**Coverage bookkeeping remains as in M19 audit:** 173 champions and passives, 692 QWER slots, **369 generic training fallback**, **323 routed/unverified**, **zero certified**. New identities deepen existing routed B01 kits, not duplicate champions or increase certified count.

## Files modified within this milestone

- `engine.mjs` — M26 champion-authored adapters and discrete temporal effects.
- `tests/audit/v453_m26_b01_identity_matrix.test.mjs` — 58 cases, 25 distinct champions × two-team PvP, adversarial assertions, snapshots; prints failure detail before failing.
- `tests/audit/v453_m23_b01_execute_grit_upgrade.test.mjs` — Urgot R old immediate tests updated to assert suppressible delayed finish without two charges.
- `tests/audit/v453_m20_b01_pvp_matrix.test.mjs` — Karthus E effect proof now checks active aura state.
- `tests/audit/v453_m20_b01_special_primitives.test.mjs` — Shen R test checks first shield, then the delayed teleport.
- `.github/workflows/skills-entity-targetability-p1.yml` — M26 is an enforced CI gate.

## Remaining debt and recommended M27

M20 B01 preserves the 35 fixed roster champions. Although 25 were deepened in M26 and 25 in M25, this **does not imply that 35 kits are finished**. Major known debts remain on Braum block direction and projectile taxonomy, true Urgot suppression targeting/interrupt edge cases, Karthus postmortem toggles, Zilean double-bomb allied stack, Locke soul-nail patch parity, Heimer turret charges, orb interactions, other forms, per-champion items, spell-shields, runes and fog/Realm adversarial interactions.

**M27 should be the B01 completeness/certification audit across all 35 champions simultaneously**, not another sequence of two-champion releases: produce champion×(P,Q,W,E,R,recast,form,entity,terrain,fog,Realm,items,runes) structured manifest, explicitly identify missing behaviors, implement the largest related gaps using the existing shared executor, then require case-level PvP+snapshot proofs for every certified kit. Only after a whole kit passes all interaction gates may its status become `CERTIFIED`. Once B01 is at acceptable parity, accelerate B02–B05 at 25–40 authored champions per macro-package, with no generic fallback declaration.

**Integrator ownership:** no merge or edits to `main`, `dev69/integration`, `engine.browser.js`, `version.json` or Items branch. Integrator must reconcile Skills/Items changes, regenerate `engine.browser.js` officially, and run final integration/browsers/Full QA.
