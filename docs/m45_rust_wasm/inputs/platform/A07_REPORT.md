# CoachLOL Macro Arena — M45 PLATFORM-A07: SSE, HTTP e reconexão

**2026-10-30.** Branch exclusiva: `dev69/m45-audit-platform`; integração imutável `374d87d5f49b52514ec68bbe666df086363c1ec5`; Rust HEAD observado `6bb6d2cc7f58c1e4053170276eddf56ebba9ab36`.

## Concluído e executado

### 1. Node v22.16.0 local — decoder SSE A07 **8/8 PASS**

- `tests/m45_platform_a07_sse_frames.mjs`: um decoder SSE incremental e `SseStateStream` (exclusivos de QA, **não integrados à UI**).
- `tests/m45_platform_a07_sse_frames.test.mjs`: resultados executados no container real em `/mnt/data/a07` com `node --check` do helper e do teste e `node ...test.mjs`: **8/8 PASS, exit 0**. Cobertura: dois frames no mesmo chunk sem perder estado, comentário/heartbeat, CRLF fracionado, byte UTF-8 de `ação` quebrado no meio, ID e `data:` multiline, JSON inválido, limites de tamanho de frame e EOF, controles inválidos.
- Importante: `SseStateDecoder` é diagnóstico/fixture, não modifica `multiplayer/pvp_client_v453_dev47.js` nem introduz código Rust.

### 2. V8 isolado — Arena+gateway+Room legados integrais **13/13 PASS**

Fontes originais completas `engine.mjs`, `authoritative_actions_v453_dev44/47.mjs`, `room_v453_dev47.mjs`; mapas/máscaras/manifest reais. Adaptação de execução isolada: remoção dos imports/exports dos módulos no V8, `structuredClone` JSON-compatible de payloads; objetos do motor e classe real `PvPRoomV453Dev47` preservados.

`tests/m45_platform_a07_room_stream_golden.test.mjs` materializa 13 verificações executadas:

- Bootstrap de `subscribe` entrega perspectiva distinta a cada assento, contendo os cinco IDs controlados sem seed/RNG/token hash.
- Uma ordem azul aceita dispara `broadcast()` aos dois assinantes; primeiro `ready` propaga status sem executar.
- Evento `RED_PRIVATE_SHOP` corretamente some do fluxo azul; evento **anônimo `public:false`** criado com `arena.event('UNOWNED_A07_PRIVATE_CANARY')` aparece em ambos os callbacks (**GAP REPRODUCED**, não PASS de privacidade). O fog de campeões segue filtrado.
- `unsubscribe` impede novos callbacks; reabrir assinatura entrega snapshot atual; replay de `ready` é rejeitado, segunda confirmação entra em executing; snapshot/restore e reconnect mantêm a visão autenticada.
- O teste completo HTTP/disk permanece **NOT_RUN**. O estado V8 foi restaurado em memória, não gravado no disco.

### 3. Novo teste de rede de verdade, **preparado mas NÃO EXECUTADO**

`tests/m45_platform_a07_http_sse_restart.test.mjs`: sobe `createPvPServerV453Dev47` com porta aleatória e diretório de checkpoint, usa `fetch` e cookies diferentes para criar/join, autentica duas respostas SSE, recebe broadcast após `/api/action`, bloqueia stream sem sessão, faz `ready` azul e verifica isolamento da fase; fecha stream/servidor, reinicia lendo checkpoints do disco; recupera sessões/recibo de ação; reconecta SSE com fotografia atual; `ready` vermelho inicia turno; registra retry `ready` 409 do legado. **11 checks declarados, 0 executados**. Código passou em parsing sintático V8; não equivale a `node --check` no checkout.

## Contratos de migração Rust e riscos

`A07_TRANSPORT_GAP_MATRIX.json`: 12 invariantes HTTP/SSE/Checkpoint/Client/Presence, com QA e proveniência por blob.

1. **P0 segurança**: `Room.subscribe` usa `gateway.view`, que usa `Arena.perspective`. Eventos anonimos não-públicos atravessam o filtro; Rust `VisibleEventDTO` deve default deny e whitelist, com testes HTTP duas sessões e SSE reconnect. Um script de diagnóstico legadamente PASS aponta **falha**, não conformidade.
2. **P0 persistência**: manter receipts de ação e snapshot/RNG apenas no servidor; nenhum checkpoint cru deve entrar no SSE. Restaurar imediatamente por team/seat autenticado.
3. **P1 replay**: SSE legado envia `: connected` e `event: state` **sem `id:`**; não existe journal/Last-Event-ID/recuperação incremental. A assinatura nova recebe snapshot atual. Rust precisa contrato explícito de cursor monotônico por seat e `revision`, gap ⇒ snapshot filtrado ou política equivalente.
4. **P1 backpressure**: `server_v453_dev47.mjs` chama `res.write` sem observar boolean/await drain; nenhum limite por assento/filas; Rust exige quotas de streams, timeouts, rate limit, capacidade e cancelamento.
5. **P1 idempotência**: `POST /api/join` pode consumir o segundo seat sem recovery se perder a resposta; `POST /api/ready` não recebe `request_id` e rejeita retry. Rust deve usar idempotência por round+seat+request e transações persistentes.
6. **P2 cliente**: `pvp_client_v453_dev47.js` mantém `lastRevision` global entre reconexões/possível troca de sala, aceitando frames quando `v.revision >= lastRevision`; Rust/cliente devem usar epoch (roomId+revision) e ignorar SSE de outra sessão. O campo `connected` do legado mede seats ocupados, não presencia real.

## Como executar em checkout real (sem Actions)

```bash
node --check tests/m45_platform_a07_sse_frames.mjs
node --check tests/m45_platform_a07_sse_frames.test.mjs
node tests/m45_platform_a07_sse_frames.test.mjs
node tests/m45_platform_a07_room_stream_golden.test.mjs
node tests/m45_platform_a07_http_sse_restart.test.mjs
node tests/m45_platform_a02_network_security.test.mjs
```

### Status

- G0 PARTIAL: 12 contratos de transporte e testes source-pinned; não é migração.
- G1 native/WASM NOT_RUN/BLOCKED toolchain; G2 Rust NOT_RUN.
- G3 LEGACY_FOG_GAP_REPRODUCED; Rust servidor HTTP/SSE **NOT_IMPLEMENTED/NOT_CERTIFIED**.
- G4 cliente parser Rust NOT_RUN. G7 assets binários pendentes; navegador completo BLOCKED. G8 NOT_RUN.
- GitHub Actions/Codespaces não utilizados; nenhum merge, nenhuma alteração em integration/skills/items/rust-core/ledger.
