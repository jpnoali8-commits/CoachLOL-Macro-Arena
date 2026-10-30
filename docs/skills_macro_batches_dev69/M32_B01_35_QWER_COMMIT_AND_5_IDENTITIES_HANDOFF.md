# M32 B01 — authoritative commit correctness across 35 QWER kits + five named identity closures

**Date:** 2026-10-29  
**Repo:** https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena  
**Skills branch only:** `dev69/skills-batch2`  
**PR:** https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/pull/9 — Draft to `dev69/integration`, **NO MERGE**.  
**Verified implementation + CI HEAD:** `8601ca35529924853c635cb643064ff88c932935`.

## No fake completion, no generic substitution

CoachLOL Macro Arena is a **deterministic simultaneous-turn BOARD PvP strategy game**, not a real-time MOBA. Exactly two humans each own their five champions. No champion gets a fake universal skill or generic kit substituted for real P+QWER identity. M31's 35 individual owned identity witnesses, 140 executable partial QWER and 17-dimensional full-certification gate remain binding.

**M32 is an actual cohort-wide runtime integrity improvement across all 35 B01 champions, PLUS five bespoke gameplay upgrades. This is NOT 35 completed champion kits. The true 17-dimensional P+QWER certification count remains 0/35.**

## Concrete implementation in `engine.mjs`

### A. Cross-cohort commit rechecks — preserving every individual ability

The authoritative `executeBoardSkillV453Dev69` now checks key tactical legality again after both human players have planned actions and *before* `performActionV40` charges a skill:

- Direct targets must still be alive and in their required combat Realm, range and visibility.
- Aimed points must remain finite, on board and in the active Realm.
- Sejuani E must still have **four active Frost stacks owned by this Sejuani**; it is refused after the source ledger expires or is consumed.
- Tahm Kench R must still have three real *Taste* stacks owned by this Tahm against an enemy, and may not devour a target already swallowed/expired.
- Mel R must still have a legal live, source-owned *Overwhelm*-marked enemy in the combat Realm; otherwise there is no global cast.
- Vi Q, Zac E, Varus Q and Xerath Q tactical charge-release ranges are checked against the actor's **current** board position before spending mana/CD.
- Rell W *Mount Up* now has a single limited collision contact and no duplicate *Crash Down* shield; mount/dismount state remains server-owned and snapshotted.

These gates are not new generic abilities: they **protect and preserve champion-specific legal skill contracts** when two players act simultaneously. They handle race conditions between queue and committed action.

### B. Five distinct custom champion interactions — not generic fallback

| Champion | New M32 authored runtime behavior | Evidence and limitations |
|---|---|---|
| Lucian W — Ardent Blaze | Resolves on real star-shaped diagonal collision rays around the impact, not broad circular auto-hit. Each impacted unit receives the actual Ardent mark and damage | 2 PvP seat tests check diagonal impact and off-axis miss; complete projectile flight/other kit dimensions still pending |
| Milio Q — Ultra Mega Fire Kick | Q's first hit is the primary collision (max one). On hit, a real second valid visible enemy near the primary receives a single bounded bounced impact and slow; no duplicate cast debit | 2 PvP seat tests for distinct primary and bounced victim; exact official bounce flight remains incomplete |
| Vi R — Assault & Battery | Locks real primary target and intersects other visible enemy champions along the starting approach, applying separate path damage, a short knockup and deterministic lateral displacement subject to terrain | 2 PvP seat tests prove secondary damage and real relocation; remaining edge-case terrain/movement parity pending |
| Master Yi R — Highlander | Owner-specific seven-second attack interval haste. Champion takedown while active shortens remaining **Q/W/E** cooldowns deterministically; buff expires on board clock | 2 PvP seat tests prove haste, lethal kill reset and expiration; exact numerical parity pending |
| Seraphine W — Surround Sound Echo | Every third Q/W/E receipt grants third-cast W an additional individually keyed shield and allied healing without replacing first W | 2 PvP seat tests prove dual shield and heal; full CC/echo interactions remain pending |

## Tests and reproducibility

