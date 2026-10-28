# CoachLOL — V4.5.3-dev36 | Catálogo oficial estático e fichas por patch

- Ingestão do ZIP fornecido pelo usuário em 27/10/2026. Verificados 366 arquivos contra SHA-256 e tamanho constantes no manifesto do coletor; isto não é assinatura criptográfica emitida pela Riot.
- Armazenados dados originais estáticos Riot Data Dragon 16.21.1 (`en_US` / `pt_BR`, incluindo 173 campeões detalhados), CommunityDragon `latest` capturado na mesma data; Wiki utilizada como referência de taxonomia, sem distribuir seu HTML integral.
- Construído snapshot pesquisável **863 itens**, **315** marcados para mapa 11, **254** com flag `gold.purchasable` no mapa 11. Classificação cautelosa: 246 candidatos de loja, 5 evoluções condicionais de suporte, 7 entradas exclusivas de campeões, 1 registro de Torre/Minion verificado (`Turret Plating`), 56 não compráveis, 548 de outros mapas/modos. Essas categorias são regras locais de triagem baseadas em flags e exigem revisão individual.
- Conciliados os **67 itens locais** com IDs oficiais, sem alterar sua compra, atributos ou efeitos. Relatório identifica **3 preços diferentes** (Anel de Doran, e duas evoluções de missão com preço não convencional) e **5 receitas divergentes**.
- Novo `catalogo_riot_26_21.html`: busca/filtra por categoria, mostra preço, atributos, descrição estática, receitas e elegibilidade. **Somente consulta**; link adicionado à loja existente.
- Exportadas fichas de referência 173 campeões, atributos e passivas/QWER em inglês e português; **nenhum kit certificado ou ativado automaticamente**.
- Ferramentas para ingestão de futuros ZIPs (cada nova versão requer revisão de suporte) e rebuild de referências.
- Política preservada: não forçar duração de 30 min, fim somente por destruição do Nexus. Engine, browser engine, `app.js` e baseline de minions/torres com SHA256 idêntico à dev35.
- QA: 11/11 contratos dev36 PASS; npm test integral PASS; teste controlado do visualizador no Chromium PASS, 0 exceções JS. Sem nova campanha de partidas, pois o motor não sofreu alteração.
