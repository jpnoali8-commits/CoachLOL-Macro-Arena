# CoachLOL M45 B02B-I03 — Nami W legacy ghost-cast P0, source-pinned V8 witness

**Data:** 2026-10-30. **Rust branch:** `dev69/rust-core-m45`, PR #19 Draft, START_HEAD `73cade4632598fbe62bb3cf5034f61cf91dd403a`. **Mode:** MIGRATION_ONLY, **GitHub Actions iniciadas deliberadamente: 0**.

## Fonte imutável
- Skills `f0b1147ac46e585a1d5374a178b1ea462f5dc278`, `engine.mjs` blob `41679f7328a42e379fdfb8de5b92006e1bfb529f`.
- `data/coachlol_map_v6.json` blob `ad853bbb6f110c0d2b6b8b4995ac4e80169f7109`.
- `data/masks_128.json` blob `ecddcee76f3bce20a483ff7545ce2231696270e2`.
- Audit source `dev69/m45-audit-skills@e1210e1d2e75bd172ef73a50af79d04193a4de6d`; `golden_plan.json` blob `98bbc1c66cce8d6d0d52f3c75975ad8a8515a4bc` (26 suites pinadas; 0 full Node executadas). S09 test `eec3732e024fbee3517041d9f92f9862d01e5ad2`.

## Execução REAL (isolated V8)
- O motor legacy completo foi obtido por GitHub conector, removendo só `export` top-level do texto antes de compilar em V8; `new Arena`, filas/resolvers originais, snapshot/checksum/restore originais invocados. Mapa/máscara fonte real. Pré-configuração: Nami MID rank W1, 500 mana, aliado TOP HP400, coord próximas, `visible()=true` e `duelPermission()=true` para isolar dispatch (não representa fog/duelo integral).
- **8/8 PASS de confirmação do legado:** 2 times × `targeted_only`, `board_only`, `targeted_then_board`, `board_then_targeted`. As duas rotas isoladas, ambos times (**4/4 controles**) consomem uma W e não mantêm pending. As rotas simultâneas, ambos times (**4/4 com ghost**) aceitam as duas ordens, Board usa 70 mana e cura 75 HP; targeted bloqueado por CD fica pendente. Ao posicionar tempo simulado após CD (t=10.25), targeted pendente usa outros 70 mana/cura 115 HP **sem novo request**. Valores: `mana 500→430→360`, `ally hp 400→475→590`. Owner adversário negado por ambos métodos.
- **Reexecução independente:** novamente mesma engine/fixture, **8/8** cenários reproduzem checksums before/first/final e todos deltas/ACL sem divergências. `Arena.fromSnapshotV40(...).snapshotV40()` mantém `checksumV40` em todos 8. Validador puro `validate_nami_w_witness.mjs` passa **8/8** e rejeita alteração proposital de mana no controle.
- Controle de fidelidade: targeted-only W cura **115 HP** vs board-only **75 HP**. Portanto não fundir as duas rotas silenciosamente ao migrar.
- `B02B_NAMI_W_V8_EXECUTED.json` blob **`06d36ff35a4bc44f45c6a1806f947833b1a2a14b`** registra 8 seeds/checksums/efeitos. `validate_nami_w_witness.mjs` blob **`4692fb2e2352cda3b76c745ea9842aa23f512ba0`**. Quatro testes Node de recepção (`tests/audit/m45_b02b_nami_w_receipt.test.mjs`) **PREPARADOS, NODE NOT_RUN**, não confundir com V8 executado.

## Estado e contrato Rust
- **P0 comprovado sob filas API diretas e visibilidade mockada.** Não prova que cliente/UI permite enfileiramento concorrente em partida comum; não é E2E Node, nem simulação de fog real, nem paridade Rust/WASM.
- FUTURO `core-protocol`/`core-champions`: owner autenticado; `match/round/seat/unit/slot/request_id` unitário, atomicidade da escolha de executor, ACK idempotente; uma transação de dano/cura/mana/CD por request W aceito, invalidar outra rota pendente, permitir nova W após CD somente com novo request válido; preservar recasts autorais de outras skills, nunca executar W após CD sem nova ordem. Preservar expected failure do legado num golden e exigir PASS de correção Rust (não replicar defeito).
- `G0 PARTIAL`, `G1 PARTIAL` (somente B01 core-state Rust/WASM), `G2–G6 NOT_RUN` Rust combat, `G7 BLOCKED`, `G8 NOT_RUN`. **B02B ainda IN_PROGRESS**; 26 suítes fonte Node ESM NOT_RUN; HTTP/SSE, UI reachability e cenário de dois clientes NOT_RUN. B03 QUEUED.
- **Quota:** nenhum gatilho Rust, workflow ou arquivo `qa/trigger_b02a5.txt` alterado; guard existente nos três workflows legados deve resultar em `skipped` após commit. Sem merge/rebase/force-push.
- **Rollback:** git revert do commit B02B-I03 na branch Rust, sem alterar `dev69/skills-batch2`.
