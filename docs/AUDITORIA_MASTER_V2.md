# COACHLOL MACRO ARENA — AUDITORIA MASTER V2

**Referência:** 25/10/2026 · **Base auditada:** `CoachLOL_MacroArena_v15_Placar_Combate_HUD_Offline.zip` + `CoachLOL_Auditoria_Biblia_Master_Web_2026.zip` + documentação histórica embutida na v1.5.  
**Referência externa:** Summoner's Rift padrão, patch **26.21**, publicado em **20/10/2026** com hotfixes de **22/10/2026**. Não misturar Swiftplay, Classic, ARAM e Arena.  
**Tipo:** auditoria estática + execução de testes locais + checagem documental na web. **Não** constitui certificação E2E, auditoria de segurança independente, autorização de IP ou teste com jogadores.

## 0. Veredicto executivo

**ALFA TÉCNICA — NO-GO para online ranqueado, beta público competitivo e alegação de fidelidade ao League of Legends.** O projeto tem protótipo jogável de mapa, ordens, minions, bot, HUD, combos abstratos e placar. Falta um motor íntegro para disputar objetivos, sistema individual de kits/itens, geometria/visão fechadas, justiça bilateral, servidor, progressão e UX final. Corrigir esses fundamentos antes de acumular recursos cosméticos.

### Evidências verificadas nesta auditoria

- A v1.5 contém `engine.mjs` (673 linhas), `engine.browser.js` (invólucro browser equivalente), `app.js` (511 linhas), `styles.css` (187 linhas), `draft.js`, máscaras, mapa e suites de testes.
- `npm test` rodou na cópia extraída do ZIP e terminou com código de saída **0**; o pacote reporta **51 testes**, agrupados em 21 de core, 8 mundo vivo, 6 HUD v1.4, 11 v1.5 e 5 placar.
- O código tem **16 itens** no catálogo experimental e **21 perfis de reação definidos** em `REACTIONS` (o README/changelog menciona '20'; atualizar a contagem e auditar quantos têm efeito exclusivo). As habilidades Q/W/E/R ainda usam custo, recarga e efeito genéricos.
- `assets/portraits/` tem **48 arquivos**: 17 WEBP e 31 SVG de fallback tipográfico. Não equivalem a 48 retratos completos autorizados.
- Não há runtime Rust/WASM, servidores de sala, API de conta, armazenamento de matchmaking/MMR, monitoramento de produção, nem CI configurado nos arquivos entregues.
- A Bíblia Master Web possui **28 marcos M00–M27** e **61 itens** na matriz antiga. Eles refletem uma auditoria da **v1.3**, logo não são automaticamente o estado da v1.5.

**Não confundir** teste de função com prova de diversão, estabilidade longa, justiça competitiva ou publicação autorizada.

## 1. Contradições e decisões arquiteturais que precisam ser fechadas

| ID | Contradição / problema | Resolução recomendada |
|---|---|---|
| ADR-01 | Bíblia de Produção v0.9 impede qualquer tick até ambas as equipes confirmarem; Bíblia Master Web e v1.5 executam mundo vivo durante planejamento. | **Escolher mundo vivo** como contrato canônico. Abaixo, pausas apenas locais e por evento, nunca globalmente, com orçamento de decisão compartilhado. Deprecar o `resolve()` antigo como API pública de gameplay. |
| ADR-02 | A Bíblia Master exige aplicação web offline-first + online, mas a v1.5 é HTML/JS local acionado por `.bat`. | Migrar progressivamente para web app em navegador com motor determinístico desacoplado, PWA opcional, servidor autoritativo e backend de contas. O `.bat` será só launcher de desenvolvimento. |
| ADR-03 | Nomeação 'LoL original' × jogo próprio publicável. | Tratar mecânicas de gênero e terminologia familiar como inspiração, mas ter conteúdo/marca/universo próprios para produto público, salvo licença escrita específica. |
| ADR-04 | 20/21 perfis de reação com efeitos de cura/escudo genéricos, como se qualquer campeão pudesse conjurá-los. | Perfil tático só escolhe **prioridades**, nunca cria habilidades; ações são autorizadas pelo kit, item, spell, cooldown e recurso individual. |
| ADR-05 | Combate por consentimento pré-dano normal, mas gank e roaming dispensam resposta; risco de gank declarado como `order.kind` para furar barreira. | A exceção depende de **estado verificável** (entrada de fog, surpresa, geometria/tempo), não de string arbitrária escolhida pelo atacante; toda exceção tem contrajogo e limites. |
| ADR-06 | UI usa estado completo para scoreboard, mesmo quando mapa é filtrado por `perspective(team)`. | Usar **uma única projeção visível por equipe** para tabuleiro, placar, alertas, tooltips, loja de terceiros e replay em tempo real. |
| ADR-07 | Rank no plano citado de modo genérico, mas sem produto de PDL definido. | Criar módulo independente de conta/rating, matchmaking e temporadas do próprio CoachLOL, sem se apresentar como ranque Riot. |

