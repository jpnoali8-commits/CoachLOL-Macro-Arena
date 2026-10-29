# M40 — B01 three authored channel lifecycles, deterministic 2-seat PvP

Date: 2026-10-29. Branch: `dev69/skills-batch2`, PR #9 Draft → `dev69/integration`.
M39 handoff HEAD: `bcfe3d5e717d912f63753476659ed84d10aec2b8`.
Tested M40 code HEAD: `f40c37bdb23e8c1f9e49716c3b94581d8a83ef03`.
**NO MERGE.** No changes to `engine.browser.js`, `version.json`, Items or integrator branches.

## Functional implementation (not three complete kits)

The shared `m40AuthoredChannelV453` state and `m40InterruptChannelV453Dev69`
operate on authoritative `gameTime`, champion-owned origin, effect/CC permission,
event ordering and V40 snapshots. This is a *shared temporal lifecycle*, never a
generic one-size-fits-all ability description.

- **Sett W / Haymaker:** the successful action receipt consumes stored Grit
  and grants its shield immediately. The damage *does not happen at commit*.
  A server-owned `m40_sett_haymaker` temporal object resolves after a
  **0.75-second cast time** against the authored forward cone. The center
  uses true damage and the edges physical damage; both go through normal
  damage, shield, collision, realm and item systems. A stun, death or caster
  displacement cancels the unresolved hit, without restoring the spent Grit,
  mana or cooldown. Same-tick reentry cannot hit twice. Core Grit decay remains
  the single M38 authoritative timer.
- **Galio W / Shield of Durand:** existing M34 start/release survives.
  A real started charge creates channel state (no mana debit on start);
  while active, Galio has rank-specific **physical damage reduction**
  (12.5–22.5%) and **magic damage reduction** (25–45%). Charge release
  retains the previous size/taunt rule and single resource commit, with a
  two-second defensive tail. Hard CC, death, a displaced origin or expiry
  invalidates a staged charge and cannot spend release resources. The
  original Galio shield and Q/E/R are preserved.
- **Master Yi W / Meditate:** an uninterruptible timer was replaced by an
  actual up-to-four-second channel with **0.5-second healing pulses**,
  additional **3% maximum mana per tick** (6%/s), and 70% damage reduction
  for the first half-second followed by rank-specific 45–55% reduction.
  Healing is computed per tick from missing health and the ability's
  authored rank/AP, not granted as an instant full-channel lump sum.
  Stun, death, movement and insufficient mana terminate further pulses,
  mitigation and the AA/channel lock. True damage is not mitigated.
  M29 passives and R remain distinct.

Original kit values and specific nuanced interactions still need full patch
parity validation: especially detailed Galio scaling, Sett's exact Grit/AD
formula, Master Yi turret reduction and buff-pausing/linger, PvP visual/cast
feedback, channel-specific interrupt classes, 17 QA dimensions, and all
P+QWER cases. The implementation is functional, *not* a certification claim.

## Specialized tests and regressions

- New `tests/audit/v453_m40_b01_three_authored_channels.test.mjs`:
  **20/20 scenarios**, across both human team seats, **20 V40 snapshots**,
  **12 negative/adversarial checks**. Includes frozen pending impact
  surviving snapshot restore, impact idempotence, terrain denial, CC
  denial and refund prevention, rank/typed mitigation, Yi recovery and
  mana/tick idempotence, move interruption.
- Historical `tests/audit/v453_m23_b01_execute_grit_upgrade.test.mjs`
  updated to assert the genuine delayed Haymaker, rather than requiring
  the obsolete immediate-damage behavior. No engine fallback was introduced.
- `.github/workflows/skills-entity-targetability-p1.yml` includes the new
  M40 specialist gate, following the existing M20–M39 suites.
- [Skills specialist **PASS** 40927191573](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40927191573):
  M20 280/280, M32 280/280, M39 14/14, M40 20/20, M34 atomic
  fail-closed 0 certified.
- [Logic **PASS** 40927199129](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40927199129).
- [Projectiles **PASS** 40927199147](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40927199147).
- [Integrated QA **FAIL** 40927199074](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40927199074):
  the **Node → `engine.browser.js` regeneration verification** fails,
  as before. The `npm test full - milestone only` job is **skipped**;
  the integrator owns synchronization after explicitly authorized integration.

## Cohort, debt and next priority

B01 remains **35 champions, 140/140 QWER authored hooks**, and **0/35
fully certified kits**. M35 still reports **20 legacy labels open**.
Improved but not retired solely by these changes: `Sett W
cast_time_and_grit_decay`, `Galio W charge`, and `MasterYi W
damage_reduction_channel`. Individual detailed mechanical audit and
full-passive/17-dimension kit proof remain mandatory.

Entire roster: 173 champions, 692 QWER, **0 ready atomic kits** by M34;
369 training-fallback QWER in non-B01 cohorts, 183 outside-B01
routed/unverified slots. Neither number can be presented as newly
completed champions. This is still one 35-champion WIP macropackage,
not a 3-champion release.

**M41 recommended:** advance authored persistent-zone and projectile
counterplay across B01, prioritizing Galio Q converging windblasts with
separate collisions, Viktor R moving storm cancellation, and Karthus W
persistent wall; then widen to other remaining 20 debt identities using
shared geometry/scheduler/vision infrastructure. Validate both seats,
fog, obstacles, restore/replay, resource and CC races, and avoid repetitive
full QA runs between every edit.

Reference for mechanic definitions:
https://wiki.leagueoflegends.com/en-us/Sett
https://wiki.leagueoflegends.com/en-us/Galio
https://wiki.leagueoflegends.com/en-us/Master_Yi

**Do not merge PR #9 or mark any kit certified.**
