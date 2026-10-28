# Continuidade V4.5.2d-4-dev21

## Nova base
Use o ZIP completo dev21 como ÚNICA base. Não voltar à dev20 ou bases históricas. Histórico Git e todas as alterações herdadas preservadas.

## Implementações
- `engine.mjs`: `heraldRearEyeV452d4Dev21`, `attackSummonedHeraldV452d4Dev21`, `orderAttackSummonedHeraldV452d4Dev21`; hit do olho invocado 40% HP máximo verdadeiro, 3s de recarga, posição traseira e fonte de visão.
- `app.js`: clique no Arauto inimigo visível dá ordem de ataque e marcador roxo no olho se pronto.
- `autoAdvanceLane`: bot com ordem push pode acompanhar wave aliada sem inimigos minions, apenas após 780s e com wave real.
- Fontes do LoL: wiki League of Legends Rift Herald consultada em 2026-10-27; diferenças neutro 12% / invocado 40%. Não anunciar paridade 1:1 total.

## QA
`npm test` PASS. Testes dev21 10/10. Chromium real, 15 SVGs e atlas reduzido carregados. Long matches 20m/40m sem erros, mas nenhum Nexus encerrado organicamente.

## Pendências
- Autonomia de bots para inibidores, Nexus e encerramento natural de partida (dev22).
- Pilotagem opcional do Arauto e habilidades específicas; testes 5v5 integrais.
- LoL skills completos, itens/receitas/runas por patch versionado, transformações Nidalee/Elise/Shyvana e Mordekaiser ainda pendentes.
