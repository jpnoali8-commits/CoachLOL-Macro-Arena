# FAST LANE — dev69/items-batch2 (Anular)

**Base:** `374d87d5f49b52514ec68bbe666df086363c1ec5` (`dev69/integration`, com PRs #6 e #7). Branch: `dev69/items-batch2`. Patch de referência **LoL PC 26.21 / Data Dragon 16.21.1** (fonte estática `data/riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json`). Estado **implemented / NOT_CERTIFIED**; assets e release ainda bloqueados.

## Matriz pequena: 3 itens originalmente reference-only

| Riot ID | Item | Preço | Revenda oficial | Receita oficial por Riot ID | Atributos | Efeito Anular | Status |
| --- | --- | ---: | ---: | --- | --- | --- | --- |
| 4632 | Barreira Verdejante | 1600 | 1120 | 1052 + 1033 + 1052 | 40 AP, 25 MR | Escudo de 1 habilidade, 60 s | Implemented, not certified |
| 3102 | Véu da Banshee | 3000 | 2100 | 1058 + 4632 | 105 AP, 40 MR | Escudo de 1 habilidade, 40 s; herda cooldown na melhoria | Implemented, not certified |
| 3814 | Limiar da Noite | 3000 | 2100 | 3134 + 2021 | 50 AD, 15 letalidade, 250 HP | Escudo de 1 habilidade, 40 s | Implemented, not certified |

**Catálogo SR normal:** 202 registros = **107 engine_playable + 95 reference_only**; as outras 95 entradas permanecem bloqueadas. A fonte Data Dragon confere preços, revendas, receitas e atributos; os tempos de recarga e exclusividade de Anular foram confrontados com as páginas [Barreira Verdejante](https://wiki.leagueoflegends.com/en-us/Verdant_Barrier), [Véu da Banshee](https://wiki.leagueoflegends.com/en-us/Banshee%27s_Veil) e [Limiar da Noite](https://wiki.leagueoflegends.com/en-us/Edge_of_Night).

## Implementação e limites

`engine.mjs`: três entradas do catálogo, receitas e `gold.sell` individuais; `ITEM_EFFECTS_V43` + estado de cooldown `itemAnnulReadyAtV453Dev69Batch2`; efeito `spell_shield` no motor, consumido uma vez por habilidade inimiga (inclui habilidades de dano ou CC), com recarga por tempo simulado. Dano efetivo de campeão enquanto escudo descarregado reinicia a recarga; morrer também inicia cooldown. Melhoria da Barreira para Banshee consome componentes uma vez, sem gerar um segundo escudo nem zerar o cooldown. Venda retira stats e escudo, sem voltar ouro por porcentagem genérica. Compra direta e fila rejeitam coexistência de itens `annul` (exceto melhoria pela receita).

**Limitações:** ainda não existe uma paridade exaustiva Riot 1:1 de todas as habilidades/efeitos colaterais que deveriam ser bloqueados ou atravessar Anular; interações com vários escudos simultâneos e certas prioridades de habilidades precisam de QA integrado. Essa é a implementação real da passiva no motor disponível, e **não** uma certificação completa da mecânica.

## QA FAST

Testes executados localmente em **Node v22.16.0**, workspace isolado de fonte dev68 e itens PR #7. Não confundir este workspace com checkout completo de `dev69/integration` (que inclui Nami/Vex do PR #6). A integração é responsável pelo CI sobre o SHA remoto do PR e pelo sincronismo do browser.

| Comando | Resultado local |
| --- | --- |
| `node --check engine.mjs` | PASS |
| `node --check tests/v453_dev69_items_batch2.test.mjs` | PASS |
| `node tests/v453_dev69_items_batch2.test.mjs` | **PASS 11/11** |
| `node tests/v453_dev69_items_batch1.test.mjs` | PASS 8/8 |
| `node tests/v453_dev61_shop_undo_pvp.test.mjs` | PASS 22/22 |
| `node tests/v453_dev62_pvp_hud_e2e.test.mjs` | PASS 18/18 |
| `node tests/v453_dev68_lux_projectile_pvp.test.mjs` | PASS 40/40 |
| `npm test` integral | NOT_RUN neste lote (responsabilidade do integrador) |
| Chromium real duas sessões | NOT_RUN; assets binários do remoto pendentes |

A nova suíte inclui teste de regressão de preço/receita/gold.sell, 1 escudo/1 skill, consumo por CC, ataque básico, cooldown/recarga após dano de campeão, melhoria + desconto, unicidade, venda, Desfazer LIFO, saída física irrevogável da fonte, persistência em snapshot, duas sessões PvP, checkpoint, sequência idempotente e rejeição de comandos sobre o inimigo.

**Undo imutável:** sair fisicamente da fonte revoga todo histórico prévio, inclusive após retorno/reconexão; novas operações em visita nova são independentes. Nenhuma alteração no contrato de Undo, skills, HUD global, `version.json`, `engine.browser.js` ou `main`.

## Integração, risco e rollback

Arquivos: `engine.mjs` (somente catálogo/efeitos/loja/combate), `data/riot_reference/sr_shop_26_21_dev49.{json,js}`, `package.json`, `tests/v453_dev69_items_batch2.test.mjs`, e expectativas de catálogo de `tests/v453_dev61_shop_undo_pvp.test.mjs`, `tests/v453_dev62_pvp_hud_e2e.test.mjs`, `tests/v453_dev69_items_batch1.test.mjs`.

**Integrator:** analisar conflito de hunks com skills, rodar `npm run test:v453:dev69:items-batch2` no SHA do PR, `npm run test:v453:dev69:integration` e sincronizar `engine.browser.js` **somente após merge**. Rodar `npm test` integral, browser visual e release gates no marco conjunto. Fazer rollback por `git revert` dos commits do PR, sem force push/reset hard nem edição de main.
