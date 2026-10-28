# COACHLOL MACRO ARENA — BÍBLIA DE PRODUÇÃO

**Edição 0.9 — 25/10/2026 · Produto: treinamento estratégico offline-first, futuro multiplayer competitivo.**  
**Referência de regras:** Summoner's Rift padrão, patch 26.21 (20/10/2026; hotfixes até 22/10), não Swiftplay / League Classic / Arena.  
**Referência de dados estáticos:** Riot Data Dragon versão `16.21.1` apresentada no portal oficial; sempre confirmar `versions.json` no momento do build.  
**Autoridade do mapa:** máscaras manuais 4096×4096 fornecidas pelo projeto CoachLOL, preservadas no pacote.  
**Estado:** documento de escopo, contratos e critérios de aceitação; NÃO constitui declaração de que as centenas de regras/itens/skills estejam já implementadas.

## 0. Visão do produto, objetivos e limites

O jogador comanda cinco personagens de um lado de um mapa tático, por turnos de planejamento simultâneo. O jogo simula automaticamente, em pequenos ticks determinísticos, combate básico, minions, torres, economia, visão, objetivos e consequências estratégicas. Deve permitir planos persistentes (`mid → bot → mid`), ações condicionais por ponto (gank, ward, limpar jungle, recall etc.) e política de reação (cautelosa, equilibrada, agressiva) para que a partida não seja um jogo de cliques repetitivos. O oponente jamais vê ordens seladas, nem recebe informação de regiões sem visão. A interface apresenta uma abstração tática original em 3D low-poly. As regras e recursos de terceiros estão sujeitos às autorizações aplicáveis; chave de API de desenvolvimento não equivale a autorização de criar um jogo derivado.

### Invariantes inegociáveis

1. **Um estado autoritativo** do mundo; um único sistema de coordenadas para mapa, colisores, visão e peças.
2. **Um relógio comum por rodada**, desde a abertura de planejamento até `max(blueConfirmedAt, redConfirmedAt)` ou prazo. Nenhum lado executa movimentos/ataques antes do fechamento.
3. **Até cinco planos independentes por equipe**; ausência de ordem nova não cancela plano anterior.
4. **O aliado nunca desaparece na sua própria fog**; unidades aliadas, minions e sentinelas revelam terreno conforme LOS e moitas.
5. **Sem IA onisciente**; bot consome somente `visibleState(team)` e memória de informações reveladas.
6. **Minions e torres autonomamente simulados**, sem precisar de ordem do usuário.
7. **Rota persiste até conclusão/interrupção/condição**; limites físicos respeitam velocidade, colisão e interações.
8. **Replay reproduzível** por patch, mapa, seed, estados, locks e decisões; desempates com PRNG seedado.
9. **Loja, runas, campeões e regras versionados por patch**, não textos hardcoded ou screenshots.
10. **Visual não altera gameplay**: 3D, câmera e LOD não afetam posições/combate.

## 1. Fluxo de ponta a ponta

`Lobby → Configuração da partida → Ban (5 × 2) → Pick em ordem 1–2–2–2–2–1 → Ajustes privados de lanes / runas / summoner spells / builds / jungle path → Loading → Fonte / compras → Planejamento simultâneo → Selagem → Resolução física determinística → Reveal filtrado pela visão → Novo planejamento → Nexus destruído → Relatório de Skills e replay`.

### Champion Select

Azul vertical à esquerda, Vermelho vertical à direita e seleção central. Cada janela tem 20 segundos (preservar configuração do protótipo anterior); bans por equipe; picks bloqueados não podem reaparecer; rotas, runas, item presets e jungle paths não são revelados aos adversários antes da partida. Verificar nuances de bans simultâneos versus alternados da fila-alvo antes de alegar reprodução fiel. Acompanhamento de atraso/desconexão, auto-pick e regras de dodge. Bloqueio de função e swaps devem preservar cinco picks sem duplicar. Splash de alta resolução somente como asset visual, não thumbnail ampliada.

### Loja inicial e início

O jogador equipa e planeja simultaneamente TOP, JG, MID, ADC e SUP. O modo tutorial pode oferecer **posicionamento especial na primeira rodada** para eliminar um tempo morto extenso de caminhada; isso é regra CoachLOL e não deve ser apresentado como LoL oficial. Depois desse posicionamento, nenhuma transposição instantânea entre lanes.

