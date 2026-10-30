# M45 B02A5 — Recibo de QA isolado + GitHub runner acionado por path (2026-10-30)

**RUST_PARENT_SHA:** `7635edfb1558b20d5c7bf2e876b18b962e4b8738`. **RUST_COMMIT_SHA:** procurar commit que adiciona este recibo.
**PR:** #19 Draft `dev69/rust-core-m45`; nenhuma alteração em integration/main/skills/items.
**FONTE_FIXA:** integration `374d87d5f49b52514ec68bbe666df086363c1ec5`, blob `engine.mjs@1737f4f675bd9cc5ed0a48defc68b2fddc124d71`.
**USER_WORKFLOW:** apenas ChatGPT + GitHub; nenhum checkout/instalação no PC é necessário.

## Código publicado
- `tests/fixtures/m45_integration_smite_source_snapshot.mjs` (blob `5226234262b5ce9dfa10d61e40e6131b03530db5`), dois resolvedores JS de origem congelada.
- `tests/audit/m45_b02_legacy_smite_snapshot.test.mjs` (blob `3c23b2250b3f5e7dd2694a786af21aaf7f5cedd5`), exige correspondência de blob e no-Smite/Smite, quando possível faz comparação com engine full.
- `tools/m45_qa_evidence.mjs`: resultados independentes `sourceSnapshot` vs `jsGolden`; `source_snapshot_mode` explicita cópia isolada.
- `tests/audit/m45_qa_evidence_policy.test.mjs`: novo campo TASKS coberto.
- `.github/workflows/m45-b02a5-one-shot.yml` e `docs/m45_rust_wasm/qa/trigger_b02a5.txt`: um único evento push nesta branch/caminho, GitHub-hosted Ubuntu Rust+WASM, 10min máx, read-only, artifact de QA se executado. **Solicitação de job não significa que job foi executado.**
- `docs/m45_rust_wasm/GITHUB_REMOTE_QA.md`, STATUS_LEDGER, FILA, manifest, este recibo.

## Execução comprovada no ChatGPT container
- `node --test tests/audit/m45_b02_legacy_smite_snapshot.test.mjs tests/audit/m45_b02_public_adapter_contract.test.mjs tests/audit/m45_qa_evidence_policy.test.mjs` → **30/30 PASS**. Snapshots fonte isolada 22, adapter mock 4, gate policy 4.
- `node tools/m45_qa_evidence.mjs --receipt /mnt/data/m45_work/B02A_NO_USER_LOCAL.json` → **EXIT 42**; `adapter PASS`, `sourceSnapshot PASS`, `jsGolden NOT_RUN`, `native BLOCKED`, `fmt/clippy/target/wasmBuild/wasmSmoke NOT_RUN`, `G1 NOT_RUN`.
- `rustc`, `cargo`, `rustup` **ausentes**, DNS para distribuição Rust não resolve. Nenhum compilador executado localmente.
- A execução do job em GitHub **REQUESTED_NOT_CONFIRMED** até obter IDs de workflow, stdout e artifact; se Actions desabilitado, reportar bloqueio. Nenhum PASS Rust/WASM antecipado.

**GATES:** G0 PARTIAL, G1 NOT_RUN, G2–G6 NOT_RUN, G7 BLOCKED, G8 NOT_RUN.
**ROLLBACK:** git revert apenas deste commit no PR #19. Não merge/rebase/force.
**NEXT:** inspecionar execução do QA remoto e reconciliar resultados, ou permanecer B02A se não houve run; preservar B03 QUEUED.
