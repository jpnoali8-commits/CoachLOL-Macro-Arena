# QA — CoachLOL Macro Arena V4.5.3-dev56

## Escopo e fonte
Base canônica **dev55**. Itens exclusivamente de Summoner’s Rift (PC 26.21, Data Dragon 16.21.1 arquivado em `data/riot_reference/`). Nenhum item ARAM/TFT/removido foi promovido. Motor Node e `engine.browser.js` sincronizados pelo script oficial `tools/sync_browser_v43.py`.

## Modificações certificadas
- **Lágrima da Deusa (3070)**: +240 mana, 4 cargas, recarga de 8 s, bônus de 3 mana por habilidade contra unidade não campeã e 6 contra campeão até 360; +5 dano de ataque básico em minions. Buy/sell e reinicialização de stacks verificados.
- **Alternador Hextec (3145)**: 45 AP, dois Tomos Amplificadores, proc mágico autoritativo, recarga por campeão, reset ao vender. **40 dano / 40 s são adaptação parcial**, pois o texto do Data Dragon não fornece o valor numérico atual. Não declarar passiva Riot integral certificada.
- **Minion block**: segunda procura determinística em anéis de 352–480 unidades apenas quando candidatos existentes falham. Nova API `minionFootprintAuditV453Dev56()` reporta corpos ativos/congestionados/pares sobrepostos sem alterar o estado.
- **Catálogo SR**: 94 itens gerais vinculados ao motor / 108 só consultáveis / total da seleção conservadora: 202. Vinculado ao motor não implica certificação integral de todos os efeitos.

## Testes efetivamente executados
| Verificação | Resultado |
|---|---|
| `node tests/v453_dev56_minion_items.test.mjs` | **16/16 PASS** |
| `npm test` após sincronização Node/navegador | **PASS** |
| Partida seed 26 até Nexus | 1284 segundos (21m24s), vencedor vermelho, CS MID 44/52, 0 issues |
| Partida seed 42 até Nexus | 1400 segundos (23m20s), vencedor azul, CS MID 28/40, 0 issues |
| Chromium gráfico | **NÃO CERTIFICADO**: tentativa headless excedeu o limite de 18s, sem screenshot gerada |
| PNGs Riot offline | **PENDENTE**, não baixados nem substituídos pela Wiki |

## Limites
- Farm e combate econômicos das tropas ainda se baseiam na progressão existente. A busca ampliada de posições só trata cenários congestionados; não prova minion block 1:1 LoL durante todo o jogo.
- Simulações com bots são apenas regressão de gameplay; melhoria estratégica da IA permanece adiada, priorizando PvP e habilidades completas.
- A área das plantas, wards, Reino da Morte, Sylas e Neeko não foi modificada neste marco.
- Controle de cargas da Lágrima usa domínio temporal inteiro autoritativo (granularidade de 1s); transferência para itens evoluídos exigirá contrato explícito quando esses itens forem implementados.
