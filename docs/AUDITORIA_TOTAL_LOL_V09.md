# AUDITORIA TÉCNICA DE MECÂNICAS — COACHLOL v0.9 × LOL 26.21

**Classificações:** ✅ funcional básico (testado), 🟡 parcial/abstração, 🔴 não implementado, ⚪ dados externos/validação pendente. “Completa” refere-se à **cobertura de escopo auditado**, não a equivalência já implementada.

| Subsistema | Estado atual | Diferença crítica em relação ao objetivo final | Marco |
|---|---|---|---|
| Atlas 4096×4096 e marcadores autorados | ✅ | Máscaras navegáveis reduzidas para 128×128 | M01 |
| Coordenadas de mundo Riot | 🟡 | Bounds calibrados; pontos de controle/fatores de registro não certificados | M01/M04 |
| Colisão de paredes | 🟡 | Raio/forma/corner cutting e passos próximos ainda aproximados | M04 |
| Brush/moitas & bloqueio visão | 🟡 | Sem todos tipos de camuflagem/reveal/detecção | M07 |
| Top, mid, bot e jungle path | 🟡 | Smoothing/navmesh e custo de risco por time incompletos | M04 |
| FOV dinâmica de aliados | ✅ | Raycasting por amostragem 128, sem altura | M07 |
| Visão de minions | ✅ | Raio simplificado, sem regra exata de detecção | M07 |
| Wards trinkets/pink/sweeper | 🟡 | Wards genéricas e sem clear/fog detalhada | M07 |
| Inimigos ocultos não clicáveis | ✅ | Memória de última posição vista limitada | M07 |
| Ordens privadas / cinco heróis | ✅ | UI online ainda não possui dois clientes reais | M03/M13 |
| Persistência de destino/rota | ✅ | Pausas e gatilhos complexos incompletos | M04 |
| Rota com ações por waypoint | ✅ | Fallbacks condicionais têm implementação parcial | M04/M11 |
| Velocidade de movimento em unidades/s | ✅ | Stats base por classe fallback, não por campeão do patch | M04/M09 |
| Botas +25 MS / soft caps | ✅ | Stack de percent, multiplicativos e slows especiais incompleto | M04/M10 |
| Dashes/Flash por muros | 🟡 | Endpoint e colisão aproximados; sem kits individuais | M09 |
| Relógio simultâneo elapsed 10/30/60 | ✅ | Falta servidor e latência arbitrada | M03/M13 |
| Replay do tempo efetivo | ✅ | Só frame log; hashing/rollback e RNG snapshots incompletos | M02 |
| Wave spawn por lane / 2 lados | ✅ | Timing preciso por perfil patch a validar | M05 |
| Melee / caster / siege / super | ✅ | Modelos de dano/range/tick simplificados | M05 |
| Wave clear / disputa | ✅ | Aggro, projéteis e slow push/freeze exatos não testados | M05 |
| Freeze / slow-push / bounce | 🟡 | Efeitos emergentes rudimentares, não golden-tests | M05 |
| Torre aggro durante dive | ✅ | Prioridade exata e escalonamento/dano/range ausentes | M06 |
| Torres por rota & tiers | ✅ | 22 marcadores; placas e respawn 2026 não simulados | M06 |
| Inibidor / super waves | 🟡 | Spawn condicional simples; respawn e regras de dupla super ausentes | M06 |
| Nexus / vitória | ✅ | Backdoor/estrutura bloqueada dependendo tiers não validada | M06 |
| Jungle pequena vinculada ao grupo | 🟡 | Leash, múltiplas vidas e fragmentação krugs parciais | M07 |
| Smite/pet/economia jungle | 🔴 | Incluir dano, stack e skill jungle per patch | M07 |
| Dragões elementais aleatórios seed | 🟡 | Sortimento aleatório existe; sequência/legalidade patch ausentes | M07 |
| Alma / Ancião | 🟡 | Buff resumido e matemática de execute simplificada | M07 |
| Barão, Arauto, Void Grubs | 🟡 | Spawn genérico, resistências/fases/effects ausentes | M07 |
| Plantas | 🔴 | Blast cone, honeyfruit, scryer's bloom e vision variants | M07 |
| HP/mana, AD/AP/armor | 🟡 | Stats abstratos por classe sem growth oficial | M08 |
| Damage físico/mágico/verdadeiro | 🟡 | Só fórmula genérica de armor; MR/pen faltantes | M08 |
| Crit, attack speed, on-hit | 🟡 | AS genérica e interação de item incompleta | M08/M10 |
| CC (stun/root/fear/etc.) | 🔴 | Máquina de estados e interações | M08 |
| Projectiles, AoE, skillshots | 🔴 | Tick collision e cast geometry | M08 |
| Champion passivas/QWER individuais | 🔴 | Q genérica não equivale a kits oficiais | M09 |
| Spells, Flash/Exhaust | 🟡 | Cooldowns/custos e status simplificados | M09 |
| Full item catalog by patch | 🔴 | Só 16 itens de protótipo | M10 |
| Craft, buy/undo/sell/inventory | 🟡 | Compra básica, sem receita/passivas/undo | M10 |
| Runas por champion no draft | 🔴 | UI futuro e triggers ausentes | M10 |
| Recommended builds por matchup | 🔴 | Sistema de sugestões versionadas e métricas | M10 |
| Splash/full icon assets DDragon | 🟡 | Retratos locais parciais, sem cache completo patch | M10 |
| Bot heurístico offline | ✅ | Avaliação de macro limitada por cenários | M11 |
| Bot visão privada | ✅ | Mais testes de informação inferida para production | M11 |
| IA elo Ferro→Desafiante | 🔴 | Behavior profiles / calibração empírica | M11 |
| Low-poly 3D e animations | 🔴 | Atual top-down 2D 4096; 3D/LOD planejado | M12 |
| HUD contextual e cinco planos | ✅ | Polimento e UI acessível ainda pendentes | M12 |
| Desktop offline & atualizador | 🟡 | HTML offline com save local simples | M12/M15 |
| Multiplayer online real | 🔴 | Requer servidor autoritativo, locks e anti-cheat | M13 |
| Matchmaking PDL | 🔴 | Dependente de antifraude e calibração | M13 |
| Replay/Skills detalhados | 🟡 | Log inicial, sem análise causal profunda | M14 |
| Teste perf 60FPS e 1h partida | 🔴 | Benchmarks e profiling sistemáticos | M14 |
| Rust + WASM core | 🔴 | Core atual JS, arquitetura proposta | M02 |
| Direitos IP / produção comercial | ⚪ | Aprovação/licença específica pendente | M00 |

