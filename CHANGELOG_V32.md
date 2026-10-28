# CoachLOL Macro Arena v3.2 — Loja, recompensas por função e feitiços

**Data:** 26/10/2026. **Estado:** alfa experimental offline-first, não equivalente ao League of Legends competitivo.

## Implementação no jogo executável

- **Finalizar Turno** removido da seção de Planejamento e posicionado à direita da barra de ordens. O turno só é executado quando confirmado, respeitando os estados congelados e decisões pendentes.
- **Loja:** clicar em equipamento **seleciona**, apresenta descrição/preço e árvore de componentes no painel direito; apenas **Comprar/Programar compra** solicita transação. Loja maior, filtros, busca, inventário e filas por campeão preservados.
- **Primeira receita operacional do novo sistema:** Capuz da Morte de Rabadon ← 2× Bastão Desnecessário; na compra, o motor desconta o valor e consome os componentes já possuídos, sem duplicar atributos. Dados de preço e receita registrados segundo fontes consultadas em 26/10/2026; outros itens ainda usam catálogo reduzido.
- **Itens de missão**: pet de selva e Atlas do SUP não podem ser duplicados em compras ou filas. Recomendações não repetem automaticamente o starter já equipado.
- **Jungle por outras funções:** qualquer campeão pode receber ordem de ataque a um acampamento pelo tabuleiro e limpar com AA/skills abstratas. Apenas o jungler com pet tem Smite, bônus e evolução do pet. No simulador atual o prêmio do campeão sem pet é reduzido; o ajuste exato não representa uma fórmula oficial da Riot.
- **Fog:** posições conhecidas dos acampamentos podem ser usadas para planejamento sem revelar HP/respawn enquanto não estiverem visíveis.
- **Suporte:** farming não é proibido. A penalidade de função de 2026 em ouro e XP por minion fora da bot lane até o nível 5 é aproximada por multiplicador de 0,67. O SUP mantém recompensa e XP normais na bot lane. A missão de ouro e os efeitos de Shared Riches requerem refinamento adicional.
- **Segundo feitiço de invocador:** programação independente de Curar (ADC), Incendiar (MID), Exaustão (SUP), Teleporte (TOP). Mantém ordem persistente e aplica cooldown. São implementações simplificadas: não reproduzem integralmente os efeitos/tempos/alvos oficiais, sobretudo Teleporte e Ignite.
- **Configurações:** botão de restaurar redefinindo escala, largura dos docks e câmera; estilo escuro aplicado ao novo painel da loja.
- Preservados: câmera orbital, seleção e renderização QWER, Auto Upar, combos, barramentos do Data Dragon, texto em dois Enter, jungle path, Smite tático, placar, premissas da Bíblia.

## Testes executados

- `npm test`: **98 asserções/grupos reportados como aprovados**, incluindo 8 novos contratos v3.2.
- `node tests/v20_long_match.mjs 300 33`: 5 min simulados, sem violações dos invariantes monitorados. **Não certifica partidas completas**.
- Chromium autocontido: sem erros JS nos cenários exercitados; Jinx compra 450g após selecionar item; Ahri mostra a árvore de Rabadon com dois componentes; segundo spell de Ahri disponível; botão Finalizar Turno aparece à direita.

## Fontes e limitações

- Data Dragon (itens, descrição, `from`, `into`, imagem): https://developer.riotgames.com/docs/lol
- Suporte 2026 e penalidade fora de bot lane: https://wiki.leagueoflegends.com/en-us/Role_Quests
- Receita Rabadon: https://wiki.leagueoflegends.com/en-us/Rabadon%27s_Deathcap

Faltam receitas, efeitos e itens completos por patch, kits oficiais por campeão, verificação exata de feitiços, partida competitiva que acaba por Nexus, multiplayer autoritativo, ranked/PDL e UX final em todas resoluções.
