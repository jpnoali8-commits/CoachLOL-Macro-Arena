# QA V4.5.3-dev31

## Gates aprovados
- `npm test`: **PASS exit 0** — `docs/QA_EVIDENCE_V453_DEV31/npm_test_full.log`. Inclui todos os testes históricos e **9/9 contratos** novos em `tests/v453_dev31_defense_overlay.test.mjs`.
- Node/browser sincronizados (**70 exports**), `node --check engine.mjs` e `app.js` aprovados.
- Chromium real: `tests/browser_v453_dev31_defensive_items.py` — **PASS**. Compra dentro da receita de Randuin, desconto restante de 800g, item final equipado e botão de ativação funcionando; alvo recebeu 70% slow; 15/15 SVGs e atlas carregados, 0 erros JavaScript. O teste alternou temporariamente a visibilidade da camada do Golpear para medir o `z-index` efetivo, sem lançar uma disputa de Golpear.
- Prioridade visual CSS no Chromium: Golpear = 2147483000, Realm = 2147482000. O Realm permanece oculto.
- **4/4** simulações com Nexus destruído naturalmente (baseline seed 26 e 42; poke seed 26; engage seed 42), média **30:27**. Hash final idêntico à dev30 em 4/4 nessas configurações; não extrapolar para todas as composições.
- Compra/venda e buffs mantêm autoritarismo de estado do motor; testes de snapshots incluindo recarga do Randuin passaram.

## Pendências
- Disponibilização do item.json oficial completo 16.21.1; importar e validar cada item/receita sem inventar.
- Lógica completa dos efeitos especiais de todos os 56 itens, crítico/crit resistance do Randuin, todos os encantamentos e restrições. Algumas estatísticas/efeitos existentes ainda são protótipos ou aproximações.
- Realm do Mordekaiser: clone real de colisores, moitas e modificadores do Rift no motor; 1v1, zona circular, render real no painel quadrado, retorno e fechamento automático ainda não executados.
- Média de 30 minutos ainda precisa de maior amostra após novos itens efetivamente adotados pela IA.

## Arquivos de prova
- `docs/QA_EVIDENCE_V453_DEV31/randuin_recipe_chromium.png`
- `docs/QA_EVIDENCE_V453_DEV31/chromium_dev31_report.json`
- `docs/QA_EVIDENCE_V453_DEV31/pacing_summary.json` e quatro logs de partida
- `docs/QA_EVIDENCE_V453_DEV31/item_coverage_dev31.json`
