# CoachLOL Macro Arena — M45 B02B-ITEMS Lote 07

**Data:** 2026-10-30  
**Status:** `SOURCE_JS_V8_CROSS_ITEMS_PASS`; `NODE_ESM_NOT_RUN`; `RUST_NATIVE/WASM_NOT_RUN`; **G8 NOT_CERTIFIED**.  
**Branch exclusiva de escrita:** `dev69/m45-audit-items`.  
**Fonte itens (somente leitura):** `dev69/items-batch2@182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d`.  
**Motor original:** `engine.mjs`, Git blob `e06cfe0c18ded3d21f7a1d9bc62909543ccbbb6d`; mapa `ad853bbb6f110c0d2b6b8b4995ac4e80169f7109`; máscaras `ecddcee76f3bce20a483ff7545ce2231696270e2`.  
**Integração somente leitura:** `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`.  
**Rust central consultado:** `dev69/rust-core-m45@73cade4632598fbe62bb3cf5034f61cf91dd403a`. Árvore Rust ainda com `crates/core-state`; `core-economy` e `core-items` **ausentes**.

## Trabalho efetivamente realizado

1. **`cross_items_b07_cases.mjs`**: módulo puro JS, só testes. Exporta `runCrossItemsB07({Arena,map,mask,checksumV40})`, sem dependências Node. Tem **23 cenários autorais** executados para **blue/red = 46 casos**. O módulo não cria itens, não muda a engine e não implementa regras novas.
2. **`QA_V8_CROSS_ITEMS_B07.json`**: execução real do `Arena` congelado em V8 após remover, exclusivamente em memória, os tokens ESM `export`, mais as funções dos **mesmos casos versionados**. **46/46 casos PASS** e uma segunda execução da matriz produziu **46/46 casos/observações/checksums iguais**. O relatório contém IDs, seeds, time, efeitos e checksums V40 em cada caso.
3. **`golden_b07_cross_items.test.mjs`**: runner Node ESM, com `assertFrozenSourcesB03({shop:true})`, 23 cenários × 2 times, ASSERT 46/46, repetição integral, `--write` protegido por asserts. **Não executado por Node** nesta sessão.
4. **`run_items_goldens_b04.mjs`**: agregador fail-closed B01–B07 atualizado para **437 casos planejados**. Essa contagem não significa execução Node ou equivalência Rust.
5. **`EFFECT_CROSS_COVERAGE_B07.json`**: registro de **66 regras** (51 `ITEM_EFFECTS_V43` + 15 `ITEM_FAMILY_RULES_V453_DEV69`). O código B07 executado contém **34 IDs distintos** dessas regras (27 de `ITEM_EFFECTS`, sete de `ITEM_FAMILY_RULES`). **22 IDs** não aparecem nos cenários B03/B03B/B07, sem implicar que não tenham sido testados em outras suítes legadas. Nenhum item foi promovido para `RUST_IMPLEMENTED`.
6. **`ITEM_COMBAT_ORDER_CONTRACT_B07.json`**: proposta para Chat 1 com nove estágios da resolução de hit/proc/escudo, dados para DTO, cinco classes de risco e interações exigindo proteção contra recursão. **Proposta, não crate Rust compilado.**

## Conteúdo da matriz B07 (23 × 2)

| Faixa | Interações |
|---|---|
| Anticura e DoT | Morello + Liandry; Executora + Cutelo; Rylai + Cinzas |
| Bloqueios e proteção | Banshee contra Liandry/Bloodletter; Banshee contra Alternador; Kaenic + Banshee; Hexdrinker contra Shadowflame |
| Dano refletido / armaduras | Bramble + Alternador; Thornmail + Lembrete Mortal; Aço Placado + Warden |
| On-hit e recarga | Guinsoo + Nashor + Recurva; Kraken + Guinsoo; Guinsoo + Navori; Balestra/Alternador com recargas independentes; Wit's End + Nashor |
| Amplificadores / temporais | Riftmaker + Liandry (DoT não avança combate); Bloodletter + Abyssal; Black Cleaver + Serylda |
| Itens ativos / controle | QSS contra Rylai; Mercurial remove root, aplica sprint e cooldown |
| Stats / economia cruzada | Rabadon + Dark Seal; Dark Seal → Mejai com stacks; Tear + Catalyst, mana durante spell |

