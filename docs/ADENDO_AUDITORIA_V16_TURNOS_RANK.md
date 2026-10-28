# ADENDO DA AUDITORIA — V1.6, PRIORIDADE DE REGRAS E RANQUEADAS

**Data:** 25-10-2026. Este documento **prevalece** sobre as decisões conflitantes nas Bíblias anteriores e na seção ADR-01 da `AUDITORIA_MASTER_V2.md` produzida antes de o usuário escolher o modelo de tabuleiro simultâneo. A auditoria mais antiga permanece como diagnóstico histórico, não é a política atual de execução.

## ADR-01 (REVOGADA): não usar mundo vivo durante planejamento

**Decisão definitiva, em vigor na v1.6:** ambos os lados elaboram ordens com o relógio de simulação congelado. Após a confirmação de ambos (ou esgotado o tempo real de 60s inicial / 30–90s subsequentemente), o motor executa um trecho de 10s de tempo de jogo; em seguida volta ao planejamento. Encontros que exigem decisão pausam tudo, inclusive outros confrontos. Padrão offline: bot vermelho tem plano próprio. No multiplayer futuro, ordens de ambas as equipes são privadas e 'commit/reveal' só ocorre no instante de execução, sem dar visão ilegal.

## Contratos de gameplay essenciais (P0)

| Módulo | Critério de aceitação ainda a ampliar |
|---|---|
| Tempo/turnos | Todas as mutações de jogo ocorrem apenas em `executing`; preparação/planejamento/evento não avançam timer; reconexão/timeout devem ser server-side online |
| Ordem de estruturas | Torre T1 → T2 → T3 → inibidor → estruturas de Nexus → Nexus; validar lanes múltiplas, inibidor ressurgindo, vitória e exceções de patch |
| Minions e torres | Sem atravessar T1 viva; torre responde; foco, animação e intervalo de ataques; turret aggro por campeões inimigos; teste de siege, cannon, super e dive |
| Jungle | Spawn e respawn de camps, rota planejável, gold/CS/XP corretos, leash/reset, invade, red/blue/krugs/raptors/gromp/wolves, Smite e roubo de objetivo |
| Camadas de luta | Alvo, velocidade/range de ataques, windup, projéteis, kite, on-hit, dano/reduções, CC, cooldown, visão, resposta simultânea; recuo não cancela hits elegíveis |
| Táticas por texto | PT-BR abreviado/erro de digitação, divisão de ordens por papel, prévia determinística, correção e rollback, nenhum efeito sem autorização do kit |
| UX/legibilidade | Seleção simples de 5 campeões, plano atual visível, consequências de cada comando, HUD pouco verbal, teclas e menus acessíveis, perspectiva opcional sem alterar cliques |
| Informação | Uma única projeção da visão de cada equipe para UI, eventos, logs, scoreboard e bot; jamais confiar em cliente para antifraude |
| Simulação | Casos determinísticos parametrizados de 30–45min; testes de replay/desync, performance, equilibrar objetivos, picos de nível, win rate por lado |

Os primeiros casos foram implementados de maneira **parcial, experimental e testada em cenários limitados** na v1.6. Não afirmar que toda a mecânica oficial já esteja coberta.

## RANQUEADA COACHLOL: escopo a construir (P1/P2 após estabilidade P0)

O ranking deverá ser **próprio do CoachLOL**, sem simular que é uma liga oficial da Riot. Não há backend ou PDL funcionais nesta entrega.

1. **Conta e identidade:** autenticação, privacidade, proteção de dados e recuperação de sessão; perfil, histórico verificável de partidas e banimentos.
2. **MMR interno:** rating oculto por fila e região, calibração de conta nova, incerteza do rating, atualização por resultado, penalização/compensação de abandono decidida em política publicada; não ajustar por farm ou KDA para evitar incentivo perverso.
3. **Rank visível e PDL:** divisões/elos e pontos de liga definidos para este jogo; ganhos/perdas explicáveis, promoções/rebaixamentos, proteção contra manipulação e regras para temporadas/reset parcial. Nunca prometer +X PDL fixo antes de calibrar matchmaking.
4. **Fila e matchmaking:** pareamento por MMR, latência e restrições de grupos; lado azul/vermelho balanceado; proteção contra contas smurf e abuso de fila.
5. **Servidor autoritativo:** valida ordens por time, horário limite, visibilidade, custos, execução, placar, resultados e assinatura do replay. Cliente só recebe informação permitida pela sua visão.
6. **Fair play:** anti-wintrading, detecção de AFK, rendição, pausa/reconexão, relatório/denúncia, auditoria de replays; não permitir que texto do cliente fabrique gank, fog, XP ou item.
7. **Temporadas:** início/fim, split, recompensas cosméticas originais, leaderboard e políticas públicas de correção, rollback e disputas.

**Gates para habilitar ranqueada:** partidas completas estáveis, desync nulo no conjunto de testes, arquitetura autoritativa, não haver acesso a informação escondida, todas as vitórias verificadas, no mínimo vários ciclos de balanceamento por arquétipo/side, telemetria e moderação. Antes disso: offline e treino casual apenas.

## Backlog além da v1.6

**P0 próximos:** (a) completar componentes individuais de kits e damage pipeline, (b) corrigir todos os alvos de torres e path/range/line-of-sight, (c) definir dados de jungle e objetivos por patch, (d) replay determinístico com múltiplas unidades e casos de fog; (e) integração/limpeza UI de ordens e status do turno, (f) converter janelas de encontro para decisões simultâneas sem consentimento que dê imunidade, (g) teste de partida inteira e condição de vitória.

**P1:** draft/ban/pick com papéis, perfis de campeão e itens reais apenas com licença adequada, áudio/efeitos/feedback, tutoriais por rotas, treinamento e IA de bots por dificuldade, telemetria local e acessibilidade.

**P2:** backend, online, espectador, matchmaking, ranking próprio, MMR/PDL, temporadas, anticheat e moderação; não habilitar competitivo sem os gates P0.

## Direitos e distribuição

A presença de termos, screenshots e dados/arte de League of Legends em materiais históricos não substitui licença. Conteúdo de terceiros, marcas, retratos e mecânicas específicas precisam de revisão jurídico-autoral antes de lançamento público. O ideal para produto próprio é um universo, heróis, itens e arte originais, preservando decisões estratégicas de jogos MOBA.
