# CoachLOL Macro Arena — M45 / Chat 3 — B02B-ITEMS Lote 08

**Data:** 2026-10-30  
**Branch de escrita exclusiva:** `dev69/m45-audit-items`  
**Origem congelada:** `dev69/items-batch2@182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d`  
**Engine `engine.mjs` SHA:** `e06cfe0c18ded3d21f7a1d9bc62909543ccbbb6d`  
**Branch integração (somente leitura):** `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`

## Objetivo e resultado

O B07 deixou **22 IDs de efeito sem referência nas matrizes B03/B07**. No B08 foram executados **44 cenários fonte JS/V8** (22 efeitos × duas equipes) para esses IDs, mais **8 cenários** de interações entre o gate de uma habilidade e o resolvedor de impacto de item (4 × duas equipes).

- **44/44** testes de itens produziram os resultados esperados.
- **8/8** testes de habilidade/itens produziram os resultados esperados.
- **52/52** casos novamente executados com as mesmas seeds resultaram em **registros idênticos**, incluindo checksums `checksumV40(snapshotV40())`.
- **Primeira pré-execução:** 40/44 PASS e quatro assertions inicialmente FAIL. Erros pertenciam à fixture: Dominik exige vida bônus de equipamento (não maxHp arbitrário) e Ídolo Proibido requer alvo **aliado** para amplificar escudo. Os controles foram corrigidos e a matriz completa executada novamente. Nenhum resultado da primeira execução foi falsamente marcado PASS.
- **Nenhuma alteração de gameplay em JavaScript ou Rust.**

## Casos de efeito agora observados no legado — 22 × blue/red

| Grupo | IDs de itens |
|---|---|
| Regeneração, consumíveis, estase | `dorans_ring`, `cull`, `health_potion`, `refillable_potion`, `seekers_armguard` |
| Movimento, armaduras e defesa | `swifties`, `phage`, `phantom_dancer`, `frozen_heart`, `spirit_visage` |
| Dano, alcance, amplificadores | `lord_dominiks_regards`, `sheen`, `trinity_force`, `rapid_firecannon`, `haunting_guise`, `blighting_jewel` |
| Controle, itens ativos e suporte | `forbidden_idol`, `youmuus_ghostblade`, `randuins_omen` |
| Mana, anticurâneos, aura | `lost_chapter`, `oblivion_orb`, `bamis_cinder` |

Os casos usam as regras reais `Arena` para compra, dano, cura, escudo, cooldown, projecções de movimento, regeneração, ativação dos itens e snapshots. Os testes não cobrem todos os parâmetros e casos possíveis. Em especial, a prova atual de `phantom_dancer` valida o **seletor de bypass** da colisão; não garante ainda colisão real simultânea de tropas e paredes.

## Integração com habilidades — 4 × blue/red

O `skill_item_action_gate_b08_cases.mjs` invoca **`Arena.performActionV40`** com `kind:'skill'` e `Q`/`W` aprendido, e usa o resolvedor de dano separado para verificar:

1. Q habilita `sheen`; um ataque básico consome a preparação do Spellblade;
2. W habilita `trinity_force`, mas uma segunda invocação duplicada no mesmo tick é rejeitada;
3. Q legal seguida de impacto mágico do tipo `spell` aumenta as cargas de `tear_of_the_goddess`;
4. um spell shield de `banshees_veil` bloqueia dano mágico modelado e o efeito de `fated_ashes`, enquanto um impacto posterior sem escudo aplica o burn.

**Limite crucial:** estes testes integram a autorização de cast do motor à classificação de impacto e não são ensaios completos de skills/passivas QWER, projéteis, mira, visão, combos, cliente ou servidor HTTP. Os nomes dos testes e o QA tornam explícito esse escopo.

## Artefatos e status de QA

