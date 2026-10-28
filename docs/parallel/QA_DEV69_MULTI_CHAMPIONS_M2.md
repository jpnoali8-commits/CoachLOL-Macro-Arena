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
