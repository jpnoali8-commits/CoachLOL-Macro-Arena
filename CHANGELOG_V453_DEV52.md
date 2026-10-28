# CHANGELOG — CoachLOL V4.5.3-dev52

Base: ZIP mestre V4.5.3-dev51, preservando todos os arquivos anteriores e `.git` sem reset/rebase/commit.

## Minions e seleção de alvo

- `minionChooseEnemyV453Dev52`: a posição física real de corpo desempata alvos elegíveis próximos; o alvo válido já engajado é mantido até sair da seleção, morrer ou deixar de ser válido.
- O combate a partir do **segundo 301** usa `minionAttackTargetV452c` (mesmo seletor da previsão); até 300 segundos preserva o resolvedor histórico calibrado de last-hit, pois a substituição direta provocou regressão mensurável de farm (TOP 29 CS em vez do intervalo histórico de 35–62 em um teste).
- `minionBodyCollisionAlongV453Dev52` detecta bloqueios ao longo do segmento percorrido por campeões com ordens explícitas, inclusive quando o destino está livre; dois desvios laterais só podem ser usados se todo o trecho for livre.
- Preservados estados autoritativos `bodyX/bodyY`, 3 melee + 3 caster ou 3+1 canhão+3; sem alteração silenciosa em HP, ouro e tempo da wave.
- **Não certifica ainda** colisão de minions contra outros minions durante caminho longitudinal; pathfinding e farm físico completo permanecem pendentes.

## Itens SR — patch 26.21 / Data Dragon 16.21.1

- **Ídolo Proibido (3114)** — 600 ouro, 50% regen mana base, +8% potência de curas/escudos. Efeito real via resolvedor V41.
- **Cinzas do Destino (2508)** — 900 ouro, +30 AP, queimadura de habilidade no campeão inimigo em 3 pulsos mágicos (5/segundo, 15 total). Refresh por lançador, não ativa em AA/DOT e não causa proc recursivo. **Bônus contra monstros da jungle não implementado**: não alegar paridade integral.
- **Semblante Espiritual (3065)** — 2700 ouro, +400 HP, +50 RM, 10 aceleração, +100% regen vida base, amplificação em 25% de cura/escudo RECEBIDOS via resolvedor V41. Escudos especiais que não passam no resolvedor serão revistos.
- Todos os três têm custo, ID, disponibilidade, receita, componentes, venda/descontos e snapshots testados. Itens de outros modos permanecem excluídos.
- **86/202** itens gerais SR vinculados ao motor, **116** itens gerais ainda só para consulta; estar vinculado NÃO certifica todas as passivas/ativáveis.

## Qualidade

- Testes novos: 15/15 PASS; `npm test`: PASS, incluindo os históricos após atualização de contagem dinâmica na suite dev49.
- Duas partidas automatizadas (26, 42) terminadas por destruição natural do Nexus e invariantes sem falhas.
- `engine.browser.js` regenerado de `engine.mjs` usando `tools/sync_browser_v43.py`.
- Chromium visual não certificado neste lote; não foram inventadas capturas. Cache offline de ícones Data Dragon permanece pendente; nenhum fallback Wiki.
- **IA estratégica de bots não foi aprimorada**. Multiplayer e kits de campeões permanecem linha central.
