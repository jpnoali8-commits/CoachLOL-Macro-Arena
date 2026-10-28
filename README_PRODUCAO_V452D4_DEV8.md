# Produção V4.5.2d-4-dev8

1. Extraia o ZIP completo. Execute `INICIAR_WINDOWS.bat` ou servidor estático local.
2. Para QA: `npm test`, `npm run test:v452d4:dev8`, `python tools/sync_browser_v43.py`.
3. Para o smoke Chromium via documento inline e hook apenas no teste: `python tools/test_dev8_endgame_browser.py`. O teste exige Chromium/Playwright e **não cria hook no jogo de produção**.
4. Para reexportar sites provisórios: `python tools/build_scryer_sites_v452d4_dev8.py` — substitua posteriormente com máscaras de Florividentes verificadas; não marcar posições provisórias como oficiais.
5. Consulte `docs/QA_V452D4_DEV8.md` e `docs/MEMORIA_V452D4_DEV8.md` antes da próxima etapa.
