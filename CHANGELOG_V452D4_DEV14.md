# Changelog — V4.5.2d-4-dev14

## Mudanças implementadas
- **Barão individual:** remove o multiplicador fixo legado de 12% no ataque básico.
- Mão do Barão agora fornece bônus de **12–48 AD** e **20–80 AP**, escalados pelo minuto de derrota do monstro (20 a 40 min); interpolação interna com expoente 1,365 é aproximação de produção, **não a curva Riot 1:1**.
- Os atributos são efetivos e derivados (`elementalStatsV452d3`): não alteram `u.ad`, `u.ap`, itens ou growth, nem se acumulam em snapshots. A hora da captura fica fixada no campeão.
- Conquista concede bônus somente aos campeões vivos; morto não recebe retroativamente, morte limpa o efeito, o buff expira por tempo e a aura de minions permanece condicionada a portador vivo próximo.
- **Ancião:** a duração de buff temporário individual passa de **150s para 180s**. Quem estava morto na captura não recebe retroativamente; os 20% de execução e o burn em três ticks permanecem conforme o modelo tático anterior.
- HUD e atributos detalhados exibem **AD/AP/defesas efetivos** e badges compactas de **Barão/Ancião** com tempo restante.
- Métodos de recompensa `grantBaronV452d4Dev14` e `grantElderV452d4Dev14`, chamados pelo próprio motor ao concluir as capturas.
- Preservados sem modificação os assets e máscaras dev12/dev13, Champ Select de dois feitiços, Golpear competitivo, Florividentes e pós-jogo.

## QA
- `npm test` completo: PASS, exit 0.
- 11 contratos novos dev14 PASS.
- `engine.mjs`, `engine.browser.js`, `app.js`: syntax PASS.
- Sincronização Node/navegador: 68 exports.
- Chromium: HUD de buffs e atributos efetivos PASS, 0 erros JS; cenário controlado.

## Referências de regras
- League of Legends Wiki, Hand of Baron: 180s, +12–48 AD e +20–80 AP escalados no instante de captura, somente em campeões vivos.
- Riot Games, patch 9.23: Barão e Ancião com duração de 180s; execução do Ancião a menos de 20% de HP.
- Riot Games, patch 26.1: números contemporâneos de Barão e Ancião como objetivos.

Não alegar paridade integral de LoL nem partida orgânica 5v5 concluída.
