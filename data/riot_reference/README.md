# Data Dragon 16.21.1 — referência opcional, não motor

Baixe manualmente os arquivos `champion.json` e `item.json` de:
- https://ddragon.leagueoflegends.com/cdn/16.21.1/data/en_US/champion.json
- https://ddragon.leagueoflegends.com/cdn/16.21.1/data/en_US/item.json

Execute:

```bash
node tools/import_riot_reference_v452d4_dev19.mjs --champions /caminho/champion.json --items /caminho/item.json --output data/riot_reference/reference_16.21.1.json
```

**IMPORTANTE:** Esta execução não conseguiu baixar os arquivos Riot. O ZIP NÃO inclui um catálogo Riot externo completo. O importador foi testado usando JSON de exemplo produzido exclusivamente para QA. Ele mantém os dados de referência SEPARADOS do motor. Nenhum item, receita, passiva, habilidade ou stat novo é aplicado automaticamente a uma partida.

O `champion.json` básico não inclui a execução de QWER nem passivas. Mesmo os JSONs individuais de campeões não oferecem toda a lógica de transformações, colisão ou isolamento dimensional. Catalogar **não** equivale a implementar. Ver `docs/ARQUITETURA_KITS_FORMAS_REALMS_V452D4_DEV19.md`.

## Dev32 — proteções na importação do catálogo completo

O importador de referência dos itens (sem aplicar) aceita a mesma versão do Data Dragon e gera um relatório auditável:

```bash
node tools/import_full_shop_v453_dev30.mjs --input /caminho/item.json --output data/riot_reference/catalogo_26_21.json
```

Para aplicar ao motor, `--apply` exige um catálogo inteiro (>=150 registros SR compráveis) e **zero ingredientes não resolvidos**. As regras de passivas e ativáveis não são inferidas de textos descritivos. Um catálogo aplicado precisa ainda passar por testes de compra, efeitos, snapshots e comparativos de duração. O arquivo `item.json` oficial **não foi obtido nesta execução**: a loja jogável dev32 contém 62 entradas (incluindo trinkets, itens não compráveis e quests), **não 208 itens certificados**.
