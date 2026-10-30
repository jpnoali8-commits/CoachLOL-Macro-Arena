# M45 — Fila operacional sequencial ("próxima prioridade")

**Como ler:** EXECUTAR primeiro item com status READY e dependências satisfeitas. Se a etapa tiver BLOCKED, remover o bloqueio é a prioridade. Os Bxx são macro-pacotes, podem exigir sublotes BxxA/BxxB sem alterar ordem. Atualizar STATUS_LEDGER.md + matriz por feature a cada commit. NÃO implementar skills inéditas até G8.

| ID | Status inicial | Pré-requisito | Ação concreta e critério de conclusão |
|---|---|---|---|
| B01 | IMPLEMENTED_UNVERIFIED | integration | Criar Rust core-state + WASM interface pública + fixtures JS. 21/21 JS; falta G1 |
| **B02** | **READY** | B01 | Verificar cargo/rustc/wasm target; compilar/testar B01 nativo/WASM; inventariar três árvores/AST, exports, efeitos, comandos, testes; congelar goldens por SHA sem perder conteúdo |
| B03 | QUEUED | B02 G0 parcial, G1 base | Formalizar schema JSON/serde/version, numeric/time/rng policy; gerar golden test harness de replay e matriz máquina legível |
| B04 | QUEUED | B03 | Implementar core-protocol + core-clock: canonical action, team seat, simultaneous seal, tick, ACK e recibo Rust |
| B05 | QUEUED | B04 | core-replay: replay hashes, restore/migrations, event log, seeded deterministic streams, golden multi-turn |
| B06 | QUEUED | B04–B05 | services/game-server: ator de partida, transport/sala, identidade de seat, ownership, idempotência e reconnect em Rust (shadow/private) |
| B07 | QUEUED | B03–B06 | core-commands: gramática PT-BR/gírias/aliases, multi-role/5 campeões, persistent plans, testes legado |
| B08 | QUEUED | B06–B07 | E2E ordens texto/voz e UI adapter, validação autoritativa, submit/undo/receipts, sem mutações JS |
| B09 | QUEUED | B05 | core-map I: coordenadas, tile/masks, obstáculo, LOS, pathing A*, blockers e budget |
| B10 | QUEUED | B09 | core-map II: fog team-filtered, wards/pink/oracle, invisibilidade e visão de plantas, segurança |
| B11 | QUEUED | B09–B10 | core-map III: Rift Elemental, muros/terrain dinâmico, teleport/blast/honey, geometry shared |
| B12 | QUEUED | B04–B11 | core-economy I: minions, waves 3+3/cannon, XP, CS por last-hit, auto farm e freeze |
| B13 | QUEUED | B12 | core-economy II: levels, gold, recall, respawn, shop buy/sell, Undo/fountain, receipt |
| B14 | QUEUED | B05, B09–B13 | core-objectives I: jungle path/camp/Smite, timers, plants, Rift terrain/vision |
| B15 | QUEUED | B14 | core-objectives II: dragon/soul/elder, Baron, Herald, voidgrubs, towers/inhibitors/Nexus |
| B16 | QUEUED | B04–B05, B09 | core-combat I: stats, damage, target, AA/kite, attack resolution, defense/heal/shields |
| B17 | QUEUED | B16, B11 | core-combat II: projectile, collision, CC/interrupt, windup/recast, reactions/combos |
| B18 | QUEUED | B17 | core-combat III: effects, summons, on-hit, realm/teleport, transformation/stealth cloning |
| B19 | QUEUED | B16–B18 | Registry skills P/QWER, no generic fallback, costs/range/CD/vision/rank, executor reuse Sylas/Viego |
| B20 | QUEUED | B19, B02 inventory | Legacy P/QWER batch #1 dos executores já existentes, matriz com QA duplo blue/red |
| B21 | QUEUED | B20 | Legacy P/QWER batch #2 incluindo efeitos especiais e transformações, QA e snapshots |
| B22 | QUEUED | B21 | Legacy P/QWER batch #3 e demais sublotes até zerar todos SOURCE_ONLY de skills |
| B23 | QUEUED | B13, B16 | core-items: receitas/ativos/passivos/efeitos, runas/trinkets/spells, dataschemas versionados |
| B24 | QUEUED | B23, B02 inventory | Migrar TODO catálogo legado implementado da items-batch2 + integration; regressões/dev60–61 |
| B25 | QUEUED | B22, B24 | Auditoria interações cruzadas P/QWER × itens × visão × objetivos, matriz 100% reconciliada |
| B26 | QUEUED | B06, B25 | Server Rust native real: full turn/match authority, replay, seat/reconnect, Nexus |
| B27 | QUEUED | B26 | WASM API public-only + safe serialização, testes reais browser e no secret leakage |
| B28 | QUEUED | B26–B27 | UI/web TS adaptadores, draft, loja, 3D board, HUD, texto/voz, postgame sem regras JS |
| B29 | QUEUED | B26–B28 | Full PvP duas sessões: render/events/net, reconnect, ownership, Undo, 30m natural Nexus |
| B30 | QUEUED | B25–B29 | Revisão exaustiva de arquivos, hashes/fixtures/replays e diferencial JS/Rust/WASM |
| B31 | QUEUED | B30 | Stress/multi-seed/segurança/performance/memória/browser e rollout rollback |
| B32 | QUEUED | B31 | Restaurar e verificar assets e catálogo do GitHub full checkout, release packaging |
| B33 | QUEUED | B30–B32 | G0–G8 auditoria final; marcar MIGRATION_CERTIFIED **somente se provas objetivas completas** |

### Regras da fila

- Dependências expressam ordem mínima; sublotes dos domínios grandes podem ocorrer depois de criarem contratos sem perturbar fases anteriores.
- B02 começa pela certificação do B01: se toolchain indisponível, primeiro resolver ambiente com consentimento necessário; não marcar Cargo/WASM PASS sem rodar.
- Sempre conferir SHA/branch, QA, documentação e provas antes de iniciar; se branch mudou, reconciliar e preservar autoria.
- Testes que exigem renderer, Chromium, rede ou assets binários são NOT_RUN se não executados, ainda que Node tenha passado.
- Para transição parcial, servidor JS permanece autoridade; novo server Rust só é promovido quando cobertura do match completo for certificada.
- A expansão de novas skills/itens Rust é **M46+**, somente após B33 G8.
