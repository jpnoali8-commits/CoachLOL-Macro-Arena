# CoachLOL Macro Arena — Changelog V4.5.2d-4-dev7

## Base imutável
Somente o ZIP completo **V4.5.2d-4-dev6** foi usado. Nenhum ZIP antigo reverteu os fontes. Git herdado sujo preservado sem commit/reset/clean.

## Instrumentação determinística (motor JS autoridade)
- `postgameV452d4Dev7` por campeão: ouro inicial, ganhos, gastos, reembolsos, dano à **vida de campeões** por tipo físico/mágico/verdadeiro, dano recebido por tipo, sentinelas colocadas/destruídas.
- Ouro instrumentado nos caminhos efetivos do motor: farm com last hit, abate, item, venda, Atlas/suporte, ward destruída, Voidgrub e campos/objetivos incluindo assistências. Fórmula de reconciliação por campeão: `saldo = inicial + ganho + reembolso - gasto`.
- Dano contabilizado após resistência/absorção de escudos e limitado ao HP existente. Não inclui dano a minions/torres nem absorção de escudos; efeitos encadeados não recebem recompensa/registro duplo.
- Amostras do estado por 60 segundos de **tempo simulado**, `postgameTimelineV452d4Dev7`, início aos 0s após loja automática e captura final quando a partida encerra. O FPS/velocidade da UI 2× não altera o intervalo.
- Snapshot conserva acumuladores e amostras. Snapshots antigos sem contadores ganham `complete:false`, e o pós-jogo não inventa histórico retroativo.

## Interface
- Abas Estatísticas e Gráficos usam dados reais de dano, economia e sentinelas.
- Gráficos por jogador adicionam métricas novas e filtro por equipe/função/ordem.
- Aba Gráficos inclui evolução temporal por equipe de ouro ganho acumulado, ouro disponível e CS, com amostras autoritativas.
- Estilo preto/dourado mantido. Screenshots do Chromium são de fixture visual isolada, não da partida completa.

## Não incluído
Paridade 1:1 da Riot; dano causado a monstros, dano absorvido por escudos, pontuação de visão, linha do tempo contínua (apenas amostras de 60s), auditoria Scryer Bloom, Barão d3-B, Elder/Smite d3-C e teste Chromium Nexus real → pós-jogo.
