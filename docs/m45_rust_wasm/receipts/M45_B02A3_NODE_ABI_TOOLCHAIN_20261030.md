# M45 B02A3 — Recibo técnico Node ABI e toolchain (2026-10-30)

**SOURCE_RUST_PARENT_SHA:** `8a2d50f2d7189e16b467dcf4c546613a1d2c24c8` (PR #19 Draft). **RUST_COMMIT_SHA:** consultar commit que inclui este recibo (SHA auto-referencial não é possível).
**SOURCE_LEGACY_SHA:** integration `374d87d5f49b52514ec68bbe666df086363c1ec5`; skills `f0b1147ac46e585a1d5374a178b1ea462f5dc278`; items `182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d`.

## Alterações reais

- Adicionado `tests/audit/m45_b02_public_adapter_contract.test.mjs` (blob testado exatamente `fa875c3e37b204a2124693291cdba7e82aa4f4f0`), quatro testes do adaptador real JS e ABI simulada por WebAssembly.Memory. Contrato público: FNV UTF-16, 18 fixtures, Unicode, reject inputs, allocation fail e finally cleanup.
- Atualizado `tools/m45_qa_native_wasm.sh` para executar **Node QA antes do teste Rust** e abortar corretamente se Cargo estiver ausente.
- Ledger, fila e manifest sincronizados; ingestão do handoff A02 e aviso PLATFORM-016 de possível leak de evento no JS, sem mexer em engine legada.

## QA de execução

| Comando | Evidência | Estado |
|---|---|---|
| `node --check tests/audit/m45_b02_public_adapter_contract.test.mjs` | Node v22.16.0 | PASS |
| `node --test tests/audit/m45_b02_public_adapter_contract.test.mjs` | TAP: 4 tests, 4 pass, 0 fail; fixtures 18 | **PASS (JS MOCK ABI)** |
| `bash -n tools/m45_qa_native_wasm.sh` | syntactic check | PASS |
| `bash tools/m45_qa_native_wasm.sh` | 4/4 Node PASS; `BLOCKED_TOOLCHAIN: missing rustc`, EXIT 42 | BLOCKED |
| `cargo test --workspace --all-targets --offline` | cargo/rustc not installed | **NOT_RUN** |
| `cargo fmt` / `cargo clippy` | rust toolchain absent | **NOT_RUN** |
| `cargo build --target wasm32-unknown-unknown` | target/binary unavailable | **NOT_RUN** |
| `node --test tests/audit/m45_wasm_binary_smoke.test.mjs` | real wasm binary unavailable | **NOT_RUN** |
| JS full legacy goldens skills/items/platform | original branches cannot be checked out via DNS | **NOT_RUN** |
| Browser + network privacy | no Rust server/browser assets | **NOT_RUN** |

**IMPORTANTE:** mock ABI NÃO equivale a WASM compilado. Nenhum PASS Rust afirmado.
**BLOCKER:** Rust/Cargo ausente, DNS sem resolução, sem Actions/Codespaces.
**HANDOFFs:** skills `135d01adc29f7135323176cff6fc5e3f972dfacb`; items `654f8e1f7afc65d97fb38f234aaf39c7227d15a3`; platform `540c950f5b9a94be9a47c9a6d5c3bc56e5bb0927` — leitura, sem merge. PLATFORM-016: **suspeita de exposição privada por evento sem team/unitId**; exigir red-team e política default deny Rust antes G3.
**GATES:** G0 PARTIAL; G1 NOT_RUN; G2–G6 NOT_RUN; G7 BLOCKED; G8 NOT_RUN.
**ROLLBACK:** revert deste commit (somente Rust branch) sem tocar PR #9, integration, items, main.
**NEXT_ELIGIBLE_TASK:** B02A Cargo/WASM real + B02B golden de origem; B03 QUEUED.
