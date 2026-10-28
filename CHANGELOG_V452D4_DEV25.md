# CoachLOL Macro Arena — CHANGELOG V4.5.2d-4-dev25

## Entrega
- Índice espacial de minions usa chaves numéricas no grid, eliminando concatenações de strings e calculando distância quadrática sem alterar a ordem dos resultados.
- `laneBlocker` passou a reutilizar projeções de estruturas da mesma rota/time **apenas durante `moveMinions()`**; não faz cache permanente, nem ultrapassa ticks, e acompanha alterações de vulnerabilidade.
- Nenhuma mudança nos atributos/HP/dano/velocidade, IA estratégica, sementes, regras de wards ou pacotes autorais.
- `engine.browser.js` regenerado com `tools/sync_browser_v43.py` (68 exports).
- Novos contratos `tests/v452d4_dev25_spatial_performance.test.mjs` (5/5).
- Auditoria reproduzível de **30 partidas** (5 drafts sintéticos × 6 seeds), dados brutos sob `docs/QA_EVIDENCE_V452D4_DEV25/`.
- `npm test` completo, incluindo farm calibrado e contratos herdados: PASS.
- Chromium com atlas real reduzido e sprites CC0 locais embutidos na fixture: PASS, 0 exceções.

## Ganho medido na mesma seed 26/baseline
- Dev24: 8429 ms, dev25: 5806 ms (redução de tempo de CPU/wall-clock **31,12%** nessa medição).
- Ambos: vitória azul em 1998s, 16 estruturas destruídas, hash do estado final `18a59984e4085d03a312ff20`.
- Não extrapolar esse ganho como promessa para todos os equipamentos.

## Limitações
- A média 26:17 em 30 partidas está abaixo dos 30min planejados; não é paridade de campeões. Kits alternativos ainda são treinamentos genéricos.
- Não executamos uma partida orgânica completa dentro do Chromium; a fixture é controlada.
- A* não foi reescrito porque o profiling atribuiu mais tempo ao índice de minions e ao cálculo repetido de vulnerabilidade de estruturas.
