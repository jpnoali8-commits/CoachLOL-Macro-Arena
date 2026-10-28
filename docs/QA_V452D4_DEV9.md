# QA V4.5.2d-4-dev9

| Gate | Status | Evidência |
|---|---|---|
| Novos contratos Smite/RNG | PASS 20/20 | `tests/v452d4_dev9_competitive_smite.test.mjs` |
| Full `npm test` após ajustes | PASS exit 0 | `docs/QA_EVIDENCE_V452D4_DEV9/npm_test_final.log` |
| Farm real V4.5.2c | PASS | suíte global TOP 43/47/44, MID 35/35/35, ADC 41/46/46 |
| Node / browser sync | PASS 65 exports | `tools/sync_browser_v43.py` |
| Node syntax checks | PASS | motor + browser + app |
| Overlay D e F em Chromium | PASS 2/2 controlado | `docs/QA_EVIDENCE_V452D4_DEV9/chromium_final.log` + PNGs |
| Snapshot/replay de disputa e sorteio | PASS parcial/contratos | test dev9 |
| Luta 5v5 orgânica completa | NOT_RUN | Não alegar certificação |
| Multiplayer competitivo humano | NOT_IMPLEMENTED | Somente bot offline |
| Máscaras oficiais Florividentes | NOT_PROVIDED | Coordenadas derivadas continuam provisórias |
| Paridade 1:1 de objetivos e RNG | NOT_CERTIFIED | Sorteio ponderado é regra autoral de treinamento |

## Casos obrigatórios cobertos
- Smite 600/1000/1400; 1200 x 900 como caso abstrato do resolvedor.
- Somente último tick executável abre D/F quando os DOIS Smite estão prontos.
- Se faltar o pet, carga, cooldown ou alcance de qualquer jungler: não há duelo D/F.
- Nenhum Smite dos dois lados: RNG determinístico 4x1 e 3x2, apenas no momento do abate.
- Sem duplo ouro, kills ou captura; ledger e snapshot preservados.
- Dragão, Arauto, Barão e Vastilarvas com regras de abate individuais.

## LIMITAÇÕES
- Testes do navegador usam fixture de abertura forçada do objetivo no frame controlado, não uma partida orgânica.
- Velocidade 2x da UI não altera os segundos simulados/cooldown.
- O contador de campeões usa raio de 850 unidades para o treino, não um parâmetro certificado Riot.
