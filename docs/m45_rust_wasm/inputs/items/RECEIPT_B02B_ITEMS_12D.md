# M45 — B02B-ITEMS B12D / Atomic Shop + base stats Rust

**Branch:** `dev69/m45-audit-items`, 2026-10-30.

## Código real
- `core-items/src/stats.rs` contém 125 tabelas de stats extraídas do JS congelado e expõe `item_stats`.
- `core-economy/src/transaction.rs` implementa `AtomicShop` com staged clones de `ShopUnit` (ouro/inventário) e `LiveItemStats`. Compra/venda só fazem commit se TODA reconciliação de atributos e hook externo terminar sem falhas. Uma falha de stats, hook ou compra não altera nada.
- Undo restaura **snapshot numérico de atributos** e economia em LIFO; impedido quando o estado runtime ou `champion_revision` diferir. Saída da fonte apaga histórico e não revive ao retornar.
- Tipos e interfaces ainda isolados da branch do coordenador; uso no ator Rust requer transação maior que cubra event ledger/cooldowns e canonical champion fingerprint.

## QA V8 genuíno
`QA_V8_BASE_STATS_B12D.json`: **250/250** verificações de atributos base com a função `Arena.applyItemStatsV43` em duas equipes, mais 250 reversões, sem erros. Verificado estatisticamente o mapeamento da fonte para 125 registros Rust. Não foi executado Rust.
`QA_RUST_ATOMIC_SHOP_B12D.json`: evidência de código/limites e 8 testes Rust adicionados (6 module unit + 2 integration), **DEFINED/NOT_RUN**.

## Limites críticos
`cargo/rustc/rustfmt` ausentes no container. Sem compilação, não declarar nenhum Rust PASS. `LiveItemStats` modela apenas stats base (23 chaves) e não representa passivas/ativos/cooldowns/Rabadon. O hook recebe apenas cópia do estado numérico. Não integrar/usar essa implementação isolada no servidor PvP até revisão pelo coordenador, compile e gates de replay e interação.

Não disparou GitHub Actions; não alterou engine JS, PR original ou outras branches.
Próximo B12E: resolver compilação fora de Actions e completar efeitos/on-hit/cooldowns como transação ao migrar core-combat e core-protocol.
