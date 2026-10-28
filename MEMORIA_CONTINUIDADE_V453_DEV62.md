# Memória técnica — CoachLOL Macro Arena V4.5.3-dev62

## Fonte canônica
- Pacote de entrada: ZIP mestre V4.5.3-dev61, extraído com `.git`, assets, 2.421 entradas de arquivo. Nenhum `git reset`, exclusão ou substituição por versões antigas.
- PvP estritamente dois jogadores humanos, cada um gerencia cinco campeões da sua equipe.
- Motor Node `engine.mjs` e browser `engine.browser.js` sem mudanças de mecânicas nesta etapa; rotina de sync deve permanecer íntegra.

## Alterações reais
- Loja na própria região de partida em `multiplayer.html` com `shopOverlayPvp`; CSS em `multiplayer/shop_v453_dev62.css`.
- `shopChampionPvp` escolhe qualquer um dos 5 campeões sem interferir em `selectedUnitIds` (multiseleção do combate).
- `/api/shop/quote` calcula no servidor `arena.itemPurchaseCost`, chama `canBuy`, valida cookie e ownership. Browser exibe cotação real e desconto por componentes. Compra continua exclusivamente via `item.buy` do gateway.
- `shopUndoStateV453Dev62`: campo privado por unidade própria exibindo status/motivo de bloqueio; servidor mantém toda regra transacional dev61, inclusive a invalidade por abandono da fonte.
- `referenceItems`: expõe 100 itens Riot SR reference_only para consulta, sem ação de compra, e sem falso status de implementação.
- Loja exibe receitas clicáveis para componentes já jogáveis, inventário, gold.sell, fila, atributos e preços.

## Cobertura e limites
- 18 testes dev62 HTTP/motor com duas sessões independentes, compras, Desfazer, preços, autenticação, permissões e duas confirmações.
- 13 checks Chromium headless em contextos isolados, DOM real e transações contra servidor Node via ponte Python; imagem de mapa/SSE e HTTP nativos bloqueados no Chromium por administrador. Não foi realizada partida humana PvP completa com destruição do Nexus.
- Contagem jogável inalterada: 102/202 gerais, 100 apenas referência. Nenhuma passiva nova declarada funcional.
