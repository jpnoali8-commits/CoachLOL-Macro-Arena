# M45 — Chat 4 — Auditoria inicial da plataforma PvP e Web

Data: 2026-10-30. Fonte fixada: dev69/integration @ 374d87d5f49b52514ec68bbe666df086363c1ec5. Contrato central lido: dev69/rust-core-m45 @ 40e5598838bb4c2d4ec9d4a62c4f0acc30644aaf. Branch de escrita: dev69/m45-audit-platform. Status: SOURCE_ONLY / AUDIT_PARTIAL; NÃO certificado.

## Escopo comprovado por leitura de arquivos no GitHub

| Sistema | Origem / entrypoint | Contrato encontrado e destino |
|---|---|---|
| Servidor HTTP/SSE | multiplayer/server_v453_dev47.mjs, linhas 22–82 | HTTP create/join/session/action/ready/shop/shop/quote/stream; sessão por cookie; tick do servidor; Rust native game-server |
| Salas e checkpoint | multiplayer/room_v453_dev47.mjs, linhas 13–98 | exatamente 2 seats; um humano por team com MID/TOP/JG/ADC/SUP; snapshot privado em disco e views por seat; match actor + core-replay |
| Gateway PvP | multiplayer/authoritative_actions_v453_dev44.mjs, linhas 91–169; wrapper dev47 | whitelist por kind/payload, unitId do próprio time, monotonic sequence, ACK cache, reaction ACL, projection; core-protocol + game-server |
| Cliente PvP | multiplayer/pvp_client_v453_dev47.js, linhas 1–188 | POST mutações, GET catálogo/cotações, EventSource /api/stream, UI de combo/reações/loja/seleção de até cinco; transporte TS + renderer |
| Gameplay local | index.html, app.js, engine.browser.js | app.js instancia Arena e executa comandos/partida localmente, não é cliente exclusivo de projeção pública; migrar autoridade de gameplay para servidor |
| Comandos PT-BR | commands.mjs, linhas 286–334, app.js linhas 1493/1513 | interpretCommands/applyCommands manipulam Arena no fluxo local; parser/ACL precisam ser Rust; voz browser é só aquisição de texto |
| Draft | draft.js | bans/picks, spells, Smite, runas e dispatch draft:complete no browser local; servidor PvP atual não expõe endpoints de draft |
| Postgame | postgame.js, app.js linhas 1071–1082 | model/render de estado completo do match; servidor PvP atual expõe winner/ended mas não endpoint de telemetria pós-jogo completo |
| Sincronização | tools/sync_browser_v43.py | remove exports ESM e escreve engine.browser.js como window.CoachArena: não manter runtime de simulação JS após G8 |
| Assets/build | multiplayer.html, data/, assets/, package.json, docs/parallel/* | página PvP isolada tem assets rotas restritas; npm test amplo requer arquivos de runtime que não estão no GitHub |

## Invariantes funcionais — evidência de código, não resultado de novo teste

1. Room impõe maxSeats === 2 e assigna p1=blue, p2=red; o gateway entrega cinco IDs por seat (room linhas 15, 24–30; gateway linhas 97–109). Uma sessão por jogador, não 10 sessões.
2. Server vincula sessão ao cookie HttpOnly + SameSite=Strict de 64 caracteres hex e Room guarda SHA-256 do token (server linhas 18–19, 39–46; room linhas 27–34). Não aceitar seat ou team fornecido por request.
3. O gateway verifica payload estrito, unitId dentro do seat, alvos visíveis e reaction somente da unidade defensora; sequence per seat + canonical string impede replay alterado (gateway linhas 114–149; room linhas 48–58).
4. room.confirm somente chama arena.playTurn após os dois seats ready; room.advanceAll é dirigido pelo servidor (room linhas 59–79, 94–98). Verificar equivalência de relógio/ticks: timer tickMs=250 invoca advanceAll, que avança 1 segundo simulado por chamada.
5. Os payloads de estado usam gateway.view -> arena.perspective(team), nunca snapshotV40; checkpoint grava snapshot completo SOMENTE em arquivo no servidor (room linhas 36–47 e 78–79). A função perspective deve receber testes adversariais de fog, stealth, clone, ward, ordem futura, inventário, timers, postgame e replay. Não há prova exaustiva só pela leitura.
6. O cliente PvP apresenta loja pelo catálogo do servidor, aplica itens via /api/action, usa /api/shop/quote por ID do campeão e recebe eventos SSE filtrados. O catálogo de referência é não jogável (server linhas 49–58; cliente 98–153).

## Riscos e lacunas auditados

| ID | Prioridade | Evidência e ação exigida |
|---|---|---|
| PLATFORM-001 | P0 | Servidor Rust e core-protocol reais ainda não integrados ao PvP. Não trocar autoridade JS até contratos estáveis e gates G1–G7. |
| PLATFORM-002 | P0 | O browser principal usa engine.browser.js + new Arena e commands.mjs. Não copiar motor ao WASM/browser; adaptar apresentação à projeção filtered e intents. |
| PLATFORM-003 | P0 | Superfície HTTP PvP não contém rotas draft/replay/postgame avançados, embora existam draft.js e postgame.js locais. Definir DTO + sala de pré-partida + endgame no Rust. |
| PLATFORM-004 | P0 | Issue #1 aberta: 78 binários runtime fora do GitHub, incluindo assets/mapa_atualizado.jpg e overlays. PUBLIC do servidor aponta para mapa JPG ausente do tree GitHub; sem placeholders ou release. |
| PLATFORM-005 | P1 | Sessão em cookie sem atributo Secure no servidor HTTP local; política TLS/HTTPS e renovação/revogação não aparecem. Ausência de Origin é permitida, e não há rate limiting dedicado no servidor de 86 linhas; endurecer antes de produção. |
| PLATFORM-006 | P1 | TokenHash e receipts persistidos em JSON checkpoint com snapshot completo; definir ACL de disco, retenção, expiração, rotação, criptografia se necessária e recuperação transacional. |
| PLATFORM-007 | P1 | Cache de receipts por sequence e subscribers SSE sem limites explícitos por seat; especificar quotas, backpressure, max events, eviction consistente com replay. |
| PLATFORM-008 | P1 | room.connected informa players.length, não conexão ativa; reconexão por cookie + GET /api/session + novo SSE existe, mas não comprova presença, expiração e troca de dispositivo. |
| PLATFORM-009 | P1 | Nem protocolVersion/schemaVersion/patchVersion em todos envelopes, nem request_id dedicado; modelo legado por sequence deve ser reconciliado sem perder comportamento de retry. |
| PLATFORM-010 | P1 | Seed usa Math.random na criação da Arena; o snapshot guarda estado da simulação. Rust deve usar RNG canônico determinístico versionado, nunca seed privada exposta na view. |
| PLATFORM-011 | P1 | postgame.js lê match.units, postgameTimeline, objectiveLedger, events e estruturas; definir PostgameSnapshot autorizado por timing e team, sem entregar snapshot completo na fase de planning. |
| PLATFORM-012 | P1 | Draft local hotseat/bot não prova draft entre dois browsers remotos; adicionar domínio de pregame Rust com validação de ban/pick/Smite/runa e owner. |
| PLATFORM-013 | P1 | commands.mjs interpretCommands/applyCommands depende de arena mutável e não participa do API do PvP atual; preservar parser PT-BR + voz sem elevar cliente à autoridade. |
| PLATFORM-014 | P2 | SSE event state sem log de eventos durável/Last-Event-ID; robustez precisa de snapshot revision + journal servidor + replay idempotente após gaps. |
| PLATFORM-015 | P2 | Bundle legado de engine.browser.js é gerado por regex em tools/sync_browser_v43.py; congelar oráculo JS para golden, depois eliminar script do bundle de produção com gate browser. |

## Legado QA localizado (não reexecutado nesta auditoria)

- tests/v453_dev47_multiplayer_network.test.mjs: dois cookies, 2 seats × 5 unidades, ACL de unidade/alvo, dupla confirmação, retry, restart/checkpoint, SSE, origin e HTTP.
- tests/v453_dev46_vision_pvp.test.mjs: fog e 12 florividentes, wards, time, reconstrução via snapshot e gateway.
- tests/v453_dev60_pvp_shop_refunds.test.mjs e v453_dev61_shop_undo_pvp.test.mjs: compra, venda, Undo, replay, reconexão e shop privado.
- tools/chromium_pvp_dev62_two_sessions.py: dois contexts Chromium independentes, loja/Undo/Ready, screenshot.
- docs/parallel/STATUS_DEV69.md: build integrado histórico, mas npm test integral remoto bloqueado por assets e browser release não certificado.

## Guardrails da portagem

Servidor Rust nativo é o único escritor do estado; WASM apenas recebe dados públicos, sem RNG/segredos. Cliente TS apenas emite intenções e renderiza snapshots/receipts/events filtrados. Nenhum merge, sem editar branches de origem ou ledger central. Não migrar somente a tela de PvP deixando app.js em gameplay JS de produção.

Auditoria de código concluída para entrada HTTP, room e gateway; a cobertura semântica de todos os símbolos do app.js/engine e fixtures de 2 sessões permanece PARTIAL até inventário automático e execução. Ver MATRIZ_CONTRATOS.csv e GOLDEN_DOIS_ASSENTOS.md.
