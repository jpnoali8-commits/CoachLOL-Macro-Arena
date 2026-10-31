# M45 — Fila operacional sequencial ("próxima prioridade")

**Como ler:** EXECUTAR primeiro item com status READY e dependências satisfeitas. Se a etapa tiver BLOCKED, remover o bloqueio é a prioridade. Os Bxx são macro-pacotes, podem exigir sublotes BxxA/BxxB sem alterar ordem. Atualizar STATUS_LEDGER.md + matriz por feature a cada commit. NÃO implementar skills inéditas até G8.

| ID | Status inicial | Pré-requisito | Ação concreta e critério de conclusão |
|---|---|---|---|
| B01 | IMPLEMENTED_UNVERIFIED | integration | Criar Rust core-state + WASM interface pública + fixtures JS. 21/21 JS; falta G1 |
| **B02** | **IN_PROGRESS_BLOCKED** | B01 | Verificar cargo/rustc/wasm target; compilar/testar B01 nativo/WASM; inventariar três árvores/AST, exports, efeitos, comandos, testes; congelar goldens por SHA sem perder conteúdo |
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

### B02 — registro de sublotes (2026-10-30)

- **B02A — BLOCKED_TOOLCHAIN:** Rust/Cargo/rustup ausentes; faltou DNS externo. `rust-toolchain.toml` (1.85.1, wasm32 target), `tools/m45_qa_native_wasm.sh` e `tests/audit/m45_wasm_binary_smoke.test.mjs` publicados. Compilação nativa/WASM continua NOT_RUN; retomar esta etapa antes de G1.
- **B02B — STATIC_HANDOFFS_RECONCILED:** três árvores e três handoffs pinados; `inputs/core/B02_UNION_MATRIX.json` reúne 1178 registros de auditoria, 891 refs de testes com SHA e 29 paths plataforma. Testes golden dinâmicos e cobertura semântica continuam PENDING; G0 PARTIAL.
- **B02C — QUEUED:** reconciliar identidade de cada executor/efeito, golden com source SHA, resultados de Chat 2/3/4 e rollback; não fechar G0 ou G1 sem isso.
- **PR #19** permanece Draft, sem merge. **B03 NÃO elegível** enquanto B02 estiver incompleto.

### B02B: handoffs consumidos (2026-10-30)

Publicados em `dev69/m45-audit-skills` @ `6b8de5ec2906e9cab25c3b0205ed7572d370854a`, `dev69/m45-audit-items` @ `134b6260173d3b2d4e3a6ffa6317a40c361b8bfc` e `dev69/m45-audit-platform` @ `b7b8baf02d4a5dfacb15cd8679a94f2fe2841a06`. Integração no núcleo realizada SOMENTE via matriz estática e recibo, sem merge das engines. **B02A permanece primeiro bloqueio elegível; B03 ainda QUEUED.**

### B02A3 (2026-10-30) — execução Node disponível, Cargo bloqueado

- `node --test tests/audit/m45_b02_public_adapter_contract.test.mjs`: 4/4 PASS contra mock ABI e 18 golden TSV; script B02A agora roda este QA antes do probe de Cargo. `rustc`/Cargo indisponíveis, build nativo/WASM **NOT_RUN** (EXIT 42). Não contar o mock como G1.
- 3 handoffs mais recentes recebidos e SHA fixado no ledger; PLATFORM-016 P0 projetado pela auditoria da plataforma precisa de teste red-team antes de G3. Executar golden Skills/Items/Platform no checkout original e não avançar B03.

### B02A4 (2026-10-30) — execução reprodutível sem aprovação falsa

