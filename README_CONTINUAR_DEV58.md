# Recomeçar CoachLOL dev58

1. Este projeto é o jogo inteiro sobre dev57, não uma demo. Ler `QA_V453_DEV58.md`, `ROADMAP_V453_DEV58.md` e `MEMORIA_CONTINUIDADE_V453_DEV58.md`.
2. Testar `npm test` e `node tools/audit_pvp_minions_v453_dev58.mjs 900` antes de expandir física.
3. Verificar receitas SR 26.21 em `data/riot_reference/source_16_21_1/.../item.json`; reexecutar `node tools/build_sr_shop_v453_dev49.mjs` após novas entradas.
4. Após qualquer edição do motor, executar `python tools/sync_browser_v43.py`.
5. Proteger CS, last hits, fog, prioridades de torres e multiplayer; bots estratégicos ficam adiados.
6. `tests/v20_long_match.mjs` atinge guard e o harness estendido mostra um problema **pré-existente**, idêntico na dev57; não informar vitória por Nexus nesse teste sem novas evidências.
