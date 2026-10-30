# CoachLOL M45 B02 Skills S08 — W dual route + Rust contract

**2026-10-30 · AUDIT ONLY · MIGRATION_ONLY**

Source: `dev69/skills-batch2` `f0b1147ac46e585a1d5374a178b1ea462f5dc278`, `engine.mjs` Git blob `41679f7328a42e379fdfb8de5b92006e1bfb529f`.

## Technical result

**P0 gameplay/migration debt — Nami W competing path.** M44 B13 rule is preferred by `abilityRule` (1718–1724), has no `bounceRange`, yet the V42 targeted caster at line 13940 reads exactly `abilityRule(u,'W').bounceRange`. Node isolated arithmetic confirmed `725<=undefined === false` and `0<=undefined === false` (not a gameplay test). The board executor W (8213–8232) uses an independent 725-unit bounce cap, alternative heal/damage and does not call Nami's Surging Tides after allied healing, unlike targeted V42 (13937). Preserve as versioned **fidelity debt**, not as intended Rust behavior.

**P0 concurrency hypothesis:** `queueTargetedSkill` (13878) and `queueBoardSkillV453Dev69` (4434) have independent pending queues. `resolveCombat` (17875) resolves Board before Targeted. When both are queued same slot, targeted's `if(!gate.ok)continue;` after board debit (13923) may leave stale `pendingTargetedCast` and allow unintended later cast. Needs real Node witness, don't mark proven exploit yet.

## Produced

- `s08_nami_w_routes.test.mjs`: pinned-original-engine test with **6 blue/red route cases** (targeted W, board W, co-queued W), asserts owner denial and no same-tick double mana debit; captures actual snapshots hashes, event summaries, health/mana deltas and whether a pending intent remains. Node **syntax** verified against the identical Git blob. No runtime outputs fabricated.
- `S08_NAMI_W_RUST_CONTRACT.json`: explicit target design for Rust owner+slot+turn arbitration, idempotency, bounce/vision/realm, effects, replay; `PROPOSED_NOT_IMPLEMENTED` pending legacy receipt and shared Rust crates.
- `inventory_slots.json` v7: preserve all **865** legacy IDs and previous status counts; Nami W now includes S08 risk/test link. Rust `SOURCE_ONLY`.
- `golden_plan.json`: **25 planned** tests, **0/25 executed**. Existing 24 preserved.
- Static review **15/15 PASS**, Node isolated JS arithmetic/syntax PASS; Node full gameplay **NOT_RUN**, Rust native/WASM/browser **NOT_RUN**. Current terminal DNS for `github.com` fails, and central Rust tree has only `core-state`, no `core-combat` or `core-champions` yet.

## S09 / central coordinator

1. Run `node docs/m45_rust_wasm/inputs/skills/run_golden.mjs --verify-only` and `node docs/m45_rust_wasm/inputs/skills/run_golden.mjs` on same pinned engine. Inspect each real exit/status and report failures; execute `s08_nami_w_routes.test.mjs` through that runner.
2. Capture actual legacy competing-queue behavior in both seats. Choose a versioned intentional Rust deviation versus preserving legacy behavior, with explicit accepted regression fixtures. **Do not modify frozen JS**; wait for contracts to be shared via Chat 1.
3. Rust requirements: exactly one seat-owned slot command at resolution, idempotent per request, no later replay of stale intent, explicit P/QWER authored executor, realm and fog. Golden pass alone does not prove browser/network.

Rollback: revert only S08 audit commit. No merge/force-push, Actions or Codespaces, no modification of PR #9, PR #19, original JS gameplay or Rust central branch.