## 2. Relógio da rodada e conversão LoL ↔ tabuleiro

### Política aprovada (`elapsed-clock`)

- Abre-se uma janela de decisão com limite configurável de 10/30/60 segundos reais.
- `blueLock` e `redLock` selam as ordens sem iniciar o gameplay.
- `simulatedSeconds = ceil(clamp(max(blueLock, redLock) - roundStart, 1, decisionLimit))`, se ambos confirmaram; se o prazo venceu, `simulatedSeconds=decisionLimit`.
- Exemplos: confirmações 10s+10s → 10s; 10s+30s → 30s; timeout 30s → 30s.
- Em multiplayer, os relógios são marcados pelo **servidor**, não pelo cliente; o cliente apenas exibe o restante. Em offline-versus-bot, o bot pode selar antes e o usuário determina a duração até confirmar; em testes, tempo é injetado para replays determinísticos.
- O motor simula os mesmos `N` ticks para ambos, movendo minions, combatendo, diminuindo cooldowns, objetivos e respawns. Nenhuma ordem é processada antes da selagem conjunta.

**Tradeoff de design deliberado:** decisões mais rápidas aceleram a cadência humana, mas avançam menos tempo *dentro* do jogo. Um jogador pode deliberadamente esperar para adiantar timers. Isso é justo pelas regras do relógio compartilhado, mas exige validação de competitividade e uma opção separada para resolução fixa no futuro, se o design quiser reduzir manipulação de ritmo.

### Precisão e eventos

Para MVP, `tick=1 segundo` inteiro com `ceil`. Produção pode migrar para 50–100 ms lógicos ou ticks por evento, sem depender de FPS gráfico. Registrar segundos efetivos, posições, itens, ordens, seed e versão das regras em cada frame. **Nunca** converter o tempo real com `Date.now()` salvo como fonte de verdade em multiplayer: usar relógio monotônico/autoritativo.

## 3. Movimento, velocidade, pathfinding e ações

A velocidade (MS) de League of Legends mede unidades de mundo por segundo. Usar coordenadas do mapa tipo Riot (`minX=-120`, `maxX=14870`, `minY=-120`, `maxY=14980`) como calibração **de referência, ainda sujeita ao registro geométrico preciso das máscaras do usuário**. A largura de 4096 px da arte **não** significa 4096 unidades de movimentação.

Definição inicial de MS:

`rawMS = (baseMS + flatBonuses) * (1 + additivePercentMS) * ∏(1+multiplicativeMS) * (1 - largestSlow)`.

Caps de referência: abaixo de 220 há ajuste; 415–490 usa 80% da velocidade excedente; acima de 490 usa 50% da velocidade excedente. Slow resist, ghosting, colisão de unidades, slow imune, dashes e teleporte exigem regras específicas posteriores.

`distanceBudgetWorld = effectiveMS * simulatedSeconds - timeSpentChannelingOrFighting` (o motor atual move por tick e ainda não implementa fielmente todas as interrupções). Cada segmento da rota é `hypot(ΔxNormalized×worldWidth, ΔyNormalized×worldHeight)`; o caminho A* é atravessável somente quando máscara/raio da unidade permitem.

**Ordens persistentes por campeão:**

`MoveTo(target)`, `Path([Waypoint])`, `Stand/Farm`, `Push`, `Freeze`, `SlowPush`, `Trade`, `AllIn`, `Kite`, `Retreat`, `Recall`, `Shop`, `Ward`, `ClearCamp`, `TakeObjective`, `AssistAlly`, `DefendTurret`, `HoldBush`, `Roam`, `Gank`.

Cada `Waypoint` guarda `target`, `action`, `minimumDuration`, `maxDuration`, `trigger`, `onEnemySpotted`, `onLowHP`, `onTargetLost`, `onWardDetected`, `onEnemyJunglerSeen`, `fallbackRoute`, `continueWhen`. Exemplo: `mid → rio (ward) → bot (gank alvo ADC, por até 8s) → mid (farm seguro)`. Cada ação pode durar várias rodadas. O jogador pode editar uma etapa sem apagar os planos dos outros quatro personagens. Caminho parcialmente executado persiste e passa por obstacles.

