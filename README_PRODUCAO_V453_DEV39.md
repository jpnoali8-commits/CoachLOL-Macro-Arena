# Produção / continuidade da dev39
1. Descompactar o ZIP mestre completo da dev39 preservando o diretório `.git`, sem limpeza destrutiva.
2. Na raiz `CoachLOL_MacroArena`: `npm test` para legado e dev39; `npm run test:v453:dev39` para lote isolado.
3. Para alterações do motor: `python tools/sync_browser_v43.py`, seguido de `node --check engine.browser.js` e todos os testes.
4. Browser: `python tests/browser_v453_dev39_onhit_hud.py`, gera 2 PNGs reais do Chromium na UI original.
5. Pacing: `REPORT_JSON=... node tools/pacing_item_probe_v453_dev29.mjs 26 baseline 2700` e repetir para seeds 36 e 42; saída só certifica essa amostra.
6. Matriz de itens: `docs/QA_EVIDENCE_V453_DEV39/item_coverage_dev39.json`. Verificar manualmente antes de dizer que uma passiva é 100% Riot.
7. Central de Patches mantém patch 26.21 até importação, revisão e testes de versão futura.
