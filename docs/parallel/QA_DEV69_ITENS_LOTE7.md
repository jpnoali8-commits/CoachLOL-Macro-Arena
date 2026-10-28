# CoachLOL Macro Arena — DEV69 Items Batch 7 / MID Role Quest

**Branch:** `dev69/items-batch7`. **Base imutável:** Batch 6 `71a0e55edd6aafb790607e5b7e176f6027f96065`. PR obrigatoriamente apontado para `dev69/items-batch6`. **NÃO integrar até pedido explícito do usuário.**

Fonte congelada: Riot PC patch 26.21 / Data Dragon 16.21.1 `data/riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json`. As alterações de missão do MID são baseadas nas notas Riot 26.1 e 26.9 (ver `https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/` e `https://wiki.leagueoflegends.com/en-us/Role_Quests`).

## Completude de entradas do catálogo

O lote incorpora **19 itens normais anteriormente reference_only** e vincula **Alteração Vidente** (`3363`) ao trinket existente `trinket_farsight`, sem duplicar uma segunda cópia no inventário. O snapshot SR passa de 182/20 para **202/202 `engine_playable` e 0 `reference_only`**. Uma entrada `engine_playable` representa efeito de treinamento resolvido no Node; **não** é `certified`, paridade Riot 1:1, navegador ou release.

| Riot ID | Local ID | Família |
|---|---|---|
| 2138 | elixir_of_iron | Consumível, resistência/HP/rastro aproximado |
| 2139 | elixir_of_sorcery | Consumível, AP e dano verdadeiro periódico |
| 2140 | elixir_of_wrath | Consumível, AD/vampirismo físico |
| 2421 | shattered_armguard | Armaguarda de estase já consumida, receita preservada |
| 2517 | endless_hunger | AD, vampirismo/feast e haste derivada |
| 2520 | bastionbreaker | Dano verdadeiro ao acertar skill, Sabotagem |
| 2522 | actualizer | Ativo de mana, dano/habilidades básicos temporários |
| 2525 | protoplasm_harness | Salva-vidas em HP baixo |
| 2526 | whispering_circlet | Acúmulo de mana e evolução condicional para Diadema |
| 3008 | voracious_greaves | Botas T2 com vampirismo por abate |
| 3152 | hextech_rocketbelt | Avanço e dano mágico condicionado a ponto válido |
| 3168 | immortal_journey | Botas T3, somente missão MID |
| 3170 | swift_march | Botas T3, somente missão MID |
| 3171 | scarlet_lucidity | Botas T3, somente missão MID |
| 3172 | war_greaves | Botas T3, somente missão MID |
| 3173 | chained_crushers | Botas T3, somente missão MID |
| 3174 | armored_mobilization | Botas T3, somente missão MID |
| 3175 | enchanted_footwear | Botas T3, somente missão MID |
| 3179 | umbral_glaive | Detecção de sentinelas, dano extra contra ward e abertura |
| 3363 | trinket_farsight | Alteração Vidente, sem duplicar trinket no inventário |

**Item de evolução não comprável adicional:** `diadem_of_songs` (`2530`), somente após a Tiara alcançar o limite de mana.

## Contrato 2026 — missão exclusiva do MID

- **Por campeão com `role==='MID'`**, de cada equipe separadamente; jamais desbloqueio por abates gerais da equipe, compra direta ou outro role.
- Limite de 1350 pontos autoritativos. Minion last hit +2 na MID / +1 fora; dano real a campeões +1,5% ranged / +3% melee; takedown +25; épico +30 para participantes; torre +50 MID / +25 fora por presença real; passivo a partir de 1m05s, 1,5/s na MID / 1 a cada 3s fora (adaptação de lane).
- Ao completar, **substituição automática gratuita** das botas T2 pela T3 equivalente, recalculando os atributos, sem cobrar ouro nem duplicar slot; se ainda não comprou as T2, a evolução ocorre na compra futura. Apenas sete mapeamentos legais.
- `canBuy` proíbe qualquer bota T3, inclusive para o MID após completar a missão; T3 entra somente por evolução gratuita.
- Progresso e completude são serializados no campeão e preservados por checkpoint; `blue_MID` e `red_MID` não compartilham estado.
- **Pendente para certificação de paridade exata:** placas, descontos/anti-roam da quest 26.9, bônus de AD/AP do MID pós-missão, modificadores completos por nível e HUD de progresso. A missão não concede Recall fortalecido na regra 26.21, pois isso foi substituído em 26.9.

## QA e limites do escopo

`npm run test:v453:dev69:items-batch7` verifica 20 entradas, 7 botas, missão MID isolada, compras bloqueadas, elixires, ativos, dano, tempo, snapshot, Undo e ownership. CI FAST também executa B6, B5, B4, B3, Bulk, B2, B1, Dev61/Dev68.

Os efeitos ainda são *adaptadores treináveis* em parte de parâmetros de dano, geometria de ativos/escudos, interações em monstros/torres, rastro visual, porcentagens precisas e evolução por papel. Não declarar status `certified` enquanto existirem essas lacunas. `engine.browser.js` não foi sincronizado pelo especialista; auditor precisa regenerar, reconciliar Skills e rodar full npm test/Chromium PvP duas sessões/rollback.

**Rollback:** `git revert` da cadeia de commits do PR. Nunca force push, reset hard ou merge fora do auditor.
