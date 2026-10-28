# CoachLOL — QA V4.5.3-dev32

## Gates observados

- **`npm test` integral PASS (exit 0)**: `docs/QA_EVIDENCE_V453_DEV32/npm_test_full.log`.
- **14/14 novos contratos PASS**: compra, desconto, duplicados, Kraken, Navori, Arco Recurvo, poções, snapshot, guardas do importador e venda.
- **Chromium real PASS**, fixture controlada da loja, 15/15 SVG e atlas visíveis, **0 erros JavaScript**. Comprei Zelo + duas Adagas na receita da Navori, custo restante 950 ouro e item final equipado, gold 7350; captura: `docs/QA_EVIDENCE_V453_DEV32/navori_components_chromium.png`.
- Sincronização do engine de Node com browser: **70 exports**.
- Verificação de receitas em `tests/v453_dev32_crit_consumables.test.mjs` e proteção contra aplicar catálogo de teste.

## Partidas completas: testes automáticos do motor, não humanas

| Draft / seed | Duração | Vencedor | Nexus destruído |
|---|---:|---|---|
| baseline / 26 | 25:50 | red | sim |
| baseline / 42 | 20:53 | red | sim |
| poke / 26 | 31:39 | red | sim |
| engage / 42 | 26:37 | blue | sim |
| assassins / 36 | 21:26 | blue | sim |

**5/5** Nexus destruídos naturalmente; média destas cinco partidas **25:17** (25min17s). Nenhum erro de invariantes ou corte por orçamento nesse lote. **A média alvo de ~30min não está certificada na dev32**, nem garantida para todos os campeões/composições. O lote dev31 de quatro partidas havia mostrado média 30:27. As correções legítimas nos atributos causaram alterações de vencedor/duração; não afirmar hashes idênticos.

## Fonte e maturidade

- [Riot Data Dragon](https://developer.riotgames.com/docs/lol) confirma schema do `item.json`, mas o JSON completo não foi baixado neste ambiente.
- [Itens 26.21 (índice)](https://www.nerfplz.com/lol-items/), páginas específicas indicadas em `docs/QA_EVIDENCE_V453_DEV32/shop_dev32_coverage.json`.
- Passivas marcadas como `dev32_partial`, `registered_not_implemented` ou `dev32_whole_second_adapter`, nunca 1:1 certificadas.
- Teste em navegador é **fixture**; uma partida 5v5 orgânica real com os novos itens, do draft ao Nexus, continua pendente.
