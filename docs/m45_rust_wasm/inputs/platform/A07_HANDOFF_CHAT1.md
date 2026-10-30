# M45 Chat 4 → Chat 1 — PLATFORM-A07

**Data 2026-10-30.** Source integration `374d87d5f49b52514ec68bbe666df086363c1ec5`. Rust HEAD observado `6bb6d2cc7f58c1e4053170276eddf56ebba9ab36`. Branch `dev69/m45-audit-platform` somente. 
## Evidência efetiva

- **8/8 PASS em Node 22** para leitor de SSE; múltiplos frames/chunks, CRLF/UTF-8, ID, JSON inválido, limite bytes e EOF. No checkout: `tests/m45_platform_a07_sse_frames.test.mjs`.
- **13/13 PASS em V8 isolado com Arena+gateway+room ORIGINAIS**, snapshots separados por p1/p2, cinco unidades por team, broadcasts, cancelamento e reconexão, ready simultâneo e restore em memória. A injeção `arena.event('UNOWNED_A07_PRIVATE_CANARY')` chega a ambos mesmo `public:false`: **falha de segurança, não PASS de privacy**.
- `tests/m45_platform_a07_http_sse_restart.test.mjs` escreve golden de **11 cenários HTTP reais** com `createPvPServerV453Dev47`, duas sessões cookies/SSE, fechamento/reabertura do servidor, checkpoint em disco, autenticação e recibo pós-restore. **NOT_RUN** (sem checkout local; DNS GitHub bloqueado).
- `A07_TRANSPORT_GAP_MATRIX.json`: **12 invariantes** source-pinned, com status e severidade.

## Prioridade para o core-protocol/game-server Rust
1. Default-deny/whitelist `VisibleEventDTO`, mesmo filtro por seat em `/api/session`, SSE, resync/replay e notificações de combate.
2. `ReadyCommand(round,authenticated_seat,request_id)` e `JoinIntent` retry recovery; recibos persistidos+atômicos antes do ACK; não reeexecutar turno após reconnect.
3. SSE `event_id` monotônico por seat, cursor/gap snapshot seguro, desconexão/backpressure e limites de streams.
4. Rust incluir `ServerCheckpoint` não serializável para client, schema/version; distinguir `seated` de `online`.
5. Rodar A07 HTTP real e golden A06 com Node completo quando houver checkout. Sem isso G3 Rust continua NOT_RUN.

**Bloqueios:** rustc/cargo/WASM ainda indisponíveis, 78 assets de runtime pendentes no GitHub; G0 PARTIAL, G1 BLOCKED, G3 NOT_CERTIFIED, G7 BLOCKED, G8 NOT_RUN. Nenhum merge/alteração de branch central.
