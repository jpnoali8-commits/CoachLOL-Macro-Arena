# CoachLOL — FAST QA Batch 4: tanque, sustentação e combate prolongado

**Branch:** `dev69/items-batch4` empilhada sobre `dev69/items-batch3` em `e2b91cf9081f344d9c000c008af2705aa805f6cc` (PR #11). **Não integrar ou mesclar agora**: o usuário autorizou somente desenvolver todos os lotes; o auditor integrará sequencialmente após pedido posterior. Base congelada: LoL PC **26.21** / Riot Data Dragon **16.21.1** (`data/riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json`).

## 15 itens SR promovidos de `reference_only` (Riot ID)

| Riot ID | Chave interna | Efeito real programado | Status honesto |
| --- | --- | --- | --- |
| 2502 | `eternal_despair` | Pulso mágico em combate a cada 4s; cura vinculada a dano real | partial — números de treino |
| 3068 | `sunfire_aegis` | Imolar em área após combate, com raio e dano por segundo | partial — escalonamento contra tropas |
| 6664 | `hollow_radiance` | Imolar mágico em área, incluindo HP/regen básicos | partial — explosão por abate pendente |
| 3083 | `warmogs_armor` | +12% HP de outros itens e recuperação após 8s sem dano de campeão se limiar de HP extra atingido | partial — granularidade de regen |
| 3084 | `heartsteel` | Preparação espacial de 3s e dano/progresso de vida por alvo e cooldown | partial — progressão exata Riot |
| 6665 | `jaksho_the_protean` | +30% resistências bônus dos itens após 5s de combate contínuo | partial — base de resistências aproximada |
| 3742 | `dead_mans_plate` | Carga de movimento físico, dano/slow no próximo contato; sem charge parado | partial — modelo de deslocamento |
| 3026 | `guardian_angel` | Dano letal bloqueado uma vez, 4s de estase, reviver com HP/mana; cooldown 300s | partial — tratamento de restauração |
| 6333 | `deaths_dance` | Fração do dano não verdadeiro distribuída em 3 ticks; cura/limpeza após abate | partial — tipos de fonte e quantidades |
| 6657 | `rod_of_ages` | Cresce HP/Mana/AP a cada 60s até 10 cargas, bônus de nível, Eternidade cura/mana | partial — crescimento de nível/estatísticas |
| 3119 | `winters_approach` | Mana acumulada persiste na melhoria da Lágrima, atributo HP derivado e evolução lógica | partial — Fimbulwinter/escudo completo pendentes |
| 3003 | `archangels_staff` | AP derivado da mana adicional + pilhas de Lágrima, evolução lógica | partial — Seraph e escudo ausentes |
| 3004 | `manamune` | AD derivado da mana adicional + pilhas de Lágrima, evolução lógica | partial — Muramana e dano proc ausentes |
| 3073 | `experimental_hexplate` | Ult validada ativa AS e MS por 8s; 30 ultimate haste de atributos | partial — tempos de cast e haste específicos |
| 3161 | `spear_of_shojin` | 25 aceleração de habilidades básicas e stacks até 4 para dano de habilidades | partial — interações de passivas individuais |

**Auditoria econômica:** por cada Riot ID, o teste compara custo, `gold.sell`, receita literal por ID, estado no catálogo, preço pago e venda zero-sum com DDragon 16.21.1. O item 3026 Anjo Guardião tem revenda **1280g**, diferente dos 70% usuais: nunca usar percentual genérico. Todas as 15 entradas foram verificadas pelo ID, inclusive receitas com componentes repetidos. Loja normal no head empilhado: **152 jogáveis / 50 reference_only** = 202. Os 50 continuam não compráveis.

## Arquitetura

- **Registro de famílias:** `ITEM_DEFENSE_RULES_V453_DEV69_B4` no `engine.mjs`, sem módulo ESM/import novo e sem trocar engine Node original.
- **Gatilhos autoritativos:** `advanceDefensiveItemsV453Dev69B4()` no `tick` por segundo; `afterTankHitV453Dev69B4` pós-dano legítimo; `afterTankBasicV453Dev69B4` pós-AA; `onDefensiveTakedownV453Dev69B4` no crédito de abate; interceptação de Guardião após shields; separação de Dança da Morte antes do shield.
- **Estado determinístico:** cooldown, pilhas, limites, revives e fila de dano diferido por campeão, persistidos por `snapshotV40`/replay. Ninguém do time adversário pode disparar ações via compra/venda. Procs `item_*` não alimentam a própria família e eventos não incluem alvo invisível.
- **Economia:** `ITEM_RECIPES`, `ITEM_SELL_VALUES_V453_DEV60`, desconto recursivo por componente, compra, revenda e históricos do Undo intactos. **Sair fisicamente da fonte revoga definitivamente todas as operações antigas**, inclusive retornos/reconexão.
- **Compatibilidade:** Skills Nami/Vex, HUD global, `version.json`, `engine.browser.js` e `main` intocados; o único integrador sincroniza browser depois dos merges.

## QA FAST local

Os resultados são **locais** em Node 22.16.0 sobre workspace textual dev68 com alterações acumuladas de itens. Não são certificação do runtime Chrome nem prova de CI no SHA remoto da branch.

| Comando | Estado local |
| --- | --- |
| `node --check engine.mjs` | PASS |
| `node --check tests/v453_dev69_items_batch4_tank_family.test.mjs` | PASS |
| `node tests/v453_dev69_items_batch4_tank_family.test.mjs` | **24/24 PASS** |
| `node tests/v453_dev69_items_batch3_attack_family.test.mjs` | **19/19 PASS** |
| `node tests/v453_dev69_items_bulk_18.test.mjs` | **23/23 PASS** |
| `node tests/v453_dev69_items_batch2.test.mjs` | **11/11 PASS** |
| `node tests/v453_dev69_items_batch1.test.mjs` | **8/8 PASS** |
| dev61 loja/Undo, dev62 PvP, dev64 PvP reações, dev68 Lux Q | **22/22; 18/18; 26/26; 40/40 PASS** |
| `npm test` integral e Chromium PvP duas sessões | NOT_RUN, reservados ao auditor |

### Gates pendentes

- **Não certificar** transformações Fimbulwinter/Seraph/Muramana; atualmente registram estado de evolução e atributos, não realizam todos os efeitos de suas formas finais. O novo pacote seguinte ou um lote especializado deverá concluir esses contratos antes da integração certificada.
- Aura de explosão do Resplendor, duração exata do Jak'Sho em fontes mistas, quantização da Hidra preexistente e dano diferido sobre imunidades/efeitos de morte precisam de auditoria de interações.
- Revalidar `engine.browser.js` após integração sequencial, `npm run test:v453:dev69:integration`, `npm test`, HTTP/SSE duas sessões reais, fog e Undo, assets binários Issue #1, Nexus natural e ZIP CRC/SHA antes de tocar `main`.

**Rollback:** `git revert` dos commits do PR Batch 4, não usar reset hard/force push/rebase destrutivo. Cadeia em [STACKED_ITEMS_DEV69.md](STACKED_ITEMS_DEV69.md).