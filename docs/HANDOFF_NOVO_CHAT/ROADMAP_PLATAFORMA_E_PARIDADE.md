# Roadmap mestre — cadeia de dependências e marcos ainda abertos

| Marco | Escopo/gate | Situação atual |
|---|---|---|
| V4.5.2c | farm last hit real, 35–62 CS/5min normal; freeze separado | PASS no normal, freeze parcial |
| V4.5.2d-dev1 | buff por tipo de minion Barão + Elder 3 ticks | Parcial testado |
| V4.5.2d-dev2 | 6 Dragon Souls por time e CD por champ + Recall Barão | Parcial testado (atual) |
| **V4.5.2d-3** | passivos elementais por stack, Baron AD/AP+movimento, Elder/Smite/objetivos simultâneos | **Próximo** |
| V4.5.2e | attack speed, windup, velocidade projetil, minions aggro/pathing, freeze TOP/MID | Planejado |
| V4.5.3-a/b/c+ | todos os itens por classe/receitas/ativos/passivas, builds, runas, summoner spells | Planejado por lotes e patch |
| V4.5.4-a/b/c+ | base+growth de todos champs, passivas, QWER, recasts, CC, targeting, colisões, VFX contract | Planejado por lotes |
| V4.5.5 | AST de comandos e parser PT-BR + golden tests; migração incremental Rust com equivalência | Planejado |
| V4.5.6 | login/cadastro, segurança, contas, nível de conta, perfil, amigos, inventário/loja de conta | Planejado |
| V4.6 | lobby, matchmaking, draft, queue, private/casual/ranked, multiplayer autoritativo com WebSocket | Planejado |
| V4.7 | render de skillshots, VFX/telegraph, collision visuals, sincronização com eventos | Planejado |
| V4.8 | GLB low-poly, animações, câmera, áudio/vídeo/fallback offline | Planejado |
| V4.9 | Tactical Prompt Engine: Qwen local opcional + comandos condicionais, múltiplos agentes e benchmark | Planejado |
| V5.x | certificação patch-a-patch, QA de paridade, observabilidade e capacidade de carga real | Planejado |

## Regras de engenharia

Nunca liberar PvP público apenas com ocultação CSS de fog. Rust server authoritative com match actor, WebSocket push/event-driven, reconexão e seleção por observabilidade. WASM restrito à parte pública. Índice por patch em todos os conjuntos de dados; não compartilhar números genéricos entre personagens sem manifesto. `1×/2×` reduz duração real da partida sem encurtar cooldown em segundos simulados. UI de conta distinta da loja de itens e nível do campeão; produto web primeiro, 3D depois.

## Recursos e limitações

- Um VPS Ubuntu já existe como intenção de hospedagem, mas hardware, SLA, domínio, backup e capacidade sustentada ainda precisam de avaliação.
- Capacidade para milhares: estabelecer carga alvo em sessões/partidas e medição de RAM por match actor, CPU por tick, latência p95, fila e reconexões antes de dimensionar.
- Sem migrar para Godot por default; decisão futura orientada por protótipo/medição.
- Assets autorais low-poly com otimização de texturas preferencialmente 512–1024, 2K pontual.
- Conteúdo 1:1 segue meta de referência técnica, não estado já existente. Legal/licenças é gate de publicação.
