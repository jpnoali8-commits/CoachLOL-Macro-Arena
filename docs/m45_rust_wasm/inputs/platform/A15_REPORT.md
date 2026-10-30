# CoachLOL Macro Arena — M45 PLATFORM-A15
## Transporte HTTP/SSE por duas sessões, reinicialização e backpressure

**Data:** 2026-10-30. **Branch exclusiva:** `dev69/m45-audit-platform`. Legado fonte somente leitura `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`. Rust consultado `dev69/rust-core-m45@ddbdf8e9ee4345646c70162c1637e5b08670708a` (árvore não truncada com somente `crates/core-state`, sem `core-protocol`/`game-server`). Sem alterações em fontes de produção, merges ou GitHub Actions.

## Entrega e execução verificável

**24/24 PASS com Node 22.16.0, servidor HTTP real em `127.0.0.1`, conexões SSE simultâneas e arquivo de checkpoint real em `mkdtempSync`.** Código: `tests/m45_platform_a15_http_sse_reference.test.mjs`; SHA GitHub `25f70acf6d491d8f9b598f39f607df8960a48e73` corresponde **exatamente** ao `git hash-object` do script realmente executado localmente. `node --check` também passou. A execução local ocorreu no diretório `/mnt/data/m45_a15`, contendo as três dependências de QA A07/A13/A14 idênticas às publicadas.

### O que foi realmente exercitado

O script instancia `http.createServer` do Node, abre uma porta aleatória `127.0.0.1`, estabelece duas conexões `fetch('/api/stream')` reais com cookies de teste diferentes e lê os bytes recebidos por `SseStateStream` A07. O servidor de QA utiliza `DurableCheckpointReference` A13 para persistência e `PerSeatSseResyncReference` A14 para snapshots/cursor. **É um servidor auxiliar de QA, não o `multiplayer/server_v453_dev47.mjs` original nem o Rust.**

Os 24 checks aprovados:
- GET `/api/health`; sessão ausente 401; dois cookies em equipes distintas; SSE sem sessão 401.
- Boot SSE em duas conexões, `id:` vinculando `roomId/seatId/committedRevision`; ação da equipe azul recebida pelos dois clientes sem revelar ordem privada ao vermelho; ação vermelha sem revelar ordem privada ao azul.
- Unidade de equipe adversária rejeitada; requisição POST de origem estrangeira rejeitada; JSON inválido 400 e corpo acima de 8192 bytes rejeitado 413.
- ACK idempotente por `requestId` sem broadcast duplicado; payload diferente com mesmo id é conflito.
- Máximo de duas conexões SSE simultâneas por assento (a terceira recebe 429); reconectar com `Last-Event-ID` antigo recebe snapshot atualizado do próprio assento; cursor estrangeiro não dá acesso ao outro assento.
- Consumidor descarta cursor duplicado; `after_rename` simula resposta perdida após checkpoint durável e o retry recupera recibo sem repetir ordem; `after_temp_fsync` simula falha antes do rename e mantém revisão anterior.
- Fechamento e reinício **da instância Node HTTP de teste** com checkpoint em disco; nova conexão recebe a última revisão; duas confirmações duráveis `ready` não duplicam execução lógica mesmo quando a última requisição é repetida.
- **Backpressure por injeção controlada:** substituir `ServerResponse.write` do stream azul por uma função que devolve `false` força desconexão do azul e contador de backpressure; a conexão vermelha continuou recebendo a próxima revisão no mesmo socket. **Não houve saturação real de kernel/TCP**.
- Snapshots retornados não contêm `privateSeed` ou dicionário de recibos do armazenamento de QA.

O arquivo publicado contém todos os 24 testes na mesma sequência dos executados. O manifesto `A15_HTTP_SSE_TWO_SEATS_VECTORS.json` documenta 24 vetores, sete gaps, fontes Git e escopo de QA. O runner `tools/m45_platform_a15_qa.sh` verifica sintaxe e executa a suíte em um checkout completo.

## Limitações explícitas — não confundir referência com migração pronta