## 2. Contrato de produto: familiar ao LoL, mas realmente estratégico

**O jogador comanda cinco unidades com planos persistentes**, em vez de controlar cinco personagens manualmente em tempo real. Ao clicar numa unidade vê: retrato, HP/recurso, objetivo atual, comportamento automático, próximas duas ações, habilidades disponíveis e riscos de visão. O mapa é a superfície principal. Comandos essenciais em 1–2 gestos.

### Regra fundamental de autonomia

- **Seguir lane** mantém posicionamento inteligente, last hit, segurança de torre e pressão de wave conforme `lanePolicy`. Não é 'teletransportar de volta' nem cancelar ordem manual.
- **Mover para ponto** substitui temporariamente o objetivo de movimento e não é revertido ao chegar. A automação de farm pode seguir ativa dentro de alcance sem alterar o ponto.
- **Rota/waypoints** guarda múltiplas etapas `ir → vigiar → gank → voltar`; múltiplas unidades recebem planos independentes.
- **Recall/respawn** colocam o herói no estado `AT_BASE_WAITING`: loja disponível + **Seguir lane** somente após decisão do jogador. Comprar não dispara saída involuntária.
- **Combate** possui tática predefinida e combo; o oponente não recebe informação futura nem leva dano de um duelo normal antes de sua oportunidade simultânea de resposta. Surpresas legítimas têm regras explícitas.
- **Jogabilidade informacional** é a habilidade principal: visão, janelas de objetivo, nível/pico de poder, controle de wave, tempo e alocação de recursos, nunca velocidade de clicar ou texto excessivo.

### Modos planejados

1. **Tutorial guiado** offline: mapa/posições, farm, visão, gank, objetivo, teamfight, win condition.
2. **Treino livre com bots**: microcenários e partida completa, sem login obrigatório após cache local.
3. **Partida casual**: partidas e replays autenticados, sem PDL.
4. **Sala privada/amigos**: protocolo servidor autoritativo, espectadores com atraso configurado.
5. **Ranqueada CoachLOL**: só após balanceamento, servidor e antifraude; rank próprio, sem associação ao rank Riot.
6. **Desafios de macro/coaching**: pontuação por decisão e objetivos, separada do rating competitivo.

## 3. Mapa, câmera, colisão e navegação (P0)

**Hoje:** arte e máscara 4096² + A* 128², colisões e visão amostradas. Perspectiva 55% é distorção visual por faixas, não geometria 3D. Falta uma fonte autoritativa única dos obstáculos, alturas, raios e saltos.

**Contrato novo:** coordenadas do mundo em unidades lógicas; camadas `terrain`, `blocked`, `brush`, `height`, `visionOccluder`, `turretZone`, `objectiveZone`, `laneSpline`, `faelight`, `interactivePlant`. Gerar navmesh walkable com raios por unidade e metadados de travessia por dash. A câmera renderiza projeção (55% padrão, opcional de 0 a 55%) sem alterar lógica. Transformação inversa precisa permanecer estável durante zoom/pan/rotação.

**Gates:** 500 pontos de clique amostrados e reproduzidos sem deslocamento percebido; 1.000 trajetórias sem atravessar parede; 100 trajetórias longas alcançam o objetivo ou retornam erro legível; histórico de planos preserva 5 unidades; performance de path abaixo do orçamento definido em hardware-alvo; mapa 2.5D opcional não causa vantagem na seleção/visão.

## 4. Economia, farm, waves e structures (P0)

**Situação:** spawn de minions, movimento e dano básico; CS por último golpe e XP; comportamento de wave/torre parcial.

**Faltas:** composição de waves por fase; chegada realista de waves; prioridade de alvo, body block, windup/projétil, cannon/super minions, ouro/XP quando último golpe é de torre/minion; freeze, slow push, fast push, bounce, proxy e crash **emergentes**; plate timing/objetos, resistência, aggro de dive, bloqueio de acesso a estrutura, inhibidor/super wave, respawn de estruturas relevantes na regra do patch; modificações 2026 de torres incluindo **Crystalline Overgrowth** e torres do Nexus que ressurgem.

