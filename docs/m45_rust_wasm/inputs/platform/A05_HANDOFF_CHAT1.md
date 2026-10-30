# M45 Chat 4 → Chat 1 — Handoff PLATFORM-A05

**Base da auditoria:** integration `374d87d5f49b52514ec68bbe666df086363c1ec5`; `engine.mjs` Git blob `1737f4f675bd9cc5ed0a48defc68b2fddc124d71`; room Git blob `3bdb8cd3b737d20e3700e994a8872943e53366ae`. **Coordenador Rust observado:** `e7cf151af869421d307af58ae26e38449c11f954`. **Apenas** branch `dev69/m45-audit-platform` recebeu escrita.

## Resultados do código real em V8 isolado
- **7/7 diagnósticos de evento executados:** as expressões `this.event(...)` dos pontos fonte 3921 (movimento bloqueado), 4147 (Flash), 5010 (torre aggro), 5740 (torre eliminou) geram `team:null,unitId:null,public:false`, mas atravessam `perspective('red')` com adversário sem visão. Metadados sobrescritos por `details` podem expor `privateDebug`.
- **Falha injetada em `confirm(p)` executada:** a segunda confirmação com `playTurn().ok=false` incrementa `revision` sem persistir/broadcast; nova tentativa conclui a execução. A idempotência de ready continua ausente no legado (A04).
- **Limite de evidência:** Code Mode/V8 com fontes GitHub, não Node end-to-end; não afirmar exploit em jogo real, Rust G3 PASS ou QA completo.

## Artefatos A05
- `tests/m45_platform_a05_real_event_callsites.test.mjs` — 7 casos isolados reprodutíveis, fonte SHA pinada.
- `tests/m45_platform_a05_ready_failure_atomicity.test.mjs` — fault injection de rollback/revision.
- `A05_EVENT_PRODUCER_TRIAGE.json` — **20** produtores anônimos: 3 exigem visão do ator; 2 exigem revisão; 15 candidatos a eventos públicos, ainda NÃO aprovados.
- `A05_READY_RECEIPT_VECTORS.json` — 11 contratos-alvo server Rust de ready/retry/reconnect.
- `A05_REPORT.md` — evidência e bloqueios completos.

## Demandas diretas ao Chat 1, B04/B06
1. `VisibleEventDTO` enum/whitelist estritos com default deny e privacidade sem confiança em `details`; visão obrigatória para Flash/path/aggro, análise especial da disputa sem Smite.
2. `ReadyCommand` versionado com auth-context seat, round e request_id, `ReadyReceipt` durável antes de responder; rollback/atomic commit inclusive revision e checkpoint. Retry idêntico após seal, restore e SSE gap retorna ACK anterior; duplicata conflitante nega.
3. Usar esses vetores como testes Rust reais apenas quando `core-protocol` e `game-server` estiverem disponíveis. Até lá, G0 PARTIAL, G1 BLOCKED, G3 GAP_LEGACY/NOT_CERTIFIED, G8 NOT_RUN.

Sem merge/cherry-pick, sem alteração em `STATUS_LEDGER` ou manifest central. Próxima prioridade Chat 4: executar scripts em checkout completo autorizado, obter oráculo HTTP/SSE real e fechar política de 20 eventos por comportamento, não apenas por nome.
