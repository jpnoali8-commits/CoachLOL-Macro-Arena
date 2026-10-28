# QA — V4.5.3-dev53

| Validação | Resultado |
|---|---|
| `node tests/v453_dev53_lane_collision_items.test.mjs` | PASS 14/14 |
| `npm test` integral | PASS (saída 0) |
| Seed 26, 2400s máx. | PASS, Nexus destruído aos 1284s, equipe vermelha |
| Seed 42, 2400s máx. | PASS, Nexus destruído aos 1400s, equipe azul |
| Invariantes das partidas | 0 violações |
| Status de loja SR 26.21 | 202 gerais, 88 engine, 114 reference_only |
| Data Dragon 16.21.1 custo/receita dos dois itens novos | PASS |
| Snapshot determinístico e pulsos de mana | PASS |
| Colisão segmento-hitbox e saída de sobreposição | PASS |
| Node vs browser | sincronizado por gerador; 71 exports |
| Chromium visual | **NÃO EXECUTADO NESTA ETAPA** |
| Minion-minion pathfinding/aggro no padrão completo do LoL | **NÃO CERTIFICADO** |
| Imagens oficiais Data Dragon offline | **PENDENTE** |

## Limitações remanescentes

A física alterada é aplicada ao caminho de campeões e às hitboxes existentes; não substitui o pathfinding completo de tropas por um sistema dinâmico de empurrão. A seleção de combate da abertura mantém o resolvedor de farm calibrado até 300s. Dados do patch arquivado são referência, não confirmação de todas as mecânicas do cliente. Só dois itens foram liberados neste lote.

## Evidência local

`docs/QA_EVIDENCE_V453_DEV53/npm_test_full.log`, `long_match_seed_26.json/.log`, `long_match_seed_42.json/.log`, `test_dev53.log`, `sr_catalog_dev53.json`. Não há screenshot do Chromium.
