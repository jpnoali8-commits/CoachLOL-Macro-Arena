# CoachLOL V4.5.3-dev29 — Changelog

Base: V4.5.2d-4-dev28. **Primeiro lote funcional de itens**, sem alterar máscaras, colisões, atlas, visão/Oracle, farm, Arauto, Barão, Ancião ou as regras de encerramento por Nexus.

## Código de produção

- Oito entradas adicionais ao catálogo: **Adaga, Brilho, Fago, Machado de Aquecimento, Rectrix, Força da Trindade, Cutelo Negro e Lâmina Fantasma de Youmuu**.
- Receitas validadas para os itens e componentes: componentes já possuídos geram desconto de compra, removidos no upgrade sem duplicação. Upgrade possível mesmo com seis slots quando consome item do inventário; compras são autorizadas somente na fonte/planejamento conforme regra herdada.
- **Brilho:** próxima AA após skill válida, janela 10s, CD 1,5s; dano físico adicional aproximado pelo AD-base reconstruído a partir do AD total menos AD dos itens.
- **Força da Trindade:** Lâmina Arcana mais forte (2x AD-base aproximado), aceleração de ataque adaptada ao intervalo tático e velocidade ao atingir com ataque básico. Efeito único não duplica com Brilho.
- **Cutelo Negro:** até cinco stacks de redução de armadura de 6% (máximo 30%) por 6s, ganho de velocidade por dano físico; não aplica stacks ilimitados por spell dentro do mesmo segundo.
- **Youmuu:** bônus de velocidade fora de combate e ativável 45s; sprint corpo a corpo 20% por 6s e à distância 15% por 4s, com atualização de UI e cooldown no journal. *Passagem por unidades (ghosting) não simulada*.
- Passivos e ativáveis usam somente ações autoritativas; snapshot preserva cooldowns, janela de preparo e os acúmulos. Venda remove atributos/euforia ativa.
- Novos testes `tests/v453_dev29_item_batch.test.mjs`; fixture real no Chromium `tests/browser_v453_dev29_item_shop.py`; motor do navegador regenerado (`68 exports`).

## Limitações explícitas

- **Não** representa o catálogo completo de LoL; oito entradas novas e apenas um lote de mecânicas. O Data Dragon completo de 16.21.1 não foi baixado neste ambiente; os valores deste lote foram confrontados com Riot/League Wiki, sem importação automática.
- Intervalo de ataque tático, AD-base aproximado, janelas de efeito discretizadas e bonus de movimento de Youmuu não certificam paridade exata de LoL (incluindo ausência de ghosting).
- Algumas escolhas de compra de bots mudam por existirem novos componentes disponíveis. **Não** prometer hashes iguais aos dev28.

## Fontes de patch consultadas

- Riot 26.21: https://www.leagueoflegends.com/en-au/news/game-updates/league-of-legends-patch-26-21-notes/
- Data Dragon: https://developer.riotgames.com/docs/lol (item.json versão 16.21.1; download integral indisponível no ambiente)
- Itens: https://wiki.leagueoflegends.com/en-us/Sheen, https://wiki.leagueoflegends.com/en-us/Trinity_Force, https://wiki.leagueoflegends.com/en-us/Black_Cleaver, https://wiki.leagueoflegends.com/en-us/Youmuu%27s_Ghostblade, https://wiki.leagueoflegends.com/en-us/Phage
