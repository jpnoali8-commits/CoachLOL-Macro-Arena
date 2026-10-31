# M45 — B02B-ITEMS B12F: Annul state + integrated item-runtime transactions

**Date:** 2026-10-30. **Branch:** `dev69/m45-audit-items`. **Source JS:** `engine.mjs@e06cfe0c18ded3d21f7a1d9bc62909543ccbbb6d`.

## Executed source evidence
Actual unmodified Arena JS: **236 steps across 56 independent cases** in blue and red, 3 Annul items. Calls include real `buy`, `applyEffectV41`, `damage`, `refreshItemAnnulV453Dev69Batch2`, `sellItemV43`, `undoShopV453Dev61`. Proved zero source exceptions. Fixture `crates/core-economy/tests/fixtures/b12f_annul_source.tsv`; detailed QA `QA_V8_ANNUL_LIFECYCLE_B12F.json`.

## Rust code authored
- `core-items/src/annul.rs`: Frozen 3 specs, Verdant 60s and Banshee/Edge 40s.
- `core-economy/src/annul.rs`: Deterministic shield layers, 1e12 until, active-layer gate, consume/spell block, champion damage cooldown reset, death/respawn, shop upgrade preserved cooldown, sell expiration.
- `ItemRuntimeShop`: Clones and stages AtomicShop + AnnulState + MercuryState; buy/sell only commit after all checks. Undo restores effect state and gold/items if unchanged; Mercurial Scimitar sell cancels sprint and undo restores it.
- `crates/core-economy/tests/annul_b12f_source.rs`: Native Rust differential test of 236 JS source rows.
- **8 Rust tests defined, NONE EXECUTED**. Cargo/rustc still missing in this environment. Must not claim native PASS.

## Integration limits
This is isolated Rust logic, not the server. No full action journal, canonical full-unit fingerprint, real attacker ownership/damage gate, replay/reconnect, core-combat or WASM; only 3 of many item passives. Source JS remains authoritative until certified. The Rust match actor must derive all inputs from server-owned state and atomically append events with cooldown/inventory. No Actions, no merge, original branches untouched.
