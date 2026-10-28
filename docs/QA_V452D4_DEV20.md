# QA — V4.5.2d-4-dev20

| Verificação | Resultado |
|---|---|
| `npm test` completo | **PASS exit 0** |
| Contratos novos do Arauto | **PASS 7/7** |
| Swiftplay sem Arauto | **PASS** |
| Chromium — claim + lane selector + clique no mapa + invocação | **PASS**, fixture controlada |
| Chromium — erros JavaScript | **0** |
| Testes históricos de Arauto | **PASS 11/11** |
| Sincronização engine Node/browser | **PASS 68 exports** |
| Long match seed 26 20min | **PASS estabilidade**, 1 dragão, 1 estrutura, sem Nexus |
| Long match seed 42 20min | **PASS estabilidade**, 2 dragões, 0 estruturas, sem Nexus |
| Long match seed 26 40min | **PASS estabilidade**, 1 dragão, 4 estruturas, sem Nexus |
| Paridade mecânica LoL 1:1 | **PENDENTE** |

## Evidências

- `docs/QA_EVIDENCE_V452D4_DEV20/npm_test_full.log`
- `docs/QA_EVIDENCE_V452D4_DEV20/autonomy_summary.json`
- `docs/QA_EVIDENCE_V452D4_DEV20/chromium.log`
- `docs/QA_EVIDENCE_V452D4_DEV20/herald_carrier_lane_selector_chromium.png`
- `docs/QA_EVIDENCE_V452D4_DEV20/herald_summoned_chromium.png`

A captura Chromium comprova a UI do cenário controlado. Não comprova execução orgânica completa nem assets de vídeo/3D, que não foram fornecidos.
