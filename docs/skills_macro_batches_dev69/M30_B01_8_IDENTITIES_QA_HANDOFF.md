# M30/B01 — eight high-risk authored skill-identity contracts

**Date:** 2026-10-29  
**Repo:** https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena  
**Exclusive Skills branch:** `dev69/skills-batch2`  
**PR:** https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/pull/9, **Draft**, target `dev69/integration`, **do not merge**.  
**Verified implementation/CI SHA before handoff:** `6eb769da6a3891ca67011dd66287ffd1691f4765`.

## Ground rules and certification

This is a **board strategy PvP game**, NOT a realtime MOBA: two humans, one controlling all five BLUE champions and the other all five RED champions, issue simultaneous orders. The server executes real target checks, damage and CC; the web engine does not authoritatively decide who gets hit.

M30 produced **8 champion-specific authored deltas** (Lucian, Varus, Mel, Viktor, Lee Sin, Sett, Sejuani and Kassadin). M28 and M29 added **25 distinct B01 champion deltas**, so across M28–M30 **27 distinct B01 champions** have received new authored behaviors, with six reworked again in M30.

**No champion has been fully certified P+QWER, recasts, 17 dimensions. The certification count remains 0.** This is not 27 complete kits, nor a release sign-off. M27's 35-champion, 140-QWER manifest remains a blocker until real evidence meets the individual dimension gates. Existing named mechanics must not be replaced by generic fallback.

## Eight M30 authored identities

| Champion | New contract | Remaining parity blockers |
|---|---|---|
| Lucian | Q requires a **real initially targeted enemy** visible/in range/same Realm, not a free-aim line; no valid target => zero mana/cooldown/queue; executor rechecks to reject newly hidden/lost targets; anchored ray pierces other foes behind | Ordered target-selection UX/parser, advanced pierce geometry, full kit |
| Varus | W commits an eight-second Q empowerment; next *committed* Q consumes it and adds missing-health scaling physical damage alongside real Blight stacks and existing 0–2 charge range | Channel interruption and full W-Blight Q interactions |
| Mel | Q still uses initial authored zone; timed follow-up waves are now **three distinct collision-tested missiles per wave**, each serialized with `{volley, shot, targetId}`; walls/visibility/Realm gate the next hit; actual hit refreshes owned Overwhelm | Full projectile flight/target effects, R reflection and overwhelm interactions |
| Viktor | Real combat receipts (champion hit under per-victim 8-second gate, champion kill, minion kill) earn owner-limited Hex research. `queueBoardViktorEvolutionV453Dev69(team,id,slot)` allows human selection Q/W/E for 100 fragments only during planning, disallows duplicates/other slots, automatically evolves R after all three. Q shield strength, W gravity pull, E aftershock and R storm duration/damage have separate upgraded effects | Hook into client/voice tactic controls; exact fragment balancing, evolution decisions, broader item/rune/CC interaction |
| Lee Sin | Every committed skill arms two Flurry charges, granting accelerated real basic-attack interval; only real basic hits consume two charges, then revert | Energy accounting and complete recast identities |
| Sett | Two Q-empowered *actual basics* add bounded target max-HP physical damage, and next basics no longer get the extra damage after charges end | Grit, animation-independent W exact mechanics, remaining kit |
| Sejuani | A **nearby allied melee champion's actual basic** builds owner-keyed Frost stacks for Sejuani; cannot proc on ranged attacks or nonbasic packets; exactly four stacks + ownership mark enable Permafrost E, consumed on hit | Interrupts, other melee mechanics, full passive/item parity |
| Kassadin | Q damage that genuinely connects interrupts an enemy's active Karthus Requiem/Xerath artillery/cone channel, removing temporal action before future damage; spell-blocked/invalid casts cannot interrupt | Exact channel catalogue and CC immunity interactions |

The new hooks are authored names/data and reusable board-level state; no visual FX simulation or frame-by-frame LoL logic was introduced.

