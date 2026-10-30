# M19 — Plano executável dos cinco macro-pacotes Skills

**Snapshot de referência:** branch `fix/skills-entity-targetability-p1-dev69`, Riot Data Dragon offline `16.21.1`; roteiro calculado pelo código executável `tools/skills_macro_batch_planner_v453_dev69.mjs`.

**Certificação:** absolutamente nenhum campeão declarado completo apenas por roteamento. Matriz M19 emitida e validada pelo [GitHub Actions #40804079701](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40804079701).

**Baseline real:** 173 campeões, 173 passivas, 692 slots QWER, **509 training**, 183 roteados não certificados; 114 campeões com 4 fallbacks.

| Macro-pacote | Campeões P+QWER | Fallbacks QWER | Fallbacks remanescentes após eventual fechamento completo* |
|---|---:|---:|---:|
| B01 | 35 | 140 | 369 |
| B02 | 35 | 140 | 229 |
| B03 | 35 | 140 | 89 |
| B04 | 35 | 89 | 0 |
| B05 | 33 | 0 | 0 |

*Projeção de planejamento, **não implementação realizada**. Redução só ocorre quando os slots receberem lógica própria real, com QA executado, não pela presença de um descritor ou pela troca de `kind`. As 173 passivas também precisam de auditoria independente.

## B01 — 35 campeões / 140 slots training

Corki, Cassiopeia, Karthus, Seraphine, Xerath, Zac, Zilean, Yunara, Alistar, Gragas, LeeSin, Lulu, Mel, Rell, Sejuani, Sett, TahmKench, Galio, Locke, Lucian, Milio, Quinn, Syndra, Urgot, Varus, Viktor, Fizz, JarvanIV, MasterYi, Shen, Vi, Braum, Heimerdinger, Kassadin, KogMaw

**Famílias de mecânicas sugeridas pelos textos:** crowd_control, defense, movement, pet_clone, projectile, stacks_marks, stealth. São palavras-chave para triagem, não especificações de comportamento. 

## B02 — 35 campeões / 140 slots training

Lissandra, Pantheon, RekSai, Riven, Trundle, Diana, Naafiri, Nautilus, Rumble, Udyr, Velkoz, Hecarim, Karma, Kennen, Sion, Swain, Taliyah, Zyra, Aatrox, Ambessa, Lillia, Nocturne, Zaahen, Skarner, Smolder, Graves, Gwen, Volibear, Zeri, Anivia, Illaoi, Malzahar, Poppy, Bard, Ivern

**Famílias de mecânicas sugeridas pelos textos:** crowd_control, defense, movement, pet_clone, projectile, recast, stacks_marks, stealth, terrain_realm, transform. São palavras-chave para triagem, não especificações de comportamento. 

## B03 — 35 campeões / 140 slots training

Kayle, Ryze, Yorick, Belveth, Aurora, Ornn, KSante, Tryndamere, Rakan, Xayah, Draven, Nunu, Orianna, Vladimir, Fiddlesticks, Katarina, Nilah, Singed, Fiora, Samira, Renata, Zed, Kindred, Yone, Ekko, Gangplank, Thresh, Kled, Leblanc, Qiyana, Yasuo, Camille, Yuumi, Mordekaiser, Jayce

**Famílias de mecânicas sugeridas pelos textos:** crowd_control, defense, movement, pet_clone, projectile, recast, stacks_marks, stealth, terrain_realm, transform. São palavras-chave para triagem, não especificações de comportamento. 

## B04 — 35 campeões / 89 slots training

Briar, Kalista, Kayn, Gnar, Hwei, Azir, Sylas, AurelionSol, Aphelios, Caitlyn, Evelynn, Twitch, Senna, Pyke, Kaisa, Zoe, Akali, Maokai, MonkeyKing, Talon, Rengar, Khazix, Akshan, Neeko, Viego, Jhin, Teemo, Shaco, Nasus, Sivir, Rammus, Amumu, Annie, Chogath, Morgana

**Famílias de mecânicas sugeridas pelos textos:** crowd_control, defense, movement, pet_clone, projectile, recast, stacks_marks, stealth, terrain_realm, transform. São palavras-chave para triagem, não especificações de comportamento. 

## B05 — 33 campeões / 0 slots training

Soraka, TwistedFate, Jinx, Sona, Leona, Olaf, Warwick, Brand, Ezreal, Garen, Lux, MissFortune, Taric, Tristana, XinZhao, Blitzcrank, Jax, Malphite, Veigar, Darius, Ahri, DrMundo, Nami, Ziggs, Janna, Ashe, Irelia, Vayne, Nidalee, Vex, Renekton, Shyvana, Elise

**Famílias de mecânicas sugeridas pelos textos:** crowd_control, defense, movement, pet_clone, projectile, recast, stacks_marks, stealth, terrain_realm, transform. São palavras-chave para triagem, não especificações de comportamento. 

## Contrato de entrega do engenheiro Skills

- Produzir cada macro-pacote inteiro P+QWER com efeitos por primitivas compartilhadas; evitar a entrega de um ou dois campeões por revisão. Registrar explicitamente mecânicas ainda parciais, sem certificação artificial.
- QA em duas equipes PvP para cada slot: fila → validação de alcance/visão/Realm → commit uma única vez → efeito real → reação/oposição → snapshot/replay. Incluir mortes, negações de alvo, colisões, pets, transformações, recasts e armadilhas conforme o campeão.
- O arquivo gerado `M19_RUNTIME_MANIFEST.json` no artifact do workflow contém o nome oficial da passiva, Q/W/E/R, descrição, cooldown/range de referência e o route status. Data Dragon **não** é uma implementação de mecânica.
- A cada novo marco, executar `node tools/skills_macro_batch_planner_v453_dev69.mjs --out docs/skills_macro_batches_dev69` e `node tests/audit/v453_m19_macro_batch_gate.test.mjs`.
- O integrador controla `engine.browser.js`, `dev69/integration`, `npm test` global, browser/Chromium e release. PR #9 segue Draft; não realizar merges paralelos neste pacote.
