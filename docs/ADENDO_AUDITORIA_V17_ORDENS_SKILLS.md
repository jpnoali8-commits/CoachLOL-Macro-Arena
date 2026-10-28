# Bíblia — adendo de produção v1.7

**Status:** contrato operacional experimental de tabuleiro simultâneo. Substitui o comportamento de recuperação automática de rota ao terminar uma ordem.

### Hierarquia
1. Evento forçado: morte, respawn/loja e confronto congelado.
2. Ordem estratégica explícita do humano/IA (permanece até alteração).
3. Etapas de plano com ciclos (jungle) ou término em hold (rota comum).
4. Postura, automação, reação e priorização de targets **dentro da ordem**.
5. Autopiloto de lane apenas sem ordem explícita ou com `farm/push/auto` intencionais.

### Progressão
- XP ganho por proximidade da wave e conclusão de jungle. A cada threshold, sobe nível e ganha ponto.
- Q/W/E com rank 1 no nível 1, rank 2 no nível 3, rank 3 no 5, rank 4 no 7, rank 5 no 9, sujeitas à existência de pontos.
- R padrão rank 1 aos 6, rank 2 aos 11, rank 3 aos 16. Campeões especiais por enquanto usam regra simplificada (ainda precisam do modelo de kit).
- Preparação permite selecionar 1ª habilidade antes de iniciar; posteriores: manual ou auto-upar configurável.

### Árvore de melhoria
- P0: fixar roster kits individuais e efeitos de habilidade em dano/controle, AA reset, mana e habilidade passiva; dados versionados, testes por campeão.
- P0: adicionar telemetria tática de origem/estado das ordens e tempo gasto em cada estágio; evitar starvation/loops de jungle sem campo.
- P1: monstro por entidade, leash e IA da jungle/assistência, objetivos atualizados e fog.
- P1: gramática por slot e linguagem condicional, prévia indicando o que não entendeu, prioridade de cancelamento.
- P2: animação/UX iconográfica de níveis, ícones de habilidades e itens originais/licenciados.
- P3: servidores, PvP, matchmaking e rank/MMR/PDL depois de testes de determinismo e equilíbrio.

### Critérios de aceite
- Nenhuma wave muda `explicitOrder` nem `plan`, salvo ordem de farm/push.
- Farm da jungle começa antes da morte do campo e obedece intervalo; CS/XP entram ao finalizar.
- Skill sem rank não produz efeito; R normal rank 0 antes do 6.
- Todas as equipes recebem as mesmas restrições de nível, dano, visão e XP.
- A HUD mostra nome e informa claramente skill bloqueada/desbloqueada.
