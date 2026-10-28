# Checklist de entrega — CoachLOL 4.2.0

- [x] Base V4.1 preservada, nenhuma sobrescrita histórica da V3.7
- [x] `npm test`: **213** ✓; contratos novos V4.2: **16**
- [x] `python tests/browser_v42_kits.py`: interface/Nami Q/Lux UI AoE/painel, **0 erros JS**
- [x] `node tests/v20_long_match.mjs 300 42`: jogo avança 300 segundos, sem erros de invariantes
- [x] `node tools/export_kits_v42.mjs` e `node tools/export_champion_stats_v42.mjs` atualizados
- [x] Node e browser usam o mesmo código, com exports adaptados somente à plataforma
- [x] Roadmap, auditoria, changelog, datasets, instruções e skill local atualizados
- [ ] Passivas/QWER de todos os campeões 1:1 (não escopo de certificação nesta versão)
- [ ] Testes completos de VFX/recursos gráficos em Windows com assets externos; Chromium foi executado com fallback de ícones e mapa
- [ ] PvP seguro, causal replay, projéteis contínuos, modos 1x/2x em servidores (roadmap)
