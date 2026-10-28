# CoachLOL Macro Arena — Auditoria e Gates v1.3 (25/10/2026)

## Decisão de produto

O jogo não deve congelar durante o planejamento. A cada segundo simulado, o mundo executa as **ordens persistentes e as automações existentes**: deslocamento de campeões, progressão de waves, combate, torres, campos da jungle, regeneração e respawns. O jogador pode planejar a próxima decisão enquanto tudo continua acontecendo.

A versão v1.3 aplica essa decisão **no modo local contra bot**. Ainda não é um protocolo justo de multiplayer; antes de habilitar partidas competitivas, o servidor precisa controlar o relógio e os momentos em que ordens são aceitas.

## 1. Mudanças implementadas

- `Arena.startLiveWindow()` inicia o planejamento contínuo; aplica posicionamento inicial e prepara o bot local.
- `Arena.advanceLiveWindow(n)` avança n segundos completos com ticks determinísticos, sem exigir que o jogador confirme.
- `Arena.finishLiveWindow()` registra no replay os segundos **já vividos**; não repete a simulação.
- Navegador executa um tick de jogo por segundo decorrido, atualiza fog e HUD sem fechar a janela de planejamento.
- As unidades têm animação interpolada entre o estado anterior e o próximo estado de simulação.
- Novo detector de encontros (`detectEncounters`) em que duas unidades adversárias visíveis se aproximam; **só o movimento dessas unidades** recebe uma breve retenção, mantendo waves e outras unidades vivas.
- Um encontro aciona HUD contextual com **Recuar**, **Defender**, **Lutar** e **Continuar rota**; o modo local aplica a decisão à postura/rota do jogador. Não existe ainda uma reação bilateral validada para multiplayer.
- A lógica de moitas usa componentes conectados da máscara de brush: fontes de visão de fora não revelam o interior; fontes dentro da mesma região revelam.
- API antiga `resolve()` permanece para testes de regressão, sem afetar o novo fluxo local.

## 2. Pontos de atenção antes de liberar a versão como game competitivo

### Crítico — G01: sincronização justa dos dois jogadores
- Servidor autoritativo, tempo sincronizado por tick e carimbo de submissão.
- Ambos observam o mesmo estado permitido pela fog; nunca transmitir unidades ocultas.
- Ordens do mesmo checkpoint aplicadas atomicamente; um jogador não pode interromper o adversário antes da janela de reação comum.
- Para encontros, criar **reaction barrier**: pausa apenas das unidades envolvidas; solicitação para ambos; decisão simultânea ou timeout com ação padrão.
- Um jogador que confirma cedo perde a capacidade de editar sua ordem, mas não perde o direito de que suas unidades executem o comportamento automático.

### Crítico — G02: comando de encontro/contrajogada
- Contexto 1v1, 1v2, 1v3, superioridade numérica, CC e visão.
- Fuga com pathfinding, engage, kite, peel, foco, desengage e cooldown de habilidades reais.
- Testes com dois players, diferentes latências e temporizadores, sem vazamento de informação.

### Alto — G03: controles RTS
- Shift+arrastar para selecionar grupo, sem conflitar com arrasto de câmera.
- Ordens de grupo com formação e prioridades diferentes por função.
- Clique em adversários, aliados e objetivos abre ações coerentes com classe/habilidades.
- HUD compacta, sem cobrir o mapa, keyboard shortcuts e accessibility.

### Alto — G04: waves/lane state
- Minions avançam automaticamente, têm visão própria e prioridade de alvo.
- Slow push, freeze, crash, bounce, reset e reação a wave clear.
- CS e XP por proximidade; benchmarks por tempo/elo e seed; evitar ghost farming.

### Alto — G05: bot tático
- Cinco funções iniciam nas rotas corretas e não abandonam lanes sem motivo.
- Jungle path persistente com spawn/respawn, eficiência, fallback e análise de visão.
- Decisões legíveis por dificuldades, sem conhecimento clandestino da fog.
- Reação a roaming, outnumbered fights, protect carry, retreat, peel.

### Alto — G06: geometrias
- Pathfinding e visão ainda usam máscara amostrada (128²), não física 3D 4096².
- Colisão 1:1, obstáculos, navmesh, arbustos conectados e áreas de torre precisam validação no mapa de edição aprovado.

### Alto — G07: gameplay LoL
- Ainda faltam passivas e Q/W/E/R individualizadas, recursos de energia/sem mana, efeitos de status, buffs, itens e receitas completos, runas por campeão, spells D/F, ward trinkets/cooldowns, TP/Smite/Exhaust/etc, o inventário/regra de economia por patch e objetivos oficiais.
- Data Dragon é fonte de mídia/dados estáticos, não substitui a implementação das regras.

### Alto — G08: gráfico 3D
- Low-poly com heightmap/câmera orbit/LOD; sincronizar chão e colisores com máscaras reais.
- Esta v1.3 continua **top-down 2D**.

### Médio — G09: engenharia
- Refatorar módulo monolítico da HUD; testes E2E Chromium; benchmark de frame pacing e limite de minions.
- Rust/WASM ainda não foi implementado no núcleo de produção.

## 3. Qualidade e status de gates

| Gate | Critério mínimo | Estado |
|---|---|---|
| L00 | Mapa e 22 torres, Nexus e máscaras preservados | base existente; revisão visual pendente |
| L01 | Unidades e waves movem enquanto planejamento está aberto | passou no motor |
| L02 | Fechar turno não reexecuta ticks | passou no motor |
| L03 | Bot local executa atividades sem comandos contínuos | passou nos cenários de teste |
| L04 | Encounter não congela o mundo todo | passou no motor; UX visual pendente |
| L05 | Moitas escondem interior de observadores externos | passou no motor |
| L06 | Reação bilateral com escolha atômica dos dois players | **não implementado** |
| L07 | Seleção múltipla por arrasto e ordens em grupo | **não implementado** |
| L08 | Browser E2E: UI, animação, cliques e cenários reais | **bloqueado neste ambiente** |
| L09 | Arsenal individual / itens / runas / spells oficiais | **não implementado** |
| L10 | Rust/WASM + multiplayer autoritativo | **não implementado** |

## 4. Testes de regressão

Executar `npm test` (Node.js). A suíte contém 30 verificações anteriores e 8 verificações novas para mundo vivo, incl. determinismo, limite de tempo, não duplicar ticks, visão das moitas e interceptação de adversário.

**O que NÃO afirmar**: esta versão não reproduz fielmente o LoL, não entrega multiplayer justo, não valida habilidades oficiais por campeão e não foi aprovada visualmente no browser automático.

## 5. Próximo marco recomendado

**L06: barreira de reação simultânea no modo local e preparação para multiplayer**.

Tarefas: contrato `Encounter`, mensagens `ThreatDetected`/`ReactionCommit`, pausa somente dos envolvidos, ações padrão pré-configuradas por função, simulação determinística e testes: MID interceptado no roam BOT; suporte protegendo ADC contra assassino; lutador 1v3 recuando; jungler e inimigo disputando campo; evitar revelar o invisível.
