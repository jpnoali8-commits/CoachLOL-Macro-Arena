# M45 Chat 3 — B02B-ITEMS B12B: golden diferencial Rust x fonte original JS

**Data:** 2026-10-30  
**Branch exclusiva:** `dev69/m45-audit-items`.  
**Status:** **1.258 observações executadas na fonte JavaScript V8**; testes equivalentes Rust preparados e **NOT_RUN**. **Não** são 1.258 testes Rust PASS.

## Nova prova de paridade
- **1.000 operações de desconto/consumo de receita**: 125 itens × 8 classes de inventário. Calculadas por `recipePurchasePartsV453Dev30` e preços do catálogo real congelado.
- **258 passos reais de economia e loja**: 22 roteiros × azul/vermelho (44 arenas): `Arena.buy`, `sellItemV43`, `undoShopV453Dev61` e alterações de mundo autoritativas. Gravam aceite/recusa, ouro, inventário, pet do jungler, sentinelas, relógio, ready, distância da fonte e revisão externa.
- Segundo replay independente do corpus de economia JS reproduz **258/258 linhas idênticas**.
- Arquivos TSV sem `serde`/pacotes externos; dois novos testes nativos Rust os leem com `include_str!` e comparam cada coluna.

### Fatos sobre a compilação
`cargo`, `rustc`, `rustfmt` **não estão instalados** neste executor; nenhum Rust foi compilado nesta etapa. Preparar testes reais e fixtures verificadas na engine original não autoriza afirmar paridade Rust.

## Dependências e riscos
`core-state` só existe na branch central `dev69/rust-core-m45`, não nesta branch auditada. O `Team` temporário em `core-economy` deve ser substituído por um único contrato do coordenador quando integrado. A implementação B12A cobre exclusivamente ouro, inventário e Undo: faltam atributos/passivas e commit/rollback do ator para declarar a compra Rust autoritativa.

### Executar localmente em ambiente COM Rust instalado
```bash
cargo test --manifest-path crates/core-items/Cargo.toml --offline
cargo test --manifest-path crates/core-economy/Cargo.toml --offline
cargo fmt --manifest-path crates/core-items/Cargo.toml --check
cargo fmt --manifest-path crates/core-economy/Cargo.toml --check
```
Se testes de paridade falharem, corrigir o Rust usando a linha exata do TSV e confrontar com o método original congelado. Não alterar o oráculo.

## Arquivos
- `crates/core-items/tests/fixtures/m45_b12b_recipes.tsv` — 1.000 linhas fonte JS.
- `crates/core-items/tests/source_parity_b12b.rs` — assert Rust para componentes e descontos.
- `crates/core-economy/tests/fixtures/m45_b12b_shop.tsv` — 258 linhas fonte JS.
- `crates/core-economy/tests/source_parity_b12b.rs` — assert Rust para buy/sell/undo, ownership, fases, fonte, ouro.
- `docs/m45_rust_wasm/inputs/items/QA_V8_RUST_GOLDENS_B12B.json` — prova de fonte e limites.
- `docs/m45_rust_wasm/inputs/items/RECEIPT_B02B_ITEMS_12B.md`.

**GitHub Actions utilizados: 0.** Original de `engine.mjs`, branch de integração, PRs e Rust central preservados. Próxima prioridade: B12C; executar Cargo nativo em runtime acessível e corrigir divergências concretas, depois expor contrato de `core-economy` para o integrador, respeitando dependências do B04–B13.
