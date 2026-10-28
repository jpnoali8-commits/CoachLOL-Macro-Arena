# QA V4.5.2b — reação e wave

## Alterações de código
- `engine.mjs`: em `queueReactionCombo`, somente o defensor original reage, mas seu `targetId` pode ser qualquer inimigo visível e até 1800 unidades do defensor. A janela original de duelo é encerrada usando `decision.enemyId` (agressor original), mesmo quando o alvo do contra-ataque é outro. Não exige visão do agressor para habilidades próprias defensivas.
- `app.js`: modal de reação inclui seletor `FOCAR INIMIGO`, apenas inimigos visíveis na proximidade, cards e título atualizados; confirmação usa `activeTargetId` sem alterar intenção original do agressor.
- `engine.mjs`: `waveCompositionV452b` centraliza as regras. No começo são três `melee` + três `caster`, terceira wave + `siege`, total sete; alterações oficiais 2026 após 14 e 30 minutos produzem ondas reduzidas. Minions são liberados com 0,792s de intervalo, então uma captura de tela pode mostrar menos unidades vivas momentaneamente.
- `engine.browser.js` gerado novamente pelo script `tools/sync_browser_v43.py`.

## Testes executados nesta entrega
- `npm run test:v452b`: **7/7 OK** (novo alvo, fog/proximidade, autorização da reação, composição de waves).
- `npm run test:v38-1`: **OK** após preservar defensivas sem visão do agressor.
- `npm run test:v451`: **11/11 OK**.
- `npm run test:v452`: **10/10 OK**.
- `node --check engine.mjs`, `engine.browser.js`, `app.js`: **OK**.
- `node tests/v38_group_combo_trinket_farm.test.mjs`: **FALHOU na calibração histórica TOP, 23 CS/5min vs esperado 35–62**; defeito anterior a esta mudança, não corrigido nem mascarado.
- Browser clickthrough visual em Windows: **não executado nesta entrega**. Confirmar UI/UX, incluindo cards e clique em outro inimigo.

## Cenários de aceitação manual
1. Caitlyn ataca Jinx; Leona visível próxima → reação da Jinx mostra Caitlyn e Leona; trocar para Leona e executar Q/Flash; o combo atinge Leona e a janela de reação a Caitlyn é concluída.
2. Leona longe ou invisível → não oferecer opção. Se agressor ficar invisível, permitir Barreira/escudo próprio, não revelar localização.
3. Seleção e combos multi-aliados preservados, sem regressão ao clicar fora ou usar Shift.
4. No início, observar wave1 (3+3), wave3 (3+3+canhão) por rota. Até 14min seguir composição; após 14/30 min aplicar alterações oficiais LoL 26.1.
5. `npm test` integral só pode ser marcado como aprovado após resolver farm P0.

## Referências
- https://www.leagueoflegends.com/en-gb/news/game-updates/patch-26-1-notes/
- https://wiki.leagueoflegends.com/en-us/Minion
