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

## B02B-ITEMS Lote 04 — 2026-10-30

[Recibo B04 completo](RECEIPT_B02B_ITEMS_04.md) ·
[SHOP_DISPATCH_B04.json](SHOP_DISPATCH_B04.json) ·
[PVP_TRINKET_GAP_B04.json](PVP_TRINKET_GAP_B04.json) ·
[STATIC_QA_B04.json](STATIC_QA_B04.json) ·
[golden_b04_trinket_acl.test.mjs](golden_b04_trinket_acl.test.mjs) ·
[golden_b04_pvp_gap.test.mjs](golden_b04_pvp_gap.test.mjs) ·
[run_items_goldens_b04.mjs](run_items_goldens_b04.mjs).

A classificação de **122 engine_playable** foi refinada para **120 compras normais + 2 trinkets não compráveis**, cada um para azul/vermelho. Golden B02 corrigido para manter 244 casos honestos. P1 detectado: a troca interna de trinket não possui uma rota no gateway PvP legado (`item.buy` chama `Arena.buy` e não `purchaseOrPlan`). O protocolo Rust precisa registrar a correção como **desvio explícito de paridade**; não declarar que a feature PvP já está funcional.

Node `--check` **PASS** em três blobs B04 idênticos ao GitHub. Runner real tentou primeira passagem sem gravar e **parou corretamente** na ausência do checkout completo. **299 casos preparados, ZERO cenários de gameplay executados** nesta sessão. Migrar somente após gates e contratos centrais.

## B02B-ITEMS Lote 05 — 2026-10-30

[RECEIPT_B02B_ITEMS_05.md](RECEIPT_B02B_ITEMS_05.md) é o handoff canônico. Evidências por lote:
[QA_V8_CATALOG_B05.json](QA_V8_CATALOG_B05.json),
[QA_V8_EFFECTS_B05.json](QA_V8_EFFECTS_B05.json),
[QA_V8_ECONOMY_B05.json](QA_V8_ECONOMY_B05.json),
[QA_V8_TRINKET_PVP_B05.json](QA_V8_TRINKET_PVP_B05.json),
[QA_V8_DETERMINISM_B05.json](QA_V8_DETERMINISM_B05.json) e
[QA_V8_CONSOLIDATED_B05.json](QA_V8_CONSOLIDATED_B05.json).

**V8_SOURCE_EXECUTED:** 299 casos com resultados esperados: 244 catálogo, 36 efeitos, 11 loja/Undo/snapshot/ACL, seis trinkets internos e duas rejeições intencionais que **confirmam uma lacuna P1 no gateway PvP legado**. Adicionalmente, 244 replays em duas arenas com seeds idênticas produziram 244 checksums de sequência equivalentes (488 execuções). A fonte original da engine foi avaliada em V8 após remoção somente da palavra-chave ESM export; o gateway dev44/dev47 executou via shim structuredClone em vez de Node. **NODE_ESM_NOT_RUN**, `PvPRoomRegistry` / HTTP **NOT_RUN**, Rust native/WASM **NOT_RUN**, G8 **NOT_CERTIFIED**. Os arquivos golden de Node não foram gerados artificialmente.

## B02B-ITEMS Lote 06 — 2026-10-30

[Recibo B06](RECEIPT_B02B_ITEMS_06.md) ·
[casos JS puros B06](adversarial_b06_cases.mjs) ·
[runner Node B06](golden_b06_adversarial.test.mjs) ·
[execução V8 B06](QA_V8_ADVERSARIAL_B06.json) ·
[contrato Rust para economia/protocolo/replay](ECONOMY_PROTOCOL_CONTRACT_B06.json).

**Execução:** 92/92 resultados esperados no motor original JS via V8, com 92/92 repetições equivalentes; 60 testes economia, 29 gateway, 2 negativas P1 trinket e 1 verificação de ordenação. **Contratos sem paridade Rust certificada.** A ordem de compra por times diferentes não muda os saldos, mas muda os eventos/ACK e checksum global V40; replay Rust deve preservar ordem autoritativa de commit. O runner agregado de B01–B06 soma **391 casos preparados para Node** (299 anteriores + 92 B06); a suíte Node literal e Cargo/WASM seguem **NOT_RUN**.

## B02B-ITEMS Lote 07 — 2026-10-30

[Recibo B07](RECEIPT_B02B_ITEMS_07.md) ·
[matriz executável de cross-items](cross_items_b07_cases.mjs) ·
[runner Node ESM B07](golden_b07_cross_items.test.mjs) ·
[QA V8 B07](QA_V8_CROSS_ITEMS_B07.json) ·
[cobertura e itens pendentes](EFFECT_CROSS_COVERAGE_B07.json) ·
[contrato de ordem do combate Rust](ITEM_COMBAT_ORDER_CONTRACT_B07.json).

