# QA — dev69/items-batch2 ampliado: 18 itens

**Base comum:** `dev69/integration` em `374d87d5f49b52514ec68bbe666df086363c1ec5` (Skills #6 + Itens #7). PR #10 expandido **antes do merge**. Patch LoL PC **26.21**, Data Dragon **16.21.1**, catálogo oficial em `data/riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json`. **Não certificado** como paridade 1:1 com LoL PC.

## Três itens Anular do lote inicial

| Riot ID | Motor | Preço | Revenda | Receita | Passiva | Estado |
| --- | --- | ---: | ---: | --- | --- | --- |
| 4632 | `verdant_barrier` | 1600 | 1120 | 1052+1033+1052 | Escudo de feitiço 60s | Implementado; não certificado |
| 3102 | `banshees_veil` | 3000 | 2100 | 1058+4632 | Escudo de feitiço 40s; preserva cooldown ao evoluir | Implementado; não certificado |
| 3814 | `edge_of_night` | 3000 | 2100 | 3134+2021 | Escudo de feitiço 40s | Implementado; não certificado |

## 15 itens adicionais, receitas e valores individuais

Todos os IDs, receitas, atributos, preço e `gold.sell` foram comparados no teste com o DDragon arquivado. Esta matriz exibe o **efeito realmente programado**; não presume que toda exceção do LoL PC esteja certificada.

| Riot ID | Motor | Preço/venda | Receita Riot | Efeito no motor | Estado |
| --- | --- | --- | --- | --- | --- |
| 6609 | `chempunk_chainsword` | 3000 / 2100 | 3123+1011+3133 | Feridas graves após dano físico de campeão | Implementado; não certificado |
| 6694 | `seryldas_grudge` | 3000 / 2100 | 3133+3035 | Pen. armadura e slow de habilidade sob 50% HP | Implementado; não certificado |
| 4645 | `shadowflame` | 3200 / 2240 | 3145+1058 | 20% bônus mágico/verdadeiro em alvo sob 40% HP | Implementado; não certificado |
| 6676 | `the_collector` | 3000 / 2100 | 1037+3134+1018 | Execução 5% HP; 25 gold no abate sem duplicação | Implementado; não certificado |
| 8020 | `abyssal_mask` | 2650 / 1855 | 3067+1057 | Aura de 12% dano mágico perto do portador | Implementado; não certificado |
| 4629 | `cosmic_drive` | 3000 / 2100 | 3067+3113+3108 | +20 MS por 4s após dano mágico/verdadeiro | Implementado; não certificado |
| 2501 | `overlords_bloodmail` | 3300 / 2310 | 2021+2021 | +2,5% HP bônus em AD e AD por HP perdido | Parcial; fórmulas derivadas do inventário |
| 4633 | `riftmaker` | 3100 / 2170 | 3147+3108 | +2% HP bônus em AP, até 8% dano, vamp 10%/6% no auge | Parcial; combate temporal aproximado |
| 6653 | `liandrys_torment` | 3000 / 2100 | 3147+2508 | Burn mágico 2% HP máx/s por 3s; aumento de dano por combate | Parcial; teto de dano a monstros pendente |
| 8010 | `bloodletters_curse` | 2900 / 2030 | 3147+3108 | Reduz MR 7,5% × 4 acúmulos por 6s | Implementado; não certificado |
| 2504 | `kaenic_rookern` | 2900 / 2030 | 3211+1057 | Escudo mágico 15% HP máx; retorna após 15s sem dano mágico | Implementado; não certificado |
| 3156 | `maw_of_malmortius` | 3100 / 2170 | 3155+3133 | Lifeline mágico, 90s, omnivamp 10% no combate | Parcial; persistência exata do fim de combate |
| 6673 | `immortal_shieldbow` | 3000 / 2100 | 1037+6670 | Lifeline escudo 3s, 90s CD, varia por nível/range | Parcial; escudo escalonado do motor |
| 3053 | `steraks_gage` | 3200 / 2240 | 1037+2021+1028 | +50% AD base, escudo 60% HP bônus por 4,5s, tenacidade | Parcial; decaimento fino do escudo |
| 4401 | `force_of_nature` | 2800 / 1960 | 1057+1028+3066 | Após 8 hits mágicos, +70 MR e +6% MS | Parcial; algumas fontes mágicas protegidas |

## QA FAST reproduzido localmente

Node v22.16.0; workspace dev68 fiel + patches de itens #7/#10, **não** clone idêntico de Skills #6. A integração precisa confirmar SHA remoto e browser.

| Teste | Local |
| --- | --- |
| `node --check engine.mjs` | PASS |
| `node --check tests/v453_dev69_items_batch2.test.mjs` | PASS |
| `node --check tests/v453_dev69_items_bulk_18.test.mjs` | PASS |
| `node tests/v453_dev69_items_bulk_18.test.mjs` | **PASS 23/23** |
| `node tests/v453_dev69_items_batch2.test.mjs` | **PASS 11/11** |
| `node tests/v453_dev69_items_batch1.test.mjs` | **PASS 8/8** |
| `node tests/v453_dev61_shop_undo_pvp.test.mjs` | **PASS 22/22** |
| `node tests/v453_dev62_pvp_hud_e2e.test.mjs` | **PASS 18/18** |
| `node tests/v453_dev64_pvp_reaction_e2e.test.mjs` | **PASS 26/26** |
| `node tests/v453_dev68_lux_projectile_pvp.test.mjs` | **PASS 40/40** |
| Full `npm test`, Selenium/Chromium duas sessões | NOT_RUN na branch especialista |

**Regressões de invariantes:** receita recursiva com desconto de componente sem duplicação, venda oficial e repetição negada, exclusividade Lifeline/Anular/Fatalidade, gold de execução única da Coletora, spell shields, resposta ao dano, HP/escudos, cooldown, snapshots, Undo LIFO e saída física da fonte, ownership azul/vermelho. Não tocar motor browser, version.json nem main. Catálogo normal passa de **107 jogáveis/95 referências** a **122 jogáveis/80 referências**; três Anular + quinze novos.

## Pendências para integrador

- Engine Node/browser: regeneração por `python tools/sync_browser_v43.py` **somente na integração depois do merge**, executar `npm run test:v453:dev69:integration`; CI original do PR #10 falhou no gate de browser desatualizado, antes dos testes integrados.
- QA visual remoto de duas sessões, assets binários do Issue #1, persistência de buffs de morte, granularidade de passivas, sobreposição de escudos e limites por monstros/DoT ainda não certificados. Corrigir eventuais diferenças sem marcar `certified` antes de evidências.
- Não reverter a regra **Undo da fonte**: sair fisicamente revoga permanentemente operações antigas, mesmo após retorno/reconexão. Bot AI não faz parte da certificação PvP humana.

**Rollback:** `git revert` dos commits do PR #10; nunca sobrescrever engine inteira, resetar a branch ou fazer push forçado.
