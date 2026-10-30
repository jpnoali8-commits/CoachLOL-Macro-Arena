# M45 / Chat 3 — B02B-ITEMS Lote 05: execução JS/V8 e handoff

**Data:** 2026-10-30  
**Estado:** V8_SOURCE_BEHAVIOR_EXECUTED / NODE_ESM_NOT_RUN / RUST_WASM_NOT_RUN / G8_NOT_CERTIFIED.  
**Branch exclusiva de escrita:** `dev69/m45-audit-items`  
**Fonte engine (imutável):** `dev69/items-batch2@182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d` — blob `e06cfe0c18ded3d21f7a1d9bc62909543ccbbb6d`  
**Integração somente leitura:** `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`  
**Rust core consultado:** `dev69/rust-core-m45@c8e8f182b87d720619fe5747076b8221413acde7` (somente crate `core-state`); não alterado.

## Desbloqueio legítimo: testes dinâmicos sem checkout de disco

O clone por `github.com` segue inacessível pelo DNS do terminal. Foi possível obter a **engine original por GitHub conector**, remover SOMENTE os marcadores ESM `export` do código carregado em memória e compilar o restante com o interpretador **JavaScript V8** no próprio ambiente de orquestração. Carregamos os JSONs do mapa, máscaras e referência de loja do GitHub real; instanciamos `new Arena(map,mask,{seed,mode:'pvp'})` e invocamos `buy`, `sellItemV43`, `setTrinket`, `undoShopV453Dev61`, `snapshotV40`, `fromSnapshotV40` e `checksumV40`. Os executores originais de `AuthoritativeActionsV453Dev44` e `AuthoritativeActionsV453Dev47` também foram carregados do código GitHub, com `node:*` removido e shim estrito de `structuredClone` para objetos planos, e seus métodos `submit` foram invocados de fato.

**Isso é execução de lógica da engine e do gateway em V8, NÃO é um PASS dos arquivos Node `.test.mjs`, nem uma execução da sala HTTP/servidor real, nem prova de paridade Rust/WASM.** Os cenários executados adaptam o ambiente de ESM/Node, mas usam o motor congelado e, nos casos de B03, as próprias funções `exercise()` extraídas sem modificações dos goldens versionados. Registros incluem linha de origem por blob SHA, seed, recibos e checksums V40.

## Resultados reais da execução V8

| Família | Cenários executados | Resultado | Evidência |
|---|---:|---|---|
| B01: compras, Undo, venda, saída-retorno, snapshot, ACL gateway | 11 | **11/11 PASS** | `QA_V8_ECONOMY_B05.json` |
| B02: 120 compras SR × 2 times + 2 trinkets SR × 2 times | 244 | **244/244 PASS** | `QA_V8_CATALOG_B05.json` |
| B03 + B03B: 18 itens/efeitos × 2 times | 36 | **36/36 PASS** | `QA_V8_EFFECTS_B05.json` |
| B04: três trinkets (stealth/oracle/farsight) × 2 times | 6 | **6/6 PASS (motor interno)** | `QA_V8_TRINKET_PVP_B05.json` |
| B04: gateway PvP rejeita trinket por 3 rotas × 2 times | 2 | **2/2 rejeições esperadas** — **BUG P1 real presente** | `QA_V8_TRINKET_PVP_B05.json` |
| **Total** | **299** | **297 resultados positivos + 2 negativos esperados**, zero erro no modelo testado | `QA_V8_CONSOLIDATED_B05.json` |

**Determinismo adicional:** 244 combinações item × time foram executadas **duas vezes em arenas novas** com a mesma seed, comparando os checkpoints antes/depois de compra ou troca, e após Undo quando aplicável. **244/244 pares de checksums coincidiram, 488 execuções**, em `QA_V8_DETERMINISM_B05.json`. Isso prova reprodutibilidade das sequências testadas no motor JS, não paridade Rust.

### P1 — lacuna reproduzida na fronteira PvP

Gateway autoritativo real (classes dev44/dev47), para jogadores azul e vermelho:
- `item.buy {itemId:"trinket_oracle"}` → `ok:false`, razão `Trinkets são trocados sem custo na fonte.`
- `item.queue {itemId:"trinket_oracle"}` → `ok:false`, razão `Compra programada indisponível.`
- `item.trinket {itemId:"trinket_oracle"}` → `ok:false`, razão `comando_invalido`.

