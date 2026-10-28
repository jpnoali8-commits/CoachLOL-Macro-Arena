# Memória de continuidade — dev40

Base para a próxima sessão: ZIP `CoachLOL_MacroArena_V453_Dev40_Escudos_OnHit_Letal_JogoCompleto.zip`. Não usar os zips da dev38/39 como base primária depois da dev40. Preservar `.git` e modificações herdadas, sem reset/clean/commits não solicitados.

`engine.mjs` é canônico; regenerar `engine.browser.js` via `python tools/sync_browser_v43.py` após qualquer alteração no motor. `damage()` resolve ataques básicos e novas habilidades explicitamente marcadas com `ability_onhit_v453_dev40` como acertos que podem disparar itens on-hit mesmo se um escudo absorver o dano à vida. `attack(...,'skill_on_hit')` / `attack(...,'skill_on_hit_magic')` são rotas explícitas de teste/integração; ainda não há implementação universal por campeão. `attack()` protege a carga Energizado contra golpes inválidos, mas agora a consome em acerto válido totalmente absorvido por escudo ou letal.

Testes: `npm run test:v453:dev40` (16/16), `npm test` (PASS), `python tests/browser_v453_dev40_shield_onhit.py` (PASS, 0 JS errors), 3 partidas naturalmente terminadas pelo Nexus seeds 26/36/42. Evidências em `docs/QA_EVIDENCE_V453_DEV40`. Amostra de pacing média 25min36s. Dados de referência patch 26.21 mantidos; 70 itens locais vs 863 referências (não equivalentes em implementação).

Prioridade dev41: integração por campeão dos on-hit de habilidades e colisor/projétil específicos, combos com resistências, sem regressão de UI preta/dourada, Smite overlay, visão, Rift Elemental, NPCs, estruturas e Nexus.
