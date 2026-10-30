# M45 B02 Skills S07 — Nami W route defect + deterministic trace harness

**Date:** 2026-10-30 · **Mode:** MIGRATION_ONLY · **Source:** `dev69/skills-batch2` @ `f0b1147ac46e585a1d5374a178b1ea462f5dc278` / blob `41679f7328a42e379fdfb8de5b92006e1bfb529f`

## Critical finding: Nami W does not have one uniform reachable executor

- `M44_B13A_KITS_V453.Nami.W` (line 1261) defines a `target_any` authored board rule **without** `bounceRange`.
- `abilityRule` prefers the M44 board rule over V42 (lines 1718–1724).
- `queueTargetedSkill` -> `resolveTargetedCasts` (lines 13878–13945) uses `abilityRule(u,'W').bounceRange` at line 13940. That field is undefined for the higher-priority M44 rule; subsequent V42 ricochets therefore risk dropping silently. Static finding, **not yet an executed failure receipt**.
- M44 direct board / combo route (lines 8213–8232 and 17679–17695) uses authored ricochet logic (725 range), different healing/damage. Never merge them as one certified Rust skill; pin which command path each client uses.
- Nami R directional special case (13543–13547) dispatches temporal wave *before* later generic instant line case (13584–13612). Prevent double hit/charge.
- Nami Q remains partial: V42 descriptor suspension vs actual V42 handler stun (S06).

## Executed deliverables

- Added `s07_capture_nami_routes.mjs`, pinned to legacy Git blob. At runtime it captures **8 traces** (Q, W-targeted, W-board, R wave × blue/red) with actual before/after snapshots, events, two player views, clock and `checksumV40`, checking restored snapshots. **No outputs are hardcoded.** It writes `s07_nami_routes.local.json` only if the test runs successfully.
- Added candidate suite `s07_nami_routes`: manifest **24 planned**, **0/24 actually executed**. Existing 23 preserved.
- Static audit **15/15 PASS**. The new test passed local Node v22.16.0 **syntax check only**; the exact local file Git blob SHA equals the blob uploaded to GitHub (`44cae7670f3fbe34f8a7888d9d4f2b8d98bce117`). Node gameplay remains NOT_RUN because local `github.com` DNS fails; cargo and Rust/WASM are not available here.
- `inventory_slots.json` v6 adds conditional route provenance to Nami W/R; counts still **865 (234 implemented, 366 partial, 265 absent)**. W source tag `implemented` does not imply certified parity; all Rust statuses remain `SOURCE_ONLY`.

## Next S08 and Chat 1 / core-combat contract

1. In a pinned original checkout execute `node docs/m45_rust_wasm/inputs/skills/run_golden.mjs --verify-only` then `node docs/m45_rust_wasm/inputs/skills/run_golden.mjs`. Do not publish false PASS if any test fails.
2. Resolve W route disagreement with runtime traces and specify whether Rust preserves source behavior per route or adopts one explicit fidelity correction with a versioned deviation/golden update. No silent behavior changes.
3. Capture and version only **real** output receipts for blue and red, owner/vision, same-tick debit, after-state, effects and replay; gate Rust until core-combat/core-champions contracts.

Engine JS, central Rust, integration, items, PR #9/#19, merges/rebases and Actions untouched. Roll back only this branch's S07 commit.