**Contrato:** nunca codificar `freeze` como buff que força resultado; a ordem apenas ajusta last-hit, autoataque e posição, e a física das tropas produz o estado. Exibir indicadores compactos (seta tendência, wave size, próxima wave).

**Gates:** 20 minutos simulados, cenários de freeze/bounce reproduzíveis, torre não atira através da parede, primeiros objetivos e progresso de lane calibrados, escudo de torre/estrutura sem efeito colateral, vitória somente após condições estruturais válidas.

## 5. Jungle, paths, ganks e objetivos (P0)

**Defeito crítico verificado:** `updateObjectives()` decide a equipe vencedora pelo número de campeões próximos (`blue.length >= red.length`) e subtrai apenas seu dano agregado. Isso não modela disputa de DPS, Golpear, execução, roubo, risco e último golpe, e favorece situações de empate artificialmente.

**Novo modelo para cada camp:** `members[]`, vida/resistências individuais, posição/leash, alvo/aggro, ataque, resets, spawn/respawn por patch, recompensas compartilhadas, XP/gold, buffs, pets/quests jungle. Krugs, raptors e wolves precisam de composição real. Smite é uma habilidade explícita com dano, cargas, upgrades e regras PvP por patch.

**Path planner** como grafo de ações editável. Presets iniciais: full clear top→bot, full clear bot→top, 3 camps→gank, 3 camps→invade, buffs→scuttle, safe cross-map, vertical jungle, counterjungle e objective-first. Cada opção traz **tempo estimado, HP provável, exposição à visão, lado final e próxima janela**, usando somente conhecimento legítimo. Não inventar spawns nem transformar preset em teleporte.

**Gank planner:** selecionar lane, ângulo/entrada, iniciar ou countergank, prioridade do alvo, condição (wave, HP, visão, flash estimado), limite de perseguição, plano de saída e retorno automático condicional. Não permitir conhecimento exato de posição/tempo de summoner inimigo ausente na visão.

**Objetivos:** dragões elementais/alma/Ancião, Void Grubs, Arauto, Barão, disputas de visão, contestar, trocar lado e roubar. Cada objetivo tem calendário de spawn por patch e fórmula de recompensa/buff. **Atakhan, Blood Roses e Feats of Strength são conteúdo histórico removido de Summoner's Rift 2026**, não conteúdo ativo. Patch 26.1 antecipou os primeiros camps, Aronguejo e minions, e recolocou o Barão aos 20:00.

**Gates:** disputa 2v2 em Barão termina por HP real e último dano, não contagem de pessoas; teste Smite vs burst em ordem de tick; camp reseta além do leash; jungler não atravessa fog com conhecimento onisciente; simulação de 10 estratégias de path por lado e 50 seeds sem softlocks.

## 6. Combate, kits de campeões, spells, runas e itens (P0)

**Hoje:** `CLASS_STATS` genérica por arquétipo, física/mágica/verdadeira não diferenciadas integralmente em `damage()`, que aplica armadura genericamente; Q/W/E/R com efeitos abstratos idênticos por classe; `catalog` contém 16 itens sem árvore completa/efeitos de passivas; reações criam efeitos que nem todo campeão deveria possuir.

**Modelo novo data-driven:**

- `ChampionDefinition`: ID próprio/licenciado, atributo base e crescimento, recurso (mana/energy/rage/none), range, passiva, quatro skills individuais, tags e ataque básico.
- `Ability`: alvo, alcance, geometria (linha/cone/círculo), cast time, projectile/travel, custo/CD por nível, escalas AD/AP/vida, buffs/debuffs, CC, dispel, requisitos/stack/passiva, colisão, prioridade de resolução e triggers.
- `CombatEvent`: source, target(s), damageType, base, scaling, penetration, resist, shields, modifiers, proc origin, timestamp, crit, status flags. Pipeline dano físico/mágico/verdadeiro, resists positivos/negativos, shield, healing, grievous wounds, true damage, invuln, untargetable etc.
- **Combo QWER como ordem sugerida, não dano mágico extra aleatório:** o motor escolhe se cada etapa é válida, alvo, condição, cooldown, mana/energia, range, momento; permite fallback, interrupção e combo incompleto.
- `ItemDefinition` versionada com recipes, buy/sell/undo, componentes, unique passives, actives, stacking, slot, ward/trinket e upgrades; `RuneDefinition` triggers realistas; `SummonerSpellDefinition` cooldown e target válidos.

**Gate:** uma vertical slice com **10 unidades/arquétipos** profundamente implementados e balanceados é melhor que 50 nomes jogando igual. Os testes devem provar diferencias reais: engage tank, mage skillshot, assassino combo/escape, ADC kite, healer/shielder e jungle smite. Evitar alegação de números idênticos aos da Riot antes de validação licenciada e patch-locked.

