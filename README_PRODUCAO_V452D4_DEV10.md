# CoachLOL V4.5.2d-4-dev10 — Pacote de produção

O pacote inclui o jogo offline completo evoluído a partir do ZIP dev9, sem reset/clean nem commit do Git herdado.

## Executar
1. Extraia o ZIP, entre na pasta `CoachLOL_MacroArena`.
2. Execute `npm test` e `npm run test:v452d4:dev10` para ver os contratos.
3. Abra o jogo conforme o README principal. No Champ Select escolha `JG GOLPEAR: Golpear F` ou `Golpear D`.
4. Durante disputa real contra bot, pressione a tecla escolhida quando o overlay final aparecer. Alternativamente escolha **Não usar agora**.

## Evidência reproduzível
- `python tools/test_dev10_draft_slot_browser.py` — exige Playwright Python + Chromium.
- `python tools/test_dev10_smite_5v5_browser.py` — exige Playwright Python + Chromium em `/usr/bin/chromium`.
- Capturas são **screenshots reais das fixtures executadas**; não alegam um fluxo de partida 0:00 → Nexus.
- Logs, imagens e fontes: `docs/QA_EVIDENCE_V452D4_DEV10/`.

## Maturidade
Implementado e testado em sandbox Node e Chromium; ainda sem paridade 1:1 com LoL, sem rede/multiplayer autoritativo.
