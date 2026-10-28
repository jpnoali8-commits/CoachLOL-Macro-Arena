# Continuação — V4.5.2d-4-dev6

Usar este checkout como única base. O ZIP v4.5.2d-4-dev6 contém fontes, testes, histórico `.git` herdado, assets, documentação e screenshots de fixture.

Para executar: `INICIAR_WINDOWS.bat`, ou servir `index.html` via servidor estático local. Não é necessária Internet para o motor offline; imagens de campeões podem possuir fallback local.

Testes: `npm run test:v452d4:dev6`, `npm run test:v452d4:dev5`, `npm run test:v452c`, `npm test`, `node --check app.js`, `node --check postgame.js`, `python tools/sync_browser_v43.py`.

O novo pós-jogo é um módulo de **apresentação** `postgame.js`, alimentado por `match` existente. Regras, compras, mortes, gold, visão e objetivos continuam autoritativos em `engine.mjs`. Cuidado: moedas em mãos ≠ ouro total recebido; wards ativas ≠ visão acumulada; runas são parciais; dados por minuto não são inventados.

Limitação explícita: as capturas Chromium no relatório mostram uma **fixture de interface isolada**, não uma partida 5v5 concluída via mouse. O smoke browser do aplicativo completo segue pendente.
