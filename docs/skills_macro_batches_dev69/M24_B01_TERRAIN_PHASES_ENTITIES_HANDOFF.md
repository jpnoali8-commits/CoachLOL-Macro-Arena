# M24/B01 — Terrain, Phases, Devour, Opposing Pull and Heimer Empower | Handoff

**Branch:** `dev69/skills-batch2`  
**Existing PR:** #9 (Draft) → `dev69/integration`; **do not merge here**.  
**Verified implementation HEAD before this handoff:** `75ef2a562c2e2b748fe0ca1c2ce3a5682861afce`.  
**Date:** 2026-10-29.  
**Status:** M24 shared PvP mechanics implemented and specialist QA **green**; kits **NOT CERTIFIED**.  
**Authoritative basis:** M23/M22/M21 handoffs, M19 fixed batches; no batch reassignment and no bot/RTS expansion.

## Implementation shipped in engine.mjs

The QWER definitions remain data driven and execution still uses `queueBoardSkillV453Dev69`, `executeBoardSkillV453Dev69`, `performActionV40`, `damage()`, `advanceBoardPassivesV453Dev69`, `advanceBoardTemporalV453Dev69`, the existing effect resolver and the V40 snapshots.

1. **Jarvan IV:** persistent E flag with unique owner and expiry; Q scans the flag, checks reachability and collision, dashes on valid E+Q and applies actual path-based hits/knockup. R creates an authoritative temporary circular wall affecting `walkable`, A* `findPath`, existing obstacle checks and movement. R2 voluntarily dismisses the same ring without another cost.
2. **Syndra:** Q spheres persist in champion snapshot state; W repositions a valid sphere; E fans out spheres through collision-checked trajectories and applies champion stun on geometric hit; R uses existing sphere count/damage consumption behavior.
3. **Fizz:** E starts a temporary untargetable/immune phase, a zero-cost E2 may choose a landing point and apply AoE damage/slow, and expiration triggers an automatic landing. R creates delayed shark impact with knockup from the shared temporal scheduler.
4. **Tahm Kench:** Q records timed Taste stacks; enemy R requires three stacks while ally R does not. R stores exactly one swallowed champion, blocks targetability/skills/orders/damage, follows the swallower and releases after time, death or realm mismatch. No extra champion or public target ID is created.
5. **Sett:** E uses an opposing-side, collision-checked multi-target pull and stun if both sides contain targets. R carries its primary target, displaces through validated terrain and applies area splash to nearby champions.
6. **Heimerdinger:** R+Q empowered turret emits an extra beam on its third basic shot, R+W uses three timed rocket waves, and R+E triggers a five-point grenade cluster with one hit per target. The existing empowered-next-cast receipt remains responsible for single mana/cooldown charge.

All new mechanics are server-owned, use simulated `gameTime` and serializable state, and must not infer a second simultaneous human player per champion. The game remains 1 human vs 1 human, 5 champions controlled per human.

## Changed files

- `engine.mjs` — shared geometry, targetability states, recasts, delayed effects, and six champion families.
- `tests/audit/v453_m24_b01_board_phases.test.mjs` — **32 scenarios**, both PvP teams, state transitions, snapshots, temporal execution, and regressions.
- `tests/audit/v453_m20_b01_pvp_matrix.test.mjs` — preserves the 280-cast matrix but validates the **actual Fizz E phase** and primes Tahm's legitimate three-stack enemy R prerequisite.
- `.github/workflows/skills-entity-targetability-p1.yml` — invokes M24 QA after the earlier B01 suites.

## Verified GitHub Actions at implementation HEAD

- [Skills specialist #40814114206](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40814114206) **PASS**:
  - **M24 32/32** scenarios across Jarvan IV, Syndra, Fizz, Tahm Kench, Sett and Heimerdinger.
  - **M20 280/280** queued/executed effects, **70/70** matrix snapshot replays, 35 unchanged B01 champions.
  - M21, M22, M23 and M19 specialist suites **PASS**.
  - M19 audit: **173** champions, **173** passives, **692** QWER slots, **369** fallback `training`, **323** routed/unverified, **0** certified champions.
- [Logic QA #40814119334](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40814119334) **PASS**.
- [Projectile Skills QA #40814119341](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40814119341) **PASS**.
- [Integrated QA #40814119367](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40814119367) **FAIL** solely at official Node→browser regeneration/verification gate. The Skills branch is prohibited from modifying `engine.browser.js`; that synchronization belongs to the integrator after reconciliation.

## Explicit deficits / not official parity

- **Jarvan:** flag buff/armor reduction and detailed ultimate terrain/terrain elemental interactions are not fully certified; R collision ring is board-level approximation.
- **Syndra:** W only manipulates a sphere, not grabbed minions; ultimate per-projectile logic/passive upgrade parity are unfinished.
- **Fizz:** E frame/cast timing is approximate, R impact uses a scheduled location rather than full target-following shark mark.
- **Tahm:** Q-based Taste stacks are implemented, but AA-linked accumulation, directional/manual spit and grey-health details remain; ally-specific buffs need parity validation.
- **Sett:** opposite-side pull and slam are board tactics; official R landing geometry/damage and passive detailed scaling remain unfinished.
- **Heimer:** empowered Q beam/W rocket waves/E cluster operate, but turret charge stock, targeting priorities and official evolved skill parity remain unfinished.
- **Zac:** Goo chunks and enhanced blob interactions remain pending beyond existing M23 division/Q2.
- **Urgot:** full R suppression/interrupt channel (beyond M23 execute/fear) is pending.
- **Karthus:** Q delay/isolation and E persistent toggle (beyond M23 postdeath state) are pending.
- **Other B01:** Viktor, Mel, Rell, Galio and remaining champion-specific interactions still require dedicated adapter/QA where generic primitives are insufficient.
- Fog/Realm/untargetability, CC, objective/item interactions and full-session replay require further targeted adversarial QA before **any** `CERTIFIED` status.
- No B01 champion is fully P+QWER/recast/item/runic interaction certified; **do not mark any as complete**.

## Integration and next work

Do not merge this PR from the Skills task. Integrator should reconcile engine with Items and other PRs, regenerate `engine.browser.js` only on integration, then run full browser + Skills + Logic + PvP/snapshot gates. Preserve `main`, `dev69/integration`, `version.json`, `engine.browser.js`, Items branch and the B01–B05 fixed membership.

**Recommended next milestone M25/B01:** add the shared timed suppression/interruption and projectile-target mark contract for Urgot R, the persistent drop/pickup primitive for Zac Goo, delayed isolated casts/DoT toggle for Karthus, then extend shared pieces to Viktor/Mel/Rell/Galio. Work in large groups rather than one or two champions, with legitimate blue/red/PvP snapshots and no premature certification.
