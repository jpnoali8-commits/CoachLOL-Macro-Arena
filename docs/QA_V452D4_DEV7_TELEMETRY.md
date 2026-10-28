# QA — V4.5.2d-4-dev7

**Base:** ZIP V4.5.2d-4-dev6. `engine.mjs` continua sendo motor determinístico offline.

| Gate | Status | Evidência |
|---|---|---|
| Contratos novos dev7 | **PASS 7/7** | `tests/v452d4_dev7_telemetry.test.mjs` |
| `npm test` integral | **PASS exit 0** | `docs/QA_EVIDENCE_V452D4_DEV7/npm_test_full.log` |
| Farm 5min seed36 | **PASS 43/35/41** | `test:v452c` e execução de conciliação adicional |
| Reconciliação de ouro 10 campeões / 300s | **PASS** | execução local seed36 |
| Sintaxe Node e browser | **PASS** | `node --check` |
| Sync engine Node → browser | **PASS 62 exports** | `python tools/sync_browser_v43.py` |
| Chromium fixture 1440×900 | **PASS_LIMITED** | capturas dev7 de dano e evolução temporal |
| UI Nexus real → Victory/Defeat → Continue | **NOT_RUN** | End-to-end de partida completa não realizado |
| Scryer Bloom timing/posições | **NOT_RUN** | pendente dev8 |
| Barão d3-B / Elder d3-C | **NOT_RUN** | pendentes |
| Riot PC 1:1 | **NOT_CERTIFIED** | não alegado |

## Limites técnicos
- Dano reportado é HP perdido por campeões adversários; dano a minions/estruturas, escudos absorvidos e mitigação não foram coletados.
- Ouro ganho exclui 500 iniciais e reembolsos (que têm contador próprio); ouro em mãos é exibido separadamente.
- Wards colocadas/destruídas são contadores de ações efetivas, não pontuação de visão nem wards reveladas por bloom.
- Séries temporais contêm apenas amostras por minuto simulado e captura final do jogo. Ausência de histórico em snapshots antigos é explícita.
- Suíte dev6 foi ajustada para reconhecer novos campos devidamente instrumentados; os demais contratos e números herdados permaneceram inalterados.
