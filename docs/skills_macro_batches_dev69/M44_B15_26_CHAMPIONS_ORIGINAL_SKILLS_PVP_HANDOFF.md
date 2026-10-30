# CoachLOL Macro Arena — M44 B15: 26 champion-authored slots on reusable original skill engine

**Date:** 2026-10-29. **Starting HEAD:** `301deb35acdd11f82e54e12c6d03564cb151909c` (M44 B14D).
**Only production branch:** `dev69/skills-batch2`. **PR #9:** Draft into `dev69/integration`, DO NOT MERGE.

## Foundation preserved: Sylas/Viego automatic original-code reuse

- `m44B14DOriginalBoardRuleV453` remains the **single precedence/resolution registry** for authored board skills. Newly registered champion R rules automatically become candidates for Sylas Hijack and are dispatched into the **original R executor**; do not implement a separate Sylas-R copy of those effects.
- Viego assumes the victim's temporary champion identity, appearance and existing passive hooks, takes authored Q/W/E from this same engine, retains own **Viego.R**, and restores original identity on expiration, death or own R. No additional Viego-copy roster or anonymous training fallback.
- B15 explicitly verified **new Hwei E** through Viego owner possession, plus **new Aphelios R** through Sylas Hijack. Those are assertions of the shared registry, not isolated handcrafted copies.

## New B15A: twelve individual original slots

| Source champion | New board skill | Individual owned mechanics (tactical turn adaptation) |
| --- | --- | --- |
| Akshan | E — Heroic Swing | Rotated anchor swing around selected point, endpoint/collision validation, owned impacts |
| Hwei | E — Subject: Torment | Independent EQ fear, EW binding and EE crushing/slow tactical variants; invalid variants rejected |
| Aphelios | R — Moonlight Vigil | Five-gun modes (Calibrum, Severum, Gravitum, Infernum, Crescendum), independent marks/healing/area or chakram effects |
| LeBlanc | Q — Sigil of Malice | Target mark consumed once by later real spell damage from same owner, no generic Q |
| Jayce | W — Lightning Field / Hyper Charge | Hammer area pulses vs cannon next-basic empowered charges, preserving current stance |
| Rumble | E — Electro Harpoon | Owner directional projectile, slow and heat |
| Kalista | Q — Pierce | Projectile travels through killed targets, embeds spear stack in first surviving target |
| Azir | E — Shifting Sands | Repositions to **own** existing soldier, shields and affects surrounding enemies; no phantom soldiers |
| Zed | E — Shadow Slash | Caster and own shadows are distinct emitters, per-target hit ledger and slow |
| Viego | W — Spectral Maw | Directional first-target stun projectile, without replacing own R |
| Sylas | W — Kingslayer | Targeted owned damage and missing-health-dependent self-heal |
| Ekko | Q — Timewinder | Outward damaging/slow pass and server-owned delayed return hit |

## New B15B: fourteen individual original slots

| Source champion | New board skill | Individual owned mechanics |
| --- | --- | --- |
| Bard | Q — Cosmic Binding | First/second target collision and slow-or-stun tactical conditions |
| Aurelion Sol | W — Astral Flight | Validated travel to player-selected point with temporary speed state |
| Lissandra | Q — Ice Shard | First hit and secondary shattered targets with damage/slow differentiation |
| Taliyah | Q — Threaded Volley | Rock impact and worked-ground state with subsequent spell branch |
| Yorick | Q — Last Rites | Charged next basic and owner self-heal; grave creation remains further parity debt |
| Malzahar | Q — Call of the Void | Directional damage and unique silence |
| Fiddlesticks | W — Bountiful Harvest | Multi-target drain and server-timed healing pulses, cancel on CC/movement |
| Nocturne | Q — Duskbringer | Directional mark and timed movement-speed trail |
| Skarner | Q — Shattered Earth | Temporary rock/next-basic charges; throwing/recast needs refinement |
| Briar | Q — Head Rush | Validated enemy gap-close, stun, owned armor-break state |
| Bel'Veth | Q — Void Surge | Distinct N/S/E/W dash directions; spent direction denied before debit; different directions may be used independently |
| Rakan | Q — Gleaming Quill | First enemy damage and nearby weakest ally healing |
| Pantheon | Q — Comet Spear | Line damage, subsequent target attenuation and low-HP execution bonus |
| Diana | Q — Crescent Strike | Arc/cone geometry and per-owner Moonlight marks |

