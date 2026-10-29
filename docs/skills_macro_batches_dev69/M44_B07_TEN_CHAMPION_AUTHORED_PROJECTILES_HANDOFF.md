# M44 B07 — Ten authored champion mechanics on board projectiles
Date: 2026-10-29. Source `dev69/skills-batch2`. PR #9 **Draft** to `dev69/integration`, no merge.

## Increment scope
Ten distinct champions; **eleven distinct spell contracts** (not 10 P+QWER kits and not a claim of Riot parity).

| Champion | Slot | Individually implemented board identity | Incomplete / deliberate limits |
|---|---|---|---|
| Thresh | Q | Death Sentence first-body hook; timed stun, reveal, per-owner tether, cooldown refund on contact, second command to dash without debit | Exact dual tugs, windup, cleanse, terrain hook |
| Nautilus | Q | First-body anchor; stun substitute rooted at contact, terrain-checked victim displacement | Wall anchors, self+enemy meeting, detailed interruption |
| Pyke | Q | First-body hook with strong slow and terrain-checked displacement | Hold-to-charge stab/hook switch, exact slow distance |
| Zyra | E | Grasping Roots through minions and multiple champions (root only champions), serializable ray | Plants spawned/enraged by E, full timing |
| Senna | W | First-body projectile; 1s attached delayed 280-unit root affecting nearby champions, owner + shield checks | Death-trigger early root and exact shields/counterplay |
| Karma | Q | First-body damage, champion slow, separate proximity splash and spell-shield checks | Mantra/R empowered variant and exact radius/scales |
| Draven | R | Whirling Death physical multi-hit outbound, reverses on champion contact and returns, per-leg hit ledger | Global range, recast-to-reverse, Adoration execute, accurate deceleration |
| Gnar | Q | Boomerang return after champion contact or range, slow, per-leg ledger, pickup cooldown refund | Mega Gnar/Boulder form, exact slowdowns/pickup position |
| Renata | Q | Handshake first-body root, owner-owned timed Q2 displacement by verified point with no second cost | Advanced champion collision and follow-on stun |
| Orianna | Q/W | Command Attack physical ball origin and reposition on travel end; W circular burst around persisted ball, ally speed and enemy slow | E-ball attachment, command shield, full ball lifecycle |

These mechanisms reuse the existing authoritative `m44_authored_projectile` scheduler while keeping each champion's slot semantics in explicit `M44_B07_KITS_V453` and named contact branches. Do not use these authored flags as generic fallback for unrelated champions.

## QA in ChatGPT

Source: complete `engine.mjs`, actual `coachlol_map_v6.json` and `masks_128.json`, evaluated as full Arena in sandboxed JavaScript V8. Full bilateral fixtures and V40 snapshot roundtrip checks. New executable:
`tests/audit/v453_m44_b07_ten_champion_projectile_cohort.test.mjs`

- B01 34 / 34 PASS
- B02 18 / 18 PASS
- B03 106 / 106 PASS
- B04 100 / 100 PASS
- B05 104 / 104 PASS
- B06 16 / 16 PASS
- **B07 74 / 74 PASS** across 10 champions × blue/red × launch/shield/obstacle and 14 bilateral specialty cases.
- **TOTAL M44 scoped: 452/452 PASS.**
- **Certified complete kits: 0** in these milestones.

The prior regression tests are preserved without editing expectations, and the new code does not change item behavior, integration branch, browser output, or AI logic. `npm test` full repository, native `node --check`, Chromium visual, two live clients/PvP, client bundle parity, release and 17-dimension champion certification **NOT_RUN**. No GitHub Actions usage.

## Follow-up priorities

1. Finish B07 debt of each champion, in particular Draven R early recast and Adoration, Gnar forms, Orianna E-ball attachments, Karma Mantra, Pyke charge and Thresh dual tug/recast counterplay; then test mixed-roster PvP, fog and position through snapshots.
2. Continue grouped authored coortes for traps, clones, untargetability and return projectiles with interactions against death, stasis, spell shield and displacement.
3. Audit full P+QWER contracts, all ranks and 17 certification dimensions only after substantive macro-cohorts. Do not advertise `partial` as `certified`.

## Source mechanic references
- Riot champion profile: https://www.leagueoflegends.com/en-us/champions/thresh/
- League of Legends Wiki: https://wiki.leagueoflegends.com/en-us/Thresh
- Senna: https://wiki.leagueoflegends.com/en-us/Senna
- Draven: https://wiki.leagueoflegends.com/en-us/Draven

## Git boundary
Exclusive `dev69/skills-batch2`. Leave PR #9 Draft, **NO MERGE**, no branch creation/force push, no changes to `main`, `dev69/integration`, Items, `engine.browser.js`, `version.json`, GitHub Actions or Codespaces.
