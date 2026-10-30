# COMEÇAR AQUI — M45 Migração completa Rust/WASM

**CoachLOL Macro Arena — decisão de 2026-10-30.**

Este diretório é o protocolo canônico para a migração de todo o GAMEPLAY LEGADO e servidor PvP a Rust, com WASM apenas para cálculos públicos seguros e UI TypeScript/HTML/CSS.

## Comandos que o usuário pode dar

- **"próxima prioridade" / "prossiga"**: leia STATUS_LEDGER e FILA_PRIORIDADES e EXECUTE a primeira tarefa elegível (código, teste, commit, recibo). Não pedir autorização adicional para cada etapa técnica habitual.
- **"status da migração"**: audite GitHub HEADs, matriz/ledger/gates e informe % de cobertura realmente comprovada, não invente porcentagens.
- **"audite"**: rode gates ou faça auditoria específica; não marque PASS por inspeção sem executar.
- **"me dê prompt para outro chat"**: entregue prompt de PROTOCOLO_PROXIMA_PRIORIDADE.md.

## Ordem de leitura obrigatória

1. [STATUS_LEDGER.md](STATUS_LEDGER.md) — estágio real, HEADs, testes executados e bloqueadores.
2. [FILA_PRIORIDADES.md](FILA_PRIORIDADES.md) — ordem B01–B33+ e pré-requisitos.
3. [PLANO_MESTRE_MIGRACAO_TOTAL.md](PLANO_MESTRE_MIGRACAO_TOTAL.md) — escopo, fases e condição para voltar às skills.
4. [ARQUITETURA_ALVO_E_CONTRATOS.md](ARQUITETURA_ALVO_E_CONTRATOS.md) — divisão Rust native/WASM/UI e protocolo.
5. [INVENTARIO_FONTES_E_MATRIZ.md](INVENTARIO_FONTES_E_MATRIZ.md) — 3 árvores, origem de feats e risco de perda.
6. [GATES_QA_E_CERTIFICACAO.md](GATES_QA_E_CERTIFICACAO.md) — evidência, certificação e veto à regressão.
7. [PROTOCOLO_PROXIMA_PRIORIDADE.md](PROTOCOLO_PROXIMA_PRIORIDADE.md) — como executar e handoff.
8. [COORDENACAO_CHATS_E_GIT.md](COORDENACAO_CHATS_E_GIT.md) — mensagens para congelar outros chats e não fazer merge destrutivo.
9. [manifest.json](manifest.json) — estado máquina legível da fila; sincronizar com ledger.

## Política definitiva de produção

**MIGRATION_ONLY até G8**. Não criar novas habilidades/itens JS; congelar e preservar tudo que já foi produzido, incluindo 3 branches, testes, assets, patches e códigos parciais.

Migrar TODO comportamento já IMPLEMENTADO na origem escolhida (não exigir completar todos os 170+ kits antes de migrar). Features reference-only e incompletas continuam honestamente registradas.

**MIGRATION_CERTIFIED** = nenhum gameplay JS no runtime + servidor Rust real + UA/ownership/fog + replay + golden + UI/browser + assets/rollback + todo legado reconciliado. Depois: **M46+ produção de novos P/QWER/itens diretamente em Rust**.

## Estado inicial comprovado

- B01 codificado na dev69/rust-core-m45, PR #19 Draft: crate Rust core-state, TurnGate e regras Smite + 18 fixtures golden, adaptador WASM hash público.
- QA B01: JS 21/21 PASS. Rust native cargo test e WASM binário **NOT_RUN**, logo B01 **IMPLEMENTED_UNVERIFIED**.
- Próximo trabalho: **M45 B02**, começando por validar toolchain Rust e compilar B01 + inventário integral 3 branches.
- Integration JS permanece ativa e NÃO se mistura com Rust como autoridade.
- Falta 78 assets runtime no remoto e browser QA full; Issue #1 bloqueia release.
- PR #9 skills e branch items permanecem fontes preciosas. Não desfazer.
