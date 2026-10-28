# CoachLOL Macro Arena — V4.5.2d-4-dev11

## Implementado

- Champ Select com **dois feitiços por campeão**, nas posições **D/F**, com seleção independente, sem Flash obrigatório. Exemplos validados: Incendiar+Teleporte, Fantasma+Barreira, Curar+Teleporte.
- Jungler obrigatoriamente possui Golpear em D ou F, e livre escolha do outro feitiço. A UI impede duplicação de feitiços e tenta conservar Smite ao alterar o slot.
- O motor valida cada feitiço a partir do `summonerSlots`, não mais da única opção secundária, incluindo casts, movimentos Flash, combos, HUD e cooldowns.
- Campo legado `summonerSpell` e `smiteKeys` mantidos como adaptadores para saves/drafts anteriores; os novos dados do Champ Select vivem em `draft.summonerSlots`.
- Overlay competitivo de Golpear redesenhado em **16:9**, com palco central para o monstro, HP numérico + barra de HP, força de cada Golpear e ações Golpear / Guardar. Sem seletor mutável de tecla durante a disputa.
- `data/smite_media_v452d4_dev11.js` contém registro de mídia vazio, preparado para vídeos locais em `assets/objective-media/`. GLB depende de um renderizador futuro (`window.CoachObjective3DRenderer`) e conserva fallback estático.
- Sem alterar mapas e pontos provisórios de Florividentes, Rift Elemental, regras e resultados de combate.

## Evidência / testes

- `npm test`: **PASS exit 0**.
- `tests/v452d4_dev11_dual_spells_overlay.test.mjs`: **10/10**.
- Chromium: Champ Select em D=Golpear/F=Fantasma, D=Incendiar/F=Teleporte: **PASS**. Duelo 5v5 D e F com Smite+Fantasma, 8 ticks de combate prévios: **PASS 2/2**, captura única.
- Capturas PNG gravadas diretamente pelo Chromium dentro de `docs/QA_EVIDENCE_V452D4_DEV11/`.

## Limitações e fronteiras

- Teste Chromium executa cenário controlado de 5v5, não simulação orgânica da partida completa.
- Regras de dois feitiços por papel são contrato do CoachLOL; este marco não certifica paridade visual/mecânica integral com LoL.
- Render de vídeo só funciona após receber mídia local; GLB continua dependente do backend 3D ainda não implementado.
- Florividentes seguem com coordenadas provisórias, pois as máscaras definitivas ainda não foram fornecidas.
- PvP online e servidor autoritativo continuam pendentes.
