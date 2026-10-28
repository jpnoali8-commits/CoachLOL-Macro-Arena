# Dev69 Skills/Champions — milestone ampliado, contrato de integração
Atualizado em 2026-10-28. **Branch exclusiva `dev69/skills-batch2`, PR #9 → `dev69/integration` (Draft).**

## Objetivo do marco
Pacotes de **6–10 campeões completos** com P/Q/W/E/R, estatísticas nível 1–18 e interações PvP. A meta não é contagem certificada: cada campeão só muda de `partial` para `certified` após contrato individual + teste de duas sessões, browser pós-merge, regressões e QA de release. **Nenhum campeão está certificado completo neste PR.** Itens seguem em outro marco.

## Matriz por campeão (sem inflar a contagem)
| Campeão | Base e Lv1–18 | Habilidades individuais efetivas | Ainda falta |
| --- | --- | --- | --- |
| Nami | Data Dragon 16.21.1 + AD auditado | Q protótipo, W bounce legado, E 3 procs, R onda temporal e passiva de MS | Q/W paridade temporal, E procs de spells, verificação de R/buffs completos |
| Vex | Dados 16.21.1 + AD auditado | Q temporal, W shield/AoE, E zona, Doom/Gloom parcial, R/R2 marca e dash | Fear passiva 1:1, W/Q/E detalhes, reset R por abate, dash interrupts especiais |
| Lux | Dados 16.21.1 + AD auditado | Q temporal, W ida/volta + 2 shields, E zona/slow, R adaptador e Illumination owner-only | W homing de volta ao caster móvel, R windup/beam temporal e Q/E rigor Riot |
| Ahri | Dados 16.21.1 + AD auditado | Q vai/volta magic→true, E first-collision Charm | W três Fox-Fires, R 3 charges/reset, P Essence Theft, Q return tracking e E knockdown |
| Jinx | Dados 16.21.1 + AD auditado | W Zap temporal, primeiro bloqueio minion/champ, slow e revelação | Q troca de armas, E traps arm/trigger, R rocket e passiva Get Excited |
| Ezreal | Dados 16.21.1 + AD auditado | Q Mystic Shot anterior | P, W, E, R |
| Irelia | Dados 16.21.1 + AD auditado | Q dash anterior; E blades & convergência | P, W, R e interrupt detalhado |
| Caitlyn | Dados 16.21.1 + AD auditado | Nenhum kit completo novo neste PR | P + QWER |
| Leona | Dados 16.21.1 + AD auditado | Nenhum kit completo novo neste PR | P + QWER |
| Volibear | Dados 16.21.1 + AD auditado | Nenhum kit completo novo neste PR | P + QWER |

## Engenharia
- `engine.mjs`: **não substituída**; adições localizadas em `CHAMPION_KITS_V42`, `CHAMPION_LEVEL_STATS_V453_DEV69_M1`, `queueDirectionalSkill`, `resolveDirectionalSkills`, `launchChampionDirectionalV453Dev69M2`, `advanceChampionProjectilesV453Dev42`, `luxMark/ConsumeIlluminationV453Dev69M2` e adaptadores específicos.
- M2 Ahri Q: projétil de ida aplica magic, novo estágio de volta aplica true, `hitIds` independentes por passagem, custos/cooldown cobrados apenas no cast.
- Ahri E e Jinx W: primeiro alvo válido ao longo do raio atravessado, interceptação por minion, spellshield, projéteis defensivos, fog e recusa de controle cruzado PvP.
- Lux W: escudo no caster no lançamento, aliado em varredura, outra aplicação no retorno, estado/restauração de snapshot; nunca cura inimigo.
- Illumination: marca exclusiva do `ownerId`, 6 segundos, aplicação real por Q/E/R e consumo único pelo ataque básico (R consome/reaplica). Base 30–200 no nível 1–18 com 35% AP.
- A progressão de HP/mana/resistências/regeneração/AS/range/MS tem referência 16.21.1. **DDragon `attackdamageperlevel` retorna zero incorreto**; crescimento AD de cada um dos dez campeões foi auditado individualmente no patch 26.21, sem usar zero. Nenhuma alteração na loja/itens, Nexus, Undo, HTTP server, `version.json`, `engine.browser.js` ou `main`.

