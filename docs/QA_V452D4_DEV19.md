# QA — CoachLOL V4.5.2d-4-dev19

| Gate | Status |
|---|---|
| 6 novos contratos de importação/auditoria e engine imutável | **PASS 6/6** |
| `npm test` integral (legado + dev19) | **PASS exit 0** |
| `npm run test:long:dev19` (20 min seed26/42, 40 min seed26) | **PASS exit 0** |
| Node `--check` engine/browser/UI/importador | **PASS** |
| Sincronização Node/browser | **PASS — 68 exports** |
| Teste Chromium da dev19 | **NOT_RUN — sem mudança de interface** |
| Baixar Data Dragon completo 16.21.1 nesta sessão | **BLOCKED — sem acesso ao host** |
| Paridade de todos os campeões/itens | **FAIL — ainda incompleta** |
| Partida orgânica completa até Nexus | **FAIL/PENDENTE — 40 min sem Nexus e sem dragão** |

## Auditoria quantitativa

- 14 campeões selecionáveis; 5 bases e 5 crescimentos auditados; 5 tabelas de nível 1–18; 0 kits completos.
- 41 itens locais; 9 com stats básicos auditados; 0 completamente certificados com receitas + passivas + ativos.
- 3 runas-chave de protótipo; 0 árvores completas certificadas.
- Nidalee, Elise, Shyvana e Mordekaiser **não** estão registrados como selecionáveis e não possuem as mecânicas solicitadas.

## Resultados das simulações

| Seed | Tempo | Waves | Estruturas destruídas | Decisões reais | Dragões | Nexus |
|---|---|---|---|---|---|---|
| 26 | 20:00 | 42 | 0 | 35 | 0 | não |
| 42 | 20:00 | 42 | 0 | 28 | 0 | não |
| 26 | 40:00 | 96 | 4 | 65 | 0 | não |

**Falha do teste histórico**: `tests/v20_long_match.mjs` chamava `answerDecision()` diretamente, reabrindo a mesma reação e parando em 1093s. Esse resultado foi mantido nos logs `legacy_long_match_1200_seed26_FAILED.*`; o novo `tests/v452d4_dev19_long_match.test.mjs` chama `queueReactionCombo` de forma válida. **O motor não foi alterado** por esse reparo no harness.

**Limite:** o cenário é bot vs bot offline com draft padrão, sem partidas humanas e sem PvP. Nenhuma promessa de balanceamento ou IA objetiva completa.

## Localização das provas

- `docs/QA_EVIDENCE_V452D4_DEV19/npm_test_full.log`
- `docs/QA_EVIDENCE_V452D4_DEV19/npm_test_long.log`
- `docs/QA_EVIDENCE_V452D4_DEV19/long_match_2400_seed26.json`
- `docs/QA_EVIDENCE_V452D4_DEV19/long_match_1200_seed26.json`
- `docs/QA_EVIDENCE_V452D4_DEV19/long_match_1200_seed42.json`
- `data/coverage_audit_v452d4_dev19.json`
