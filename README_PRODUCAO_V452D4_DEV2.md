# CoachLOL Macro Arena — V4.5.2d-4-dev2 (pacote completo)

Base canônica: V4.5.2d-4-dev1. Incremento: atlas e funcionalidades do Rift Elemental dinâmico com máscaras recebidas. Este ZIP contém o jogo completo, `.git` herdado, documentação, testes, gerador, atlas e skill, e NÃO substitui arquivos por versões antigas.

## Abrir o jogo

Abra `index.html` em um navegador desktop moderno com acesso a arquivos locais. O motor offline é `engine.mjs`, compilado para o navegador por `tools/sync_browser_v43.py` em `engine.browser.js`; `data/rift_user_assets_v452d4.js` pré-carrega os seis bundles sem `fetch` HTTP.

## Testar

```bash
node --check engine.mjs
node --check app.js
python tools/sync_browser_v43.py
node --check engine.browser.js
npm run test:v452d4
npm run test:v452d4:masks
npm run test:v452c
npm run test:v452d
npm run test:v452d2
npm run test:v452d3
npm test
```

`npm test` executou completamente com exit 0 nesta entrega, após inclusão do décimo contrato de Bloom. Visual Chromium foi tentado e expirou por timeout, portanto **não certificado visualmente**.

## Arquivos-chave

- `data/rift_user_manifest_v452d4.json`: pontos e hashes do atlas fornecido.
- `data/rift_bundles/{mountain,ocean,cloud,chemtech,hextech,infernal}.json`: variantes importadas.
- `data/rift_user_assets_v452d4.js`: ponte offline dos dados.
- `assets/user_rift_masks_20261026/`: cópias de todos os mapas/máscaras recebidos.
- `tools/import_user_rift_maps_v452d4.py`: conversão reprodutível PNG 4096→128 e detecção de pontos; não requer Blender para importar máscaras.
- `tests/v452d4_user_masks_gameplay.test.mjs`: 10 testes novos.
- `docs/QA_RIFT_ELEMENTAL_V452D4_DEV2.md`: evidências, certificações e pendências.
- `docs/MEMORIA_RIFT_V452D4_DEV2.md`: handoff para próximo chat/Codex.

## Uso no mapa

A versão padrão decide o Rift ao segundo abate de dragão: o **terceiro dragão surge no Rift transformado** e não há nova transformação. A fruta explosiva apresenta escolha de direção para o campeão selecionado e lança os demais afetados radialmente. Para ativar frutas e portais, selecione o campeão azul próximo, depois clique no ícone correspondente. A transformação só apresenta as plantas Quimtec/portais Hextech/vento Nuvens na variante ativa. Infernal conserva os mesmos obstáculos; apenas uma tonalidade leve aparece.

A máscara de rota TOP corrigida foi guardada no pacote, mas não habilitada em `data/masks_128.json`: requer validação de IA de farm e trajetória. As regiões de Faelights são aproximações circulares. Sem certificados 1:1 ou gate visual completo.
