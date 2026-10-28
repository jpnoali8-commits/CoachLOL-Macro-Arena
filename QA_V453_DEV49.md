# QA — CoachLOL V4.5.3-dev49

**Base imutável:** Dev48 (`CoachLOL_MacroArena_V453_Dev48_Minion_Waves_UI_Estruturas_Catalogo_JogoCompleto.zip`).

## Escopo adotado

- **Somente League of Legends PC 26.21 / Riot Data Dragon 16.21.1, Summoner's Rift moderno (mapa 11).** Não misturar TFT, ARAM, Arena nem League Classic (mapa 453).
- A flag `maps['11']` do Data Dragon é insuficiente sozinha: o arquivo contém itens de ARAM (Guardian's Horn/Orb/Blade/Hammer, Cappa Juice), cópias de itens para modos alternativos (`323xxx`, `66xxxx`) e variantes duplicadas de mascotes (`1105`–`1107`) com elegibilidade incerta.
- A seleção **conservadora** exclui essas entradas e mantém os casos incertos no `rejected` do manifesto. Nenhuma exclusão altera o Data Dragon original importado.
- A categoria geral exibe apenas itens SR normais elegíveis; evoluções de missão e itens exclusivos de campeões não podem ser comprados como mercadorias comuns.
- Itens `reference_only` mostram preço, ícone Riot quando acessível, descrição oficial, receitas aninhadas e melhorias, porém **não são compráveis**.

## Cobertura aferida

Ver `data/riot_reference/sr_shop_26_21_dev49.json` (geração determinística com `node tools/build_sr_shop_v453_dev49.mjs`).

- 210 registros na seleção SR: 202 itens gerais, 5 evoluções condicionais, 3 exclusivos.
- 73 itens gerais da seleção com ligação ao motor, 129 gerais somente consultáveis.
- Catálogo local do motor: **76 entradas** (inclui trinkets e outras entradas especiais), não 76 itens completos com todas as passivas.
- **3 componentes adicionados em código:** Sigilo de Aço (ID 2019), Brutalizador (ID 2020), Tunelizador (ID 2021), com stats, preço e lista de ingredientes conforme Data Dragon 16.21.1.
- `mismatch = []` para preço/ordem irrelevante de ingredientes locais vinculados a Riot. Isso **não certifica** todas as passivas/ativáveis dos itens locais.

## Ícones e fontes

- Fonte autorizada para artes de itens: `https://ddragon.leagueoflegends.com/cdn/16.21.1/img/item/<id>.png`, ou **cache local dos mesmos PNGs oficiais**.
- Nenhum fallback da Wiki. O fallback visual final é um ícone neutro local de indisponibilidade, não uma imagem de item inventada.
- `node tools/download_sr_icons_dev49.mjs` baixa e valida somente os 210 PNGs elegíveis e gera manifesto de cache. `--dry-run` não requer rede.
- **NÃO BAIXADOS neste ambiente:** resolução DNS externa indisponível. Portanto, ícones OFFLINE do catálogo completo permanecem pendentes. Não afirmar que foram empacotados.

## Testes

- `node tests/v453_dev49_sr_shop_scope_recipes.test.mjs`: 11 testes novos, incluindo compra, descontos, atributos, snapshots, validação de receitas e exclusão de modos.
- `npm test`: regressão integral executada; log em `docs/QA_EVIDENCE_V453_DEV49/npm_test_full.log`.
- Recurso visual Chromium: tentativa de execução headless realizada, mas **sem captura válida certificada**. A renderização da nova árvore em múltiplos tamanhos de janela continua pendente de certificação visual.
- Minion block integral: permanece **pendente**. O avanço econômico foi preservado para evitar regressão no farm/CS; não declarar física completa de tropas.
- Validação de partida PvP pública/latência: não executada neste marco. Melhorias estratégicas de bots não foram desenvolvidas.

## Próximo marco

1. Integrar os PNGs oficiais em um computador com acesso à CDN Riot, executar o instalador, verificar CRC/PNG e publicar novo pacote offline.
2. Implementar lotes de itens gerais ausentes com passivas/ativos reais, testes PvP e gating de compra; começar pelos componentes e itens de família com menor risco de regressão.
3. Completar colisão minion × minion e minion × campeão, preservando farm e seleção de alvos com testes de partidas.
4. Certificar árvore de compra responsiva em Chromium 1366×768 e 1920×1080.
