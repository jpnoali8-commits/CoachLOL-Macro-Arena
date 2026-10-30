# M45 B02A7 — falha rustfmt real e correção segura Rust-only (2026-10-30)

**BASE CENTRAL:** `91fda60e81d44e7b08bc06874094fc38c24d5fef` — PR #19 Draft. **SOURCE LEGACY:** integration `374d87d5f49b52514ec68bbe666df086363c1ec5`, skills `f0b1147ac46e585a1d5374a178b1ea462f5dc278`, items `182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d`.

## Resultado real, conferido em GitHub Actions #41137201572

- Job ID `124342476724`, conclusão **FAIL**. Toolchain `rustc 1.85.1`, `cargo 1.85.1`, wasm32 instalado: **PASS**.
- `cargo test --workspace --all-targets --offline` → **3/3 PASS**, executado no runner Ubuntu.
- `cargo clippy --workspace --all-targets --offline -- -D warnings` → **PASS**.
- `cargo fmt --all --check` → **FAIL, exit 1**; o fonte Rust não corresponde ao rustfmt 1.85.1.
- `node tests/audit/v453_m45_rust_golden_js_pvp.test.mjs` → **21/21 PASS**, JS original SHA pinado.
- `sourceSnapshot` `23/23 PASS`, `adapter` `4/4 PASS`.
- `cargo build -p coachlol-core-state --target wasm32-unknown-unknown` → **NOT_RUN** devido ao fmt; binary smoke → **NOT_RUN**. G1 => **FAIL**, não PASS.
- Artifact ID `13016518122`: `m45-b02a5-rust-wasm-qa`, arquivo m45-qa.json com status literal, output e commit.
- URLs: `https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/41137201572`.

## Submissão corretiva B02A7

- Workflow existente `.github/workflows/m45-b02a5-one-shot.yml` atualizado APENAS na branch Rust. Gatilho mantido por path exato `docs/m45_rust_wasm/qa/trigger_b02a5.txt`, sem disparo por PR/merge/main.
- Novo job Rustfmt só pode **modificar o arquivo `crates/core-state/src/lib.rs`**, verifica `git diff --check`, verifica branch exata e reescreve código via **rustfmt real 1.85.1**. Faz commit normal, push fast-forward sem force e aborta se houver conflito de branch.
- Depois executa o runner `tools/m45_qa_evidence.mjs`, QA Rust/WASM real e artifact com `verified_commit_sha.txt`.
- Workflow possui permissão `contents:write` somente no job por necessidade técnica; reduz superfície de escrita com validação de path. Não altera integração, main, PR #9, engine JS ou branches dos especialistas.

**CI B02A7 PENDENTE:** a aprovação da formatação, build WASM e smoke depende de execução real, logs e artifact. Não afirmar PASS a partir de fonte apenas.

**GATES:** G0 PARTIAL; G1 FAIL (fmt) até revalidação; G2–G6 NOT_RUN; G7 BLOCKED; G8 NOT_RUN.
**ROLLBACK:** git revert de commits da branch Rust, nunca force-push ou merge. **NEXT:** consultar run B02A7, SHA de formatação e G1; se FAIL corrigir erro concreto sem pular prioridade.