## QA factual
No commit `fd22d566873aa2be43a01ca81efe1f8a8b36eb66` o workflow FAST Skills [40757765940](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40757765940) **PASS**:
- `node --check engine.mjs` + sintaxe de testes **PASS**
- Batch 2 original 44/44; M1 stats/Nami/Vex 53/53; M2 Ahri/Lux/Jinx **50/50**.
- Skills antigo 64/64; Lux Dev68 40/40; Ezreal/Irelia Dev43 19/19; V4.2 16/16.
- **Total FAST Skills 286/286 PASS**; `dev69-qa.yml` [40757765950](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40757765950) **PASS**.

**NÃO certificados:** full `npm test`, duas abas Chromium HTTP/SSE de campeões M2, paridade visual, hitbox frame-accurate, todo P/Q/W/E/R por campeão. A action de integração no PR aberto **falha só na comparação Node/browser**, porque o browser fica propositalmente desatualizado na branch Skills; só o integrador deverá rodar `python tools/sync_browser_v43.py` após merge. A Issue #1 (assets) bloqueia release.

## Fonte e reversão
- Riot Data Dragon 16.21.1 para dados numéricos; contexto patch PC 26.21.
- https://wiki.leagueoflegends.com/en-us/Ahri
- https://wiki.leagueoflegends.com/en-us/Lux
- https://wiki.leagueoflegends.com/en-us/Jinx
- https://riotcodex.net/champions/Ezreal , /Irelia , /Caitlyn , /Leona , /Volibear (referência da comunidade)
- Reverter commits deste PR na `dev69/integration` após revisão por hunk; não force-push nem reset global.


## Avanço de engenharia M3–M5 (2026-10-28, NÃO CERTIFICADO)

**Status:** PR #9 Draft, nenhum merge, nenhuma promoção para `main`, nenhuma edição de `engine.browser.js` ou `version.json`. A frente de Itens tem marco independente e só será agregada quando o usuário solicitar ao auditor.

### M3 — Lux
- R: cast temporal de 1 segundo, registro serializável da origem/direção, múltiplos alvos, bloqueio por escudo de feitiço, interação de Illumination e fog, cancelamento por morte.
- W: projétil de ida com escudo de auto/aliados, retorno acompanhado da posição atual da Lux, outro escudo no contato real.
- E: viagem antes da chegada, recast durante o voo sem custo extra, lentidão, dano, marca e visão só da equipe com duração iniciada no impacto.
- Passiva: proprietário exclusivo da marca, Q/E/R aplicam; AA/R detonam nos casos previstos.
- **Aberto para certificação:** quantidades/ranks de todos os efeitos, responsividade de cast/interrupt, visão/brush, casos de duelo, integração no browser, regressões combinadas no ambiente do auditor.

### M4 — Ahri (P+QWER agora possuem execução individual; kit AINDA NÃO CERTIFICADO)
- P Essence Theft: cura após o nono minion efetivamente abatido, cura de takedown, extensão de R e carga adicional após abate/assistência.
- Q Orb of Deception: magia na ida, dano verdadeiro na volta com históricos separados.
- W Fox-Fire: três disparos server-side ordenados, escolha de alvos visíveis, alvos repetidos com multiplicador, aceleração de movimento por tempo definido.
- E Charm: projétil real interceptável pelo primeiro alvo, escudo de feitiço, aplicação de CC.
- R Spirit Rush: três avanços até o limite sem atravessar terreno, disparos nas proximidades, recasts sem novos custos.
- **Aberto:** Q retorna à posição atual da Ahri (atualmente direção invertida fixa), prioridades completas de W e interações de projéteis, knockdown de E, cura de passiva por monstros e cases de reset R; teste de navegador/partida inteira e estatísticas de transição lv1–18.