**Rota segura/rápida:** otimização ponderada por tempo estimado, colisores, zona de ameaça, probabilidades de visão, zonas de torre e moitas. Não usar posições inimigas ocultas na função de custo. Trajeto desenhado pelo jogador preserva seus pontos intermediários. Dash/Flash: teleporte validado por alcance, endpoint atravessável e regra de passagem por muro da habilidade.

## 4. Motor de combate e atributos

### Stats por personagem

HP/regen, mana ou recurso alternativo, nível/XP, AD base/bonus/total, AP, armadura, resistência mágica, velocidade de ataque, alcance, velocidade de movimento, crítico, penetração, letalidade, haste de habilidade, tenacidade, alcance de visão, lifesteal/omnivamp, healing/shield power, stacks, on-hit/on-cast, shield, tempo de CC, cargas e cooldowns. Cada stat depende de `champion_id`, nível, itens, runas e buffs.

### Ordem de processamento

A cada tick: status pré-tick → visão → movement/steering → interações → início de projéteis/skillshots → ataques automáticos → colisão e efeitos → shields/mitigação → morte/assist → XP/gold → estruturas/objetivos → respawn → atualização da visão. Precisamos documentar a precedência específica para efeitos simultâneos para garantir replay determinístico.

### Tipos de dano e interações

Físico, mágico e verdadeiro; mitigação por armor/MR, penetração flat/%, resistências negativas, vampirismo, anti-heal, invulnerabilidade, imunidade, spell shield, on-hit, on-attack, anti-shield, execuções, dano por vida atual/máxima/perdida, DoT, AoE, redução por múltiplos alvos, efeitos de terreno e unidades-summons.

### Estados de controle

Stun, root, silence, suppression, knockup, knockback, slow, fear, taunt, charm, blind, polymorph, airborne, grounded, stealth, camouflage, untargetable, stasis, unstoppable, cleanse, tenacity. Cada estado com máquina de transição, dispel, prioridades e testes.

### Archetypes táticos

Marksman/ADC: AA à distância, kite, attack-move, last-hit e DPS sustentado; mage: custo/recurso e janelas de skillshots/CD; assassin: burst, flanco, execução e retirada; tank: aggro, engage, peel e resistência; fighter: sustain/skirmish; enchanter/support: shield/heal/CC/ward. **Classe é heurística de IA e UX**, nunca substitui a habilidade individual.

## 5. Autonomia / reação tática

Mesmo sem ordem nova, cada herói possui uma `policy` configurável e preservada: `safe`, `balanced`, `aggressive`, além de regras customizadas por evento. Prioridade: preservar-se quando HP crítico; responder a quem atacar; respeitar torre; usar skill defensiva se habilitada; last-hit seguro na lane; voltar após limpa jungle; retomar rota/objetivo. Habilidades automáticas consomem recurso e cooldown exatamente como ações explícitas. A reação de ambos é executada no mesmo timeline, sem subturno extra para um jogador. Exibir no replay **por que** a política respondeu.

## 6. Waves / minions / controle de lane

**Spawns automáticos:** 3 melee + 3 ranged por wave inicial; siege/cannon conforme padrão versionado; super minions após queda de inibidor. O patch 26.1 define geração a partir de 00:30, intervalos de 30s inicialmente, 25s aos 14min e 20s aos 30min; reduzir um melee nas waves com cannon a partir de 14min e um ranged nas late waves a partir de 30min. Cadência e dano por tier/tempo precisam de valores versionados e testes, não só contadores fixos.

**Comportamento obrigatório:** minion avança pelo centro navegável da lane; detecta unidades/torres em alcance; seleciona alvo segundo prioridade; ataca em intervalos; projétil dos magos/canhões tem tempo de viagem; mortes liberam avanço; aliados e inimigos se encontram. Minions aliados dão visão (LOS limitada pela parede) e não somem em fog aliada. Simulação de push deve suportar slow push, hard push, freeze, rebound, crash, bounce, proxy e break freeze como efeitos emergentes de tamanho de wave, aggro, dano, last-hit e posição, não rótulos cosméticos de HUD.

**Regras de prioridade:** alvo atacando campeão aliado, outros minions, torre e campeão, levando em conta aggro específico do LoL e alcance de ataque. **Nunca** parar tropas antes da própria distância de ataque (bug v0.8 corrigido). Minions não respondem a clique do jogador (exceto por ações de campeão que influenciam wave).

## 7. Torres, inibidores, Nexus e dives

