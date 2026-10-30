# M45 Chat 4 → Chat 1 — PLATFORM-A16: endpoints legados originais executados

**2026-10-30.** Integração `374d87d5f49b52514ec68bbe666df086363c1ec5`; platform branch `dev69/m45-audit-platform`, Rust observado `056191eff45aa48167a79a36ffe3929b6e56eb48`.

## QA novo comprovado: 28/28 handlers HTTP originais

`tests/m45_platform_a16_legacy_http_handler.test.mjs` — **28/28 PASS V8**. O harness busca os arquivos legados exatos de Arena/gateway/Room/server e executa `createPvPServerV453Dev47` original, interceptando `http.createServer` com requests/responses falsos, heartbeat simulado e tokens criptográficos artificiais. Não usa rede real; os métodos de negócio, endpoint handler, projeções e resposta são os originais. Blobs `server=d6ed7a4b0dd30f2bf22c3d5876e3ac6b293ddf5d` e `test=248f1cc1e62207bbb2b1f3124b9263b15dedb040`.

Cobertura: /api/create,/api/join,/api/session,/api/action,/api/ready,/api/stream; dois humanos controlando 5 campeões; ACL e spoof, cookie 401, origem 403, sequence 409, ACK replay sem mutação, SSE por equipe, fechamento/reconnect e frame duplicado, body >8192, ready extra field.

**P0 comprovado na saída do handler original:** evento privado anônimo `Arena.event('A16_ANONYMOUS_PRIVATE_CANARY')` chega via SSE a azul **e** vermelho. **P1:** retry do segundo `ready` devolve 409 `confirmacao_indisponivel`, não o recibo anterior. **P1:** streams não possuem `id/Last-Event-ID`, e broadcasts sem mutação duplicam revisão. As mesmas questões A08/A13/A14 permanecem.

## Distinção das baterias

- A15: 24/24 **HTTP TCP real Node** usando servidor de QA, não fonte original.
- A16: 28/28 **código de handlers servidor legados originais** usando HTTP falso/V8, não TCP real.
- A02/A07: testes **prontos** para o processo HTTP original Node, mas **NOT_RUN** (checkout via terminal indisponível por DNS/saída bloqueados).
- Rust: apenas `crates/core-state` estava na árvore do HEAD observado, ainda sem `core-protocol` nem `game-server`. Não existe certificação Rust G3/G4/G8.

## Artefatos

- `tests/m45_platform_a16_legacy_http_handler.test.mjs` — 28 source-pinned checks.
- `docs/m45_rust_wasm/inputs/platform/A16_ORIGINAL_HTTP_HANDLER_VECTORS.json` — 28 vetores, 5 lacunas, hashes.
- `docs/m45_rust_wasm/inputs/platform/A16_REPORT.md` — diagnóstico com limitações.
- `tools/m45_platform_a16_qa.sh` — 3 suítes Node para executar com checkout, A16/A02/A07; **NOT_RUN** por falta do checkout.

## Próximas entregas do coordenador Rust (prioridade de execução, não de planejamento)

1. Criar `core-protocol` (tipos, ACL, receipts, `ReadyCommand`, `VisibleEventDTO`) e `game-server` (HTTP, SSE, persistência transacional e duas sessões).
2. Blindar privacidade P0 default-deny em todos os eventos visíveis e na reconexão; não reproduzir o vazamento legado.
3. Fazer `ready` idempotente e vincular respostas ao estado durável. Cursor SSE `roomEpoch/seat/committedRevision`, controle de backpressure.
4. Exigir execução das três suítes originais no Node (checkout real) e dos goldens Rust quando servidor nativo existir; **não usar GitHub Actions rotineiramente**.

**Gates:** G0 PARTIAL, G1 programa PARTIAL, G3/G4 Rust NOT_CERTIFIED, G7 BLOCKED, G8 NOT_RUN. Sem merge, force push, alteração de branches originais ou Actions.
