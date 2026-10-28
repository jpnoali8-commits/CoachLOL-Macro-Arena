# Memória de continuidade — dev30

- Base = CoachLOL Macro Arena V4.5.3-dev30, derivada da dev29, preserve todos os sistemas, os SVGs CC0, o atlas autoral e os arquivos `.git` inclusive alterações não commitadas.
- Loja: `app.js` agora conserva `shopRecipeRoot`, `shopSelection`, mostra árvore recursiva e compra qualquer ingrediente diretamente por `shopRecipeQuickBuy`; `engine.mjs` tem `recipePurchasePartsV453Dev30`, `recipeTreeV453Dev30`. Testes dev30 9/9 + Chromium.
- Catálogo real ainda 49 itens; **não** declarar que todos os itens do LoL estão implementados. Dados oficiais Data Dragon 16.21.1 exigem arquivo `item.json` autêntico; `tools/import_full_shop_v453_dev30.mjs` preparado, mas não aplicado. Mesmo importado, efeitos especiais permanecem pendentes.
- Mandatório na V4.5.4: Mordekaiser R é um 1v1 isolado no motor, overlay quadrado compacto canto superior esquerdo contendo círculo de movimentação, MESMAS coordenadas, colisores, paredes, brushes e versão ativa do terreno elemental do tabuleiro principal. Ao final ambos retornam em coordenadas coerentes ao campo. Documento `docs/ARQUITETURA_REINO_DA_MORTE_MORDEKAISER_V454.md`.
- Usuário deseja média ~30 minutos, vitória sempre por destruição real de Nexus, sem cronômetro; repetir amostra após cada lote de itens/kit.
- Próximo marco dev31: importar catálogo completo verificado e implementar efeitos de itens em grupos com auditabilidade, mais screenshots e testes. V4.5.4: classes/skills/forms e Mordekaiser.
