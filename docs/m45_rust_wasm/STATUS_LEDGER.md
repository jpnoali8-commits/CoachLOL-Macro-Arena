# CoachLOL M45 — Ledger de status e continuidade (fonte de verdade)

**Atualizado:** 2026-10-30, B02B reconciliação estática dos 3 handoffs; PARCIAL.
**Programa:** M45_TOTAL_RUST_WASM_MIGRATION.
**Modo:** MIGRATION_ONLY (expansão JS suspensa por política de produção; avisar os demais chats).
**Status global:** NOT_CERTIFIED.
**Próxima prioridade:** M45 B02A (compilar/testar Rust/WASM); B02B goldens dinâmicos e conflitos semânticos pendentes.
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
| B02 toolchain, compilação e inventário 3 branches | IN_PROGRESS_BLOCKED | 3 handoffs consolidados, matriz estática com 1178 IDs e 891 referências test SHA; G0 PARTIAL, Rust/WASM NOT_RUN |
| B03–B33 migração integral | QUEUED | consultar FILA_PRIORIDADES.md |
| G0 inventário fontes | PARTIAL | três Git trees e 3 handoffs: 1178 registros estáticos em inputs/core/B02_UNION_MATRIX.json, sem golden dinâmico |
| G1 native WASM | NOT_RUN | toolchain cargo/rustc não encontrado neste ambiente |
| G2 replay/estado | NOT_RUN | nenhuma equivalência match Rust completa |
| G3 ACL/server | NOT_RUN | Rust server ainda não implementado |
| G4 parser/cliente | NOT_RUN | parser atual JS |
| G5 macro mundo | NOT_RUN | legado JS |
| G6 combate/conteúdo | NOT_RUN | legado JS |
| G7 Browser/ativos | BLOCKED | falta 78 runtime assets GitHub remotos Issue #1 + Rust server/UI |
| G8 migração final | NOT_RUN | depende de todos gates |

## Bloqueadores e riscos registrados

- BLOCK-001: rustc/cargo/rustup não instalados no executor; npm/node disponíveis. DNS externo indisponível para baixar toolchain; probe local executado com EXIT 42. Rust native, clippy, rustfmt, WASM build e WASM runtime NOT_RUN. Script tools/m45_qa_native_wasm.sh e rust-toolchain.toml preparados. Sem Actions/Codespaces.
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

## M45 B02A/B02B — execução parcial rastreada (2026-10-30)

- SHA da branch Rust antes da edição: `40e5598838bb4c2d4ec9d4a62c4f0acc30644aaf`. Git tree das três fontes lida com `recursive=1`, `truncated=false` em todos os casos.
- **integration**: 1653 blobs, 165 arquivos de teste (121 JS/TS); engine.mjs 459085 bytes.
- **skills**: 1858 blobs, 290 testes (246 JS/TS); engine.mjs 1117512 bytes. Em relação à integration: +205, ~8, -0 arquivos.
- **items**: 1657 blobs, 167 testes (123 JS/TS); engine.mjs 477933 bytes. Em relação à integration: +4, ~7, -0 arquivos.
- Índice machine-readable das diferenças, blobs e fontes: `docs/m45_rust_wasm/inputs/core/B02_GIT_TREE_INDEX.json`. Este é inventário **de árvores e arquivos**, NÃO prova que AST, skills/itens, efeitos, testes golden por branch ou cobertura funcional já tenham sido inventariados.
- Handoffs Chat 2/3/4: branches `dev69/m45-audit-skills`, `dev69/m45-audit-items`, `dev69/m45-audit-platform` não localizadas nesta verificação: **PENDING**, não bloquear o levantamento central.
- Ferramentas: `rustc`, `cargo`, `rustup` ausentes; tentativa de DNS para static.rust-lang.org e github.com falhou. `node --check` do teste WASM e `bash -n` do QA script: **PASS sintático**, NÃO compilação. `bash tools/m45_qa_native_wasm.sh`: **EXIT 42, BLOCKED_TOOLCHAIN**, build/test native e WASM **NOT_RUN**.
- O novo teste de WASM exige binário Rust de verdade e confere ABI pública, 18 vetores TSV e UTF-16; até executado, registrar NOT_RUN.
- **Status:** B02 IN_PROGRESS_BLOCKED, G0 PARTIAL, G1 NOT_RUN, G8 NOT_RUN. Próxima execução: resolver toolchain e rodar testes de verdade; continuar inventário de símbolos e golden por SHA, sem promover B03.

## M45 B02B — handoffs consolidados (2026-10-30)

- Chat 2 skills `6b8de5ec2906e9cab25c3b0205ed7572d370854a`: 865 slots, 63 símbolos mecânicos, 55 slots com múltiplos registros; golden runtime NOT_RUN.
- Chat 3 items `134b6260173d3b2d4e3a6ffa6317a40c361b8bfc`: 210 entradas, 3 locais, 8 métodos diferenciais; oráculo de 11 casos publicado mas **NOT_RUN**.
- Chat 4 platform `b7b8baf02d4a5dfacb15cd8679a94f2fe2841a06`: 29 contratos com paths verificados; golden duas sessões **NOT_RUN**.
- União com 1178 IDs únicos e proveniência por blob: `docs/m45_rust_wasm/inputs/core/B02_UNION_MATRIX.json`. **QA estático PASS** para 891 test SHA refs e 29 paths/blobs plataforma, 0 divergências conferidas. NÃO declarar runtime PASS.
- **Bloqueio revalidado neste ciclo:** `rustc`, `cargo`, `rustup` ausentes; `bash -n` e `node --check` PASS, probe QA EXIT 42, DNS `static.rust-lang.org` indisponível. Native e WASM NOT_RUN.
- **Próxima prioridade:** B02A e B02B goldens; B03 inelegível. G0 PARTIAL, G1 NOT_RUN, G8 NOT_RUN.
