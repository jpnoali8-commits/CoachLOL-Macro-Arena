# QA — CoachLOL V4.5.2d-4-dev17

## Estado final
| Gate | Resultado |
|---|---|
| 8 novos contratos Barão multi-tick | PASS |
| Testes V16, farm e todas as suites históricas (`npm test`) | PASS — exit 0 |
| Motor Node vs navegador | PASS — 68 exports |
| Sintaxe `engine.mjs`, `engine.browser.js`, `app.js` | PASS |
| Chromium com cenários multi-tick | PASS — 8 ticks, 2 screenshots, 0 JS errors |
| 15 SVGs CC0 e atlas carregados | PASS |
| Partida 5v5 orgânica completa | NOT_RUN |
| Paridade LoL 1:1 | NOT_CERTIFIED |

## Problema resolvido
O canhão de Barão poderia atingir a torre antes de entrar no alcance em unidades reais. O teste legado V16 também demonstrou a necessidade de considerar a máscara física da torre, cujo centro fica deslocado da linha central da rota. Agora verificamos a distância real até a estrutura com um raio físico calculado a partir do atlas do usuário.

## Evidências
- `docs/QA_EVIDENCE_V452D4_DEV17/npm_test_full.log`.
- `docs/QA_EVIDENCE_V452D4_DEV17/chromium_siege.log`.
- `docs/QA_EVIDENCE_V452D4_DEV17/baron_siege_chromium_report.json`.
- `docs/QA_EVIDENCE_V452D4_DEV17/baron_siege_start_chromium.png`.
- `docs/QA_EVIDENCE_V452D4_DEV17/baron_siege_after_8_ticks_chromium.png`.

## Limite da prova
O teste do Chromium executa os métodos reais de movimento e combate do motor em sequência **controlada**. Não representa matchmaking, uma partida longa ou 5v5 orgânico concluído.
