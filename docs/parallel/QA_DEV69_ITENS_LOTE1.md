# CoachLOL dev69/items — Auditoria e QA do lote 1

**Base confirmada:** V4.5.3-dev68, commit `b6f9cea08273bef4968ad9503d62c1a5255de81f`  
**Branch de trabalho:** `dev69/items`  
**Destino exclusivo:** PR para `dev69/integration`  
**Patch fixado:** LoL PC 26.21 / Data Dragon 16.21.1 (fonte pt_BR arquivada no repositório).  
**Estado:** `SOURCE_READY / RELEASE_BLOCKED`; esta entrega NÃO certifica release nem paridade 1:1 Riot.

## Inventário dos 100 itens originalmente consultáveis

Matriz por Riot ID, nome, custo, disponibilidade, maturidade, receita e QA:
[`docs/parallel/MATRIZ_DEV69_ITENS_LOTE1.csv`](MATRIZ_DEV69_ITENS_LOTE1.csv).

| Estado do conjunto original | Antes (dev68) | Depois deste lote |
| --- | ---: | ---: |
| Somente consultável | 100 | 98 |
| Implementado, ainda não certificado | 0 | 1 (1083) |
| Parcial executável, NÃO certificado | 0 | 1 (3036) |
| Certificado completo | 0 | 0 |

Loja SR normal mantém 202 registros (104 engine_playable, 98 reference_only); outros 8 itens SR condicionais/exclusivos não foram reclassificados. Os restantes 98 registros permanecem bloqueados para compra.

## Primeiro lote implementado

### ID 1083 — Abatedora (Cull)

- **Fonte**: `data/riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json`, registro `1083`. Preço 450; revenda oficial `gold.sell=180`; 7 AD, sem receita.
- **Execução real**: Ceifar cura 3 HP por contato com AA/on-hit legal (não por spell, aliados ou alvos imunes); registra 1 gold extra por último golpe exclusivo em tropa, até 100; o centésimo last-hit concede o bônus único de 350 gold. Eventos de ouro passam pela autoridade e ledger do motor, não pela UI.
- **Segurança**: progresso pertence ao campeão/item e é persistido em snapshots; venda retira o item e reseta contador; Desfazer elegível restaura estado anterior; morte do minion não pode pagar duas vezes.
- **Maturidade**: `implemented_not_certified`, porque paridade integral e QA de navegador ainda não foram executados.

### ID 3036 — Lembranças do Lorde Dominik

- **Fonte**: registro oficial `3036`; custo 3300, revenda `gold.sell=2310`; receita `3035 (Último Sussurro) + 6670 (Aljava Vespertina)`, 550 gold após possuir os dois.
- **Atributos**: +35 AD, +35% penetração de armadura, +25% crítico; lógica existente de exclusividade de Fatalidade (exclusão mútua com Lembrete Mortal).
- **Mata-Gigantes**: fator de 0 a +15% para dano físico/mágico elegível de campeão contra campeão inimigo, em função de 0 a 1500 HP adicional; não incide sobre dano verdadeiro, tropas, estruturas e procs `item_*`. Previsão do AA acompanha essa fórmula.
- **Limite explícito**: HP adicional é somado **somente** de atributos de itens presentes no catálogo e fragmento de runa. Bônus de HP provenientes de habilidades, efeitos temporários e outras fontes ainda não integradas **não estão cobertos**. Portanto o status é `partial_not_certified`, apesar de comprável e com um efeito real. Necessária reconciliação junto ao integrador sem alterar QWER de outro chat.

## Economia e PvP

O lote reutiliza `Arena.buy`, `Arena.canBuy`, `itemPurchaseCost`, `sellItemV43`, `recordShopUndoV453Dev61`, `snapshotV40` e o gateway autorizado PvP. **A regra irrevogável permanece**: sair fisicamente da área da fonte revoga para sempre a pilha anterior de Desfazer, mesmo retornando, reconectando ou reabrindo loja; somente compras novas na visita seguinte geram novos recibos.

Duas sessões humanas distintas têm autoridade exclusiva sobre seus respectivos cinco campeões. O replay da mesma `sequence` retorna recibo idempotente; payload divergente e compra por campeão inimigo são rejeitados. Nenhum preço do cliente substitui a tabela oficial do servidor.

