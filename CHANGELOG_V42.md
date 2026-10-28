# CoachLOL Macro Arena V4.2.0 — Kits individuais (fundação incremental)

- Base V4.1 preservada; sem regressão para V3.7.
- Registry versionado para Nami, Lux, Vex + metadados Jinx e Ahri (`CHAMPION_KITS_V42`).
- Habilidades por posição Q Nami, Q/E Lux, com alcance e caminhada até o cast, colisões entre unidades e minions, CC/status, recast Lux E e geometria data-driven.
- Vex R: valores de primeiro acerto e segundo impacto separados; R2 mantém mana/cooldown sem pagamento repetido.
- Nami R e Lux E: valores numéricos atualizados pelas referências; Nami R tem slow e knockup adaptados.
- Novos efeitos 2D flat circulares sobre mapa e indicadores de direção/alcance na HUD.
- Curva não linear de growth e atributos base auditados de Nami, Lux, Vex, Jinx e Ahri; corrige AP natural e AP artificial por nível. Export `data/champion_stats_v42.json` com progressão completa por nível.
- Fog e sigilo preservados via journal de intent e `perspective(team)`; restauração de snapshots permanece funcional.
- Export de `data/champion_kits_v42.json` e contrato futuro de ações AST (não executável).
- Suíte V4.2 própria com 16 testes de contrato e smoke Chromium, sem erros de JS.

**Não concluído:** kits/passivas 1:1, atributos completos de todos os campeões, trajetórias de projéteis subsegundo, walls/colisões avançadas, rollback transacional e multiplayer autoritativo.