`tests/audit/v453_m32_b01_qwer_authoritative_commit.test.mjs`:
- 35 named B01 champions × all QWER × both human team seats = **280/280 queued actions subsequently denied under opponent stun**, all 280/280 denied before mana/CD debit or any entity/temporal damage effect.
- **6/6 owned mark race scenarios** (Sejuani, Tahm, Mel × both seats).
- **8/8 range/charge race scenarios** (Vi, Zac, Xerath, Varus × both seats).
- **2/2 Rell authentic form sequence scenarios**.
- **296/296 V40 snapshot/replay checks** and **zero failures**.
- It must not be described as 280 fully completed spells; this verifies **one adversarial dimension across all QWER**.

`tests/audit/v453_m32_b01_five_deep_identities.test.mjs`:
- Five named champion upgrades × two PvP human seats = **10/10 passing actual gameplay cases**, all preserving V40 snapshot consistency.
- No champion is marked CERTIFIED by these cases.

The specialist Skills GitHub workflow **requires both suites** and preserves historical M20 (280/280 QWER committed positive casts, 70 snapshots), M21–M30 authored regressions, M31 (35 individual identity witnesses × two teams = 70/70). The difference is deliberate: M20 proves basic *valid casts*, M31 proves *some named identities*, M32 proves *adversarial queue→commit denial and five more identity details*. None alone proves P+QWER complete with all 17 dimensions.

**Verified green at implementation HEAD `8601ca35`:**
- [Specialist Skills SUCCESS #40906713082](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40906713082), includes M32 matrices **280/280**, **6/6**, **8/8**, **2/2**, **10/10**, full prior skills QA.
- [Logic SUCCESS #40906732445](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40906732445).
- [Skills projectiles SUCCESS #40906732446](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40906732446).
- [Integrated QA #40906732487](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40906732487): **FAIL only in integrator-owned Node→browser regeneration diff step**; full `npm test` job skipped. Skills must NOT edit `engine.browser.js`; integrator synchronizes it when reconciling Skills/Items.

## Files changed and commit chain

- `engine.mjs`: targeted champion/runtime rule changes.
- `tests/audit/v453_m32_b01_qwer_authoritative_commit.test.mjs`: dual human cohort-wide interruption, counterplay, marks and snapshot parity.
- `tests/audit/v453_m32_b01_five_deep_identities.test.mjs`: 5 authored identities x 2 human seats.
- `.github/workflows/skills-entity-targetability-p1.yml`: suites required for Skills.

Implementation/QA commits: `ac004f41ffa1b5a33ad88e06a8ae627ff9b80fea`, `9f4972f3a83a06ee941f83de2774c498916ce289`, `0f178f49db81d8cb20c774afa26a986d92bbc5a7`, `43ff9b9207c4b9c3985ccc0d08fe03577c3c8776`, `e8048aa6ba8805130175c71d404618643775c85a`, `729d120b27eae3826af1960fc3eb42660c96cc16`, `9fe5497eb06cd791273a82ec220294f779aea544`, `8601ca35529924853c635cb643064ff88c932935`.

## Next M33 — actual full champion P+QWER closure, not renaming tests

- Keep **cohorts of 25–35 champion authored contracts** but require actual *per-slot and per-passive* proof through **all 17 dimensions**, including recasts/forms, valid/invalid fog/Realm targets, item/rune/spell effects, two-player concurrency, quest/state/undo and snapshots.
- Champion-specific remaining challenges: Viktor earned evolution controls/undo, Rell dual-form precise per-slot counterplay, Cassiopeia facing state and Petrifying Gaze, Xerath/Varus/Vi/Zac charging interruptions, Mel actual projectile travel, Milio bounced Q and two-stock E complete timing, Heimer upgrade state, Lee Sin multi-recast, Shen blade spawn/terrain, Lucian active targeting, Urgot R suppression, Zilean death/revive.
- Do not label one passed witness or one new partial effect as a completed champion; no generic fallback substitution. Only a per-champion certification ledger with witnessed complete P+QWER and 17 dimension evidence can change the **0**.
- Integrator owns `engine.browser.js` Node→browser sync and the merge. Do not open another competing PR or touch Items/main/integration.

**M32 status: runtime integrity on 35×QWER×2, five additional unique authored mechanics, all specialist QA green, 0 fully certified, PR #9 Draft/not merged.**
