# QA — V4.5.2d-4-dev21

## Resultados verificados
| Gate | Estado | Evidência |
|---|---|---|
| `npm run test:v452d4:dev21` | PASS 10/10 | `tests/v452d4_dev21_herald_weak_eye_push.test.mjs` |
| `npm test` completo | PASS exit 0 | `docs/QA_EVIDENCE_V452D4_DEV21/npm_test_final.log` |
| Sintaxe Node/browser | PASS | `node --check` |
| Sync Node/browser | PASS, 68 exports | `python tools/sync_browser_v43.py` |
| Chromium controlado | PASS, 0 erros JS | `docs/QA_EVIDENCE_V452D4_DEV21/chromium_herald_eye.json` |
| Fonte do atlas e SVGs originais | Carregados | 15 SVGs, atlas fonte reduzido apenas para teste |
| Long match 20m / seed 26 | PASS estabilidade | 1 dragão, 1 estrutura, Nexus não encerrado |
| Long match 20m / seed 42 | PASS estabilidade | 2 dragões, 0 estruturas, Nexus não encerrado |
| Long match 40m / seed 26 | PASS estabilidade | 1 dragão, 4 estruturas, Nexus não encerrado |
| Partida orgânica Nexus → pós-jogo | NOT_CERTIFIED | nenhum dos três cenários encerrou naturalmente |

## Invariantes do olho
- 40% máximo HP **somente** em basic attack traseiro do inimigo, com olho aberto.
- 3 segundos de recarga com tempo simulado; sem procs repetidos no mesmo momento.
- Habilidades não acionam o bônus, ataque frontal não o aciona; fonte morta, aliado, fora de alcance ou sem visão não ataca.
- Clique ordena movimento/ataque, não aplica dano ou XP imediatamente.
- Snapshot determinístico preserva HP, direção e olho.

## Limites
- O teste de Chromium é uma fixture com motor real e atlas/sprites reais, não partida completa.
- O campo `team`/fog ainda é propriedade do engine JS offline; multiplayer público exige autoridade de servidor.
- Balanceamento por patch completo, formação tática dos bots e encerramento natural ainda pendentes.
