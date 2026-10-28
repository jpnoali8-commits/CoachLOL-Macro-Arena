# Roadmap canônico — CoachLOL Macro Arena pós V4.0

**Base invariável:** V3.9 → V4.0. Arquivos de V3.7 servem somente como fonte histórica de features cinematográficas já migradas, nunca para rollback do motor. Cada marco precisa preservar a regressão anterior.

## Estados confiáveis

| Marco | Estado | Gates / responsabilidades |
| --- | --- | --- |
| V3.9 | Entregue (fundação) | Atributos e overlay, AH/CDR, direção de ultimates, Vex R2 inicial, 1×/2×, itens selecionados |
| **V4.0** | **Entregue parcialmente (fundação transacional)** | Unificação de consumo de mana/CD/cargas em grande parte dos caminhos; journal de ações com filtro por visão; snapshot/RNG/checksum e retomada local. **Pendência:** efeitos/dano, replay de comando end-to-end e garantias de servidor. |
| **V4.1 — próximo** | Planejado | `EffectResolver`, ledger de status por tipo, imunidades, prioridade, shields específicos, cura, anti-heal, DoT/HoT, estase, raiz, stun, fear/charm, silence, knock-up, suppression; remover danos/efeitos fora do resolvedor e finalizar rollback/replay de comandos. |
| V4.2 | Planejado | Dados individuais por patch: atributos base+growth, passivas, QWER, recasts, alvos, hitboxes, projéteis, colisões, channel e VFX declaratitivo. Certificação incremental com fixtures por campeão. |
| V4.3 | Planejado | Itens (ativos/passivos/recipes/unique), runas, economia, gold/XP, letalidade, penetrations, crit, lifesteal/omnivamp, AH categorizada e escalamentos individuais. |
| V4.4 | Planejado | Jungle, Smite contestável por turnos, objetivos, ganks e visibilidade, 5v5 com controle de aggro/projéteis. |
| V4.5 | Planejado | Macro, waves, torres/inibidores/Nexus, objetivos de vitória, surrender, cobertura estatística de bots. |
| V4.6 | Planejado | Backend PVP autoritativo, sigilo real por equipe, matchmaking, filas, lobby e velocidade 1×/2× acordada por partida (simulador sem alteração de tick). |
| V4.7 | Planejado | Event timeline visual, VFX por skill e camera, observador filtrado pela fog; fundação cinematográfica já preservada. |
| V4.8 | Planejado | GLB low-poly, animação, vídeo, áudio e fallback offline. |
| V4.9 | Planejado | Banco enorme de AST de ações tipadas, guardas, multi-combos, sincronia, workflows por prompt e LLM sobre dados auditados. |
| V5.0 | Meta de certificação | Comparativo de todas as mecânicas/patch; matriz por campeão/skill/item e milhares de seeds/replays, sem chamar protótipos de 1:1. |

## Ordem de engenharia (não inverter)

1. Autoridade de **intenção → gate → commit de recursos → resolução de efeitos → evento observável**. A V4.0 consolidou o commit; V4.1 centralizará a mutação de efeitos.
2. O jogo resolve em `gameTime` de segundos simulados. `1×/2×` modifica apenas wall clock e playback, não CDs ou expirations.
3. Data registry por patch e por personagem, usando primitives reutilizáveis sem ocultar diferenças individuais.
4. Fog e redaction são calculados no **servidor antes do envio**. Diário cliente atual é ferramenta offline, não mecanismo seguro de sigilo.
5. Replay final exige log completo das ordens do usuário/IA, input RNG, visão, interrupções e effects com checksum. Snapshots V4.0 são pontos de retomada, não reprodução integral desde começo.

## Gates imediatos V4.1

- Todos os causadores de dano e cura usam `EffectResolver` tipado; incluir minions/torres/monstros e estruturas.
- Efeitos sobrepostos, imunidades e remoção aplicam prioridade documentada, com testes de 60+ interações.
- Todas ações inválidas mantêm estado anterior incluindo efeitos (não apenas recursos) e bloqueiam ghost attacks.
- Replay determinístico de comandos com fixture salvar/carregar, registro completo e checksums por tick e equipe.
- Suite antiga intacta, 2 velocidades invariantes, fog testada, sem alteração visual de V3.9.
