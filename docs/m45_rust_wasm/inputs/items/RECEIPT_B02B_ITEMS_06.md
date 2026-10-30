# M45 / Chat 3 — Recibo de execução B02B-ITEMS Lote 06

**Data:** 2026-10-30  
**Estado:** JS_SOURCE_V8_ADVERSARIAL_PASS_WITH_LEGACY_GAP; NODE_ESM_NOT_RUN; RUST_NATIVE/WASM_NOT_RUN; G8_NOT_CERTIFIED.  
**Branch de escrita:** `dev69/m45-audit-items`.  
**Legado de itens (somente leitura):** `dev69/items-batch2@182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d`.  
**Motor congelado:** `engine.mjs` blob `e06cfe0c18ded3d21f7a1d9bc62909543ccbbb6d`.  
**Gateway congelado:** `authoritative_actions_v453_dev44.mjs` blob `b2ebb58248c8aec9aee0a64c354150757cd71a4a`, extensão dev47.  
**Integração congelada:** `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`.  
**Rust core verificado:** `dev69/rust-core-m45@0dda9398cb9e37b3a54d74cea8ab9b698a752fee`. Encontrado somente `crates/core-state/Cargo.toml`; faltam `core-economy` e `core-items`.

## Implementação e evidência

1. **`adversarial_b06_cases.mjs`** — nova função JS pura `runAdversarialItemsB06({Arena,Gateway,map,mask,checksumV40})`, sem Node ou ESM imports. O **mesmo arquivo** de casos pode ser carregado via `import` nativo Node ou por avaliação V8 do código removendo apenas a sintaxe `export`, sem duplicar o conjunto de casos e inventar resultados.
2. **`golden_b06_adversarial.test.mjs`** — novo runner Node ESM com `assertFrozenSourcesB03({server:true})`, carrega as classes **reais** de engine e gateway, exige 92/92 casos e compara as 92 saídas com segunda execução da mesma seed. Só emite `GOLDEN_B06_ADVERSARIAL_EXECUTED.json` com `--write` após passar pelas assertions. **Node ESM ainda NÃO executado**.
3. **`run_items_goldens_b04.mjs`** — atualizado para incluir golden B06 após B01–B04 no runner total fail-closed, agora **391 cenários candidatos cumulativos** (299 anteriores + 92 novos). Mesmo contrato `--write` somente depois dos checks.
4. **`QA_V8_ADVERSARIAL_B06.json`** — recibo efetivamente executado em V8 com todos os 92 resultados, seeds, checksums, respostas do gateway, SHAs de arquivos e paridade entre duas execuções.
5. **`ECONOMY_PROTOCOL_CONTRACT_B06.json`** — proposta máquina legível para Chat 1: envelope de autoridade `seat`/campeão, número de sequência, idempotência, validação de fase e payload; seis operações de loja e o desvio explícito `item.trinket`; invariantes de receita, ouro, Undo, rota de pet/suporte, visão privada e ordem total de replay.

## QA: execução REAL do código fonte JS em V8

`engine.mjs`, mapa/máscaras e gateway `AuthoritativeActionsV453Dev44/47` foram obtidos dos Git blobs reais pelo conector GitHub. A engine foi compilada no interpretador V8 após retirar **somente `export` de nível superior**; o gateway carregou o próprio código original após retirar imports e usou shim de `structuredClone` para resultados simples. A função de casos foi compilada **diretamente do arquivo versionado** `adversarial_b06_cases.mjs`. As entradas foram invocadas de fato sobre `new Arena` com seed fixa, sem mock dos métodos de negócio.

| Classe | Casos | Execução | Resultado |
|---|---:|---|---|
| Economia, compras, receitas, revendas, Undo, filas, limites | 60 | V8 source runtime | **60/60 expectativas PASS** |
| Gateway autoritativo: ACL, entrada malformada, mesmo seq, replay, reconexão, duas seats | 29 | V8 classes dev44/dev47 | **29/29 expectativas PASS** |
| Rejeições de trinket no gateway PvP (P1 legado ainda aberto) | 2 | V8 gateway | **2/2 rejeições reproduzidas** — não funcionais |
| Ordem relativa dos comandos de compra entre equipes | 1 | V8 duas arenas + gateway | **1/1 contrato observado** |
| **Total** | **92** | **V8 real** | **92/92 expectativas, zero erro no conjunto auditado** |

