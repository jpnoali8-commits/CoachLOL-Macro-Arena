# M45 — Chat 3 / B02B-ITEMS Lote 12A — implementação Rust isolada

Data: 2026-10-30. Origem imutável: `dev69/items-batch2@182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d`, `engine.mjs@e06cfe0c18ded3d21f7a1d9bc62909543ccbbb6d`.
Branch de publicação: `dev69/m45-audit-items` (não altera nem integra `dev69/rust-core-m45`).

## Código criado, de verdade
- `crates/core-items/` (Rust 2021, std-only): catálogo fonte com 125 registros, 122 valores oficiais de revenda, 92 receitas, tags/role/pet/quest e cálculo recursivo de componentes por instância.
- `crates/core-economy/` (Rust 2021, depende localmente de core-items): propriedade de equipe, shop-context do ator do servidor, compras, vendas com valor oficial, desconto por receita, slots 6, exclusividades, pet do jungler, ouro, limite de Undo 16, invalidação por saída física e exigência de tempo/versão externa para desfazer.
- Sem mudança de gameplay JS. Sem `core-state` copiado. Os crates são autônomos para cherry-pick isolado; coordenador precisa adicionar membros ao workspace e conectar com `core-state`.

## Limitações e API honesta
**Isto é implementação Rust PARCIAL**, não a migração completa da loja:
- Aritmética de ouro + inventário **é executável Rust quando compilada**, mas ainda não existe ator de partida Rust, transporte, core-map/pathing, stats derivados, passivas, runas, trinkets, combat, objetiva, economia de minions/XP.
- `ShopReceipt.item_stats_pending=true` obriga o futuro ator a aplicar o delta de atributos junto com gold/inventário **atomicamente**, ou abortar.
- `ShopContext` contém hora/fase/alcance da fonte/revisão do campeão e **deve ser criado só no servidor**. Paridade de Undo de um campeão completo requer canonical full-unit fingerprint do core-state, não apenas dados econômicos.
- `item_stats_pending` NÃO certifica efeito; nenhum ID `reference_only` é promovido como gameplay.
- Não há replay ACK/dedup de rede aqui; responsabilidade de core-protocol e core-replay.
- É proibido promover esta branch como autoridade Rust ou executar compra via cliente WASM.

## QA executado nesta sessão
Validação **estática** via GitHub+JS fonte: 125 itens = 125 linhas Rust, todos os preços/valores oficiais de venda/receitas/tags/role-lock/pet associados ao mesmo catálogo legado congelado. Conferência de escopo e imports/Cargo entre os crates. A execução Rust `cargo test` NÃO FOI POSSÍVEL neste ambiente: `cargo`, `rustc` e `rustfmt` não estão instalados, DNS externo do terminal indisponível. Portanto, os oito testes `#[test]` em core-economy e quatro em core-items estão **DEFINED / NOT_RUN**, não marcar PASS nativo.
```bash
cargo test --manifest-path crates/core-items/Cargo.toml --offline
cargo test --manifest-path crates/core-economy/Cargo.toml --offline
cargo fmt --manifest-path crates/core-items/Cargo.toml --check
cargo fmt --manifest-path crates/core-economy/Cargo.toml --check
```
Não adicionar workflows/dispatch. Compilação e integração Rust real são gates pendentes, assim como HTTP, WASM, G8.
Não houve GitHub Actions, merge, rebase ou force-push.

## Handoff para o coordenador
1. Revisar contratos de `core-state` (Team, IDs, unidades) e substituir o enum `Team` local por um único tipo autoritativo ao integrar.
2. Adicionar somente os crates ao workspace Rust existente, sem sobrescrever seu `Cargo.toml` nem a engine original.
3. Compilar com `cargo test` real antes de afirmar paridade ou modificar produção.
4. Conectar economia ao ator de partida Rust com mutation rollback completa de item stats, ledger e cooldowns.
5. Implementar os casos G8 com PvP de dois seats, snapshots e composição de itens, incluindo o P1 conhecido de trinket.

Próxima prioridade: B12B — testar compilação Rust fora de Actions quando toolchain existir, adicionar golden comparativo Rust/JS para receitas e restringir Undo a fingerprint global do campeão.
