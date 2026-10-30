# M39 — B01 authoritative pickup, cancel recast and one Grit clock

Date: 2026-10-29. Branch: `dev69/skills-batch2`. Draft PR #9 targeting
`dev69/integration` (do not merge). M38 HEAD before changes:
`ebde3eea6eb98e4c21ce49991fe5a38f33264c40`.

## Exact engine work (not certification)
- **Syndra W, Force of Will:** added one champion-authored source selector
  `m39SyndraPickupV453Dev69`, shared by the **queue preflight** and the
  **authoritative execution pre-debit** check. It chooses owned, live, visible
  spheres ahead of enemy minions; minions must be alive, exposed, reachable and
  have a legal unobstructed destination. It picks minions by distance then
  stable ID. A target disappearing between simultaneous PvP planning and
  resolution is rejected with **no mana/cooldown debit** and **no unbacked
  spell damage**. The selected actual minion/orb is relocated, with M38
  identity receipts maintained. The broad damage/hit model still needs the
  complete 17-dimension acceptance gate.
- **Heimerdinger R, UPGRADE!!!:** R while its authored empowerment is
  armed is now a **free explicit cancellation recast**. The server verifies
  the unexpired upgrade at execution. This cannot grant a new upgrade,
  consume a second cooldown/mana charge, or bypass the original R cooldown.
  R+Q/R+W/R+E still produce their preexisting distinct upgraded patterns.
  This is gameplay cancellation, **not** completed animation/visual parity.
- **Sett passive Grit:** removed a second, contradictory `.7/s` decay
  implementation in the same passives advancement method. M38's
  `.8/s` timer with `nextDecayAt`, five-second grace, batching and
  same-time idempotency remains the only server-owned decay rule.
  **Sett W interruptible cast delay has not yet been implemented.**

## QA and evidence
- Added `tests/audit/v453_m39_b01_atomic_pickup_and_recasts.test.mjs`.
- 14 intended dual-seat scenarios: empty/hidden minion denial, real minion
  pickup, opponent deletes the minion after queue, owned sphere priority,
  Heimer R cancel and normal upgraded R+Q, Sett same-tick/6s decay;
  V40 snapshot checksum and resource/cooldown assertions.
- Specialized `.github/workflows/skills-entity-targetability-p1.yml`
  now gates M39 syntax plus the executable QA, alongside M20–M38.
- **Do not describe a workflow or test as PASS before the actual
  Actions run concludes successfully**. The integrated QA may still stop at
  `engine.browser.js` synchronization owned by the integrator.

## Open 20 legacy M38 markers
All 20 **remain open** in `BOARD_M20_B01_V453` and the M35 queue
until a separate, mechanically complete and evidenced retirement decision.
In particular:
- Syndra W `minion_throw` now has a preflight/commit proof but
  still needs full spell identity and visual confirmation.
- Heimer R `upgraded_ability_visuals_and_R_cancel` now has cancellation
  execution but **upgraded visual parity** remains outside Skills.
- Sett W `cast_time_and_grit_decay` retains interruptible cast-time debt.

Other inherited M38 debt: Corki R ammo UI; Karthus W/R persistent wall
and postdeath channel; Zac Q second-hit animation; Zilean R revive
animation; Yunara Q resource/spread; Lee Sin Q/W projectile/energy/vamp;
Mel Q multiple projectile details; Galio Q converging wind and W charge;
Locke R execute transformation; Milio R passive follow-up; Quinn W passive;
Viktor R moving storm interrupt; Master Yi W channel mitigation;
Heimer E outer slow.

## Cohort and release truth
B01: 35 champions, 140/140 QWER hooks, **0/35 complete kits certified**.
Across the roster: 173 champions / 692 QWER, **0 release-ready atomic
kits by the M34 proof gate**. Mechanic patches do not count as completed
champions. Maintain the macro-package as WIP until all 35 P+QWER identities,
ranks, resources, counterplay, 17 QA dimensions and integrator gates pass.

## Next production priority
M40 should tackle a shared **interruptible authored temporal-cast**
family, with Sett W, Galio W and Master Yi W first, while preserving the
original impact geometries and skill values. Then address persistent
zone/projectile counterplay (Karthus W, Galio Q, Viktor R), with proof
for both human seats, fog, obstacle and replay.

Do not edit `engine.browser.js`, `version.json`, Items or integration.
Do not merge PR #9.

## Final remote CI evidence (code HEAD `192fceaefd8c492880e4167499b48cfbf0ff1aa9`)

- [M39 specialist Skills PASS — run 40925538152](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40925538152): **14/14 M39** (dual-seat, 14 checksums, 8 negative cases), M20 **280/280**, M32 **280/280**, M38 **12/12**, M34 fail-closed **0 kits certified**, and 140/140 authored B01 slot hooks.
- [Logic PASS — run 40925548919](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40925548919).
- [Projectiles PASS — run 40925548689](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40925548689).
- [Integrated QA FAIL — run 40925548818](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40925548818): failed **Verify official Node to browser regeneration**. The `npm test full - milestone only` job was **skipped**. This is outside the Skills branch contract and must be repaired by the integrator after explicitly authorized merge.
- The historic M20 and M32 **test fixtures** were adjusted to supply a real owned Syndra orb on legal W casts. Old tests formerly demanded an ability without a pickup; gameplay preflight remained strict. Those are fixture changes, not fallback behavior.

Runtime classification snapshot: `M34_ATOMIC_RELEASE` observed 173 champions, 692 QWER, 369 training-fallback slots outside B01, 183 routed-unverified outside B01, 20 legacy B01 tags and zero certified kits. This is progress accounting, not proof that those outer roster slots were completed.

The complete set of 35 B01 kits remains an indivisible pending macropackage; continuing to M40 does **not** promote the PR out of Draft or authorize merge.