- Publicado `tools/m45_qa_evidence.mjs` + `tests/audit/m45_qa_evidence_policy.test.mjs`, com 4/4 PASS de regras G1 e 4/4 PASS do adaptador JS já existente. Executado runner: EXIT 42, Rust nativo BLOCKED, WASM NOT_RUN, mock não contado como WASM. Emitir recibos `--receipt` ao executar em ambiente real e guardar `wasm_sha256` somente de artefato compilado.
- Atualização G0: skills S04 reduz 55 conflitos preliminares para **27 multivariantes reais**, itens I02 registra **oito métodos compartilhados modificados** além de oito exclusivos, plataforma A03 reproduziu em V8 isolado exposição de eventos sem owner e inventariou 132 calls. Proveniência em `inputs/core/B02_HANDOFF_DELTA_A4.json`.
- `B02A/B02B` continuam elegíveis e incompletos; **B03 QUEUED**. Não habilitar Actions/codespaces automaticamente nem engine Rust em produção.

### B02A5 (2026-10-30) — GitHub remoto sem projeto no computador

- Execução ChatGPT Node: **30/30 PASS** em contrato/fonte JS isolada, 0 Rust/WASM nativo executado (EXIT 42). `m45_qa_evidence.mjs` passa a testar também `sourceSnapshot`, separadamente do `jsGolden` original.
- Job GitHub de **push com gatilho único por path** `.github/workflows/m45-b02a5-one-shot.yml` solicitado neste commit; não roda em cada alteração/PR. Verificar se Actions habilitado e o run/recibo real antes de considerar G1, sem exigir instalação no PC do usuário.
- Próximo sublote B02A: tratar feedback de execução remota (ou bloqueio de Actions); B02B continuar goldens integrais e reconciliação S04/I02/A03. **B03 ainda QUEUED.**

### M45 B02A6 — diagnóstico GitHub Actions (2026-10-30)

- API GitHub Actions da branch Rust retornou **0 runs** após B02A5, inclusive `head_sha` do commit e check-runs. Isso **não identifica** causa raiz por si só.
- Retry de caminho estritamente limitado: editar `qa/trigger_b02a5.txt` uma única vez depois de o workflow já existir no pai. Verificar `actions/runs?branch=...` no mesmo turno; se zero, marcar `NO_REMOTE_RUN_OBSERVED` e **não criar novos gatilhos repetidamente**.
- Enquanto Rust/Cargo externos não rodarem, B02A BLOCKED, G1 NOT_RUN. Continuar B02B, sem salto a B03.

### B02A7 — falha real Rustfmt localizada / correção com CI isolado (2026-10-30)

- B02A6 gerou `run #41137201572`: `cargo test` 3/3 PASS, `cargo clippy -D warnings` PASS e `cargo fmt --check` FAIL. WASM build/smoke NOT_RUN. G1 está **FAIL**, não NOT_RUN; requer correção real.
- Único workflow do gatilho `qa/trigger_b02a5.txt` atualizado para executar `cargo fmt --all`, validar diff com escopo **apenas crates/core-state/src/lib.rs**, publicar commit **fast-forward** somente nesta branch e reexecutar QA, com artefato `m45-b02a7-rust-wasm-qa` e SHA verificado. Em caso de push concorrente ou permissão negada, abortar sem marcar PASS.
- Próxima prioridade: obter log/artefato do B02A7, atualizar status G1 conforme execução e só então B02B goldens. Não atualizar Rustfmt PASS pelo código criado, apenas após execução GitHub.

### M45 B02A7 — G1 baseline core-state concluído (2026-10-30)

