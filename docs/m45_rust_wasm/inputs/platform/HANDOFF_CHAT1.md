# HANDOFF PARA CHAT 1 — M45 plataforma / primeira auditoria

Origem verificada: integration 374d87d5f49b52514ec68bbe666df086363c1ec5; contratos Rust consultados em 40e5598838bb4c2d4ec9d4a62c4f0acc30644aaf. Escrita exclusiva: dev69/m45-audit-platform. Data 2026-10-30.

## Entrega auditável

- AUDITORIA_INICIAL.md: entradas de servidor/sala/ACL, frontend, build, riscos PLATFORM-001 a 015 e limites da observação.
- MATRIZ_CONTRATOS.csv: contratos de HTTP, room, intents, receipts, visão, economy UI, comandos, draft, postgame, scripts e assets com SHA de origem.
- GOLDEN_DOIS_ASSENTOS.md: 10 cenários com oráculos existentes + comandos reprodutíveis, sem checksums inventados.
- tests/m45_platform_legacy_golden.test.mjs: teste de isolamento de assentos/5 unidades, fog, sequências e checkpoint; execução pendente.

## Dúvidas de contrato que Chat 1 deve resolver antes de integração

1. Envelope Rust: versionamento protocol/patch/schema, request_id idempotente + client_sequence por seat e state_revision; forma explícita de mapear sequence legado em retry após checkpoint.
2. Boundary de autorização: AuthContext criado no transporte; match actor não aceita team/owner do payload; request p/ unitId somente membro dos cinco IDs.
3. Turn clock: ticks inteiros e ordem determinística dos dois ready; tratar diferença entre tickMs e segundos simulados do servidor atual, sem alterar duração inadvertidamente.
4. Projection: PublicSnapshotForTeam(team) com política campo a campo (units, events, wards, spells, clones, pendingDecision, enemy orders, item inventory, perspective, reconnect, postgame) + teste red/blue e stealth.
5. Journal/SSE: state_revision, last_event_id/resume cursor, GAP -> full filtered snapshot, receipts persistidos/eviction, backpressure, ACK para command antes/depois seal, reload idempotente.
6. Pregame: proibir draft host local de alterar time adversário; decisões de bans/picks/summoners/runes validadas no servidor e trancadas antes de spawn.
7. Endgame: payload postgame com métricas públicas após conclusão e regras de divulgação de dados; não enviar arena.snapshotV40 cru durante gameplay.
8. Catalog: servidor fornece stats/patch/version/assets manifest; UI TS usa DTO para shop/Undo sem decidir preço/gold/range.
9. Security/ops: cookie Secure em HTTPS, rate limits, origem/CSRF, token revocation, checkpoints privados, serialização de eventos, room memory limits, sanitização logs.
10. Asset gate: Issue #1; 78 binários runtime + hashes antes do G7; não publicar screenshot parcial como certificação.

## Dependências e próxima tarefa elegível

Enquanto core-protocol/core-clock/game-server não estiverem implementados e com schemas definidos em dev69/rust-core-m45, Chat 4 prossegue no inventário automático de API/payloads, golden JS com duas sessões e testes adversariais de projections/reconnect; não altera engine.browser.js ou servidor em produção. Depois disso, criar adaptador TS e frontend Rust de forma incremental. A branch Rust central permanece somente leitura, e só o coordenador altera STATUS_LEDGER/FILA/manifest.

## Recibo M45-PLATFORM-A01

SOURCE_SHAS: integration 374d87d5f49b52514ec68bbe666df086363c1ec5; rust 40e5598838bb4c2d4ec9d4a62c4f0acc30644aaf.
INSPEÇÃO: GitHub source tree + 6 contratos M45 + servidor, room, gateway, client, app, commands, draft, postgame, sync, pacote tests, assets Issue #1.
VALIDAÇÃO: revisão estática e matriz; tests native Rust NOT_RUN; WASM NOT_RUN; Node golden novo NOT_RUN; browser 2 sessions NOT_RUN; CI NOT_RUN.
GATES: G0 PARTIAL (contratos plataforma inventariados; union 3 branches incompleta), G2 NOT_RUN, G3 NOT_RUN, G4 NOT_RUN, G7 BLOCKED (assets/integração), G8 NOT_RUN.
ROLLBACK: excluir commits exclusivos da dev69/m45-audit-platform; nenhuma alteração no legado original nem na branch central.
NEXT: expandir fixtures executadas e contrato Rust em coordenação com Chat 1.
