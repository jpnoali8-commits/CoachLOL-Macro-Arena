# Continuidade canônica — V4.5.2d-4-dev26

## Base

Partir **somente do ZIP completo dev26** (não dev25 anterior). Motor `engine.mjs` é fonte offline autoritativa; `engine.browser.js` é gerado por `tools/sync_browser_v43.py`.
Preservar `.git`, arquivos modificados/untracked herdados, máscaras autorais, SVGs CC0, farm, Smite D/F, Arauto e Barão.

## Contrato novo de fog e wards

- Usar `Arena.wardVisionSuppressedV452d4Dev26` para decidir se ward perde visão.
- Sentinelas de controle não desativam outras sentinelas de controle; stealth/support ficam suprimidas se a pink inimiga estiver visível em alcance.
- `visionSources` aplica mesma regra ao raio e à região bônus do Lume. Renderização `app.js` também aplica esse predicado.
- Polígono 45s, alcance base aprimorado +25% enquanto ward existir; não confundir as duas durações.
- Seis variantes, snapshots e combate mantêm determinismo nos testes.

## Testes

`npm run test:v452d4:dev26`; `npm test`; `python tests/browser_v452d4_dev26_vision.py`.
Ver docs/QA_V452D4_DEV26.md.

## Pacing

10/10 partidas baseadas em cinco composições, duas seeds cada, foram idênticas à dev25; média 27:29. Meta do jogo ~30min, **não** limite de tempo. A ampla amostra dev25 era 30/30 média 26:17. Não concluir paridade de balanceamento de todos os kits.