Todos os cenários acima foram executados no motor JS original e espelhados nas duas equipes. Os predicados não cobrem todos os parâmetros oficiais de cada item, nem a totalidade das combinações com habilidades QWER, campeões, objetivos e mundo.

## QA reproduzível / proveniência

- `cross_items_b07_cases.mjs` blob Git **`e0268332ceac07edcf4ec408b43672e98e50644d`**.
- **46 casos / 46 PASS no V8**, 23 por equipe. Sem falhas ou `BLOCKED`.
- Repetição do mesmo módulo do GitHub, seeds/partidas isoladas: **46/46 registros idênticos**. O segundo ciclo é replay de teste; não é `core-replay` Rust.
- O código carregado para os testes foi o `Arena` realmente definido na engine original, sem mock do método `damage` ou das passivas.
- O runner Node ESM existe mas **NOT_RUN**. `PvPRoomRegistry`/HTTP, browser e cargo/WASM não foram invocados.
- **G0 PARTIAL; G1 NOT_RUN; G2/G3/G6 PARTIAL_SOURCE_JS_ONLY; G8 NOT_CERTIFIED**.
- Histórico de Lotes B01–B06: **391 casos candidatos**; B07 acrescenta 46: **437**. Os 299 + 92 + 46 foram executados como matrizes de lógica JS em V8, com controles e limitações documentados nos recibos individuais. Há rejeições esperadas que confirmam o defeito P1 de gateway trinket, não testes de funcionalidade aprovada.

## Dependências e próximos riscos

**Matriz não coberta B03/B07:** `dorans_ring`, `cull`, `health_potion`, `refillable_potion`, `seekers_armguard`, `swifties`, `lord_dominiks_regards`, `phage`, `phantom_dancer`, `sheen`, `spirit_visage`, `trinity_force`, `rapid_firecannon`, `frozen_heart`, `forbidden_idol`, `youmuus_ghostblade`, `randuins_omen`, `haunting_guise`, `lost_chapter`, `oblivion_orb`, `blighting_jewel` e `bamis_cinder`. Isso é ausência **nesta matriz**, e não ausência na engine.

- A Riot Data Dragon 16.21.1 + loja SR 26.21 continua como fonte de referência de preços/receitas, não de execução de todos os efeitos.
- O gateway PvP legado continua sem `item.trinket`, já reproduzido e registrado em B04–B06 (P1).
- Para Rust: `core-combat` deve expor uma cadeia ordenada de impactos e procs tipados, com sourceType, exceções de spellshield, absorção de escudo por tipo, cooldown e prevenção de recursão; `core-items` deve mapear somente IDs canônicos e efeitos realmente migrados; `core-economy` deve manter transações, estoque/receitas e Undo por visita. **Não implementar interfaces antes dos contratos oficiais de Chat 1**.
- Next: **M45 B02B-ITEMS B08** deve priorizar os 22 IDs ausentes B03/B07 em grupos verificáveis e interações QWER × itens. Não usar Actions para repetir suítes pequenas ou reabrir produção JavaScript.

## Reprodução no checkout real (quando disponível)

```bash
git switch dev69/m45-audit-items
node docs/m45_rust_wasm/inputs/items/golden_b07_cross_items.test.mjs
node docs/m45_rust_wasm/inputs/items/run_items_goldens_b04.mjs
# O runner só grava após passar todos os checks:
node docs/m45_rust_wasm/inputs/items/run_items_goldens_b04.mjs --write
```

**Não fez merge, rebase, force-push, GitHub Actions ou Codespaces. Não alterou `engine.mjs`, integration, items-batch2 nem Rust core central.**
