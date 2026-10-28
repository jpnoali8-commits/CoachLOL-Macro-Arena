# CoachLOL V4.5.2d-4-dev28 — QA e evidências

| Gate | Resultado |
|---|---|
| `node tests/v452d4_dev28_oracle_through_walls.test.mjs` | **PASS 10/10** |
| Dev27 histórico com correção explícita da especificação Oracle | **PASS 8/8** |
| `npm test` completo | **PASS exit 0** |
| `engine.mjs` e `engine.browser.js` | **PASS (68 exports)** |
| Chromium: Oracle atravessa parede, pink bloqueada e não há visão normal | **PASS**, 0 erros JS |
| Chromium: 15 SVGs CC0 e atlas da versão correta | **PASS** |
| Chromium: 5v5 bot-driven, seed26, fim real do Nexus | **PASS, 33:10**, 0 erros JS |
| Chromium: Vitória → Continuar → Pós-jogo | **PASS**, placar e tempo real exibidos |
| Regressão de pacing (5 drafts × seeds 26/42) | **PASS 10/10**, 0 censuras |
| Estado final idêntico à dev27 | **PASS 10/10** |
| Média simulada da amostra de dez partidas | **27min29s** |
| UI orgânica manual desde draft e compras até pós-jogo | **NÃO CERTIFICADO** |
| Paridade 1:1 de kits, itens, trinkets e PvP | **NÃO CERTIFICADA** |

### Evidências reproduzíveis
- `docs/QA_EVIDENCE_V452D4_DEV28/npm_test_full.log`
- `docs/QA_EVIDENCE_V452D4_DEV28/chromium_oracle_wall_smoke.json`
- `docs/QA_EVIDENCE_V452D4_DEV28/oracle_wall_detection_chromium.png` (fixture controlada; imagem real do Chromium)
- `docs/QA_EVIDENCE_V452D4_DEV28/chromium_full_seed26_report.json`
- `docs/QA_EVIDENCE_V452D4_DEV28/full_seed26_nexus_postgame_chromium.png` (pós-jogo real do Chromium após uma partida simulada automaticamente dentro da página)
- `docs/QA_EVIDENCE_V452D4_DEV28/pacing_audit_10.json`
- `docs/QA_EVIDENCE_V452D4_DEV28/pacing_hash_comparison_10.json`

### Limitações e correções de escopo
A dev27 afirmava **incorretamente** que Oracle exige LOS. Essa regra está explicitamente substituída na dev28, com verificação automatizada. O teste no Chromium mantém atlas e assets reais, mas embute os arquivos porque o ambiente não garante localhost. A partida é de **bots resolvendo reações via APIs do motor** e não inclui usuários humanos ou rede. A captura de pós-jogo mostra 33:10, duração de uma partida, e não a média da amostra.

O motor mantém duração tática adaptada do Oracle e não implementa fielmente todas as características do trinket de 2026 (duas cargas, cooldown conforme nível, percepção de campeões escondidos e arte da silhueta). Essas diferenças estão planejadas e não serão descritas como prontas.

### Referências
https://wiki.leagueoflegends.com/en-us/Oracle_Lens
https://wiki.leagueoflegends.com/en-us/Control_Ward
https://lol.fandom.com/wiki/Oracle_Lens