## 7. Justiça de duelo, gank, roaming e reação automática (P0)

**Defeito de contrato atual:** permissão `duelPermission(..., bypass)` é contornada por `order.kind==='gank'/'roam'` ou stage equivalente. Um tipo de ordem escolhido pelo atacante **não é prova física** de surpresa. O gate de dano de autoataque também não resolve integralmente todo tipo de dano vindo de minions, torre, objetivo ou efeitos de área.

**Modelo de decisão sugerido:**

`EncounterProposed → SnapshotVisibleState(team) → ChoiceWindow{deadline} → CommitSealed(A/B) → ResolveAtomic → Resume/UpdatePlan`. Implementar correspondência de mais de duas unidades e 1v2/2v3; participantes envolvidos travados em checkpoint em eventos que exigem decisão, mundo externo continua. Respostas de ambos chegam por canais privados; deadline acionará tática previamente configurada; não existe vantagem por clicar primeiro.

**Surprise/gank** não é botão invencível. O evento deve comprovar entrada de fog, contato não avistado, alcance real e windup. Pode permitir o primeiro efeito legítimo antes de uma resposta *reativa*, mas respeita vision, tempo de movimento, escape e escudos preexistentes. O defensor ainda pode reagir nas etapas seguintes. Não entregar a intenção do atacante antes da detecção.

**Reações por classe/função:** perfis `safe`, `balanced`, `aggressive`, `peel adc`, `protect carry`, `countergank`, `engage`, `disengage`, `kite`, `heal ally`, `shield`, `objective control` etc. Cada perfil pode escolher apenas habilidades realmente disponíveis. Conjunto simples de prioridades: sobrevivência > interromper ameaça fatal > objetivo explicitamente designado > plano persistente > farm. Permitir thresholds configuráveis sem menus textuais gigantes.

**Gates:** 2 jogadores humanos com latência artificial de 0/50/200ms, resultado idêntico ao inverter ordem de confirmação; replay idêntico por seed; gank real pode surpreender sem order spoofing; efeitos externos continuam; 1v2 tem respostas independentes; auto-resposta não gera curas ou escudos de graça.

## 8. Visão e fog (P0 de segurança competitiva)

**Hoje:** walls/brush e `perspective(team)` filtram parte do estado. **Achado de UI crítico:** `renderScoreboard()` usa diretamente `match.units` e mostra `unit.gold` e `unit.wardCharges` inclusive do inimigo (linhas 239–268 de `app.js`), não a projeção filtrada. Isso pode revelar informação que o oponente normalmente não deveria conhecer.

**Reestruturação:** cada time recebe **somente** `VisibleState(team, tick)` do servidor com campos tipados por política `public/ally/visible-enemy/last-seen/private`. UI nenhuma tem acesso à árvore de estado completo. Placar inimigo usa somente campos permitidos pela regra de visibilidade; último avistamento distingue estimativa de certeza. Ward de controle, detector, stealth/camouflage, line-of-sight, terreno, moitas, faelights 2026, wards vivas, fontes, minions, plantas e ping de last seen.

**Gates:** property-based tests de sigilo; mensagem WebSocket e payload replay ao inimigo nunca contêm posição invisível, plano privado ou ouro não público; teste de moita + ward + sweeper + faelight; UI não renderiza dados de debug em produção.

## 9. UI/UX moderna e compacta (P0)

**Problema:** v1.5 usa painel grande de texto com 12 botões de ações, combos, posturas, stats, avisos e jungle, que pode esconder decisões. `Tab` funciona, mas a UI ainda não é um sistema visual integrado.

**Layout final:**

- **Topo 36–48 px:** tempo, objetivos iminentes, kills, team gold (se a regra permitir), controle de rodada e conexão.
- **Esquerda 5 cards:** TOP/JG/MID/ADC/SUP, retrato, HP, função, estado com ícone, cooldown relevante; Shift-multiselect e arrasto RTS.
- **Direita contextual 260–320 px, recolhível:** card de unidade, 4–6 quick actions + 3 abas `Macro`, `Combate`, `Build`. Ícones com tooltips, não 20 comandos permanentes.
- **Rodapé quase vazio:** 2 avisos priorizados, nunca dock dominante; alertas visuais ancorados ao tabuleiro.
- **Tab/Placar:** 10 portraits, K/D/A, CS, nível, itens e objetivos; informação filtrada por equipe, comparação e detalhamento progressivo.
- **Jungle:** mapa com linhas de path e painéis de 2 ou 3 alternativas (`Seguro`, `Rápido`, `Contestação`), expandir para escolhas avançadas.
- **Gank:** indicação de wave, visão, vantagem estimada, rota de entrada e saída, confirmar. Tipos por ícone, texto explicativo em tooltip/guia.
- **Camera:** inclinação 55% por padrão, botão alternar vista, slider acessível; visão superior tática sempre disponível. Testar alvos clicáveis e legibilidade sob perspectiva.
- **Acessibilidade:** teclado navegável, atalhos remapeáveis, foco visível, escala 90–140%, daltonismo, contraste WCAG, reduced motion e leitura de ícones com texto assistivo.

