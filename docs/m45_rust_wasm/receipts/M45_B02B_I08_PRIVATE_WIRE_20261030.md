# M45 B02B-I08 — private Rust authorial wire registry

2026-10-30; PR #19 Draft, branch dev69/rust-core-m45.
Base commit: 94e22180623ca20477165221e9e9251ff508c1e8
Source skills: f0b1147ac46e585a1d5374a178b1ea462f5dc278

## Concrete changes
- New core-state/skill_wire.rs adds explicit source-pinned Nami W target_any and Ahri E line_enemy mappings. Unsupported champion+slot always rejects AbilityNotMigrated; never fall back to ground/directional arbitrarily.
- WireSkillRequest has no client-supplied shape or owner. ServerCastFacts must be constructed from private native match state, not JSON. Rule checks target team/fog for target_any, learned rank, resources, cooldown and range. These booleans are NOT computed by this prototype, and must not be trusted from packets.
- Existing SkillAdmission::admit becomes pub(crate), adds internal replay lookup; admit_authorial canonicalizes before checking ACK cache, then verifies fresh server facts. Duplicate ACK and changed-payload conflict are preserved.
- 6 Rust tests added for blue/red targets, Ahri direction/map click, negative unknown skills/aim/ownership/fog/readiness, and idempotent retries (total 15 Rust tests written).

## Strict QA
Rust native cargo/rustfmt/clippy: NOT_RUN; wasm32 runtime: NOT_RUN. No server/http/browser executed. 26 original Node suites: 0/26. Source provenance checked using existing frozen evidence; source-only validator to be run separately if available.
G0 PARTIAL, G1 PARTIAL (only B01 baseline), G3/G6/G8 NOT_RUN. No Actions manually triggered. Existing legacy authority remains JS.
Rollback: revert this single commit on Rust branch; source branches unchanged. Next B02B: validate registry boundary and source snapshots off-CI, implement authoritative descriptors/coverage in future crates, finish 26 Node and HTTP only when capable.