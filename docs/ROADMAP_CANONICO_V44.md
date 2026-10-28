# CoachLOL Macro Arena — Roadmap canônico V4.4 (26/10/2026)

**Linha de produção:** V37 → V38 → V38.1 → V38.2 → V3.9 → V4.0 → V4.1 → V4.2 → V4.3 → **V4.4**. A branch antiga de cinematics V3.7 foi integrada parcialmente na V38.2; nunca substituímos o motor atual com ZIPs antigos.

## Governança e critérios

- Regras por **patch 26.21**, **modo Summoner's Rift padrão**, com fonte e status de maturidade; Swiftplay/Arena/Classic têm outros timers e mecânicas.
- Tempo de mundo, movimentação, Smite, DPS, cooldowns, DoT/HoT em **segundos simulados**; speed 2× comprime a duração em tempo real, não gera Smite adicional.
- Eventos públicos de captura não podem expor decisões de jogadores em fog. O `objectiveLedgerV44` detalhado só pertence ao time capturador; nunca enviar um objeto `Arena` inteiro a clientes PvP.
- Toda ação de objetivo precisa de uma cadeia causal, separando ataques básicos, habilidades e Smite. Resolução de uma mesma janela deve ser reprodutível por snapshot/checksum.
- Dados simplificados exigem badge de maturidade `prototype` ou `grouped_training`, jamais `certified`.

## Marcos e gates

| Marco | Entrega | Critério de aprovação |
|---|---|---|
| **V4.4 — atual** | Encontros temporais Vastilarvas/Arauto/Barão, Smite independente de AA e alcance, arbitragem simultânea determinística, ledger de captura e assistência limitada, telemetria preliminar teamfight, HUD de cronômetros com fog | 11 contratos novos; testes legados adaptados à distância real; Node/browser sincronizados; captura e snapshot sem vazamento de intenção |
| **V4.5** | Wave, CS, XP, gold, torres/inibidores/Nexus, combate macro 5v5, vitória e pós-jogo; *completar efeitos dos objetivos épicos* | Casos farm livre/contestado em 5/10/20 min; Baron empoderando minions; Arauto invocado; Vastilarvas em estruturas; Soul/Elder por patch; conclusão legal de partidas |
| **V4.6** | Lobby, fila bot/PvP, filtros 1×/2×, reconexão, cliente espectador limitado e servidor autoritativo com sigilo anti-cheat | Contratos visibilidade por time, ordenação de commits, reset/rejoin, concorrência e latência |
| **V4.7** | Hitboxes completas, projéteis viajando no mundo, skillshots, indicadores, VFX por kit, prioridades de colisão | Testes geométricos por habilidade com cast/recast e fog; VFX nunca calcula dano |
| **V4.8** | GLB 3D, câmera, animação, vídeos/áudio e fallback offline | Reprodução não determina regras; mídia autoral licenciada, timeline sincronizada e skip seguro |
| **V4.9** | Banco AST de ações macro/micro, condicionais, múltiplos campeões, prompts e replays causais | Parser seguro, determinismo, ações legais/ilegais auditadas, privacidade por time |
| **V5.0** | Certificação exaustiva LoL por patch: campeões, passivas, QWER, recasts, itens/runas/mapa | Matriz de dados e testes individuais rastreáveis, sem extrapolar de protótipos |

## Dívidas técnicas V4.4 importantes

1. O poço superior agrupa **três Vastilarvas num único encontro**, sem alvos individuais, efeitos de pilha exatos ou dano nas torres. Arauto é uma entidade simplificada, sem olho/dash/convocação. Isso é `grouped_training`.
2. Disputas resolvem *Smites simultâneos antes dos AAs do mesmo tick*; se houver Smite letal, vence maior impacto, com empate por ID estável. Isso é abstração do timestep, não frame-perfect Riot.
3. O ledger usa créditos de participação próximos e efetivamente envolvidos; ouro/XP desses assistentes são valores de treino, ainda não oficiais. A chance de perder visão de um combate não revela por si o alvo.
4. Teamfight ledger só agrupa golpes entre campeões se houver 2v2 ou mais perto de um poço. Não substitui o sistema de ações/combos 5v5 final.
5. Jogadores offline compartilham uma instância local de Arena. A camada `perspective` remove dados, mas não constitui segurança de rede; migração autoritativa V4.6.
6. Kits, runas, itens, dragões elementais, Smite-pet, buffs e dano de monstros ainda não são 1:1. Velocidade 2× não altera segundos simulados.

**Próxima base exclusiva: V4.4.** Não trabalhar sobre V3.7, V38 ou outras versões antigas.
