# M37 — B01 five last unhooked QWER slots: authored mechanics, not generic fallbacks

Date: 2026-10-29. Skills branch: `dev69/skills-batch2`. PR #9: Draft → `dev69/integration`; **do not merge**. Core game is simultaneous-turn PvP board strategy, two human seats, five champions per player.

## What changed in real gameplay

M36's 135/140 **recognized individual native hooks** still left five missing slots. M37 adds five gameplay behaviors and their distinct positive/negative executable tests (all 35 B01 kits still release-blocked until full P+QWER + M27's 17 dimensions):

| Champion | Skill | Original unique mechanic implemented |
| --- | --- | --- |
| Corki | Q — Phosphorus Bomb | Real area magic damage already existed; adds a finite server-owned **vision source at the bomb's actual impact** and champion-specific reveal on successfully damaged bodies, without revealing untouched units or all fog globally. |
| Alistar | W — Headbutt | Keeps owner-selected dash/physical knockback and records a **short-lived, actual-hit target** which only his Q can follow up; shielded/untouched enemies never create combo intent. |
| Alistar | Q — Pulverize | Keeps true short-range area knockup, and additionally resolves a valid **W→Q combo against that exact displaced headbutt victim**, once, bounded by contact, range, fog, terrain, realm and server time. Expired/mismatched W cannot turn Q into a global spell. |
| Locke | W — Soul Ignition | Committed spell spends real self-health once (cannot self-kill), temporarily increases **the engine's true basic-attack speed** in addition to movement speed, counts only post-mitigation damage Locke takes during its three-second board window and restores 50% of that real damage once on expiry; no repeated free heal or mana bypass. |
| Locke | R — Purgatory | Authored long-range line hit and basic damage retained; a non-shielded enemy **champion** below the adapted low-health threshold after a real hit receives one server-side execute, and each **distinct** defeated champion grants one permanent authored sealing-power unit. Minions, structures, repeatedly killed same champion and blocked hits do not farm seals. |

The execution implementation reuses real collision, school damage, shield application, actual per-target damage accounting, timers, champion movement and deterministic snapshots. Runtime flags are only a route to separate behaviors; they do NOT constitute a fully authored kit. The Riot 16.21.1 reference skill descriptions were inspected for Corki, Alistar and Locke. Exact numerical tuning still requires patch parity and competitive gameplay validation.

## Validation

- `tests/audit/v453_m37_b01_five_remaining_authored_slots.test.mjs` spans both human PvP seats: bomb target-specific vision, headbutt/pulverize genuine combo and expiry, Soul Ignition damage + temporary attack interval + single recovery, Purgatory execution and one seal per unique enemy champion; snapshots V40.
- M35 full cohort work queue now detects **140/140 QWER slots with at least one authored hook** (the test fails if one loses all hooks). The **52 legacy partial/debt labels remain open**, as does a separate per-skill, per-passive, recast, global item/rune/spell and 17-dimension certification audit.
- Specialist CI continues to run all M20–M36 legacy mechanics/dual-seat tests, shared Skills, Logic, Projectiles. Final integrated browser parity depends exclusively on the integrator: no `engine.browser.js`, `version.json`, `main`, Items branch, or PR merge from this chat.

## Next production priority

Proceed in **one B01-wide dependency-oriented release train**, not 2–5 champions per PR. The hook-only coverage gap is now closed, but kits are NOT complete: audit and resolve 52 legacy tags and all uncovered P/QWER interactions, recasts and transformations, item/rune/spell, fog, realm, snapshots, undo and actual PvP counters with champion-authored evidence. M34's atomic gate remains fail-closed: **0/35 complete B01 kits and 0/173 roster kits certified** until every individual 17-dimension proof is executed.
