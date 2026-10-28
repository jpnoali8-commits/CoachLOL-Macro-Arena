# CHANGELOG — CoachLOL Macro Arena V4.5.2d-4-dev8

## Base e limites
Derivado **somente** do pacote completo V4.5.2d-4-dev7. Motor `engine.mjs` permanece autoridade. Git e alterações herdadas preservados sem commit.

## Florividente / Scryer's Bloom — novo incremento
- **Riot patch 26.1 confirmado**: novos locais em 15:00 ou transformação do Rift; respawn padrão 200–260 s e dos adicionais 90–120 s.
- Novo registro separado `baseFeatures.scryers`: **2 pontos comuns de demonstração + 10 novos** por categoria (2 costa do rio, 4 atrás de torres interiores laterais, 4 próximos às rochas dos Hexportais). **TODAS as coordenadas são provisórias/derivadas de marcos, NÃO de máscara oficial**. Sites comuns são duas posições de demonstração, não contagem oficial.
- Os 10 pontos novos só ficam disponíveis a partir de 900 segundos simulados **ou** quando o Rift já tiver se transformado (o que ocorrer primeiro).
- Método `activateScryerBloomV452d4` verifica equipe, alcance, duração/recarga e direção; pulso de 12 s com linha de visão de paredes, revela sentinelas para uma equipe e reduz temporariamente sua vida a 1 quando atingidas. **Amplitude do pulso e duração são aproximações de jogo, não paridade 1:1.**
- Recargas calculadas por hash de seed/site/ciclo, sem consumir o RNG de combate; timestamps e ciclos persistem em snapshot; dev7 restaura o registro quando antes não havia `scryers`.
- UI: Florividentes aparecem nos locais visíveis, tornam-se clicáveis quando disponíveis e chamam o motor, separadas das plantas Quimtec.

## Pós-partida
- Teste real de frontend no Chromium usando documento original/scripts inline e um hook **apenas no harness**, que força destruição de Nexus sem patchar produção: vitória azul e vermelha, imagem central correta, botão Continue, cinco abas de resultado, segundo Continue e ausência de exceções JS.
- Área clicável do botão central corrigida para coincidir com a arte em Victory e Defeat.

## Preservado
8+4 Lumes, 6 Rift variants, visão/fog, modelos de dano, telemetria dev7, CS real, freeze parcial, lojas, snapshots, velocidade de UI independente das regras.

## Evidências
`docs/QA_EVIDENCE_V452D4_DEV8/`: log npm, Chromium e seis screenshots de vitória/derrota. QA visual usa estado final acelerado, não partida orgânica de 30 min.

## Referência externa
- https://www.leagueoflegends.com/pt-br/news/game-updates/patch-26-1-notes/
- https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/
