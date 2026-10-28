# v1.3 — Mundo Vivo e Interceptações

- Simulação local avança durante planejamento, sem esperar confirmação.
- Nova API startLiveWindow / advanceLiveWindow / finishLiveWindow.
- Encerramento da janela não reexecuta o tempo já simulado.
- Animação visual interpolada entre estados dos campeões/minions.
- Interceptações entre adversários visíveis notificadas como eventos táticos.
- Movimento dos envolvidos é retido brevemente; resto do mundo continua.
- HUD contextual para recuar, defender, lutar e continuar rota.
- Fog em moitas baseada nos componentes conectados das máscaras.
- 8 testes adicionais de mundo vivo; 38 testes no total.
- E2E visual no navegador ainda pendente por bloqueio do ambiente.
