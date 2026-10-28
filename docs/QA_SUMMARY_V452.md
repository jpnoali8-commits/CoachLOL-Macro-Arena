# QA V4.5.2

> Registro histórico executado no estado V4.5.2b. A falha de farm de 23 CS TOP abaixo foi resolvida bounded localmente na V4.5.2c; consulte `docs/QA_SUMMARY_V452C.md` para o recibo atual.

- **PASS:** `node tests/v452_farm_buffs_draft_shop.test.mjs`: 10 contratos.
- **PASS:** regressões: `tests/v38_1_selection_reaction_chase`, `v39_action_stats_speed`, `v40_authority_replay`, `v41_effect_resolver`, `v42_champion_kits`, `v43_items_runes_economy`, `v44_jungle_objectives_teamfights`, `v45_void_herald_parity`, `v451_waves_selection_focus`.
- **FAIL / dívida conhecida:** `tests/v38_group_combo_trinket_farm.test.mjs` no critério 35–62 CS/5min. Medição 23 TOP. Não silenciar nem remover o contrato.
- **Não concluído:** Chromium teste visual bloqueado pelo ambiente nesta rodada.
- **Passagem de entrega:** `python tools/sync_browser_v43.py` após qualquer mudança no engine; `node --check engine.mjs engine.browser.js draft.js app.js`; validar ZIP CRC. Não afirmar 1:1.
