# M45 B02B-I12 — room-snapshot/session authorization hardening

Parent 930188b6d424bdb5457a58fe2632df297fbdbddb. Date 2026-10-30. PR #19 Draft; migration Rust private source only.

Security gap 1: I11 SessionGate accepted any ServerSkillWorld, so valid bearer from one room could observe another room if caller wired wrong snapshot. I12 introduces trusted room IDs at world constructor and session gate constructor. Valid bearer + matching room required before JSON or SSE bytes. Unbound legacy world snapshots are explicitly rejected.
Security gap 2: I11 rotation accepted replacing a seat key by the same key, contradicting revocation/reconnect semantics. I12 explicitly rejects both same-seat and other-seat current key.
Tests: 5 Rust declarations added, 47 cumulative; previous I11 session tests adapted to room-aware constructors. All Rust runtime tests remain NOT_RUN because no cargo/rustc on container. Source checks not Rust certification.
Important limitations: future native game-server must assign room ID and session, generate cryptographic tokens with OS CSPRNG, enforce TLS, HTTP authentication, state source and origin/cookie policy. Room labels in this prototype can be created by Rust callers and are not proof of an actual network auth layer.
No change to legacy JS authority or PRs. No GitHub Actions manually launched. G0/G1 PARTIAL G3/G6/G8 NOT_RUN.