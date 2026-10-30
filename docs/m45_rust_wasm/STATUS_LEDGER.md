# CoachLOL M45 — Ledger de status e continuidade (fonte de verdade)

**Atualizado:** 2026-10-30, B02B-I07 pending vs in-flight separados, matriz de gaps de skills, Rust não compilado.
**Programa:** M45_TOTAL_RUST_WASM_MIGRATION.
**Modo:** MIGRATION_ONLY (expansão JS suspensa por política de produção; avisar os demais chats).
**Status global:** NOT_CERTIFIED.
**Próxima prioridade:** M45 B02B — testar protótipo Rust com cargo (quando disponível), 26 skills Node ESM e HTTP/SSE; reconciliar kits/rotas UI; depois B02C.
**Regra:** jamais mudar para MIGRATION_CERTIFIED sem G8, nem declarar PASS sem evidência.

## Git / branches conferidas

| Linha | SHA inicial conferido | Política |
|---|---|---|
| integration | 374d87d5f49b52514ec68bbe666df086363c1ec5 | JS golden/autoridade atual, sem alteração acidental |
| skills | f0b1147ac46e585a1d5374a178b1ea462f5dc278 | PR #9 Draft, preservar todos executores M44 |
| items | 182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d | preservar itens/receitas ainda fora da integração |
| migration | 7d344d2fac16b05a6e81c8984e38ce6ad2c907c3 | PR #19 Draft, branch dev69/rust-core-m45; **HEAD mudará com os commits do plano** |

Não assumir que estes SHAs continuam HEAD; consultar GitHub em TODA próxima operação.

## Milestones

| ID | Estado | Evidência |
|---|---|---|
| B01 core-state + WASM hash + 18 fixtures | IMPLEMENTED_UNVERIFIED | commit 7d344d2; JS goldens 21/21 PASS; Rust native NOT_RUN; WASM native NOT_RUN |
| B02 toolchain, compilação e inventário 3 branches | IN_PROGRESS_B02B | Skills S09 26 suites planos; Nami W: 8/8 V8 real (4 ghost coqueue, 4 controls), replay 8/8 checksum match; item V8 299, replay 244, platform 12 contratos; G0/G1 PARTIAL |
| B03–B33 migração integral | QUEUED | consultar FILA_PRIORIDADES.md |
| G0 inventário fontes | PARTIAL | três Git trees e 3 handoffs: 1178 registros estáticos em inputs/core/B02_UNION_MATRIX.json, sem golden dinâmico |
| G1 native WASM | PARTIAL | baseline real do único crate B01 core-state **PASS_BASELINE_ONLY** via Actions #41137516144; crates futuros e equivalência total ainda não implementados |
| G2 replay/estado | NOT_RUN | nenhuma equivalência match Rust completa |
| G3 ACL/server | NOT_RUN | Rust server ainda não implementado |
| G4 parser/cliente | NOT_RUN | parser atual JS |
| G5 macro mundo | NOT_RUN | legado JS |
| G6 combate/conteúdo | NOT_RUN | legado JS |
| G7 Browser/ativos | BLOCKED | falta 78 runtime assets GitHub remotos Issue #1 + Rust server/UI |
| G8 migração final | NOT_RUN | depende de todos gates |

## Bloqueadores e riscos registrados

