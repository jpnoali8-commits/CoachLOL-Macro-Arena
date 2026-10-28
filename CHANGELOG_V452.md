# CoachLOL Macro Arena V4.5.2 — Incremento verificável

**Base:** V4.5.1 do ZIP canônico. V3.7 não foi usada para sobrescrever arquivos.

## Entregue no motor
- Estados de Barão/Ancião por campeão (somente portadores vivos), expiração em segundos simulados, perda na morte.
- Aura de Barão em minions aliados próximos a um portador vivo; minions de outras rotas não recebem buff global indevido. Multiplicador de cerco permanece aproximação tática e NÃO equivalência exata por classe de minion.
- Ancião: marca execução após dano deixando o alvo abaixo de 20%; execução no tick seguinte (motor discreto), cancela se o alvo se curar até 20% ou estiver invulnerável. Atribui a eliminação ao agressor; efeito de queimadura oficial ainda pendente.
- Dragões elementais acumulados permanecem sem expiração; Alma ganha um tipo persistente quando uma equipe obtém quatro (efeitos protótipos de Ocean/Hextech/Infernal, outros planejados).
- Fantasma: 15 segundos simulados de bônus inicial de velocidade, cooldown em segundos, executor de ações e combo; coeficiente 24% é protótipo dependente da atualização de patch.
- Segundo feitiço escolhido no Champ Select com seleção por campeão. Durante a partida fica travado, inclusive na fonte. Smite reservado ao jungler no protótipo atual.
- Loja com filtros por tags Tank, Lutador, Mago, ADC, Suporte; busca e receitas já existentes preservadas. NÃO é catálogo completo, e as tags não são certificação.
- Farm: telemetria persistente por equipe/rota: CS real, perdas por minions, alcance e cooldown. Nenhum CS fictício e nenhum ouro por proximidade.
- Node `engine.mjs` e browser `engine.browser.js` gerados do mesmo código.

## Ainda não concluído
- **Meta de farm livre ~50 CS/5min:** cenário de referência permanece em ~23 CS TOP. É uma falha aberta, NÃO foi corrigida na V4.5.2. Não enfraquecemos o teste legado para escondê-la.
- **Kits 1:1, bases individuais, runas, itens e ativos:** catálogo parcial, com certificação por patch a realizar em lotes.
- **Buffs oficiais de minions por categoria, dragões, Soul, Ancião DoT, múltiplos monstros com atributos reais, decisão multiplayer segura:** versões seguintes.
- Teste visual Chromium: execução bloqueada pelo ambiente neste turno; validação Windows pendente.
