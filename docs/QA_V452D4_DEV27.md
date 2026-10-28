# QA — V4.5.2d-4-dev27

| Gate | Resultado |
|---|---|
| Novos contratos visão/fog | **PASS 8/8** |
| Testes herdados (`npm test`) | **PASS exit 0** |
| Sintaxe `engine.mjs`, `engine.browser.js` | **PASS** |
| Browser sync | **PASS 68 exports** |
| Chromium: Oracle LOS / ocultação / projeção por equipe | **PASS; 0 erros JS** |
| Assets Chromium | **Atlas carregado, 15/15 SVGs** |
| Pacing / determinismo | **10/10 Nexus, 10/10 hashes iguais à dev26** |
| Duração média do lote | **27min29s** |
| Chromium partida orgânica desde draft até Nexus | **NOT_RUN** |

## Arquivos reproduzíveis
- `tests/v452d4_dev27_fog_detection_projection.test.mjs`
- `tests/browser_v452d4_dev27_fog_detection.py`
- `docs/QA_EVIDENCE_V452D4_DEV27/npm_test_full.log`
- `docs/QA_EVIDENCE_V452D4_DEV27/chromium_oracle_wall_smoke.json`
- `docs/QA_EVIDENCE_V452D4_DEV27/oracle_wall_detection_chromium.png`
- `docs/QA_EVIDENCE_V452D4_DEV27/pacing_audit_10.json`
- `docs/QA_EVIDENCE_V452D4_DEV27/pacing_determinism_comparison_10.json`
- `docs/QA_EVIDENCE_V452D4_DEV27/perspective_profile.json`

A tela Chromium é uma **fixture integrada do aplicativo e motor reais** com imagens locais embutidas devido às restrições de servidor do ambiente. O estado foi preparado programaticamente para o teste, não por uma partida jogada integralmente. Tempos do microbenchmark não devem ser extrapolados para aparelhos móveis.
