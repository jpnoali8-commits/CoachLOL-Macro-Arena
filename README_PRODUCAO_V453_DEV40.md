# Uso / continuidade da dev40
1. Extraia o ZIP completo; não faça reset/rebase/clean Git.
2. Execute `npm test` para regressão integral e `npm run test:v453:dev40` para 16 novos testes.
3. Mudou `engine.mjs`? Rode `python tools/sync_browser_v43.py` e teste em Node + Chromium. Ambos motores devem permanecer idênticos em lógica.
4. Rode `python tests/browser_v453_dev40_shield_onhit.py` (Playwright + Chromium local; a captura inclui o jogo real e HUD).
5. Consulte `docs/QA_EVIDENCE_V453_DEV40/qa_report_dev40.json`, `item_coverage_dev40.json` e `pacing_dev40_summary.json`.
6. O patch 26.21 é a referência local arquivada. Futuras atualizações externas exigem auditoria antes de alterar o jogo.
7. Novo contrato opt-in para habilidades: `attack(attacker,target,amount,'skill_on_hit')` para físico e `'skill_on_hit_magic'` para mágico; aplicar por kit somente após validar identidades e colisão do campeão.