**Primeiros 5 minutos do usuário:** tutorial com ações reais: 1 clique escolhe campeão, 1 clique move, preset de farm, ward por ponto, gank por rota, Tab para scoreboard, B para recall, loja ao renascer. Medir taxa de conclusão e confusão sem depender de tooltip longo.

## 10. Ranqueadas do CoachLOL: rank, PDL e MMR (novo marco P0 para lançamento competitivo)

**Status:** não implementado. O M24 antigo cita matchmaking casual, mas não define sistema suficiente de ranqueadas. Não copiar ou se apresentar como ladder oficial da Riot: a política proíbe sistemas alternativos interpretáveis como ranking oficial LoL. Uma progressão **original**, vinculada apenas às partidas do jogo CoachLOL, exige validação jurídica e de produto.

**Componentes obrigatórios:**

1. Conta/autenticação, verificação antifraude, histórico imutável de partidas e temporadas.
2. Filas separadas casual, rank 1v1 estrategista (cada lado controla cinco), sala privada; 2v2/5v5 somente com novo modelo de controle e rating separado.
3. Rating interno de habilidade `mu` + incerteza (`sigma`) por modo/região/fila, atualizado por resultado e força do adversário (ex.: Glicko-2/TrueSkill/Elo, após estudo). Não usar KDA/farm como reforço direto do MMR para evitar objetivos perversos.
4. **PDL CoachLOL** visível separado do rating interno: ganhos/perdas variam com rating versus divisão visível, adversário e estabilidade. Ex.: 0–100 PDL por divisão para versões iniciais, sujeito a telemetria e economia de liga; não prometer valores exatos antes do experimento.
5. Ligas com nomes/emblemas **originais**; divisões, partidas de colocação, promoções suaves, proteção contra flutuação excessiva, decay nos altos níveis, resets de temporada explicados.
6. Matchmaking por rating estimado, incerteza, região/latência, tempo na fila e prevenção de rematch/collusion. Evitar vantagens por lado azul/vermelho, picks e ordem de escolha.
7. Regras para desconexão/reconexão, dodge, abandono, empate técnico, partida inválida, AFK, comportamento nocivo, disputa e rollback.
8. Anti-smurf/boosting/wintrading, filas de teste, rate limiting, prevenção de contas falsas e análise de anomalias. Não expor rating oculto como se fosse MMR Riot.
9. Pós-jogo: resultado, PDL anterior→novo, estatísticas, replay e explicação transparente do desempenho estratégico **sem adulterar MMR**.
10. Experimento de calibração com centenas/milhares de partidas antes do lançamento competitivo. Validar distribuição de skills, não apenas UI de emblema.

**Fonte temporal:** sistema ranqueado Riot mudou em 2026: em 26.15, `Aegis of Valor` passou a recompensar vitórias com PdL dobrado sem exigir nota mínima, e restrições de duo em high elo foram alteradas. Se usarmos conceitos de referência, sempre versionar pelo patch; o CoachLOL não precisa copiar valores oficiais.

**Gates:** idempotência da finalização de partida (mesmo match nunca paga PDL duas vezes), reconciliação MMR/PDL, disputas e rollback, teste de 10.000 partidas sintéticas para distribuição, estabilidade de matches, anonimização, no-pay-to-win, fila equalitária em ambos os lados.

## 11. Engenharia web, networking e persistência (P0)

**Arquitetura-alvo proposta (sujeita a benchmarks):**

```text
apps/web (React + TypeScript + Vite + canvas/WebGL)
  -> Domain UI / input intents / presentation snapshots
  -> local training adapter [same match protocol]
  -> online websocket adapter
          |
services/auth-lobby-matchmaking (profile, friend, queue, session)
services/match-server (authoritative timeline + fog projections + encounter locks)
          |
packages/core-rules (Rust native + WASM) -- ou JS/TS validado antes de migração
packages/protocol (schemas + version + signatures + visible/private events)
packages/data (champion/rules/map versions; migrations)
packages/replay (seed, event log, checksums)
          |
postgres (accounts, seasons, leagues, matches, social) + object storage (replays)
```

