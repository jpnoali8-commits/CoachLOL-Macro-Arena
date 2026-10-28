# CONTINUAÇÃO OFICIAL — CoachLOL V4.5.3-dev67

Base única: **ZIP mestre dev67**, derivado da dev66. Ler `QA_V453_DEV67.md`, `ROADMAP_V453_DEV67.md`, `MEMORIA_CONTINUIDADE_V453_DEV67.md`, `CHANGELOG_V453_DEV67.md`, `AGENTS.md` e `.agents/skills/coachlol-producao/SKILL.md`. Arquivos legados são históricos.

**Novidade**: Curar aplica o componente primário ao conjurador e secundário somente a outro aliado vivo a até 900 unidades, sem duplicar cura no próprio conjurador. Se for usado com alvo aliado explícito, prioriza esse aliado. Incendiar/Exaustão com alvo explícito nunca redirecionam silenciosamente para outro inimigo se o original ficar fora de alcance, morrer ou entrar em fog. Sem alvo especificado, mantém escolha automática legada de inimigo visível próximo.

**Testes**: `npm run test:v453:dev67` e `npm run test:v453:dev66` validam duas sessões HTTP, efeitos, cooldown, autorização e checkpoint. `npm test` cobre regressão integral. Execute `python tools/sync_browser_v43.py` ao alterar `engine.mjs`. Evidências em `docs/QA_EVIDENCE_V453_DEV67/`.

**Não alterado**: PvP 1 humano contra 1 humano (5 por jogador), economia, Desfazer por visita à fonte, farm, minions, Nexus, IA de bots, catálogo 102/202 SR e 100 reference-only. Não alegar kits de 173 campeões completos, render de 2 browsers com HTTP/SSE nativo ou partida jogada manualmente por humanos.