Repetição integral: **92/92 casos produziram resultados idênticos** em duas execuções completas (184 avaliações de casos). Isso é reprodutibilidade JS do cenário testado, NÃO parity Rust.

### Contrato novo: ordem das ações altera checksum global

Em duas partidas iniciais com seed fixa **460699**, ambos os times compraram somente um item, em ordens diferentes:

| Ordem de recebimento | Ouro azul / vermelho | Itens | Checksum global V40 |
|---|---|---|---|
| Azul compra → vermelho compra | 1700 / 1650 | boots / long_sword | `a7eb3c8e` |
| Vermelho compra → azul compra | 1700 / 1650 | boots / long_sword | `0c00bfae` |

A economia é **comutativa** nesse caso, mas a lista global de eventos e as revisões ACK dependem da ordem de recebimento; por isso, os snapshots não são idênticos. **Isso não é automaticamente bug**. No Rust, o replay precisa guardar a **ordem total autoritativa de comandos confirmados** em vez de agrupar compras por time e reordená-las arbitrariamente. Identificador `P2_REPLAY_CONTRACT_NOT_AUTOMATIC_BUG` registrado no JSON de protocolo.

### P1 trinket legado permanece aberto

`item.buy`, `item.queue` e `item.trinket` continuam sendo recusados pelo gateway PvP para `trinket_oracle`; essa rejeição preserva ouro/inventário. `Arena.setTrinket` permite troca internamente. Os dois cenários negativos **passarem significa que a lacuna foi confirmada**, não que o recurso esteja aprovado. No Rust, `item.trinket` exige correção explícita do protocolo, com owner, fonte, nenhum custo/slot, cooldown preservado e idempotência.

## Regras de QA e limites

- **V8 source:** 92/92 resultados esperados; replay 92/92.
- **Node ESM:** NOT_RUN. Os arquivos `.test.mjs` de B01–B06 ainda exigem checkout completo para execução literal.
- **PvPRoomRegistry, HTTP, sockets, browser, assets:** NOT_RUN.
- **Rust native, rustc/cargo, WASM:** NOT_RUN; crates core-economy e core-items não publicados.
- **G0:** PARTIAL. **G1:** NOT_RUN. **G2/G3/G6:** source-only, não certificados. **G8:** NOT_CERTIFIED.
- Uma primeira versão do caso de ordem incluía compras iniciais da Arena no recorte de eventos; corrigido o recorte de fixture e **reexecutados os 92/92 casos**. Não houve alteração na engine legada.

## Comandos de reprodução Node em checkout íntegro

```sh
git switch dev69/m45-audit-items
node --check docs/m45_rust_wasm/inputs/items/adversarial_b06_cases.mjs
node --check docs/m45_rust_wasm/inputs/items/golden_b06_adversarial.test.mjs
node docs/m45_rust_wasm/inputs/items/golden_b06_adversarial.test.mjs
# Somente após PASS completo:
node docs/m45_rust_wasm/inputs/items/run_items_goldens_b04.mjs --write
```

## Handoff para Chat 1

Receber a evidência do **mesmo código fonte JS** em V8 e o contrato `ECONOMY_PROTOCOL_CONTRACT_B06.json`, sem promover G8. Implementar/projetar no momento adequado: `core-protocol` e recibos idempotentes, `core-economy` loja/revenda/Undo físico, `core-items` para receitas/procs/trinkets e `core-replay` com log de ordem global. No modelo **um humano com cinco campeões por equipe**, `unitId` deve pertencer à seat autenticada; alterações de sequência e troca de `unitId` no mesmo número não podem reexecutar compras. Preserve o bug de trinket como **desvio funcional obrigatório da portagem**, não como suposta parity.

**Próxima prioridade:** validação literal Node ESM/HTTP quando disponível, inventário de itens com efeitos indiretos ainda sem cobertura e contratos Rust após B12/B13/B23. Nenhuma alteração de engine de produção, merge, rebase, force-push, Actions ou PR #19.
