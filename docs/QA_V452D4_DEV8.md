# QA — V4.5.2d-4-dev8

| Gate | Estado | Evidência / observação |
|---|---|---|
| Novos contratos Scryer Bloom | **PASS 8/8** | `tests/v452d4_dev8_scryer.test.mjs` |
| Suíte `npm test` completa | **PASS exit 0** | `docs/QA_EVIDENCE_V452D4_DEV8/npm_test_full.log` |
| `node --check` | **PASS** | engine.mjs, engine.browser.js, app.js |
| Browser sync | **PASS** | `python tools/sync_browser_v43.py` — 62 exports |
| Chromium Victory -> Continue -> 5 abas -> Continue | **PASS** | Harness integrado 1440×900, 0 exceções JS |
| Chromium Defeat -> Continue -> 5 abas -> Continue | **PASS** | Harness integrado 1440×900, 0 exceções JS |
| Farm real dev2/dev7 baseline V4.5.2c | **PASS** | Mesmo TOP 43/47/44; MID 35/35/35; ADC 41/46/46 nas seeds registradas |
| Freeze | **PASS bounded/partial** | Comportamento anterior, não 1:1 |
| Paridade geográfica de 12 Scryers | **FAIL_PARITY / PARTIAL** | Não existem máscaras específicas; coordenadas heurísticas por marco de mapa. |
| Partida orgânica completa até Nexus | **NOT_RUN** | O teste browser forçou o fim em segundo simulado 1. |
| Navegador 16:9 responsivo pequeno | **NOT_RUN** | Capturas feitas 1440×900 apenas |
| Barão d3-B, Elder/Smite d3-C | **NOT_RUN** | Escopos seguintes |

### Contratos importantes
- Dois pontos básicos de teste e 10 adicionais: apenas o total **10 novos** é derivado do patch. Não são coordenadas oficiais.
- Novos Scryers aparecem aos 900 s **ou** com transformação, sem remover os pontos-base.
- `wardKnownTo` respeita detecção por time e expiracão dos pulsos.
- Hash de respawn não interfere na RNG do combate, gold ou CS.
- Snapshot conserva ciclos, recargas e pulse. Compatibilidade com checkpoint dev7.
- O navegador usa cliente/motor reais carregados inline porque navegações HTTP e `file:` locais foram bloqueadas pelo ambiente; o hook de teste não é exportado para produção.
