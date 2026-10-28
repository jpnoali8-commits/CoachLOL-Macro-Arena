# Continuidade — CoachLOL dev54

Base canônica: V4.5.3-dev54. A dev53 é a base de comparação e deve permanecer recuperável. `engine.mjs` é fonte; após edição executar `python tools/sync_browser_v43.py`. `npm test` inclui `test:v453:dev54` com 17 testes.

Itens novos: `haunting_guise` Riot 3147, `guinsoos_rageblade` Riot 3124; stats/receitas em engine, tabela sr_shop_26_21_dev49 regerada. Limitados aos efeitos realmente implementados.

Física: updateMinionBodies usa algoritmo de posições existente, anéis maiores apenas em congestionamento, sem alterar progressão econômica. Primeira versão nova alterou severamente CS; foi revertida e substituída por fallback restrito. Seeds 26/42 voltaram EXATAMENTE aos valores da dev53.

Contagens SR: 202 gerais, 90 engine, 112 apenas referência. PNGs Riot offline pendentes. Chromium não executado. Mantenha as limitações visíveis no QA.

Manter arquitetura PvP e kits individuais prioritários; bots apenas regressão. Mordekaiser R painel quadrado canto superior esquerdo, círculo real internamente, obstáculos e variações Rift preservados; Sylas/Neeko/Viego com contratos únicos. Tabuleiro 2.5D pertence a outro chat e não foi alterado.
