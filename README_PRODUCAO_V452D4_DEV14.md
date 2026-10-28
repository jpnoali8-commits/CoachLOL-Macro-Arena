# CoachLOL Macro Arena — Produção V4.5.2d-4-dev14

Esta é a única base válida deste pacote. Leia `CHANGELOG_V452D4_DEV14.md`, `docs/QA_V452D4_DEV14.md` e `docs/MEMORIA_V452D4_DEV14.md`. Não usar os textos de bases históricas como especificação da versão atual.

## Execução
1. Extraia o ZIP completo (inclui histórico Git herdado).
2. Abra `index.html` localmente ou execute por servidor estático.
3. `npm test` valida regressões; `npm run test:v452d4:dev14` testa Barão/Ancião isolados.
4. `python tests/browser_v452d4_dev14_baron_elder_ui.py` roda fixture UI no Chromium se estiver instalado.

## Regras de continuidade
- O motor JS offline segue canônico (`engine.mjs` -> `tools/sync_browser_v43.py`).
- Os bônus de Barão por time não substituem flags individuais de detentor; os campos-base de campeão não devem sofrer acúmulo.
- Ancião é temporário e não é Alma permanente.
- Mantenha o farm e as máscaras autorais; não remodele o mapa para acomodar assets.
- Dados de partida completa em modo online/Rust, gameplay 1:1 e vídeo/GLB de objetivo continuam pendentes.
