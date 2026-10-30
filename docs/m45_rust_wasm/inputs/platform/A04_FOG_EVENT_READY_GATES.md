# M45 PLATFORM-A04 — Golden de fronteiras fog/eventos/ready

**Data:** 2026-10-30. **Fonte auditada:** dev69/integration `374d87d5f49b52514ec68bbe666df086363c1ec5` (`engine.mjs` blob `1737f4f675bd9cc5ed0a48defc68b2fddc124d71`, `multiplayer/room_v453_dev47.mjs` blob `3bdb8cd3b737d20e3700e994a8872943e53366ae`). Rust central consultado antes da operação, ainda M45 B02, sem contratos executáveis de core-protocol/game-server. Branch de escrita dev69/m45-audit-platform.

## Evidências EXECUTADAS

Foi executada em Code Mode/V8 a lógica **original** dos métodos `Arena.event`, `Arena.perspective` e `PvPRoomV453Dev47.confirm`, extraídos dos blobs GitHub com `Function` e objetos de teste controlados; sem executá-los como sala/server completos. Os campos e dados de entrada foram fabricados deliberadamente para verificar limites de autorização/visibilidade, NÃO dados de partida real.

- Visão azul ocultou `red_TOP` e `red_m1` quando `visible` retornava false; visão vermelha ocultou blue_TOP.
- Quando red_TOP se tornou visível, a projeção contém **somente** `id,team,role,champ,klass,x,y,hp,maxHp,mana,maxMana,level`; `items`, `order` e `debugSecret` não foram expostos.
- `wardKnownTo('blue','w_red')` permitiu a ward inimiga com `id,team,type,x,y,hp,maxHp` e sem campo privado.
- Camp normal oculto: `alive:null,unknown:true,knownRespawnAt:null`; Baron oculto mas com anúncio/respawn legítimo: `knownRespawnAt:500`.
- Eventos `team='blue'` foram omitidos da visão red; eventos `public:true` visíveis aos dois. Evento **sem team/unitId e public:false** foi incluído nas duas visões; `internalSecret` de um evento observado passou sem whitelist, e o campo `public:'false'` string truthy concedeu visibilidade.
- Simulação do método original `confirm(p)`: p1 ready retorna sucesso sem executar, retry de p1 retorna `confirmacao_indisponivel`, p2 ready inicia **uma** execução, retry de p2 retorna `confirmacao_indisponivel`. Isso demonstra ausência de idempotência explícita do ready no legado.

**Resultados acima são de METHOD_ISOLATION_V8, NÃO são testes integrados Node, servidor HTTP com dois cookies ou Chrome.**

## Arquivos reprodutíveis

- `tests/m45_platform_a04_visibility_matrix.test.mjs`: 7 verificações de método original `event`/`perspective` source-pinned; PASS esperado em legado inclui diagnóstico de falhas e NÃO certifica G3.
- `tests/m45_platform_a04_ready_receipt_diagnostic.test.mjs`: reproduce não-idempotência do ready source-pinned; esperado diagnosticar a falha, não afirmar que está resolvida.
- `A04_LEGACY_BOUNDARY_GOLDENS.json`: 11 comportamentos de referência com campos `observed_legacy` e `required_rust` separados. Resultados `FAIL_PRIVACY` e `FAIL_IDEMPOTENCY` são decisões conscientes: Rust deve divergir do legado para segurança.
- `A04_HANDOFF_CHAT1.md`: contrato revisado e prioridades.

## Contratos a implementar no Rust, sem portagem prematura de JS

**core-protocol:** `PublicSnapshotForTeam`, `VisibleUnitDTO`, `VisibleWardDTO`, `VisibleCampDTO` e `VisibleEventDTO` strict allowlist. `VisibilityClass = Public | TeamPrivate(team) | Observed(teams)`; atributo `public` boolean obrigatório (não truthy). Eventos de objetivo/estrutura/Nexus explicitamente públicos; skill/compra/Flash/ordem exigem owner ou observadores de visão; não expor `details` completos.

**core-clock/game-server:** ready como comando idempotente `(roomId,round,seatId,requestId)` com recibo persistido antes do ACK; replay idêntico retorna sucesso original mesmo após fase executing, enquanto comando novo após seal é rejeitado. `ready` é por **jogador**, não por unidade. Não usar cliente para fechar turno unilateralmente. Checkpoint preservar `ready`, `receipts`, `phase` e sequence do assento.

**reconnect/SSE:** autenticação por seat inferida da sessão, cursor por seat para eventos filtrados; gaps/expiry ⇒ novo snapshot somente da perspectiva autenticada; nenhuma memória privada, RNG ou ordem do adversário no payload. Ordem de confirm/retry/recuperação e versões de schema devem ser golden simultâneos em duas sessões isoladas.

## Testes ainda NOT_RUN e bloqueadores

- `node --check` e os dois scripts novos em um checkout completo — NOT_RUN (GitHub DNS não resolve no runner desta conversa; nenhum checkout local completo foi montado).
- Testes HTTP/SSE end-to-end com 2 cookies, checkpoint completo, Node engine — NOT_RUN neste ciclo.
- Rust native/Cargo/WASM/browser — NOT_RUN. Core Rust ainda sem protocolo/servidor integrados (B02; G1 toolchain bloqueado).
- Issue #1: 78 assets binários pendentes; G7 BLOCKED.
- Nenhum merge, nenhuma alteração em engine.mjs/server_v453/room_v453 original ou no ledger central.

Status **G0 PARTIAL; G2/G3 NOT_CERTIFIED**, com falhas de segurança/idempotência localizadas na referência; **G7 BLOCKED; G8 NOT_RUN**.

Próxima prioridade: executar testes de método em checkout completo, validar notificações reais em todos os 132 event sites e transformar contrato em testes de protocolo Rust quando o Chat 1 liberar B04/B06.
