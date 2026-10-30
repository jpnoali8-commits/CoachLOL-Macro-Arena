# HANDOFF Chat 4 → Chat 1 — M45 PLATFORM-A03

2026-10-30. Base integration `374d87d5f49b52514ec68bbe666df086363c1ec5`, engine blob `1737f4f675bd9cc5ed0a48defc68b2fddc124d71`. Rust HEAD consultado `8a2d50f2d7189e16b467dcf4c546613a1d2c24c8`. Somente branch `dev69/m45-audit-platform` editada.

## Achado P0 reproduzido em V8
Execução isolada dos **métodos reais** `Arena.event` e `Arena.perspective` prova que evento sem team/unitId `public:false` é entregue ao time red. `details.internal` cru também, e `public:'false'` string truthy. Não é teste end-to-end de partida nem implica exploração real, mas evidencia falha de política.

## Artefatos entregues
- `A03_EVENT_CALLS.json`: 132 sites source-pinned, 20 sem equipe, somente 2 com public:true literal na chamada.
- `tools/m45_platform_a03_event_audit.mjs`: reprodutibilidade via Git blob SHA.
- `tests/m45_platform_a03_perspective_diagnostic.test.mjs`: 5 cenários isolados diagnósticos; PASS significa **LEGACY_GAP_CONFIRMED**.
- `tests/m45_platform_a03_reconnect_receipts.test.mjs`: 5 cenários de checkpoint, dual-seat, ACK pós-seal, sem resultados inventados.
- `A03_EVENT_VISIBILITY_RECONNECT.md`: especificação e execução.

## Solicitações concretas para Chat 1
1. No `core-protocol`, `VisibleEventDTO` com enum `Public/TeamPrivate/Observed`, ACL e whitelist por kind. Não permitir public truthy nem evento anônimo default-public; preservar anúncios de Nexus/objetivos com classificação explícita.
2. `game-server`: receipts idempotentes para action **e ready**, persistência+replay after seal; SSE cursor/Last-Event-ID e projection filtrada em snapshot/evento/reconnect; rate-limit/TTL.
3. Migrar produtores de eventos com proveniência por linha, auditar 132 calls e conciliar 20 casos sem time.
4. Não declarar G3 PASS com testes de eventos falsos ou isolados. Testar duas sessões completas e lado azul/vermelho após contratos Rust e asset gate.

TESTES: extração V8 real executada; inventário fonte executado; GitHub publicação verificada. Node/full repo, Rust, WASM, browser NOT_RUN. G0 PARTIAL, G3 GAP_CONFIRMED_LEGACY/NOT_CERTIFIED, G7 BLOCKED.

NEXT: reexecutar scripts no checkout completo e adicionar vetores de eventos/visão reais, gate de reverse-ready, logs/SSE/integração TS após contratos do Chat 1.