### M5 — Jinx (P+QWER agora possuem execução individual; kit AINDA NÃO CERTIFICADO)
- P Get Excited: aceleração real de movimento e cadência de AA, até 5 stacks após mortes de campeões, assistências aceitas na janela de 3 segundos.
- Q Switcheroo!: alternância autoritativa sem custo na troca; Fishbones com alcance maior, consumo de 20 mana no AA, dano de área; Pow-Pow com stacks de velocidade de ataque.
- W Zap!: primeiro interceptor real, físico, lentidão/revelação por equipe.
- E Flame Chompers!: três traps no mundo, chegada/armamento, root e dano sem procs duplicados por alvo, visão team-only.
- R Super Mega Death Rocket!: projétil global direcional, atravessa minions e detona no primeiro campeão, explosão física escalada por distância/vida perdida.
- **Aberto:** P por estruturas/monstros épicos, regra fina de Q em falta de mana, E múltiplas armadilhas/expiração/cancelamentos, R telegraph e testes detalhados de splash, status durante morte/respawn, inclusão integral na UI/browser.

### Gate e testes (head 61f4d28c7319ee88a4be7cbf69b6436e89c650ed)
- [QA Skills 40761361176](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40761361176) **PASS**: Batch2 44, M1 53, M2 52, M3 41, M4 37, M5 41, Skills original 64, Lux dev68 40, Ezreal/Irelia dev43 19, V4.2 legado 16 = **407/407**.
- [QA logic 40761361257](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40761361257): verificar conclusão independente; jamais converter sucesso de FAST em certificação do browser.
- [Workflow integrado 40761361232](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40761361232) **FAIL esperado** na etapa de regeneração Node→browser: sincronização é responsabilidade do integrador depois do merge; full npm test não rodou neste PR.
- **Critério de contagem:** 10 perfis de stats auditados ≠ 10 campeões completos. 5 campeões com avanços relevantes ≠ 5 campeões certificados. Nenhum kit recebe `certified` sem verificação explícita de P/QWER+stats+interações+PvP+replay+browser/release.

### Próximo bloco sem abrir PR concorrente
Fechar lacunas individuais de Ahri e Jinx, depois Nami/Vex e Lux, abrangendo os demais membros do pacote de 6–10 (Ezreal e Irelia como próximos candidatos). Manter commits pequenos internamente, **um único PR por macro-marco**, sem entregas falsas de kits parciais; integrar apenas quando o usuário ordenar ao auditor.


## Macro-pacote único de 7 campeões — regra revisada após pedido do usuário (28/10/2026)

**É proibido chamar M1/M2/M3/M4/M5/M6/M7 de "pacotes entregues".** São *etapas internas* do PR **#9**. O **único pacote de entrega** é o conjunto final de **sete kits individuais completos**: Nami, Vex, Lux, Ahri, Jinx, Ezreal e Irelia. A meta de 6–10 campeões completos por pacote permanece vigente para os próximos lotes. Nada é integrado em `dev69/integration`/ `main` antes da autorização do usuário ao auditor.

### Matriz real do código na branch Skills

| Campeão | Fonte de stats lvl 1–18 | Passiva | Q | W | E | R | Certificação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Nami | 26.21 auditado | ativa em aliados, ainda sem paridade integral | Aqua Prison | Ebb and Flow | Tidecaller's Blessing (3 cargas AA) | Tidal Wave | **partial** |
| Vex | 26.21 auditado | Doom/Gloom (subset) | Mistral Bolt | Personal Space | Looming Darkness | Shadow Surge R/R2 | **partial** |
| Lux | 26.21 auditado | Illumination por dono | Light Binding | Prismatic Barrier ida/volta | Lucent Singularity temporal | Final Spark 1s | **partial** |
| Ahri | 26.21 auditado | Essence Theft | Orb of Deception ida/volta homing | Fox-Fire 3 cargas | Charm 1º hit | Spirit Rush 3 dash/recasts | **partial** |
| Jinx | 26.21 auditado | Get Excited (kills/assists) | Switcheroo! modos | Zap! 1º alvo | 3 Flame Chompers independentes | Super Mega Death Rocket | **partial** |
| Ezreal | 26.21 auditado | Rising Spell Force por hits | Mystic Shot temporal | Essence Flux mark detonável | Arcane Shift blink e auto-hit | Trueshot Barrage com windup | **partial** |
| Irelia | 26.21 auditado | Ionian Fervor stacks/AA | Bladesurge real dash/on-hit | Defiant Dance redução/canal | Flawless Duet com 2 lâminas | Vanguard's Edge com mark/wall | **partial** |

