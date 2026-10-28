# CoachLOL — PRs de itens empilhados, sem integração antecipada

**Decisão do usuário (28/10/2026):** o especialista desenvolve todos os pacotes pendentes em branches sucessoras; **somente o auditor/integrador**, após solicitação explícita do usuário, incorpora os marcos ao `dev69/integration`. `main` permanece bloqueada para release. Este documento complementa `FAST_LANE_DEV69.md` sem alterar as regras de QA ou a propriedade de Skills.

## Cadeia de branches e PRs

1. Base auditada: `dev69/integration` em `374d87d5f49b52514ec68bbe666df086363c1ec5` (PRs #6/#7 já mesclados).
2. **Batch 2:** `dev69/items-batch2`, PR **#10** → `dev69/integration`, **18 novos itens**; contém três Anular e quinze reativos. **Aberto, NÃO mesclado.**
3. **Batch 3:** `dev69/items-batch3`, criada do commit **`182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d` de Batch 2**, PR → `dev69/items-batch2`, **15 itens ofensivos/ao contato**. Esse PR exibe apenas o diff do Batch 3.
4. Futuras `dev69/items-batch4`, `dev69/items-batch5` etc. devem partir do **head verificado do lote anterior** e apontar seu PR para a **branch imediatamente anterior**, nunca diretamente para `main`. Nunca rebase/force push/reset hard nem alterar as branches anteriores.
5. Após todos os lotes, o auditor analisa a cadeia **na ordem**: primeiro PR #10, depois retarget dos PRs seguintes para a integração depois de cada merge. Reconcilia Skills, checa ownership, receita, cooldown, prejuízos de compra/venda, Undo, e só então consolida com browser e QA.

## Por que empilhar

- Se todos os lotes forem PRs diretamente para `dev69/integration`, cada PR posterior inclui mudanças dos anteriores não mesclados, amplificando diff/conflitos e impedindo revisão independente.
- O PR de Batch N aponta para Batch N-1, tornando os diffs isolados e permitindo desenvolvimento cumulativo.
- O auditor poderá **rever/fazer merge de um por vez**, com snapshots e testes intermediários. Não usar merge em lote sem checar contratos de Skills e browser.
- **A cadeia não significa certificação, publicação ou integração.** Números de catálogo após N são contagens do head da **branch empilhada**, não da integração remota.
- Não sincronizar `engine.browser.js` fora do integrador; o gate de browser nos PRs intermediários pode falhar por diferença esperada. QA FAST do especialista cobre a engine Node, API server, dados e testes.

## Estados e gates invioláveis

- Itens `reference_only` ficam indisponíveis até estatísticas, receita, compra, revenda e efeitos realmente resolvidos. Status `implemented` ou `partial` não é `certified`.
- Undo irrevogável após **sair fisicamente** da fonte, inclusive retorno/reconexão.
- Cada partida PvP tem dois humanos, cada um controla cinco campeões; servidor é o único autoritativo, sem divulgar fog oculto, ordens ou cooldowns ao inimigo.
- QA especialista: contratos novos + regressões locais de família, `node --check`, economia, replay, anti-duplication; sempre registrar o head SHA.
- QA auditor: reconciliar patches de Skills, executar `npm run test:v453:dev69:integration`, gerar `engine.browser.js`, `npm test` integral, Chromium duas sessões, Nexus natural, assets Issue #1 e ZIP CRC/SHA antes de `main`.

**Rollback:** `git revert` por PR na ordem inversa da integração. Sem reset, force push ou substituir `engine.mjs` inteira por cópia histórica.
