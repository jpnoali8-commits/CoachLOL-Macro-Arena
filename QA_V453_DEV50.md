# QA — CoachLOL V4.5.3-dev50

- **Fonte de verdade**: ZIP dev49 + `data/riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json`.
- **Escopo**: SR normal mapa 11, patch fixado 26.21. Exclui ARAM, TFT, Arena e itens removidos. A seleção conservadora da dev49 foi preservada.
- **Contagens**: 210 registros elegíveis, 202 gerais, 5 evoluções condicionais, 3 exclusivos; 78 itens gerais ligados ao motor, 124 somente leitura, 81 entradas locais (com trinkets/especiais).
- **Implementação**: 5 itens novos com preços/receitas exatas. Passivas concretas apenas nas duas botas, com adaptações ao motor detalhadas no CHANGELOG.
- **Tests**: `npm run test:v453:dev50` 14/14 PASS e `npm test` PASS (ver log integral em `docs/QA_EVIDENCE_V453_DEV50/npm_test_full.log`). Browser engine regenerado com `tools/sync_browser_v43.py`; ambos passam `node --check`.
- **Chromium**: executado via Playwright, `file:///.../index.html` retornou `ERR_BLOCKED_BY_ADMINISTRATOR`; **sem captura/sem certificação visual real**.
- **Ícones offline**: zero PNGs Riot 16.21.1 no diretório `assets/riot/items_16_21_1` (apenas LEIA_ME). Instalador dry-run: 210 elegíveis. Sem download por indisponibilidade de rede; sem Wiki como fallback.
- **Não alterados**: farm, comportamento da IA de bots e minion block parcial da dev48.
- **Git**: preservar 566 arquivos do ZIP base byte a byte; validação no script de empacotamento.
- **Não certificados**: passivas dos 124 itens apenas referência, PvP remoto sob latência, UI 1366/1920 responsiva e farm após colisão total das tropas.
