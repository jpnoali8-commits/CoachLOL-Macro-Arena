# M45 — Inventário preliminar, reconciliação de branches e matriz de migração

**Status: levantamento inicial por GitHub tree, NÃO é inventário de métodos/identidades completo.**
Conferido em 2026-10-30. O trabalho B02 deve gerar artefato automático de inventário preciso com símbolos, contratos, comportamentos, testes, side effects e hashes.

## 1. Fontes não intercambiáveis

| Fonte | HEAD conferido | engine.mjs bytes (GitHub tree) | Por que importa |
|---|---|---:|---|
| dev69/integration | 374d87d5f49b52514ec68bbe666df086363c1ec5 | 459085 | autoridade JS PvP/servidor de integração; estado após PR #6/#7 |
| dev69/skills-batch2 | f0b1147ac46e585a1d5374a178b1ea462f5dc278 | 1117512 | centenas de extensões e casos autorais M44, testes /audit; PR #9 Draft |
| dev69/items-batch2 | 182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d | 477933 | extensões de catálogo/efeitos/receitas; trabalho ainda não integrado |
| dev69/rust-core-m45 | 7d344d2fac16b05a6e81c8984e38ce6ad2c907c3 (B01) | JS base sem alteração | primeiro crate Rust e golden; PR #19 Draft |

**ATENÇÃO:** diferir em número de bytes NÃO prova que o conteúdo maior é mais correto. Não substituir engine.mjs inteiro por engine.mjs de outra branch. Extração/migração depende de teste, proveniência, side effects e compatibilidade.

## 2. Código legado concreto identificado

| Domínio | Arquivos/símbolos para audit trail | Alvo Rust |
|---|---|---|
| engine monolítica | engine.mjs (integração + skills + itens), engine.browser.js gerado por tools/sync_browser_v43.py | todos os core-*; eliminar gameplay browser |
| input/ACL | multiplayer/authoritative_actions_v453_dev44.mjs, variante dev47, funções dispatch; seats e request validation | core-protocol + game-server |
| transporte e salas | multiplayer/server_v453_dev47.mjs; room_v453_dev47.mjs; pvp_client_v453_dev47.js | game-server (native), UI client transport |
| comandos | commands.mjs / commands.browser.js, aliases, planos/voz/parse PT-BR | core-commands; UI input text/voice |
| interface | app.js, index.html, multiplayer.html, draft.js, postgame.js, styles*.css | apps/web-ui / apresentação TS+HTML/CSS |
| catalog/assets | data/riot_reference/, data/patch_center/, data/rift_bundles/, version.json | data/patches validated + game-core registries |
| economia e undo | engine.mjs + testes dev60–61, shop UI dev62 | core-economy + core-items + game-server |
| fog e perspectiva | engine.mjs + multiplayer tests dev46 | core-map + core-protocol |
| habilidades especiais | engine.mjs da skills branch, tests/audit M44; executores e estados legados | core-champions + core-combat/core-map |
| teste autoritativo | tests/v40_authority_replay.test.mjs; dev44–47; dev63–68; 103+ testes audit no skills branch | tests/golden + native Rust + network 2 seats |
| assets/QA remoto | docs/parallel/STATUS_DEV69.md; Issue #1 e inventário assets | binários íntegros, manifests/hashes, visual/browser E2E |

## 3. Matriz obrigatória — definir por item, NÃO por campeão apenas

Criar arquivo gerado de progresso (CSV/JSON) com campos:

~~~text
domain,feature_id,legacy_source_branch,source_commit,source_symbol,
legacy_status,source_test_ids,golden_fixture_ids,
rust_crate,rust_symbol,rust_status,native_test_ids,wasm_test_ids,
network_test_ids,blue_red_test_ids,snapshot_hash_status,
ownership_fog_status,release_status,blocker,source_patch,notes
~~~

