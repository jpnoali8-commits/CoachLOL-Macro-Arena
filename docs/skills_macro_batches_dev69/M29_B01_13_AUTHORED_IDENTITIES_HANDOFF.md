# M29/B01 — authored macro batch 13 identities, dual human PvP and QA

**Date:** 2026-10-29.  
**Repo:** https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena  
**Exclusive branch:** `dev69/skills-batch2`  
**Existing PR:** https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/pull/9 — Draft, base `dev69/integration`, **NO MERGE**.  
**Verified HEAD of implementation + CI before handoff:** `0d51a372b802c266c3c866601c130dfa8ed39b00`.

## Scope, honesty and design

CoachLOL Macro Arena is NOT a realtime MOBA. One human controls the five BLUE champions and the other human controls the five RED champions, orders are chosen simultaneously and resolved on an authoritative board engine. Unique P+QWER mechanics remain champion-authored; shared geometry, time, damage/CC, vision, collision, Realm, effects and serialization are infrastructure only. There are no generic substitute skills.

**M29 implemented real additional mechanics for 13 distinct B01 champions** after M28 authored 12; **25 distinct B01 champions received depth upgrades across M28–M29**. This count is **NOT 25 fully completed/fully certified champions**. M27's 17-dimensional full kit gate still holds **0 CERTIFIED** until all individual P+QWER, recasts, targets, forms, items/runes/spells, fog/Realm and replay/undo have been proven per champion. Do not rename `NOT_CERTIFIED` kits.

## M29 authored deltas — behavioral contracts

| Champion | Individual new mechanic | Remaining work |
|---|---|---|
| Corki | Third magazine shot (Big One) deals one bounded secondary area impact around its real primary target, independently of direct line hit | True missile model and all P+QWER end-to-end |
| Seraphine | E checks real target status: ordinary slow, slowed target roots, rooted target stuns; preserves existing echo logic | Full soundwave upgrades and immunity cases |
| Milio | E has two owner-controlled stored charges with 17-second sequential recharge; denies without mana/cooldown and grants allied speed | More exact E cast timing and individual interactions |
| Quinn | W reveals its tactical zone and applies visible, range-validated Harrier candidate mark | Full passive targeting, fog and scouting contracts |
| Tahm Kench | Q checks 3 independent owned Taste stacks; stun consumes them then the hit independently adds one fresh stack | Additional Tongue Lash recast/monster restrictions |
| Master Yi | W Meditation temporarily reduces nontrue incoming damage; existing healing and shielding remain | Interruption and channel identity |
| Yunara | Q's next actual primary basic hits up to two nearby visible legal opponents for deterministic secondary packets | Full passive resource/proc spread and transformed mode |
| Vi | Q accepts optional explicit 0–2 second charge, checks distance BEFORE debit; damage scales with charge and dash remains collider-validated | Charged collision/interrupt parity |
| Lulu | W allied Whimsy grants temporary real attack interval haste using the existing authoritative AA interval calculator; enemy polymorph retained | W exact attack speed progression/other targets |
| Jarvan IV | E flag provides nearby allied AA interval haste only while an owned living same-Realm flag is in radius | Banner exact buff scaling and terrain flags |
| Kassadin | Server receipts for nearby committed champion spells build bounded Force Pulse stacks; E consumes them to scale damage, 4+ upgrades slow to root | Historical force pulse passive, spell range/visibility nuances |
| Shen | E leaves Spirit Blade at the starting point; next Q pulls the blade through board line geometry, slows crossed enemy and increases Q next basics; owner/world snapshot states | Spirit Blade initial point, persistent placement and multi-target passive |
| Zac | E Elastic Slingshot explicit charge range from 550 to 1100 world units, increased damage on fully charged land, zero-resource denial for invalid destination | Charged interruption and blobs/revival full contract |

All tuned to deterministic board time. `chargeSeconds` optional tactical parameter preserves older cast command compatibility. This is deliberate incremental integration compatibility, not evidence of complete ability parity.

