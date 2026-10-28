# Rodar CoachLOL — V4.5.2d-3A (offline)

Abra o projeto completo numa pasta e inicie um servidor HTTP local para acesso web aos recursos: `python -m http.server 8080`, depois `http://localhost:8080/index.html`. No Windows use também `INICIAR_WINDOWS.bat` conforme instruções originais. O código JavaScript é o motor autoritativo offline.

## QA

`npm run test:v452c` — farm calibrado e freeze parcial

`npm run test:v452d` — Barão/Ancião incrementais

`npm run test:v452d2` — seis Dragon Souls e Recall Barão

`npm run test:v452d3` — seis passivos elementais com stack

`node --check engine.mjs` — sintaxe

`python tools/sync_browser_v43.py` — sincroniza o browser

`npm test` — regressão integral

Resultados, limitações e próxima etapa em `docs/QA_V452D3A_ELEMENTAL_PASSIVES.md` e `docs/ROADMAP_V452D3A_CONTINUIDADE.md`. Chromium visual **não certificado** nesta entrega (timeout). Não comercializar como cópia 1:1 de LoL.
