# Continuar CoachLOL a partir da V4.5.3-dev62

Use obrigatoriamente este ZIP mestre. A dev61 é a base preservada e a dev62 implementa a integração da loja ao tabuleiro multiplayer e os testes ampliados.

**Arquivos prioritários:** `AGENTS.md`, `MEMORIA_CONTINUIDADE_V453_DEV62.md`, `QA_V453_DEV62.md`, `ROADMAP_V453_DEV62.md`, `CHANGELOG_V453_DEV62.md`, `version.json`, `multiplayer.html`, `multiplayer/pvp_client_v453_dev47.js`, `multiplayer/server_v453_dev47.mjs`, `multiplayer/room_v453_dev47.mjs`.

**Modelo PvP:** 1 humano controla cinco campeões azuis; 1 humano cinco vermelhos. Ordens simultâneas, autorização e economia pelo servidor. Não é 10 jogadores.

**Fonte/Desfazer:** comprar -> sair fisicamente -> voltar -> desfazer é SEMPRE proibido para operações anteriores à saída. Comprar/vender de novo após o retorno inicia um novo histórico. Não alterar esta regra.

**QA:** `npm run test:v453:dev61`, `npm run test:v453:dev62`, `npm test`. Interface Chromium com dois contextos foi testada com ponte de requisições Python porque o Chromium local bloqueia localhost HTTP por política. Não chamar de verificação nativa HTTP/SSE nem partida humana até Nexus.

**Catálogo:** 102 dos 202 itens gerais SR vinculados ao motor, 100 apenas referência offline e não compráveis. Não promover itens com passivas pendentes como certificados.