Estruturas importadas das máscaras, IDs únicos por equipe, TOP/MID/BOT e tiers 1, 2, 3, mais torres do Nexus. Colisor e alcance independentes. Vida, armadura, dano, ramp-up, placas, backdoor protection, friendly minion armor, alvo, prioridade, aggro e troca para campeão agressor. Regra de dive: atacar campeão aliado na área protegida pode atrair a torre mesmo com tropas presentes. Shots aplicam dano em instantes corretos; evasão/dashes podem alterar alvo segundo regras; mortes geram ouro/assist de acordo com fonte correta. Inibidor derrubado permite super minions e respawna; Nexus destruído encerra jogo. Regras 2026 de respawn das torres do Nexus devem ser parametrizadas.

## 8. Jungle, plantas, visão e objetivos

**Camp como entidade:** um marcador central, composição interna gerada pelo runtime. Red/Blue; Grompe; Lobo grande + dois pequenos; Acuâmina Carmesim + cinco pequenas; Krug antigo/grande + médio e minis; Aronguejo por lado. Spawn/re-spawn, tether, leash, resets, aggro, camp assist, experiência/gold, buffs, Smite, jungle pets e respawn no relógio. Monstros só surgem quando o evento programado é cruzado pelo `gameTime`, e nunca aparecem por ação manual fora de regras.

**Épicos:** dragões elementais (Infernal, Oceano, Montanha, Nuvens, Hextech, Quimtec) com sequência pseudoaleatória seedada e regras de repetição/mapa; Alma após critério oficial; Ancião condicionado ao estado de Alma; Baron, Arauto, Vastilarvas conforme patch/mode; buffs possuem duração e efeitos, não apenas um multiplicador genérico. Smite contest/steal, dano cumulativo e objetivos simultâneos seguem timeline.

**Visão:** raio de aliado, minion, sentinela, torre, visão da moita (inclui distinção ocultação/revelação), objeto invisível, detecção, fumaça, campo de visão em cone/círculo conforme origem, bloqueio por paredes e altura, memória de últimos vistos, efeitos de stealth. Dados do bot enviados somente com `visibleState(red)`; mesma restrição no multiplayer. Registros de alvo/ordem adversários ocultos não vazam em eventos.

## 9. Draft, runas e spells por campeão

Runas precisam de **seletor real** de árvore principal + secundária + shards, com restrições, stat modifiers, cooldowns e gatilhos; presets por campeão, matchup, role e build são sugestões opcionais, versionadas e explicáveis. Summoner spells: Flash, Ignite, Exhaust, Teleport, Smite, Heal, Barrier, Ghost, Cleanse, etc. Foco em alcance, alvo legal, regras de CC/cleanse e cooldowns.

A seleção de skills em combate deve permitir `Q/W/E/R`, combos condicionais, alvo, zona, direção, ângulo e recursos, com VFX não bloqueantes. Para cada campeão, criar contrato individual: passiva, Q, W, E, R, transformação/segundo kit se houver, tags de habilidade, formas alternativas, buffs/companheiros, reset, dashes e animações. **Não afirmar “todos os campeões prontos” até que cada um passe sua suíte de testes.**

## 10. Loja, itens, inventário e build

**Catálogo completo por patch** (`Data Dragon item.json`), com ID, nome, tags, preços de compra/venda, receitas (`from`, `into`), mapa/modo, stats, passivas/ativas, cooldown, stack, condições de compra, inventário de seis slots, trinket e evolução de suporte/jungle. Nem todos os itens enumerados no arquivo são compráveis no Summoner's Rift padrão; filtrar flags de mapa, modos e disponibilidade. Compras/revendas somente nos locais permitidos, com regra de undo. Presets de builds por campeões/roles são dados recomendados, distintos da verdade de regras. Fontes para recomendação: estatística permitida/curada por patch e matchup; não concluir “melhor build” de descrições estáticas apenas.

**Dados e sprites:** `champion.json`/`champion/{id}.json`, `item.json`, `summoner.json`, `runesReforged.json`, splash `img/champion/splash/{id}_0.jpg`, loading `img/champion/loading/{id}_0.jpg`, champion square, spell icons e item `img/item/{id}.png`.

## 11. Bot offline / IA por elo

