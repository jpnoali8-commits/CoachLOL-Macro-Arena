# M45 B02B-I13 — accepted-only receipts + off-CI source audit

Date: 2026-10-30. Base HEAD: 3100812dc826d93cd025bb466a77bb688d2ce44f. PR #19 Draft.

## Security repair

Previous `SkillAdmission::admit` inserted rejected request IDs into bounded `MAX_RECEIPTS=16384`; attacker could exhaust the whole match's future successful ACK capacity with malformed/duplicate-slot commands. This revision caches only `Queued` accepted receipts, with immutable replay/conflict; rejected commands are stateless and may be retried.

Four Rust unit tests added but NOT_RUN: flood > MAX_RECEIPTS both seats; denied slot same ID fresh turn; invalid request same ID corrected; valid ACK after rejected flood.

## Runtime evidence, not exaggerated

- Looked for rustc/cargo/rustfmt and offline rust installation; unavailable. DNS for Rust download unavailable. Native Rust/WASM/Cargo: **NOT_RUN**.
- Independent repository source-only audit was executed in V8 over exact GitHub Rust sources with patched admission code: PASS. Four deliberate corruptions were rejected. No Rust semantics/borrow checker/type checker was exercised.
- Offline Node source-check CLI and audit test **written to GitHub**, not run in container due lack of checkout. Skills Node 0/26; HTTP/SSE native NOT_RUN.
- Correct total Rust test declarations: previous 47 skills/session + 3 base lib.rs = 50, plus 4 = **54**, 0 executed.
- No GitHub Actions manually triggered; source-only QA cannot promote G1/G3/G6/G8. Rollback via revert this commit.