- GitHub Actions [run #41137516144](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/41137516144) **SUCCESS**. Rustfmt 1.85.1 publicou commit `c8e8f182b87d720619fe5747076b8221413acde7` (somente `crates/core-state/src/lib.rs`), sem merge/force. `cargo test` 3/3, fmt, clippy, target wasm, build release wasm e smoke binário **PASS**. JS golden 21/21 PASS. Artifact #13016623674 inclui commit exato e SHA-256 do binário.
- **B02A: COMPLETED_BASELINE**. G1 programa = PARTIAL (só um crate); `G1=PASS_BASELINE_ONLY` no recibo executor.
- **Próxima etapa efetiva B02B:** suites bilaterais skills (11), shop item 122 × 2 planos (244), contratos HTTP/SSE plataforma e falha legada de perspective/owner; preservar SHA de integração/skills/items, guardar output golden real. B03 continua QUEUED até G0/B02C.

### M45 B02B-I01 — import SHA-only, evidência V8 e orçamento Actions (2026-10-30)

- Importados **8 blobs originais** dos handoffs skills S08 / items B05 / platform A07 na branch Rust, sem merge de código e sem alteração de workflows. `B02B_HANDOFF_INDEX.json` documenta 25 suítes skills (NOT_RUN), 299 cenários items V8 (297 positivos + 2 negativas P1 esperadas), replay exato 244/244 e 12 contratos de rede. QA V8 de consistência de artefatos executado `PASS`/0 divergências; teste Node integrado criado mas ainda NOT_RUN.
- **Bugs bloqueadores:** P0 `PLATFORM-016` projeta eventos anônimos falsamente públicos; P1 `item.trinket` não tem rota PvP; P0 candidato `Nami W` board/targeted com divergência e hipótese de intenção pendente; P1 `ready` sem ACK idempotente. Preservar comportamento legado como golden antes de corrigir explicitamente no Rust.
- **Próxima B02B:** obter goldens dinâmicos das 25 suítes skills e testes HTTP/SSE sem gastar Actions, por V8/Node em ambiente com fontes, reconciliar semanticamente; depois B02C. G0 PARTIAL, G1 PARTIAL, G8 NOT_RUN. **B03 NÃO elegível.**

### B02B-I02 — defesa de quota em PR #19 (2026-10-30)

- Três runs automáticos antigos foram detectados após B02B-I01 (todos SUCCESS), apesar de nenhum Actions ter sido pedido manualmente. Adicionada guarda para `github.head_ref != 'dev69/rust-core-m45'` em três workflows legados **na branch Rust somente**, preservando os especialistas.
- Não mexer no gatilho `qa/trigger_b02a5.txt`; inspecionar checks `skipped` após este commit e registrar corretamente qualquer minuto consumido. Se ainda houver execução automática, escolher saída conservadora sem abrir novos jobs.

### B02B-I02 — guard CI validado: skip 3/3 (2026-10-30)

GitHub REST no commit `83a2a8b8...` confirmou 3 workflows legados com `conclusion=skipped`: #41138667106, #41138667069, #41138667088. O guard efetivamente impediu alocação de runner para a branch Rust; preservar o filtro. Próxima prioridade continua B02B (25 goldens de skills ainda NOT_RUN, HTTP/SSE original NOT_RUN), sem iniciar Actions.

### M45 B02B-I03 — witness real Nami W (2026-10-30)

- P0 `M45-SKILLS-NAMI-W` elevado de **hipótese** para **LEGACY_SOURCE_V8_REPRODUCED_UNDER_SYNTHETIC_DUAL_QUEUE**: 4/4 cenários coqueue azul/vermelho executam segunda W depois do cooldown sem novo request (mana 500→430→360, heal 400→475→590), 4/4 controles isolados não repetem; mais 8/8 replay idênticos de checksums. Artefatos JSON com SHAs em `inputs/core/b02b/`; Node ESM completo ainda NOT_RUN.
- Plano especialista S09 passou de 25 para **26/26** refs source verificadas; testes integrais Node 0/26, Rust gameplay 0. Proteger contrato Rust one-seat+unit+slot+round+request, nenhuma espera de cooldown com pending stale, defesa de ACL.
- Próxima B02B: testar reachability real do comando UI/Room e HTTP/SSE/reconnect, capturar 26 golden Node exatos sem GitHub Actions. Não tocar workflow trigger. B03 continua QUEUED.

### M45 B02B-I04 — cliente/gateway/audit kits (2026-10-30)

- Runtime V8 real do mesmo SHA skills branch: **14/14 testes de gateway** (2 W targeted aceitos, 6 Nami rotas indevidas negadas, 6 Ahri E rotas comuns negadas), **4/4** combos targeted W+order.combo com um único débito no primeiro resolve e nenhum novo débito após cooldown sintético. Todos os 18 fixtures têm ACK/checksums; rejeições Ahri E indicam BUG de roteamento, não PASS funcional.
- Catálogo legado server `/api/kits.kits` inclui 30 `BOARD_KITS`; **14 M44 B13** autorais ausentes dessa propriedade, embora existam campos alternativos (specials/form/...) que exigem reconciliação. Client target button exclui `target_any` da Nami. Contrato Rust de unificação entregue **SPEC_ONLY**.
- Skills S10 executou **22/26 em V8 PASS, 2/26 em V8 FAIL e 2/26 NOT_RUN**, não 26 Node completos; conservar duas falhas (Ahri E e Ashe R golden desatualizado) como deltas. **Próxima B02B:** executar Node ESM/HTTP quando possível, escolher prioridade P0 catalog/rota e ACL, sem CI repetitivo; B03 QUEUED.

### M45 B02B-I05 — protótipo de admissão única Rust (2026-10-30)

- core-state ganhou SkillAdmission e cinco testes unitários escritos mas NÃO EXECUTADOS, contendo idempotência, bloqueio de slot, seal e descarte de pending em dois seats. Registro de Ahri E tipada não constitui execução de projétil; Nami W testada só como protocolo, não como heal.
- B02B continua IN_PROGRESS: G0/G1 PARTIAL, Node 0/26, HTTP/SSE NOT_RUN, runtime Rust novo NOT_RUN. Não promover B03 nem disparar Actions.

### M45 B02B-I06 — proteção de cast temporal no avanço (2026-10-30)

- Removido descarte incondicional de pending na passagem de turnos do protótipo SkillAdmission. Bloqueia avanço com intenção não comprometida e preserva committed in-flight até evento terminal; testes Rust 5→7 definidos, ainda NOT_RUN.
- A fase B02B continua não certificada: compilar/fmt/testar com Cargo em checkpoint final permitido, executar goldens ESM e segurança HTTP/SSE quando ambiente disponível, reconciliar cliente/autorais. Não promover B03. Proibido gastar runners de CI em cada sublote.

### M45 B02B-I07 — corrigir ciclo de in-flight e registrar lacunas de catalogo (2026-10-30)

- Separado pending (slot/turno) de in_flight (cast_id) em Rust; 9 testes escritos, NOT_RUN; 14 autorais source pinned e Ahri/Nami diagnosticados sem promover PASS.
- B02B segue IN_PROGRESS, B03 QUEUED. Reservar CI para checkpoint final; nenhum Actions manual disparado.

### M45 B02B-I08 — registro tipado privado para rotas PvP (2026-10-30)

- Entrada Rust fail-closed de habilidades: server-owned champion+slot -> shape. Nami W e Ahri E mapeadas apenas no protocolo, sem efeitos. 6 testes Rust novos (15 totais) escritos NOT_RUN, 14 kits autorais restantes sem cobertura de registro; Node/HTTP não executados. B02B continua IN_PROGRESS, B03 QUEUED. CI somente no gate final.

### M45 B02B-I09 — autorização baseada em snapshot de partida privado (2026-10-30)

- O wire Rust agora pode derivar fatos da partida (sem campos de validação vindos de pacote) pelo `ServerSkillWorld`. 8 testes novos (23 definidos) NOT_RUN. Não é certificação G3: ainda não existe servidor HTTP PvP Rust, mana/CD não são debitados, reino/terreno não integrados.
- Manter B02B IN_PROGRESS e CI reservado à certificação. Prioridade seguinte: criar isolamento de snapshot/retorno público, sem leaks de SSE, e compilar quando houver executor nativo off-CI.

### M45 B02B-I10 — projeção pública por assento e SSE (2026-10-30)

- DTO Rust allowlist por seat, campos próprios/visíveis somente, SSE com escape de strings e sem ordem/RNG privado; 9 testes novos (32 definidos), cargo NOT_RUN. Restrição: função ainda não conectada a endpoint HTTP nem à autenticação real.
- Próxima prioridade B02B: revisar invariantes de ACL e transformar a projeção em fronteira única dos eventos HTTP/SSE quando existir servidor Rust. Não acionar Actions até checkpoint final completo.
