# Chat 4 → Chat 1 — M45 PLATFORM-A14: per-seat SSE snapshot resync

**2026-10-30.** Fonte integration `374d87d5f49b52514ec68bbe666df086363c1ec5`; platform parent `b96fb8f9766e18068e730702b1692626059640fb`; Rust observado `5afd330f260c7a0b1984521732e117dfcd81396f`. Publicação exclusiva `dev69/m45-audit-platform`.

## Evidências executadas

- **14/14 PASS V8** em `tests/m45_platform_a14_legacy_sse_recovery.test.mjs`: Arena/gateway/Room originais. Reconexão envia um snapshot atual; não há cursor `id:`, `Last-Event-ID` ou journal; broadcasts sem mudança duplicam `revision`; ACK de ação recuperável após checkpoint/restore; evento anônimo `public:false` **vaza para duas equipes**, embora fog de unidades siga filtrado. **PASS de reprodução de falha ≠ segurança PASS.**
- **16/16 PASS Node 22 com disco real** em `tests/m45_platform_a14_sse_resync_reference.mjs` + `.test.mjs`, usando storage Node A13 e parser SSE A07. SHA dos 2 arquivos idêntico aos blobs do GitHub. Implementa **somente referência QA**, cursor `roomId/seatId/revision`, snapshot commit-only, whitelist de campos/eventos e cliente que deduplica. Casos: loss ACK após rename, perda antes do rename, reconnect, cursor adversário/futuro/inválido/gap, duplicação e UTF-8/chunks via parser.
- `A14_SSE_RESYNC_VECTORS.json` contém **30 vetores e 6 lacunas**; `A14_REPORT.md` tem prova e limites; runner `tools/m45_platform_a14_qa.sh` para checkout integral (**NOT_RUN**).
- HTTP/SSE real, navegador com dois jogadores, backpressure em socket, crash de processo, Rust/WASM **NOT_RUN**.

## Contrato de prioridade P0/P1 para `core-protocol` e `game-server`

**A. Cursor com commit:** o servidor só publica frame `state` com `committedRevision` derivada de checkpoint/WAL confirmados com receipt do comando/ready. Em falha de storage, nenhum evento/revisão especulativa. Quando ACK perde após commit, retry volta ao receipt idêntico sem reexecutar.

**B. Projeção por assento:** `AuthenticatedSeat` derivado de token/cookie confiável; `VisibleEventDTO` allowlist default-deny para unknown/anonymous, inclusive resync e replay. Nunca copiar `details`, `rngState`, `tokenHash`, ordens/posições ocultas, compra/Smite privado. Cursor não é senha/autenticação.

**C. Gap e duplicações:** `SseCursor(roomEpoch,seatId,committedRevision)`, renovado em nova partida; replay incremental opcional, snapshot autorizado obrigatório em gap/out-of-sync. Cliente descarta `revision <= lastRevision` dentro de mesmo epoch; ignora callback tardio da sala anterior. Repetir snapshot da mesma revisão no bootstrap é tolerável, sem executar ação.

**D. Transporte:** implementar backpressure/drain, quotas de streams, timeout, heartbeat e desconexão sem impacto nos demais jogadores. Nenhuma evidência Node HTTP real ainda. Testar dois humanos × cinco campeões, keepalive, lost ACK, disco, kill e replay no servidor Rust quando existir.

**Rust head visto:** árvore incluía somente `crates/core-state`; não havia `crates/core-protocol` ou `crates/game-server`. G0 PARTIAL; G1 programa PARTIAL; G3/G4/G8 NOT_CERTIFIED. Não ativar GitHub Actions para rotina; nenhum merge ou alteração em branches originais.

**Próxima prioridade Chat 4 A15:** tentar primeiro teste com duas conexões HTTP/SSE reais sem depender de Actions e, se possível, exercitar endpoints já implementados.
