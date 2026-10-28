# CoachLOL Macro Arena v1.9 — Golpear tático, HP dos monstros e disputa simultânea

**25/10/2026 · alfa offline · 12 testes novos de contrato**

## Mudanças no motor (mesma implementação para UI e texto)

1. `Arena.setSmitePolicy(team, championId, {mode, rules})` valida e armazena uma estratégia persistente do jungler. `mode` é `auto`, `hold` ou `targets`. `targets` contém `targetId` (ID do monstro neste atlas) e `hpThreshold` (HP máximo para usar Golpear, inteiro 1–10.000, ou `null` para usar o dano atual de Smite como limite). Ao informar red, o Smite **não será gasto** nos krugs, blue, dragão ou outro alvo. Ao terminar a rodada, o plano continua ativo.
2. Golpear só ocorre quando o monstro **está vivo**, dentro do alcance de engajamento do jungler e com HP menor ou igual ao patamar. Não se trata de um efeito que causa exatamente aquele valor de HP: é uma condição de disparo, enquanto o dano aplicado permanece 600/1.000/1.400 conforme progressão. A regra escolhida é usada uma vez por aparição do monstro; após respawn, volta a ficar elegível.
3. Cargas: inicia com **uma** carga de Smite, ganha a segunda em `00:48` do jogo, usa intervalo de 15 segundos entre lançamentos e recupera cada carga gasta após 90 segundos (máximo duas). Isso atualiza a v1.8, que exibia duas cargas logo no início.
4. O clear ataca **somente o acampamento escolhido** na etapa, mesmo se outro campo está próximo. O hit de AA, pet, Q aprendida e Smite é computado em um único ciclo de combate.
5. Contestações no mesmo segundo são resolvidas **simultaneamente**: o dano de todos os participantes do mesmo tick é somado, sem que `blue_JG` ganhe prioridade pelo nome do ID. O maior impacto daquele instante recebe o objetivo quando os golpes conjuntos são fatais; impactos exatamente empatados usam desempate pseudoaleatório com semente fixa. Isso é uma regra de **tabuleiro**, não uma réplica perfeita do tempo em milissegundos do LoL.

## Controles manuais

Selecione o campeão JG (Warwick, por exemplo) na lista. Na HUD da direita, abra **⚡ GOLPEAR · ALVO & HP**. Escolha `Automático seguro`, `Alvo escolhido` ou `Guardar cargas`.

Em `Alvo escolhido`, selecione o monstro (incluindo o lado `de baixo` ou `de cima`), digite seu HP, clique em **+ Outro alvo** para acrescentar mais regras e depois **Aplicar Golpear**. Para um alvo só, basta **Aplicar Golpear**. Clique em um acampamento do mapa e use **Configurar Golpear** para pré-selecioná-lo na HUD. Um anel/destaque de HP aparece no alvo visível configurado; não revela monstros ocultos pela fog.

**A condição não substitui a ordem de jungle.** O personagem continua a obedecer a sua rota, enquanto a política de Smite apenas decide se e quando a carga será usada. Não é necessário reescrever a política a cada rodada.

## Comandos por texto

O interpretador local reconhece essas expressões (sempre **Prévia → Aplicar → Executar rodada**):

- `JG golpear red` → aproxima-se do red e usa Golpear quando HP ≤ dano de Smite atual.
- `JG golpear o red de baixo com 600 HP`
- `JG red de baixo depois krugs de baixo, golpear red com 600 hp` → duas etapas, Golpear **somente** red.
- `JG golpear red aos 600 hp e smite blue com 400 hp`
- `JG smite apenas no dragao com 1200 de vida`
- `JG guardar smite` → não usar em nenhum monstro até nova ordem.
- `JG smite automatico` → retorna ao comportamento padrão, poupando Golpear até atingir HP ≤ dano atual.
- `JG golpear red com 600 HP; ADC farm safe e kite com AA` → ordens de dois campeões.

Uma ordem com nome de monstro inexistente, função errada ou HP fora de faixa falha na prévia em vez de usar outro alvo silenciosamente. O compilador usa regras locais, não um modelo generativo de IA.

## Testes e limitações

- `npm test` executa 45 contratos das versões ativas (10 v1.6, 5 scoreboard, 8 v1.7, 10 v1.8, 12 v1.9).
- `python tests/browser_v19.py` verifica a HUD da jungle, política manual, comando multi-campeão, prévia, aplicação e início de rodada no Chromium autocontido. O teste de navegador verifica fluxos amostrados, **não** certifica uma partida completa.
- IA, kits QWER, buffs de monstros, variáveis de HP por nível/minuto, leash, barras de vida e cooldowns reais, contestações subsegundo, 5v5 online, anticheat, ranking/MMR/PDL e itens por patch permanecem parciais ou ausentes. Veja `docs/AUDITORIA_PRIORIDADES_V19.md`.

**Fontes consultadas:**
- Riot, [patch 26.1](https://www.leagueoflegends.com/en-sg/news/game-updates/patch-26-1-notes/) (600/1000/1400; pet 35 cargas);
- [LoL Wiki — Smite](https://wiki.leagueoflegends.com/en-us/Smite) (uma carga inicial, segunda a 00:48, 2 cargas, 15s/90s).