**Important:** each entry is a genuine, individually named authored tactical rule, but still a **partial implementation** with some board-specific simplified timing/damage/form interactions; this is not complete 1:1 current League of Legends champion parity. The code explicitly rejects incomplete/invalid state instead of falling back to anonymous simulated spells.

## Authority hardening during QA

- Separated queue-time from commit-time guards for Akshan swing, Azir own soldier and Bel'Veth dash direction; negative cases cannot spend mana or issue illegal orders.
- Exempted B15 move skills from the **generic pre-movement handler** so each authored champion controls its own geometry.
- **High-priority bug fixed:** Azir E previously passed an entire soldier object to a movement helper, risking assignment of the soldier's `id`, `team` and entity fields onto the champion. Now only `{x,y}` is copied. Both B15 movement helpers whitelist `x/y`. The new simultaneous PvP suite asserts champion ID and team preservation.
- LeBlanc Sigil consumes a single stored mark on a genuine spell; Ekko Q return, Jayce Lightning Field and Fiddlesticks W use actor-owned checkpointable temporary state, no untracked scheduling.
- No writes to `engine.browser.js`, server matchmaking, items, Actions, Codespaces or worker deployment.

## QA — final engine blob `38c744d75b8554c249d69c23023795c8b7f8eaff`

| Scope | Suites | Directed cases | Status |
| --- | ---: | ---: | --- |
| Previous M44 B01–B14D | 28 | 1,084 | **PASS 1084/1084** |
| `tests/audit/v453_m44_b15_26_champion_authored_copy_pvp.test.mjs` | 1 | 84 | **PASS 84/84** |
| `tests/audit/v453_m44_b15_mixed_simultaneous_pvp.test.mjs` | 1 | 16 | **PASS 16/16** |
| **Total** | **30** | **1,184** | **PASS 1184/1184** |

All **30 suites were rerun after the final Azir ID/team correction**. These are actual `Arena` operations run in JavaScript **V8** from ChatGPT, with real `engine.mjs` and map/mask JSON loaded through GitHub connector, explicit mocked file imports and fixture-level LOS/vision controls. Blue/red mirrored snapshots use `checksumV40`. The mixed suite queues both human players' skills before any resolutions; both actors retain stable champion IDs and teams.

No GitHub Actions minutes consumed. **NOT performed/not certified:** native Node syntax and `npm test` full repository, `engine.browser.js` parity, browser rendering, GLB/VFX, E2E UI, two truly connected PvP clients, official LoL 26.21 coefficients and full skill timing, complete 17-axis P+QWER certification, anti-cheat/redaction release gates. **0 newly certified complete kits.**

## Commits for B15

- `a6a0657056302eca3fec57d1c47c82249c8c5690` — 12 original champion slots B15A.
- `8454a523e550464df00a03bd5b2ea57c0df270c7` — Azir soldier targeting order.
- `87d79247dda9980eaf3ac63630bd762d5ac7098b` — 14 additional champion slots B15B.
- `d5eec983670da5262355b9325314a0f7134d6bbc` — owner temporal continuity, guards, Sigil.
- `b513e3d7b031b547fe0564b27215a4952c77ea12` — queue/commit guard scoping.
- `1032e696d89b19420255096bf3a94f8240e69026` — authored movement precedence over generic dash.
- `f402ad3c5bf0d6fb8a3eef661b6b676073b710c2` — 84 real V8 PvP test cases committed.
- `ba9d1c331e2da39ad72acf995d56f4f6382b615e` — whitelist positional `x/y` for movement; correct Akshan/Azir entity ownership.
- `ca263adce0a2efb39164d6d5933528a4110aab26` — 16 simultaneous human intent test cases.
- This handoff document.

## Next recommended M44 B16

Continue original Q/W/E/R completion in grouped 25–40 champion batches with **ownership, passive hooks, per-skill state and geometry**. Audit the two-state/timed mechanics (Aphelios basic ammo/weapon auto-rotation, Kalista binding, Bard fully ground-based shrines, Hwei multi-verse timing, Akshan swing recasts, Bel'Veth directional recharge, Skarner rock throw) **without** introducing fake substitutes. Sylas/Viego remain consumers of the original authored kit: NO per-champion duplicated SyIas/Viego spell implementations.

**Production isolation:** only `dev69/skills-batch2` modified; PR #9 Draft into `dev69/integration`, no merge. Do not touch `main`, `dev69/integration`, version, workflows, browser bundle or item ownership without coordinated permission.
