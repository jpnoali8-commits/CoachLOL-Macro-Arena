# Roadmap a partir da dev27

## Dev28 — visão/combate integrado e prontidão de catálogo
1. Automatizar um cenário orgânico de abertura do client/Champ Select, partida até Nexus, fog e pós-jogo em Chromium; medir custo e registrar erros.
2. Auditar queries densas de `lineOfSight`, `brushRegionAt` e efeitos de movimentação sob múltiplas wards simultâneas.
3. Repetir a matriz de duração quando qualquer conteúdo de combate for introduzido; meta aproximadamente 30 minutos, vitória real por Nexus.

## V4.5.3 — itens e receitas por lotes
- Adquirir dados versionados 26.21/cliente suportado, validar itens básicos, componentes, preços, receitas, efeitos passivos/ativos, cooldown, duplicidade e interação em combate.
- Priorizar um lote realmente implementado e testado, sem afirmar que todos os itens estão presentes por listar nomes.

## V4.5.4 — campeões por lotes
- Escalonamento de stats 1–18 e kits passiva/Q/W/E/R por campeão, com contratos de combate.
- Estados de transformação Nidalee/Elise/Shyvana e instância 1v1 do Mordekaiser como sistemas do motor, não apenas VFX.

## Portas de qualidade
- `npm test` completo; Chromium com fonte e assets reais; paridade e performance medidas, snapshots determinísticos, privacidade de equipe testada.
