# M45 PLATFORM-A03 — Event visibility, red-team e reconexão

**2026-10-30.** Origem intocada: `dev69/integration` @ `374d87d5f49b52514ec68bbe666df086363c1ec5`; `engine.mjs` Git blob `1737f4f675bd9cc5ed0a48defc68b2fddc124d71`. Coordenador Rust consultado @ `8a2d50f2d7189e16b467dcf4c546613a1d2c24c8`. Branch exclusiva: `dev69/m45-audit-platform`.

## Evidência executada neste turno

**Duas funções autênticas do legado foram extraídas sem alterar bytes e executadas em V8 isolado**: `Arena.event(text,...)` e `Arena.perspective(team)`, com um objeto arena de teste e listas vazias. Um `Arena.event('Campeão oculto usou Flash.')` produz `team:null, unitId:null, public:false, observedBy:[]`; **mesmo assim aparece em `perspective('red').events`**. Injeção `private:true` com campo `internal` também atravessa a projeção sem whitelist. `public:'false'` (string truthy) é aceito. Evento explicitamente do time azul é corretamente filtrado; `public:true` visível a ambos. Isolamento prova a expressão de projeção, **não ocorrência/exploração desse cenário em partida completa**.

Resumo de reprodução isolada no Code Mode: anon secret exposto TRUE; private field exposto TRUE; string public 'false' exposto TRUE; blue-owned private oculto TRUE; explicito public visível TRUE. O novo arquivo `tests/m45_platform_a03_perspective_diagnostic.test.mjs` realiza a mesma extração do `engine.mjs` pelo SHA de blob, sem importar o motor ou exigir dados binários. O PASS desse diagnóstico registra **VULNERABILIDADE DO LEGADO REPRODUZIDA**, nunca G3 PASS.

## Inventário de produtores de eventos — máquina e limites

`A03_EVENT_CALLS.json` foi gerado automaticamente lendo `engine.mjs`, com scanner lexical de argumentos balanceados, linhas, aridade, origem e âmbitos (não é AST completo e expressões dinâmicas requerem auditoria). `tools/m45_platform_a03_event_audit.mjs` reconta e verifica SHA fixo no checkout.

| Categoria estática | Contagem |
|---|---:|
| `this.event(...)` | **132** |
| Somente texto/sem 2º argumento team | **13** |
| `team=null` explícito | **7** |
| Total sem equipe fixada | **20** |
| Desses, `public:true` literal no call | **2** |
| Calls com argumento de equipe | **112** |

**Classificação prioritária, não alterar sem QA:** anúncios globais legítimos como Nexus, estruturas, começo/fim de rodada, Dragon Soul/objetivos exigem `public:true` explícito ou evento public enum. Chamadas `this.event(`\${u.champ} usou Flash.`)` e `this.event(`\${u.champ}: destino sem passagem.`)` não fixam equipe e podem revelar ação de unidade fora de visão; precisam ser próprias do time/observadores reais. `Arena.event` usa `Object.assign(e,details)`, portanto campos como `public`, `team` e `observedBy` podem ser sobrescritos por detalhes internos; não confiar em quaisquer detalhes genéricos para serialização de rede.

## Contrato obrigatório Rust — VisibleEventDTO

1. Default deny. `public` precisa ser BOOLEAN true e categoria aprovada, ou owner team autenticado, ou `observedBy` autenticado validado pelo servidor. Ausência de owner **não** torna mensagem pública.
2. Ordem de operações: evento canônico servidor -> política visibility -> projeção por time -> **whitelist por kind** -> serialização. Não exportar `...event`/detalhes arbitrários, seed, token, enemy orders, posições escondidas, timers sem visão.
3. `Public` para announce da estrutura, objetivo e Nexus somente quando comprovado globalmente, com payload mínimo. `TeamPrivate` e `Observed` são tipos separados com guards. Nonce/correlator evento nunca expõe receipt de inimigo.
4. Snapshot e SSE compartilham a MESMA função de filtragem; replay e reconnect nunca usam `snapshotV40` em transporte. Testar red/blue, Ward, brush, stealth, clones, mortes e estrutura antes de G3.

## Protocolo de reconnect/replay — contrato proposto, ainda não implementado

- Session/auth cria `AuthContext` com seat fixo pelo token; `roomId` e ID de campeão nunca concedem controle.
- `ClientCommand` com `request_id`, `client_sequence`, `expected_round`, `schema/patch/protocol_version`; recibo imutável persistido antes do ACK; duplicata idêntica retorna o mesmo recibo após ready/seal/end, conflito é rejeitado.
- `/api/ready` precisa de recibo idempotente também: no legado, repetir POST ready confirmado retorna indisponível, risco após perda do ACK.
- `/api/join` deve ter regra de retry: resposta perdida não pode ocupar seat definitivamente sem mecanismo seguro de recuperação; cookie/session nunca no URL.
- SSE eventos com `event_id` monotônico, cursor verificável por seat, journal bounded e `state_revision`; gap -> novo `PublicSnapshotForTeam` filtrado. Descartar frames out-of-order; backpressure, limites, TTL, cancelamento e ratelimit.
- Checkpoint em disco server-only com schema/rng/receipts, backup e restart transacional; não enviar `rngState` no SSE; `connected` não deve ser derivado de `players.length`.
- Teste E2E deve validar 2 cookies/sessões, reconexão após um ready e após duas confirmações, duas ordens de ready, receipt duplicado, rede cortada durante ACK, loja/Undo e duas perspectivas sem dados privados.

## Testes e status

- **EXECUTADO:** V8 isolated `event()` + `perspective()` legado; exposição de evento não classificado confirmada.
- **EXECUTADO:** análise lexical dos 132 call sites; resultado exportado no JSON.
- **VALIDADO:** scripts JS sintaticamente verificados pela compilação isolada (não equivalem a Node --check).
- **NÃO EXECUTADO:** Node completo `tests/m45_platform_a02_network_security.test.mjs`, novo `tests/m45_platform_a03_reconnect_receipts.test.mjs`, navegador real e cargo/wasm. Clone GitHub privado não acessível: `git ls-remote` falha DNS no executor, e faltam os assets da Issue #1 para G7.
- G0 PARTIAL; G1 BLOCKED; G2 NOT_RUN; G3 **GAP_CONFIRMED no legado / NÃO CERTIFICADO Rust**; G7 BLOCKED; G8 NOT_RUN.

### Reprodução em checkout completo

```bash
node tools/m45_platform_a03_event_audit.mjs
node tests/m45_platform_a03_perspective_diagnostic.test.mjs
node tests/m45_platform_a02_network_security.test.mjs
node tests/m45_platform_a03_reconnect_receipts.test.mjs
node tests/m45_platform_a02_event_redteam.test.mjs # esperado detectar o gap legado
```

Não adicionar código autoritativo JS de produção; esta branch continua somente auditoria. Não alterar `STATUS_LEDGER`, `manifest`, PR #19 ou integração de origem.
