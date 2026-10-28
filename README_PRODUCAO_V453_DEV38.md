# Continuidade dev38 → dev39

1. Extrair `CoachLOL_MacroArena_V453_Dev38_Passivas_Energizado_JogoCompleto.zip`, mantendo `.git/`, `data/`, `assets/`, `docs/` e todos os arquivos legados; **não rodar `git reset`, `git clean`, nem commits**.
2. Entrar em `CoachLOL_MacroArena/` e executar `npm test`; testes do lote `npm run test:v453:dev38`.
3. Se editar `engine.mjs`, sincronizar o navegador: `python tools/sync_browser_v43.py` e então rodar testes novamente.
4. Browser: `python tests/browser_v453_dev38_item_passives.py` (Chromium/Playwright/Pillow). Capturas verdadeiras em `docs/QA_EVIDENCE_V453_DEV38`.
5. Para regenerar **apenas a referência estática** e matriz: `npm run catalog:publish:dev38`. Nunca atualizar automaticamente o motor de combate ao baixar dados oficiais.
6. Teste de partida: `REPORT_JSON=resultado.json node tools/pacing_item_probe_v453_dev29.mjs 26 baseline 2700` (seeds 26, 36 e 42).
7. A dev39 deve priorizar próximos efeitos individuais e auditoria de magias/ataques ao contato, com contratos próprios. A Central de Patches continua bloqueando upgrades de regras não auditados. Manter a destruição natural do Nexus como condição de vitória.

**Limites**: 70 itens locais não significam 70 passivas completas; 863 registros e 173 fichas são somente referência. Os efeitos de Scout, Rapid Firecannon e Anel de Doran representam implementações parciais nos segundos simulados. RFC considera caminhada por caminhos, não todo teleporte/dash.
