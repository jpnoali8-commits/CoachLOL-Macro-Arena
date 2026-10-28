# Roadmap — após V4.5.2d-4-dev6

**Dev7 P0 — Instrumentação determinística do pós-jogo:** persistir acumuladores damage dealt/taken (físico/mágico/verdadeiro), ouro ganho/gasto/atual, sentinelas colocadas/detectadas/eliminadas, objetivações por jogador sem dupla recompensa. Derivar gráficos por minuto de amostras do motor, snapshot/replay e contratos de team/fog. Não usar números sintéticos na produção.

**Dev7 P1 — Rift Vision:** auditar Scryer's Bloom 15:00/transformação, respawns e posições do usuário, colisão e fog; confirmar máscara TOP. Garantir 12 Faelights do ZIP v2, apenas 4 novos no desbloqueio, sem retirar 8 early.

**Dev7 P2 — QA visual end-to-end:** Chromium Nexus real → imagem Victory/Defeat → Continue → abas/filters → Continue; perf, 16:9 e tela pequena. Caso bloqueio persista, registrar NOT_RUN.

**d3-B/d3-C:** Barão atributos por campeão, aura por minion, Elder/Smite competitivo. Sem novos valores 1:1 sem auditoria de patch.

**Plataforma:** snapshots e contratos JS antes de qualquer Rust/WebAssembly/backend.