**Esta tabela demonstra cobertura individual de execução, NÃO paridade exata já certificada.** Existem diferenças relevantes ainda a auditar contra fonte da versão: números/ranks de todas as habilidades, cooldown por habilidade, fatores AP/AD, resumos de cast, colisões, CC/tenacidade, mobs/estruturas, compra de itens (em branch separada), buffs/debuffs, spell shield, níveis, interrupções, fog e interações cruzadas, resultados no browser e duas sessões reais.

### Integração autoritativa (já programada e validada no Node)

- Cliente só envia ordens/intenção; executor central paga custos/cooldowns uma vez e administra efeitos por fonte e equipe.
- Ezreal Flux marcado por `ownerId`, detonado por AA/skill do próprio Ezreal. Vex e Irelia não podem consumir marca alheia.
- Nami E fortalece AA de aliado Vex; não concede proc ao adversário nem aparece em unidades de equipe errada.
- Irelia R marca inimigo com Unsteady; Jinx E tem três armadilhas independentes e ledger de alvo; Ahri Q acompanha posição atual da lançadora no retorno.
- O teste `tests/v453_dev69_multi_champions_m7.test.mjs` monta **uma partida com cinco campeões azuis (Irelia, Ezreal, Ahri, Jinx, Lux) e cinco vermelhos, incluindo Vex e Nami**, onde cada lado é controlado por UM jogador. Confere posse de comandos, interações cruzadas, limites de proc, mana, hit e `snapshotV40/fromSnapshotV40`.
- Nenhum kit usa comportamento do bot como justificativa de gameplay PvP.

### QA mais recente do macro-pacote

- [Skills QA 40763275927](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40763275927) **PASS**: Batch2 44, M1 53, M2 52, M3 41, M4 37, M5 39, M6 15, M7 **45**, Skills anterior 64, Lux Dev68 40, Dev43 19, V4.2 16 → **465/465 testes dirigidos PASS**. Esses testes são distintos de certificado de paridade do jogo.
- [Logic QA 40763276047](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40763276047) **PASS**.
- [Integrated QA 40763276097](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40763276097) **FAIL na sincronização Node→`engine.browser.js`**, que pertence ao integrador após merge. Não alterar `engine.browser.js` em Skills.
- Permanece **Draft sem merge**, `main`/versão/itens inalterados.

### Gates finais para um CAMPEÃO ser contado como 1/7 completo

1. Stats base/crescimento dos níveis 1–18 comparados ao patch, inclusive AD e AS, alcance, vida/mana, regeneração, XP e rank QWER.
2. P/Q/W/E/R individualmente paritários em custo, cooldown, alcance, geometria, efeitos, recast, escudos, sustain, auto-ataques, visão, CC e estados temporários.
3. Ordem simultânea real (um jogador controla 5), check de posse, recepção de ordens/journal, reação, fog, privacidade de eventos, itens e spells existentes, minions/monstros/estruturas.
4. Snapshot/replay sem desvio, reconexão, idempotência, derrota por Nexus, Undo e consistência de buffs quando uma unidade morre.
5. Testes de borda completos por campeão + matriz de interações entre os sete, **Node e browser sincronizados no integrador**, navegador/HTTP duas sessões e QA de assets e release.

