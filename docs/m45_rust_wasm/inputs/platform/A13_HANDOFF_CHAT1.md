# M45 Chat 4 → Chat 1 — PLATFORM-A13: checkpoint, ACK e falha de persistência

**Data:** 2026-10-30. Legado `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`; Rust core observado `5afd330f260c7a0b1984521732e117dfcd81396f`; branch Chat 4 `dev69/m45-audit-platform`.

## QA executado

- **6/6 PASS V8 fonte original**: `m45_platform_a13_room_persist_faults.test.mjs` reproduz exceções `persist()` pós-mutações: comando/recibo/revisão na RAM sem checkpoint; primeiro ready fica bloqueado na RAM e ausente no restore; segundo ready executa em memória sem persistência; `advance(5)` aumenta gameTime não salvo; não há broadcast depois da exceção. **Diagnóstico de defeitos**, NÃO garantia de segurança.
- **14/14 PASS Node 22 + arquivos temporários reais**: `m45_platform_a13_durable_reference.mjs` e `.test.mjs` são **referência QA autossuficiente**, com `fsync` de arquivo/diretório, `rename`, restart do leitor, conflito de requestId, falha antes/depois do commit, ready sequenciado e perspectiva por seat. SHA GitHub correspondeu **2/2** aos arquivos executados. Teste de kill real de processo, ENOSPC e duas conexões de rede: **NOT_RUN**.
- `A13_DURABLE_CHECKPOINT_VECTORS.json`: **20 vetores** + riscos/ordem de commit; `tools/m45_platform_a13_qa.sh` executa as suítes num checkout, mas ainda **NOT_RUN**.

## Prioridade P0 para Rust

1. `core-protocol`: `AuthenticatedSeat`, `CommandReceipt` tipados e idempotência por `match,round,seat,requestId`, payload canônico e expected epoch. Nunca transportar autenticação por `team` escolhido no client.
2. `game-server`: aplicar batch/ready/tick em transação staged incluindo **Arena inteira + RNG + eventos + histórico + receipts + revision**; commit durável antes de liberar memória visível, ACK e SSE. Se persistência falhar antes do commit, **nenhuma mutação global observável**. Se commit ocorrer mas ACK se perder, **devolver mesmo receipt** após reconnect/restart.
3. Implementar checkpoint/WAL com `fsync`/transações adequadas e testar kill/ENOSPC/corrupção/concorrência de escritores. O modelo Node usa um único processo e não é banco de dados nem blueprint de produção.
4. `ready`: duas confirmações causam uma única resolução. Testar falha antes da gravação do último ready, pós-commit antes de resposta e restaurar fase correta.
5. SSE e sessão: publicar somente a perspectiva filtrada por assento com `VisibleEventDTO` default-deny; recuperar cursor ou snapshot seguro, nunca checkpoint cru. **Problema anônimo do legado continua sem correção**.

**Bloqueio atual:** árvore Rust tem apenas `crates/core-state`; `core-protocol`/`game-server` ainda ausentes no HEAD consultado. G1 programa PARTIAL, G3/G4 Rust NOT_CERTIFIED, G7 BLOCKED e G8 NOT_RUN. Não houve Actions nem merges.

**Próxima prioridade Chat 4: A14** — contratos de SSE resync/replay depois de perdas de ACK, checkpoint e privacy no retorno de cada assento.
