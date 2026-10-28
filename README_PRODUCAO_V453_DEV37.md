# CoachLOL — Como continuar a dev37

1. Extrair este ZIP mantendo `CoachLOL_MacroArena/`, `data/`, `assets/`, `docs/`, `tests/` e `.git/`.
2. Dentro da pasta `CoachLOL_MacroArena`, executar `npm test`. Não realizar reset Git para “limpar” alterações herdadas.
3. Abrir `index.html` ou usar ambiente web local compatível com assets. Loja e árvore oficial podem ser consultadas em `catalogo_riot_26_21.html` (dados completos 26.21, somente leitura).
4. Para revalidar catálogo após alteração consciente dos itens locais: `npm run catalog:publish:dev37`, gerando `catalog_26_21_dev37.{json,js}` sem tocar no arquivo da dev36.
5. Para confirmar UI interativa do lote: `python tests/browser_v453_dev37_shop.py` (requer Playwright, Pillow e Chromium locais).
6. Para partida longa bot baseline: `node tools/pacing_item_probe_v453_dev29.mjs 26 baseline 2700`; para relatórios usar `REPORT_JSON=caminho.json`.

**Não marcar como implementado**: passiva Bullseye, Canhão energizado, regeneração do Anel, ampla cobertura dos 246 candidatos e 173 campeões. **Não ativar** automaticamente dados futuros de patch.
