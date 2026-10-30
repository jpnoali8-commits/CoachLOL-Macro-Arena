# M45 B02B-I06 — temporal spell intent lifecycle (Rust private, uncompiled)

Base head: 4bf98495e32dffb67cde32542f76af11d85a66f8
Date: 2026-10-30; branch dev69/rust-core-m45, PR #19 Draft.
Scope: improve isolated Rust admission prototype, not legacy gameplay implementation.

## Source-rooted defect and deliberate correction
Old next_turn cleared all pending without requiring commit/terminal. Temporal casts such as authored Ahri E require in-flight state beyond turn boundary. New transition refuses to advance with uncommitted primary and retains committed casts across turn boundaries; only an explicit retire removes them. Nami W pending remains a single seat/actor/slot record and cannot revive solely on cooldown.
Both sides Blue/Red exercise temporal lifecycle in new test. Mixed Blue and Red uncommitted state test ensures advance is denied. Existing cloned ACK test changed to commit and retire before advance.
New Rust unit test declarations: 2. Total: 7. All Rust unit tests remain NOT_RUN (cargo/rustc missing). This is a source review, NOT a Rust PASS.
Legacy GitHub fact check: Nami W target_any, Ahri E board_effect, 14 M44 authored champions absent from old BOARD_KITS property, all as previously pinned. No gateway/HTTP/browser retest or functional Ahri routing change.
Proof of code changes: static source checks check no pending.clear, guard on uncommitted, 7 test declarations, and pinned legacy facts; PASS. This is not a runtime test or certification.
No direct GitHub Actions triggered. Existing PR workflows have branch skip guards; check post-push. Do not spend any CI runner until end-of-phase full integration certification.
Gates: G0 PARTIAL, G1 PARTIAL previous B01 only, G2/G3/G6 NOT_RUN, G7 BLOCKED, G8 NOT_RUN.
Rollback: revert only I06 commit on Rust branch. Next: B02B complete Node ESM 26, actual HTTP/SSE, registry/client route reconciliation; compile all Rust at final integration gate.
