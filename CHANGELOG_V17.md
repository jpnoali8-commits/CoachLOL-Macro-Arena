# CoachLOL v1.7 — Ordens persistentes, skill levels e jungle ativa

## Corrigido
- Rota concluída não volta mais ao piloto de lane: hold mantém posição; jungle multi-etapas repete o percurso para aguardar/limpar reaparições.
- `setOrder(farm/push)` substitui o plano anterior intencionalmente; reação, política e estilo de combate não são novas rotas.
- `autoStartJungle` respeita ordens explícitas; onda de minions não interfere em planos de jungle ou ganks.
- Jungle causa dano ao acampamento em ciclos de ataque com cooldown, habilidades aprendidas e Smite situacional; ataque de monstro e ganho de CS/XP ao finalizar.
- Progressão de níveis de campeão até 18 e pontos de habilidade; Q/W/E têm rank máximo por nível; R normal libera ranks 1/2/3 em 6/11/16.
- HUD apresenta nome do campeão em vez da função acima do avatar e botões para upar Q/W/E/R, Ctrl+letra e opção auto-upar.
- O parser aceita nomes próprios dos cinco campeões aliados, estilo ADC AA/kite/on-hit, ordens de build/rota e comandos de nível de habilidade.

## Verificação executada
- `npm test`: **23 testes** (10 contratos v1.6, 5 scoreboard e 8 contratos específicos v1.7), todos aprovados.
- `python tests/browser_v17.py`: Chromium autocontido, com campo textual, botões de habilidade, ordem de ADC e transição para execução; sem erro JS.
- HTTP local completo **não validado no ambiente de entrega**: o Chromium do ambiente bloqueia conexões loopback. Executar `INICIAR_WINDOWS.bat` na máquina do usuário.
- Suítes históricas de versão anterior podem divergir (ex. teste de 30s vs execução de 10s). Não usar para certificar v1.7.

## Escopo remanescente / dívida de engenharia
- Kits e curvas precisos por campeão, efeitos de habilidades, exceções R/transformações, recursos especiais, itens e runas.
- Monstros internos do camp, leash, XP de assistência, buffs e spawn/respawn oficiais atualizados, Smite fiel e contestação com visão.
- Comandos condicionais completos (até X, se visão, ao atingir nível), feedback por ordem e prioridades táticas com interrupções.
- Multiplayer determinístico autoritativo, rank/MMR/PDL, matchmaking, antifraude e avaliação de balanceamento.
- Segurança/identidade/licenciamento de marcas/assets para uma eventual distribuição pública.

## Regra de produção
Uma ordem de plano explícito não é um pedido de microgerenciamento a cada rodada. Ela é persistente, só cai por substituição/ação pontual, morte/recall, fim de partida ou cancelamento. `autoFollow` não é autorização para o motor abandonar uma estratégia explícita.
