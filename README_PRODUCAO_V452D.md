# V4.5.2d-dev1 — Instruções para Codex/Opus

1. Abra a pasta `CoachLOL_MacroArena`. Leia `AGENTS.md`, `docs/ROADMAP_V452D_CONTINUIDADE.md`, `docs/QA_V452D_OBJECTIVE_INCREMENT.md`, `CHANGELOG_V452D_DEV1.md` e os arquivos de memória originais.
2. Base: o ZIP enviado pelo usuário contém commit `9392c0f` e trabalho não commitado. **Inspecione `git status` antes de criar novos commits; não apague modificações herdadas**.
3. Teste as novas mecânicas com `npm run test:v452d` e repita `npm run test:v452c`. Tente `npm test` integral, sem falsificar os resultados de QA.
4. Prossiga a V4.5.2d-2: efeitos dos objetivos que ainda estão parcialmente simulados. Não inicie rewrite global Rust antes de fixtures de equivalência.
5. Perfis, banco de dados, frontend web, matchmaking e milhares de partidas simultâneas são marcos futuros — não estão implementados neste pacote.

Observação: este pacote é o jogo e o código completos, não apenas documentação. Este incremento não altera os assets ou as escolhas de arte.