- `legacy_effect_gaps_b08_cases.mjs` — módulo de 22 cenários de efeitos, sem importações Node; SHA de blob Git `a0e1682dc53816aa1d799ddc683492db7b8cbd24`.
- `skill_item_action_gate_b08_cases.mjs` — 4 cenários de skill/item; SHA de blob `90eb9d9b5112303c5ec265e08519df56028abf97`.
- `golden_b08_effects_and_actions.test.mjs` — runner Node ESM com source lock, assertions e `--write` somente após testes aprovados; SHA de blob `32bb03510d8969f9b46c20471db977db713c759a`; **NOT_RUN como Node ESM**.
- `QA_V8_EFFECT_GAPS_B08.json` — execução de V8 com **52/52 PASS**, 52/52 repetições, dados por caso, seed, resultados e checksum, e pré-execução corrigida.
- `REGISTRY_COVERAGE_B08.json` — matriz de **66 entradas** (`ITEM_EFFECTS_V43`: 51; `ITEM_FAMILY_RULES_V453_DEV69`: 15), cada uma com alguma referência nas matrizes B03/B07/B08; **zero coberturas plenamente certificadas** e **zero migradas para Rust**.
- `run_items_goldens_b04.mjs` — atualizado para rodar B01–B08 em checkout íntegro, em sequência fail-closed. Total **489 casos candidatos**. O runner de Node ainda **não foi executado**.

### QA real e limites

A engine foi obtida do conector GitHub, avaliando o código real em V8 após remover em memória somente os tokens de `export` ESM; executou as duas funções puras versionadas B08 com o mapa/máscaras congelados. Não houve mocks das funções de gameplay.

| Gate | Resultado |
|---|---|
| JS/V8 source — B08 | **52/52 PASS** |
| Repetição V8 dos mesmos casos | **52/52 equivalentes** |
| Inventário dos 66 IDs `ITEM_EFFECTS` e `ITEM_FAMILY_RULES` | **66/66 mapeados a alguma evidência parcial** |
| Node ESM (goldens com `import`, `node:fs`, source lock) | NOT_RUN |
| Testes integrados de kits QWER | NOT_RUN |
| Testes reais PvP/HTTP/room | NOT_RUN |
| Rust `cargo`/native/WASM | NOT_RUN |
| G8 release final | **NOT_CERTIFIED** |

**Acumulado B01–B08:** 437 casos anteriores + 52 novos = **489 cenários representados em matrizes executadas via V8**. Dentro do conjunto anterior há **duas rejeições esperadas que comprovam a lacuna P1 de troca de trinket no gateway PvP**, e não funcionalidade aprovada. A contagem não é promessa de cobertura exaustiva nem certificação integral.

## Handoff para o coordenador Chat 1

- Reconhecer B08 como **input de testes de paridade legado**, nunca como implementação Rust. Como `core-items`, `core-economy` e `core-combat` ainda não têm contratos publicados e crates aprovados, **não criar uma segunda engine paralela**.
- Na fila de migração, garantir a ordem autoritativa entre gate de skill → dano primário → proteções → dano líquido → efeitos de itens → procs derivados, bloqueando recursão indevida e registrando cooldowns, shields e stacks de forma determinística.
- Transferir as fixtures B08 para testes nativos/WASM quando houver os crates. Exigir cobertura equivalente para cada equipe, snapshots e ações de servidor, além de números do catálogo oficial quando necessário.
- **Risco em aberto**: combos QWER reais e distância/visibilidade, colisões de tropas com `phantom_dancer`, status especiais, magnitudes oficiais, dois jogadores em rede, e **P1 trinket** identificado no B04.
- Preservar regra de **não executar GitHub Actions** rotineiramente devido à cota. Nenhum Actions, Codespaces, merge, rebase, force-push ou alteração de engine/branches centrais ocorreu.

### Comando, quando checkout estiver disponível

```sh
git switch dev69/m45-audit-items
node docs/m45_rust_wasm/inputs/items/golden_b08_effects_and_actions.test.mjs
node docs/m45_rust_wasm/inputs/items/run_items_goldens_b04.mjs
# Somente após validar todo o conjunto:
node docs/m45_rust_wasm/inputs/items/run_items_goldens_b04.mjs --write
```

**Próxima prioridade B09:** verificar colisão real Phantom Dancer, impactos QWER com disparos efetivos e interação de itens, ampliar testes de rede e, quando os crates estiverem prontos, iniciar paridade Rust de habilidades e economia com contratos únicos.
