# CoachLOL Macro Arena — M33 B01 / 35 champion macro-facing + individual resource & skill contracts

**Date:** 2026-10-29  
**Work branch:** `dev69/skills-batch2` only  
**PR:** [#9](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/pull/9), still Draft → `dev69/integration`, **NOT MERGED**.  
**M32 base:** `8688a391e51f50be4e53874d8e0c9d1d5ab6bc4a`.  
**M33 final tested code HEAD:** `18c59501f9609085dd0b7f3f67d0da366971856a`.  
**Commits:** `bb78faf6a6360565040b809a6427983dac8d14cf`, `b0cb33352b38bc3278fd290d44b2a9ff2360ca8e`, `18c59501f9609085dd0b7f3f67d0da366971856a`.

## Implementation (actual game rules, not generic ability fallbacks)

- **35 B01 champions, both PvP seats:** a directed Q/W/E authoritative **committed** action updates normalized orientation. Denied/queued-only QWER cannot rotate. Explicit `queueBoardFacingV453Dev69(team,id,point)` checks ownership, planning phase, finite board point, combat Realm and nonzero direction; records a V40 intent without exposing an enemy target. This supplies real directional counterplay to **Cassiopeia R** and **Braum E**; visual/player UI connection remains to be integrated.
- **Cassiopeia:** directional Petrifying Gaze now has a player-orderable facing source, not merely prior auto-attacks. A facing opponent is stunned; an opponent facing away is slowed. Test checks illegal ownership and NaN never mutate state.
- **Milio E:** normal skill cooldown zero is deliberate because two independently consumed charges and the preexisting 17s recharge ledger are the actual authoritative limiter. Two consecutive legitimate shields pay mana; an empty stock rejects a third before commitment.
- **Heimerdinger R+Q:** the real empowered upgrade bypasses ordinary Q ammo gating and does **not consume ordinary turret stock**, but uses the existing empowered turret entity, attack/beam behavior, global turret limit and one-shot R empowerment. R+W/E remain covered by their previous dedicated temporal identities; no claim of exact kit parity.
- **Shen:** Spirit Blade is initialized at the champion's **spawn position**, remains in champion snapshot state, and Q pulls the existing blade along a real traversed line before anchoring it to Shen. The old first-Q null blade behavior is gone.
- **Lee Sin:** `m33LeeEnergyV453` is an owner-only, time-derived **200 maximum energy pool** (10 per second board clock). Q/W/E first cast requires/spends 50; Q2/W2/E2 recasts require/spend 30, without second mana/CD charge. Two actual Flurry-empowered basic hits independently restore 20 energy. Checks occur before action receipt to reject insufficient energy without state changes. Initial balancing values are tactical adaptations requiring later patch-parity audit.
- **Viktor:** the earned player-selected Q/W/E Hex augments now retain same-round order history. `undoBoardViktorEvolutionV453Dev69(team,id)` allows **same planning-round LIFO** rollback, returns 100 earned fragments and recomputes R only when Q/W/E are all augmented. The action is owner/phase/pending-order gated and journaled. This is *not* the existing shop undo after leaving fountain; full client controls remain outstanding.

## Exact tests and limits

- `tests/audit/v453_m33_b01_real_identity_runtime.test.mjs`: **10/10 actual champion-specific gameplay cases** (Cassiopeia 4, Milio 2, Heimerdinger 2, Shen 2), with **10 snapshots**.
- `tests/audit/v453_m33_b01_pqwer_cohort_facing_energy_evolution.test.mjs`: **70/70 individual 35-champion, two-seat directed cast orientation checks**, plus 4 additional Viktor/Lee Sin cases; **74 snapshots**. A corrected test passes a mandatory real starting target to Lucian Q rather than replacing his identity with a generic line-target.
- All old M20–M32 specialized gates remain active: M31 **70/70** identity witnesses; M32 **280/280** interrupted QWER with no debit, **296** replays, marks/charges/forms all pass.
- [Skills specialist SUCCESS #40909684293](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40909684293).
- [Logic SUCCESS #40909696409](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40909696409).
- [Projectile SUCCESS #40909696244](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40909696244).
- [Integrated QA #40909696270](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40909696270): **failed only at integrator-owned Node→browser regeneration difference**; subsequent full Skills+Items and npm tests **skipped**, not passed. Skills did not touch `engine.browser.js`.

## Scope of certification, genuine remaining work

**Exactly 0/35 fully certified P+QWER kits** under M27's **17 dimensions**. M33 provides new actual implementation and per-scenario evidence, NOT 35 kit completions. Existing descriptor `m20Missing` debt and the complete per-champion M31 ledger remain authoritative. No 17-dimension not-applicable waiver is silently inferred or marked as passed.

Prioritize following coherent authored families across B01 instead of 2–5 champion administrative batches: Viktor evolution full player controls and other-item interactions; Lee Sin exact energy/recast and follow-up targeting; Rell mounted/unmounted per-slot displacements; Cassiopeia champion facing orders exposed to PvP client; Varus/Xerath/Vi/Zac interruptible charge/release states; Mel actual projectiles and Overwhelm; Heimer R+Q/W/E concurrent summon geometry; Milio ball bounce and recharge timing; Shen blade path terrain; Lucian Q/W/R anchored projectile travel; Urgot R suppress/interrupt; Zilean lethal Chronoshift/revive; item/rune/summoner spell and fog/Realm/Undo cross-system adversarial QA per champion.

**Hard rules:** turn-based simultaneous PvP, exactly two human owners of five champions each, individual authored identities, no generic training fallback certification. Integration owner alone synchronizes `engine.mjs` → `engine.browser.js` and merges Draft PR. Do not touch `main`, `dev69/integration`, Items, `version.json` or browser bundle in Skills branch.
