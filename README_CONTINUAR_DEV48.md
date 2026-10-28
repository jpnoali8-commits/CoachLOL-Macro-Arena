# CoachLOL V4.5.3-dev48 — Continuidade

A dev48 é a base canônica **provisória**, derivada do ZIP completo da dev47. Executar `npm test` antes de modificar o motor.

Prioridade permanece PvP e ações dos jogadores, não aprimoramento de IA dos bots. Preservar .git sem commits, reset nem rebase.

## Alterações

- 8 ícones PNG originais enviados para estruturas (azul e vermelho; torre, torre barricada, inibidor e Nexus). Os dois ZIPs vermelhos são byte a byte idênticos.
- Waves: os seis minions são cadastrados com formação 3 guerreiros e 3 magos; com canhão, 3 guerreiros, 1 catapulta e 3 magos. As formações laterais e em profundidade reduzem sobreposição visual dos ícones na tela. O motor de farm segue a rota autoritativa original para evitar regressão de CS.
- Bloqueio de corpo por minion em rotas explícitas de movimento de campeões; o bloqueio físico de todos os minions entre si, seus ataques e a movimentação geral ainda não tem certificação integral.
- Acampamentos: nomes em pt-BR conforme os tipos reais (sem IDs internos de mapa na interface).
- Objetivos: ícone conforme tipo e contador regressivo obtido do estado. Placar ancorado ao centro do canvas (calculado pelo cliente).
- Loja: componentes reduzidos para caber na árvore horizontal, sem barra horizontal; filtros por nível de item; seis slots com ação de vender/cancelar; seleção fecha ao clicar fora.
- Referências oficiais: registros válidos de Summoner's Rift importados do Data Dragon 16.21.1 já armazenado no projeto, pesquisáveis mas sem permitir comprar itens não certificados. Inclui Coração Congelado. Não se usam ícones da Wiki como fallback. Ícones reais dependem de rede/acesso a CDN onde não estão armazenados localmente; fallback neutro explícito evita ícone incorreto.

## Limitações e próximo marco

Não foi possível abrir a interface em Chromium por ERR_BLOCKED_BY_ADMINISTRATOR. CSS adaptativo e árvore dependem de verificação visual manual em 1366x768 e 1920x1080. Também faltam catálogo jogável integral, auras específicas dos itens, atualização de receitas e arte original OFFLINE de todos os itens, colisão real de minions com minions/champions em todo o motor e validação estatística do novo posicionamento visual.

Antes de avançar a dev49: baixar via coleta Windows os ícones originais que faltam do Data Dragon 16.21.1 (sem Wiki), certificar ícones de monstros, receitas e modos, aprimorar Minion Block autoritativo sem alterar farm, testar a loja e header no Chromium em ambiente que o permita.
