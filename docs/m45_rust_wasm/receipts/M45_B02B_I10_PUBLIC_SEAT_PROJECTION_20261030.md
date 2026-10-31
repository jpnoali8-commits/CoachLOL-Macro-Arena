# M45 B02B-I10 — Rust seat-scoped public projection (not certified)

Date: 2026-10-30. Parent: d75cb818533bf637979f9f48c3cb98d3041615e6. PR #19 Draft.
New private-to-public boundary: snapshot world only -> visible own/enemy units, ownMana for own team, conservative visible-impact event. Private orders, target IDs, objective RNG and raw impact damage are never included.
Public serializers explicitly build allowed JSON keys; all string fields escape control characters to prevent SSE injection. Stable unit sorting. No generic serialization of raw state.
9 Rust tests **DECLARED** (total 32), **0 executed**. Cargo/rustc missing from local container. V8 source audit is not Rust, WASM or HTTP gameplay certification.
Security limitations: the caller must supply authenticated team; no actual server/session integration; no old event-time visibility, realm/terrain/fog propagation; event suppression may hide legitimate old combat events.
Original JS PvP remains authoritative. Original Node skills 0/26, HTTP/SSE Rust NOT_RUN, WASM NOT_RUN. No Actions manually invoked, all inherited PR checks expected skipped.
Migration G0/G1 PARTIAL, G3/G6/G8 NOT_RUN, B02B IN_PROGRESS; no merge, rebase or force-push.