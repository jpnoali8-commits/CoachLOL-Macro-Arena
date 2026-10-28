# CoachLOL — Changelog V4.5.2d-4-dev12

## Base e origem
Desenvolvido sobre V4.5.2d-4-dev11, com o arquivo de origem `Masks(1).zip`. Todos os arquivos JPG recebidos foram preservados na pasta `assets/user_rift_masks_20261026/masks/`. Nenhum commit/reset destrutivo sobre o Git herdado.

## Regras
- **15 pontos Florividente** capturados de `Florividentes.jpg`, ao contrário dos 12 pontos provisórios do dev8. Existem em qualquer variante elemental.
- **Horário da planta e efeito de Chemtech separados.** Não-Quimtec: detecta e revela sentinelas sem reduzir HP. Com Quimtec: bônus de velocidade dos aliados atingidos, visão local adicional e redução das sentinelas detectadas a 1 HP. A revelação permanece privada por equipe e expira.
- **Faixas 2026:** florividentes normais respawn de 200–260s simulados; novos 90–120s. Novos pontos aparecem com 15:00 ou transformação do Rift.
- **ATENÇÃO:** a máscara mostra 15 posições, mas não marca o tier. A associação 5 iniciais / 10 adicionais foi inferida pela distância aos antigos 10 marcos tardios. Portanto, **a classificação de pontos NÃO é oficialmente certificada** e precisa de validação do usuário.
- **Cone autoral:** `Florividentes-ranged-horizontal-esquerda-para-direita.jpg` foi convertido em polígono local (ponta na esquerda, abertura na direita); ângulo de 0–359° selecionado no painel. Sem círculo genérico de orientação automática.
- **Frutas de cura:** 10 locais da máscara existem antes de Quimtec; este concede escudo e remove slow de consumo. Sem transformação, cura e lentidão temporária.
- **Brushs:** o brush normal substitui o campo `brush` em `data/masks_128.json` (34 células diferentes da dev11). O Oceano possui deltas próprios de 92 células adicionadas e 4 removidas (521 células finais), preservando `wall`.
- **Navegação:** um marcador foi desenhado em colisão (`scryer_mask_11`); ponto de imagem preservado em `paintAnchor`, interação deslocada à célula caminhável mais próxima (≤0,015 normalizado).
- **Legados:** máscara normal e Oceano, Golpear competitivo, Champ Select de dois feitiços, farm, Lumes Feéricos e pós-jogo preservados.

## Arquivos centrais
`engine.mjs`, `engine.browser.js`, `app.js`, `data/bootstrap.js`, `data/masks_128.json`, `data/masks_128_dev11_baseline.json`, `data/rift_user_manifest_v452d4.json`, `data/rift_user_assets_v452d4.js`, `data/rift_bundles/ocean.json`, `tools/import_authorial_masks_v452d4_dev12.py`, `tests/v452d4_dev12_authorial_masks.test.mjs`.
