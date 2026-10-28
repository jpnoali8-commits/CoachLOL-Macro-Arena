# ADR de continuidade — arquitetura e engenharia canônicas

## ADR-001 — Contratos antes de migração tecnológica

O motor de regras atual é JavaScript/Node (`engine.mjs`), com espelho navegador. Migração incremental para uma biblioteca Rust pura e determinística: definir representação versionada de `MatchState`, `Plan`, `Action`, `Effect`, `Event` e `Snapshot`; gerar fixtures golden JS; implementar funções Rust por domínio; comparar checksum/estado/eventos com tolerâncias justificadas para floats; trocar por feature flag. **Não fazer big bang rewrite**, nem declarar Rust/WASM implementados.

## ADR-002 — Separação de estado secreto

O servidor nativo Rust será autoritativo para movimento, colisão, targets, farm, dano, fog e resolução simultânea. O WASM de navegador pode cuidar de UI, previsões locais de ações permitidas e renderização **apenas com estado público ou autorizado para aquela equipe**. Nunca transmitir intenções adversárias ocultas, posições na fog ou combos privados para o cliente.

## ADR-003 — Relógios

`gameTimeMs`/tick determinístico e `wallTimeMs` de planejamento e apresentação são eixos independentes. Velocidade 2× encurta wall-clock, mas não escala recargas, cura, burn, ataque, XP e efeitos em segundos simulados. Reconexão deve conservar prazos do servidor e sequência de turnos.

## ADR-004 — Backend web escalável e sem polling constante

Serviço Ubuntu VPS: gateway de autenticação HTTP somente para operações e bootstrap de sessão; conexão WebSocket por jogador autenticado para comandos e eventos/deltas, com seq/ack, heartbeat adaptativo, reconexão e resume; match actor single-writer por partida para serializar ordens simultâneas e reduzir locks; snapshots duráveis e journal por partida. PostgreSQL para cadastro, perfis, inventário/progressão de conta e resultados, não para cada atualização por frame. Escalar múltiplos match actors por processo/host com limites de CPU, memória e métricas de p95. O objetivo de milhares de usuários depende de load test real, não apenas arquitetura desenhada. Redis/NATS/pubsub somente se medição mostrar necessidade; evitá-los como dependência inicial.

## ADR-005 — Identidades e progressões independentes

Nível de conta (persistido), ranks, histórico, amigos, inventário/loja de perfil ≠ nível do campeão (1–18 por partida) e itens in-game. Champ Select com loadout de feitiços fixo antes da partida; configuração de partida 1×/2× definida de forma autoritativa, sem divergência entre clientes.

## ADR-006 — Kit/componentes reutilizáveis com individualidade

Famílias como `Targeted`, `LineSkillshot`, `CircularAoE`, `Projectile`, `Recast`, `Dash`, `Shield`, `DoT`, `Heal`, `SummonerSpell`, `ItemActive` usam resolvedores universais (range, cooldown, mana, cc, collision, hit, fog, events). Cada campeão tem manifesto próprio por patch: stats base+growth, passiva, QWER, hitboxes, formas alternativas, alvos, velocidade, interações. Estado `training`, `partial`, `tested`, `certified`, sem chamar 1:1 de algo parcial.

## ADR-007 — Comandos naturais e IA local

Parser determinístico PT-BR primeiro (sinônimos, seleções, combos, condicionais, macros), AST `PlanV1` validada por JSON Schema e backend Rust; preview e edição; Qwen3-0.6B quantizado WebGPU/Web Worker opcional sob demanda, com cache e fallback manual. Modelo só traduz intenção; não toma decisões de dano, fog, alcance nem consome cooldown diretamente; planos confirmados são armazenados no replay. Data corpus >500 exemplos nos marcos V4.9, depois benchmarking e eventual fine-tuning. Sem polling contínuo do LLM e sem exigir GPU para jogar.

## ADR-008 — Frontend e assets

Web como plataforma primária e acessível. UI limpa preta/dourada, compacta, com telas login, perfil, lobby, lista de amigos, champ select, loja in-game, pós-partida e HUD. Manter layout leve antes de apostar em 3D. Blender/Tripo opcionais para props originais low-poly; GLB/glTF comprimido, LOD/instancing, atlas, texturas 512/1024 como alvo inicial de testes; 2K apenas para objetos vistos de perto. Godot não é dependência obrigatória e pode tornar o bundle desnecessariamente pesado; escolher por protótipo de performance, não por preferência.

## ADR-009 — Contratos de UX e combate que não podem regredir

Clique normal limpa seleção, Shift+clique agrega, Shift+arrastar agrupa; comandos em grupo atingem um ou vários alvos, com dano acumulado real; resposta a ataque pode mirar outro inimigo visível próximo; não exige consentimento inimigo; visuais/VFX nunca causam dano pelo próprio timeline; projétil/cast só é legal no range ou após aproximação. Gerenciamento do farm sem CS fictício. Todas as fases com fog protegida.

## ADR-010 — Direitos de propriedade intelectual

Objetivo é app de treino de LoL, conforme informado pelo proprietário. Essa finalidade não significa automaticamente permissão para reproduzir integralmente nomes, modelos, artes e software da Riot. Revisar as regras de terceiros e obter autorização quando exigida antes de distribuição pública. Não suspende trabalho de engenharia local, mas é gate de publicação.
