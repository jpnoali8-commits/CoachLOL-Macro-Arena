# CoachLOL Macro Arena — M45 PLATFORM-A16
## Execução das rotas HTTP originais com Arena, gateway e sala PvP reais

**Data:** 2026-10-30. **Branch exclusiva:** `dev69/m45-audit-platform`. Fonte canônica legada, somente leitura: `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`. HEAD Rust observado na conclusão: `dev69/rust-core-m45@056191eff45aa48167a79a36ffe3929b6e56eb48`. Zero merges, force pushes, rebases, alterações na engine ou Actions.

## Resultado realmente executado

**28/28 PASS em V8 isolado executando o código original dos handlers** de `multiplayer/server_v453_dev47.mjs` (Git blob `d6ed7a4b0dd30f2bf22c3d5876e3ac6b293ddf5d`) integrado às classes *originais* `Arena`, `AuthoritativeActionsV453Dev44/47` e `PvPRoomV453Dev47`, com mapa, máscaras e manifest reais da integração. O arquivo exato do golden foi publicado como `tests/m45_platform_a16_legacy_http_handler.test.mjs`, blob `248f1cc1e62207bbb2b1f3124b9263b15dedb040`, e seu conteúdo buscado do próprio GitHub foi executado em V8. Foram removidos somente wrappers ES import/export e bootstrap CLI para avaliar a função real `createPvPServerV453Dev47()`.

**Transporte no A16 = falso, métodos e handlers no A16 = originais.** `http.createServer` foi injetado como uma captura do callback HTTP, `request` e `response` foram objetos de teste, e `setInterval` de heartbeat recebeu stub. `Room.join()`, `Room.command()`, `Room.confirm()`, `Room.subscribe()` e `Arena.event()` mantiveram a semântica real do legado. Para eliminar dependências indisponíveis no V8, foram simulados `randomBytes` e o hash usado pelo token de teste e dados shop reference. **Portanto nenhum teste de segurança criptográfica, TCP/socket, TLS, autenticação de navegador ou I/O real do servidor original foi executado nesta suíte.**

### 28 cenários de handlers verificados

- `POST /api/create` cria sala azul, cookie `HttpOnly` e `SameSite=Strict`; `/api/join` admite o segundo assento vermelho. Duas pessoas controlam cinco unidades cada.
- Sem cookie e cookie inválido em `/api/session` e `/api/stream` retornam 401; `/api/session` entrega perspectiva de cada time.
- `/api/action` recusa campeão adversário, campo extra de `team`, sequência com lacuna e requisição cross-origin. Comando válido retorna ACK original; retry idêntico retorna o mesmo ACK sem broadcast adicional; conflito de conteúdo em sequência reutilizada é recusado.
- Duas assinaturas `/api/stream` recebem `: connected\n\n` e `event: state\ndata: JSON\n\n` com perspectivas distintas; o comando do azul transmite nova revisão para ambos, mas cada um recebe o seu próprio `nextSequence`.
- Primeiro `/api/ready` não executa o mundo, mas bloqueia novos comandos do assento confirmado. Segundo `ready` inicia `executing`. **Repetir a confirmação do vermelho retorna 409 `confirmacao_indisponivel`**, não ACK idempotente.
- `/api/session` não expõe `tokenHash`, `rngState` nem `gatewayCheckpoint` nas respostas verificadas.
- Os streams não possuem `id:` nem `Last-Event-ID`; um `broadcast()` com a mesma revisão emite quadro duplicado.
- `close` da assinatura azul a remove, e o vermelho continua recebendo updates. Nova assinatura azul recebe apenas a perspectiva atual, sem journal incremental.
- **P0 confirmado no handler original:** `Arena.event('A16_ANONYMOUS_PRIVATE_CANARY')` é serializado na saída SSE de ambos os assentos. A perspectiva oculta de unidades é preservada, mas a ausência de classificação do evento permite vazamento.
- A implementação rejeita corpo JSON com mais de 8192 bytes e código de sala inválido, além de recusar campo extra no `ready`.

**PASS nos testes 25 e 19 significa reprodução de comportamentos inseguros do legado, não conformidade de segurança.** O manifesto `A16_ORIGINAL_HTTP_HANDLER_VECTORS.json` registra 28 testes e 5 riscos por ID.

## Histórico da impossibilidade de obter checkout Node

1. Em `/mnt/data`, não havia `engine.mjs`, `room_v453_dev47.mjs` nem ZIP completo. Havia apenas os artefatos QA de A07/A08/A13/A14/A15.
2. `getent hosts github.com` não retornou endereço e `curl` para `raw.githubusercontent.com` falhou por DNS. Teste com IP conhecido para Raw GitHub via `--resolve` falhou na conexão de saída.
3. Consulta às fontes de arquivos presentes no projeto/Library não encontrou o ZIP canônico completo; o conector GitHub continua conseguindo buscar blobs de fonte para o V8 isolado.
4. Não foi usado GitHub Actions, Codespaces, proxy externo, serviço de terceiros ou solução que consuma quota.

Consequentemente **`tests/m45_platform_a02_network_security.test.mjs` e `tests/m45_platform_a07_http_sse_restart.test.mjs` continuam NOT_RUN num processo Node do servidor original**. O runner `tools/m45_platform_a16_qa.sh` está pronto para executar os três goldens em checkout integral.

## Por que A16 avança além de A15, mas não fecha G3/G4

A15 comprovou **24/24 testes Node com HTTP/SSE TCP reais** em `127.0.0.1`, **mas usando servidor e storage QA**. A16 comprovou **28/28 testes V8 no código de endpoints HTTP original** ligado ao motor LoL verdadeiro, **mas com transporte HTTP simulado**. São evidências complementares; nenhuma deve ser falsamente rotulada como TCP com a Arena original ou como Rust.

O Rust HEAD consultado ao encerrar o lote contém apenas `crates/core-state`; **`crates/core-protocol` e `crates/game-server` ainda não aparecem na árvore GitHub**, logo não existe transporte PvP Rust para testar aqui.

### Requisitos prioritários Rust

1. `AuthenticatedSeat` derivado da sessão, posse de cinco unidades e ações verificadas pelo `game-server`.
2. `ReadyCommand` e `ActionCommand` com `requestId` e recibos idempotentes duráveis que sobrevivem a restart, perda de ACK e vedação de turno.
3. `VisibleEventDTO` default-deny, filtro por equipe e campos tipados para eventos, visão e objetos antes de qualquer HTTP `/api/session`, SSE ou replay.
4. `SseCursor{roomEpoch,seatId,committedRevision}`, recuperação por snapshot autorizado, prevenção de re-render em revisão igual, stream quotas/backpressure/drain.
5. Estado+recibos+revisão+RNG/eventos gravados de modo atômico antes de publicar ACK/SSE. Faltas de persistência em legado A13 continuam risco P0.
6. Futuros testes Rust nativos/WebAssembly devem reproduzir a semântica permitida do legado, marcando explicitamente as correções intencionais de segurança e idempotência.

### Gates

G0 PARTIAL. G1 programa Rust/WASM PARTIAL (baseline de `core-state` demonstrada anteriormente no ledger do coordenador). G3/G4 Rust **NOT_CERTIFIED**. G7 BLOCKED. G8 NOT_RUN. Sem Action adicional.

**Próxima prioridade A17 (reorientada):** não seguir acumulando apenas golden JS. No primeiro ambiente com checkout real, executar A02, A07 e A16 via Node; junto ao Chat 1, priorizar `core-protocol` e `game-server` Rust e contratos de autenticação, SSE, eventos privados e recibos para iniciar a certificação da plataforma.
