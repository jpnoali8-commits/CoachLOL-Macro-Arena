# QA V4.5.3-dev48

- Base: Dev47 ZIP original, 2.281 entradas, CRC PASS.
- `npm test`: PASS na execução final com o teste da dev48 incluído.
- Teste específico dev48: 12/12, inclui waves, formação, função de colisão e loja.
- Testes históricos de farm: PASS após separar formação visual de lógica autoritativa. A primeira tentativa de colisão direta nos minions reduziu o CS e foi revertida; não declarar minion-block integral.
- Ícones de estruturas originais fornecidos pelo usuário: 8/8 PNG, 768x768.
- Fonte oficial de itens: Dados Riot Data Dragon 16.21.1 disponíveis no ZIP; consulta sem compra de itens não certificados.
- Chromium: BLOQUEADO por política do ambiente (`ERR_BLOCKED_BY_ADMINISTRATOR` ao abrir arquivo local). Não existe captura aprovada da dev48.
- Testes de rede PvP históricos incluídos em `npm test`, mas nenhuma certificação nova de latência online foi realizada.
- Regressão integral de desempenho/partidas longas e minion-block entre tropas: pendente para próximo lote.
