# CoachLOL Macro Arena v1.8 — Loja por função e missões iniciais

**Data:** 25/10/2026. **Estado:** alfa experimental, offline (sem matchmaking/PDL/servidor).

## Entregue

- Loja compacta com **recomendados**, **iniciais** e **todos**, filtrada pela função TOP, JG, MID, ADC ou SUP e pela classe. Os itens de missão exclusivos não são exibidos como compras válidas em outra função.
- **SUP:** recebe automaticamente Atlas Mundial no começo e paga 400 de ouro dos 500 iniciais. Evolução da missão ao atingir **400** (Bússola Rúnica) e **800** (Recompensa dos Mundos), com contador de wards. Ganho de cargas de Shared Riches ao causar dano real em campeão/estrutura inimiga com aliado próximo, geração passiva e reposição simplificada na fonte. Não há compra manual das evoluções.
- **JG:** escolhe na fonte um dos três companheiros: Gustwalker (azul), Mosstomper (verde) ou Scorchclaw (vermelho), por 450 de ouro. Os outros jogadores não podem adquirir pets. Smite de **600 / 1.000 / 1.400** conforme evolução do pet em **15 / 35** cargas. Dano adicional do pet e recuperação de HP no clear; bônus finais de mobilidade, escudo ou dano aplicados em forma **simplificada**. Pet some do inventário após a evolução final.
- **TOP/MID/ADC:** itens iniciais e sugestões específicas por função/classe; atiradores veem opções de ataque básico/on-hit. A lista do catálogo ainda é experimental e curta.
- Atalho de texto: `JG comprar pet verde; ADC comprar lamina de doran`. Sinônimos da cor do companheiro não são confundidos com red/blue da rota de jungle.
- Na primeira rodada, o motor garante o pet do jungler caso não tenha sido escolhido. Opcionalmente, conforme o checkbox, também completa os iniciais faltantes de TOP/MID/ADC; ordens e rotas existentes **não** são apagadas.
- Compra só durante planejamento e na fonte (salvo preparação inicial); compras respeitam ouro, inventário, tipo de item e função.
- HUD do campeão indica o progresso Smite (JG) ou Atlas (SUP), sem adicionar outro grande painel ao tabuleiro.

## Verificação

- `npm test`: **33 contratos aprovados**: 10 contratos v1.6, 5 de scoreboard, 8 de v1.7, 10 novos de v1.8.
- `python tests/browser_v18.py`: abriu a HUD, comprou o pet verde, confirmou Smite 600, exibiu o Atlas do SUP, validou compra por texto e iniciou rodada sem erros JavaScript nesses fluxos.
- Suite histórica `npm run test:historical` **NÃO APROVADA**: abrange comportamentos obsoletos do modelo live/RTS (v1.4–v1.5) e expectativas que conflitam com regras atuais. Mantida por rastreabilidade e não utilizada como gate da v1.8.

## Limites conhecidos / auditoria

1. Itens e atributos ainda **não são equivalentes 1:1 ao patch da Riot**. As missões são um modelo jogável simplificado: cura do companheiro, buffs e dano Scorchclaw aproximados; Smite possui duas cargas, bloqueio de 15s e recarga de 90s; sua seleção automática de alvo e demais interações ainda são aproximadas.
2. Shared Riches do suporte tem geração passiva e poke condicionado; execução/compartilhamento de minion, valores de regeneração e detalhes do sistema de visão ainda precisam ser completos.
3. Não há catálogo oficial extenso, componentes, receitas, venda, reembolso, itens únicos, passivas/ativas individuais ou planejamento completo de build com prioridades por matchup.
4. Nenhuma dessas regras resolve os **kits individuais** Q/W/E/R, nem valida a partida completa em multiplayer. Próxima etapa: tabelas de habilidades por campeão, efeitos e inventários com componentes + testes de partidas inteiras.
5. Esta é uma simulação experimental inspirada em conceitos MOBA. Uso comercial de nome, imagens, campeões, itens e conteúdos proprietários da Riot precisa ser avaliado separadamente antes de publicar.

## Fontes verificadas na data desta versão

- Riot, Patch 26.1: https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/ (missões por função, 15/35 cargas, 600/1000/1400).
- Riot, Patch 25.09: https://www.leagueoflegends.com/en-us/news/game-updates/patch-25-09-notes/ (restrições de Smite e item inicial de SUP).
- Wiki atual sobre World Atlas: https://wiki.leagueoflegends.com/en-us/World_Atlas
- Wiki atual sobre Smite: https://wiki.leagueoflegends.com/en-us/Smite
- Wiki atual sobre Runic Compass: https://wiki.leagueoflegends.com/en-us/Runic_Compass
- Wiki atual sobre Gustwalker Hatchling: https://wiki.leagueoflegends.com/en-us/Gustwalker_Hatchling
