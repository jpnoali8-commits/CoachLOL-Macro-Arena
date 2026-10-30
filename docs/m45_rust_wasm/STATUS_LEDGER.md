# CoachLOL M45 — Ledger de status e continuidade (fonte de verdade)

**Atualizado:** 2026-10-30, registro inicial do plano de migração completa.
**Programa:** M45_TOTAL_RUST_WASM_MIGRATION.
**Modo:** MIGRATION_ONLY (expansão JS suspensa por política de produção; avisar os demais chats).
**Status global:** NOT_CERTIFIED.
**Próxima prioridade:** M45 B02.
**Regra:** jamais mudar para MIGRATION_CERTIFIED sem G8, nem declarar PASS sem evidência.

## Git / branches conferidas

| Linha | SHA inicial conferido | Política |
|---|---|---|
| integration | 374d87d5f49b52514ec68bbe666df086363c1ec5 | JS golden/autoridade atual, sem alteração acidental |
| skills | f0b1147ac46e585a1d5374a178b1ea462f5dc278 | PR #9 Draft, preservar todos executores M44 |
| items | 182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d | preservar itens/receitas ainda fora da integração |
| migration | 7d344d2fac16b05a6e81c8984e38ce6ad2c907c3 | PR #19 Draft, branch dev69/rust-core-m45; **HEAD mudará com os commits do plano** |

Não assumir que estes SHAs continuam HEAD; consultar GitHub em TODA próxima operação.

## Milestones

| ID | Estado | Evidência |
|---|---|---|
| B01 core-state + WASM hash + 18 fixtures | IMPLEMENTED_UNVERIFIED | commit 7d344d2; JS goldens 21/21 PASS; Rust native NOT_RUN; WASM native NOT_RUN |
| B02 toolchain, compilação e inventário 3 branches | READY | nenhum commit de execução B02 |
| B03–B33 migração integral | QUEUED | consultar FILA_PRIORIDADES.md |
| G0 inventário fontes | PARTIAL | caminho/branch/arquivos conhecidos; símbolos não inventariados |
| G1 native WASM | NOT_RUN | toolchain cargo/rustc não encontrado neste ambiente |
| G2 replay/estado | NOT_RUN | nenhuma equivalência match Rust completa |
| G3 ACL/server | NOT_RUN | Rust server ainda não implementado |
| G4 parser/cliente | NOT_RUN | parser atual JS |
| G5 macro mundo | NOT_RUN | legado JS |
| G6 combate/conteúdo | NOT_RUN | legado JS |
| G7 Browser/ativos | BLOCKED | falta 78 runtime assets GitHub remotos Issue #1 + Rust server/UI |
| G8 migração final | NOT_RUN | depende de todos gates |

## Bloqueadores e riscos registrados

- BLOCK-001: Rust native/cargo/wasm32 toolchain não encontrado neste ambiente de execução. Não usar Actions ou Codespaces salvo necessário e registrado.
- BLOCK-002: 78 assets runtime binários faltando no GitHub remoto (Issue #1). É bloqueio de release/browser completo, não de core Rust.
- BLOCK-003: legado de skills e itens divergiu da integração; auditoria de union baseline ainda NÃO realizada (B02).
- BLOCK-004: B33B era candidato não commitado; não afirmar que está no git.
- BLOCK-005: JS legado em engine.browser.js gerado por script; mudar sistema de bundling sem gate quebra o browser.

## Transição entre tarefas

- Selecionar B02; carregar o último HEAD e verificar dependências.
- Antes do commit: implementar contrato, validar testes pertinentes, registrar problemas e rollback.
- Depois do commit: adicionar recibo em docs/m45_rust_wasm/receipts/M45_Bxx_*.md; atualizar esta tabela, FILA_PRIORIDADES.md e manifest.json.
- Se um gate falhar, atualizar para BLOCKED/FAIL e manter a MESMA prioridade, não pular pacote.
- Se a tarefa tiver sublotes, usar B02A etc; registrar progresso parcial sem declarar B02 concluído.
- Nenhum cronograma/ação futura é executado automaticamente; cada "próxima prioridade" do usuário aciona uma etapa dentro da conversa.

## Prioridade operacional exata

**M45 B02A:** verificar Rust native e WASM build a partir do B01; fixar versão toolchain, executar cargo test --workspace e compilação WASM real. Não disponível localmente? Documentar bloqueio e buscar caminho executável, sem falsificar.
**M45 B02B:** construir inventário de símbolos/efeitos/testes sobre os 3 SHAs, matriz machine-readable e baseline golden por branch.
**M45 B02C:** reconciliar diffs, reunir proveniência e checar rollback; fechar G0 e G1 conforme evidências, então liberar B03.

Este arquivo tem precedência de status sobre adendos históricos do AGENTS.md, mas não altera regras de produto nem ADRs existentes.
