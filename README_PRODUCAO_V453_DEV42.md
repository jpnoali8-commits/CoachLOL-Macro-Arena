# Como continuar a dev42

1. Extraia `CoachLOL_MacroArena_V453_Dev42_Projetil_Tempo_Marcas_JogoCompleto.zip`. `node` 22.16 ou compatível.
2. Confira `npm run test:v453:dev42` (19 cenários), depois `npm test` e `python tests/browser_v453_dev42_projectile_mark.py`.
3. Não edite `engine.browser.js` diretamente; modifique `engine.mjs` e rode `python tools/sync_browser_v43.py`.
4. Instância de Arena nova ativa resolução temporal do Q de Ezreal sem configuração; testes específicos herdados da dev41 usam flag de compatibilidade local explícita.
5. Comparar cenários reais com campeões Ezreal/Irelia além da composição default; `npm test` verifica implementações mas não certifica paridade integral do LoL.
6. Preservar árvores Git, arquivos originais, masks/Rift, wards/visão, tabuleiro, Golpear. O futuro Mordekaiser R deve usar painel quadrado superior esquerdo e arena circular real clonada da região atual.
