# CoachLOL V4.5.2d-4-dev28 — Memória de continuidade

- **BASE dev28**: `engine.mjs`, `engine.browser.js`, `tests/v452d4_dev28_oracle_through_walls.test.mjs`, `tests/browser_v452d4_dev28_oracle_through_walls.py`, `tests/browser_v452d4_dev28_full_match.py`.
- Foi um erro da dev27 exigir `lineOfSight` para o Radar Oracle. A detecção de Oracle é radial e ignora terreno; pink e visão geral do mapa respeitam parede/moita. Atualização registrada também no teste dev27.
- `oracleDetectsWardV452d4Dev28`, `refreshOracleWardsV452d4Dev28`, `wardVisionSuppressedV452d4Dev26`, `wardKnownTo` implementam nova regra. Snapshot salva `oracleSuppressedUntilV452d4Dev28`; cauda 2 s.
- Não permitir ataque através da parede só porque radar detectou a ward. A perspectiva do adversário não deve revelar `owner`, `createdAt`, `hiddenAction` etc.
- `npm test` PASS. Browser scan PASS (15 SVGs + atlas), browser full bot match + vitória/pós-jogo PASS a 33:10. 10/10 partidas Node terminam no Nexus, duração média 27:29, **hash final idêntico à dev27**.
- Próximo: **V4.5.3** implementar itens e receitas reais em lotes pequenos, com dados de referência patch 26.21, mecanismos passivos/ativos determinísticos e testes de loja/inventário. Depois **V4.5.4** stats/kits campeões, Nidalee/Elise/Shyvana/Mordekaiser.
- Prioridade permanente: duração alvo ~30min média, sem finalização artificial; preservar máscara autoral, 15 SVGs CC0, Smite D/F, Barão/Ancião/Arauto, fog e Git herdado.
- Pendente: QA interativo humano completo, ajustes atuais de Oracle (cargas/recharge/champion-silhouette), PvP e paridade de LoL de campeões/itens; nada disso está homologado.
