# Adendo da Bíblia Master — etapa v2.0

**Decisão vigente:** CoachLOL é tabuleiro de estratégia com **ordens simultâneas, execução curta e mundo pausado durante o planejamento e decisões**. Controles de mouse e linguagem natural compilam para o mesmo estado determinístico.

## Contrato de acampamento

- Um `Camp` pertence a um local fixo do atlas com `timerKey`, `spawnCycle`, `respawnAt`, `health`, `maxHealth`, `campLevel`, `patience`, `leashState` e `aggroId`.
- `idle`: disponível; `engaged`: atacando/revidando; `soft`: perde agro após paciência zero e cura 6% do máximo por segundo por até 6s; `hard`: invulnerável durante retorno com regeneração acelerada; `idle` após recuperação completa.
- Somente o acampamento-alvo da ordem ativa pode receber ataques do campeão. Golpear reserva alvo/cargas e condição de HP independentemente da rota. Regra persistente não é substituída pela geração de waves.
- O nível do acampamento é calculado no spawn; repopula com a média dos níveis do jogo naquele momento. Não atualizar HP apenas porque um campeão upou durante a luta.
- Em disputa simultânea, os danos são contabilizados no mesmo tick e a execução não depende de cor/ordem de array. Desempate exatamente igual usa PRNG com seed fixa.
- No fog, ícone do acampamento pode ser conhecido como posição do mapa, mas **status atual, HP, reset e cooldown são desconhecidos** sem visão. Para partidas multiplayer futuras, a filtragem deverá ocorrer no **servidor**, não somente no navegador.

## Fase inicial / turnos

- O tempo de preparação inicial é **um minuto real**, com relógio de jogo em `00:00` e campeões imóveis. As compras, planos e habilidades podem ser preparados. A execução de cada turno só acontece depois de ambas as confirmações.
- O mesmo sistema de IA e comando manual deve respeitar path persistente, loja/recall, prioridades de wave e range. Um plano **gerado pelo bot** não deve congelar sua capacidade de decidir o próximo acampamento. Uma ordem **explicitamente inserida pelo jogador** só deve ser substituída por nova ordem, cancelamento ou transição de estado de morte/loja a ser especificada com clareza na próxima etapa.
- A janela de reação do último segundo **deve fechar a rodada** depois da resposta. A simulação não pode ficar em `decision` com tempo restante zero.

## Gate de qualidade e estado

**Aprovado em v2.0:** 55 contratos, dois cenários de 40 minutos, testes de replay determinístico, regressão no browser autocontido e invariantes básicas. Não foi detectado estado inválido nesses cenários.

**Ainda aberto (bloqueador de lançamento):** partida completa precisa chegar a um resultado por mérito estratégico, com formações de cerco, superminions, recall/compra/retorno, objetivos e adversários capazes de converter vantagem em Nexus. Nenhum dos dois testes bot-vs-bot de 40 minutos finalizou a partida. Não aceitar “40 minutos rodaram” como “partida completa aprovada”.

**Limitação de modelagem:** os acampamentos ainda representam um agregado de múltiplos monstros; números de HP/dano e leash simplificados servem para teste de estratégia. A fidelidade mecânica 1:1 dependerá de schema por espécie/patch, trajetórias dos monstros, posicionamento de cada membro e cenários dourados.

**Próxima etapa ideal — v2.1:** foco em finalizar partidas: decisões estratégicas do bot de push/cerco, superminions, ataques a torre/inibidor/Nexus, escolha de objetivos e auditoria de partidas completas até condição de vitória válida. Depois, kits individuais e matchups; multiplayer/rank/PDL apenas com servidor autoritativo e integridade certificada.
