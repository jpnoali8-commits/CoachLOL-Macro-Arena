# CoachLOL M45 — Ledger de status e continuidade (fonte de verdade)

**Atualizado:** 2026-10-30, M45 B02A4 runner de evidência + correções G0 dos handoffs; PARCIAL.
**Programa:** M45_TOTAL_RUST_WASM_MIGRATION.
**Modo:** MIGRATION_ONLY (expansão JS suspensa por política de produção; avisar os demais chats).
**Status global:** NOT_CERTIFIED.
**Próxima prioridade:** M45 B02A (executar native/WASM em toolchain real via tools/m45_qa_evidence.mjs); B02B executar goldens das fontes e auditoria P0 da plataforma.
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
| B02 toolchain, compilação e inventário 3 branches | IN_PROGRESS_BLOCKED | executor de evidências M45 B02A4 publicado; Node policy 4/4 + adapter 4/4 PASS; Rust/WASM NOT_RUN; deltas dos especialistas S04/I02/A03 incorporados |
| B03–B33 migração integral | QUEUED | consultar FILA_PRIORIDADES.md |
| G0 inventário fontes | PARTIAL | três Git trees e 3 handoffs: 1178 registros estáticos em inputs/core/B02_UNION_MATRIX.json, sem golden dinâmico |
| G1 native WASM | NOT_RUN | toolchain cargo/rustc não encontrado neste ambiente |
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