**Ninguém deve reportar "7 completos" ou "pacote concluído" antes de todos esses gates serem comprovados.** Os 465 testes verdes mostram avanço mensurável da implementação, mas a certificação atual permanece **0/7**, em revisão. A continuidade deverá fechar lacunas de completude e não reiniciar entregas de dois campeões.


## Macro-pacote 7 campeões — fortalecimento de contratos (continuação no mesmo chat)

**Não é um pacote de dois campeões.** Continua sendo o único bloco de Nami, Vex, Lux, Ahri, Jinx, Ezreal e Irelia no PR #9 Draft. Não há merge nem autorização de integração.

- **Nami E × Vex:** A bênção de Nami agora fortalece também um acerto direto de habilidade com dano e slow, além do ataque básico. Efeitos passivos e o próprio bônus não produzem procs recursivos. Em uma mesma simulação, acertos de um feitiço em área consomem apenas uma carga; cargas remanescentes persistem por snapshot e são removidas ao acabar. **Limitação para certificação:** spells distintas no mesmo instante e particionamento de acertos AoE exigem identificador explícito de instância de habilidade; a agregação atual é por instante de simulação.
- **Irelia W × combate/movimento:** Irelia não caminha por `moveAlong` e não dispara AA automáticos enquanto canaliza Defiant Dance. A redução de dano do W ainda funciona durante a preparação. O segundo comando W durante a canalização antecipa o golpe, sem repetir custo ou cooldown; dano aumenta proporcionalmente ao tempo carregado até o máximo de 0,75s. Mitigação tem cauda temporária. Confirmação por blue e red e restauração de estado.
- **Teste integrado mesmo jogo:** jogo PvP azul 5 (Irelia, Ezreal, Ahri, Jinx, Lux) contra vermelho incluindo Nami e Vex: posse de comandos, buff aliado, AA e dano mágico de skills, ausência de procs duplicados, marca Ezreal separada de marca Irelia, mana, estado/cargas e replays.
- A expectativa do teste de snapshot foi corretamente atualizada: ao serem consumidas as três cargas da Nami E, o buff salvo deve ser `null`, não continuar com duas cargas.

**CI de Skills no commit `ee320eaff58d6df75c5b0dd08395dc17dab846f9`:** [workflow 40765356775](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40765356775) **SUCCESS 480/480**: Batch2 44, M1 53, M2 52, M3 41, M4 37, M5 39, M6 15, M7 60, Skills original 64, Lux Dev68 40, Dev43 19, V4.2 16.

**Ainda não certificado: 0/7.** Os testes cobrem o contrato parcial efetivamente implementado, mas os sete campeões ainda exigem paridade completa por habilidade/passiva/rank/level, respawn, uso de itens e feitiços, fog, casos de borda de colisores, reconexões de duas sessões e browser sincronizado. O workflow integrado seguirá vermelho na etapa Node→`engine.browser.js` até o auditor fazer a sincronização após autorização para merge. O projeto de Itens, `main`, `version.json` e `engine.browser.js` seguem intocados.

**Fonte externa verificada:** https://wiki.leagueoflegends.com/en-us/Irelia e https://wiki.leagueoflegends.com/en-us/Nami. O fato de slots estarem registrados não autoriza declarar fidelidade integral.


## Dev69 — escalabilidade do elenco SR, não certificação de habilidades
O patch offline 16.21.1 já contido no repositório agora alimenta uma tabela
compacta de 173 atributos base de campeões, sem 173 blocos manuais no motor.
O draft PvP de duas equipes passa a usar o fallback por campeão, preservando
prioridade dos 10 perfis já auditados. A tabela inclui crescimento de HP,
recurso, resistências, regeneração e AS para geração/auditoria posterior; **AD
growth não é inventado**, pois o dump contém zeros incorretos. Nenhum dos 163
perfis novos ganha selo de kit completo por ter atributos base. O jogo continua
com os sete kits atuais em revisão e deve migrar para lotes de dezenas via
efeitos reutilizáveis, com P/Q/W/E/R e gatilhos individuais, sem
frame simulation de RTS nem caminhos de motor concorrentes.
Testes: `tests/v453_dev69_roster_scale.test.mjs` (173 contratos base,
2 drafts PvP de 10 campeões, snapshot). Integração/browser aguardam auditor.


