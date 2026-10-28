# QA — V4.5.3-dev36

## Fontes e confiança

O usuário forneceu o arquivo `CoachLOL_ENVIE_NO_CHAT_DADOS_16_21_1_20261027_173616.zip`. O script `tools/ingest_user_catalog_v453_dev36.py` verificou individualmente 366 downloads contra seus SHA-256 e bytes anotados no manifesto recebido, além da versão 16.21.1 e de 173 arquivos individuais de campeão em cada idioma. Não houve falhas no pacote; **isso confirma a integridade em relação ao manifesto fornecido, não autenticação criptográfica independente da Riot**.

## Resultado

- `node tests/v453_dev36_official_catalog.test.mjs`: **11/11 PASS**.
- `npm test`: **PASS**, log `docs/QA_EVIDENCE_V453_DEV36/npm_test_full.log`.
- `python tests/browser_v453_dev36_catalog.py`: **PASS**. Chromium real, HTML e script originais embutidos em `page.set_content`, pois navegação `file://` está bloqueada neste ambiente. Pesquisa por Rabadon, árvore com dois componentes, sete exclusivos, Turret Plating interno. 0 erros JS. Evidências `official_rabadon_recipe_chromium.png`, `official_turret_internal_chromium.png` e `browser_official_catalog_report.json`.
- SHA-256 **idênticos dev35→dev36**: `engine.mjs`, `engine.browser.js`, `app.js`, `data/patch_center/unit_balance_26_21_local_baseline_dev35.json`.
- **Nenhuma nova partida longa executada nesta etapa**: paridade do código de combate foi verificada por igualdade exata dos arquivos; não alegar que houve nova auditoria de tempo ou vitória orgânica nesta dev.

## Conciliação de loja

| Indicador | Resultado |
|---|---:|
| Entradas Data Dragon | 863 |
| Entradas para mapa 11 | 315 |
| Marcadas compráveis pelo Data Dragon no mapa 11 | 254 |
| Candidatas de loja após triagem | 246 |
| Evoluções de missão de suporte | 5 |
| Exclusivas com `requiredChampion` no cliente | 7 |
| Interno classificado individualmente | 1 (`Turret Plating`) |
| Itens jogáveis locais | 67/67 vinculados a IDs Riot |
| Preços divergentes | 3 (2 não são compras convencionais) |
| Receitas divergentes | 5 |
| Ciclos ou componentes ausentes | 0 |

Preços divergentes: Anel de Doran (450 local / 400 Data Dragon), Bússola Rúnica e Recompensa dos Mundos (evoluções automáticas: 0 local, 400 no campo `gold.total` do DDragon). Não é correto comprar essas evoluções por 400g; exigem estado de missão.

Receitas divergentes: Cinto do Gigante, Canhão Fumegante, Punhal Serrilhado, Cajado do Vazio e Ampulheta de Zhonya. A comparação é baseada em IDs mapeados; **ainda não alterada em partidas**. Arquivos CSV dentro da evidência.

## Pendências

1. Revisão de todos os 246 candidatos como itens realmente disponíveis na loja de SR (regras especiais de missão/trinkets, disponibilidade por campeão e modo). Não habilitar indiscriminadamente.
2. Passivas/ativáveis não são implementadas automaticamente pelas descrições Data Dragon. É necessário codificar e testar item por item.
3. Taxonomia `Minion and Turret items` da Wiki ainda não possui mapeamento integral de IDs para estatísticas internas. Somente o registro `Turret Plating` é classificado pelo nome/flags nesta etapa; atributos-base das unidades continuam os do motor local.
4. `CommunityDragon/latest` foi coletado no dia 27/10/2026 e não comprova alinhamento de cada campo com o patch 26.21; cruzar divergências com notas oficiais.
5. A versão 26.22 é futura e **não foi ativada**. Nova coleta por patch + QA são obrigatórios.
6. Resta implementar todos os kits, transformações e a ultimate R do Mordekaiser (overlay quadrado, círculo colisor, clone fiel da geometria e alterações elementais, camada prioritária; atualmente apenas especificada).
