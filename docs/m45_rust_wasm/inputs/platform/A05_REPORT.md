# CoachLOL Macro Arena — M45 PLATFORM-A05

**2026-10-30.** Branch exclusiva `dev69/m45-audit-platform`. Fonte pinada `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5` (`engine.mjs` blob `1737f4f675bd9cc5ed0a48defc68b2fddc124d71`, `multiplayer/room_v453_dev47.mjs` blob `3bdb8cd3b737d20e3700e994a8872943e53366ae`). Rust HEAD consultado `e7cf151af869421d307af58ae26e38449c11f954`. Nenhuma alteração de código autoritativo JS, integração, branch Rust ou PRs.

## QA executado e limitações

**Execução isolada em V8:** 7/7 verificações do corpo do arquivo `tests/m45_platform_a05_real_event_callsites.test.mjs` passaram; o corpo publicado foi lido via blob GitHub e executado usando os dois métodos `Arena.event` e `Arena.perspective` originais, com dados mínimos. A execução injetou as fontes GitHub no lugar de `readFileSync` e substituiu `createHash` pelo SHA de blob verificado diretamente no GitHub; logo **o script Node completo e sua checagem criptográfica não foram executados em checkout local**. Sintaxe V8 de ambos os scripts passou.

**Falha de confirmação reproduzida:** o corpo do arquivo `tests/m45_platform_a05_ready_failure_atomicity.test.mjs` também foi executado em V8 isolado e passou, usando o `room.confirm(p)` original e uma falha de `playTurn` artificial. São diagnósticos que mostram falhas legadas, NÃO uma certificação de segurança.

| Caso fonte | Resultado legado em estado adversarial, sem visão | Interpretação |
|---|---|---|
| engine.mjs:3921, `u.champ: destino sem passagem` | visível ao vermelho, evento `public:false` | Falha de isolamento da mensagem do ator |
| engine.mjs:4147, `u.champ usou Flash` | visível ao vermelho, evento `public:false` | Ação de campeão oculta exposta |
| engine.mjs:5010, `turret: aggro em attacker.champ` | visível ao vermelho, evento `public:false` | Evento de combate não filtrado |
| engine.mjs:5740, `torre eliminou champion` | visível globalmente com `public:false` | Pode ser anúncio global legítimo; exigir tipo Public explícito |
| `Arena.event(...,details)` | `details` altera `team`/`unitId`/`public`; campo `privateDebug` aparece na projeção | Publicação de metadados sem tipagem/allowlist |
| `room.confirm(p)` com falha de engine no segundo ready | revisão 11 → **12** na falha, **sem persist/broadcast** correspondente; retry bem-sucedido chega a 13 | Rev/estado não são transacionais em caso de falha |

Os quatro primeiros testes executam as **expressões originais** `this.event(...)` da linha de fonte extraída, mas não percorrem caminho de movimento, cast, combate nem tick completo. Os `details` maliciosos são injeção deliberada; não implica um ataque externo já explorável.

## Matriz dos 20 sites sem equipe classificada

Novo `A05_EVENT_PRODUCER_TRIAGE.json` preserva assinatura e linha da fonte, com três grupos **propostos**:

- **3 ACTOR_VISIBILITY_REQUIRED:** 3921, 4147, 5010 — autor/posição sujeitos a visão real e observadores no servidor.
- **2 REVIEW_PRIVATE_VISIBILITY:** 1060 (Blast Cone) e 6226 (disputa sem Golpear com quantidade/probabilidade de campeões) — verificar se a informação pode ser revelada fora de visão.
- **15 EXPLICIT_PUBLIC_CANDIDATE:** fluxo de partida, objetivos, Nexus, estrutura e mortes. Esta classificação é provisória; não publicar automaticamente os 15.

## Contratos de segurança para Rust

**PLATFORM-022 (P0):** `AuthoritativeEvent` tipado, `VisibilityClass = Public | TeamPrivate(team) | Observed(teams)` derivado somente no servidor. Remover `Object.assign` para campos de controle de visibilidade; `VisibleEventDTO` whitelist por tipo e allowlist de payload; `public` booleano estrito; ausência de owner não autoriza publicidade. Políticas de árvores/objetivos/waves e eventos globais precisam ser explicitamente classificadas, com paridade por blue/red e fog. Nenhum `...event` raw no SSE nem na resposta `/api/session`.

**PLATFORM-023 (P1):** confirmação em transação autoritativa. O método legado incrementa `revision` antes de `playTurn`, mas em falha não persiste a revisão; o Rust deve gravar `round,ready,receipts,revision,phase` atomicamente, depois responder/broadcast. `ReadyCommand` recebe `request_id` e `expected_round`, `seat` é inferido da conexão. Retry de comando aceito devolve recibo *idêntico* após seal/reconnect/restore, sem nova execução. Reutilização de request_id com outro payload deve rejeitar.

**`A05_READY_RECEIPT_VECTORS.json`:** 11 vetores-alvo de replay/ready/ACK perdido/conflito/falha/restore/SSE, **não executados em Rust**; distinguir alvo seguro da semântica legada.

## Execução em checkout para fechar as pendências

```bash
node --check tests/m45_platform_a05_real_event_callsites.test.mjs
node --check tests/m45_platform_a05_ready_failure_atomicity.test.mjs
node tests/m45_platform_a05_real_event_callsites.test.mjs
node tests/m45_platform_a05_ready_failure_atomicity.test.mjs
node tests/m45_platform_a03_reconnect_receipts.test.mjs
node tests/m45_platform_a02_network_security.test.mjs
```

**Gates:** G0 PARTIAL; G1 Rust toolchain BLOCKED; G2 NOT_RUN; G3 legado GAP_REPRODUCED / Rust NOT_CERTIFIED; G4 NOT_RUN; G7 BLOCKED pela Issue #1 (78 binários runtime) e ausência do Rust browser; G8 NOT_RUN. O checkout completo segue inacessível por DNS neste runner. Sem Actions/Codespaces.