**Decisão pragmática:** **não reescrever cegamente o motor em Rust antes de estabilizar as regras.** Primeiro definir contratos de eventos e golden tests em JS, depois portar módulos do core para Rust/WASM com hash idêntico em 1.000 cenários. Caso o JS/TS satisfaça determinismo e performance em produção, a migração pode ser escalonada; o design depende da separação, não da linguagem.

**Rede:** servidor executa tick, guarda seed e valida intents por time; cliente recebe snapshot autorizado, jamais envia HP/dano/PDL. Sequenciamento monotônico e idempotência dos comandos; reconexão com snapshot de patch+hash; heartbeat; região; rate limiting. Lobby, draft, loadout e partida possuem máquinas de estado separadas. Criar escalonamento/rollback e replay sem infomar hidden state a espectadores.

**Offline:** treino convidado em navegador, assets cacheados com service worker, armazenamento IndexedDB versionado, export/backup de saves e partidas locais. Offline **não gera PDL online**; somente servidor decide rank e resultado competitivo.

**Proteções:** sessão segura, CSRF/XSS, autorização de salas, proteção de senha e recuperação, LGPD (acesso/exclusão/retenção), menores de idade quando aplicável, moderação/reportes e trilhas de auditoria sem chaves em frontend.

## 12. Dados/patches/assets: governança e licença (M00 bloqueador)

A versão pública da Riot em 25/10/2026 é a **26.21** para SR padrão; o Data Dragon usa numeração de asset diferente (p.ex. `16.21.1` no portal). Datasheets não são implementações completas: tooltips e JSON não substituem scripts de habilidades, IA ou interação.

- Manifesto por versão: `rulesetId`, `sourcePatch`, `mapHash`, `championCatalogHash`, `itemCatalogHash`, `assetLicense`, `scenarioHash`, `schemaVersion`.
- Patch ingestion: recuperar dados permitidos de fonte autorizada, validar diferenças, gerar change report, QA, testes e apenas então publicar novo ruleset.
- Atakhan, Blood Roses, Feats of Strength e conteúdo de outros modos devem ser marcados como **inativos/legado** no ruleset SR 26.21.
- Assets: respeitar origem e licença; para publicação pública, substituir mapa, campeões, retratos, marcas e ícones protegidos por universo próprio salvo autorização específica.
- Direitos: a política Riot de desenvolvedores diz explicitamente **não criar jogos/simuladores usando IP da Riot** e **não criar alternativa à ladder oficial**; chave API não é licença. Consultoria jurídica/licenciamento antes de produto público com conteúdo LoL.

## 13. Bots, dificuldade e fairness (P1)

Hoje existe bot heurístico que segue visão parcial, faz recall, compra e limpa camp; ainda não representa dificuldade Ferro–Desafiante. Construir utility AI com blackboard **filtrado por fog**, GOAP/behavior tree para macro (lane state, invade, risk, no-priority object), individual kits/roles, e perfis calibrados por erro de decisão, não por buffs artificiais de HP/dano/MS. Escalas de dificuldade devem diferir por inteligência de informação, consistência e coordenação, dentro das mesmas regras físicas.

**Gates:** mirror matches 100 seeds azul/vermelho, lado com win rate dentro de faixa a ser calibrada; visão invisível nunca causa reação perfeita; níveis progressivos de IA demonstrados por resultados em cenários, validação de trapaça de bot com telemetria independente.

## 14. Scoreboard, histórico, replay, coaching e carreira (P1)

- Tab: K/D/A, CS, nível, build visível, wards permissíveis, objetivo, time, timer; upgrades animados discretamente; separar pontuação própria CoachLOL.
- Histórico: win/loss, tempo, team comp, match seed/ruleset, grade de decisões e replay acessível.
- Replay: snapshots periódicos + event log com checksum; reexecutável offline para treinos; online tem observador com atraso para não vazar fog.
- Coaching pós-jogo: *por que* a macro falhou (no-prio dragon, crossmap trade, vision denial, recall timing, wave lost), com explicação causal e confiança.
- Progressão fora de ranked: achievements, mastery de macro, badge de papéis, desafios diários não-pagantes sem vantagens de gameplay.

## 15. Plano de desenvolvimento revisado (gates; sem estimativa ilusória)

