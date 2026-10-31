# CoachLOL M45 — Core protocol A18 security-hardening preview

This crate is a **protocol-only Rust prototype** on the independent platform
branch, **not** the authoritative server, JS replacement, or playable game.

## A18 changes relative to A17

- Caller must supply a stable, globally unique, validated `room_id` to
  `RoomProtocol::new(room_id, epoch, credentials)`; a server-issued authorization
  capability is bound to both room ID and epoch. This is a **breaking API change**
  to the unintegrated A17 prototype, intentional before production use.
- SSE cursor includes `room_id/room_epoch/seat/revision`, preventing rooms with
  equal epoch/revision from sharing the same cursor string.
- Default-deny on **event scope AND kind**: team-only OrderQueued and
  ReadyConfirmed, public-only TurnSealed. Unknown/unclassified or mismatched
  combinations are not projected, even if an upstream producer mistakenly
  marks private order details as Public.
- `stage_next_round()` clones the room and computes the new round without
  changing published state; an authoritative game server must still durably
  commit the whole LoL world and receipts before making this staged version live.
- 44 Rust test functions are defined (36 previous + 8 additional). They are
  **NOT_RUN** because this environment has no `rustc` or `cargo`.

## Boundaries

No actual HTTP cookie verification, cryptographic hashing, persistent state,
real full-game fog, champions, LoL combat, network SSE, or WebAssembly
compatibility has been certified. The test-only credential strings do **not**
constitute a production authorization system. A persistent unique `room_id` /
`room_epoch` pair must be generated and enforced by the authoritative server.

## Local Rust QA (when a compiler becomes available)

```bash
bash tools/m45_platform_a18_rust_qa.sh
```

The script executes Node static guards, checks formatting, runs all Rust unit
cases and then Clippy *offline*, without running GitHub Actions. For integration
into `dev69/rust-core-m45` the coordinator must amend its existing root Cargo
workspace members to include `crates/core-protocol` instead of replacing the
`core-state` workspace or cherry-picking the entire audit branch.
