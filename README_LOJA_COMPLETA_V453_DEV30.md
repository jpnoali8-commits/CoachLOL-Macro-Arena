# Loja CoachLOL V4.5.3-dev30 — situação de cobertura e importação

## O que já funciona no jogo entregue

- 49 itens no cadastro jogável herdados da dev29.
- Abrir **Rabadon** → clicar no **Bastão Desnecessário** → **COMPRAR** o componente separadamente, sem perder a árvore do item maior.
- Componentes repetidos (2 bastões) possuem posições independentes, contagem correta, estado **já no inventário**.
- Comprar item final consome os componentes e reduz o preço restante uma única vez por cópia.
- Uma receita com intermediários (por exemplo Trindade → Brilho → Partícula Brilhante) permite abater os subcomponentes que estejam no inventário, inclusive com inventário cheio, sem crédito duplicado.
- Compra programada, restrições de fonte, ouro e snapshot permanecem no motor.

## Catálogo completo — pendente de dados de origem

A Riot publica a lista de itens do patch 26.21 no Data Dragon **16.21.1**. O ambiente de produção desta entrega não conseguiu obter `item.json` externamente; portanto, **não foi inserido um catálogo inventado como se fosse oficial**. Itens que não possuem comportamentos implementados são identificados no importador como `official_data_stats_unverified_passives`.

Arquivo de origem oficial (baixar com acesso à Internet):

https://ddragon.leagueoflegends.com/cdn/16.21.1/data/en_US/item.json

Após baixar e salvar em `data/riot_reference/item_16.21.1_en_US.json`, executar:

```sh
node tools/import_full_shop_v453_dev30.mjs --input data/riot_reference/item_16.21.1_en_US.json
# examinar relatório data/riot_reference/shop_26_21_dev30.json
node tools/import_full_shop_v453_dev30.mjs --input data/riot_reference/item_16.21.1_en_US.json --apply
npm test
```

O importador lista itens de **Summoner's Rift (mapa 11)** disponíveis para compra, custos, componentes, estatísticas numéricas explicitamente fornecidas e os ícones do CDN. Preserva os 49 itens existentes e gera novos registros no motor. Separa os efeitos ainda pendentes em vez de inventar passivas, ativáveis ou equivalência 1:1.

**Requisito comercial final:** completar todos os itens disponíveis para compra da versão escolhida e implementar/validar também as passivas, ativações, restrições, receitas e casos especiais, em etapas documentadas. Esta dev30 ainda **não** cumpre essa certificação de gameplay integral.
