# QA — V4.5.2d-4-dev18

| Gate | Resultado |
|---|---|
| Contratos novos de Elder e seis Rift variants | **11/11 PASS** |
| `npm test` integral | **PASS, exit 0** |
| Node syntax / browser bundle / app syntax | **PASS** |
| `python tools/sync_browser_v43.py` | **PASS — 68 exports** |
| Chromium: Elder microticks, snapshot e JS errors | **PASS — 0 JS errors** |
| Compatibilidade snapshots legados | **PASS** |
| Fotografia Chromium | Fixture controlada, **não** partida orgânica |
| Partida 5v5 inteira até Nexus | **NOT_RUN** |
| Temporização visual 60 FPS de efeitos Elder | **NOT_IMPLEMENTED** |
| Paridade Elder patch PC 26.21 (duração etc) | **NOT_CERTIFIED** |

## Evidências
- `docs/QA_EVIDENCE_V452D4_DEV18/npm_test_full.log`
- `docs/QA_EVIDENCE_V452D4_DEV18/dev18_contracts.log`
- `docs/QA_EVIDENCE_V452D4_DEV18/browser_report.json`
- `docs/QA_EVIDENCE_V452D4_DEV18/elder_microticks_chromium_fixture.png`

## Alcance temporal
As filas são executadas com ordenação em sub-ticks, mas o simulador ainda discretiza movimento/casts em segundos inteiros. Isso não implementa reações no cliente em cada quarto de segundo.