## M9 — Gramática compartilhada de tabuleiro (PR #9, não certificado)
- Executor autoritativo único `queueBoardSkillV453Dev69` → `executeBoardSkillV453Dev69`, usando `performActionV40`, geometria compartilhada, CC/escudos/cura/DoT e journal privado. Não exige novos arquivos de import no browser.
- **12 campeões adicionais** com 48 slots jogáveis em protótipo de tabuleiro: Garen, Annie, Ashe, Soraka, Morgana, Malphite, Leona, Veigar, Brand, Sona, Janna e Darius. Não são classificados como completos; o catálogo declara lacunas específicas (invocações, teleporte/dash, passivas, empurrões, recasts e geometria).
- Regras de acesso: o adversário não controla suas unidades; queue sem debitar recursos, resolução única, slots de ult requerem nível 6, alvo visível nos casts direcionados, skillshots por coordenadas sem usar IDs ocultos, timestamps e visão temporária serializáveis.
- Próxima etapa: expandir a biblioteca e completar particularidades dos kits em vez de copiar lógica; validar CI e paridade patch 26.21 antes de qualquer certificação. **Sem merge**.

- **M9 QA adicional:** combos dos perfis de tabuleiro acionam o mesmo executor (inclusive autocast sem inimigo visível); Ashe AA aplica slow de Frost Shot e E oferece reconhecimento exclusivo da equipe; Morgana E concede escudo mágico e bloqueio de habilidade. Esses testes não conferem certificação de kits.


## M10 — 18 campeões adicionais / 30 contratos de tabuleiro
- Source: `data/riot_reference/source_16_21_1/riot/16.21.1/en_US/champion/*.json`. Total neste executor: 30 perfis, 120 slots QWER descritos; 2 slots passivos não devem ser usados como habilidade ativa (Vayne W, Twisted Fate E). Não contar como 30 campeões completos/certificados.
- Novos perfis: Amumu, Blitzcrank, Dr. Mundo, Nasus, Jax, Miss Fortune, Cho'Gath, Rammus, Renekton, Sivir, Tristana, Twisted Fate, Xin Zhao, Ziggs, Taric, Warwick, Vayne e Olaf.
- Primitivas reutilizadas/expandidas: movimentação por célula válida, dash até alvo, knockback, pull com verificação de paredes, buffs temporários de velocidade, dano e CC tipados, imunidade temporária a CC, escudos, invulnerabilidade, ataque básico preparado em cargas, acúmulo de Nasus Q, Silver Bolts de Vayne, rebote de MF Q, crescimento de Cho'Gath R e visão.
- QA executável: `tests/v453_dev69_board_m10.test.mjs` valida lançamento, posse, cobrança única, snapshot, 2 equipes e casos especiais. Atributos e slots ainda requerem auditoria detalhada por patch; summons, recasts, multi-fase, clones, geometria especial e vários detalhes de passivas permanecem explicitamente pendentes no campo `missing`.
- O motor Node é a fonte autoritativa; **não editar `engine.browser.js` nem executar merge**. Verificação integrada de Node/browser pertence ao integrador após consolidação.


