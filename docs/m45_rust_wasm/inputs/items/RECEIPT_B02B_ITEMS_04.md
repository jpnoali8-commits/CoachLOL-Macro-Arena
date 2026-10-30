# M45 — Chat 3 / B02B-ITEMS Lote 04

**Data:** 2026-10-30  
**Status:** STATIC PASS / NODE SYNTAX PASS / FULL GOLDEN NOT_RUN / RUST NOT_STARTED.  
**Branch de escrita exclusiva:** `dev69/m45-audit-items`.  
**Origem congelada:** `dev69/items-batch2@182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d`.  
**Integração preservada:** `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`.  
**Core Rust verificado:** `dev69/rust-core-m45@6bb6d2cc7f58c1e4053170276eddf56ebba9ab36` (apenas `core-state`; ainda faltam `core-economy` e `core-items`).

## Divergência real descoberta e corrigida NO ORÁCULO (não na engine)

`engine_playable` significa **122 entradas SR presentes no motor**, e **NÃO** 122 compras normais. As entradas `trinket_stealth` (3340) e `trinket_oracle` (3364) têm custo zero, não ocupam inventário e são trocadas via `Arena.setTrinket`. `Arena.canBuy` e `Arena.queuePurchase` rejeitam explicitamente `item.tags.includes('trinket')`. A chamada `Arena.purchaseOrPlan` remete esses IDs à troca; a troca também protege a recarga (não permite resetar cooldown).

**Correção aplicada em `golden_b02_catalog.test.mjs`:** antes tentava `Arena.buy` para 122 itens × dois times, causando pelo menos quatro falhas artificialmente. Agora são **120 compras × 2 = 240**, **2 trocas de trinket × 2 = 4**, total **244**. Para trinket stealth inicialmente equipado, primeiro alterna para oracle, depois retorna a stealth; o teste registra ouro e inventário intactos, evento, snapshot/checksum e resultado. Fonte do motor original **inalterada**.

`SHOP_DISPATCH_B04.json` contém a matriz de 210 itens SR: 120 compras, 2 trocas, 80 `reference_only`, 5 `conditional_quest`, 3 `champion_exclusive`; além de 3 IDs locais fora das entradas normais SR (suporte evoluído × 2 e trinket farsight × 1). **14/14 verificações estáticas PASS.**

## P1 — Lacuna PvP de trinket (não corrigir silenciosamente no legado)

A auditoria da fronteira `multiplayer/authoritative_actions_v453_dev44.mjs` (blob `b2ebb58248c8aec9aee0a64c354150757cd71a4a`) confirmou por leitura:
- `item.buy` invoca `Arena.buy`, não `purchaseOrPlan`;
- `item.queue` invoca `Arena.queuePurchase`;
- não existe `item.trinket` na allowlist nem no dispatcher PvP;
- `Arena.canBuy` rejeita todos os trinkets.

Portanto, o motor **interno** tem troca, mas o jogador conectado ao gateway autoritativo não tem comando correspondente. Classificado `P1_FUNCTIONAL_ACCESS_GAP` em `PVP_TRINKET_GAP_B04.json`, **suspeita funcional comprovada estaticamente**, ainda sem teste de rede executado. `golden_b04_pvp_gap.test.mjs` prepara duas provas negativas (azul/vermelho); um eventual PASS desse teste significa **rejeições reproduzidas**, jamais que trinket PvP está funcional. A correção de contrato Rust deve ser desvio de paridade **explícito e registrado**, não incorporação cega do bug.

## Testes novos e runner

- `golden_b04_trinket_acl.test.mjs` — 3 tipos (stealth, oracle e farsight) × 2 equipes = **6 cenários candidatos**: gateway interno `purchaseOrPlan`, troca recusada por inimigo, cancelamento de compra/queue inválida, ouro zero, sem slot de inventário, cooldown monotônico e restauração do snapshot.
- `golden_b04_pvp_gap.test.mjs` — **2 cenários candidatos**: `item.buy`, `item.queue` e `item.trinket` são rejeitados pelo gateway PvP legado sem mutação; estado e ouro devem permanecer idênticos. O teste não concede PASS funcional.
- `golden_b03_effects_extra.test.mjs` — reforço do controle negativo da Aura Abissal: comparar dano com e sem suporte em alcance. Antes `boosted > 100` podia gerar falso positivo.
- `run_items_goldens_b04.mjs` — executor Node reprodutível com `node --check` e execução individual para seis arquivos de oracle. `--write` só inicia os testes com gravação quando a primeira passagem não-gravada aprova todas as fases. Gera `QA_EXECUTION_B04.json` com exit codes, stderr/stdout SHA256, log e ambiente; falha imediatamente em qualquer passo não-PASS.

