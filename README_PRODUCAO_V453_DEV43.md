# Continuar CoachLOL V4.5.3-dev43

1. Extraia o ZIP mestre completo; base canônica dev43, não dev42. Não executar reset/rebase/limpeza destrutiva nem remover assets/Git.
2. Node 22: `npm run test:v453:dev43`, depois `npm test`.
3. Navegador: `python tests/browser_v453_dev43_projectile_duet.py` (Playwright/Chromium e Pillow necessários).
4. Simulações reais de draft: `node tools/probe_draft_v453_dev43.mjs 26 2400` e `node tools/probe_draft_v453_dev43.mjs 42 2400`.
5. Alterações no motor sempre em `engine.mjs`, seguido por `python tools/sync_browser_v43.py`; sincronizar UI `app.js` com mecanismos do motor.
6. Dev44 ideal: IA com Irelia E, dash midflight interruptível, barreiras direcionais por campeão, cobertura de monstros no Q do Ezreal, correção da escala Irelia Q 26.17, mais partidas. Preservar todas as mecânicas herdadas, documentação e snapshots.
7. Mordekaiser R V4.5.4: painel QUADRADO acima à esquerda, arena CIRCULAR de movimento com colisores/brushes/Rift originais, isolamento 1v1 e retorno real; Golpear e Reino acima de outros modais.
