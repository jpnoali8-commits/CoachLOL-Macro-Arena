# CoachLOL M45 / Chat 3 — B02B-ITEMS B01 (recibo independente)

**Modo:** MIGRATION_ONLY. **Escopo:** auditoria inicial ESTÁTICA de itens/economia e preparação de oráculo golden, NÃO migração concluída.
**Origem somente leitura:** `dev69/items-batch2@182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d`.
**Comparação somente leitura:** `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`.
**Rust central lido:** `dev69/rust-core-m45@40e5598838bb4c2d4ec9d4a62c4f0acc30644aaf`.
**Branch de escrita:** `dev69/m45-audit-items`. Nenhum arquivo do núcleo central, do PR #9, main ou branches originais foi editado.

## Entregas nesta branch

- `ITEM_INVENTORY_B01.json`: matriz machine-readable por 210 IDs de loja com origem, commit, SHA do blob, executores candidatos e linhas, preço, venda, receita, status do catálogo, regra de efeito, maturity, evidência textual de testes, migração e bloqueadores.
- `golden_b01.test.mjs`: oráculo executável da própria fonte; 11 resultados de cenário são gerados em tempo de execução por Node, com estado anterior/posterior, seed quando disponível, equipe, ação, snapshot checksum V40, SHA256 da fixture e ID do caso.
- `GOLDEN_B01_SPEC.json`: definição e IDs esperados, sem falsificar saídas do motor.
- Este recibo: limitações, QA e encaminhamento ao Chat 1.

## Inventário verificado diretamente por código-fonte

| Grupo | Quantidade | O que a contagem prova |
|---|---:|---|
| Rows SR 26.21 | 210 | catálogo de disponibilidade Data Dragon 16.21.1 no arquivo dev49 |
| `engine_playable` | 122 | mapeado para ID local e catálogo JS; **não prova paridade de todas as passivas** |
| `reference_only` | 80 | dados disponíveis sem implementação jogável; bloquear promoção |
| Exclusivos de campeão | 3 | disponibilidade condicional fora da loja geral |
| Conditional quest | 5 | disponibilidade dependente de missão/condição |
| `catalog` do motor | 125 | 122 mapeados da loja + `support_compass`, `support_bounty`, `trinket_farsight` |
| `ITEM_EFFECTS_V43` | 51 | declarações de efeito no motor, maturidades heterogêneas |
| `ITEM_FAMILY_RULES_V453_DEV69` | 15 | famílias adicionadas, não contar como entradas de `ITEM_EFFECTS` |
| `ITEM_RECIPES` | 92 | receitas mapeadas estaticamente |
| `ITEM_SELL_VALUES_V453_DEV60` | 122 | valores de venda específicos |
| Registro legado `data/item_registry_v43.json` | 41 | dados antigos, **não** substituir catálogo atual |

Distribuição conservadora das 210 linhas na matriz: **56 SOURCE_ONLY**, **66 PARTIAL**, **80 REFERENCE_ONLY**, **8 BLOCKED** (5 conditional quest + 3 champion exclusive). Os estados significam classificação de migração, não quantidade de itens completos nem percentuais Rust.

**Atenção — discrepância real:** `dorans_ring` custa **450** no `data/item_registry_v43.json`, mas **400** no `engine.mjs` da fonte atual. A venda vem de `gold.sell`, não de regra genérica de 70%. A origem do jogo executável deve prevalecer como golden congelado, enquanto a divergência histórica precisa ser documentada.

## Diferença concreta em relação à integração

Os oito métodos presentes no motor de itens e ausentes do motor de integração, pelo nome da classe `Arena`, são:
`derivedItemStatsV453Dev69`, `itemBattleRampV453Dev69`, `refreshKaenicShieldV453Dev69`,
`procLifelineV453Dev69`, `onBulkItemChampionHitV453Dev69`,
`itemAnnulSpecV453Dev69Batch2`, `refreshItemAnnulV453Dev69Batch2`, `consumeItemAnnulV453Dev69Batch2`.

A comparação de **nomes de métodos** não prova que todos os demais comportamentos são iguais; diffs de corpos, patch, procs e snapshots ainda são pendentes. **PROIBIDO substituir** `engine.mjs` da integração inteiro.

## Undo (invariante crítica)

Origem: `engine.mjs`, métodos `invalidateShopUndoOnDepartureV453Dev61`, `recordShopUndoV453Dev61`, `canUndoShopV453Dev61`, `undoShopV453Dev61`, `buy`, `sellItemV43`.

- Saída **física** da fonte invalida toda pilha da visita, inclusive quando o tempo de jogo não avança.
- Retorno à fonte ou restauração de snapshot/reconexão não recuperam o Undo antigo.
- Somente **nova transação após retorno** pode iniciar histórico reversível independente.
- Compra tem custo integral revertido no Undo, venda usa revenda oficial depreciada se não for Undo.
- Sequências/owner/team devem ser validados pelo servidor; estado enviado pelo cliente não redefine gold/inventário.

Os testes legados `tests/v453_dev61_shop_undo_pvp.test.mjs` e `tests/v453_dev60_pvp_shop_refunds.test.mjs` contêm cenários dessas condições, inclusive blue/red, HTTP e re-hidratação do estado. São **código de teste encontrado**, não resultados rerodados nesta sessão.

