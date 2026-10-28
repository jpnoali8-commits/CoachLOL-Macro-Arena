# QA — V4.5.2d-4-dev22

| Gate | Resultado |
|---|---|
| Novos contratos de cerco | PASS 8/8 |
| `npm test` (suíte integral) | PASS exit 0 |
| Sincronização Node/browser | PASS, 68 exports |
| Chromium — coordenação de bot + atlas + 15 SVGs | PASS, 0 JS errors |
| Seed 26, 40min | PASS estabilidade, **7 estruturas, 1 dragão** |
| Seed 42, 20min | PASS estabilidade, **0 estruturas, 2 dragões** |
| Vitória orgânica por Nexus | **PENDENTE** |

## Comparação reproduzida
- Base dev21, seed26 / 2400s: **4 estruturas destruídas**, 1 dragão, Nexus não destruído.
- Dev22, seed26 / 2400s: **7 estruturas destruídas**, 1 dragão, Nexus não destruído.
- Sem alterações diretas em HP das torres, dano dos campeões, minions e drops.

## Provas
- `docs/QA_EVIDENCE_V452D4_DEV22/npm_test_full.log`
- `docs/QA_EVIDENCE_V452D4_DEV22/long_2400_seed26.json`
- `docs/QA_EVIDENCE_V452D4_DEV22/long_1200_seed42.json`
- `docs/QA_EVIDENCE_V452D4_DEV22/chromium_siege_report.json`
- `docs/QA_EVIDENCE_V452D4_DEV22/dev22_siege_rally_chromium.png`

## Limites
Chromium mostra um cenário com waves e torres configuradas para teste. **Não é uma partida orgânica completa.** A corrida até o Nexus não foi certificada.