Fase A: bot determinístico sem acesso a inimigos ocultos, com greedy heurístico e scripts táticos. Fase B: GOAP / utility AI / behavior trees com estados de wave, objetivo, macro e combate. Fase C: self-play offline e avaliação por cenário. Fase D: adversário calibrado por MMR/elo (Ferro → Desafiante), com perfil de erros, coordenação, visão e reacção, não “cheat” de stats. Meta competitiva de 40–45% de vitórias do bot Desafiante contra usuários muito bons **depende de experimento estatístico**, nunca garantida por slider.

## 12. 3D low-poly e performance

Terreno 4096×4096 é referência visual/semântica, **não** um mesh 4096² necessariamente. Gerar height field leve + camadas de mask + navmesh, paredes com malha simplificada, brush billboards/folhagem instanciada, rio shaders básicos, estruturas meshes com colisores físicos. Câmera padrão top-down, pan esquerdo, orbit direito, zoom ao nível da lane sem atravessar terreno. Meshes e LOD são **render-only**; lógica sempre usa XY mundo e IDs. Para modelos de campeões, usar materiais/modelos/rigs autorizados, com export compatível GLTF/GLB, animações idle/run/attack/cast/death, compressão meshopt/Draco, texturas KTX2 e instancing quando possível. Não extrair modelos/animações de terceiros sem licença.

## 13. Persistência, replay, multiplayer, ranking

Saves locais em IndexedDB, compatibilidade entre schemaVersions, CRC/assinatura para integridade, snapshots e action-log por rodada. Sem persistir chaves Riot no navegador. Futuro multiplayer autoritativo: servidor recebe ordens assinadas/seladas, manda ACK, resolve após ambos LOCK ou timeout com tempo único, filtra por visão, verifica RNG e hashes, anti-cheat, reconexão, abandono, espectador atrasado e replay. PDL/Elo/Matchmaking só após antifraude, balanceamento e disponibilidade. Desktop pode empacotar web/Tauri e core Rust; browser usa mesmo core compilado em WASM.

## 14. Telemetria, UX e ensino

HUD minimalista com contexto por campeão e ícones reais; cinco cartões de equipe; planejamento e postura; fila de ações, risco e tempo até próximo evento; indicadores que explicam *por que* um caminho não é possível, por que um objetivo não está visível, por que uma torre mudou alvo; player-controlled playback do combate que só revela inimigos vistos. Treino vinculado às Skills CoachLOL: salvar `knownState`, `chosenAction`, `result`, `bestAlternatives`, `confidence`, `reason`, `learningObjective`. Acessibilidade, escalas 1080p/1440p, controles de teclado, FPS gráfico desacoplado da simulação.

## 15. Marcos (sequência com portões de aprovação)

| Marco | Entrega | Critérios de aceite, antes de avançar |
|:--|:--|:--|
| **M00 — Escopo e direitos** | Documento de produto, autorização de IP/arte, patch base | Escopo da reprodução e uso de assets permitido, registro de fontes/versionamento |
| **M01 — Atlas fiel** | Máscaras 4096, objetos v6, proj. coordenadas mundo | Torre/nexus/moitas/colisores coincidindo em todos os zooms, sem inventar pontos |
| **M02 — Núcleo determinístico** | Core Rust compartilhadíssimo nativo/WASM, seeds, state serialization | Replay reproduz bit a bit em plataformas alvo; testes de equivalência JS→Rust |
| **M03 — Simultaneidade** | Dois locks, timeout, 10/30/60, action log | 10+10=10; 10+30=30; nenhum tick antes de dois locks |
| **M04 — Movimento & navegação** | MS oficial patch, path persistente, waypoint, botas, dash | 100 percursos contra tempos medidos, colisão/LOS e sem teleporte transversal |
| **M05 — Waves & economia** | Melee/caster/cannon/super, last hit, XP, CS, freeze/push | Waves dos 2 times lutam sem acumular, freeze é possível e quebrável, canhão correto |
| **M06 — Estruturas & dive** | 22 torres e regras de aggro, placas, inibidores, Nexus | Scenarios de siege com minions, dive, backdoor, respawn e fim de partida |
| **M07 — Jungle & épicos** | Camps compostos, pathing, drag random, alma/anciã/baron | 2 sides simétricos, spawn/respawn auditados em cada patch, 50 steals/replay tests |
| **M08 — Stats & combate** | Damage pipeline, CC, projéteis, passive/triggers | Golden tests contra dataset conhecido por tipo, cooldown/recursos/target flags |
| **M09 — Campeões** | Catálogo completo passivas/QWER por patch, spells | Cada campeão com suíte dedicada e regressão de interações cruzadas |
| **M10 — Itens e runas** | Catálogo DDragon, build graph, runas e recomendações | TODOS os ativos legais em SR carregados, receitas/loja/CD/passivas testadas |
| **M11 — Autonomia e bots** | Políticas defensivas, macro por elo, probabilidades calibradas | Zero visão privilegiada, ≥1000 matches seedados + intervalos de confiança |
| **M12 — Visual 3D e VFX** | Low-poly modular, câmera, animação, LOD, áudio | 60 FPS alvo em hardware definido, sim determinística, zoom sem clipping |
| **M13 — Multiplayer** | Autoridade servidor, fog segura, lobby, reconexão, anti-cheat | 1000 partidas de teste, sem vazamento de ordens, igualdade de tempo |
| **M14 — Coach & analytics** | Skills, replay explicativo, tutoriais e relatórios | Evidências rastreáveis, feedback útil e validado por coaches |
| **M15 — Release & patch operations** | CI/CD, métricas, atualizador oficial de dados | Zero regressão bloqueadora, direitos confirmados, suporte e rollback |

