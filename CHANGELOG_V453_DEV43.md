# CoachLOL Macro Arena — V4.5.3-dev43 — 27/10/2026

Base canônica: V4.5.3-dev42, sem sobrescrever histórico Git.

## Código implementado
- Ezreal Q: atualização por segmento percorrido a 2.000 unidades/s, possibilidade de resolução em sub-segundos do tempo de jogo, interceptação apenas no trecho ainda não percorrido; barreiras posicionais específicas de equipe, posição, raio e expiração; persistência de progresso em snapshots. O loop principal continua avançando em ticks de 1 segundo, portanto a granularidade é mais fina somente quando o resolvedor é chamado em horários fracionários.
- Irelia E: regra individual com alcance 775, 50 de mana e recarga por nível; primeiro ponto, recast após 0,15s, convergência após 0,25s, recast automático em 3,5s; linha de 140 unidades, dano mágico, atordoamento e marca Unsteady de origem E. Bloqueios por escudo de feitiço, estase, imunidade e guarda de projétil considerados. A marca só é aplicada a campeão atingido.
- Combos: sequência E→E→Q da Irelia com consumo real da marca. Integração com fila de habilidades direcionais e com o HUD preto/dourado para marcar lâminas no mapa; traçador Ezreal Q representa distância percorrida, não previsão futura.
- Motor Node / engine.browser.js gerado por `tools/sync_browser_v43.py` (não editado manualmente). Loja e catálogo oficial não modificados.

## Certificação e limites
- 19/19 novos testes `npm run test:v453:dev43` e `npm test` integral PASS.
- Chromium: index e scripts reais, 0 JS exceptions; cinco capturas documentadas em `docs/QA_EVIDENCE_V453_DEV43`.
- Duas partidas com Ezreal/Irelia nas duas equipes: seeds 26 e 42; 1613s e 1853s; 2/2 Nexus natural, nenhum erro de invariantes. Foram executados respectivamente 80 e 118 Ezreal Qs; a IA não escolheu Irelia E nessas partidas (E é validado nos testes e em Chromium).
- Resolução de colisão com posição atual do interceptor no momento do avanço, sem reconstrução contínua da trajetória dos agentes móveis. Barreiras posicionais são contrato nativo; Yasuo Wind Wall e outras habilidades específicas ainda não estão conectadas.
- Irelia Q continua com coeficiente de 70% AD herdado, divergente da alteração da patch 26.17 para 80% AD: correção futura em lote com atualização dos testes históricos. Dash Q ainda é resolvido instantaneamente no tick, então interrupção no meio do movimento NÃO foi implementada; apenas bloqueio pré-cast.
- E individual não cobre integralmente trajetória visual física das duas lâminas nem colisão com barreiras especiais. R, W e passivas completas da Irelia pendentes. Não há certificação de paridade 1:1 com Riot.

## Fontes de referência
- League of Legends Wiki: Ezreal Mystic Shot (velocidade 2.000, 1200 alcance), Irelia Flawless Duet (775 alcance, mana 50, dois recasts e convergência); notas 26.17 sobre Irelia Q. Conferir patches ao atualizar o balanço: fontes complementares não são automaticamente aplicadas ao motor.

## Mordekaiser R (V4.5.4) — preservar contrato
- Viewport QUADRADO superior esquerdo, limite CIRCULAR real dentro dele; recorte espacial da área ativa do mapa, contendo todas as paredes, colisores, brushes e seis variantes do Rift Elemental. Apenas Mordekaiser e vítima na instância, restante do mapa continua funcionando, retorno espacial coerente, fechamento automático, camadas do Reino e do Golpear prioritárias. Nunca criar arena vazia genérica.
