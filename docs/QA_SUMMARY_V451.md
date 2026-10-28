# QA V4.5.1 — Estado real

- **Aprovados:** 11 novos contratos V4.5.1; 9 suítes históricas selecionadas (108 verificações), incluindo seleção/reação, ranges, executor, CC, kits, itens/runas, jungle e Vastilarvas/Arauto. Total verificado individualmente: 119 cenários.
- **Interface:** Chromium offline inline, seleção múltipla/clique solo/área; 0 erros de JavaScript. Captura `PREVIEW_V451_SELECTION_CHROMIUM.png`.
- **Falha preservada:** `npm test` é interrompido no teste legado `v38_group_combo_trinket_farm.test.mjs`, que exige TOP/MID 35–62 CS aos 5 minutos sem contestação. TOP registrou 23 CS no último teste completo; com crédito real, a IA de last-hit ainda não atinge a meta. Não alteramos o teste para esconder a falha.
- **Compatibilidade:** Motor Node/browser gerado do mesmo fonte; parser de JavaScript aprovado; ZIP verifica CRC sem erros.
- **Ainda sem teste nesta rodada:** partidas competitivas completas, kits 1:1, teste Windows com assets externos, replay causal de todo o jogo, estresse simultâneo 5v5 longo.

**Próxima correção prioritária:** V4.5.1a — farm por ataque real com previsão de HP/minion aggro e movimentação para last hit, mantendo congelar/slow push/fast push.
