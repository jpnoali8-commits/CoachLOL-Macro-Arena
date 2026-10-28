# CHANGELOG — V4.5.2d-4-dev13

## Entrega
- UI da Florividente simplificada e compacta.
- Removidos textos técnicos visíveis ao jogador como **"cone direcional"** e **"máscara"**.
- Novo seletor com:
  - círculo central compacto,
  - seta ao vivo,
  - controle por clique/arrasto na própria seta,
  - slider de rotação abaixo,
  - única ação principal **Confirmar**.
- Overlay anterior com múltiplos botões direcionais foi removido.
- Mantidas as regras da dev12 para Florividentes, Quimtec, moitas e máscaras.

## QA resumido
- `node --check app.js` PASS
- `tests/v452d4_dev13_compact_scryer_ui.test.mjs` PASS
- `python tests/browser_v452d4_dev13_scryer_ui.py` PASS
- `npm test` PASS
