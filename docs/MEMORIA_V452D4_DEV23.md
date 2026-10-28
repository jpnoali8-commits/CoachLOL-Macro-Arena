# Continuidade canônica — CoachLOL V4.5.2d-4-dev23

**Base:** usar o ZIP `CoachLOL_MacroArena_V452d4_Dev23_Media30min_Nexus_JogoCompleto.zip`, não dev22.

**Objetivo de produto:** média por partida de cerca de 30min, sem limite temporal artificial nem vitórias/derrotas sem destruir o Nexus.

**Feito:** 5 vitórias orgânicas de 5 seeds no motor offline; durações 33:18/33:24/26:08/25:50/21:54, média 28:07. HP das torres externas mantido 9000; redução da armadura/RM aos 11-15min; bots continuam push após inibidor; minions tomam rota física até estruturas do Nexus; upgrade controlado de waves pós-5min; bots gastam ouro legitimamente na fonte.

**QA:** npm test integral PASS; 9/9 contratos dev23; exports browser 68; Chromium de partida completa NOT_RUN.

**Pendente:** matriz de 30+ seeds em 2+ drafts; Variedade de runas/itens/kits, de forma que a média seja válida além desse draft. Monitorar pathfinding late-game e snapshot/replay de 30+min. Modo Swiftplay deve ter meta própria e não herdar a meta SR indiscriminadamente. Retomar V4.5.3 para receitas/passivas e V4.5.4 para kits por lotes.

**Proteções:** não sobrescrever nem limpar arquivos herdados/Git dirty. Respeitar geometria user-mask, fog/brush, CC0 dos 15 SVGs, Rift, Golpear competitivo, HERALD eye, summon D/F, Elder e HUD.
