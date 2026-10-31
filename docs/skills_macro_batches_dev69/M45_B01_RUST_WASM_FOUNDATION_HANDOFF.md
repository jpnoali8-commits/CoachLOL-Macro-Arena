# CoachLOL Macro Arena — M45 B01: Rust/WASM foundation (non-authoritative)

Parent: `dev69/integration` at `374d87d5f49b52514ec68bbe666df086363c1ec5`.
Isolated branch: `dev69/rust-core-m45`. Does NOT merge with main/integration, skills or items.

## Scope delivered
- New Cargo workspace and dependency-free crate `crates/core-state`, with typed Team/TurnGate, no intents stored or leaked, 2-party simultaneous confirmation, and a next-round gate.
- First narrowly bounded JS -> Rust deterministic algorithms: no-Smite contested objective tie-break (FNV-1a over UTF-16 code units), and simultaneous Smite contest. No real objective capture, gold, deaths, ownership or gameplay authority changed.
- Frozen TSV fixture from existing integration JS `resolveNoSmiteObjectiveV452d4Dev9`; Rust unit test and Node audit consume the SAME vector table.
- Primitive WASM C ABI for **public UTF-16 hashing only**, an input-checked JS adapter. No backend secret data, hidden champions or decision engine sent to browser.
- `engine.mjs`, `engine.browser.js`, game server, item/skill branches untouched. Browser remains a renderer, JS remains the ONLY active match authority.

## QA evidence at creation
- JavaScript authority golden corpus: **PASS 21/21** (18 no-Smite fixtures and 3 Smite contracts) against real integration engine functions in isolated V8.
- Public WASM adapter: JS syntax PASS, two simulated-memory hash checks exercised; NOT an executed Rust or WASM binary.
- Rust native compilation, `cargo test`, wasm32 build, compiled WASM execution, dual-run, browser and `npm test`: **NOT_RUN**. The toolchain is absent in the current environment.

## QA gates
1. `node tests/audit/v453_m45_rust_golden_js_pvp.test.mjs`: evaluates canonical JS golden input results; file designed for Node 22.
2. `cargo test --workspace --offline`: validates Rust unit tests including same goldens, TurnGate and Smite contract (requires native Rust toolchain).
3. `rustup target add wasm32-unknown-unknown`; `cargo build -p coachlol-core-state --release --target wasm32-unknown-unknown --offline`: compile the public WASM artifact. Exported ABI: version, alloc/free UTF-16, fnv1a UTF-16.
4. Parity/Browser confirmation remains pending: create actual cross-runtime dual-run and test compiled WASM before enabling use.
5. Do not claim exact Smite parity for non-ASCII actor IDs or arbitrary JS non-number inputs: this initial contract supports canonical ASCII actor IDs and integer seeds.

## Build note
Tooling of this isolated chat environment did not provide rustc/cargo or the wasm32 Rust target. Therefore native Rust tests and WASM compilation are **NOT_RUN** until performed with Rust toolchain; do not represent the crate as executable-certified. No Actions or Codespaces used.

## Release and rollback
- No live PvP switch, worker, bot, or player-visible route has been changed.
- Rollback is removal/revert of this isolated branch; existing JS runtime is untouched.
- Preserve PR #9 Draft and skills B33A published HEAD. B33B uncommitted candidate objects are not included.

## Next M45 B02
1. Add typed versioned snapshot/intent/receipt schemas and JS golden corpus with initial state + seed + two-sided ordered actions + final snapshot/event ordering.
2. Build a minimal Rust driver that consumes fixtures offline with no dual-authority side effects.
3. Compare native Rust and JS and compiled WASM results; add fixed-point schema only once a measured decision-equivalence gate passes.
4. Future move of individual mechanics under server-side feature flag only after fog, ownership, replay checksum and full regression.