## Execução/QA REAL — distinguir domínios

`node v22.16.0` executou `node --check` em **três arquivos idênticos byte a byte aos Git blobs publicados**:
- `golden_b04_trinket_acl.test.mjs` → SHA `fd06428f8262599bf0c06d434bb132712ad3f03f` → exit 0, PASS sintático.
- `golden_b04_pvp_gap.test.mjs` → SHA `e73344f2802b13b715d8eb2274724525f8e8e4c6` → exit 0, PASS sintático.
- `run_items_goldens_b04.mjs` → SHA `8f15d772965fe81531ca8f67f2a57ef138e7cc4f` → exit 0, PASS sintático.

**Dry run local do runner feito de verdade:** `node run_items_goldens_b04.mjs` retornou **exit 1** de forma controlada. Primeiro job `oracle_source_lock_b03.mjs`: syntax PASS. Segundo job `golden_b01.test.mjs`: syntax FAIL por falta do arquivo no diretório parcial local. Relatório emitido em `/mnt/data/m45_items_qa/QA_EXECUTION_B04.json`. **Não é falha do motor nem reprovação de cenário PvP**; demonstra exatamente bloqueio por falta de checkout, e nenhum falso `GOLDEN_*_EXECUTED` foi gerado.

`git ls-remote` segue bloqueado por DNS; `cargo`/WASM ausentes neste executor. Nenhuma Github Action/CodeSpace ou PR merge executados.

## Estado cumulativo das fixtures deste chat

| Lote | Cenários candidatos | Execução |
|---|---:|---|
| B01 loja / Undo / duas sessões | 11 | NOT_RUN |
| B02 catálogo (240 buy + 4 trinket switch) | 244 | NOT_RUN |
| B03 efeitos / Anular | 18 | NOT_RUN |
| B03B efeitos adicionais | 18 | NOT_RUN |
| B04 troca interna / anti-fraude (3 trinkets × 2 equipes) | 6 | NOT_RUN |
| B04 gateway PvP (negações esperadas, não funcional) | 2 | NOT_RUN |
| **Total** | **299** | **0/299 executados neste ambiente** |

A correção da fixture B02 e os testes B04 **não reescrevem gameplay em JS**. G0 segue PARTIAL. G1, G2, G3, G6 e G8 não certificados.

## Comando compacto no checkout completo

```sh
git switch dev69/m45-audit-items
node docs/m45_rust_wasm/inputs/items/run_items_goldens_b04.mjs
# Após PASS integral não-gravado, gravar:
node docs/m45_rust_wasm/inputs/items/run_items_goldens_b04.mjs --write
```

Se ocorrer falha, ler `docs/m45_rust_wasm/inputs/items/QA_EXECUTION_B04.json`, registrar SHA/seed e abrir reconciliação; não alterar assert só para produzir PASS.

## Handoff para Chat 1

**Mudança de entendimento importante:** o Rust `core-items` deve modelar duas operações distintas: `BUY_ITEM` autoritativa (120 itens jogáveis normais SR) e `SWITCH_TRINKET` autoritativa (dois IDs SR; `farsight` local fora do SR normal). O protocolo `core-protocol`/server precisa criar ou mapear explicitamente `item.trinket`, verificar ownership, fonte, cooldown e sem item de inventário; status de **desvio de paridade funcional legado** até QA de rede Rust. Integrar também `queuePurchase`, Undo e loja somente após domínio B13/B23. Esse registro não autoriza expansão de JS nem merge/alteração do PR #19.

**Próxima prioridade:** executar os 299 candidatos no checkout íntegro; reconciliar BUGs de goldens separadamente dos BUGs do legado; obter contrato e evidência nativa/WASM, mantendo bloqueio G8 até certificação de todos gates.
