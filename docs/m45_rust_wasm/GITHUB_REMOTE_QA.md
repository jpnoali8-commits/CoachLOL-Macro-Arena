# M45 B02A5 — GitHub-hosted, sem projeto no PC

O usuário trabalha via ChatGPT + GitHub. **Não exige clone, Node ou Rust local.**

- Workflow único: `.github/workflows/m45-b02a5-one-shot.yml`.
- **Gatilho:** somente um `push` na branch `dev69/rust-core-m45` contendo `docs/m45_rust_wasm/qa/trigger_b02a5.txt`. Não escuta todo push, PR ou main. A branch original `dev69/integration` segue sem alteração.
- 1 job Ubuntu, timeout 10 minutos, permissões `contents:read`; instala Rust 1.85.1, Clippy, rustfmt, wasm32, Node 22, executa `node tools/m45_qa_evidence.mjs --receipt artifacts/m45-qa.json` e sobe recibo no artifact, mesmo se o passo falhar.
- Não instala pacotes do jogo, não usa browser/78 assets nem toca gameplay legado. Não altera branch skills/items, PR #9 ou faz merge. **Executa automaticamente somente se Actions estiver habilitado no repositório.**
- Se Actions desabilitado por cota/configuração, o push pode não disparar job: `REQUESTED_NO_RUN_CONFIRMED` é diferente de `PASS`. Não iniciar tentativas repetidas até conferir capacidade.
- O workflow é programado para registrar `G1=PASS_BASELINE_ONLY` somente se `cargo test`, fmt, clippy, target wasm, build binário e smoke real aprovarem. Os testes mock e de snapshot JS não contam como Rust.
- O QA local ChatGPT (Node com subset do repositório) testa `tests/audit/m45_b02_legacy_smite_snapshot.test.mjs` (18 seeds no-Smite + 3 simultâneos + pin de fonte), mais quatro testes de contrato e quatro checks de política = **30/30 PASS**. O snapshot é uma cópia dos dois resolvedores legados congelados; só com `engine.mjs` presente o teste confere SHA e corpo exato do arquivo inteiro.
- Lembrete: `G1 PASS_BASELINE_ONLY` não certifica G2–G8, nem valida servidor de partida, rede, browser e catálogo de skills/itens.

**Fonte do snapshot congelado:** `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`, blob `engine.mjs=1737f4f675bd9cc5ed0a48defc68b2fddc124d71`.

**Rollback:** revert do commit do gatilho e da documentação de QA somente; nunca force-push/rebase/merge em main.