**JS source/V8:** 23 interações × blue/red = **46/46 casos PASS**, com **46/46 registros repetidos identicamente** em nova execução; **34 IDs distintos de regras** referenciados pela matriz. Catálogo de fonte: 51 `ITEM_EFFECTS` e 15 `ITEM_FAMILY_RULES`; 22 entradas sem aparecimento nas matrizes B03/B07, não necessariamente sem testes legados. Runner cumulativo B01–B07: **437 casos planejados para Node**, mas Node ESM, HTTP, Cargo e WASM permanecem **NOT_RUN**. **G8 NOT_CERTIFIED**. Nenhuma mudança de regra em JS ou crate Rust publicada por este chat.

## B02B-ITEMS Lote 08 — 2026-10-30

[Recibo técnico B08](RECEIPT_B02B_ITEMS_08.md) ·
[22 testes de efeitos legados (puro JS)](legacy_effect_gaps_b08_cases.mjs) ·
[4 testes de gate skill/item (puro JS)](skill_item_action_gate_b08_cases.mjs) ·
[runner Node ESM B08](golden_b08_effects_and_actions.test.mjs) ·
[QA V8 executado B08](QA_V8_EFFECT_GAPS_B08.json) ·
[matriz atualizada dos 66 registros](REGISTRY_COVERAGE_B08.json).

**B08 em V8:** 22 efeitos previamente fora dos casos B03/B07, testados azul/vermelho (**44/44 PASS**), mais 4 cenários gate de habilidades Q/W × efeitos de itens azul/vermelho (**8/8 PASS**), **52/52 casos reprodutíveis**. As 66 entradas conhecidas do registro legadas estão agora ligadas a **alguma** evidência das matrizes B03/B07/B08, NÃO a paridade integral. O runner Node ESM soma **489 cenários preparados**, mas sua execução literal continua **NOT_RUN**, assim como HTTP, Rust nativo e WASM; G8 **NOT_CERTIFIED**. O primeiro preflight do B08 teve 4 falhas por precondições equivocadas nos testes de Dominik e Ídolo, posteriormente corrigidas e reexecutadas. Nenhuma mudança de gameplay em JavaScript.

## B02B-ITEMS Lote 09 — 2026-10-30

[RECEIPT_B02B_ITEMS_09.md](RECEIPT_B02B_ITEMS_09.md) ·
[spatial_skill_b09_cases.mjs](spatial_skill_b09_cases.mjs) ·
[golden_b09_spatial_skills.test.mjs](golden_b09_spatial_skills.test.mjs) ·
[QA_V8_SPATIAL_SKILLS_B09.json](QA_V8_SPATIAL_SKILLS_B09.json) ·
[SPATIAL_SKILL_RUST_CONTRACT_B09.json](SPATIAL_SKILL_RUST_CONTRACT_B09.json).

B09 exercitou **minions reais gerados por `spawnWaves`** e `Arena.moveAlong`: Dançarina Fantasma atravessa corpos vivos, mas não atravessa paredes; minions mortos não bloqueiam; Energizado é gerado por movimento efetivo. As habilidades **Ezreal Q e Nami W foram realmente executadas por seus métodos do motor** em arenas isoladas, incluindo projétil com impacto atrasado, barreiras/colisores, amplificação de cura, Liandry e Banshee. **30/30 PASS no V8 e 30/30 repetidos identicamente** (15 tipos × duas equipes). A fixture muda rótulos de campeão no lobby padrão apenas para testar os executores, logo NÃO é paridade total QWER. Runner cumulativo **519 casos Node preparados**; Node real, room HTTP, Rust/Cargo/WASM e G8 permanecem **NOT_RUN/NOT_CERTIFIED**. Gameplay JavaScript, integration, itens e Rust central preservados.

## B02B-ITEMS Lote 10 — 2026-10-30

[Recibo B10](RECEIPT_B02B_ITEMS_10.md) · [fixture snapshot/replay](snapshot_replay_b10_cases.mjs) · [runner Node](golden_b10_snapshot_replay.test.mjs) · [QA V8](QA_V8_SNAPSHOT_REPLAY_B10.json) · [contrato Rust](SNAPSHOT_REPLAY_RUST_CONTRACT_B10.json).

**B10:** 12 tipos x 2 equipes = **24/24 PASS V8**; **24/24 repetições idênticas** com restauração da fonte. Testes de projétil, escudo, Liandry, Energizado, cooldown e ticks. Runner cumulativo **543 cenários preparados para Node** (não executados). **Rust, HTTP, WASM e G8 permanecem pendentes**. Origem JS e crates centrais preservados.

