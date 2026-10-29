# M28/B01 — Adversarial baseline gate + handoff for authored kit completion

**Date:** 2026-10-29.  
**Repo:** https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena  
**Branch:** `dev69/skills-batch2` (Skills engineer ONLY).  
**PR:** https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/pull/9 — **Draft** targeting `dev69/integration`, **NO MERGE**.  
**Validated code/workflow HEAD:** `d7be69ea1fea48faeb44d21495bb10ba6f333fee`.

## Strategic interpretation: turn-based board game, not MOBA

One human controls all five blue champions and a second human controls all five red champions; both simultaneously submit authoritative tactical orders by turn. Don't implement 60 FPS MOBA simulation. **Do implement each champion's distinct passive, Q, W, E and R**, plus its own recasts, marks, transformations, pets, traps, synergies, counterplay and tactical decision points. Reuse only shared engine infrastructure: collisions, line-of-sight/fog, Realm, damage, effects, timed phases, movement, state receipts, snapshots/replay, item/rune/spell interfaces. Generic training fallback is never an acceptable substitute for a champion's unique kit; a routed or tested slot is NOT a fully certified champion.

## Progress already committed in M24–M27

- M20 fixed B01 cohort: **35 champions × P + QWER**; original **280/280** queue/execute/effect casts on both PvP seats, **70/70** snapshot replays. Still partial, not certified.
- M24 authored six advanced board-phase champion families, **32/32** blue-red behavior proofs.
- M25 authored 25 individual identities, **50/50** behavior+snapshot tests.
- M26 authored 25 individual identities, **58/58** behavior+snapshot tests.
- M27 audited **all 35 B01 kits** against **17 certification dimensions**; authored **25 champion-specific passives/related mechanics** and passed **52/52** test cases; zero false certifications.
- Historical global M19 metrics: **173 champions/passives, 692 QWER slots, 369 generic training fallback, 323 routed-unverified, 0 fully certified**. Progress on B01's specific identities does NOT change these counters until a rigorous full-kit and cross-system audit passes.
- Detailed handoffs:
  - `docs/skills_macro_batches_dev69/M25_B01_25_CHAMPION_IDENTITIES_HANDOFF.md`
  - `docs/skills_macro_batches_dev69/M26_B01_25_IDENTITIES_AND_QA_HANDOFF.md`
  - `docs/skills_macro_batches_dev69/M27_B01_FULL_CERTIFICATION_AUDIT_HANDOFF.md`
- Executable audit manifest generator: `tools/skills_m27_b01_completeness_audit.mjs`, companion `tests/audit/v453_m27_b01_certification_gate.test.mjs`. JSON export is included in GitHub Actions artifacts, not assumed present on branch.

## What was newly completed in M28

**M28 initial gate, not M28 champion-completion milestone.** Created:

- `tests/audit/v453_m28_b01_adversarial_gate.test.mjs`
- Added syntax/run to `.github/workflows/skills-entity-targetability-p1.yml`.

The QA invokes the *actual authoritative* `Arena` and each of the fixed 35 B01 kits on both human teams, rejects invalid tactical actions without charging mana or cooldown, checks real collision blocking of movement, and checks snapshot equivalence. Its coverage is intentionally reported precisely and dynamically; no blind claim that every champion has every kind of action.

**Verified Actions results:**

- [Specialist M28 #40888567963](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40888567963) — **SUCCESS**, `M28_B01_ADVERSARIAL_QA`: **35 champs, 2 team seats, 0 failures**, 66 invalid-coordinate tests, 32 valid enemy-target visibility denials, 28 obstacle-blocked dashes, 70 ten-roster checks, 98 no-mana/no-cooldown/no-snapshot-mutation checks, 70 snapshots.
- [Logic QA #40888573426](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40888573426) — **SUCCESS**.
- [Projectile contracts #40888573461](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40888573461) — **SUCCESS**.
- [Integrated QA #40888573264](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40888573264) — **FAIL only at 'Verify official Node to browser regeneration'**. This is an integrator-owned Node→browser sync gate; Skills must not change `engine.browser.js`. All other tests above passed.

## Actual M28 next production priority — 25–40 authored full-kit improvements, not generic shortcuts

Start by **refreshing GitHub HEAD and reading current engine**, not assuming this document's SHA is latest; there may be other conversations committing concurrently. Then read M27 audit, B01 registry and M28 gate. Select a **large coherent group of ~25–40 champion-specific missing interactions** (ideally across 25 champions) prioritizing observable PvP impact and avoiding per-champion function bloat.

First high-value debt from the real B01 kit registry (never convert the names into anonymous training effects):

- Cassiopeia R: directional petrification rather than unconditional CC.
- Karthus W: persistent Wall of Pain with lane/collision/slow distinction and fog legality.
- Sejuani W: two distinct swings; E frost from real qualifying sources.
- Viktor Q/E/R: self-shield/evolution, two-point laser and moving Chaos Storm; no client-only or repeated unowned damage.
- Varus Q: charged arrow range/damage and W-Blight consumption with real receipts.
- Xerath Q: charged Arcanopulse range; R inner bulls-eye interaction already tested separately.
- Heimerdinger: Q turret charge stock and E outer stun/slow distinction; R+Q/W/E already implemented M24.
- Kog'Maw E: persistent Void Ooze trail while W/passive/R remain from M27.
- Galio Q: converging windblasts and W charge/taunt tradeoff.
- Mel Q/E: distinct projectile burst and ring slow/root; Mel W reflection already implemented and tested.
- Lucian Q/W: target requirement and Ardent Blaze star mark effects distinct from Lightslinger passive.
- Urgot E: real target flip/collision (R suppression and W Purge already exist).
- Locke W/R: distinct self-burst and R execute/transformation **only after verifying champion-specific source**, never invent behavior.
- Additional deficits from `m20Missing` tags, generated M27 JSON audit, and the **entire P+QWER per champion**, not just one cosmetic change.

For each mechanic, show **observable** result and rejection/counterplay on **both seats**, including fog/Realm restrictions, collision, real cast resource accounting, no second cost for recasts, targets/owner and serialized snapshot. Add new M28 champion-specific suite and wire it to CI. The newly created M28 adversarial suite should remain GREEN. Keep 25–40 champion-scale throughput by updating family/data-driven *unique* contracts; do not create an AI bot or re-architect as real-time MOBA. **Certification must remain 0** until each complete champion P/Q/W/E/R/passive plus all 17 dimensions is actually proven. No automatic switch to "CERTIFIED" based on one green ability.

## Restrictions / integration

Never push to `dev69/integration` or `main`; don't edit `engine.browser.js`, `version.json`, Items branch, unrelated binaries or M19 cohort mapping. Reuse **Draft PR #9** rather than opening overlapping Skills PRs. The integrator owns merge and Node→browser regeneration after reconciling changes. When releasing a macro batch update this document or create M28 authored handoff, post precise QA links to PR #9, and preserve honest status for each remaining slot.

**Next chat should proceed immediately with implementation, tests and GitHub commits. Do not spend the first turn asking for the repository, files, plan or repeats of constraints.**
