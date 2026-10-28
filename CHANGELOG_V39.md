# CoachLOL Macro Arena v3.9.0

Base: **V38.2**, nenhum motor da V3.7 ou V38.1 substituído.

- Estatísticas detalhadas na lateral direita; overlay rola e fecha ao clicar fora; >30 atributos e CDR derivado.
- Itens checados no PC SR: Glowing Mote, Kindlegem, Caulfield's Warhammer, Ionian Boots, Vampiric Scepter; Serrated Dirk corrigido para 20 AD + 10 letalidade.
- Aceleração de habilidade afeta CD de Nami W e habilidades via `abilityCooldown`, sem reset por rodada.
- Dano verdadeiro, resistência, letalidade, porcentagem/fixo de penetração e sustain por dano efetivo. Roubo de vida só em AA; tipo de efeito e proc ainda precisam cobertura.
- Introduz `ACTION_SCHEMA_V39`, `STAT_SCHEMA_V39`, `castGateV39` e `commitCastV39`; migração parcial de skills sem alegar executor universal concluído.
- Lux/Nami/Vex R direcionais por ponto no mapa, alcance+linha em preview e primeira versão da segunda ativação Vex R.
- Seletor de velocidade 1×/2×: acelera wall clock de planejamento e animação, preservando seconds gameTime, cooldowns e durations.
- Documentação canônica de marcos, backlog técnico, matriz de cobertura, proposta de banco de ações e testes `tests/v39_action_stats_speed.test.mjs`.

A execução de LoL 1:1 e todos os kits/itens/runes ainda NÃO foram concluídos; leia auditoria antes de programar V4.0.
