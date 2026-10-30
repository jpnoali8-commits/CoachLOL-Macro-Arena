# CoachLOL Macro Arena — M45 / Chat 3 — B02B-ITEMS Lote 10

**Data:** 2026-10-30. **Branch exclusiva:** `dev69/m45-audit-items`.  
**Status:** `SOURCE_JS_V8_PASS` — **24/24 casos**, **24/24 replays idênticos**. `NODE_ESM_NOT_RUN`, `RUST/WASM_NOT_RUN`, **G8 NOT_CERTIFIED**.

## Source lock e fronteira
O oráculo é a engine legado JavaScript somente leitura de `dev69/items-batch2@182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d`, blob `engine.mjs@e06cfe0c18ded3d21f7a1d9bc62909543ccbbb6d`. Os testes alteram apenas arenas descartáveis e identidades de Ezreal/Nami nas fixtures. Não são QA de lobby real, kits completos, gateway PvP ou Rust.

## Execução real do B10
Os testes invocaram `Arena.snapshotV40()`, `Arena.fromSnapshotV40()`, `checksumV40()`, `castEzrealMysticShotV453Dev42()`, `advanceChampionProjectilesV453Dev42()`, `queueTargetedSkill()`, `resolveTargetedCasts()`, `effectResolverV41().advanceTick()` e `moveAlong()`. Cada cenário tem execução contínua A e execução restaurada B comparadas por checksum integral em cada ponto de controle, validação de invariantes e repetição independente. **12 cenários × azul/vermelho = 24/24 PASS**.

Famílias: Ezreal Q pendente com Nashor; snapshot no meio do voo; intercepção por minion realmente criado; Banshee antes do impacto; bloqueio por barreira criada após o lançamento; ausência de segundo impacto pós-snapshot; Nami W enfileirada com Ídolo/Semblante; Liandry após bounce e ticks; impedir tick duplicado no mesmo segundo; bounce bloqueado por Banshee sem DoT; recarga de Banshee no instante autoritativo após restauração; Dançarina Fantasma + Energizado da RFC preservados ao retomar movimento.

**Observação:** `snapshotV40()` copia o estado do motor e restaura RNG; o teste valida equivalência com o próprio motor fonte, **não** uma garantia de que a implementação Rust já existe.

## Evidências
- `snapshot_replay_b10_cases.mjs`: 12 famílias compartilhadas V8/Node.
- `golden_b10_snapshot_replay.test.mjs`: runner Node ESM com source lock, 24 assertivas de cenário e repetição; **não executado**; `--write` somente após PASS.
- `QA_V8_SNAPSHOT_REPLAY_B10.json`: observações de 24 casos reais no V8, checksums antes/depois, repetição e limites.
- `SNAPSHOT_REPLAY_RUST_CONTRACT_B10.json`: ownership, política de eventos e critérios de paridade Rust.
- `run_items_goldens_b04.mjs`: agregador inclui B10; total **543 candidatos** (519 + 24), Node ainda não executado.

## Requisitos para integração Rust
`core-state`, `core-clock`, `core-skills`, `core-combat`, `core-items` e `core-replay` devem preservar owner, IDs, ordem de eventos, timestamps lógicos e avanço de efeitos. Um snapshot de projétil em voo não pode duplicar dano nem recalcular uma trajetória rastreando alvo futuro. O item Anular e sua recarga, o `nextTick` do Liandry e o Energizado devem persistir exatamente.

O HEAD de `dev69/rust-core-m45` visto na auditoria ainda continha apenas `crates/core-state`, sem crates `core-items` / `core-economy`. **Nenhuma alteração na engine legado, no Rust central ou em branches originais; nenhuma Action, merge, rebase ou force-push.**

## Reproduzir quando Node estiver disponível
```bash
node docs/m45_rust_wasm/inputs/items/golden_b10_snapshot_replay.test.mjs
node docs/m45_rust_wasm/inputs/items/run_items_goldens_b04.mjs
# --write somente após validar as suítes:
node docs/m45_rust_wasm/inputs/items/golden_b10_snapshot_replay.test.mjs --write
```

**Próxima prioridade B11:** selecionar snapshots redigidos por time e replay de servidor na fronteira de comandos PvP; evitar crescimento indefinido de fixtures JS sem implementação Rust das crates.
