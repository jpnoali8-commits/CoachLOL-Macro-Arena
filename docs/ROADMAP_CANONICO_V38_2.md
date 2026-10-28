# Roadmap canônico CoachLOL — Engenharia e marcos após V38.2

**Única linha de versões:** V37 → V38 → V38.1 → **V38.2** → V3.9 → V4.0 → V4.1 → V4.2 → V4.3 → V4.4 → V4.5+.

**Regra anti-regressão:** arquivos de V3.7 são **fontes históricas**, nunca novos códigos-base. Prefixos históricos `M38`, `M42–M43`, `M47`, `M49` no documento cinematográfico antigo denotavam trabalho, **não** versões semânticas. Foram incorporados aos eixos técnicos abaixo; não criar um segundo roadmap concorrente.

| Entrega | Status | Dependência | Definição de pronto (gate) |
|---|---|---|---|
| V38.1 — interface, seleção e combate | Base consolidada | V38 | Shift click/arrastar, múltiplos combos, perseguição, ataques sem consentimento, guardas iniciais |
| **V38.2 — skill safety + cinema foundation** | **Protótipo validado parcialmente** | V38.1 + cherry-pick da v3.7 cinema | Range real Nami W/Lux R/Nami R inicial; CD absoluto; fog event snapshot; gank por ponto privado; render fallback sem impacto no motor |
| **V3.9 — contrato autoritativo único** | Próximo P0 | V38.2 | `ActionIntent→CastAttempt→ResolvedAction→WorldEvent→ViewerEvent`, eventId monotônico, tick/subTick, replay/seed/snapshot/checksums; skill executor unificado e replay determinístico em 20 cenários |
| **V4.0 — status e efeitos universais** | Planejado | V3.9 | motor de  CC, DoT/HoT, shields, heal, estase, tenacidade, invulnerabilidade, interceptação e tipos de dano. Golden tests por efeito, stacking, dispel, duração e ruptura |
| **V4.1 — kits QWER/passivas individuais** | Planejado, iterativo por lotes | V4.0 | per-champion registry versionado, custos, CD, range, skillshots, colisão, direção, recast, passivas e triggers; matriz `champion × slot × interação`, 0 remote casts |
| **V4.2 — objetivos e teamfights** | Planejado | V4.1 (subconjunto CC/skills crítico) | Dragão/Barão disputáveis por vários turnos, HP real, path, aggro, Smite concorrente, cancelamento, steal e 5v5 testes de simulação |
| **V4.3 — economia/lanes/estruturas** | Planejado | V4.2 | calibration XP/gold/farm jungle e lane, backdoor, towers, inhib/nexus, waves e conclusão legal da partida; seeds de 40 min e métricas |
| **V4.4 — PvP competitivo e HUD** | Planejado | V4.3 | servidor autoritativo, snapshots filtrados, ordens seladas, fog anti-wallhack, rejoin/replay, anti-cheat, targeting de sobrepostos, eventos públicos; testes simultaneidade |
| **V4.5 — VFX/overlays de gameplay** | Planejado | V4.1 + contrato eventos V3.9 | todos os casts possuem `CinematicCue` e fallback, timing correto de projéteis/colisão, HUD visual (CC, barreras, interrupts); direção/câmera sem bloquear input |
| **V4.6 — GLB/2.5D render real** | Planejado | V4.5 | player GLB/rig/animation com assets autorais versionados, perf/Lod fallback e hash de jogo invariável sob render ligado/desligado |
| **V4.7 — timeline multimídia completa** | Planejado | V4.6 | vídeos offline, áudio, legendas, loc/skip/reduced-motion, timeline replay, câmera cinematográfica opcional, testes GPU e licenças |

## Camadas permanentes, NÃO versões paralelas

- **MT-ENGINE:** motor determinístico e ledger de cast (iniciado na V3.9, sustentando todos marcos).
- **MT-FOG:** observabilidade por equipe, snapshots e sigilo da intenção (V38.2 parcial, fechamento V4.4).
- **MT-CINE:** eventos e renderer não autoritativo (fundação V38.2, eventos granulares V4.1, VFX V4.5, GLB V4.6, mídias V4.7).
- **MT-ASSETS:** dados por patch e permissões de uso (todos os marcos).
- **MT-QA:** regressão, simulações longas, perf, 5v5, replay, fuzz, matriz de versões (todos os marcos).

## Ordem técnica dentro do próximo trabalho (V3.9)

1. Centralizar `AbilityDefinition` e `CastState` por campeão/slot; normalizar alvos e `range` em unidades de jogo, sem `.1` arbitrário.
2. Fluxo ordenado `validate→navigate→revalidate→commit→execute` e registro único de cooldown por `gameTime` (inclui summons, ativos, kits, escalamentos por rank, haste).
3. Eventos autoritativos por tick/subtick com `eventId` persistente, `observedByAtEvent`, público/privado e projeção de estado por time; registros de lastSeen e comandos de gank por destino.
4. Projetéis/áreas simulados no motor independente de navegador, priorização de colisões e interrupção; animações só observam resultados.
5. Replay/hash determinístico mesmo com VFX desligados, UI a 30/60/144 FPS, skips ou medias faltantes.
6. Aceite por personagem: Nami (W, R), Lux (R), depois varredura sistemática de passiva/Q/W/E/R e feitiços, com casos positivo/negativo, fora do range, fog, CD, mana, CC e death.

## Premissas do relógio

**Cooldown é medido em segundos simulados, não em turnos.** Se um turno resolve 10s e W de Nami tem CD 10s, pode ser legal lançar W novamente no próximo turno. Já a ultimate R de Nami com CD 120s exige cerca de 12 turnos de 10s (sem haste). A interface deve mostrar CD restante e início exato do cast; nunca inventar um bloqueio fixo por turno além do cooldown do kit.

## Política de estabilidade

Gate para avançar: testes `npm test` sem regressões; browser smoke; matrizes `fog / range / cooldown / displacement / collisions / targeting`; testes determinísticos com mesma seed; auditoria de privacidade; documentação de divergência das regras originais e versionamento do patch de referência. Marcar recursos **protótipo** até evidência completa, nunca declarar 'livre de bugs'.