## Falhas materiais encontradas e correções aplicadas desde v0.7

- ✅ Rotas de cinco personagens não se cancelam quando se edita outra unidade.
- ✅ Movimento mantém destino por múltiplas rodadas.
- ✅ Fog aliada acompanha o campeão e suas unidades.
- ✅ Bot não consulta inimigos invisíveis para selecionar alvo.
- ✅ Correção da dead-zone que impedia minions de atacar minions inimigos.
- ✅ Correção de ouro de torre atribuído como kill de campeão.
- ✅ Relógio v0.9 converte tempo efetivo de planejamento em segundos simulados, com bloqueio de resolução enquanto falta um lock.
- ✅ Velocidade e orçamento de deslocamento em unidades de mundo, boots +25 e soft caps.

## Golden scenarios mínimos antes do próximo marco

1. **Top sem ordens:** aliado faz farm seguro; wave aliada/inimiga se encontram; torre não é ignorada.
2. **Mid rota longa:** `mid → bot → mid`, cada waypoint tem ação e política; nunca teleporte, reabre sem cliques repetidos.
3. **Duas equipes lock:** 10/30: nenhuma ação aos 10; às 30 ambos executam 30s; frame log guarda 30.
4. **Minions dão visão:** inimigo detectado por minion, escondido novamente após a morte/saída da área.
5. **Brush/parede:** inimigo dentro de moita sem visão não pode ser atacado; ward corretamente revela.
6. **Torre dive:** ignora minions em favor do campeão inimigo agressor quando a regra se aplica; volta à prioridade correta ao sair ou morrer.
7. **Jungle composto:** limpar acampamento com lobos grandes/pequenos não cria marcadores extras permanentes.
8. **Smite steal:** objetivo decide vencedor por tick e contribuições reais, nunca por simples maioria de campeões.
9. **Item stat:** botas aumentam velocidade sem duplicar bônus; build incorreta gera erro legível.
10. **Replay:** mesma seed/ordens/tempo/patch produz exato mesmo estado final.

## Referências

- https://developer.riotgames.com/docs/lol
- https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/
- https://www.leagueoflegends.com/en-sg/news/game-updates/patch-26-1-notes/
- https://wiki.leagueoflegends.com/en-us/Movement_speed
- https://wiki.leagueoflegends.com/en-us/Minions
- https://support-developer.riotgames.com/hc/en-us/articles/22698591841939-General-Policies
