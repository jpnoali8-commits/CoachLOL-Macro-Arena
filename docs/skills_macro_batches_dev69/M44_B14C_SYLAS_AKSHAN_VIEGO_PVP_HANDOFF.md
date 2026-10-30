# CoachLOL Macro Arena — M44 B14C: Sylas / Akshan / Viego authored PvP contracts

**Date:** 2026-10-29. **Base M44 B14 A+B:** `034c8f8a8a81f917588544b3f5974bca5b3b5f1e`.
**Only writable branch:** `dev69/skills-batch2`. **PR #9:** open Draft, unmerged, targeting `dev69/integration`.
No GitHub Actions, Codespaces, worker, merge or browser regeneration invoked.

## Scope: 3 champion-specific systems, no new false complete kits

### 1. Sylas — Hijack of M44 authored R contracts
- `M44_B14C_STEALABLE_R_V453` is an explicit allowlist of **11 source champions**:
  Bard, Malzahar, Volibear, Nocturne, Diana, Lissandra,
  Fiddlesticks, Ryze, Skarner, Ekko and Yorick.
- `m44B14CSylasUltimateRuleV453` resolves the exact authored B13 descriptor at **request, authoritative revalidation and cast**, without global generic/unknown fallback; previously supported older R contracts remain supported.
- Sylas stays **Sylas**, owns and pays the theft once, then casts the stolen R with **no duplicate mana debit** and consumes the one stolen-use record. Expiry is inherited from the existing Hijack owner state.
- Important: this **does not** mean all LoL ultimates are stealable or fully certified. The 11-item list is intentionally bounded.

### 2. Akshan — Scoundrel + avenging ally respawn
- Integrated in **actual champion death / kill-credit path**, after assembling credited killer and eligible assistants, before clearing damage contributors.
- On a champion kill, record **victim IDs** on the exact killer, keyed by the fallen unit's team, **only when that fallen team includes Akshan**.
- If the marked Scoundrel is killed by a team with Akshan **credited or assisting within the existing credit window and alive**, shorten the death timers of the exact fallen teammates killed by that Scoundrel to current simulated time; the existing fountain respawn handler handles the spawn.
- Unmarked deaths, unrelated Scoundrels and kills with no participation by Akshan **do not revive**. No duplicated resurrection from a second lethal hit; snapshots retain owner-scoped flags.
- Current tactical adaptation does **not** implement Akshan E Heroic Swing, precise W passive detection UI, whole-patch coefficients or all release-stage fog checks.

### 3. Viego — Sovereign's Domination bounded possession
- **Real kill/assist**, attributed through the existing champion kill-credit/assist mechanism, generates one short-lived, **Viego-owned** corpse soul, keyed by original victim ID + death sequence.
- `queueViegoPossessV453M44B14C` is a private planning intent; `resolveViegoPossessV453M44B14C` revalidates active corpse, expiration, distance, own-team vision, actual terrain/realm and CC at commit. Stale, invisible, unauthorized or revived corpses fail closed.
- Viego **remains the same original champion/unit/team**, moves to the valid corpse point, gains a bounded tactical heal, and temporarily borrows only the **named audited Q/W descriptors** from Hwei, Azir and Bard. An unsupported possessed slot is **rejected**, never replaced with a training fallback.
- The copied Azir W soldier is **owned by Viego** rather than the dead Azir. Borrowed Hwei Q follows Hwei's validated verse selection. Viego's own R Heartbreaker remains his own R.
- After 8 simulated seconds or death the borrowed state is cleared, previously existing Q/W/E cooldown endpoints restored conservatively. Souls expire after 6 simulated seconds and never introduce an extra champion.
- This is **partial possession**, not complete victim P+QWER, items, spells, transformations, stats or 1:1 Riot parity. Additional champion-copy adapters require individual authoring and certification.

## QA — final engine blob `185c850cbe98a79d4400f16cdb98309dfe10212a`

Each test suite was fetched from GitHub and run in **offline JavaScript V8** against the real `engine.mjs`, map and 128-mask JSON, with imports/files mapped to in-memory runtime fixtures and explicit fog/LOS fixture overrides as needed.

| Scope | Suites | Scenarios | Result |
| --- | ---: | ---: | --- |
| M44 B01–B14A+B existing | 24 | 948 | **PASS 948/948** |
| `tests/audit/v453_m44_b14c_sylas_hijack_authored_r_pvp.test.mjs` | 1 | 22 | **PASS 22/22** |
| `tests/audit/v453_m44_b14c_akshan_scoundrel_pvp.test.mjs` | 1 | 14 | **PASS 14/14** |
| `tests/audit/v453_m44_b14c_viego_owner_possession_pvp.test.mjs` | 1 | 22 | **PASS 22/22** |
| **Total** | **27** | **1006** | **PASS 1006/1006** |

All three new suites are permanent, bilateral blue/red, assert named champion-specific effects and snapshot `checksumV40` roundtrip, plus adversarial negative cases. Existing 24 suites were rerun **after** the final Viego engine commit, not extrapolated from old results.

## Commits in this milestone

- `09cbc8816c33d85b80422e016d7ff7d062480cea` — Sylas exact Hijack metadata.
- `dcd72a00f327a8a8dfaafe0bf74b2dfa3717c25d` — Sylas 22 permanent tests.
- `080368ea454d6b2ebc7a815e4ce35f246bc7589d` — Akshan Scoundrel authority.
- `c7629343f880d26b848f33ac1e993e3fe99483cd` — Akshan 14 permanent tests.
- `08f61f6093dcb2b93e2b85437a54f97ce254f808` — Viego soul possession/limited named copies.
- `530f7074e2fcf50aac330f012a6a538642480737` — Viego 22 permanent tests.
- This handoff commit.

## Follow-up priority M44 B14D

Expand **Viego** owned P/Q/W/E/R interactions to additional champion families without copying the player/owner identity or inventing unknown spell effects; implement **Akshan E grappling/swing collision and return movement**, then **Aphelios basic-attack ammo rotation, Gravitum / chakram ledger, automatic gun changes**, and **Hwei E three-verse grammar**. Continue large authored batches only when each champion mechanic can be proven with blue/red PvP, owner-scoped checkpoints, competing intents and negative validations.

**Not certified**: 17-axis full P+QWER kit coverage, native Node tests/`node --check`, repository-wide `npm test`, browser bundle synchronization, Chromium E2E, two genuinely connected clients, official patch numerical parity, complete fog/privacy and anti-cheat, all items/on-hits, full 5v5 pacing and release/asset gates. **0 complete certified P+QWER kits newly declared.**

**Isolation:** No change to `main`, `dev69/integration`, `engine.browser.js`, `version.json`, item branch, workflows or server transport. No CI/Actions minute consumption. Do not merge PR #9 without the user's explicit request.
