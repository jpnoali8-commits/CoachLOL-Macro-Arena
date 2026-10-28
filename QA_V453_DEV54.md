# QA — CoachLOL V4.5.3-dev54

## Certificação realizada

| Verificação | Resultado |
|---|---|
| `node tests/v453_dev54_minion_formation_guinsoo.test.mjs` | 17/17 PASS |
| `npm test` integral (após último patch) | PASS (saída 0) |
| Data Dragon versionado | 16.21.1 / PC 26.21 — valores e `from` validados |
| Filtragem Summoner's Rift normal | 202 gerais, 90 vinculados, 112 consulta |
| Comprar componentes / completar receita / vender | PASS |
| Máscara Assustadora — ramp, cap, expiração e alvo | PASS |
| Guinsoo — dano mágico, 4 stacks, velocidade, phantom onhit, reset venda | PASS (escopo descrito abaixo) |
| Corpos minions 3+3 e 3+1+3, não sobreposição | PASS nos casos de teste |
| Replay e snapshots | PASS |
| Partidas seed 26, 42 | 2/2 Nexus destruído, 0 violações |
| Chromium visual | **NÃO EXECUTADO NESTA ETAPA** |
| Pacote offline de ícones oficiais Riot | **PENDENTE** |

## Partidas e proteção contra regressão

| Seed | Tempo dev54 | Vencedor | CS mid Azul / Vermelho | Resultado dev53 |
|---|---:|---|---|---|
| 26 | 21:24 | red | 44 / 52 | identidade verificada com dev53 |
| 42 | 23:20 | blue | 28 / 40 | identidade verificada com dev53 |

## Alterações e limites

- `updateMinionBodiesV453Dev51()` conserva o posicionamento físico regular da dev53, mas expande a busca determinística quando todos os cinco raios locais estão ocupados; usa coordenadas físicas serializáveis. Caso extremo bloqueado gera `minionPhysicalConstrainedV453Dev54` e necessita auditoria. Não cria um pathfinder completo de colisão entre minions; não afirmar paridade 1:1 com LoL.
- Progressão de lane, farm, taxas de dano, XP e ouro foram mantidos. A estratégia de bots não foi alterada.
- Máscara Assustadora: escala 2% a cada segundo em combate contra campeões até 6%; janela de reinício 5s é uma adaptação do sistema de turnos.
- Guinsoo: 30 dano mágico ao contato e 8% de velocidade por acúmulo (até 4, duração 4s) e aplicação dupla dos on-hits independentes já registrados (Guinsoo, Na'Shor, Arco Recurvo). Outros sistemas específicos de on-hit, como regras particulares do Mata-Cráquens, ainda exigem integração de paridade/stacking; não certificar como kit integral de LoL.
- Casos especiais de itens existentes continuam parcialmente certificados; adicionar dois itens não implica certificar 90 itens completos.
- Loja oficial SR continua exclusivamente Data Dragon 16.21.1 para receitas e identidade, sem fallback Wiki. Imagens oficiais não incluídas offline quando não estavam na base.
- Sem alteração no terreno 2.5D: o pedido foi feito no chat equivocado, portanto esse subsistema foi deixado intacto.

## Evidências

Arquivos `docs/QA_EVIDENCE_V453_DEV54/`: `npm_test_full.log`, `test_dev54.log`, `long_match_seed_26.json/.log`, `long_match_seed_42.json/.log`, `catalog_dev54.json`.
