# Produção — CoachLOL V4.5.2d-4-dev11

**Base canônica:** ZIP dev11. Não substituir pelos anteriores nem apagar modificações pré-existentes do Git.

Abra `index.html` para o jogo offline. `draft.html` contém Champ Select: após confirmar campeões e funções, os botões **D / F** à esquerda de cada campeão permitem duas escolhas independentes. Jungler obrigatoriamente conserva Golpear no D ou F, com o outro feitiço livre. Para smoke, `npm run test:v452d4:dev11` e `npm test`.

O novo overlay de objetivo abre no último tick da disputa legítima de Golpear. Preserva D/F imutáveis durante a luta. Vídeos futuros devem estar em `assets/objective-media/` e registrados em `data/smite_media_v452d4_dev11.js`, por exemplo `dragon:{kind:'video',src:'assets/objective-media/dragon.mp4'}`. Modelos GLB só serão renderizados com integração separada; não presumir suporte GLB nativo no navegador por este marco.

Evidências visuais **reais** da execução Chromium em `docs/QA_EVIDENCE_V452D4_DEV11`, inclusive `champ_select_dual_spells_chromium.png`, `smite_5v5_f_chromium.png`, `smite_5v5_d_chromium.png`. Tais capturas são fixtures controladas.