## Evidence

**Green on implementation HEAD `6eb769da`:**
- Specialist Skills: https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40899628968 — **SUCCESS**.
  - `M30_B01_IDENTITY_QA` **10/10**, Lucian/Varus/Mel/Viktor across blue/red (including fog, invalid orders, double-resolution, battle replays).
  - `M30_FAMILY_QA` **8/8**, Lee Sin/Sett/Sejuani/Kassadin across blue/red (including ranged ally exclusions and channel cancellation).
  - Prior M28: **14/14 + 14/14**, M29: **16/16 + 10/10**.
  - **Total newly authored focused behavior cases M28–M30: 72/72**; historical M20–M27 gates remain green and `certifiedChampions: 0`.
- Logic: https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40899640950 — **SUCCESS**.
- Projectile: https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40899640822 — **SUCCESS**.

**Integrated blocker:** https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40899640700 — **FAIL** at integrator-owned Node `engine.mjs` → browser `engine.browser.js` reproducibility/diff step; full npm test suite skipped. Skills may NOT edit `engine.browser.js`, `version.json`, `main`, `dev69/integration`, or Items branch.

## Files/commits of the M30 stage

- `engine.mjs`: concrete rules, deterministic serialized evolution resources, limited owner-based effects and replay.
- `tests/audit/v453_m30_b01_identity_counterplay.test.mjs`: 10 M30 scenarios.
- `tests/audit/v453_m30_b01_combat_family.test.mjs`: 8 M30 scenarios.
- `tests/audit/v453_m20_b01_pvp_matrix.test.mjs`: legacy cast test now supplies required real target for Lucian Q.
- `.github/workflows/skills-entity-targetability-p1.yml`: enforces both new M30 suites.

Key commits:
`dbdb1d306dee1c3f9aa3a9f0cf4acbeb6569abe2`,
`edfca93100544b57f357db4a464389ff23297fb5`,
`a63d33a3d1867d8b39e3d0ab4984ac9a9a705ec5`,
`87600a5c548e3ec3b42282743f0f3342698750f9`,
`a477c036391d9c1962fc8f317973dc3b9f74387b`,
`dc82455169c917f8455f8354aa5ca67b5ebed7b7`,
`d486957249f8f1e757b12789a27120fcbb802b1c`,
`166371ee95fbb638b67d8213e5ce14f841e627ee`,
`25e8aa7ded72d50742e261fb03454b4015bd17dc`,
`6eb769da6a3891ca67011dd66287ffd1691f4765` (fix Sejuani E owner-mark interoperability).

## M31 must prioritize full-kit closure, not micro-packages

1. Work in **large cohorts ~25–35 champions** but count only individual kits actually proven **P+QWER**, unique passive/recasts, and all 17 cross-system dimensions. Do not call an authored delta a complete champion.
2. Use `tools/skills_m27_b01_completeness_audit.mjs` and the generated manifest as a checklist, recording each champion's outstanding slots, targeted preconditions, markers, side effects, fog/Realm, collisions, summons, items/runes/spells, dual human PvP and snapshot/undo receipts. Coherent families and shared *infrastructure* for throughput; no generic skill behaviors.
3. Immediate high-risk debt: Lucian targeted Q UI/parser; Viktor evolution UI and undo receipts; Mel projectile primary zone still to be transformed into actual per-shot behavior; charge/counterplay timings on Varus/Xerath/Vi/Zac; Rell mount, Heimer turret upgrade, Cassiopeia facing orders, Karthus post-death channel, Shen blade initial placement and Sejuani melee follower logic.
4. Integrator owns a one-time Node→browser regeneration, QA rerun and merge sequencing. PR #9 must remain Draft until formally approved; no competing PR to this branch.

**State:** M30 delivered 8 authentic high-risk deltas, 18/18 new tests; 72/72 focused M28–M30 new QA accumulated; 27 different B01 champions touched across those stages; 0 fully certified P+QWER kits; no merge.
