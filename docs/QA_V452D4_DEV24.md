# QA — V4.5.2d-4-dev24

## Escopo
Auditoria de duração com cinco drafts diferentes, incluindo campeões com kits de treinamento. Nenhuma alteração aos parâmetros de combate/HP/torres/farm da dev23. O objetivo é detectar variação, encerramento natural e gargalos de custo em várias composições.

## Gates
| Verificação | Resultado |
|---|---|
| `node tests/v452d4_dev24_pacing_compositions.test.mjs` | **PASS — 5/5** |
| `npm test` integral com histórico | **PASS — exit 0** |
| Motor Node/browser | **INALTERADO** da dev23 |
| 5 perfis × 2 seeds = 10 simulações | **7 Nexus naturais; 3 interrompidas por orçamento de execução** |
| Erros de invariantes nos 10 resultados | **0** |
| Chromium: partida orgânica integral | **NOT_RUN** |
| Distribuição global 30min | **NOT_CERTIFIED** |
| Paridade kits de todos os campeões | **PENDENTE** |

## Resultados

| Perfil | Seed 26 | Seed 36 |
|---|---:|---:|
| Baseline | CPU interrompido a 27:20 | 26:08 — Nexus |
| Poke | CPU interrompido a 27:30 | 26:31 — Nexus |
| Engage | 22:37 — Nexus | 21:27 — Nexus |
| Scaling | 21:44 — Nexus | 22:30 — Nexus |
| Assassinos | CPU interrompido a 29:10 | 21:26 — Nexus |

- **7/10** encerramentos válidos; média **23:11,86** (23:12) SOMENTE das sete partidas terminadas.
- Mediana das sete partidas: **22:30**; P90: **26:31**.
- Três partidas NÃO chegaram ao Nexus dentro de **6s de tempo real decorrido (wall-clock) por processo**; foram interrompidas apenas no **harness de QA**, não no jogo. Tempo simulado registrado é o ponto de interrupção, não uma duração final.
- A lentidão da auditoria de 25 partidas e o limite do harness demonstram necessidade de profiling. O lote de 25 não foi certificado e seus resultados parciais estão no log `audit_console.log`.
- Não inferir que a verdadeira duração média dos dez jogos seja 23:12. A amostra possui **dados censurados**.

## Evidência
- `docs/QA_EVIDENCE_V452D4_DEV24/pacing_audit.json`
- `docs/QA_EVIDENCE_V452D4_DEV24/audit_quick_console.log`
- `docs/QA_EVIDENCE_V452D4_DEV24/npm_test_full.log`
- `tools/pacing_match_v452d4_dev24.mjs`
- `tools/audit_pacing_v452d4_dev24.py`

## Como reproduzir
`MAX_PROBE_MS=6000 python tools/audit_pacing_v452d4_dev24.py --workers 2 --timeout 20 --seeds 26 36 --max-seconds 2700`

Para auditoria lenta sem censura precoce, aumente `MAX_PROBE_MS`, limite os trabalhadores e preserve timeout externo. O guardião de CPU é do **teste apenas**: jamais concede vitória, altera vida ou encerra uma partida do motor.

## Limitações
O motor ainda usa atributos de classe e habilidades genéricas para parte dos campeões. Os perfis sintéticos são testes de robustez, não previsões oficiais do LoL. Cinco seeds padrão da dev23 tinham média 28:07, mas a ampliação demonstrou incerteza relevante.
