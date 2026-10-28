# Auditoria de Mecânicas — CoachLOL Macro Arena v0.7 (25/10/2026)

## Fonte de verdade

- O arquivo `data/original_user_v5.json` é preservado sem modificar suas coordenadas.
- `data/coachlol_map_v6.json` inclui **48 objetos**, inclusive **22 torres**, **2 Nexus**, **6 inibidores**, a jungle e os 6 spawns de waves derivados das rotas; os spawns derivados continuam sujeitos a conferência manual.
- A imagem-base `assets/mapa_atualizado.jpg` é a **nova imagem 4096×4096**.
- Full masks 4096×4096 estão em `assets/mask_layers`. Em runtime, a versão 0.7 usa uma amostragem 128×128 pré-compilada para navegação/visão. É fiel à posição dos pixels em proporção, mas **não equivalente a colisão exata por pixel**.
- Top-view é plano 2D, sem transformação em perspectiva, preservando tamanho/ângulo do mapa. Rotação pela câmera é opcional e sempre top-down.

## Regras implementadas nesta versão (modelo de treinamento)

| Subsistema | Implementado | Ainda falta para 1:1 |
|---|---|---|
| Movimento | Selecione aliado, clique destino, A*; desenho de rota por pontos e orçamento de 0,085 do mapa por rodada após deployment inicial | Velocidade individual convertida de unidades oficiais, dashes, salto de paredes por habilidade, teleporte e pathfinding completo de produção |
| Resolução | Ambos os lados têm ordens antes de cada avanço fixo de tempo simulado | Ordem de microeventos e desempates totalmente determinísticos, replay assinado, rede autoritativa |
| Fog | Pontos de visão de aliados, sentinelas e torres, wall LOS, bush concealment aproximado, inimigos ocultos não selecionáveis | Última posição conhecida, tipos de wards, sweeper, true sight, reveal, cone de visão, brush conectado, visão em combate |
| Waves | Spawn aos 0:30, 30s inicial, 25s após 14:00, 20s após 30:00; 3 melee + 3 caster, siege da wave 3, super se inibidor destruído | Prioridades completas e reset de aggro dos minions; hitbox, bloqueio, freeze, slow push, distribuição precisa de XP e gold |
| Minions | Avançam pela lane importada, param para combater inimigos, atacam campeões ou torres se não há tropas inimigas; melee, ranged, cannon e super com stats distintos | Fórmulas patch-exatas; interrupção/retarget, deslocamento relativo, last hit e dano de projéteis reais |
| Torres | Atacam minions na prioridade siege/super → melee → caster; atacam champion se não há minion; dive: prioridade ao campeão que causa dano a aliado dentro da área de proteção | Ramp-up, armadura escalonada, placas, proteção antecipada, regras especiais de dano a pets, aquisição por range oficial |
| Campeões | Classes tank, fighter, mage, assassin, marksman, enchanter, support; stats básicos e ataque auto por range; Q genérica, Flash e Exhaust simplificados | Cada campeão individualmente, passiva e Q/W/E/R, habilidades complexas, CC, efeitos on-hit, penetração, críticas, escudos, true damage, itens procs |
| Jungle | Campos reais localizados no mapeamento, timers aproximados, golpe de ataque simulado, ouro e XP | Leash, resets, pathing individual de múltiplos monstros, smite, famílias de krugs, saúde real de cada camp, buffs no champion |
| Dragões | Sorteio elementais, bônus representativos: Infernal ataque, Montanha redução de dano, Nuvens velocidade, Oceano regen, Alma após 4 e Ancião condicional (execução simples) | Ecossistema completo de tipos, soul por tipo, Efeito Hextech/Chemtech, Elder exceções e timers exatos para cada modo |
| Barão | Ao ser abatido: buff temporário, aumento simplificado de dano de campeões e minions | Empower exato por tipo, recall melhorado, range, resistências, efeitos visuais, temporizadores oficiais completos |
| Morte/respawn | Death timer simplificado escalado por level/tempo, reaparece na base, não age morto | Fórmula detalhada 2026, diferenças por modo, efeitos de reviver, onde teleporta |
| Loja | 16 itens de demonstração com custo, stats e compra na fonte / rodada inicial | Arsenal integral Riot atual, receitas, componentes, requisitos, recomendados por campeão/posição/build e efeitos ativos/passivos |
| IA | Bot de regras locais usa função de visão do próprio time e ordens simultâneas | Treino por elo, validação estatística, matchup engine, 40–45% winrate Desafiante auditado |
| Multiplayer | Não incluído neste pacote | Salas, autenticação, servidor autoritativo, visão por cliente, sincronização, matchmaking, PDL |
| Rust/WASM | Core JS sem dependência de UI preparado para extração | Transpilação NÃO é migração: portar regras para crates Rust, testes cross-runtime, binding wasm-bindgen |

## Políticas e dados de referência para 2026

- Patch Riot oficial 26.1: https://www.leagueoflegends.com/pt-br/news/game-updates/patch-26-1-notes/ 
  - primeira wave aos 0:30, waves a cada 25s depois de 14:00 e 20s depois de 30:00; primeiro cannon na terceira wave.
- Prioridades e troca de aggro de torre: https://wiki.leagueoflegends.com/en-us/Turret
- Prioridades de alvo de minion: https://wiki.leagueoflegends.com/en-us/Minions
- Data Dragon e política de dados oficiais: https://developer.riotgames.com/docs/lol

**Importante:** valores numéricos como HP/AD/mana/movimentação usados por esta v0.7 são parâmetros do treinador, não números oficiais de 2026. Não usar como simulador competitivo balanceado sem calibração.

## Critérios de conclusão v0.8

- Import de máscara 4096 com testes visual/logical pixel-to-world, incluindo caso de torre e bush.
- Pathing de campeão de TOP para BOT precisa de múltiplas rodadas mesmo com caminho pré-desenhado, nenhum passo através de colisor.
- Wave não passa por cima de onda inimiga em condição normal; torre prioriza minions, troca para atacante em dive e retorna prioridade após perder o alvo.
- Ação Q/W/E/R individual de ao menos 10 campeões com cooldown e range de skillshot; simulação reproduzível.
- Loja baseada em snapshot oficial de patch fornecido e cache offline, incluindo receitas e upgrades.
- Replays determinísticos por seed e mesmo estado de entrada.
