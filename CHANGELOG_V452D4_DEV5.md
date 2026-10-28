# CHANGELOG — V4.5.2d-4-dev5

## Entrega
- Atualização dos Lumes/Faelights para a máscara v2 do usuário.
- Total canônico do branch: **12 pontos** = **8 early game + 4 late game**.
- Liberação tardia configurada como **15:00 OU transformação do Elemental Rift** (`time_or_rift`), marcada como canon do projeto e não certificação Riot 1:1.
- Região bônus ao wardar o ponto continua por **45s** e agora é renderizada **sem borda**, apenas preenchimento sutil.
- Adicionados overlays centrais de **Victory** e **Defeat** com **Continue**.
- Adicionada tela de **resultado pós-jogo** com frag por time, métricas comparativas e tabela por jogador.

## Arquivos-chave
- `data/rift_user_manifest_v452d4.json`
- `data/rift_user_assets_v452d4.js`
- `data/rift_faelights_v452d4_dev5_audit.json`
- `tools/import_faelight_tiered_masks_v452d4_dev5.py`
- `assets/ui/endgame/victory_overlay.png`
- `assets/ui/endgame/defeat_overlay.png`
- `tests/v452d4_dev5_faelight_tiers.test.mjs`
- `tests/v452d4_dev5_ui_results.test.mjs`

## QA
- `npm test` PASS
- contratos dev5 PASS `5/5`
- UI result/endgame PASS
