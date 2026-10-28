# CoachLOL Macro Arena — V4.5.2d-4-dev23

## Meta de produto
Duração **média** de partida padrão próxima de 30 minutos, com desfecho real por destruição do Nexus. Não há timer de derrota ou dano fictício.

## Alterações implementadas
- Corrigido o comportamento autônomo após destruir um inibidor: os bots continuam em modo push com uma wave válida, priorizando estruturas vulneráveis do Nexus.
- Corrigido limite de acompanhamento da wave no último trecho de rota, condicionado a uma frente aliada presente.
- Movimentação física de minions do fim da lane para os guardas do Nexus, via `findPath`/colisão, com retentativas limitadas para evitar recalcular A* em todo tick.
- Aplicada queda das resistências das torres exteriores entre os minutos 11 e 15 (armor 60→20, MR 60→0); o HP-base de **9.000** das torres exteriores foi preservado.
- Alinhada a previsão de dano de minions ao cálculo efetivo, inclusive resistências temporais de torres.
- Crescimento limitado de HP/dano dos minions por patamares de 90 segundos **após 5:00**, preservando o farm-calibration nos primeiros 300s. A progressão pós-5min usa coeficientes de treinamento (não é fórmula Riot 1:1).
- Planejamento de retorno à loja e compra de itens legítimos pelo bot, com decisões escalonadas e nenhuma compra fora da fonte.
- Ajustado início de agrupamento estratégico em rota para 15min após abrir uma torre exterior.

## Resultado mensurado
5/5 partidas offline terminaram por Nexus, seeds 26/42/36/55/77, com durações 33:18 / 33:24 / 26:08 / 25:50 / 21:54 e **média 28:07**. Nenhuma conclusão automática por relógio.

## Qualidade
- Novos contratos dev23: 9/9 PASS.
- `npm test` integral: PASS.
- Node/browser: 68 exports sincronizados.
- Testes longos: 5/5 terminação natural e invariantes preservadas.
- Chromium end-to-end desta release: **NOT_RUN**.

## Limites
Amostra restrita a 5 seeds, um draft padrão e IA local. Paridade integral de LoL, PvP e estabilidade estatística não certificadas. A continuação deverá ampliar seeds/drafts/variantes, medir P50/P90 e validar desempenho.
