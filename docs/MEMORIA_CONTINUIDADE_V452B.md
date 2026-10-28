# Memória técnica e contexto de continuidade — CoachLOL Macro Arena

**Data de referência:** 26/10/2026. **Snapshot de engenharia:** V4.5.2b-H1 verificado; **estado atual:** V4.5.2c (patch incremental, nunca reconstruído de V3.7). Documento para Codex, Claude Opus e outras ferramentas; não contém pensamentos privados ou dados pessoais.

## Produto e objetivo
- CoachLOL Macro Arena: aplicativo de treinamento tático de League of Legends baseado em rodadas simultâneas de 10 segundos simulados, decisões de macro, controle de campeões, equipe, visão, economia, objetivos e combos. Interface web compacta preto/dourado, mapa com fog, extensível para backend online.
- Intenção declarada: treinamento, não venda de jogo concorrente. **A qualificação como treino não confere autorização automática de uso de IP.** Antes de distribuição, conferir política escrita Riot/obter autorização e plano de assets/licenças.
- 1×/2× modifica o relógio REAL do jogador, não velocidade de simulação nem cooldowns/durações em segundos simulados.

## Histórico que não pode ser perdido
1. V37: engine offline e arquitetura inicial, fog, combate, IA, lojas e cinematics em branch histórica.
2. V38/38.1: combos independentes por campeão, Shift+click e Shift+drag, ataque sem consentimento, reagir após primeiro golpe, chase, summoner spells em combos.
3. V38.2: Nami W por alcance, início de cooldowns em segundos, ganks privados, Lux/Nami R geométricos, eventos cinematográficos migrados seletivamente do branch V3.7.
4. V3.9/V4.0: atributos avançados, AH/CDR, executor de commit, journal privado, checkpoints e PRNG seeded (replay integral por comandos ainda pendente).
5. V4.1: EffectResolver tipado para CC, tenacidade, escudos, estase, anti-cura, DoT/HoT, HUD de status; efeitos legados e rollback ainda parciais.
6. V4.2: manifestos LoL 26.21 (Nami/Lux/Vex parciais, Jinx/Ahri dados); Nami Q, Lux Q/E, Vex R2 parciais; geometria e dados growth auditados de 5 campeões.
7. V4.3: 41 itens, runas experimentais, compra/venda, componentes, Rabadon dinâmico, loja e filtros; nenhum catálogo 1:1.
8. V4.4/V4.5: jungle, dragão/Barão/Vastilarvas individuais, Arauto/Olho/invocação, Smite independente, objetivos por time, Voidmites e cerco, buffs ainda parciais.
9. V4.5.1: inibidores respawn 300s, superminions por lane, duas torres Nexus respawn 180s/40%HP, waves e last hit honesto, foco multi-campeão e push.
10. V4.5.2: Baron buff individual perdido na morte e aura por proximidade, Elder execução protótipo, almas e passivas de dragões parciais, Ghost no champ select, segundo feitiço travado após draft, filtros loja, telemetria farm.
11. **V4.5.2b:** resposta de contra-combo pode escolher outro inimigo próximo/visível, independente do agressor; selector na UI; cobertura automatizada de wave 3 melee + 3 caster e terceiro spawn +canhão (2026 pós-14min/30min com exceções). Correção defensiva mantém Yasuo/Braum/Mel sem visão do agressor.
12. **V4.5.2c atual:** dano de AA usa o AD já escalado por nível sem multiplicador duplicado; last hit escolhe com o mesmo cálculo efetivo de dano. O benchmark normal registra 35–47 CS em cinco minutos. `freeze` mantém a wave numa faixa local, continua farmando e só permite AA letal; no seed36 ficou em 16/22/46 CS e uma morte no TOP, portanto sua eficiência está parcial. `slow_push` também restringe AA a last hit; `fast_push` prioriza caster/canhão e permite AA não letal. Telemetria de perda por minion tem limite 512, snapshot e permanece privada. O intervalo de AA é proxy por classe num tick de 1 s, sem windup/projétil por campeão. ADR-001 define migração Rust em etapas; `engine.mjs` continua ativo.

