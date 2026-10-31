# M45 B02B-ITEMS B12E: Mercury active Rust (source-locked)

Date: 2026-10-30, branch `dev69/m45-audit-items`; legacy source `engine.mjs@e06cfe0c18ded3d21f7a1d9bc62909543ccbbb6d`.

## Delivered
- `crates/core-items/src/active_items.rs`: 2 immutable active-item specs; frozen 90s shared cooldown, 25%/1.5s Scimitar sprint, 13 CC kinds.
- `crates/core-economy/src/active_items.rs`: server-parameterized deterministic active mutation, copy-before-commit, seat, decision, phase, HP, stasis, cooldown gates; preserves knockup, cleans suppression.
- `crates/core-economy/tests/mercury_b12e_source.rs`: 112-step source-pinned golden from `Arena.activateItemV453Dev59`.
- `crates/core-economy/tests/fixtures/b12e_mercury_source.tsv`: actual source V8 observations.

## QA evidence
**112 source JS V8 actions executed (64 accepted, 48 denied), zero exceptions**, across 28 scenario types × 2 teams × 2 items. **Five Rust tests WRITTEN, NOT EXECUTED**, as cargo/rustc unavailable. `QA_V8_MERCURY_B12E.json` records source results and limitations.

This is not full item effects migration: no other item passives, server actor, event/replay receipts, inventory-runtime atomic integration, WASM, native compilation or match certification. The Rust actor must derive context from the authenticated seat and integrate status effects atomically with core-combat. Legacy JS engine and coordinator branch untouched. **GitHub Actions 0**.

Next: B12F integrate active effects with item transaction lifecycle and migrate Annul family, then compile natively once toolchain is available without burning Actions.
