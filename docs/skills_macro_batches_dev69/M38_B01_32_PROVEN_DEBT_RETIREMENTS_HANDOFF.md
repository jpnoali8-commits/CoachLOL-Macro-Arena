# M38 — B01 debt-train closure + actual Syndra/Sett mechanics (32 historical blockers retired)

Date: 2026-10-29. Skills branch: `dev69/skills-batch2`; Draft PR #9 into `dev69/integration`. **Do not merge or regenerate `engine.browser.js` from this branch.**

## What was learned from the authoritative engine

The M37 queue listed 52 **`m20Missing` legacy strings**, but it does not mean 52 unimplemented mechanics. M21–M37 already supplied distinct code and specialist regression tests for many of them. M38 audits the old strings per exact **champion + Q/W/E/R + named mechanic + CI test path**, records evidence in `M38_B01_RETIREMENT_EVIDENCE.json`, and retires **32 stale legacy labels** only where a named engine hook and specialist regression check exist.

Examples: Xerath/Varus/Vi/Zac server-owned charges; Cassiopeia R facing stun; Seraphine W third-cast echo; Sejuani W two swings and E accumulated by actual nearby allied melee basics; Sett Q percent-max-HP follow-up; Tahm R three real basic-attack marks; Lucian Q required initial enemy; Milio E two-charge movement/shield; Urgot R interruptible suppression; Heimer Q independent turrets/charge inventory; Viktor Q real shield/evolution; Shen Q spirit-blade pull; Kog Maw E Ooze trail; Locke W paid HP and delayed real healing, Master Yi R bonus attack speed and actual takedown cooldown refund. The original stage QA and any new M38 QA run in CI before retirement can be accepted.

### Two additional authored gameplay fixes

1. **Syndra W — Force of Will:** Her real, living, visible enemy minions can now be grabbed and thrown to the actual chosen target tile if there is no owned orb in grab range. Orb has priority; selection sorts by distance/ID deterministically; no hidden, dead, out-of-reach or behind-wall minion can be stolen; the real minion coordinates change and impact damage remains authored. Entity identity, movement and snapshot survive. **Not fully certified:** the legacy generic W still may allow an unbacked damage cast if no orb/minion is present — leave `minion_throw` debt open until the authoritative queue requires a valid pickup across all existing tests.
2. **Sett W — Haymaker/Grit:** Real received, post-mitigation damage already created Grit with a five-second decay onset; previously `nextDecayAt` was not consumed. M38 decays stored Grit by a deterministic .8 multiplier per simulated second after five seconds without damage, supporting batched/multi-second turns and single-tick idempotency. W still spends real Grit into shield/damage. **Not fully certified:** the actual W attack's interruptible cast-time remains outstanding — `cast_time_and_grit_decay` stays open.

### Verifiable ledger

- `docs/skills_macro_batches_dev69/M38_B01_RETIREMENT_EVIDENCE.json`: 32 explicit retired markers with champion, slot, original string, unique native behavior flag and exact specialized test path. It proves legacy debt was administratively reconciled with runtime evidence, **not 32 fully complete abilities**, and absolutely not 32 full kits.
- `tests/audit/v453_m38_b01_legacy_debt_runtime.test.mjs`: asserts all 32 retired entries have remaining real native rules and linked tests, every `m20Status` remains `partial_executable`, queue inventory still exactly 35 champions / 140 distinct QWER, 20 legacy debt tags left and **0 certified kits**. Real PvP dual-owner runtime scenarios cover Syndra owned orb vs throw of a REAL enemy minion; Sett Grit decay before/after 5 seconds and unique Q %-maxHP follow-up; Sejuani ally melee Frost stacks and ranged-attack rejection. Snapshot/negative gates apply.

### Remaining 20 legacy blockers

`ammo_ui` Corki R; `persistent_wall` Karthus W; `death_defied_passive_and_postdeath_channel` Karthus R; `Q2_basic_grab_animation` Zac Q; `death_phase_revival_animation` Zilean R; `attack_resource_and_spread` Yunara Q; `sonic_wave_projectile_travel` Lee Sin Q; `energy_cost_and_vamp_values` Lee Sin W; `multi_projectiles` Mel Q; `cast_time_and_grit_decay` Sett W; `converging_windblasts` Galio Q; `charge` Galio W; `execute_transformation` Locke R; `empowered_passive_followup` Milio R; `passive_heightened_senses` Quinn W; `minion_throw` Syndra W; `moving_storm_interrupt` Viktor R; `damage_reduction_channel` Master Yi W; `outer_slow` Heimerdinger E; `upgraded_ability_visuals_and_R_cancel` Heimerdinger R.

**Release gate remains FAIL-CLOSED:** 35 B01 champions and all 140 QWER have at least one authored mechanic, but complete distinct P/QWER + recasts/forms/terrain/fog/realm/items/runes/spells/undo/17 M27 dimensions must all pass. `0/35` B01 fully certified, `0/173` full roster. Integration is reserved for `dev69/integration`; full npm test is not signed off by Skills if browser sync fails.

### Next B01 priority

M39 must implement **real incomplete features** from the 20 remaining, using shared geometry/temporal/response primitives in large cohorts, without deleting labels for missing client visual/UI behavior or claiming 35 completed kits prematurely. Specifically prioritize correct server-gated pickup for Syndra W, Sett W actual delayed/interruptible casting, Galio Q convergence, Heimer R recast cancel and projectile/vision interactions. Avoid champion-by-champion generic fallback patches.