- BLOCK-001: rustc/cargo/rustup não instalados no executor; npm/node disponíveis. DNS externo indisponível para baixar toolchain; probe local executado com EXIT 42. Rust native, clippy, rustfmt, WASM build e WASM runtime NOT_RUN. Script tools/m45_qa_native_wasm.sh e rust-toolchain.toml preparados. Sem Actions/Codespaces.
- BLOCK-002: 78 assets runtime binários faltando no GitHub remoto (Issue #1). É bloqueio de release/browser completo, não de core Rust.
- BLOCK-003: três handoffs de inventário estático incorporados, mas golden de runtime por source SHA, resolução semântica e identidade de executores ainda NÃO realizados (B02).
- BLOCK-004: B33B era candidato não commitado; não afirmar que está no git.
- BLOCK-005: JS legado em engine.browser.js gerado por script; mudar sistema de bundling sem gate quebra o browser.
- BLOCK-006 / PLATFORM-016 (P0 segurança): Chat 4 **reproduziu em V8 isolado usando `Arena.event` e `Arena.perspective` da fonte legada** exposição de evento sem team/unitId e `public:false`, detalhes arbitrários e string `public:'false'`. Não é prova de ocorrência em jogo completo. Rust `VisibleEventDTO` deve negar por padrão e utilizar allowlist por tipo/campo/owner/observedBy; G3 Rust NOT_RUN. Handoff platform A03.

## Transição entre tarefas

- Selecionar B02; carregar o último HEAD e verificar dependências.
- Antes do commit: implementar contrato, validar testes pertinentes, registrar problemas e rollback.
- Depois do commit: adicionar recibo em docs/m45_rust_wasm/receipts/M45_Bxx_*.md; atualizar esta tabela, FILA_PRIORIDADES.md e manifest.json.
- Se um gate falhar, atualizar para BLOCKED/FAIL e manter a MESMA prioridade, não pular pacote.
- Se a tarefa tiver sublotes, usar B02A etc; registrar progresso parcial sem declarar B02 concluído.
- Nenhum cronograma/ação futura é executado automaticamente; cada "próxima prioridade" do usuário aciona uma etapa dentro da conversa.

## Prioridade operacional exata

**M45 B02A:** verificar Rust native e WASM build a partir do B01; fixar versão toolchain, executar cargo test --workspace e compilação WASM real. Não disponível localmente? Documentar bloqueio e buscar caminho executável, sem falsificar.
**M45 B02B:** construir inventário de símbolos/efeitos/testes sobre os 3 SHAs, matriz machine-readable e baseline golden por branch.
**M45 B02C:** reconciliar diffs, reunir proveniência e checar rollback; fechar G0 e G1 conforme evidências, então liberar B03.

Este arquivo tem precedência de status sobre adendos históricos do AGENTS.md, mas não altera regras de produto nem ADRs existentes.

## M45 B02A/B02B — execução parcial rastreada (2026-10-30)

- SHA da branch Rust antes da edição: `40e5598838bb4c2d4ec9d4a62c4f0acc30644aaf`. Git tree das três fontes lida com `recursive=1`, `truncated=false` em todos os casos.
- **integration**: 1653 blobs, 165 arquivos de teste (121 JS/TS); engine.mjs 459085 bytes.
- **skills**: 1858 blobs, 290 testes (246 JS/TS); engine.mjs 1117512 bytes. Em relação à integration: +205, ~8, -0 arquivos.
- **items**: 1657 blobs, 167 testes (123 JS/TS); engine.mjs 477933 bytes. Em relação à integration: +4, ~7, -0 arquivos.
- Índice machine-readable das diferenças, blobs e fontes: `docs/m45_rust_wasm/inputs/core/B02_GIT_TREE_INDEX.json`. Este é inventário **de árvores e arquivos**, NÃO prova que AST, skills/itens, efeitos, testes golden por branch ou cobertura funcional já tenham sido inventariados.
- Handoffs Chat 2/3/4: branches `dev69/m45-audit-skills`, `dev69/m45-audit-items`, `dev69/m45-audit-platform` não localizadas nesta verificação: **PENDING**, não bloquear o levantamento central.
- Ferramentas: `rustc`, `cargo`, `rustup` ausentes; tentativa de DNS para static.rust-lang.org e github.com falhou. `node --check` do teste WASM e `bash -n` do QA script: **PASS sintático**, NÃO compilação. `bash tools/m45_qa_native_wasm.sh`: **EXIT 42, BLOCKED_TOOLCHAIN**, build/test native e WASM **NOT_RUN**.
- O novo teste de WASM exige binário Rust de verdade e confere ABI pública, 18 vetores TSV e UTF-16; até executado, registrar NOT_RUN.
- **Status:** B02 IN_PROGRESS_BLOCKED, G0 PARTIAL, G1 NOT_RUN, G8 NOT_RUN. Próxima execução: resolver toolchain e rodar testes de verdade; continuar inventário de símbolos e golden por SHA, sem promover B03.

## M45 B02B — handoffs consolidados (2026-10-30)

- Chat 2 skills `6b8de5ec2906e9cab25c3b0205ed7572d370854a`: 865 slots, 63 símbolos mecânicos, 55 slots com múltiplos registros; golden runtime NOT_RUN.
- Chat 3 items `134b6260173d3b2d4e3a6ffa6317a40c361b8bfc`: 210 entradas, 3 locais, 8 métodos diferenciais; oráculo de 11 casos publicado mas **NOT_RUN**.
- Chat 4 platform `b7b8baf02d4a5dfacb15cd8679a94f2fe2841a06`: 29 contratos com paths verificados; golden duas sessões **NOT_RUN**.
- União com 1178 IDs únicos e proveniência por blob: `docs/m45_rust_wasm/inputs/core/B02_UNION_MATRIX.json`. **QA estático PASS** para 891 test SHA refs e 29 paths/blobs plataforma, 0 divergências conferidas. NÃO declarar runtime PASS.
- **Bloqueio revalidado neste ciclo:** `rustc`, `cargo`, `rustup` ausentes; `bash -n` e `node --check` PASS, probe QA EXIT 42, DNS `static.rust-lang.org` indisponível. Native e WASM NOT_RUN.
- **Próxima prioridade:** B02A e B02B goldens; B03 inelegível. G0 PARTIAL, G1 NOT_RUN, G8 NOT_RUN.

## M45 B02A3 — QA executável do adaptador público e novo intake (2026-10-30)

- Base conferida antes da escrita: `8a2d50f2d7189e16b467dcf4c546613a1d2c24c8` PR #19 Draft. Teste novo `tests/audit/m45_b02_public_adapter_contract.test.mjs`, com Node v22.16.0 e **4/4 casos de teste PASS** (18 linhas TSV: 15 disputas e 3 sem disputa; chave Unicode UTF-16, entradas inválidas, falha de alocação/trap + liberação). Teste usa **ABI simulada via WebAssembly.Memory** e adaptador real JS: **NÃO mede Rust nem binário wasm**.
- Proveniência do teste local: blob SHA `fa875c3e37b204a2124693291cdba7e82aa4f4f0`; adaptador já publicado `9ac1d5595c12371092a82cb0b8538edd161be76b`; golden TSV `168abfd267632074d6da4f1ea7bddd02903b9bfa` conferidos contra GitHub.
- `tools/m45_qa_native_wasm.sh` agora executa o mock ABI Node primeiro, depois tenta Cargo. `bash -n` PASS; `bash tools/m45_qa_native_wasm.sh`: 4/4 Node PASS e **EXIT 42 BLOCKED_TOOLCHAIN**, pois rustc/cargo ausentes. `cargo test`, clippy, rustfmt, build/exec WASM **NOT_RUN**. DNS `static.rust-lang.org` e `github.com` indisponível neste runner, sem apt/cache Rust; não se usou Actions/Codespaces.
- Handoff skills atualizado `dev69/m45-audit-skills@135d01adc29f7135323176cff6fc5e3f972dfacb`: 10 suites bilaterais pinadas e runner; goldens NODE **NOT_RUN**. Handoff items `dev69/m45-audit-items@654f8e1f7afc65d97fb38f234aaf39c7227d15a3`: 43 suites/458 âncoras documentadas, golden 122 itens × 2 lados previsto mas **NOT_RUN**. Handoff platform `dev69/m45-audit-platform@540c950f5b9a94be9a47c9a6d5c3bc56e5bb0927`: alerta PLATFORM-016 e contratos de rede, 16/16 padrões em estática, runtime redteam NOT_RUN.
- Matrizes centrais anteriores continuam congeladas nos SHAs originais até revisão semântica; estes novos handoffs estão **RECEIVED_UNVERIFIED**, sem merge/cherry-pick.
- **Próxima prioridade continua B02A**, obter toolchain nativo WASM de ambiente autorizado; em paralelo executar oráculos JS de origem e red-team da projeção. **G0 PARTIAL, G1 NOT_RUN, G3 NOT_RUN, G7 BLOCKED, G8 NOT_RUN.**

## M45 B02A4 — runner de evidência e reconciliação S04/I02/A03 (2026-10-30)

- HEAD inicial revalidado: `e7cf151af869421d307af58ae26e38449c11f954` PR #19 Draft, fontes integration/skills/items originais imutáveis. `tools/m45_qa_evidence.mjs` (Node, sem dependências externas) executa de verdade adaptação JS, golden B01 se existir checkout, probes `rustc/cargo/rustup`, `cargo test/fmt/clippy`, target wasm32, build e smoke do **binário Rust gerado**; gera recibo com status por etapa, SHA256 binário somente se produzido e `G1=PASS_BASELINE_ONLY` apenas após 6 checks reais PASS.
- `tests/audit/m45_qa_evidence_policy.test.mjs`: **4/4 PASS** para fail-closed de G1 (mock ABI não aprova Rust/WASM, execução ausente não promove gate). Reexecutado juntamente com `m45_b02_public_adapter_contract.test.mjs`: **8/8 PASS** em Node v22.16.0. `node --check` ambos: PASS.
- `node tools/m45_qa_evidence.mjs --receipt <arquivo_local>` executado: `adapter=PASS`, `jsGolden=NOT_RUN` (não há checkout full), `native=BLOCKED`, fmt/clippy/wasm target/build/smoke `NOT_RUN`, `rustc=false cargo=false rustup=false`, `G1=NOT_RUN`, **EXIT 42**. `git ls-remote` também falha DNS. Sem GitHub Actions/Codespaces.
- Delta de handoffs machine-readable: `docs/m45_rust_wasm/inputs/core/B02_HANDOFF_DELTA_A4.json`. Skills `2184c906...`: **56 overlaps aparentes = 29 duplicatas do scanner + 27 slots multivariantes reais**, 11 suites bilaterais planejadas, zero runtime executado. Itens `0ae7cbff...`: 286 métodos Arena na branch de itens vs 278 na integração, 8 métodos exclusivos + 8 compartilhados modificados; 14 domínios de interfaces/62 símbolos, 43 arquivos/458 âncoras de testes, 244 golden candidatos NÃO executados. Plataforma `e98c9353...`: 132 chamadas `this.event`, 20 sem time, 2 com literal `public:true`; falha de projeção legado comprovada em V8 isolado (NÃO E2E).
- Atualiza leitura histórica de 55 overlaps preliminares: **27 permanecem multivariantes distintos após corrigir artefato de varredura**. Preservar as anotações históricas anteriores e a matriz central até regenerar com as novas fontes, sem confundir a correção estática com prova de runtime.
- **G0 PARTIAL, G1 NOT_RUN, G3 Rust NOT_RUN, G7 BLOCKED, G8 NOT_RUN**. B02 ainda IN_PROGRESS_BLOCKED. Próxima prioridade: executar Cargo/WASM num runner que tenha Rust e validar fonte SHA golden full/segurança, sem liberar B03.

## M45 B02A5 — execução no ChatGPT + GitHub, sem cliente local (2026-10-30)

- Base validada: `7635edfb1558b20d5c7bf2e876b18b962e4b8738` no PR #19 Draft; **não solicitar instalação Windows** ao usuário. `rustc/cargo/rustup` ausentes do container; DNS `static.rust-lang.org` continua indisponível. Tentativa local de compilar Rust permanece NOT_RUN, nunca PASS.
- Congelados no Rust branch dois resolvedores exatos de `engine.mjs` da integration `374d87d5f49b52514ec68bbe666df086363c1ec5` (blob `1737f4f675bd9cc5ed0a48defc68b2fddc124d71`) em `tests/fixtures/m45_integration_smite_source_snapshot.mjs`. `tests/audit/m45_b02_legacy_smite_snapshot.test.mjs` executa 18 cenários no-Smite, 3 simultâneos e pin de blob fixture: **22/22 PASS**, com fonte **isolada**; quando checkout full `engine.mjs` presente, testa também o blob SHA integral. Um resultado isolado NÃO prova JS engine completo.
- `node --test` com teste de contrato e gate G1 incluídos: **30/30 PASS** (22 fonte isolada, 4 contrato mock, 4 policy). `node tools/m45_qa_evidence.mjs --receipt ...`: `adapter PASS`, `sourceSnapshot PASS`, `native BLOCKED`, `rustc=false cargo=false rustup=false`, `wasmBuild/wasmSmoke NOT_RUN`, `G1 NOT_RUN`, EXIT 42.
- Para criar caminho remoto sem violar isolamento de branches, foi criado `.github/workflows/m45-b02a5-one-shot.yml` na branch Rust com `push` de caminho restrito a `docs/m45_rust_wasm/qa/trigger_b02a5.txt`. Apenas um push contendo o gatilho solicita o job `ubuntu-latest` de 10 minutos, `contents:read`, Rust 1.85.1 + wasm32 + Node 22, gravação de recibo artifact. **Não é prova de que Actions esteja habilitado ou que o job realmente executou**; conferir run/resultados antes de qualquer atualização de G1.
- `docs/m45_rust_wasm/GITHUB_REMOTE_QA.md` descreve QA por GitHub, sem clone local. Nenhum workflow em main, sem force/rebase/merge, sem tocar PR #9. Mesmo se G1 baseline PASS após job, G2–G8 requerem paridade completa.
- **B02 IN_PROGRESS_BLOCKED, G0 PARTIAL, G1 NOT_RUN, G3 Rust NOT_RUN, G7 BLOCKED e G8 NOT_RUN.**

## M45 B02A6 — CI remoto sem execuções observadas; diagnóstico e novo gatilho (2026-10-30)

- Consultado PR #19 Draft em `6bb6d2cc7f58c1e4053170276eddf56ebba9ab36` (sem merge) e REST GitHub `/actions/runs?branch=dev69%2Frust-core-m45`: **total_count=0**; `/actions/runs?head_sha=6bb6d2cc7f58c1e4053170276eddf56ebba9ab36` **0**, `/commits/6bb6d2cc7f58c1e4053170276eddf56ebba9ab36/check-runs` **0**, status checks **0**. Estas leituras são verificações reais de API; não explicam isoladamente se Actions está desabilitado, se workflow novo não foi registrado no push inicial ou se tokens de integração não provocam eventos.
- O workflow e primeiro gatilho foram **criados no mesmo commit** B02A5. Para testar a hipótese de evento inicial sem registro do workflow, uma única segunda atualização do arquivo `docs/m45_rust_wasm/qa/trigger_b02a5.txt` foi autorizada nesta branch Rust; workflow já existia no commit pai. Permissões `contents: read`, timeout de 10 minutos e nenhum trigger em `main`/PRs permanecem.
- `rustc`, `cargo` e `rustup` continuam ausentes localmente; nenhum Rust native nem WASM real compilado neste executor. **A segunda tentativa de push não é evidência de execução: G1 permanece NOT_RUN até receber run, logs e recibo.
- O código Rust do B01 permanece intacto; auditoria estática apontou que `cargo fmt --all --check` provavelmente exigirá formatação, mas sem `rustfmt` **não foi declarado PASS ou FAIL**. A prioridade correta é colher a evidência de CI e corrigir somente falhas observadas, sem criar false PASS.
- Nenhum Actions/CodeSpace foi acionado manualmente nem foi alterado o repositório local do usuário (inexistente). B02 IN_PROGRESS_BLOCKED, G0 PARTIAL, G1 NOT_RUN, G8 NOT_RUN.

## M45 B02A7 — primeira compilação Rust REAL e corretivo isolado rustfmt (2026-10-30)

- GitHub Actions **run #41137201572** no commit `91fda60e81d44e7b08bc06874094fc38c24d5fef`, job 124342476724 concluído com **FAIL**. Evidência disponível via logs e artifact `m45-b02a5-rust-wasm-qa` (artifact ID 13016518122). **Rust 1.85.1 instalado realmente** (`rustc 1.85.1` e `cargo 1.85.1`); `wasm32-unknown-unknown` listado como target.
- `cargo test --workspace --all-targets --offline`: **PASS 3/3** para `coachlol-core-state`; `cargo clippy --workspace --all-targets --offline -- -D warnings`: **PASS**; `cargo fmt --all --check`: **FAIL (exit 1, source não formatada)**. `wasmBuild` e `wasmSmoke`: **NOT_RUN** (gating correta, nunca chamado de PASS). `G1` registrado **FAIL** nesta execução real, em substituição ao antigo NOT_RUN.
- Mesmo runner: `adapter PASS` (4/4 JS mock ABI), `sourceSnapshot PASS` (23/23 com engine full SHA verificada), `jsGolden PASS` (21/21 sobre engine original). Estes valores são evidências da própria execução GitHub, não devem ser somados a testes Rust.
- Na única correção proposta **B02A7**, o workflow restrito ao gatilho `docs/m45_rust_wasm/qa/trigger_b02a5.txt` formata `crates/core-state/src/lib.rs` com **rustfmt real 1.85.1**, verifica que não há outros arquivos rastreados alterados, cria um commit normal somente nesse arquivo e faz `git push` sem force para a mesma branch Rust; aborta se outro escritor avançou o HEAD. **A permissão contents:write está restrita a este job**, não a todos workflows; nenhum arquivo de gameplay JavaScript nem outra branch pode ser escrito pelo script. O segundo passo executa `node tools/m45_qa_evidence.mjs` para Cargo, fmt, Clippy, compilação WASM e smoke do WASM verdadeiro; artifact registra SHA exato e recibo.
- Uma solicitação/push de B02A7 **não comprova o sucesso do job até verificar run ID, conclusão e artifacts.** Nenhum merge, rebase ou force-push. Se o CI negar escrita, manter G1 FAIL e registrar bloqueio real.
- **G0 PARTIAL; G1 FAIL (fmt, aguardando reexecução); G2–G6 NOT_RUN; G7 BLOCKED; G8 NOT_RUN.** B02 continua primeiro bloqueio elegível.

## M45 B02A7 — QA Rust nativo e WASM real aprovado (evidência final 2026-10-30)

- Run GitHub Actions #41137516144, job **124343505135**: **SUCCESS** no workflow restrito de B02A7. Origem do job `4f73eceb4cfe07ffa36ea696d1944556d87f00e6`; ação `cargo fmt --all` gerou commit **`c8e8f182b87d720619fe5747076b8221413acde7`** em `dev69/rust-core-m45`, autor `github-actions[bot]`. API GitHub confirmou **somente um arquivo modificado**: `crates/core-state/src/lib.rs`, pai `4f73ece...`, sem force, sem merge e PR #19 continua Draft.
- Artifact `m45-b02a7-rust-wasm-qa` ID **13016623674**, `m45-qa.json` lido integralmente; `verified_commit_sha.txt` corresponde a `c8e8f182b87d720619fe5747076b8221413acde7`. Versões: `rustc/cargo 1.85.1` e Node **v22.23.4**, Ubuntu x64.
- Recibo real: `native PASS` (**3/3 Rust tests**), `fmt PASS`, `clippy PASS` com `-D warnings`, `target PASS`, `wasmBuild PASS` (release crate core-state), `wasmSmoke PASS` (binário WebAssembly compilado, não mock). `adapter PASS` (JS simulação), `sourceSnapshot PASS` (com SHA de engine full verificada, 23 casos), `jsGolden PASS` (**21/21**). Cada etapa tem exit_code 0.
- **WASM SHA-256:** `ffc019a55a2799202e2511d7fe1a4304932479f48b739ed01ca7715dd4f48f63`. `G1` no recibo: **PASS_BASELINE_ONLY**. Isso conclui B02A baseline B01; **G1 do programa registrado PARTIAL** porque somente um crate core-state foi migrado/compilado (faltam engine completa, platform, champions, economy e testes cruzados). G8 **NOT_RUN**; nenhuma autoridade de partida transferida para Rust.
- **Próxima elegível: B02B** (goldens full e fonte sem perda nos três SHAs de origem). Não acionar novamente o gatilho de CI B02A7, preservando quota. B02 IN_PROGRESS_B02B, G0 PARTIAL, G1 PARTIAL, G3 NOT_RUN, G7 BLOCKED, G8 NOT_RUN.

## M45 B02B-I01 — consolidação de evidências S08 / Items-B05 / Platform-A07, sem Actions (2026-10-30)

- Verificação em GitHub de HEADs especialistas: skills `165f51bf1e50d3816484ce8c8ed715cf81c3ec0f`, items `13caf37797e9c85e41f63b9ff5b4a9652682305c`, plataforma `975153367177ccceb553f80a78b66b041b31a075`. Fontes congeladas sem alterações: skills `f0b1147...`, items `182e592...`, integration `374d87d...`; árvores recursivas conferidas `truncated=false` para as seis refs.
- **Oito arquivos de evidência** incorporados ao núcleo Rust **por blob Git SHA exato**, sem merge/cherry-pick de engine ou execução Rust: plano 25 skills, cinco recibos items V8 + índice central e matriz A07 plataforma. Roteamento de artefatos em `docs/m45_rust_wasm/inputs/core/b02b/` e índice `B02B_HANDOFF_INDEX.json`. Seis testes de integridade compilados em `tests/audit/m45_b02b_handoff_integrity.test.mjs`: verificam blobs SHA, 25 golden skills NOT_RUN, 244 compras/trocas (122 por lado), receitas de ouro/Undo, 244 pares de replay com hashes exatos, 299 casos V8 e 12 contratos. **Arquivo de teste Node criado, ainda NOT_RUN no checkout completo; não declarar 6/6 PASS.**
- **QA realmente executado agora em V8 Code Mode sobre JSONs da fonte GitHub**: `PASS`, `0 divergências` em 25 referências com SHA e caminho pinados, 5 receipts com Git blob conferido, 244 casos bilaterais, 244 replays comparados campo por campo, 12 contratos plataforma, sem duplicatas. O PASS é **integridade de evidência**, NÃO execução do jogo Rust nem Node golden completo.
- Evidência já executada pelos especialistas, mantida em seu escopo: itens **299 casos V8 originais**: 244 catálogo + 36 efeitos + 11 economia + 8 trinkets = 297 positivos e **2 negativas esperadas** que **confirmam BUG P1** no gateway `item.trinket`; 244 seeds repetidas com 488 execuções e hashes idênticos. Plataforma A07: **8/8 SSE decoder Node** e **13/13 room/subscription V8** com vazamento de evento privado anônimo **reproduzido**, HTTP/sessão completa e reinício disco NOT_RUN. Skills S08: **25 suítes planejadas, 0 executadas**; W Nami divergente por rota board/targeted, co-queue potencial ainda hipótese sem golden.
- **Política econômica CI (corrigida após observação):** nenhum workflow Rust foi disparado manualmente; porém o push B02B-I01 ativou **três workflows legados por evento pull_request** (skills/integration/QA), todos SUCCESS em ~12–27s de relógio; isto pode consumir minutos, logo a alegação anterior de '0 jobs Actions' era incorreta. No B02B-I02 foram incluídos guards job-level para ignorar `github.head_ref == 'dev69/rust-core-m45'` SOMENTE nas cópias dos três workflows desta branch; os workflows das branches originais permanecem intactos. A validação de que os guards realmente impedem runner billing depende de observar jobs `skipped` no novo push. Nenhum `qa/trigger_b02a5.txt` foi alterado, nem novo build Rust pedido.
- **G0 PARTIAL; G1 PARTIAL** (apenas core-state B01 nativo/WASM aprovado); G2–G6 Rust NOT_RUN, G7 BLOCKED, G8 NOT_RUN. **B02B IN_PROGRESS**, B03 ainda QUEUED.

## M45 B02B-I02 — correção da ativação automática de Actions herdados (2026-10-30)

- O push do commit `6efd204caf6b9722ced111d93986b3e3d7282ca7` NÃO alterou workflow/gatilho Rust, mas por ser head do PR #19 baseado em `dev69/integration` iniciou **três workflows legados** via `pull_request`: #41138435112 skills QA SUCCESS, #41138434758 integração QA SUCCESS e #41138434699 QA logic SUCCESS. Acompanhados por GitHub REST `/actions/runs?head_sha=...`. **Isso consome quota**; corrigimos registro antigo de 0 Actions para 3 execuções automáticas. Não houve disparo manual.
- Escopo corretivo **apenas** na `dev69/rust-core-m45`: os jobs `nami-vex`, `integration` e `smoke` passam a ter `if: github.event_name != 'pull_request' || github.head_ref != 'dev69/rust-core-m45'`. Isto conserva PRs de outras branches, dispatch manual e o push original de integração; evita alocar runner para PR #19 quando o job receber o novo arquivo de workflow. O job full-regression já tinha filtro próprio.
- Proteção de quota: não editar o gatilho Rust de one-shot, não iniciar QA redundante, verificar `skipped` nos runs do commit corretivo. Se GitHub usar YAML do base e ainda rodar os jobs, registrar o bloqueio e não repetir commits só para testar CI.
- **Nenhuma autoridade PvP Rust promovida**: B02B IN_PROGRESS, G0 PARTIAL, G1 PARTIAL (apenas core-state real), G8 NOT_RUN. Sem merge/force/rebase.

### Verificação B02B-I02 do bloqueio de quota — realizada

- Após o commit `83a2a8b8dd403f8cf38567a47821d9ea427ab387`, consulta REST `/actions/runs?head_sha=...` retornou **3/3 conclusões `skipped`** (nenhum job com executor). IDs: skills #41138667106, integração #41138667069, QA logic #41138667088. **Proteção de jobs validada.** Eventos workflow aparecerão como `skipped`, mas sem runner consumindo minutos.
- A primeira atualização B02B-I01 disparou 3 jobs legados de verdade (SUCCESS); esta dívida de quota está reconhecida no ledger. A partir do guard, novos commits do PR #19 não devem alocar jobs dessas três rotas, a menos que workflows sejam alterados novamente; se aparecer FAIL/runner, interromper e auditar. Nenhum workflow Rust e nenhum arquivo-gatilho one-shot foram alterados no corretivo.

## M45 B02B-I03 — Nami W ghost-cast confirmado nos métodos originais (2026-10-30)

- **Fonte congelada:** `dev69/skills-batch2@f0b1147ac46e585a1d5374a178b1ea462f5dc278`; `engine.mjs` blob **`41679f7328a42e379fdfb8de5b92006e1bfb529f`** (1.116.423 caracteres). Recursos reais do mesmo SHA: mapa blob `ad853bbb6f110c0d2b6b8b4995ac4e80169f7109`, máscaras `ecddcee76f3bce20a483ff7545ce2231696270e2`. Fonte carregada por conector GitHub em V8, **removidos somente tokens top-level `export`**, executados `Arena`, `queueTargetedSkill`, `queueBoardSkillV453Dev69`, `resolveBoardSkillsV453Dev69`, `resolveTargetedCasts`, `snapshotV40`, `fromSnapshotV40`, `checksumV40`. Não é runtime Node ESM completo nem Rust.
- **Oito cenários V8 genuínos em dois assentos:** controles W targeted-only azul/vermelho e W board-only azul/vermelho **4/4 sem ghost** (mana 500→430, após CD permanece 430). Rotas concorrentes targeted→board e board→targeted, azul/vermelho **4/4 com ghost reproduzido**: ambas queues `ok:true`, Board debita 70 mana e cura 75 (aliado 400→475), `pendingTargetedCast` fica **true** apesar do CD; no tick simulado `t=10.25` após CD `10`, o targeted pendente cobra mais 70 mana (430→360) e cura mais 115 (475→590) **sem nova ordem**. O alvo W targeted-only cura 115 (400→515), W board-only 75 (400→475): **duas semânticas diferentes**, não portar silenciosamente como skill equivalente. ACL adversária de ambos métodos rejeita comandos para unidade do oponente em todos os cenários.
- **QA de replay:** os oito casos foram **executados novamente do zero** com seed/máscaras originais e **8/8** checksums de início/primeira ação/final, mana, cooldown, HP e negações ACL idênticos; zero divergências. Em todos 8 `checksumV40` do snapshot `fromSnapshotV40` corresponde ao resultado. Validador JavaScript puro sobre receipt publicado **PASS 8/8** + mutação de mana negativa **REJEITADA**. Este é QA de **legado V8 isolado com `visible()=true` e `duelPermission()=true`**, **não** prova que UI ou jogo normal possibilitem duas rotas nem turno de 10s naturalmente, e não é paridade Rust.
- Artefatos: `inputs/core/b02b/B02B_NAMI_W_V8_EXECUTED.json` (blob `06d36ff...`), `validate_nami_w_witness.mjs` (blob `4692fb2...`), plano S09 congelado **26/26 suites com SHA válido, 0 Node ESM executadas** (antes 25), fonte `S09_NAMI_W_INTENT_CONFLICT.json` e contrato Rust S09 **DESIGN_ONLY**, arquivo de quatro testes Node de receipt **CRIADO_NOT_RUN**.
- **Decisão vinculante para Rust futuro:** keyed `(match,round,seat,champion,slot,request_id)`; uma única execução por intenção W autenticada, sem pending targeted preservado através do cooldown quando board venceu, retry idempotente, mana/CD apenas uma vez por cast aceito, **nova W legítima após CD exige novo request** e recasts autorais de outros campeões são preservados, diferença board vs V42 explícita/documentada, negar invocação de oponente, snapshots repetidos. Não aplicar cegamente o bug do legado. O motor Rust de combate ainda não foi escrito nem certificado.
- **CI/quota:** nenhum workflow/gatilho alterado, nenhuma chamada para iniciar Actions; guards dos três jobs legados permanecem ativos na branch Rust. Conferir eventos de `pull_request` após o push, esperando `skipped`. **B02B IN_PROGRESS**; G0 PARTIAL, G1 PARTIAL (core-state baseline), G2–G6 Rust NOT_RUN, G7 BLOCKED, G8 NOT_RUN. B03 QUEUED.

## M45 B02B-I04 — auditoria do cliente/gateway autoritativo da branch skills (2026-10-30)

- Fontes GitHub congeladas exatas da **mesma branch** `dev69/skills-batch2@f0b1147ac46e585a1d5374a178b1ea462f5dc278`: engine blob `41679f7328a42e379fdfb8de5b92006e1bfb529f`, gateway dev44 `4be23bdd9df6d9918a0c32b6ea699be8974bf9de`, wrapper dev47 `adf6900a20b1b2c162ec9769b18bf1cc2c23867f`, cliente PvP `e6eb9af2f6ec84204d47eedcbcc67797748b6cff`, servidor `61f9d941852b6378bccccf8956aa699e8761836d`, mapa `ad853bbb6f110c0d2b6b8b4995ac4e80169f7109`, máscara `ecddcee76f3bce20a483ff7545ce2231696270e2`.
- V8 isolado carregou **Arena real + `AuthoritativeActionsV453Dev44/47` originais** (removidos imports/exports na memória e shim `structuredClone` para payloads JSON), instanciou 2 seats autenticados com 5 unidades cada, seed fixa, visibilidade/duelo forçados para isolar roteamento. **14/14 invocações de rotas gateway sem exceções:** Nami W `skill.targeted` aceito **2/2** e resolvido com um débito de 70 mana; Nami `ground`/`directional`/`self` rejeitados **6/6**; Ahri E `directional`/`ground`/`targeted` rejeitados **6/6** apesar de executor `board_effect` da engine. Todos retries `sequence=1` repetidos com mesmo payload retornaram mesmo resultado; 12 negativas não mudaram mana/HP/checksums. Rejeições são **falhas de acessibilidade**, não êxito funcional.
- **4/4 cenários adicionais gateway legítimo**, `skill.targeted W` + `order.combo W` nas duas ordens, azul/vermelho: ambos ACK aceitos; `resolveCombat()` consome apenas 70 mana (1000→930), limpa pending-targeted, nova resolução artificial após cooldown `t=10.25` **não** consome nova W nesses quatro fixtures. A ordem de ataque persiste e outros efeitos de combate acontecem, então resultados não provam ausência geral de combos duplicados em todo cenário ou impossibilidade de usar dois métodos diretos em outro caminho.
- **Causa fonte do catálogo:** `/api/kits` da branch skills monta a propriedade `kits` de `BOARD_KITS_V453_DEV69` (**30 campeões**); o elenco `M44_B13A_KITS_V453` contém **14 autores diferentes, zero presentes naquele registro antigo**. O servidor fornece campos alternativos `specials`, `formKits`, `entityKits`, `mechanicKits`: **não afirmar que todos os 14 estão totalmente ausentes da interface**, apenas ausentes da propriedade `kits`. O cliente usa `boardKitsV453` para escolher a habilidade; botão de alvo aceita só `target_enemy`/`target_ally`, não `target_any` da Nami W. A Ahri E autoral `board_effect` não possui rota gateway padrão aceita. **HTTP real `/api/kits` não executado**, constatação deriva de código-fonte + instância V8.
- Arquivos de prova `B02B_GATEWAY_KIT_V8_EXECUTED.json` (blob `30375b17c600b65eef953988f149c6408c588da1`), `B02B_CLIENT_KIT_SOURCE_DISCOVERY.json` (blob `4dec9b0da3e40252b1929217f87455652fa05ff8`), validador `validate_gateway_kit_evidence.mjs` (blob `ed61250ff7029150e7b2f159a6238d5517c5243a`, **PASS V8 + controle de alteração maliciosa REJEITADO**). Testes Node receipts **preparados NOT_RUN**; contrato Rust `B02B_SKILL_WIRE_RUST_CONTRACT.json` **PROPOSED_NOT_IMPLEMENTED**, com API tipada/registries unificados, dono do assento, árbitro de cast e DTO seguro.
- QA especialista S10 (outra branch): **26 suites** declaradas, 22 V8 PASS, **2 V8 FAIL** (Ahri E M2; Ashe R golden antigo espera stun instantâneo em vez de projétil temporal) e 2 NOT_RUN; 0/26 Node original completo. S11 confirma Ahri E rota board interna funcional e Ashe R impacto temporal, não confundir regressão antiga com falta de ultimate.
- **Nenhum workflow/gatilho GitHub Actions tocado**, 0 jobs solicitados diretamente neste lote; os três jobs legados do PR #19 devem ficar `skipped` (conferir após commit). Sem alteração de engine/cliente legado; G0 PARTIAL, G1 PARTIAL baseline B01, G2–G6 Rust NOT_RUN, G7 BLOCKED, G8 NOT_RUN. B02B permanece IN_PROGRESS, B03 QUEUED.

## M45 B02B-I05 — protótipo privado Rust SkillAdmission (2026-10-30)

- Criado crates/core-state/src/skill_admission.rs: uma intenção primária por assento/ator/slot; ACK idempotente; conflito de request_id; seal; commit-once; retire terminal e limpeza de pending ao mudar de turno.
- Testes Rust definidos: Nami W em duas equipes e duas ordens; Ahri E como direção tipada (sem projétil), owner/aim/recast inválidos, cache de ACK em clone in-memory, isolamento de dois seats.
- Nenhum executor real de habilidade, custo, fog, autorização de sala, registry M44, HTTP/SSE ou WASM novo implementado. Manter regras autoritativas na engine JS até gates.
- cargo/rustc indisponíveis: testes Rust, fmt/clippy, wasm build NOT_RUN. 26 suítes Node legadas permanecem 0/26. G0/G1 PARTIAL; G3/G6/G8 NOT_RUN. Sem Actions solicitadas.
- Próxima etapa B02B: compilar módulo em executor Rust quando possível, obter goldens Node e HTTP/SSE reais e reconciliar 14 kits de registro/cliente. B03 ainda QUEUED.

## M45 B02B-I06 — retenção autoritativa de cast temporal entre turnos (2026-10-30)

- Baseline Rust I05 confirmado no GitHub. Em I05, next_turn() executava self.pending.clear() incondicionalmente, podendo descartar intenções não confirmadas ou projéteis comprometidos ainda em voo. Corrigido: se houver pending não committed, avanço nega; quando todos committed, avanço preserva pending para terminal explícito. Sem criação de novo cast por cooldown.
- Adicionados 2 testes Rust (total 7 definidos): ambos os seats com Ahri E temporal cruzando turno, e duas habilidades Blue/Red em estados distintos, incluindo ACK cacheado e necessidade de retire. Teste anterior in-memory clone atualizado para realizar commit + retire antes de avançar. A recepção da Ahri E continua separada da execução autoral do projétil.
- Contratos legados Nami W target_any e Ahri E board_effect reconferidos pelo JSON source-pinned; 14 autorais M44 permanecem fora de BOARD_KITS.kits, sem afirmar invisibilidade total na UI. VERIFICAÇÃO ESTÁTICA local dos trechos/fixtures PASS; Cargo/rustfmt/clippy/WASM/26 Node/HTTP/SSE ainda NOT_RUN. Nenhum runner Actions manual; B02B IN_PROGRESS, G0/G1 PARTIAL, G3/G6/G8 NOT_RUN.
- Pendência de design para B04: separar duravelmente Queued/Sealed/Committed/InFlight/Terminal e tratar timers/recats de forma autoral. Este protótipo não implementa relógio, autenticação, efeito, cooldown ou replay persistido.

## M45 B02B-I07 — separacao de admissao vs projeteis em voo (2026-10-30)

- Corrigida limitacao I06: casts committed em voo nao devem bloquear admissao de slot QWER no proximo turno. Agora o registro pending tem escopo de turno; next_turn transfere casts confirmados para in_flight por cast_id, com retire verificado por assento/ator/slot. Cooldown e validação de alcance continuam sendo responsabilidade do futuro servidor Rust, e NAO foram implementados aqui.
- Atualizados 2 testes anteriores e adicionados 2 testes Rust (total 9 definidos; 0 executados): cast antigo em voo e novo primario coexistem; retire antigo nao apaga novo; seat/ator/slot nao podem retirar cast alheio.
- Nova matriz B02B_I07_WIRE_GAPS.json source-pinned: 14 autorais M44 fora da propriedade antiga kits, mas possivelmente em colecoes alternativas; Ahri E 6 negativas gateway, Nami W 2 targeted aceitos mas target_any indisponivel no botao antigo. Isso registra lacunas, NAO alega conserto.
- QA feito: revisao estatica de invariantes e dados do legado. Rust cargo/fmt/clippy/wasm e Node 26 suites, HTTP/SSE nao executados. Zero Actions solicitadas. G0/G1 PARTIAL, G3/G6/G8 NOT_RUN. B02B permanece em andamento.
