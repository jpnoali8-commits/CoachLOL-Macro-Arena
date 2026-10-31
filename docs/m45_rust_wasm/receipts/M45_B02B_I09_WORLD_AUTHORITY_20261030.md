# M45 B02B-I09 — private PvP world-backed ingress

Source branch: dev69/rust-core-m45; parent b7a44676dd64b6b2f89ba2e3fca680e531136d76; date 2026-10-30.
Purpose: replace trust in arbitrary caller-provided readiness/fog/team flags with Rust world-snapshot-derived predicates.

Scope: new core-state/skill_authority.rs, with server-owned ServerSkillWorld records, seat/actor/team identity, target visibility and alive, range i128, rank, server-authored mana cost and ready-at tick.
Existing low-level ServerCastFacts/admit_authorial narrowed to pub(crate). Public admit_from_world does not accept client-provided shape, champion or validation flags; it requires authenticated seat and world snapshot.
Known authorial mapping remains only Nami W / Ahri E. No fallback to generic skill effects. For directed Ahri E the world checks configured positive max range but trajectory and missile collision are future gameplay work; for point target it checks Euclidean range.
The test fixture max_range=600, mana_cost=70 are illustrative private world values and MUST NOT be claimed as authoritative live values for Ahri/Nami.
8 Rust tests newly declared, 23 total. Cargo/rustc absent: 0 executed. No real Rust/WASM/HTTP/SSE tests; original 26 Node suites 0/26. Source-only checks not a certified Rust PASS.
No new public client-private data exports. No full 5-vs-5 enforcement, fog propagation, chrono/realm, terrain collision, atomic mana/CD commit, snapshot persistence. G0/G1 PARTIAL, G3/G6/G8 NOT_RUN.
GitHub Actions not manually started. PR #19 remains Draft, original branches read-only. Rollback: revert single I09 commit.