Nos seis comandos inválidos, **ouro/inventário/trinket/checksum V40 não mudaram**. O comando correto `Arena.purchaseOrPlan/setTrinket` funciona internamente e passou nos seis cenários B04. **Portar para Rust com uma ação explícita `item.trinket`, reconhecendo que isso é correção de lacuna histórica, não paridade literal com o gateway quebrado.**

## Artefatos versionados (evidências individuais)

- `QA_V8_CATALOG_B05.json` (244 casos com `source_commit`, itemId, time, seed, checksum, recibos de preço, Undo ou troca).
- `QA_V8_EFFECTS_B05.json` (36 casos B03/B03B, resultados observados de dano/CC/escudo/stacks/aura e hashes).
- `QA_V8_ECONOMY_B05.json` (11 casos de compra/Undo/recall/snapshot/ACL incluindo classes de gateway).
- `QA_V8_TRINKET_PVP_B05.json` (seis operações internas e duas negativas gateway; classe e mensagens reais).
- `QA_V8_DETERMINISM_B05.json` (244 replays comparados, 488 execuções).
- `QA_V8_CONSOLIDATED_B05.json` (manifest central deste lote e referências SHA dos cinco recibos).

**Não foram criados `GOLDEN_Bxx_EXECUTED.json`**: tais nomes são reservados para execução real do `node` no checkout, que ainda está pendente.

## Gates / o que ainda NÃO foi certificado

- **G0:** PARTIAL (inventário e V8 provas de origem disponíveis; falta reconciliação com Chat 1).
- **G1:** NOT_RUN. Sem `cargo`, `rustc` e WASM native.
- **G2:** PARTIAL_SOURCE_JS_ONLY. Testes isolados de estado/snapshot e duas execuções por seed, mas não Rust replay.
- **G3:** PARTIAL_GATEWAY_CLASS_ONLY. Gateway dev44/dev47 invocado, mas sem `PvPRoomRegistry`, token/cookie/HTTP, reconnect de server real e rede.
- **G6:** PARTIAL_SOURCE_JS_ONLY. Não há catálogo de itens executável em Rust.
- **G8:** NOT_CERTIFIED. `MIGRATION_ONLY` permanece obrigatoriamente ativo.
- **Node ESM / testes legados / browser:** NOT_RUN neste lote. V8 carregou blocos da engine, não `node tests/...`.

## Handoff para Chat 1

1. Reconhecer que B02B tem **299 casos da origem JS executados via V8** (prova com SHAs/seed/recibos) e 244 verificações de determinismo por repetição. **Não elevar G1/G8 por isso.**
2. Preservar a matriz: 210 itens SR, 122 locais jogáveis, **120 compras + 2 trocas SR**, mais `trinket_farsight` local. Catálogo `reference_only` não é implementação.
3. Mapear `item.buy`, `item.sell`, `item.undo`, `item.queue` e novo `item.trinket` no futuro contrato `core-protocol`, com ACL, validação de fonte, sem custo, cooldown persistente, idempotência e visão privada de equipe.
4. A migração real de `core-economy` e `core-items` permanece bloqueada por B12/B13/B23 e toolchain; não escrever Rust fora da branch central. **A engine legada e os PRs originais não foram tocados.**
5. Próximo passo elegível: ampliar os cenários adversariais do gateway (replay, combinação de item e reação) e obter execução ESM Node/HTTP e builds Rust no ambiente que tenha checkout/toolchain, ou integrar os casos V8 ao runner verificável.

## Reproduzir executáveis Node quando checkout estiver disponível

```sh
git switch dev69/m45-audit-items
node docs/m45_rust_wasm/inputs/items/run_items_goldens_b04.mjs
node docs/m45_rust_wasm/inputs/items/run_items_goldens_b04.mjs --write
```

O runner `run_items_goldens_b04.mjs` só publica os goldens após as assertions passarem; qualquer divergência vira FAIL, sem tolerância arbitrária.

**Nenhum merge, rebase, force-push, Actions, Codespaces ou alteração de fonte de gameplay.**
