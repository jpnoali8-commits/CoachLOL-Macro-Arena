# Memória operacional — V4.5.3-dev42

- Base única para próxima etapa: ZIP mestre dev42. Usa fonte `engine.mjs` com `engine.browser.js` gerado por `python tools/sync_browser_v43.py`.
- Dev42 registra `championProjectilesV453Dev42` (array), `championProjectileSeqV453Dev42` e histórico de impacto. `castEzrealMysticShotV453Dev42` (chamado pelo resolver de Q da dev41 por padrão) enfileira colisão futura; `advanceChampionProjectilesV453Dev42` executa após movimentação de minions do tick, antes do combate. Nunca passar posição de alvo invisível em direção dinâmica ao projétil.
- Marcas Unsteady: `markIreliaTargetV453Dev42(irelia,target,'E'|'R')`; somente produtor E/R individual futuro poderá chamar; Q consome marca válida após dano não imune. Grounded e rooted bloqueiam Q sem consumo de mana. Dash permanece instantâneo no tick.
- A flag `dev41CompatibilityInstantQ` é somente um mecanismo para repetir casos históricos da dev41 que especificam impacto instantâneo. Não é ativada pelo navegador ou partida padrão. Os arquivos históricos de testes continuam presentes.
- `npm run test:v453:dev42`, `npm test`, `python tests/browser_v453_dev42_projectile_mark.py`, testes de partidas por Nexus. Auditoria e limitações em `docs/QA_EVIDENCE_V453_DEV42`.
- Conservar .git byte a byte; proibir reset, rebase, clean, commits sem autorização.
- Mordekaiser R: viewport quadrado no canto superior esquerdo, círculo interno com colisão real, clonagem de região autoral e seis Rifts, isolamento espacial real, overlay sobre HUD, retorno coerente; implementação futura V4.5.4 não deve ser esquecida.
