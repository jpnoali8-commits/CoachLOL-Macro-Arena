# CoachLOL — Como continuar a V4.5.2d-4-dev7

1. Extraia o ZIP completo. Preserve `.git`, alterações locais e máscaras.
2. Execute `npm run test:v452d4:dev7`, `npm run test:v452c`, `npm test`.
3. A entrada offline do jogo segue `index.html`; o motor canônico é `engine.mjs`, com `engine.browser.js` sincronizado.
4. Instrumentação em `postgameEntryV452d4Dev7`, `creditGoldV452d4Dev7`, `spendGoldV452d4Dev7`, `recordChampionDamageV452d4Dev7`, `samplePostgameV452d4Dev7`; apresentação em `postgame.js`/`postgame.css`.
5. Evidência visual: `docs/QA_EVIDENCE_V452D4_DEV7/` (fixture Chromium). Não confundir com partida integral.
6. Leia `docs/MEMORIA_V452D4_DEV7_CONTINUIDADE.md` e `docs/ROADMAP_V452D4_DEV7.md` antes da dev8.