## QA executado em 2026-10-28

Workspace Node 22.16.0 isolado, criado do ZIP textual dev68 com hash SHA-256 `561563dbc3984b2188275a48da3ada1bfaa228556331e2b60e410ea705e4be8c`, localizado na Biblioteca `/CoachLOL/Dev69/`. O ZIP de assets de 78 arquivos foi extraído **somente para os testes locais**; não está no repositório. Teste novo falhou na base antiga antes do patch (item ausente) e ficou verde após a implementação.

| Contrato | Comando | Resultado |
| --- | --- | --- |
| Itens, preços, efeitos, gold, compra/venda, Undo, PvP, snapshots e replay | `node tests/v453_dev69_items_batch1.test.mjs` | **PASS 8/8** |
| Loja PvP, venda, revenda e segurança | `node tests/v453_dev60_pvp_shop_refunds.test.mjs` | **PASS 18/18** |
| Regra da fonte, Desfazer e checkpoint | `node tests/v453_dev61_shop_undo_pvp.test.mjs` | **PASS 22/22** |
| Loja HTTP duas sessões e referências | `node tests/v453_dev62_pvp_hud_e2e.test.mjs` no `npm test` | **PASS 18/18** |
| Combate PvP dev64 | `node tests/v453_dev64_pvp_reaction_e2e.test.mjs` | **PASS 26/26** |
| Combos PvP dev65 | `node tests/v453_dev65_pvp_planned_combos.test.mjs` | **PASS 28/28** |
| Spells PvP dev66 | `node tests/v453_dev66_summoners_cc_pvp.test.mjs` | **PASS 29/29** |
| Contracombos dev66 | `node tests/v453_dev66_combo_defenses.test.mjs` | **PASS 14/14** |
| Cura dirigida PvP dev67 | `node tests/v453_dev67_targeted_heal_pvp.test.mjs` | **PASS 48/48** |
| Lux Q dev68 | `node tests/v453_dev68_lux_projectile_pvp.test.mjs` | **PASS 40/40** |
| `npm test` integral | `npm test` | **NOT_CERTIFIED** — primeira tentativa parou na ausência de imagens do pacote textual; segunda, com assets locais, ultrapassou 180s durante dev63 (passou por dev62). |
| Chromium visual e 2 browsers humanos completos | não executado | **NOT_RUN** |
| Node→browser sync (`engine.browser.js`) | reservado ao integrador | **NOT_RUN / NÃO ALTERAR nesta branch** |

**Interpretação**: PASS significa contrato realmente executado no workspace isolado, não paridade completa do jogo; `npm test` global e release continuam não certificados. O teste dev69 foi executado sobre o mesmo contrato funcional; antes do PR o integrador deve rodar o script versionado e a suíte integral após rebase/merge.

## Arquivos e integração

Apenas `engine.mjs` (trechos de itens, dano e last hit), `data/riot_reference/sr_shop_26_21_dev49.{json,js}`, `package.json`, `tests/v453_dev69_items_batch1.test.mjs`, expectativas legadas `dev61/dev62`, esta QA e a matriz. **Não alterar** skills, `app.js`, HUD global, `main`, `version.json` ou `engine.browser.js`.

**Risco de conflito:** Chat 1 pode alterar `engine.mjs` em hunks de combate; o integrador deve reconciliar mudanças por função, sem substituir a engine. `engine.browser.js` permanece deliberadamente dev68 até o sync centralizado. Após incorporar o PR, o integrador deve executar `python tools/sync_browser_v43.py` e revalidar testes Node/browser/sessões humanas. A promoção do catálogo sem esse sync não autoriza chamar experiência offline de funcional.

**Rollback:** Reverter os commits deste PR em `dev69/integration` via `git revert`, em ordem reversa se necessário, mantendo histórico, arquivos binários existentes, release e mudanças independentes dos outros chats. Não usar reset forçado nem modificar `main`.

## Próximo lote sugerido

Auditar um grupo fechado com passivos/ativáveis e limites de cooldown (por exemplo, componentes defensivos), depois de verificar os contratos compartilhados de escudo e efeitos universais com Chat 3. Nenhum dos 98 itens restantes foi promovido automaticamente.
