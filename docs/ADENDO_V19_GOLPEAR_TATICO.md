# ADENDO DE BÍBLIA — GOLPEAR TÁTICO (v1.9)

**Prevalece sobre políticas genéricas de Smite de v1.8.**

# CoachLOL Macro Arena v1.9 — Golpear tático, HP dos monstros e disputa simultânea

**25/10/2026 · alfa offline · 12 testes novos de contrato**

## Mudanças no motor (mesma implementação para UI e texto)

1. `Arena.setSmitePolicy(team, championId, {mode, rules})` valida e armazena uma estratégia persistente do jungler. `mode` é `auto`, `hold` ou `targets`. `targets` contém `targetId` (ID do monstro neste atlas) e `hpThreshold` (HP máximo para usar Golpear, inteiro 1–10.000, ou `null` para usar o dano atual de Smite como limite). Ao informar red, o Smite **não será gasto** nos krugs, blue, dragão ou outro alvo. Ao terminar a rodada, o plano continua ativo.
2. Golpear só ocorre quando o monstro **está vivo**, dentro do alcance de engajamento do jungler e com HP menor ou igual ao patamar. Não se trata de um efeito que causa exatamente aquele valor de HP: é uma condição de disparo, enquanto o dano aplicado permanece 600/1.000/1.400 conforme progressão. A regra escolhida é usada uma vez por aparição do monstro; após respawn, volta a ficar elegível.
3. Cargas: inicia com **uma** carga de Smite, ganha a segunda em `00:48` do jogo, usa intervalo de 15 segundos entre lançamentos e recupera cada carga gasta após 90 segundos (máximo duas). Isso atualiza a v1.8, que exibia duas cargas logo no início.
4. O clear ataca **somente o acampamento escolhido** na etapa, mesmo se outro campo está próximo. O hit de AA, pet, Q aprendida e Smite é computado em um único ciclo de combate.
5. Contestações no mesmo segundo são resolvidas **simultaneamente**: o dano de todos os participantes do mesmo tick é somado, sem que `blue_JG` ganhe prioridade pelo nome do ID. O maior impacto daquele instante recebe o objetivo quando os golpes conjuntos são fatais; impactos exatamente empatados usam desempate pseudoaleatório com semente fixa. Isso é uma regra de **tabuleiro**, não uma réplica perfeita do tempo em milissegundos do LoL.

