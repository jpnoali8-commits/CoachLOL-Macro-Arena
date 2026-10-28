# QA — CoachLOL V4.5.2d-4-dev26

## Gate de execução

| Verificação | Resultado |
| --- | --- |
| `node tests/v452d4_dev26_fog_ward_suppression.test.mjs` | **PASS 9/9** |
| `npm test` integral | **PASS exit 0** |
| `node --check engine.mjs`, `engine.browser.js`, `app.js` | **PASS** |
| `python tools/sync_browser_v43.py` | **PASS 68 exports** |
| `python tests/browser_v452d4_dev26_vision.py` | **PASS (Chromium, fixture controlada)** |
| 10 partidas de cinco composições | **10/10 Nexus natural** |
| Hash completo vs. dev25 nas mesmas partidas | **10/10 idênticos** |
| Partida orgânica do Champ Select ao pós-jogo no Chromium | **NOT_RUN** |

## Dados observados

- Média de 10 partidas concluídas: **1.649 s (27m29s)**.
- Mediana: **1.568,5 s (26m08,5s)**.
- P90: **2.004 s (33m24s)**.
- Seeds: 26 e 42 em baseline, poke, engage, scaling, assassins.
- O contrato da visão foi alterado; neste lote não houve divergência de estado final, mas outros drafts/ordens de wards ainda podem mudar o resultado de maneira intencional.

## Fonte e limites

- Riot, patch 26.1: alcance da superward +25%, região de 45 segundos, supressão por nearsight, setor pode revelar moitas.
- LoL Wiki Control Ward: control wards não desativam outras control wards.
- As coordenadas das máscaras autorais e alguns cooldowns continuam parciais, sem certificação 1:1.
- CPU em processos concorrentes **não** deve ser comparada diretamente como benchmark entre versões.

## Evidências dentro do pacote

- `docs/QA_EVIDENCE_V452D4_DEV26/npm_test_full.log`
- `docs/QA_EVIDENCE_V452D4_DEV26/browser_vision_smoke.json`
- `docs/QA_EVIDENCE_V452D4_DEV26/pacing_audit_10.json`
- `docs/QA_EVIDENCE_V452D4_DEV26/pacing_audit_10.log`
- `docs/QA_EVIDENCE_V452D4_DEV26/determinism_comparison_10.json`

Nenhuma imagem externa/ilustrativa é apresentada como captura real.
