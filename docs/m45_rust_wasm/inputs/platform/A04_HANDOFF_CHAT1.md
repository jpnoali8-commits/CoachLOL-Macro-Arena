# HANDOFF Chat 4 → Chat 1 — M45 PLATFORM-A04

Data 2026-10-30. Branch audit exclusiva `dev69/m45-audit-platform`; integration `374d87d5f49b52514ec68bbe666df086363c1ec5`; engine blob `1737f4f675bd9cc5ed0a48defc68b2fddc124d71`; room blob `3bdb8cd3b737d20e3700e994a8872943e53366ae`.

## Confirmado por execução isolada dos métodos originais

1. `perspective(team)` filtra inimigo oculto/minion oculto e envia subconjunto explícito de campos para inimigo visível; wards conhecidas também usam subconjunto. Camp normal oculto usa `alive:null`; Baron globalmente anunciado pode expor hora de respawn.
2. `event` + `perspective` permitem evento anônimo `public:false` chegar às duas equipes; evento observado pode mandar campos internos arbitrários; string `public:'false'` vira truthy e publica. G3 segurança não certificado. Precisamos `VisibleEventDTO` typed+whitelist, owner/observedBy calculados no servidor e default deny.
3. `room.confirm` faz dual-ready corretamente e executa uma única vez, porém POST ready repetido perde o ACK original e retorna `confirmacao_indisponivel`; Rust deve persistir recibo idempotente **por round+seat+requestId**, inclusive depois de reiniciar e executar.

## Arquivos entregues
- `tests/m45_platform_a04_visibility_matrix.test.mjs` (7 cenários reprodutíveis, ainda Node NOT_RUN)
- `tests/m45_platform_a04_ready_receipt_diagnostic.test.mjs` (lost-ACK, dual seal)
- `A04_LEGACY_BOUNDARY_GOLDENS.json` (11 comportamentos; distingue referência válida de falha legada)
- `A04_FOG_EVENT_READY_GATES.md` (evidência, contratos, próximas execuções)

**IMPORTANTE:** PASS do script legado é diagnóstico de correspondência com comportamento legada, inclusive falhas. NÃO é G3 PASS ou prova de servidor Rust. Sem alterações em origin/main/PR19.

## Ação exigida para Chat 1
- Na futura B04/B06, schema de `ReadyCommand + ReadyReceipt`, replay de ACK original mesmo após seal/reconnect, autenticação por seat e event DTO allowlist.
- Conectar golden de duas sessões à matriz union e publicar testes Rust autênticos. Bloqueio Cargo/WASM e assets continua.
