# CoachLOL M45 B02 Skills S09 — stale intent after cooldown (Nami W)

**Source** `dev69/skills-batch2` `f0b1147ac46e585a1d5374a178b1ea462f5dc278`; `engine.mjs` blob `41679f7328a42e379fdfb8de5b92006e1bfb529f`. **Mode MIGRATION_ONLY**.

## Findings tied to source

1. `queueTargetedSkill` (13878) creates `pendingTargetedCast`; `queueBoardSkillV453Dev69` (4434) separately creates `pendingBoardV453Dev69`. Their ordinary queues are not mutually exclusive in the inspected branches.
2. `resolveCombat` (17875) resolves Board before Targeted. When Board consumes Nami W at simulated time t0, Targeted fails `castGateV39` due to cooldown, then uses `if(!gate.ok)continue;` (13923), which does not clear stale pending intent.
3. `actionLocksV40` is keyed to `now` (2568), so it cannot by itself prevent the stale intent from casting at a later tick. **The full second cast is still a source-derived hypothesis until a Node baseline run confirms it.**

## Implemented audit test, not gameplay engine

- `s09_nami_w_stale.test.mjs` (Git blob `eec3732e024fbee3517041d9f92f9862d01e5ad2`) plans **4 cases**: two seats × two queue orderings. It checks foreign-seat denial, no debit when queuing, first cast 70 mana, no same-tick double charge, pending after initial CD failure, and possible second debit after advancing gameTime past W cooldown. It records simulated time, resource and pending-state deltas and snapshot checksums, and writes `s09_nami_w_stale.local.json` **only if run**. It is intentionally an oracle for potential *legacy debt*, not a desired Rust parity requirement.
- `S09_NAMI_W_INTENT_CONFLICT.json` and `S09_NAMI_W_RUST_CONTRACT.json`: grounded source chain and design-only Rust fix (server-bound owner+slot arbiter, idempotency, no ghost cast across ticks, explicit exception versus baseline).
- `golden_plan.json`: **26 tests planned, 0/26 Node gameplay executed**. `inventory_slots.json` remains **865 IDs: 234 implemented, 366 partial, 265 absent, 0 reference-only**; no Rust promotion.

## Executed QA

- 15/15 static anchors PASS against actual pinned engine blob, source code.
- `node --check` for S09 test PASS, Node v22.16.0 and uploaded Git blob equals local blob `eec3732e024fbee3517041d9f92f9862d01e5ad2`.
- Local `curl` to raw.githubusercontent.com still DNS-fails. No complete engine checkout. Node real **NOT_RUN**; Rust native **NOT_RUN**; WASM **NOT_RUN**; PvP two browser sessions **NOT_RUN**. Cannot certify G0, G6, G8.

## Next S10 and cross-chat handoff

- Obtain remote/pinned Node execution for the **26** planned test sources; preserve failed test status rather than fabricating evidence; write actual blue/red traces and compare source SHA.
- For Nami W specifically distinguish known static chain from measured delayed cast; separate characterization of buggy source from corrected Rust behavior. Only then request `core-champions/core-combat/core-clock` interface on central branch; no Rust gameplay authored in audit branch.
- Keep original JavaScript frozen. Do not merge PR #9/#19, use Actions/Codespaces or modify other branches without approved necessity.

**Rollback:** revert only the S09 commit on `dev69/m45-audit-skills`.