## M11 — Integração PvP QWER e efeitos temporais
- Rota `skill.self` autenticada, especial `skill.ultimate` do catálogo de tabuleiro, endpoint read-only `GET /api/kits` pós-sessão e controles compactos Q/W/E/R no cliente `multiplayer/pvp_client_v453_dev47.js` / `multiplayer.html`. Sem alteração de `engine.browser.js`; PvP via servidor utiliza `engine.mjs`.
- Agendador serializável e determinístico `boardTemporalV453Dev69` com arena estática e passos por tempo simulado: Taric R resolve invulnerabilidade somente após ~2,5s, Veigar E verifica anel periférico sem stun no centro, Morgana W afeta somente quem permanece/entra no solo, Ziggs E minas de contato sem múltiplos disparos sobre a mesma unidade, Miss Fortune R resolve canalização em 3 ondas canceláveis por CC e Tibbers R mantém uma presença estacionária de dano; Sona E fornece mobilidade em vez de cura fictícia.
- Implementações ainda **board_prototype** e não paridade 1:1: Tibbers não é um pet móvel/atacável, falta geometria contínua do anel de Veigar, passos visuais/timing de projéteis e efeitos adicionais específicos de cada campeão. Os 30 perfis continuam com pendências para certificação.
- QA: `tests/v453_dev69_board_m11.test.mjs` + QA M10/M9 + regressões PvP/Skills. Testes exercitam azul e vermelho, snapshot, alvo oculto, controle de spells e API do próprio servidor (cookie e posse).
- Integrated QA Node/browser ainda falha deliberadamente em sync pré-merge; cabe ao integrador reconciliar todas as branches e regenerar o artefato browser, antes de declarar entrega final.


## M12 — Recasts e passivas condicionais (contratos de tabuleiro, não certificados)
- Motor: Ziggs W lança carga temporizada no tabuleiro (`satchel_charge`, 4s simulados); recast da mesma W aciona a detonação sem segundo débito de mana/cooldown e sem duplicar hits. Expiração detona uma única vez. Deslocamento usa colisor/área caminhável do motor.
- Cliente PvP: botão compacto `Reativar` aparece se existir carga válida para o campeão selecionado. `PvPRoom.view` entrega só slots de recast dos cinco campeões do jogador, sem o estado/posição/IDs das cargas da equipe adversária. Endpoint de kits inclui campo `boardTemporal` apenas como metadado.
- Brand: Q verifica marca `Ablaze` pré-existente no alvo para stun; R alcança uma cadeia de até 3 inimigos distintos e próximos com ordem determinística. Ainda faltam rebotes completos entre alvos e a simulação de tempo de projétil.
- Darius: ataques básicos e Q/W constroem marcas de Hemorrhage em campeões, limitadas a 5; DoT em ticks e aumento de R de acordo com marcas antes do cast. Ainda falta reset completo da R e alguns detalhes do buff Noxian Might.
- `tests/v453_dev69_board_m12.test.mjs`: 19/19 PASS nas equipes azul e vermelha, incluindo separação de cookies HTTP, recast sem custo, auto-detonation, stacks, Brand e checkpoint.
- Execução Skills: https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40783592904 (SUCCESS; M9 28/28, M10 263/263, M11 22/22, M12 19/19). Logic QA SUCCESS; Integrated QA falha exclusivamente em `Verify official Node to browser regeneration` antes de executar suite combinada; sincronização é responsabilidade do integrador.
- **0 kits M12 declarados certificados**. Sem merge, sem alteração de `main`, `version.json` ou `engine.browser.js`.

## M13 — Leash e duração de Tibbers (ajuste da solicitação do usuário)
- Referência League of Legends Wiki de Annie (consultada 28/10/2026): Tibbers permanece até **45 segundos** e usa blink/teleporte quando se afasta demais de Annie. A fonte não especifica de forma inequívoca o limite atual exato da distância em vida; os **1200 unidades são parâmetro provisório de tabuleiro**, não paridade certificada. https://wiki.leagueoflegends.com/en-us/Annie
- A regra no servidor retorna o pet a uma célula caminhável próxima de Annie (raio ~150), limpa perseguir/andar para destino remoto, impede comandos com alvos/destinos além do leash, preserva HP e cooldown e evita aplicação duplicada no mesmo segundo. Expiração aos 45s independente de distância. Snapshots e projeções visíveis permanecem exclusivos da equipe.
- QA em `tests/v453_dev69_board_m13.test.mjs`: ambos os lados, blink sob leash, reset de ordens, célula válida, snapshot e término no segundo 45.
