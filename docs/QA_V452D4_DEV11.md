# QA V4.5.2d-4-dev11

- `npm test`: PASS exit 0; execuções dos legados, V4.5.2c farm, dev9 20/20, dev10 7/7 e dev11 10/10.
- `node --check engine.mjs`, `node --check app.js`, `node --check draft.js`: PASS.
- `python tools/sync_browser_v43.py`: PASS, 66 exports.
- `python tools/test_dev11_draft_browser.py`: PASS; dois dropdowns D/F em Jungler e MID, Golpear preservado, screenshot real Chromium 1600×900; pageErrors=0.
- `python tools/test_dev11_smite_browser.py`: PASS F e D; 8 ticks de combate, dragão real chega a 1351/6200 HP, 1400 versus 1000 Golpear, 10 campeões, 1 captura, pageErrors=0, screenshot real Chromium 1440×900.

## Não certificado

- Jogo orgânico completo desde o primeiro minuto e múltiplas composições completas de draft.
- Teste com vídeo de dragão/Barão real ou renderer GLB, ainda sem arquivos.
- Paridade 1:1 com o cliente oficial da Riot.
- Posições oficiais de Florividentes, aguardando máscara do usuário.