## Code and test files

- `engine.mjs` — 13 custom, named M29 flags and actual authoritative behaviors, no browser regeneration.
- `tests/audit/v453_m29_b01_authored_identity_gate.test.mjs` — 8 champions × 2 seats = **16/16** passing, including validated resources, status changes and V40 replay.
- `tests/audit/v453_m29_b01_five_identities.test.mjs` — 5 champions × 2 seats = **10/10** passing, including charge denial, lane movement, ability interactions and replay.
- `.github/workflows/skills-entity-targetability-p1.yml` — both suites required in the specialist workflow.

Commits:
- `c2d2e61e46c04065b56cbedcb52465b23fec6ce2` — M29 initial eight descriptor/stock/state changes.
- `c87f71c934bad5a3a9f15c5650fd6018c1afce95` — hits and ability-specific effects.
- `fc57ad36e2f79cf63a8745fb65213d99b1424da8` — eight-champion QA.
- `4f472f5de91bd146e5fccca587470c5a773436f6` — first CI wiring.
- `deb455580a8e9113cfa2d417f4b97faf11eb8383` — Tahm Q three Taste consumed then immediate single reapplication QA.
- `dafa20e48accf3d39fc419da941861fa8b09cbce` — five additional mechanics.
- `8f14490fe167b6a05da6bcd9f935011963a78ac3` — Kassadin/Spirit Blade runtime.
- `3112138c5773ac3f99f543ed985e685c5ca63b15` — five additional dual-seat cases.
- `0d51a372b802c266c3c866601c130dfa8ed39b00` — CI wiring.

## Actual QA, not surrogate completion

**PASS at verified implementation HEAD `0d51a372`:**
- Specialist [#40896541170](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40896541170): M29 16/16 + 10/10, M28 14/14 + 14/14, all existing 35-champion B01 M20–M28 QA and passive/certification gates. **54/54** newly authored behavior tests accumulated M28+M29, and no new certified champions.
- Logic [#40896551167](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40896551167): SUCCESS.
- Skills projectile [#40896551156](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40896551156): SUCCESS.
- Original M20 280 casts/effects on two human seats, 70 deterministic snapshots and M27 17-dimensional audit retained.

**Integrated QA [#40896551175](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40896551175): FAIL strictly at the pre-existing integrator-owned `Verify official Node to browser regeneration` step.** `python tools/sync_browser_v43.py` changes `engine.browser.js`, then `git diff --exit-code -- engine.browser.js` fails. The `npm test full` job was skipped. This is NOT authorization for Skills to change `engine.browser.js`; integrator owns regeneration and merge.

## Next priority M30

1. **Stop counting partial kits as delivery completion.** Use per-champion M27 manifest to move toward truly complete P+QWER contracts and deep counterplay (including immunity/CC, interruption, real item/rune/summoner application, illegal fog/Realm targets, invalid recasts, undo receipts, snapshot/replay).
2. Focus missing high-risk identity details: Viktor evolution, Lucian Q mandatory actual initial target, Mel individually tracked projectile collisions, Varus empowered Q/Blight; remain within the fixed B01 cohort until its outstanding certifications are closed. Complete special behavior for Rell mount, Locke W/R only after official reference validation, Zac & Vi charge interruption, Shen Spirit Blade initial position, Milio stock/tempo and Jarvan banner.
3. Improve throughput with grouped champion-authored test matrices and reusable authoritative effect helpers, not generic fallback. Target large cohorts (25–35) while distinguishing **implemented delta** vs **fully certified P+QWER** explicitly.
4. Keep same Skills branch and existing Draft PR #9; do not merge or create competitor PR. No edits to `main`, `dev69/integration`, `version.json`, Items branch, or `engine.browser.js`; integrator handles Node→browser synchronization.

**Final status: 25 distinct B01 champions with new authored deltas across M28+M29; 0 fully certified, 54 new behavior cases all passing, PR #9 Draft.**
