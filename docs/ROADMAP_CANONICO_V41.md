# Roadmap canônico CoachLOL — V4.1 (26/10/2026)

## Cadeia oficial imutável

V3.7 legado cinematográfico (somente fonte seletiva) → V38 → V38.1 → V38.2 (cinematics migrados) → V3.9 → V4.0 → **V4.1**. Arquivo oficial desta entrega: `CoachLOL_MacroArena_v41_Efeitos_CC_Escudos_Offline.zip`.

| Marco | Estágio | Gate de produção / saída |
| --- | --- | --- |
| V3.9 | Entregue, fundação | 30+ atributos, AH/CDR, UI e ult direcionais selecionadas; sem todos os kits |
| V4.0 | Entregue, fundação | Commit de recursos, journal de ação, checksum e snapshot/restauração; replay integral pendente |
| **V4.1** | **Entregue, fundação de status** | Tipos CC/status, ledger por ID, escudos, cura/anti-cura, DoT/HoT, privacidade de efeito, controles na HUD; commit+efeito ainda não transacional em todos os caminhos |
| **V4.2 — próxima** | Planejado | Manifestos individuais versionados por patch: base/growth, ataques, passivas, QWER/ranks, range, targets, recasts, skillshots, trajetórias, colisões, cooldown, custo, VFX descriptors. Migrar todos os casts e status legados sob executor canônico, por lote de campeões certificado |
| V4.3 | Planejado | Registro de itens/runas/economia: receitas, efeitos únicos, interações, growth, penetração, letalidade, dano, resistências, AH, regeneração e XP/gold auditados por patch |
| V4.4 | Planejado | Jungle e objetivos multi-turno, Smite, visão, ganks, projéteis e teamfights 5v5 |
| V4.5 | Planejado | Waves, farm, torres, inibidores, nexus, surrender e encerramento legal de partidas |
| V4.6 | Planejado | Matchmaking e lobby PVP, servidor autoritativo, anti-cheat, redaction server-side, escolha compartilhada 1×/2× e reconexão |
| V4.7 | Planejado | Timeline e VFX sincronizados com ações resolvidas, indicadores por alcance e fog |
| V4.8 | Planejado | Render de GLB, vídeo, áudio, animações e fallback local |
| V4.9 | Planejado | Banco de ações tipadas/AST, multi-combos, condições, prompts e automações com limites e validação |
| V5.0 | Meta de certificação | Matriz de todas as mecânicas, campeões e itens por patch; simulações com milhares de seeds, replay e sem bugs impeditivos |

## Princípios de arquitetura

1. Separar *pedido* → validação → commit recursos → efeito → evento filtrado → apresentação cinematográfica. Os eventos de vídeo nunca determinam dano/visão.
2. Tempo de jogo medido em segundos simulados; 2× acelera a parede temporal/reprodução, não recargas/DoT/CC.
3. Registry universal de primitivas, manifest individual de campeão por patch. Nunca presumir que dois `Q` com mesma animação têm hitbox/dano iguais.
4. `targetId`/posições são dados sensíveis sob fog. Jornal local é debug; um serviço futuro deve transmitir apenas visão/resultado observável de cada lado.
5. Snapshot não é replay de comandos; capturar entrada, decisões, seed, ordering e versão de regras antes de alegar reprodutibilidade fim a fim.
6. Gates de V4.2: no mínimo fixtures de campeões por tipo de habilidade, casos de colisão, CC, interrupção, recast/charges e compatibilidade de salvamentos; faltas de kit devem aparecer como indisponíveis, nunca como casts genéricos silenciosos.

## Débito técnico bloqueante antes da certificação

Unificar caminhos legados restantes; rollback de operação composta; forced movement real de charm/fear/taunt; cleansing seletivo por habilidade e estase; camada de colisões/skillshots; replay causal; segurança multiplayer; dados por patch certificados.