Estados válidos:
- SOURCE_ONLY: presente em JS, não migrado.
- REFERENCE_ONLY: só descrição/dados, não simulável.
- PARTIAL: comportamento parcial com limite explícito.
- MIGRATED_UNVERIFIED: Rust implementado, mas compilação/equivalência ou segurança falta.
- PARITY_VERIFIED: golden e semântica compatíveis nas entradas do fixture; NÃO implica end-to-end.
- END_TO_END_VERIFIED: servidor 2 jogadores, visão e browser passaram para o recurso.
- CERTIFIED: gates globais/verificação por patch concluídos.
- BLOCKED: impedimento concreto e owner identificado.

"Implementado" e "certificado" não são sinônimos. QA anterior de M44 na engine JS não transforma automaticamente skills em Rust.

## 4. Checklist de cobertura — sem lacunas por fronteira

- Core game loop/turns/round clock: duas confirmações, timeout/reconnect, pause, tempo, seed, player five-control, gank reactions.
- Moves/pathfinding/collision: mapas, spawn, blockers, terrain, minions/walls, geometry, dynamic rift, teleport/blast cone.
- Visibility: fog, wards, pink, oracle, stealth/camouflage, clones, scryers, snapshot team-filters, spectator/match end.
- Combat: attacks, kite, windup, target/LOS, damage/armor/MR, shields/heal, CC/interruption, projectiles, buffs/debuffs, death/respawn.
- Skill registry: passive + QWER for all **existing coded** champions, forms, empowered/recasts/charged skills, future copy systems.
- Items: item catalog statuses, stats, recipes, actives/passives, proc, sell/undo/inventory/stack/cooldown, special support/jungle.
- Summoners/runes/trinkets: D/F, Smite/jungle mission, runes only at champ select, wards and cooldown.
- Economy: gold/CS/XP/levels/rank QWER, last hit, freeze, recall/shopping, fountain-only Undo.
- Jungle and structures: dragon/soul/elder, Baron, Herald, voidgrubs, camps, towers/inhibitors/Nexus.
- Commands: text/voice parser, aliases/gírias PT-BR, persistent orders, order queue, Enter preview/commit, invalid intent.
- PvP platform: server rooms, seat/owner, validation, receipts, network, resync/reconnect, postgame, version/assets.
- UI integration: champ select, tactical orders, combos, shop, HUD, fog/scryers/plants, 16:9 board, endgame, fallback icons.
- QA/ops: replays, saves/migrations, checksum, multi-seed duration, assets and license, deployment/rollback.

## 5. Auditoria cruzada e preservação

1. Comparar integração VS skills VS itens pelo Git diff e AST/símbolos; listar métodos/contratos que só existem em uma branch.
2. Referência de métodos/range/effects não se confunde com valor oficial do patch; coletar referência documentada.
3. Criar fixtures do JS **da branch de origem** para cada método, com SHA da fonte, não usar resultado do JS base para recurso que nela não existe.
4. Fixar fixture: seed, serialized before, actor/team, plan/cast, elapsed ticks, after, events, checksum e player-visible view.
5. Marcar cada teste legado: keep / port / improve / obsolete-with-reason. Não remover um teste antigo só porque Rust tem outro formato.
6. Para arrays de skills/itens: registrar duplicates, mismatch IDs, item reference-only, no-op spells, fallback indevido e efeitos de dupla aplicação.
7. Gerar relatório de cobertura diferencial por branch, 100% de recursos existentes catalogados; nenhum arquivo histórico excluído sem decisão.
8. Só então iniciar migração de macro e casos especiais. O B02 produz primeiro inventário automatizado e um recibo de cobertura de símbolos.

## 6. Pendências reconhecidas

- Assets binários: 78 de execução não publicados no remoto, Issue #1; ZIP mestre e hashes na Biblioteca. A migração de lógica pode andar, release não.
- Rust B01: crate/fixture/adapter commitados, JS golden executado (21/21); cargo native, build wasm32 e browser WASM não executados. NÃO certificado.
- B33B: blobs não commitados de experimento anterior; não constam no HEAD de skills e NÃO podem ser considerados cobertura preservada sem reconstrução aprovada.
- Em 2026-10-30 nenhuma matriz universal dos recursos existentes foi auditada; números de kits completos NÃO devem ser inferidos.
