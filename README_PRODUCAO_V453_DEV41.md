# Execução e continuidade — V4.5.3-dev41

1. Extraia o **ZIP mestre completo**. A versão é `4.5.3-dev41` em `version.json` e `package.json`; não execute `git clean`, `reset`, `rebase` ou `commit` sem autorização.
2. `npm run test:v453:dev41` executa os 18 novos contratos; `npm test` executa a regressão integral. O projeto deve continuar em Node e no navegador.
3. Após qualquer mudança em `engine.mjs`, executar `python tools/sync_browser_v43.py` e comparar os resultados em Node/Chromium.
4. `python tests/browser_v453_dev41_champion_onhit_q.py` usa Chromium e Playwright, interface real `index.html`, mapas/autoria e engine atual, e salva PNGs/JSON em `docs/QA_EVIDENCE_V453_DEV41`.
5. `node tools/long_match_pacing_probe_v452d4_dev23.mjs 2400 26` (também seeds 36 e 42) verifica partida autônoma e invariantes; dados desta entrega na mesma pasta de QA.
6. A implementação dos Qs de Ezreal e Irelia é parcial. O projeto não altera dados oficiais automaticamente: patch de referência 26.21 / Data Dragon 16.21.1 continua arquivado.
7. A próxima fase deve priorizar colisores dinâmicos e tempo de viagem dos projéteis, interrupções do dash e outros kits completos por lotes.
