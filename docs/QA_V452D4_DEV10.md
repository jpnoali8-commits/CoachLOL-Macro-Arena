# QA — V4.5.2d-4-dev10

| Gate | Status | Evidência |
|---|---|---|
| Contratos novos | **PASS 7/7** | `tests/v452d4_dev10_5v5_smite_draft.test.mjs` |
| Dev9 Smite + sorteio | **PASS 20/20** | `tests/v452d4_dev9_competitive_smite.test.mjs` |
| Suíte integral + farm/freeze | **PASS exit 0** | `docs/QA_EVIDENCE_V452D4_DEV10/npm_test_full.log` |
| Node/browser gerados | **PASS 65 exports** | `docs/QA_EVIDENCE_V452D4_DEV10/sync_browser.log` |
| Chromium overlay Smite F | **PASS** | `docs/QA_EVIDENCE_V452D4_DEV10/smite_5v5_f_chromium.png` |
| Chromium overlay Smite D | **PASS** | `docs/QA_EVIDENCE_V452D4_DEV10/smite_5v5_d_chromium.png` |
| Chromium Champ Select D | **PASS** | `docs/QA_EVIDENCE_V452D4_DEV10/champ_select_smite_d_chromium.png` |
| Partida orgânica completa 0:00 → Nexus | **NOT_RUN** | Testes anteriores cobrem fluxo controlado; não certificar partida integral |
| Multiplayer humano PVP | **NOT_IMPLEMENTED** | Motor offline bot |
| Máscaras finais Florividentes | **NOT_PROVIDED** | Geometria provisória sem alterações |

## Cenário detalhado Chromium
**Fixture explícita:** 10 campeões vivos posicionados no poço com ordem de atacar objetivo ou campeão; Dragão a 4.500 de 6.200 HP, bot local, horário de jogo simulado a partir de 500s, 8 ticks normais até o HP chegar a 1.351. Ambos JG com Smite (Azul 1.400, Vermelho 1.000). Motor abre overlay, jogador aperta tecla selecionada (F ou D), uma captura é registrada no ledger, zero erros de JS.

`tools/test_dev10_smite_5v5_browser.py` completa um tick do objetivo explicitamente pelo motor após a tecla para eliminar variabilidade do timer visual da fixture. PNGs gravados por `page.screenshot` no Chromium, sem imagens ilustrativas inseridas.

## Alcance / CC / consistência
- Golpear só pode atingir acampamento real a até 500 unidades.
- Não gastar recurso sob estase/supressão, ao faltar cargas, em recarga ou fora de alcance.
- Stun, knockup e silêncio comuns não proíbem Golpear, conforme regras documentadas de feitiços.
- Snapshot/replay conserva o slot, o estado da decisão e atribuição única do objetivo.
- A distribuição sem Smite por participantes permanece **regra autoral de CoachLOL** e não paridade oficial do LoL.
- Testes legados de Smite com objetos de HP sem coordenadas permanecem funcionais, mas **não devem ser usados como simulação de combate espacial**.