## B02B-ITEMS Lote 11 — 2026-10-30

[Recibo B11](RECEIPT_B02B_ITEMS_11.md) · [fixture PvP real](pvp_replay_boundary_b11_cases.mjs) · [runner Node](golden_b11_pvp_replay_boundary.test.mjs) · [QA V8](QA_V8_PVP_REPLAY_BOUNDARY_B11.json) · [contrato Rust](PVP_REPLAY_RUST_CONTRACT_B11.json).

**B11:** 19 tipos x 2 equipes = **38/38 PASS JS/V8** e **38/38 replays equivalentes** no código original do gateway e sala, com shims Node determinísticos apenas no executor V8. NÃO certifica transporte HTTP/SSE, autenticação criptográfica, escrita durável em disco, Rust/WASM ou G8. Runner Node acumulado B01–B11: **581 candidatos não executados**. Engine original preservada.

## B02B-ITEMS Lote 12A — 2026-10-30

[Recibo Rust B12A](RECEIPT_B02B_ITEMS_12A.md) · [QA estático do catálogo Rust](QA_RUST_STATIC_B12A.json) · [core-items Rust](../../../../crates/core-items/src/lib.rs) · [core-economy Rust](../../../../crates/core-economy/src/lib.rs).

**Implementação Rust parcial publicada:** crates reais `core-items` + `core-economy`; 125/125 registros de item alinhados estaticamente ao motor legado, 92 receitas e 122 valores de revenda, 12 testes Rust escritos. **Cargo/rustc/rustfmt NOT_RUN (ausentes no terminal)**, sem importação no workspace do coordenador. A transação não aplica stats/passivas e precisa de commit atômico no match actor. G8 NÃO certificado. Próxima etapa: compilar/integrar somente quando coordenador aceitar os DTOs e houver toolchain, sem Actions.

## B02B-ITEMS Lote 12B — 2026-10-30

[Recibo B12B](RECEIPT_B02B_ITEMS_12B.md) · [QA do oráculo JS para Rust](QA_V8_RUST_GOLDENS_B12B.json). **1.000 casos de componentes/receitas + 258 passos buy/sell/Undo = 1.258 observações V8 da engine congelada**, com fixtures e 2 testes Rust adicionais. Rust `cargo test` **NOT_RUN**, nenhuma certificação nativa/WASM/HTTP/G8. Nenhum GitHub Actions.

## B02B-ITEMS Lote 12C — 2026-10-30

[Recibo B12C](RECEIPT_B02B_ITEMS_12C.md) · [QA de validação da fonte](QA_RUST_SOURCE_B12C.json) · [validador portátil](static_rust_items_b12c.mjs) · [runner Node](validate_rust_items_b12c.test.mjs).

Corrigida validação estrita de IDs Rust `blue_MID/red_MID` (antes aceitava `blue_FAKE_MID`). 2 testes Rust adicionados, **NOT_RUN**. Validação JS V8 reproduzível **125 itens, 1.000 receitas e estrutura de 258 linhas/44 cenários**, com fonte original congelada; não equivale a Cargo PASS. GitHub Actions 0.

## B02B-ITEMS Lote 12D — 2026-10-30

[Recibo B12D](RECEIPT_B02B_ITEMS_12D.md) · [QA stats fonte V8](QA_V8_BASE_STATS_B12D.json) · [QA transação Rust](QA_RUST_ATOMIC_SHOP_B12D.json). Implementados catálogo base de 125 itens e `AtomicShop` (compra, venda, Undo com stats + ouro + inventário em staging/commit). **250/250 atributos fonte V8 e reversões**, 8 testes Rust adicionais **NÃO EXECUTADOS** (cargo ausente). Gameplay/servidor JS, branch central e GitHub Actions preservados.

## B02B-ITEMS B12E — 2026-10-30

[Recibo B12E](RECEIPT_B02B_ITEMS_12E.md) · [QA V8 Mercury](QA_V8_MERCURY_B12E.json). Bandana/Cimitarra Mercurial migradas como adaptadores Rust isolados; **112 ações fonte JavaScript** executadas (64 aceitas, 48 recusadas), 5 novos testes Rust escritos e **NOT_RUN**. Sem integração no match actor e sem GitHub Actions.

## B02B-ITEMS B12F — 2026-10-30

[Recibo B12F](RECEIPT_B02B_ITEMS_12F.md) · [QA V8 Anular](QA_V8_ANNUL_LIFECYCLE_B12F.json). Rust isolado `AnnulState` e `ItemRuntimeShop` para Barreira Verdejante, Banshee e Limiar da Noite + Mercury lifecycle, com **236 ações reais JS** em 56 cenários e **8 testes Rust escritos / NOT_RUN**. Sem GitHub Actions.
