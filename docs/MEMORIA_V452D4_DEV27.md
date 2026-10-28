# Continuidade — CoachLOL V4.5.2d-4-dev27

- Usar **somente** o ZIP completo dev27, não reverter ao engine dev25/dev26.
- Base offline autoritativa: `engine.mjs`, sincronizada com `engine.browser.js` por `tools/sync_browser_v43.py`. 68 exports.
- **Visão:** a detecção de wards inimigas por Oracle/control ward depende de distância **e LOS detector → ward**. A equipe também precisa ter visão legítima do ponto. Não vazar ward inimiga por fonte aliada atravessando parede.
- **Perspectiva:** `perspective(team)` calcula fontes uma vez por chamada; `visible` e `wardKnownTo` aceitam parâmetro opcional `sources`. Não acrescentar cache entre ticks sem invalidação formal.
- **Saída adversária:** wards inimigas vistas têm somente os 7 campos publicamente relevantes; wards próprias não são reduzidas.
- Preservar a dev26: pink contra pink, Lumes com 45s polígono e raio normal +25%, Rift seis variantes, Oracle, Florividentes, máscaras autorais, SVGs CC0.
- Pacing: dev27 10/10 Nexus, 10/10 hashes idênticos à dev26, média 27:29 no lote. Meta de duração ~30min por Nexus real, nunca hard cap.
- QA: `npm test` PASS, `npm run test:v452d4:dev27` 8/8, Chromium controlado PASS.
- Pendências: partida inteiramente orgânica em Chromium, profiling em mapas densos e conteúdo de itens/receitas (V4.5.3) e kits/transformações (V4.5.4), sem declarar paridade antes dos testes.
