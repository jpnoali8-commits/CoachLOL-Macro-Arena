# Chat 4 → Chat 1 — M45 PLATFORM-A15: duas conexões HTTP/SSE Node reais

**2026-10-30.** Platform branch `dev69/m45-audit-platform`, source `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`. Rust HEAD observado `ddbdf8e9ee4345646c70162c1637e5b08670708a`.

## Resultado novo comprovado

**24/24 PASS em Node v22.16.0 com sockets reais 127.0.0.1 e arquivos de checkpoint reais.** Teste `tests/m45_platform_a15_http_sse_reference.test.mjs` publicado com **SHA idêntico ao arquivo executado localmente**: `25f70acf6d491d8f9b598f39f607df8960a48e73`. Usa store QA A13, resync QA A14, decoder A07, `http.createServer`, dois clientes `fetch` com cookies distintos. Avalia autorização, SSE simultâneo, transações/ACK idempotente, conflitos, limite de dois streams, reconnect e cursor estrangeiro, perda de resposta depois de rename e falha antes de rename, restart, ready exatamente uma vez.

**Backpressure testado por injeção de `res.write => false`** no socket azul. O socket lento é desconectado; o vermelho recebe atualização normal. **Kernel saturation / drain loop real NOT_RUN.**

**ALERTA FUNDAMENTAL:** o servidor local de 24 testes é **somente referência de QA**, com tokens constantes e comandos `order.stop/ready`. Não é `multiplayer/server_v453_dev47.mjs` original, não é engine LoL, nem `game-server` Rust. Testes de HTTP originais A02 e A07, preparados para checkout real, continuam **NOT_RUN**. Nenhuma credencial/semântica de autenticação de produção certificada.

## Artefatos

- `tests/m45_platform_a15_http_sse_reference.test.mjs`: 24 asserts Node com rede real e dependências QA publicadas A07/A13/A14.
- `A15_HTTP_SSE_TWO_SEATS_VECTORS.json`: 24 vetores e sete gaps source-pinned; escopo, checks executados e limites.
- `tools/m45_platform_a15_qa.sh`: execução Node sem Actions.
- `A15_REPORT.md`: recibos e contratos desta etapa.

## Demandas ao coordenador Rust

1. **P0 transporte autoritativo:** implementar `core-protocol` + `game-server` reais; fonte Rust observada ainda contém somente `crates/core-state`. Não declarar G3/G4 enquanto HTTP/sessão/SSE/LoL não executarem em Rust.
2. **P0 commit-only SSE:** checkpoint/WAL + receipt + revision devem ser duráveis antes do evento/ACK. Lost ACK => receipt idêntico, sem recomputar ação.
3. **P0 fog/privacidade:** `VisibleEventDTO` default-deny em sessão, stream, resync e replay; eventos sem classificação são vazamento conhecido no legado.
4. **P1 cursor/quotas:** `roomEpoch/seatId/committedRevision`, seguro contra `Last-Event-ID` inimigo, deduplicação de revisões; limite de SSE por assento, backpressure, cancelamento e heartbeat sem bloquear o segundo humano.
5. **P1 ready:** primeira confirmação trava só seu jogador, segunda executa exatamente uma vez; retry de `ready` com `requestId` recupera receipt do checkpoint.

**Próxima prioridade Chat 4 A16:** obter checkout completo e rodar os goldens de servidor legado A02/A07 com socket real; depois ampliar testes para Rust quando existir a camada de transporte. Sem Actions nem merge; manter ramo exclusivo.

**Gates:** G0 PARTIAL, G1 baseline Rust/WASM core-state mas programa PARTIAL, G3/G4 Rust NOT_CERTIFIED, G7 BLOCKED, G8 NOT_RUN.
