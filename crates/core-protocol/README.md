# CoachLOL Core Protocol — M45 PLATFORM-A17 (isolated prototype)

This crate is a new **Rust protocol admission prototype**, not the game server.
It is isolated on `dev69/m45-audit-platform` so the coordinator can review and
cherry-pick it without changing `dev69/rust-core-m45` unexpectedly.

Core rules represented here:

- Precisely two authenticated seats, blue and red, each with five owned roles.
- Server-derived seat grants, epoch binding, atomic multi-intent preflight,
  strict unsupported action rejection, role and coordinate validation.
- Full in-memory staged proposal via `stage_request` and a receipt for the
  complete accepted batch; immutable request-id receipt replay after `ready`.
- One ready vote per player, two votes seal the turn, and one next-round reset.
- Per-seat snapshot, opaque cursor text, and default-deny event DTO projection.

**Not implemented:** full game engine, ability/item interactions, PT-BR compiler,
JSON/HTTP transport, credential lifecycle/cookies, secure token hashing,
world fog, durable checkpoint/WAL, SSE sockets, browser/WASM entrypoint, or
any cross-branch integration. `submit` commits **in memory only**. Production
must stage and durably persist the authoritative world, receipt and events
before swapping state or sending ACK/SSE.

When the coordinator has Rust installed, run from a complete checkout:

```bash
bash tools/m45_platform_a17_rust_qa.sh
```

This runs 14 executable Node static guardrails, then `cargo fmt`, native
`cargo test` (36 tests defined), and `cargo clippy`. No Actions are triggered.
Cargo was absent when A17 was authored; native/WASM outcomes are **NOT_RUN**.

To integrate, add `crates/core-protocol` to the coordinator's Cargo workspace
**only after review**. Do not merge the platform audit branch blindly or
replace existing `core-state` code.