### Ordem de desenvolvimento prática

Primeiro terminar M01–M07 antes de tentar centenas de campeões. **M03/M04 já têm protótipo executável na v0.9**, mas sem calibração geométrica validada; M05/M06/M07 ainda são adaptações parciais. Não migrar toda HUD para Rust: UI web, core Rust+WASM + mesmo core nativo no servidor é a estratégia sugerida.

## 16. Riscos e decisões pendentes

- A API key de desenvolvedor não concede licença para criar simulação/recriação de League of Legends; política do Riot Developer Portal exige análise e aprovação específica antes de distribuir/comercializar. Não embutir chave no frontend.
- Data Dragon tem dados estáticos e imagens, **mas não fornece simulador fiel de passivas/QWER**. Catálogo completo exige engenharia de gatilhos e golden tests.
- Meta de winrate bot depende de público/elo, intervalo de confiança e calendário de avaliação.
- A regra de turnos por tempo real decorrido pode criar incentivo a esperar; decisão de produto deverá ser ratificada em playtest competitivo.
- Dimensões aproximadas de coordenadas no mapa não substituem georreferenciamento entre imagem 4096 e mundo LoL.
- Não é razoável garantir “todas as mecânicas 100%” em um protótipo: a aceitação final é uma matriz por patch, campeão, item e interação.

## 17. Referências verificadas em 25/10/2026

1. Riot Developer Portal — Data Dragon, endpoints versionados, itens, campeões e assets: https://developer.riotgames.com/docs/lol
2. Riot — Patch 26.21 e atualizações: https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/
3. Riot — Patch 26.1, minions/alterações de temporada: https://www.leagueoflegends.com/en-sg/news/game-updates/patch-26-1-notes/
4. League of Legends Wiki — Movement Speed (fórmula/soft caps): https://wiki.leagueoflegends.com/en-us/Movement_speed
5. Meraki Analytics/Cassiopeia — bounds de coordenadas Summoner's Rift: https://github.com/meraki-analytics/cassiopeia/blob/master/cassiopeia/data.py
6. LoL Wiki — Minions e wave cadences: https://wiki.leagueoflegends.com/en-us/Minions
7. Riot — Developer General Policies: https://support-developer.riotgames.com/hc/en-us/articles/22698591841939-General-Policies

A política de versão é *sempre patch-specific*; não misturar mudanças de outras filas/modes em um perfil de Summoner's Rift padrão.

---

## Adendo V3.9 — base de atributos, executor incremental e marcos canônicos

A fonte canônica de tarefas e dependências a partir de V3.9 é `docs/ROADMAP_CANONICO_V39.md`. A execução de habilidades, cooldowns e skills por patch migra para um único resolver em V4.0. Velocidade 1×/2× é desacoplamento do relógio **de parede** e relógio **de jogo**. O banco de ações futuras compõe intents validados, não simulações por texto solto; a descrição JSON proposta está em `docs/DATA_ACTION_BANK_V39.json`. A camada cinematográfica continua observacional e nunca substitui cálculo do motor ou revela fog. Qualquer alegação de paridade requer comparação de patch oficial e testes de interação de cada campeão, skill, item e runa.