| Ordem | Entrega / marco | Prioridade | Critério obrigatório de saída |
|---|---|---|---|
| 0 | M00 — licença e escopo; ADR-01 mundo vivo; identidade original | **Bloqueador** | Política/uso de conteúdo esclarecidos; um único contrato de simulação aprovado |
| 1 | M01/M03 — testes golden, replay/checksum, pipeline e CI | **P0** | 1.000 seeds determinísticas, testes de browser e backend, trace reproduzível |
| 2 | M02/M05/M06 — geometria, visão básica, 5 ordens, rota, UI input | **P0** | 500 cliques, 1.000 caminhos, 5 planos simultâneos, sem teleporte |
| 3 | M07/M08 — wave, farm, torres, compra/respawn/vitória | **P0** | Uma partida de 20–35 min simulada, sem softlock, estados estruturais coerentes |
| 4 | M09 — fog, moitas, wards, faelights, projeção privada | **P0** | Nenhum leak em visibleState, websocket, Tab, bot e logs de time |
| 5 | M10/M11 — jungle real, smite, path/gank/objectives | **P0** | Luta 2v2 por dragão com DPS real, reset camp, crossmap trade e steal |
| 6 | M12/M13/M14 — dano, skills individuais, CC, 10 kits | **P0** | 10 campeões/arquétipos diferentes + cenários de combo/counterplay |
| 7 | M04/M17 — encounters privados, timeout, UI contextual | **P0** | latência não muda resultado, gank é evento legítimo, não string bypass |
| 8 | M15/M16 — itens/runas, builds, IA calibrada | **P1** | pelo menos 20 builds válidas e perfis de bot reproduzíveis |
| 9 | M18/M19 — redesign/UIX, 2.5D/3D visual, PWA e acessibilidade | **P1** | teste com jogadores de LoL, navegação multibrowser, FPS medido |
| 10 | M20–M23 — conta, social, draft conectado, servidor online | **P0** | 2 humanos + reconexão + fog privado + partida completa server-authoritative |
| 11 | **M28 NOVO — Ranked CoachLOL: MMR/PDL/season/matchmaking** | **P0 para Ranked** | 10.000 partidas sintéticas + abuso + reconciliação + auditoria de ranking |
| 12 | M24/M25 — histórico, coach, replay, leaderboard próprio | **P1** | replay auditável, score consistente, sem leak de dados |
| 13 | M26/M27 — segurança, privacidade, escala e QA release | **Bloqueador release** | load/perf, LGPD, antifraude, rollback, incident response, beta autorizado |

**Regra de ouro:** nenhuma feature passa a `TESTADO` porque a UI tem um botão. Precisam existir contrato de simulação, testes, cenários com adversário e evidência documentada.

## 16. Golden scenarios novos, prioritários

1. Top selecionado, farm automático; clicar em outro ponto move, parar no ponto sem retornar à lane; reativar Seguir lane faz retorno explícito.
2. Renascimento e recall de campeão azul e vermelho: abrir loja, comprar, esperar; nenhum caminha até decisão.
3. Mesmo matchup espelhado nível 1: métricas de TTK, gold/CS/XP e dano em p25/p50/p75; não explodir HP sem pico de poder.
4. Lutar QWER: skill ainda em cooldown não pode causar dano; personagem sem mana não conjura; combo é cancelado por stun real.
5. Duelo humano 200ms vs 0ms: nenhum lado tem vantagem só pela latência; ambos escolhem sem saber opção privada do outro.
6. Gank legal vindo de fog: inicia ataque de surpresa, porém não pode burlar com `order.kind='gank'` permanecendo na visão e em luta normal.
7. Countergank 2v2 e 1v2: eventos de reação múltiplos, ultimates e alvos sem dano fantasma.
8. Jungle 3 camps (dois lados), resets/leash/Smite, XP e vida coerentes; planner exibe ETAs só se simulados.
9. Dragão a 1 HP recebe Golpear do time perdendo; crédito vai ao time do último dano, nunca à maioria.
10. Baron 20:00 (26.21), Atakhan não spawna, faelight concede visão especial, missões de função progridem.
11. Top wave freeze→slowpush→crash→bounce pela física das tropas, sem teleporte.
12. Torre Nexus destruída e renascida na regra do ruleset; nexus vitória protegida por requisitos válidos.
13. Enemy oculto: fog em canvas, bot, Tab, APIs, logs, tooltip, replay espectador não entregam posição ou ouro privado.
14. Teamfight 5v5, CC, clean-up/assist, W/R, death+respawn KDA uma vez, replay exato.
15. 500 partidas offline e 500 online: sem crash, sem softlock, sem divergência de checksum.
16. Ranked: vitória/derrota calcula PDL uma única vez; replay de mesmo resultado não recompensa novamente; abandono e reconexão não geram dupla partida.
17. 100 usuários de LoL completam microtutorial e tomam decisão de gank/ward/tab sem assistência; registrar erros e reduzir.
18. Performance: 60 FPS em alvo desktop, frame-time p95, 1 h de simulação, limitações de memória por cache PWA.

