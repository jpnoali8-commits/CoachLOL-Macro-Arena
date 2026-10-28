# Memória / handoff dev10

**Base atual:** V4.5.2d-4-dev10 ZIP completo desta entrega. NÃO continuar a partir de dev9/dev8 se dev10 estiver disponível.

- Smite 600/1.000/1.400 (patch 26.1) e Dev9 RNG ponderado 5v5 continuam.
- `engine.mjs` fonte autoritativa offline; `engine.browser.js` gerado por `tools/sync_browser_v43.py` (65 exports).
- `draft.js` oferece `JG GOLPEAR` D/F em seletor dedicado; `draft.html` passa `smiteKeys` ao lobby; `Arena` define `u.smiteKey`; snapshots mantêm.
- `app.js` lê tecla diretamente do JG azul e bloqueia seletor no overlay final.
- Regra Smite CC: permitido com stun e outros controles não supressivos, bloqueado por supressão/estase; valida alcance 500 de camp real.
- Teste dev10 está em `tests/v452d4_dev10_5v5_smite_draft.test.mjs` (7/7). Chromium 3 fixtures em `docs/QA_EVIDENCE_V452D4_DEV10`.
- 12 Faelights v2 (8 early + 4 tardios), Scryer Bloom provisória, todos os Rifts e assets mantidos.
- Git herdado estava sujo com mais de 100 entradas; não fazer reset, clean ou commit sem revisão.

**Próximo:** certificar combate 5v5 em uma partida simulada completa 0:00→fim; Barão d3-B, Elder d3-C; Scryer masks somente quando usuário enviar.
