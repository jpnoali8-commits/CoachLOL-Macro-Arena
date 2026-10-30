# CoachLOL Macro Arena — M44 B11: authored poison, passives, shiv, pierce, Hunted and clone PvP

Date: 2026-10-29. Continued from the confirmed M44 B10 head `7010cd9a56f3c51367fe1ae7e5182d605fcae526`. Exclusive skills branch `dev69/skills-batch2`; PR #9 is Draft to `dev69/integration`. Do not merge or alter integration/main, items, browser bundle or workflows.

## Implemented gameplay (six champions, five new active slots and one explicit passive slot)

Engine `engine.mjs` adds `M44_B11_KITS_V453` with six individually named slot descriptors, **not six complete champions**:

| Champion | Authored slot(s) | Implemented |
| --- | --- | --- |
| Twitch | W, E; existing passive extension | W Venom Cask persists as an enemy-only area over three game-clock ticks, slows and increments the existing six-stack `m16TwitchPoison` caster-owned ledger; no caster teleport. E Contaminate debits once, resolves real physical damage per existing stack, does not consume those stacks and rejects a poisoned target lost between queue/commit. Poisoned enemy must be visible, within 1200 and in the same combat realm for E: deliberate PvP anti-fog information protection. Existing Twitch basic attacks now cause bounded game-clock true poison ticks. |
| Teemo | W, E passive | W Move Quick gives a temporary speed state. E Toxic Shot explicitly becomes a **passive-only** slot rather than a bogus cast; the existing real-AA-triggered DOT is preserved. M16 stealth and R mushroom remain unchanged. |
| Shaco | E | Two-Shiv Poison: real targeted magic hit, low-health bonus and champion slow; preserves existing Q stealth, W Jack in the Box, R clone. Spell shield negates the slow. |
| Caitlyn | Q | Piltover Peacemaker uses the existing authoritative traveled-projectile scheduler, now pierces more than the first body: full first hit, reduced secondary hit, with full damage on a valid trap-revealed target; no upfront damage and no premature headshot-mark consumption. Existing W stock/E net remain intact. |

Additional refinements to existing abilities (not newly counted QWER slots):

- **Nidalee** human spear and human W trap add `m44B11NidaleeHunted[owner.id]` alongside legacy Hunted state. Cougar Q has a named, authored damage branch that recognizes only that Nidalee's mark; expired marks and other owners cannot empower it. Existing M14 transformation and M16 trap logic are preserved. Longer Hunted Pounce range, other form timings and precise scaling remain **partial**.
- **Neeko W clone recast** now revalidates destination distance, collision/line and realm at authoritative commit (including state changes after player queue). Failed recasts cannot secretly redirect a server-owned clone. Existing original clone and disguise systems are preserved.

Five newly authored **active** slots: Twitch W/E, Teemo W, Shaco E, Caitlyn Q. One explicitly authored **passive-only** slot: Teemo E. Owner-specific Nidalee Cougar Q and Neeko W2 are **refinements**, not extra newly added slots. No generic fallback was added or used to invent another champion's identity. Numeric coefficients/durations are current board-game adaptations, not patch-exact Riot certification.

## Real engine QA executed in this ChatGPT conversation

All source and fixtures loaded from the actual public repository branch into JavaScript V8, including complete `engine.mjs`, `data/coachlol_map_v6.json` and `data/masks_128.json`. Each scenario asserts an `Arena.fromSnapshotV40` checksum roundtrip.

New permanent runnable suites:

1. `tests/audit/v453_m44_b11_authored_poison_pierce_pvp.test.mjs`: **40/40 PASS**. Blue/red Twitch poison P/W/E, caster ownership/cap, ticked W area, E precommit no-debit and fog/realm privacy, Teemo W/E, Shaco E/low-health/shield/range, Caitlyn Q travel/multi-hit/trap-mark/wall.
2. `tests/audit/v453_m44_b11_nidalee_neeko_interactions.test.mjs`: **20/20 PASS**. Blue/red Nidalee spear/trap Hunted, true caster ownership/expiry and Cougar Q; Neeko original clone, W2 cost-free recast, post-queue wall/realm/range revalidation.
3. `tests/audit/v453_m44_b11_mixed_simultaneous_pvp.test.mjs`: **8/8 PASS**. Both teams queue orders before a single resolution with four mixed pairs (Twitch/Shaco, Caitlyn/Teemo, Nidalee/Shaco, Neeko/Caitlyn), each mirrored blue↔red, verifying both receipts and V40 snapshot.

Reran existing B01–B10 suites **582/582 PASS** after both B11 engine commits. M44 directed total **650/650 PASS**, zero full P+QWER champion kits certified.

**NOT_RUN / NOT_CERTIFIED**: native `node --check`, repository-wide `npm test`, browser-generated `engine.browser.js` parity, Chromium e2e, actual two connected network PvP clients, complete fog/disconnect/death/replay threat models, exact live-patch numbers and the full 17-dimension P+QWER kit gate. Full 5v5 connected human match is not certified. This is *directed QA*, not an assertion of final parity.

## Commit chain

- `6959364166137313416dd101862d51999ceabd70` — six descriptors / poison, speed, shiv and piercing author branches.
- `0a1981571093676675c5a4ce1a4807ccbc64e593` — 40 reproducible PvP scenarios.
- `cf08c38aa76c54023680186f55edca992d349ef2` — Nidalee caster-owned Hunted/Cougar Q, Neeko W2 commit guard.
- `1cb90e431528588067411304a04154633c2f4d53` — 20 Hunted/clone tests.
- `a7e7f00be29cd72add4f7443c28634590bc3c37d` — eight simultaneous roster cases.
- This handoff file — final commit.

## Constraints, debt, next priority M44 B12

- Do not claim P+QWER completeness; Twitch R, Teemo out-of-combat W/passive and R mushroom interactions, Shaco E exact low-life scaling, Cait Q detailed hitbox, Nidalee long hunted Pounce/full form movement, Neeko real disguise/clone visibility require deeper author QA.
- The M16 shared trap and stealth modules and M15 entity systems must be extended rather than rewritten. No anonymous fallback skill contracts.
- Make B12 a **larger coherent multi-champion cohort** covering poison/mark synergies, clones and decoys, stealth detection, entity interception, transformations and high-identity recasts; prioritize champions like Evelynn, Rengar, Kha'Zix, Akshan, Wukong, Viego, Elise, Jayce, Quinn, Bard, Kalista, Aphelios, Hwei, Zeri, Azir, Aurelion Sol, Tahm Kench, Leblanc and others as gaps warrant. Implement actual named slot behavior, not fabricated slots to hit a count. Mixed human PvP 1×1 (one human controlling all five champions per team), simultaneous orders, strict fog, snapshots, no extra GitHub Actions minutes.
- Production isolation: **ONLY** `dev69/skills-batch2`; preserve PR #9 **Draft/open/unmerged** and do not touch `main`, `dev69/integration`, `engine.browser.js`, `version.json`, items, GitHub Actions, Codespaces or worker. Integration/full QA belongs to later authorized integration milestone.

Existing qualitative reference baseline: `data/riot_reference/source_16_21_1/riot/16.21.1/en_US/champion/*.json` (reference data is not exact mechanic certification). Existing published handoffs M44 B07/B08/B09/B10 remain valid; B11 does not erase their known debt.
