# Changelog — V4.5.3-dev33

## Itens funcionais do primeiro lote desta versão
Códice Demoníaco, Dente de Na'Shor, Lembrete Mortal, Morellonomicon e Cetro de Cristal de Rylai, com receitas e efeitos específicos testados; catálogo local 62→67. A compra direta por componentes é preservada. Não declarar paridade integral do LoL.

## Infraestrutura de atualizações contínuas (sem atualização automática do combate)
- `data/patch_center/current.json`: versão canônica pinada 26.21/16.21.1 e próxima versão prevista.
- `tools/check_riot_patch_v453_dev33.mjs`: verificação de versão no endpoint oficial, validação, comparação com versão ativa e download opcional de arquivos de referência quando a rede estiver disponível. Não modifica o motor.
- `tools/patch_center_v453_dev33.mjs`: snapshots imutáveis com checksums e importação de dados estáticos, validação de amostra completa, diffs de preço/receita/stats/passivas e QWER a partir de detalhes individuais, fila de revisão bloqueada até aprovação/testes.
- Testes: 7 contratos novos, integrados ao `npm test`. Proteção para catálogo parcial, divergência de versão, comparação entre idiomas e sobrescrita.
- Guia operacional em `docs/PATCH_CENTER_V453_DEV33.md`.

## Compatibilidade
- Nenhuma alteração nas regras de combate apenas por detectar nova versão.
- Histórico Git, máscaras, visões, golpear, Rift, Arauto e UI existentes preservados.
- Nenhum patch 26.22 pré-lançamento ativado.
