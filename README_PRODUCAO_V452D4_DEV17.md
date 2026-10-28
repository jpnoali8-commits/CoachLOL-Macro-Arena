# Como continuar a produção — V4.5.2d-4-dev17

- Base executável: **V4.5.2d-4-dev17**. Consultar `CHANGELOG_V452D4_DEV17.md` e `docs/QA_V452D4_DEV17.md`.
- Rodar `npm run test:v452d4:dev17` ou `npm test` para regressão total.
- Smoke browser: `python tests/browser_v452d4_dev17_siege.py`. O script embute os SVGs originais e o atlas redimensionado apenas para a fixture visual, pois navegação localhost é bloqueada no ambiente.
- Testes do core precisam exercitar movimento real, dano à estrutura e snapshots; jamais inventar dano por apenas escrever HP direto nas torres.
- Motor Node é fonte de verdade, `engine.browser.js` deve ser regenerado com `python tools/sync_browser_v43.py` após mudar `engine.mjs`.