1. **Servidor real legado completo NOT_RUN.** A porta HTTP executada é uma implementação pequena de teste, com `http.createServer`, endpoints equivalentes reduzidos e o armazenamento A13. Não é o código `multiplayer/server_v453_dev47.mjs` em execução. Os goldens de servidor legado completo já publicados como `tests/m45_platform_a02_network_security.test.mjs` e `tests/m45_platform_a07_http_sse_restart.test.mjs` continuam **NOT_RUN** por ausência de checkout local via DNS GitHub.
2. **Rust `game-server`/`core-protocol` e WASM HTTP NOT_IMPLEMENTED/NOT_RUN.** Somente `crates/core-state` constava da árvore Rust no HEAD consultado. Não houve comparação cliente/servidor Rust real, nenhuma modificação de `Cargo.toml` ou import de IA externa.
3. **Tokens do teste são constantes predefinidas** (`'a'.repeat(64)` e `'b'.repeat(64)`) e aceitas por um middleware simples. **Não equivalem ao sistema de criação de sala, cookies HttpOnly/SameSite, expiração/rotação, TLS, CSRF de navegador ou tokenHash do legado.** As requisições são feitas por `fetch` Node, não navegador. Segredos em código de teste, jamais em produto.
4. O motor da QA é o `DurableCheckpointReference` A13 de `order.stop/ready`, não o LoL. A projeção A14 usa uma whitelist reduzida; **não demonstra proteção do catálogo inteiro de eventos e wards do LoL**, que ainda vazam para o adversário no legado quando não classificados.
5. Backpressure foi simulado no `write()` do `ServerResponse`, sem preencher buffer real ou exigir `drain` sob carga. Não há fuzz, teste de concorrência de vários escritores, kill -9, falha elétrica/ENOSPC, rate limit real, retransmissão TCP de pacote ou testes de thread.
6. Não se testou A15 dentro de dois navegadores gráficos nem a interface de microfone/voz. A ordem de publicação de commit de estado antes do SSE foi exercitada somente na referência A13/A14.

## Inspeção da implementação HTTP legada

No servidor original `server_v453_dev47.mjs` blob `d6ed7a4b0dd30f2bf22c3d5876e3ac6b293ddf5d`:
- `POST /api/create` fornece cookie HttpOnly SameSite=Strict; `/api/join` aloca segundo assento; `/api/action` e `/api/ready` passam pelo `Room`. Checagem `Origin` acontece em POST quando o cabeçalho está presente.
- `GET /api/stream` retorna `: connected`, `event: state` sem `id:` e usa `res.write` sem inspecionar retorno de backpressure; a `Room.subscribe` envia snapshot inicial imediatamente.
- Não há `Last-Event-ID` ou fila de replay SSE, limite explícito de streams por seat ou tratamento de `drain`. O cliente `pvp_client_v453_dev47.js` admite revisões iguais e mantém `lastRevision` fora de um room epoch (diagnósticos A08/A14).
- `PvPRoom` altera o estado antes de `persist()` (A13); `ready` não aceita repetição como ACK idempotente; eventos anônimos `public:false` continuam fora da política default-deny (A03–A14).

Estas são **observações estáticas de código + diagnósticos V8 anteriores**, não resultados de um processo HTTP original iniciado nesta etapa.

## Critérios de aceitação do Rust

`core-protocol` e `game-server` devem expor `Create/Join/Session/Action/Ready/SseSubscribe` tipados com autenticação derivada da sessão. Duas sessões controlam cinco campeões cada; servidor não confia em `team/seatId` declarados pelo navegador. Para cada operação:

1. Validar forma canônica/ACL/fog, `roomEpoch`, `round`, `requestId`; falhas não alteram a Arena.
2. Persistir `Arena+RNG+eventos+ready+revision+receipt` como unidade durável antes de liberar ACK/SSE. Se ACK se perder depois do commit, o mesmo recibo deve voltar no retry, sem reexecutar.
3. Fornecer cursor `roomEpoch/seatId/committedRevision`; cliente descarta revisões antigas/iguais. Reconnect, gap e `Last-Event-ID` de outro time geram snapshot atualizado **somente da equipe autenticada**.
4. `VisibleEventDTO` default-deny para kind/scope/propriedades desconhecidas em `session`, stream e replay; nenhum evento de Smite/compra/ward/posição oculta ou `tokenHash` escapa ao adversário.
5. Streams limitados por sessão, backpressure/drain/cancelamento, heartbeat e timeout não bloqueiam a equipe oposta.
6. `ReadyCommand` idempotente, de preferência por `(room,round,seat,requestId)`, preservado em restart; duas confirmações executam uma vez.

**Próximo passo operacional A16:** priorizar conseguir checkout Node completo sem Actions, executar A02/A07 e comparar com A15; quando `core-protocol/game-server` forem criados no Rust, iniciar testes nativos TCP com duas sessões. Não manter apenas produção de testes sem rodar o verdadeiro servidor.

### Estado dos gates

G0 PARTIAL; G1 baseline `core-state` Rust/WASM validado anteriormente mas migração integral PARTIAL; G3/G4 servidor e browser Rust NOT_CERTIFIED; G7 assets/browser BLOCKED; G8 NOT_RUN.

Nenhum workflow/Action acionado, merge, alteração das branches originais ou modificação do ledger central.
