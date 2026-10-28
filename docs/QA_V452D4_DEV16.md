# QA — V4.5.2d-4-dev16

| Verificação | Resultado |
|---|---|
| SVGs novos declarados CC0 | PASS — 15/15 |
| XML/SVG sem textos/fontes e sem imagem externa | PASS — 15/15 |
| Ícones distintos por elemento | PASS |
| Minions por classe e time | PASS — 8/8 |
| Raio da Planta Explosiva projetado, não círculo plano | PASS — contrato de código |
| VFX da Mão do Barão derivado do motor, sem letra | PASS |
| Novos contratos de ícones | PASS — 6/6 |
| Novos contratos de cerco Barão | PASS — 3/3 |
| Legado dev15 migrado para SVGs | PASS — 2/2 |
| `npm test` integral | PASS — exit 0 |
| `node --check app.js` e arquivos de engine | PASS |
| Node/browser sync | PASS — 68 exports |
| Chromium com todos os 15 SVGs carregados | PASS — 15/15 |
| Chromium atlas original (reduzido apenas na fixture) | PASS |
| Erros JS no Chromium | 0 |
| Partida orgânica completa | NÃO EXECUTADA |
| Paridade visual exata com League of Legends | NÃO CERTIFICADA — desenhos originais |

**Capturas verificadas:** `docs/QA_EVIDENCE_V452D4_DEV16/cc0_icons_map_actual_chromium.png` e `.../cc0_icons_map_crop_chromium.png`. Essas são capturas reais do Chromium da fixture controlada, não imagens promocionais. O atlas foi reduzido de resolução somente para carregamento local no teste; o jogo mantém a imagem original.

**Prévia dos desenhos gerados:** `docs/QA_EVIDENCE_V452D4_DEV16/cc0_sprite_contact_sheet.png` (montagem produzida diretamente pelos SVGs; não é captura de jogo).

Os testes não provam um cerco 5v5 orgânico completo. A configuração inicial do teste de Barão foi ajustada para não manter outro titular ativo ao verificar a morte de um titular; a lógica correta do motor foi preservada.
