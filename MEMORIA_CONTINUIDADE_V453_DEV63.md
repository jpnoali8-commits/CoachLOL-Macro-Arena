# Memória técnica V4.5.3-dev63

## Arquitetura preservada

- Base de entrada dev62 completa de 2.437 arquivos; histórico Git original com 566 arquivos internos, sem reset/limpeza. PvP 1 jogador azul × 1 vermelho, cada um controla TOP/JG/MID/ADC/SUP.
- O servidor é a autoridade para ordens, visibilidade, ações, economia, vendas, Desfazer e avanço do mundo. Passivas/ativos individuais continuam incompletos; 102/202 itens gerais estão vinculados ao motor (a vinculação **não** certifica todos os efeitos), 100 apenas referência. Pin do catálogo LoL PC 26.21 / Data Dragon 16.21.1.
- A regra de Desfazer dev61 não foi modificada: deixar a fonte invalida permanentemente operações da visita, mesmo após voltar.

## Diagnóstico e correção

A dev62 permitia Nexus HP=0, `ended=true` e `winner=blue|red` enquanto `phase=executing` e `executionRemaining>0`. O próprio servidor recusava novos ticks porque a arena havia terminado. Isto impedia concluir corretamente o estado de turno e podia levar a HUD de partida a continuar aparentando execução.

A dev63 corrigiu em `Arena.continueExecution`: quando `tick()` destrói o Nexus, `executionRemaining=0` e `finishCompletedRound()` é chamado sem avançar novamente `gameTime`; `phase='finished'`, o frame tem apenas a duração efetivamente simulada e a rodada é registrada. Node/browser sincronizados por script 73 exports. Não foram alteradas fórmulas de farm, minions, ouro, torres nem dano.

`PvPRoomV453Dev47.publicInfo` revela `winner` somente depois de `ended`. O frontend desenha tela de vitória/derrota baseada no time autenticado, fecha overlay de loja no terminal e mantém o resultado até o usuário clicar `Ver tabuleiro`. Não foi adicionada simulação de bots.

## Evidência e limites

- `npm run test:v453:dev63`: 25/25 contratos, 2 partidas até Nexus com 2 clientes HTTP autenticamente separados, SSE Node nativo, comandos em cinco campeões, skill upgrade, compra/Undo, confirmação simultânea, checkpoint/restauração.
- Seed 26: azul vence em 1.423 s (23:43), 48 rodadas, Nexus vermelho destruído, quatro torres vermelhas e duas do Nexus. Seed 42: vermelho vence em 1.553 s (25:53), 52 rodadas, Nexus azul destruído. Ambas sem forçar HP/estruturas, sem relógio de vitória, sem `botPlan`.
- Os dois testes usam uma estratégia **parcial e roteirizada** (lado defensor segura 5 campeões, outro lado usa comportamento padrão do motor). Não houve execuções QWER completas durante a partida e nenhuma janela de reação emergiu nesses perfis. Não representam uma prova de partida humana competitiva completa.
- Chromium confirma somente interface de fim de jogo em dois contextos com snapshots autoritativos injetados no DOM. HTTP/SSE nativos em Chromium e navegador com mapa real continuam pendentes por bloqueio de rede do ambiente.
