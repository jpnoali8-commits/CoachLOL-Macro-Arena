# Memória para a próxima etapa — V4.5.2d-4-dev20

- Usar **somente** o ZIP dev20 como origem para novas versões; `engine.mjs` ainda é o motor autoritativo offline.
- Todos os sistemas dev19/dev18 e anteriores preservados; manter Git herdado, sem `reset/clean`.
- Bots procuram objetivos pelo calendário público, sem revelar saúde/estado inimigo na fog.
- Olho do Arauto é propriedade da equipe vencedora e pode ser atribuído pelo clique do jogador no campeão próximo.
- O portador escolhe rota TOP/MID/BOT + ponto, caminha até ele, e só então invoca. Dano da cabeçada por índice: 3000, 2000, 1333, etc; recoil 66%.
- Torres escolhem minions quando tanquem; caso contrário podem atingir Arauto.
- Swiftplay não possui Arauto.
- Provas: `npm test` PASS, Chromium controlado PASS, 20/40min com 1–2 dragões e 4 estruturas no máximo, **sem Nexus natural**.
- Aproximações abertas: auto-consumo de Olho no vencimento; rider/steering; navegação e HP 1:1; fechamento de jogos; itens e kits incompletos.
