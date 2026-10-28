# CHANGELOG — V4.5.3-dev68

- O Q de Lux não atinge instantaneamente. O servidor enfileira projétil com posição e direção fixas, avanço por tempo simulado e testes de colisão por segmento.
- Até duas colisões por projétil com campeões/minions; colisões seguintes não reaplicam o dano ao alvo já atingido.
- Escudo de feitiço remove apenas o impacto correspondente (dano + root), consumindo uma colisão; proteção anti-projétil e paredes terminam o disparo.
- Atordoamento impede o lançamento e preserva recursos, mas não apaga projétil previamente lançado.
- Mesma mecânica no Q direcional `skill.ground` e em combos planejados do HUD PvP.
- Snapshot autoritativo inclui projétil em trânsito, progresso e alvos já atingidos para retomada sem danos duplicados.
- O teste histórico V4.2 de Lux Q foi atualizado para tempo de voo (não rebaixado); demais heranças intactas.
- Velocidade do projétil (1200 unidades/s) é **adaptação de treinamento, não valor oficial certificado**. O kit Lux continua **parcial**; nenhum item `reference_only` foi promovido.
