# M41 B01 — Spatial identities: authored Galio Q, Viktor R and Karthus W

Date: 2026-10-29. **Skills branch**: `dev69/skills-batch2`.
PR #9 **Draft** → `dev69/integration`, **no merge**.
Parent M40 verified HEAD: `4592e8fdae96f5a62841eb994d7d365bc8f6450c`.
M41 tested **code HEAD**: `58995c2bb03bd880be8fd6a2a1f6c1e38b4223e9`.
No changes to `engine.browser.js`, `version.json`, main, Items, Logic or integrator branches.

## Mechanics implemented in `engine.mjs`

M41 extends the existing deterministic `boardTemporalV453Dev69`
and `boardCombatEnemyPoolV453Dev69`, not a real-time LoL skill engine,
and does **not** create generic catch-all skills.

1. **Galio Q — Winds of War.**
   - One paid, owner-authorized Q creates `m28_galio_converge`, with
     `m41Phase='flight'`, two distinct `m41Wings` (left/right,
     distinct angled start positions and per-wing hit receipts), and
     delayed `vortex` phase.
   - Cast no longer deals anonymous instantaneous circle damage or an
     immediate generic dot. Wings arrive after one simulation second,
     using authored line geometry, walls, realm, and the damage pipeline.
   - A surviving convergence leaves a two-tick periodic vortex, with
     own expiry and replay-safe state. Fully blocked wings do not create
     damage or the vortex. Can hit different targets on different paths.
   - Exact latest LoL collision/projectile timing and damage scaling remain
     unverified; no complete kit certification asserted.

2. **Viktor R — Chaos Storm.**
   - The on-cast initial pulse is now actually applied (the older
     temporal branch returned before the shared hit loop), producing
     explicit `m41InitialReceipts`. Valid champion damage cancels
     eligible enemy channels, including M40 Sett/Galio/Yi authored
     channels, Karthus Requiem, cone channels and artillery channels;
     spell shields retain their protection through the damage pipeline.
   - The storm remains the real owned timed `m28_viktor_storm` entity.
     Its one-step movement has **180 map units per simulated tick**,
     bounded by terrain and realm. Autonomous tracking requires
     visible enemy champions within 900 map units; no unseen-target
     teleport or tracking.
   - Human player may queue R again while the storm is alive to command
     a reachable point within 950 units of the storm. The recast
     validates owner, live entity ID, point, collision and permission at
     **both queue and authoritative commit**; no second mana/cooldown.
     Old/expired or spoofed commands fail closed. The storm then
     advances towards its commanded destination at a bounded tick speed.
   - The evolved R lifespan and storm scaling remain wired to Viktor's
     authored evolution state. Exact modern move speeds, target priority,
     cast timing and visual cues still require full parity work.

3. **Karthus W — Wall of Pain.**
   - A wall is created **at the clicked point**, perpendicular to the
     caster-to-point direction, not a long damaging line from the
     caster. `m41KarthusWallContactV453Dev69` computes local
     perpendicular distance and length and checks realm.
   - Wall is a **magical contact field**, never a new solid map
     collider. It slows entering opposing champions and applies
     a short-lived **15% magic resistance reduction** to valid contacts.
     The MR reduction feeds the central damage-resistance pipeline
     for *incoming magic damage* only.
   - Contacts are checked at creation and periodically for the
     wall's remaining 4-second lifetime, including entrants moving
     onto it later. Allies and targets merely in the caster-to-wall
     ray do not receive wall effects. Effects expire; no permanent
     resist modification.
   - No anonymous instantaneous line slowing. Exact LoL W width per
     rank, MR formulas and brief CC/immunity corner cases still need
     patch-parity verification.

## QA: accepted only at code HEAD

- [Skills specialist `40928871174`](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40928871174) — **PASS**.
  - New `tests/audit/v453_m41_b01_spatial_authored_mechanics.test.mjs`:
    **20/20 scenarios**, both seats, 20 V40 snapshot checks, 8 negative
    checks, 2 authoritative storm commands, zero failures.
  - M20: 280/280 verified QWER casts; M32: 280/280 authoritative
    interrupt/commit cases; M40 and M39 remain part of the workflow.
  - M28 old Karthus test fixed to move a future entrant onto the
    actual transverse magic wall, not the obsolete ray.
- [Logic `40928884104`](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40928884104) — **PASS**.
- [Projectiles `40928884135`](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40928884135) — **PASS**.
- [Integrated `40928884298`](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40928884298) — **FAIL exclusively at official Node → `engine.browser.js` regeneration**; full `npm test` job skipped. Ownership is with the integrator; do not change browser code from Skills.

## Certification and production constraints

B01 still contains **35 champions and 140/140 authored QWER hooks**, but
**0/35 whole kits certified**. The M35/M34 historical debt counters
remain **20 legacy tags unresolved**, because implementing one real
interaction is not proof of the champion's full passive + QWER,
item interaction, timing, fog, summons, counterplay and undo fidelity.

The full roster has 173 champions / 692 QWER; M34's last fail-closed
gate still reports 0 certified kits. Do not treat these spatial
improvements as a completed 3-champion release. Never silently retire
any stale marker without end-to-end proof. Preserve the existing
engine, PvP symmetry, vision, CC, atomic authority and snapshots.

## Next M42 priorities (families rather than two-champion releases)

Use the M35 work queue to group remaining B01 gameplay debts into
mechanical families and perform *large-cohort audits* across as many
of the 35 champions as practical, preserving each unique slot's
parameters and counterplay. Candidate high-impact families:
persistent moving areas and delayed/projectile collision; channel
breaks and charge/response; target visibility/realm; summoned object
recasts and resource/stack consumption. New tests should cover both
human seats, negative races and restore/replay with no false kit
certification, and only then retire a verified legacy debt marker.

**PR #9 must remain Draft and unmerged.**
