# QA V4.5.3-dev30 — Loja com compra por receita

## Verificado

- `npm test`: PASS exit 0, log `docs/QA_EVIDENCE_V453_DEV30/npm_test_full.log`.
- 9/9 novos contratos em `tests/v453_dev30_recipe_shop.test.mjs`.
- Chromium real via `tests/browser_v453_dev30_recipe_shop.py`: PASS — Rabadon selecionado, 2 bastões comprados dentro da árvore, peça final combinada por 1.100 de ouro restantes, atlas original + 15/15 SVGs carregados, 0 erros JavaScript.
- Dados financeiros da fixture: inicial 10.000; primeiro bastão 8.800; segundo 7.600; Rabadon final 6.500; inventário final apenas `rabadon`.
- Regressão de duração em quatro seeds × perfis: `baseline/26` 33:18, `baseline/42` 33:24, `poke/26` 31:39, `engage/42` 23:27. 4/4 vitórias por destruição natural do Nexus; hashes e durações idênticos à dev29 nesses quatro cenários, sem inferir paridade para todos os drafts.
- `node --check app.js` e motor; `python tools/sync_browser_v43.py` 70 exports.
- Integridade dos arquivos e ZIP: conferir após criação; Git herdado mantido, sem commits ou resets.

## Não certificado

- Catálogo integral: 49 cadastrados, fonte oficial JSON não pôde ser baixada aqui; importador ensaiado com amostras sintéticas, **não** é evidência de importação real de dados Riot.
- Passivas/ativáveis de todos os itens e paridade estatística com 26.21: pendentes.
- Realm/overlay da ultimate de Mordekaiser: **só especificação**.
- Partida 5v5 completa com interações manuais de loja no Chromium: não executada; teste Chromium concentrou-se no fluxo de compra da receita.
