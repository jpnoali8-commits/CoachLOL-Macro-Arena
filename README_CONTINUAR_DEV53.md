# Como continuar a partir da dev53

1. Extraia o ZIP mestre completo e abra a pasta `CoachLOL_MacroArena`.
2. Audite `engine.mjs`, `engine.browser.js`, `package.json`, `QA_V453_DEV53.md`, `ROADMAP_V453_DEV53.md` e os arquivos `.git` **sem reset/rebase/commit**.
3. Execute `npm test`, verifique regressões, depois implemente a próxima menor melhoria funcional com testes específicos e snapshots.
4. Preserve as posições corporais autoritativas sem alterar diretamente o farm/progressão de lane; medir comportamento antes/depois.
5. Atualize `tools/build_sr_shop_v453_dev49.mjs` ao acrescentar itens oficiais; nunca libere itens `reference_only` sem mecânica funcional.
6. Priorize PvP e mecânicas; não aprimorar IA estratégica. Crie um ZIP mestre completo e publique apenas evidências reais.
