# Comece aqui — CoachLOL Macro Arena V4.5.2d-4-dev18

**Base canônica:** este diretório, copiado integralmente da dev17 sem apagar o histórico Git ou as alterações herdadas. Não reverter para ZIPs anteriores.

## Executar
Abra `index.html` no ambiente local com o navegador compatível; o motor principal é `engine.mjs`, sincronizado para `engine.browser.js` por `python tools/sync_browser_v43.py`. Consulte as instruções de projeto anteriores para detalhes de navegador/arquivos.

## Validar
`npm test` — regressão global incluindo contratos da dev18.
`npm run test:v452d4:dev18` — 11 novos contratos de Ancião e fog.
`python tests/browser_v452d4_dev18_elder_microticks.py` — fixture Chromium de sub-ticks/replay.

## Próxima implementação
Dev19: avançar as partidas longas com movimentação, visão, eventos de objetivo e Nexus até pós-jogo; consolidar a reconciliação da duração do Ancião por patch. O multiplayer e a paridade LoL 1:1 ainda não estão certificados.
