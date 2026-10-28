# QA — V4.5.2d-4-dev14

| Gate | Resultado | Evidência |
|---|---|---|
| Motor Barão/Ancião | PASS 11/11 | `tests/v452d4_dev14_baron_elder.test.mjs` |
| `npm test` total (inclui farm, Smite, Rift) | PASS, exit 0 | `docs/QA_EVIDENCE_V452D4_DEV14/npm_test_full.log` |
| Sintaxe Node + bundle + UI | PASS | `node --check engine.mjs engine.browser.js app.js` individualmente |
| Node→Browser sync | PASS — 68 exports | `python tools/sync_browser_v43.py` |
| Chromium UI de buffs | PASS, 0 erros JS | `docs/QA_EVIDENCE_V452D4_DEV14/chromium_hud.log` e PNG |
| Duas capturas pelo resolvedor real de acampamentos | PASS em fixture | 2 contratos finais da dev14 |
| Partida orgânica desde minuto zero, 5v5 até Nexus | NOT_RUN | — |
| Exatidão da curva de stats Barão Riot | NÃO CERTIFICADA | Interpolação aproxima 12–48 AD/20–80 AP |
| Mecânicas Elder sub-tick 0,5s e gráficos 3D | NÃO CERTIFICADAS | Resolver ainda avança em ticks de 1s |

## Diagnóstico
- Quando a equipe mata o Barão, todos os campeões vivos da equipe recebem AD/AP derivados de forma temporária, ligados ao momento daquela captura. Uma morte cancela o bônus desse detentor.
- O Ancião passou de 150 para 180s, preservando a queimadura/execução herdada com seus limites conhecidos.
- O HUD mostra atributos efetivos; a imagem Chromium é uma fixture sintética controlada, **não** captura de partida orgânica.
- O farm manteve os alvos seed36/451/452: TOP 43/47/44, MID 35/35/35, ADC 41/46/46. Freeze parcial não foi reclassificado como pronto.
