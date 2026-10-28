# Itens SR — arquitetura de famílias e entregas maiores (dev69)

## Linha de engenharia

**Não criar engine paralela.** `engine.mjs` continua autoritativa e monolítica até o integrador introduzir uma compilação Node/browser com paridade comprovada. O script `tools/sync_browser_v43.py` depende do conteúdo atual, portanto somente o integrador gera `engine.browser.js` depois do merge. A branch de itens **não** toca Skills, HUD, `version.json` ou `main`.

O novo protocolo permite pacotes de **15–25 itens por PR**, sujeitos a QA. Evitar lotes de contagem alta à custa de passivas não funcionais. Separar por famílias de efeito, não por uma lista arbitrária de IDs. Se um item não tiver regra verificável, manter `reference_only`. Uma entrega pode conter `implemented` e `partial`, mas **`certified` requer cobertura completa** de origem, disponibilidade, stats, toda passiva/ativo, cooldown, raio, escudo, aplicação, snapshot, compra, Undo, replay e PvP duas sessões.

## Contrato autoritativo e pontos de extensão

1. **Catálogo**: `data/riot_reference/sr_shop_26_21_dev49.{json,js}` mantém disponibilidade, ID Riot 16.21.1, estado e `localId`. A fonte congelada fica em `source_16_21_1`; atualizações de patch são novos dados verificados, nunca substituições silenciosas.
2. **Economia**: `catalog`, `ITEM_RECIPES`, `ITEM_SELL_VALUES_V453_DEV60`; `recipePurchasePartsV453Dev30` desconta componentes por instância única. `canBuy` valida owner, inventário, exclusividade e ouro. `buy`/`sellItemV43` fazem registro de ledger + Undo. Proibir vender/desfazer como um mesmo ato.
3. **Estado temporal**: guardar cooldowns, cargas, escudos, stacks e tempo de combate **por campeão**; `snapshotV40` e checkpoint capturam o mesmo estado. Leitura derivada nunca deve transferir gold nem mutar inventário. `ITEM_FAMILY_RULES_V453_DEV69` concentra constantes de família, não é uma lista que habilita automaticamente toda referência.
4. **Triggers**: estatísticas derivadas por `derivedItemStatsV453Dev69`; mitigação/penetração em `damage`; efeitos pós-dano legítimo em `onBulkItemChampionHitV453Dev69`; escudos reativos por `procLifelineV453Dev69` antes da absorção; timers ao usar tempo simulado. `EffectResolverV41` continua cuidando de tipos CC, shield, DoT e Grievous, sem APIs client-side de ouro/dano.
5. **Anti-recursão**: procs de itens com `sourceType='item_...'` não ganham nova instância do mesmo proc; dano zero/imunidade e alvo aliado não acionam. `damageContributors` e execução só reconhecem abate uma vez. Não revelar estado inimigo por payload de evento novo.
6. **Limites de efeito**: Lifeline exclusivo (Hexdrinker pode evoluir a Maw), Fatalidade exclusivo, Anular exclusivo, sem duplicar buff na melhoria. Um escudo reativo absorve o próprio golpe ativador. Venda zera bônus temporários dependentes do item, mas snapshot/Undo podem restaurar operação elegível **apenas dentro da mesma visita física**.
7. **Regras PvP invioláveis**: dois humanos, cada um controla cinco campeões, ordens simultâneas e servidor autoritativo. `canBuy`, venda, Undos, procs e replays nunca aceitam compra por time adversário. Sair fisicamente da fonte apaga irrevogavelmente histórico de Undo anterior, inclusive após retorno/reconexão.

## QA por pacote

**FAST do especialista:** `node --check engine.mjs`, `node --check` dos testes novos, 15+ contratos, catálogo/receita/sale para cada ID, efeitos por família, conservação de ouro, prioridade de escudos, efeito vendido/consumido, cooldown, execução única, dois donos, snapshot, Undo. Rodar regressões dev61, dev62, dev64, dev68 e os lotes anteriores. A branch não declara resultado integral de Node/browser nem release.

**INTEGRATION:** um PR por pacote, revisar hunks de engine, mesclar **um de cada vez** em `dev69/integration`, regenerar `engine.browser.js`, validar `npm run test:v453:dev69:integration` e CI, reconciliar branch Skills. **RELEASE:** `npm test` completo, browser visual duas sessões, 78 assets binários, reconexão, fog, Nexus natural e ZIP CRC/SHA; `main` permanece bloqueada até essa auditoria.

## Inventário e plano de execução

- PR #7 (base): 2 itens com efeitos.
- PR #10 (lote ampliado): 3 itens `Anular` + **15 itens de efeitos reativos/combate**, **18 itens no PR**. De 95 `reference_only` na abertura do lote ampliado para **80 referências** ainda bloqueadas no fim, sujeitos à revisão.
- Próximos grupos sugeridos: itens ofensivos on-hit/crit/projéteis, sustentação/consumíveis/itens de evolução e itens de suporte com ativos alvo/área. Cada pacote de 15–25 deve ser dimensionado por complexidade real dos efeitos e não pode promover cards por simples metadata.
- Status do lote ampliado: **implemented/partial, NOT_CERTIFIED**. Algumas interações Riot completas, prioridade multi-item, VFX, arredondamento de dano e componentes temporais ainda requerem validação integradora e visual.

Rollback via `git revert` dos commits do PR; nunca `reset --hard`, force push ou troca completa de `engine.mjs`.
