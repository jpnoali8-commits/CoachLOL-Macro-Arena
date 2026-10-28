# Auditoria de conteúdo — CoachLOL V4.5.2d-4-dev19

Data auditada em 27/10/2026. Referência: LoL PC **26.21**, Data Dragon **16.21.1**. **O catálogo externo completo não foi obtido nesta execução; nenhuma contagem de todos os campeões/itens da Riot foi inventada.**

## Cobertura real da build entregue

| Medida | Quantidade |
|---|---:|
| Campeões selecionáveis na build | **14** |
| Campeões com base auditada | **5** |
| Campeões com crescimento auditado | **5** |
| Campeões com tabela 1–18 auditada | **5** |
| Manifestos parciais/data-only | **5** |
| Kits completos certificados | **0** |
| Itens locais cadastrados | **41** |
| Itens com stats básicos auditados | **9** |
| Itens completos, receitas + passivos + ativos certificados | **0** |
| Runas-chave protótipos | **3** |

## Por campeão local

| Campeão | Base | Crescimento | Passiva | Q/W/E/R cadastrados | Kit completo |
|---|---|---|---|---|---|
| Ahri | Auditada | Auditado | planned | Q:generic_training_fallback, W:generic_training_fallback, E:generic_training_fallback, R:generic_training_fallback | NÃO |
| Caitlyn | Fallback de classe | Fallback | missing | Q:generic_training_fallback, W:generic_training_fallback, E:generic_training_fallback, R:generic_training_fallback | NÃO |
| Darius | Fallback de classe | Fallback | missing | Q:generic_training_fallback, W:generic_training_fallback, E:generic_training_fallback, R:generic_training_fallback | NÃO |
| Jinx | Auditada | Auditado | planned | Q:generic_training_fallback, W:generic_training_fallback, E:generic_training_fallback, R:generic_training_fallback | NÃO |
| KSante | Fallback de classe | Fallback | missing | Q:generic_training_fallback, W:generic_training_fallback, E:generic_training_fallback, R:generic_training_fallback | NÃO |
| LeeSin | Fallback de classe | Fallback | missing | Q:generic_training_fallback, W:generic_training_fallback, E:generic_training_fallback, R:generic_training_fallback | NÃO |
| Leona | Fallback de classe | Fallback | missing | Q:generic_training_fallback, W:generic_training_fallback, E:generic_training_fallback, R:generic_training_fallback | NÃO |
| Lux | Auditada | Auditado | planned | Q:prototype, W:planned, E:prototype, R:legacy_adapter | NÃO |
| Nami | Auditada | Auditado | planned | Q:prototype, W:legacy_adapter, E:planned, R:legacy_adapter | NÃO |
| Udyr | Fallback de classe | Fallback | missing | Q:generic_training_fallback, W:generic_training_fallback, E:generic_training_fallback, R:generic_training_fallback | NÃO |
| Vayne | Fallback de classe | Fallback | missing | Q:generic_training_fallback, W:generic_training_fallback, E:generic_training_fallback, R:generic_training_fallback | NÃO |
| Vex | Auditada | Auditado | planned | Q:training, W:training, E:training, R:prototype | NÃO |
| Volibear | Fallback de classe | Fallback | missing | Q:generic_training_fallback, W:generic_training_fallback, E:generic_training_fallback, R:generic_training_fallback | NÃO |
| Warwick | Fallback de classe | Fallback | missing | Q:generic_training_fallback, W:generic_training_fallback, E:generic_training_fallback, R:generic_training_fallback | NÃO |

## Lacunas críticas

### Nidalee — NOT_REGISTERED

- R human-cougar form toggle
- QWER separate forms
- hunted target mark
- cooldowns per form
- combo transitions and fog

### Elise — NOT_REGISTERED

- human-spider R
- QWER distinct
- spiderlings
- Rappel untargetable range and landing
- shared/independent cooldown transitions

### Shyvana — NOT_REGISTERED

- Fury resource
- dragon form via R
- QWER dragon variants
- form expiry and temporary movement

### Mordekaiser — NOT_REGISTERED

- 7s isolated 1v1 realm
- targets/collision/visibility scoped by realm
- bounded arena
- death/dispel cleanup
- stat steal
- snapshot/replay

### other_transforms — NOT_AUDITED

- Jayce
- Nidalee
- Elise
- Gnar
- Kayn
- Kled
- Aphelios
- Udyr
- Viego
- Neeko and others demand kit-specific state machines

### item_passive_active — PARTIAL

- item recipes/costs from versioned reference
- item stats applied by runtime
- trigger/target/CD/charges/damage/effect resolver for every active/passive

### champion_base_stats_1_18 — PARTIAL

- stat growth per champion/resource
- AS ratio/bonus and range
- hp/mana regeneration
- champion-specific transforms or growth passives

### full_game_long_match — NOT_CERTIFIED

- non-scripted 20–40 min match
- objectives/teamfights/win condition
- endgame/fog/replay

## Referência oficial e limitações

- Developer Portal / Data Dragon: https://developer.riotgames.com/docs/lol
- Patch 26.21: https://www.leagueoflegends.com/en-ph/news/game-updates/league-of-legends-patch-26-21-notes/
- `data/coverage_audit_v452d4_dev19.json` contém todas as classificações legíveis por máquina.
- O importador `tools/import_riot_reference_v452d4_dev19.mjs` só gera **referência** com bases/crescimento nível 1–18 e dados/receitas de itens. Dados Riot completos ainda precisam ser obtidos externamente.
- Passivas/ativos, estados alternativos, stats de transformações e exceções de cast só se tornam gameplay mediante código testado; tooltips não bastam.
- Referência externa e conteúdo da Riot sujeitos às respectivas políticas/licenças; os SVGs originais CC0 são um pacote separado.