## Estado verificável (não inventar completude)
- 14 campeões com alguma identificação local, 5 manifestos individuais, **0 kits totalmente certificados**; somente Nami/Lux/Vex têm comportamentos QWER específicos parciais.
- 41 entradas de item, 9 stats básicas verificadas, 32 provisórias; 3 keystones experimentais; **0 runas/itens com paridade integral**.
- Farm P0 normal: **PASS_BOUNDED_LOCAL** em três seeds/lineups, 5 minutos cada — TOP 43/47/44, MID 35/35/35, ADC 41/46/46; teste histórico V38 e `npm test` passam. Caso de ADC fora da lane: 0 CS. Freeze comportamental foi testado separadamente e permanece **partial** em eficiência: 16/22/46 CS no seed36, sem AA não letal e com uma morte no TOP. Isso não certifica outras escalações, balanceamento universal ou paridade 1:1. Evidência, hashes e limites em `docs/QA_SUMMARY_V452C.md`.
- Fog tem filtros para UI/journal, mas o engine ainda reside no navegador; servidor autoritativo é necessário para impedir inspeção de informação secreta em PvP.
- Sem login, conta, account XP, banco PostgreSQL, matchmaking, WS, PvP real, reconexão, moderação, replay causal completo, conteúdo 1:1 ou renderer GLB real.

## Mecânicas e invariantes
- Clique normal: seleciona um, limpa grupo. Shift+clique: alterna membro. Shift+arrastar: substitui seleção pelo retângulo; não move câmera.
- Ataques e skillshots devem respeitar cast range, trajetória, alvo válido, mana, cooldown por segundos, CC, fog, colisão, recast e custo cobrado uma vez. Cast fora de alcance precisa caminhar até a distância necessária.
- Uma ordem de reação NÃO autoriza o ataque inimigo; dano pode ocorrer sem consentimento. O agressor da janela e o alvo do contra-combo agora são variáveis distintas.
- Dano simultâneo de aliados soma por atacante; Smite independente de ataques básicos; ações inimigas ocultas não reveladas por fog; Baron/Elder só em portador vivo, Barão fortalece minions próximos, elemental stacks persistem após morte, Elder temporário.
- Feitiços são escolhidos na seleção de campeões (Flash + secundário), bloqueados após entrar. LoL oficiais podem ter exceções por campeões/modos, que exigem registro por patch.
- Conta/nível/XP/loja cosmética persistentes e totalmente separados de nível (1–18)/itens/XP do campeão na partida.

## Estratégia futura
Rust nativo e isolado no backend, ator por partida + protocolo versionado, PostgreSQL para perfis/contas, WebSockets com notificações push sem polling frequente, escala medida por milhares de sessões; WASM só para UI/preview não secreto. Mover JS para Rust incrementalmente usando fixtures goldens, determinismo e checksums. Godot opcional e não prioridade. GLB baixo polígono mais adiante; Blender/Tripo somente ativos autorais licenciados; texturas 512/1024px inicial, 2K para close-up comprovado.

## Fontes e IP
- https://www.leagueoflegends.com/en-gb/news/game-updates/patch-26-1-notes/ — alterações oficiais de waves em 2026.
- https://support-developer.riotgames.com/hc/en-us/articles/22698591841939-General-Policies — proibição de recriar jogos com IP Riot, apesar de autorizar classes específicas de ferramentas de treino.
- https://developer.riotgames.com/docs/lol — documentação da política de aplicação e casos de uso.

## H1 — Nota de decisão IA (não implementada)

User solicitou adicionar aos marcos um reconhecedor de comandos PT-BR leve no navegador. Recomenda-se parser determinístico de comandos básicos como padrão, Qwen3-0.6B quantizado em WebGPU/Worker como fallback **opcional** para texto complexo, avaliar SmolLM2-360M e WebLLM, gerar AST tipada versionada e validada por Rust autoritativo, preview/edit/confirm no client, sem estado de fog adversária ou polling, com fallback sem IA e testes PT-BR. Registrar AST na migração V4.5.5a; integrar LLM em V4.9-A/B e especializar apenas depois de benchmark V4.9-C. Ver adendo H1.

## Adendo V4.5.2d-dev2 (26/10/2026)
Seis Almas com relógio simulado e procs independentes, Recall Barão acelerado, prevenção de duplo abate. Base V4.5.2d-dev1 + farm V4.5.2c. `npm test` integral TIMEOUT, testes 10/10 V452d2 e 7/7 V452d concluídos. Consulte `docs/QA_V452D2_SOULS.md`.
