# CoachLOL v3.7 — Auditoria de engenharia e próximos marcos

## Entregue (verificar com os testes)
1. Relógio único para waves, spawns de jungle, mortes, cooldowns e ward expiration. Preparação congela jogo; execução anda em segundos fixos.
2. Modificadores iniciais de DPS para campos agregados, calibrados com clear controlado de Warwick. Não calibrados por campeão ainda.
3. Ward amarela temporária, limite de três por campeão, recurso separado da pink.
4. Pink: estoque por jogador comprado por 75 ouro; uma posicionada, reposicionar remove antiga; sem expiração; quatro ataques, recompensa de 30 ouro; não vaza na fog.
5. Lente Reveladora: área e janela simplificada de 8s, 90s de recarga, revela ward temporária oculta. Não destrói automaticamente.
6. HUD: botões Ward/Pink/Lente, ícones SVG locais, anéis de duração e `∞` na pink.
7. Engine: interface comum `applyCC` (stun/root/slow/knockup) e `displaceBy`, baseada em deslocamento seguro K’Sante. **Não equivale a kit individual completo**.
8. Seletor contextual para alvos sobrepostos incorporado da base v3.6 (código preservado).
9. Comandos: `Nami colocar pink na tribush do bot` agora gera ordem de sentinela de controle.

## Diferenças conhecidas do LoL
- Monstros estão agrupados (sem HP/posição individual de raptors e krugs); temporização é aproximação e clear real deve ser medido em partidas end-to-end.
- O sistema completo de visão (faelights, revelação da camuflagem, invulnerabilidade interações e score) permanece parcial.
- Suporte usa cargas de wards, mas implementação específica de slot de missão de 2026 e custos especiais de pink requer auditoria de patch.
- Desativação da visão pela pink é simplificada como proximidade; a revelação de unidades camufladas deve ser validada em partidas reais.
- `applyCC` converte efeitos em **segundos de simulação**, não conclui a equivalência de controle por rodada; é necessária uma janela de reação/interrupção específica.
- R de Janna, Insec de Lee Sin, parede de Jarvan, knockup de Braum/Nami e revive de Zilean ainda **não estão implementados como kits de campeão**.
- Multijogador competitivo/servidor autoritativo, lobby, MMR/PDL, meta patch e animações 3D próprias ainda pendentes.

## Marcos (proposta ajustada)
- **P0 v3.8:** converter CC e reações para timeline determinística de microeventos + decisões, estados de morte/ressurreição, AOE e zonas de colisão (Janna/Lee Sin/Jarvan/Braum/Nami/Zilean).
- **P0 v3.9:** teste completo de jungle real por time e 6 campos; pathfinding + aggro + stats + pets; 2026 minions/torres/nexus e vitória terminável.
- **P1 v4.0:** schema versionado de campeões/skills por regra (base/cast/target/speed/interrupt/cc/duration/missile/aoe); 10 campeões prioritários, validação do nível QWER, CD e custos.
- **P1 v4.1:** objetivos multirrodada Baron/Dragão, visão/stealth, disputa de Golpear simultânea, kill/assist/respawn.
- **P1 v4.2:** expandir planejador PT-BR com AST por campeão: ação, condições, alvos, condições sequenciais, fallback, persistência por turnos, macros e ambiguidades.
- **P2 v4.3:** inventário completo versionado, metas e efeitos oficiais em dados auditáveis; replay, telemetria, perfis.
- **P2 v4.4:** multiplayer autoritativo, lobby, reconnect, anti-cheat, matchmaking, rank/MMR/PDL.
- **Posterior:** GLB, dataset própria de animação, low poly, overlays, VFX sem afetar a resolução do motor.

## Auditoria por campeão
A lista do motor (champions presentes no dicionário `CK`) está em `MATRIZ_CAMPEOES_V37.csv`. **A presença no dicionário significa perfil de atributos, não implementação de QWER.** Criar uma especificação testável por campeão antes de marcar "kit concluído".

## Referências verificadas
https://www.leagueoflegends.com/pt-br/news/game-updates/patch-26-1-notes/

https://wiki.leagueoflegends.com/en-us/Ward

https://wiki.leagueoflegends.com/en-us/Control_Ward

https://wiki.leagueoflegends.com/en-us/Oracle_Lens
