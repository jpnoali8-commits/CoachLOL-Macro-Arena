# README de produção — V4.5.2d-4-dev25

A versão atual parte de dev24 e corrige desempenho do sistema de minions/estruturas; não altera balanceamento diretamente.

- `npm test` para regressão integral.
- `npm run test:v452d4:dev25` para equivalência de minions e bloqueadores de rota.
- `npm run audit:pacing:dev25` para refazer 30 partidas (recomendado MAX_PROBE_MS=40000 e logs persistentes).
- `python tests/browser_v452d4_dev25_siege_smoke.py` para fixture Chromium controlada e capturas reais.

Fontes: engine.mjs e engine.browser.js gerado por `tools/sync_browser_v43.py`. Não substituir por scripts de versões antigas. Paridade 1:1 com LoL não certificada.
