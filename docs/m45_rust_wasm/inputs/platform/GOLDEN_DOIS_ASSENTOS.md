# GOLDEN — duas sessões / cinco campeões (contrato + testes)

Fonte: dev69/integration @ 374d87d5f49b52514ec68bbe666df086363c1ec5. Status: especificação fixada e teste de regressão NOVO commitado; NÃO EXECUTADO NESTA SESSÃO. Não existe snapshot hash de cenário novo medido; NÃO inventar valor.

## Cenários mínimos que devem ter vetor real (G2/G3/G7)

| ID | Setup e input | Invariante exigida | Oráculo legado |
|---|---|---|---|
| PVP-01 | Registry.create(2), join segundo token, inspecionar seats | apenas 2 humanos: blue controla MID/TOP/JG/ADC/SUP, red controla MID/TOP/JG/ADC/SUP | v453_dev47_multiplayer_network |
| PVP-02 | p1 envia order.stop unitId red_TOP seq=1 | rejeitar sem consumir sequence nem alterar snapshot/checksum | v453_dev47_multiplayer_network |
| PVP-03 | p1 seq1 order.stop blue_TOP, p2 seq1 order.stop red_TOP | ambos ACK, nenhuma autoridade do cliente sobre opponent | tests/m45_platform_legacy_golden.test.mjs (novo) |
| PVP-04 | retransmitir seq1 mesmos bytes e seq1 payload diferente | mesmo ACK para mesmo pacote; variante diferente rejeitada; state hash idêntico | v453_dev47_multiplayer_network |
| PVP-05 | alterar somente unit enemy visibility antes de view blue/red | não incluir inimigo oculto, RNG, snapshot inteiro, plano inimigo nem metadados de private state | v453_dev47_multiplayer_network (parcial) |
| PVP-06 | p1 ready, depois p2 ready | sem execução após primeiro; uma execução após segundo; equal outcome invertendo ordem ready | v453_dev47_multiplayer_network (parcial) |
| PVP-07 | persist/reload registry + cookie original + reenvio de seq anterior | idempotência, revisão, inventário, estado e sessão preservados | v453_dev47_multiplayer_network; v453_dev61_shop_undo_pvp |
| PVP-08 | HTTP create/join/session/stream em duas cookies isoladas | não enviar estado privado no JSON/SSE do adversário | v453_dev47_multiplayer_network |
| PVP-09 | duas sessões Chromium loja e Undo; duas confirmações | UI e server recebem comandos por seat; screenshot e logs | tools/chromium_pvp_dev62_two_sessions.py |
| PVP-10 | ausências: online draft, parser/voz, postgame, endgame, fog dynamic | novas golden E2E Rust/browser obrigatórias, NÃO cobertas pelo PvP HTTP atual | G3 G4 G7: NOT_RUN |

## Comandos reproduzíveis no checkout real da fonte

- node tests/v453_dev47_multiplayer_network.test.mjs
- node tests/v453_dev46_vision_pvp.test.mjs
- node tests/v453_dev61_shop_undo_pvp.test.mjs
- node tests/m45_platform_legacy_golden.test.mjs
- python tools/chromium_pvp_dev62_two_sessions.py (requer Chromium/Playwright e binários)
- npm test (gated por Issue #1; não chamar PASS até ambiente completo)

## Formato exigido para golden definitivo do Rust

Cada linha/fixture precisa de: fonte SHA, patch/schema/protocolVersion, mapHash, seed e estado RNG apenas server-side, partida e seat IDs fixos, before snapshot privado hash, duas intents ordenadas com request ID e sequência, duas ordens de ready, events causal ordered, HP/CS/gold/item/XP/tempo/visão após executar, ack idempotente, team views blue/red, postgame e replay hash. Gerar vetores somente a partir do legado executado; serializar views filtradas separadamente; hash de estado privado nunca ir ao client.

Não confundir teste visual com prova de isolamento. Manter ambas as ordens de ready e duas redes isoladas, reconexão com backlog e limites de payload/SSE, ataques de impersonação por unitId e seatId, payload extra, sequence gap/replay, ghost wards/invisibilidade, duplicação de compra, Undo após sair e retornar à loja. 
