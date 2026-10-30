# CoachLOL Macro Arena — M45 B02 Skills S13

**Date:** 2026-10-30 · **Audit branch:** `dev69/m45-audit-skills` · **Frozen source:** `dev69/skills-batch2` @ `f0b1147ac46e585a1d5374a178b1ea462f5dc278`.

## What was actually authored

1. `s13_intent_arbiter_reference.rs` — isolated, dependency-free Rust model with six prepared unit tests. It models authenticated seat ownership, actor-slot exclusivity, request-ID ACK idempotency, payload conflict, turn sealing and terminal consumption. It **does not** implement gameplay, mana, cooldown, fog, networking, recasts or projectiles; recasts are explicitly rejected pending an authorial executor. This file is intentionally **outside the Rust production workspace**.
2. `s13_projectile_acceptance.rs` — typed Rust port with 13 distinct source-faithful Ahri E and Ashe R fixture scenarios per team (26 future real Rust acceptance executions), a required `AuthoredProjectileRunner` interface, and two **unexecuted** Rust data-integrity tests. It has **no implementation of the trait** and cannot prove combat parity.
3. `S13_RUST_ACCEPTANCE_MATRIX.json` — exact source pins, 13 × 2 parity routes, Ahri E adapter deliberate fix, Nami W ghost intent deliberate fix, stale Ashe M14 instant-stun/map-wall expectations, prerequisites and unreleased decisions.
4. `s13_validate_acceptance.mjs` — executable source-consistency validator. Its saved `validateInputs()` code ran against actual stored GitHub blobs in V8: **48/48 checks PASS**. This is **only static contract/source QA**.
5. `S13_STATIC_CONTRACT_RECEIPT.json` — distinct execution and missing compiler statuses.

## Critical Rust implementation contract

- **One authenticated seat → own five actors only.** Do not trust client-supplied team, owner or target visibility; server match actor owns ACL.
- **Per (match, turn, actor, slot):** at most one primary pending cast by seal. Same `request_id` + same canonical payload yields the cached ACK with no second resource/cooldown/impact; same ID + different payload rejects. Another ID, same actor+slot rejects until an explicit versioned replacement policy exists.
- **Sealed intent is immutable.** Commit one original cast once. Remove terminal pending records, retain replay receipts across reconnect. No cooldown-expiry replay of old Nami W.
- **Recast is not primary cast.** Require a registered active cast instance, phase/slot-specific policy, and no duplicate cost. The S13 reference model rejects it until the real `core-champions/core-combat` code handles that policy.
- **No generic incomplete skills.** Return `ABILITY_NOT_MIGRATED`; do not conjure fabricated damage.
- **Ahri E** must route normal command to its authored projectile once, unlike rejected legacy shortcut. **Ashe R** must travel and use real swept collisions, primary stun, minion exception and shield-aware splash. Separate legacy bugs from desired fixes.

## Decisions intentionally NOT made

- **Nami W authored rule selection:** the coordinator's independent source witness noted target-only W rank-1 heal **115** versus board-only **75**. Decide canonical W rules (bounce/passive/values) explicitly; no silent parity assertion.
- **Request receipt retention:** S13 prototype keeps them forever; real server must choose a bounded replay/checkpoint-safe retention policy.
- **Recast compatibility:** gate tests need authorial exceptions, including multi-form/recast and timing after seal.
- **Ashe M14 test:** old immediate-stun expectation and x=.65 map-wall case remain FAIL until source suite is explicitly updated and rerun.

## Test evidence and blockers

Source V8 ledger: original S10 **22 PASS / 2 FAIL / 2 NOT_RUN**, original full Node **0/26**; separate supplemental S11 **66/66 assertions** and S12 **438/438 assertions**, **34 scenarios**, **8 restore**. S13 source validator **48/48 static checks passed in V8**.

The coordinator's real Rust branch HEAD at inspection is `5afd330f260c7a0b1984521732e117dfcd81396f`. Only `crates/core-state` exists; `core-clock`, `core-combat`, `core-champions`, `core-map` etc. do **not** exist there. The local executor has **no rustc/cargo**, so **0/8 S13 Rust tests executed**, native Rust/WASM **NOT_RUN**, real two-seat HTTP **NOT_RUN**; **G8 NOT_CERTIFIED**.

No GitHub Actions, merge, rebase, branch production edit or engine change.

## Next action S14

If the coordinator has created `core-combat`/`core-champions`, adapt typed fixtures as real integration tests and run native + WASM without Actions if possible. Otherwise audit other high-risk authored special cases and continue shipping source-pinned Rust acceptance artifacts, while marking migration and production certification blocked. Coordinate through PR #19 without integrating this reference prototype as authoritative gameplay.
