# M45 PLATFORM-A06 — Handoff Chat 4 → Chat 1

2026-10-30. Base `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`, branch de escrita `dev69/m45-audit-platform`; Rust HEAD observado `7635edfb1558b20d5c7bf2e876b18b962e4b8738`.

## Execução efetiva
- **10/10 PASS em V8 isolado** usando o motor LEGADO INTEGRAL (`Arena` + gateway dev44/dev47 + Room dev47, mapas/mask/manifest reais GitHub). Dois humanos × 5 campeões, dez `order.stop`, ACL, seq/ACK replay, fog nos dois lados, primeira/segunda confirmação, snapshot/restore e 1 tick real.
- Adaptações para V8: remover somente `import/export`; `structuredClone` do gateway trocado por clone JSON em payloads JSON simples. Teste registrado em `tests/m45_platform_a06_full_arena_pvp_golden.test.mjs`, que usa módulos Node originais quando houver checkout.
- **5/5 PASS em Node v22.16.0 local** com `tests/m45_platform_a06_sse_state_reader.test.mjs` e helper: chunking, comentários, CRLF, heartbeat, EOF e máximo de bytes; EXIT 0.
- Corrigido oráculo HTTP A02: o primeiro chunk SSE pode conter apenas `: connected`, antes de `event: state`. Novo leitor espera frame completo; timeout 7 segundos.
- **Não executados**: endpoint HTTP/SSE real; token/cookie SHA256, disco, dois browsers; Rust native e wasm. G2/G3 continuam sem certificação Rust.

## Contratos concretos para B04/B06
- Dois `seatId` autenticados, cinco `unitIds` por seat, ACKs de ação com idempotência persistida após seal/restart.
- `ReadyReceipt` também idempotente e transacional; o legado rejeita repetição e incrementa revision indevidamente quando o segundo ready falha.
- `VisibleEventDTO` restritivo: A03–A05 confirmaram eventos anonimos `public:false` atravessando fog no legado. Proibido serializar detalhes brutos de evento, RNG, plano/ward inimigos.
- SSE: parser resistente a chunks, `event_id` monotônico, resume/gap e limites/backpressure, sem entregar visão do outro seat.

**Gates:** G0 PARTIAL; G1 BLOCKED; G2/G3 Rust NOT_RUN; G7 BLOCKED; G8 NOT_RUN. Não promover `MIGRATION_CERTIFIED`. Não houve merge.

Próxima prioridade Chat 4: executar servidor HTTP/SSE em checkout completo e reconciliar status codes, reconexão/checkpoint disco e testes Rust quando contratos B04/B06 estiverem publicados.