## 17. Métricas de aceite e prioridades de produto

**Métrica-guia:** quantas decisões macro significativas e informadas por minuto cada jogador toma, sem perder legibilidade. Não otimizar por quantidade de comandos, cliques ou texto.

**Objetivos de teste (metas, não resultados medidos):**

- 90% dos novatos vindos de LoL identificam 5 papéis, dragão, Barão, lane e minimapa sem tutorial longo.
- 90% conseguem fazer `clique campeão → move` com no máximo 2 interações; 85% conseguem ward+gank+recall+Tab em teste orientado.
- A tela principal mantém o mapa como área de maior prioridade; 12 ações e 21 posturas ficam em menus compactos contextuais.
- Mirror matches com mesmo seed/picks/skill devem ser invariantes a azul/vermelho dentro de tolerância definida.
- 100% de ordens inválidas são rejeitadas com feedback, sem mudar estado parcialmente.
- 100% dos confrontos online se resolvem pelo mesmo resultado independentemente de latência/ordem dos pacotes.
- 100% das partidas competitivas geram uma transição idempotente de PDL/MMR e replay assinado pela autoridade.

## 18. Política de atualização dos documentos e fontes de verdade

**Canonical:** este relatório complementa, mas não modifica a v1.5. Futuro consolidado `BIBLIA_MASTER_WEB_2026_V2` deve substituir explicitamente as seções conflitantes da Bíblia 0.9 e Master v1.4. Um arquivo de status, tests/gates e changelog a cada entrega; status sempre menciona **qual versão** foi auditada.

- Feature enum: `NÃO INICIADO`, `ESBOÇO VISUAL`, `PROTÓTIPO FUNCIONAL`, `TESTADO LOCAL`, `TESTADO MULTIPLAYER`, `HOMOLOGADO`.
- Cada regra aponta para `RulesetManifest`, scenario ID, teste, evidence path e semântica do patch.
- Ao mudar engine/protocol, atualizar ADR e fixtures juntos; jamais descartar Golden scenarios existentes.

## 19. Fontes de referência consultadas em 25/10/2026

**Primárias:**

1. Riot, patch 26.21, 20/10/2026 (hotfix 22/10): https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/
2. Riot, patch 26.1, regras fundamentais de 2026 (role quests, faelights, spawns, estruturas): https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/
3. Riot, visão antecipada de 2026 — contextualizar, **não** usar como contrato acima de patch notes: https://www.leagueoflegends.com/pt-br/news/dev/dev-2026-season-one-gameplay-preview/
4. Riot, patch 26.15, alteração das regras de ranqueada Aegis/duo: https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-15-notes/
5. Riot, políticas gerais de desenvolvedores: https://support-developer.riotgames.com/hc/en-us/articles/22698591841939-General-Policies
6. Riot, Data Dragon, descrição e versionamento: https://developer.riotgames.com/docs/lol
7. Riot, suporte sobre colocações, PDL e decay (referência do jogo oficial, não contrato para o CoachLOL): https://support-leagueoflegends.riotgames.com/hc/pt-br/articles/4405783687443-Partidas-de-coloca%C3%A7%C3%A3o-promo%C3%A7%C3%B5es-s%C3%A9ries-rebaixamento-e-decaimento-por-inatividade

**Internas auditadas:** `CoachLOL_Web_Masterplan_2026/docs/BIBLIA_MASTER_WEB_2026.md`, `CoachLOL_MacroArena_v15/docs/BIBLIA_PRODUCAO_COACHLOL.md`, `docs/AUDITORIA_TOTAL_LOL_V09.md`, `docs/AUDITORIA_MECANICAS.md`, `docs/CONTRATO_TEMPO_MOVIMENTO.md`, `engine.mjs`, `engine.browser.js`, `app.js`, `draft.js`, `data/coachlol_map_v6.json`, `tests/*.mjs`.

---

**Decisão de execução:** primeiro engine/visão/jungle/combate justos com 10 arquétipos e partida completa; depois refinamento UI e partidas com 2 jogadores; **só então** rank/PDL online e escala. O indicador de sucesso é um jogador de LoL entender e conseguir vencer pela estratégia — não pelo número de submenus.