## QA desta entrega — distinguir tipos de prova

- **PASS (19/19):** validação **estática** executada no conector GitHub sobre a matriz publicada (210 registros, distribuição 122/80/3/5, 125 locais, 51 efeitos, 15 famílias, 122 revendas, 92 receitas, 8 métodos diferenciais, discrepância e proibição de falsos Rust).
- **NOT_RUN:** `node --check`, testes JS existentes, `golden_b01.test.mjs`, hashes de snapshots reais, comparação JS/Rust, PvP real azul/vermelho, `cargo test`, WASM, HTTP/browser. O conector permite leitura/gravação GitHub, **mas não oferece execução do checkout completo**; não usar inspeção como PASS de runtime.
- **NOT_CREATED (deliberado):** `GOLDEN_B01_EXECUTED.json`; será produzido SOMENTE pelo `--write` após executar o motor da origem no checkout completo.
- **G0:** PARTIAL. **G1–G8:** nenhum gate aprovado por este recibo. Não houve produção de novos itens nem autorização de nova feature JS.

Para reproduzir em ambiente com checkout e Node:

```bash
git switch dev69/m45-audit-items
node --check engine.mjs
node --check docs/m45_rust_wasm/inputs/items/golden_b01.test.mjs
node tests/v453_dev60_pvp_shop_refunds.test.mjs
node tests/v453_dev61_shop_undo_pvp.test.mjs
node tests/v453_dev69_items_batch1.test.mjs
node tests/v453_dev69_items_batch2.test.mjs
node tests/v453_dev69_items_bulk_18.test.mjs
node docs/m45_rust_wasm/inputs/items/golden_b01.test.mjs --write
```

Se algum teste falhar, registrar stdout/stderr, SHA, falha e *não* promover fixture à golden aceita. Repetir por `blue`/`red`, snapshot e autoridade server. O runner golden é teste novo, não substitui os legados.

## Handoff para Chat 1

**Revisar** a matriz e receber estes oito executores novos + famílias. Não aplicar cherry-pick cego de `engine.mjs`; não promover `reference_only`. Solicitar contratos de `core-economy` e `core-items` antes da portagem Rust. Dependências principais: schema de `gold`, `inventory`, `shop history` por visita física, `event_id`, cooldown/stack/tick e projeção filtrada por time. Goldens devem preservar preços de `gold.sell`, diferença entre venda e Undo, owners, snapshots e idempotência de proc.

**Próxima prioridade elegível deste Chat 3:** ampliar mapeamento funcional por item e executar golden JS do lote, com QA de interações, fonte, casos anti-dupla-aplicação e PvP; iniciar portagem Rust somente após o contrato dos crates ter sido publicado pelo coordenador.

**Rollback:** `git revert` dos commits desta branch de auditoria; sem reset, force push, merge ou cópia destrutiva de motor.

## Lote 02 / B02B-ITEMS — continuação 2026-10-30
Recibo canônico do segundo lote: [RECEIPT_B02B_ITEMS_02.md](RECEIPT_B02B_ITEMS_02.md). Artefatos: [SOURCE_METHOD_DIFF_B02.json](SOURCE_METHOD_DIFF_B02.json), [TEST_PROVENANCE_INDEX_B02.json](TEST_PROVENANCE_INDEX_B02.json), [STATIC_QA_B02.json](STATIC_QA_B02.json), [ECONOMY_INTERFACES_B02.json](ECONOMY_INTERFACES_B02.json) e [golden_b02_catalog.test.mjs](golden_b02_catalog.test.mjs).

Este lote conferiu 122 preços e revendas + 89 receitas com o arquivo Riot arquivado e identificou 8 métodos Arena exclusivos e 8 compartilhados alterados. Catalogou 43 arquivos/458 labels de teste, mapeou 14 interfaces e preparou 244 golden cases azul/vermelho. **QA runtime permanece NOT_RUN**; não confundir comparação estática com execução do JS, PvP ou Rust.

## B02B-ITEMS Lote 03 — 2026-10-30

[Recibo completo L03](RECEIPT_B02B_ITEMS_03.md). Acesso aos artefatos:
[oracle_source_lock_b03.mjs](oracle_source_lock_b03.mjs),
[golden_b03_effects.test.mjs](golden_b03_effects.test.mjs),
[golden_b03_effects_extra.test.mjs](golden_b03_effects_extra.test.mjs),
[EFFECT_FAMILY_QUEUE_B03.json](EFFECT_FAMILY_QUEUE_B03.json),
[UNDO_SPATIAL_AUDIT_B03.json](UNDO_SPATIAL_AUDIT_B03.json) e
[STATIC_QA_B03.json](STATIC_QA_B03.json).

**Estado:** 8/8 blobs de origem verificados estaticamente, 15/15 famílias com fixture azul/vermelho preparada, mais 3 itens Anular (total 36 casos de efeito). As 11 fixtures B01 e 244 B02 continuam preparadas e **NOT_RUN**, assim como as 36 do B03. **Nenhuma migração Rust e nenhum golden dinâmico certificado.**
