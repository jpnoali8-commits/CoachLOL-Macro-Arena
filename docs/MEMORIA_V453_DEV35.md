# Memória de continuidade — CoachLOL V4.5.3-dev35

**Nova base canônica:** V4.5.3-dev35, derivada de dev34. Patch LoL **26.21**, Data Dragon **16.21.1**. 26.22 está previsto para **04/11/2026**, FUTURO, não ativado.

- Usuário exige **catálogo integral atualizado a cada patch**. Compra direta de qualquer componente na árvore de receita, inclusive Rabadon → Bastão Desnecessariamente Grande. Compra em loja normal deve respeitar elegibilidade de campeões.
- Wiki `https://wiki.leagueoflegends.com/en-us/Item_(League_of_Legends)` separa **Champion exclusive items** e **Minion and Turret items**. Estes últimos representam propriedades/modificadores das unidades e estruturas, NÃO itens comuns de compra: HP, dano, resistências, escalamento, alcance e efeitos podem mudar a cada patch e exigem QA de farm, Barão, Arauto, cerco, pacing.
- Na dev35 há novo `tools/catalog_unified_v453_dev35.mjs` (classificação e diff de unidades), `tools/acquire_riot_catalog_v453_dev35.mjs` (download oficial em ambiente com rede), `data/patch_center/unit_balance_26_21_local_baseline_dev35.json` (baseline de regras locais, NÃO Riot 1:1), testes 16/16. **Nenhum efeito ou patch ativado automaticamente**.
- O Data Dragon `item.json` integral ainda **NÃO foi baixado** no ambiente atual. Os dados oficiais podem ser adquiridos em execução com rede pelo downloader ou recebidos manualmente e importados no estágio. 67 itens locais mantidos.
- QA `npm test` PASS, 3/3 partidas concluídas por Nexus com hash igual à dev34; engine.mjs/browser.js/app.js byte-idênticos.
- Duração alvo cerca de 30 min, usuário aceita menos; sem forçar fim por relógio.
- Mordekaiser R futura V4.5.4: canto superior esquerdo **painel quadrado**, arena interna circular e colisor, CLONE GEOMÉTRICO real do mapa atual com moitas, colisores e variantes elementais; só Mordekaiser e alvo no 1v1; fecha automático e retorna posições relativas; overlay de R e Golpear sempre acima das outras UIs. NÃO implementado.
- Próxima prioridade: autenticar arquivos integrais de versão, auditar IDs especiais da Wiki, criar diff 26.21→26.22 quando lançado oficialmente, implementar passivas/ativos por lotes com regressão, unidades/turrets somente após fontes e QA.
- Histórico Git e alterações herdadas **preservados**, não resetar ou criar commit sem solicitação.
