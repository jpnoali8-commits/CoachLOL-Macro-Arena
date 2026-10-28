# CoachLOL Macro Arena — Roadmap canônico pós V3.9

**Fonte canônica a partir de 26/10/2026.** A V38.2 é a base da V3.9; a fundação cinematográfica V3.7 foi mesclada de modo seletivo na V38.2. Nunca substituir engine/app da V3.9 por V3.7, V38.1 ou V38.2 ao migrar módulos. Histórico anterior permanece imutável.

## Princípios técnicos não negociáveis

1. Tempo do jogo é determinístico, em segundos simulados. **1×/2× altera exclusivamente a relação tempo de parede ↔ tempo simulado**. Os timers, DoT, buffs, CC, recarga, efeitos atrasados, spawns e deslocamento continuam sendo calculados com o mesmo tempo simulado. Aceleração de habilidade altera os CDs segundo `baseCD * 100 / (100 + haste)`; o percentual CDR é derivado, não soma independente.
2. Motor é fonte da verdade: valida posse, skill rank, mana, range, visibilidade, posição navegável, cooldown, colisão, segunda ativação, gastos e efeitos. UI/LLM são produtores de `intent`; nunca executam dano diretamente.
3. Estado oculto não é publicado: redaction acontece no servidor antes de event sourcing, replay e timeline cinematográfica por perspectiva, e nenhum log de ordem futura pode vazar coordernadas na fog.
4. Manifestos são dados versionados e auditados (`champion`, `abilities`, `item`, `status`, `effects`, `runes`, `summoners`, `levelGrowth`, `patch`, `mode`). Comportamento desconhecido não é implicitamente classificado como 1:1.
5. Variantes reutilizam **componentes de mecânica** (projectile, dash, recast, chain heal, shield, aura, buff, interrupt, AoE) com parâmetros individuais por campeão, sem copiar artificialmente habilidades distintas.
6. Não criar um “banco gigantesco de prompts mágicos”: registrar AST de **ações canônicas**, intenções, condições de pré-requisito, alvo, posição/direção, etapas e plano alternativo. Parse do texto para ações tipadas; determinismo/replay se baseiam no AST validado, não no texto livre.

## Marcos na ordem de dependências

| Marco | Trabalho e critérios de aceitação | Estado |
| --- | --- | --- |
| V3.9 · fundação | Catálogo tipado de atributos, AH/CDR, painel de stats com auto-ocultação, itens exemplares verificados, gate/commit parcial de casts, Lux/Nami/Vex R direcional e R2 inicial, aceleração 1×/2× apenas no tempo de parede, testes | **Implementado como fundação; auditorias pendentes** |
| V4.0 · executor autoritativo universal | Migrar **todos os caminhos** (AA, auto skills, combos, reactions, summoner, item active, monster/structure) para validação e gasto atômicos; command journal; serialização estável/replay por seed; invariantes/locks e rollback; cooldown gates até subsegundos | Pendente, bloqueia integração massiva |
| V4.1 · status/efeitos | Status ledger central: CC (stun, charm, fear, root, suppression, knockup, blind, silence, ground), invulnerabilidade, untargetable, estase, shields tipados, anti-heal, buffs, debuffs, DoT, HoT, clean/purge, stacking, prioridade e imunidades | Pendente |
| V4.2 · dados individuais e kits | Base data por patch, base + crescimento por nível e champion-specific stats, passivas, recursos alternativos, evoluções e transformações, Q/W/E/R, combos, habilidade de 2º estágio, skillshots, geometria/collision shape, interrupt, channeled/cast time, target policy e VFX manifests | Pendente; migração progressiva, cobertura assinada |
| V4.3 · itens, runas e economia | Loja/versionamento, inventário/recipes, ativos e passivos, AH separado (basic/ultimate/item/summoner), lethality, pen flat/% por tipo, armor/MR, regen, crit, atk speed/caps, LS/omni/spell vamp, heal/shield, tenacity, level scaling, gold/XP/jungle/minion curves, upgrades | Pendente |
| V4.4 · mapa e teamfights | Waves/structures/tower aggro, objectives multirrodada, Smite disputado, line of sight/vision, gank fog, roam/chase/fight, teamfight multimembros, pathfinding e fog de projéteis | Pendente |
| V4.5 · macro 5v5/endgame | Loja na fonte, lobby/draft, 5 posições, condições de vitória, surrender/remake, desconexão/resume, afk policies e AI bot calibrado, métricas de partidas simuladas | Pendente |
| V4.6 · multiplayer/busca | Servidor autoritativo, clocks assinados, validação de ações, sigilo por perspectiva, matchmaking/filas, salas e filtros de velocidade 1×/2×, anti-cheat, reconciliação e replay | Pendente; UI local de velocidade já existe |
| V4.7 · eventos e VFX | Timeline observacional para ult/CC/objetivos, directional previews, efeitos temporais, câmera, áudio básico, fallback offline, filtro de fog e políticas de interrupção | Fundação desde V38.2; assets pendentes |
| V4.8 · GLB/cinemática | Low-poly GLB, animações autorais, skeletons, câmera, vídeo, sincronização multimídia, LOD e controle de performance | Pendente |
| V4.9 · banco de ações/LLM | DSL/AST validado, parâmetros de objetivos, cadeia multiações, guards/alternativas, simulação de resultados, deduplicação de templates e fixtures por campeão, import de datasets e autoria assistida por prompt | Arquitetura em V3.9; produto pendente |
| V5.0 · auditoria exaustiva | Cobertura 1:1 do patch de referência por roster, item, passiva, crescimento, ordenação causal, eventos, mapa, regras, cross-champion interactions, 1000+ cenários de replay/seed, balanço estatístico e aprovação de paridade | **Meta, não concluído** |

