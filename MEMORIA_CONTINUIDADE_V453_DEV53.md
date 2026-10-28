# Continuidade CoachLOL — V4.5.3-dev53

**Base:** ZIP completo da dev53 gerado a partir da dev52; conservar `.git` e todas as alterações preexistentes. Não reconstruir do zero.

- Motor principal: `engine.mjs`; navegador gerado com `python tools/sync_browser_v43.py`; `package.json` inclui `test:v453:dev53` no `npm test`.
- Foco dev53: geometria contínua para colisão segmento/círculo dos minions com campeões e dois itens funcionais SR (`lost_chapter`, `catalyst_of_aeons`).
- Catálogo de referência: `data/riot_reference/sr_shop_26_21_dev49.json`, 202 itens gerais; 88 engine, 114 de consulta. Filtro conservador para SR normal patch 26.21; jamais habilitar ARAM/TFT nem versões removidas.
- Testes: 14 novos + `npm test` PASS, 2 partidas com Nexus destruído. Não modificar física de combate dos minions até ter evidência de farm preservado; início <= 300s ainda usa alvo legado.
- Visuais, packs de ícones Riot e Chromium: permanecem pendentes; não declarar como verificados.
- Princípios: multiplayer/PvP e kits completos prioritários; IA de bots apenas smoke/regressão.
- Requisitos específicos do Mordekaiser R, Sylas R, Neeko e Viego continuam obrigatórios no marco de campeões.
