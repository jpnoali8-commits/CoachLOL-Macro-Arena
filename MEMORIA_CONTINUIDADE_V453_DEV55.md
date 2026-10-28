# Continuidade técnica dev55

Versão: V4.5.3-dev55, derivada sem reset da dev54. `engine.mjs` é fonte da lógica; executar `python tools/sync_browser_v43.py` após editar.

Itens: `wits_end` (3091) e `phantom_dancer` (3046). `ITEM_RECIPES`, `ITEM_EFFECTS_V43` e o JSON de seleção `data/riot_reference/sr_shop_26_21_dev49.json` foram atualizados. 92/202 vinculados ao motor e 110 apenas consultáveis. Wit's End onhit é um adaptador de 45 de magia fixa, escalamento completo pendente. Dançarina Fantasma ignora colisões físicas das unidades, não paredes, em movimento explícito.

Minions: `updateMinionBodiesV453Dev51()` contém cap e swept geometry em deslocamentos anormais acima de 320 unidades, sem alterar a progressão econômica da lane. Primeira tentativa afetou CS e resultado das partidas; ajuste final reproduziu seeds 26/42 e métricas mid idênticas à dev54 (1284 red 44/52; 1400 blue 28/40). Não considerar minion block 100% completo.

`npm test` após ajuste final passou; teste específico 12/12. Chromium não certificado. Ícones Riot offline pendentes. Não implementar ou priorizar IA avançada. Prioridade permanente PvP e catálogo completo de campeões. Não tocar no tabuleiro 2.5D deste outro projeto.
