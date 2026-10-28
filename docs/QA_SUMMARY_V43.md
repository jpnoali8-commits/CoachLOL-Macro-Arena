# CoachLOL V4.3 — Evidências de QA

- `npm test`: **226 verificações ✓**, incluindo 13 contratos V4.3; aprovado.
- `node tests/v43_items_runes_economy.test.mjs`: 13 contratos específicos V4.3 aprovados.
- `python tests/browser_v43_shop_runes.py`: compra, venda, troca de runas, modal da loja e 0 erros JavaScript no Chromium.
- `node tests/v20_long_match.mjs 300 43`: 300 segundos simulados sem violações de invariantes.
- `docs/PREVIEW_V43_SHOP_RUNES_CHROMIUM.png`: captura do teste inline; imagens externas não carregam no ambiente isolado.
- Node/Browser core sincronizados com `python tools/sync_browser_v43.py`.

**Os testes não certificam balanceamento 1:1, compatibilidade com multiplayer nem todas as habilidades e itens.**