**Observação:** versões são marcos de desenvolvimento, não promessa de conclusão automática ou fidelidade. Proporção de campeões certificados precisa ser registrada por patch de dados: `unknown`, `training`, `prototype`, `verified`, `regression-pass`.

## Matriz de auditoria necessária

- **Atributos:** HP, mana/energia/fúria/recursos individuais, regen, AD/AP, armor/MR, flat/% pen, lethality, crit e seus modificadores, AS, MS (soft caps), rangos de AA e habilidade, haste (básica/ultimate/itens/feitiços), tenacidade, resist slow, tamanho, alcance dinâmico, heal/shield amp e reduções de dano.
- **Combate:** dano físico/mágico/verdadeiro, AA windup/recovery, on-hit/on-attack/on-spell, LS vs omnivamp, execute, AoE, mark, proc, stacking, cleanse, spell shields, projectile interception/reflection, untargetable vs invulnerable, unstoppable e shield ordering.
- **Habilidades:** target unit/self/point/vector/area/global, closest point in range, movement into range (via navmesh), LoS/vision, projectile flight, collision mask by target class, 2-stage recast, channel/cancel, empowered state, charges/recharge, ability evolution/transform and callbacks.
- **Tática:** queue, move-and-cast, chase to visibility boundary, gank with hidden path, synced allied combos, resolve simultaneous order with stable tie-break, retreat and defense without permission gating.
- **Outros:** runes, consumables, trinkets, Baron/Dragon spawns, objectives contest, minion speed/farm, jungle gold & XP, turret targeting & plating, CS, item quests, level growth, game end, surrender, matchmaking, replay, observability, GLB/VFX.

## Indicadores / gates da V4.0

- Todas as alterações de mana, cooldown e dano passam por um executor único (sem `u.mana -=` fora do resolver).
- Todos os cast specs descrevem range, line/area geometry, cast point/direction, target policy, recast state e reaction window.
- Save/reload e replay determinístico chegam ao mesmo checksum por perspectiva; nenhuma ação oculta aparece no log de adversário.
- Acelerador 2× não modifica checksums por round ou game second para mesmo seed e ordens.
- Latências de criação/ação e fallback cinematográfico não impactam tick, HP ou `cooldownEndsAt`.

## Atenção às pendências da V3.9

A V3.9 entrega **apenas gate/commit em fluxos selecionados**. Outros caminhos legados ainda têm gasto direto e não devem ser apresentados como executor autoritativo completo. R da Vex contém aproximação/recast e dano em aproximação simplificados; reset por takedown, tempo de voo, revelação de marca e invulnerabilidades precisam entrar na auditoria V4.2. A prévia geométrica no mapa representa alcance aproximado e não ainda colisão instantânea por VFX/GLB. Attribute ledger cobre nomes de propriedades, mas nenhum bônus fictício deve ser aplicado a campeões não auditados.
