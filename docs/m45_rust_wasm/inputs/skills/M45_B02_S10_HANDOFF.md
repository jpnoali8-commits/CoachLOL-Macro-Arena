# CoachLOL M45 B02 Skills S10 — runtime V8 evidence, 22/24 and stale intent CONFIRMED

**Date:** 2026-10-30 · **Source:** `dev69/skills-batch2` @ `f0b1147ac46e585a1d5374a178b1ea462f5dc278` · **Engine Git blob:** `41679f7328a42e379fdfb8de5b92006e1bfb529f` · **Mode:** MIGRATION_ONLY.

## What actually ran

After repeated local DNS failures for `github.com` and `raw.githubusercontent.com`, the GitHub connector supplied the exact original `engine.mjs` Git blob and original `data/coachlol_map_v6.json` / `data/masks_128.json` blobs into an isolated V8 runtime. Removed ESM `export` tokens for in-memory compilation without changing gameplay functions. Executed **actual source bodies** of 24 of the 26 pinned test files with minimal Node `assert`, file, log and `structuredClone` shims. This is an independently executable **V8 legacy observation**, *not* a full unmodified Node test invocation or network run.

- **22/26 V8_PASS**, **2/26 V8_FAIL**, **2/26 NOT_RUN** (the latter two require multiplayer server modules/HTTP). **24/26 attempted**.
- Supplemental legacy M44 B13A (14 champions mirrored) **28/28 V8_PASS** from its pinned source.
- The full original Node golden runner: **0/26 actually run**; no Actions/Codespaces used, no native Rust/WASM tests run. `golden_plan.json` records V8 results under a **separate field** while retaining each suite's `SPEC_ONLY_NOT_RUN` Node status.

## P0 confirmed Nami W bug

The **four original S09 test-body cases actually executed and passed** (blue/red × targeted→board / board→targeted). Source `resolveCombat` resolves Board first then Targeted; the same-slot target intent survives the cooldown failure. Each observed sequence:

```text
Initial mana 500; W board cast -> 430, ally 400->475 HP.
Targeted resolver on same tick: still pending, mana 430.
At gameTime 10.25 (after cooldown): stale targeted W automatically casts -> mana 360, ally HP 590, pending cleared.
```

Four source snapshot restored hashes matched: `d68c3247`, `ac967537`, `4b0ab891`, `596a5c6d`. Synthetic fixture mocked visibility/duel permission and manually advanced simulated time; this proves legacy behavior in the test setting, **not** a real server exploit or full turn replay. `S10_NAMI_W_RUST_CONTRACT.json` explicitly requires a one-slot arbiter and stale intent cancellation in Rust.

## Two failing golden sources (retain FAIL)

1. **M2 Ahri E:** source `queueKitSkillV42` forwards Ahri E to `queueDirectionalSkill`, but current authored `abilityRule` selects `board_effect` and the directional entry rejects with `Ação direcional indisponível.` Test expected `ok:true`; execution stopped on **blue** before other cases. Do not certify M2.
2. **Global ultimates M14 Ashe R:** cast accepted, 100 mana consumed; it creates a `m44_authored_projectile` in board temporal rather than immediately stunning. Old test expects immediate `stun` and fails on **blue**. Characterize actual flight and impact before deciding whether test is stale or motor is defective.

## Next S11 / coordinator Rust

- Prioritize an explicit **Rust core-clock/core-combat one-intent-per-slot contract**, no replay of stale commands after cooldown. Write anti-ghost and duplicate ACK tests when crate contracts exist.
- Keep the two FAIL source suites unresolved in the matrix; move forward on other features only with explicit failure receipt.
- Run the complete 26 original tests via Node only when full checkout/execution exists, ideally without Actions; do not infer PASS from this V8 adapter.
- Do not silently change legacy engine JS or merge PR #9/#19; all files S10 audit only.
