# QA — CoachLOL V4.5.3-dev35 (27/10/2026)

## Resultado e escopo
- **`npm test` integral: PASS** (log `docs/QA_EVIDENCE_V453_DEV35/npm_test_full.log`); **16/16 novos contratos**.
- `engine.mjs`, `engine.browser.js` e `app.js`: SHA-256 **idênticos à dev34**; NÃO houve atualização automática de combate, itens, minions ou torres.
- **3/3 partidas 5v5** concluíram por destruição real do Nexus e mantiveram **3/3 hashes finais, vencedores e durações idênticos à dev34** (seed 26 25:50, seed 36 27:21, seed 42 20:53). Média pequena **24:41**. Sem vitória forçada por relógio.
- Testes novos: classificação separada de itens compráveis, exclusivos, não-SR e internos; compra condicionada a campeão revisado; impedimento de itens internos na loja/ingredientes; detecção de receitas quebradas/cíclicas; staging incompleto recusado; fonte versão divergente recusada; baseline local de minion/torre; diff por patch com QA obrigatório; nenhuma mudança no motor na operação de importação.

## Fonte externa: dado integral NÃO adquirido
- Oficial Data Dragon: `https://ddragon.leagueoflegends.com/cdn/16.21.1/data/en_US/item.json` (confirmação documental da Riot).
- League Wiki: categoria **Champion exclusive items** e **Minion and Turret items** confirmadas. Wiki é apoio de taxonomia; não substitui metadados versionados nem valida habilidades.
- CommunityDragon: fonte comunitária suplementar para assets e arquivos de cliente, não substitui automaticamente Data Dragon oficial ou regras de jogo.
- Download falhou nesta execução: DNS no `requests`, download de URL, acesso à URL bruta pela ferramenta web e `fetch` Node. **Nenhum arquivo integral real foi criado**, e o jogo conserva **67 itens locais**.
- `tools/acquire_riot_catalog_v453_dev35.mjs` pode obter `item.json` e `champion.json` autênticos quando executado num ambiente com Internet; checa versão, contagem mínima, SHA-256, e não modifica o motor.
- `tools/catalog_unified_v453_dev35.mjs stage --items ... --output ...`: classifica todos os IDs disponíveis; arquivo parcial é recusado sem `--sample`, e `--sample` é APENAS para testes. Nenhum item novo é declarado implementado.

## Distinção solicitada: minions e torres
- `data/patch_center/unit_balance_26_21_local_baseline_dev35.json` guarda valores **já vigentes no motor**, incluindo bases e crescimento após os primeiros 5 minutos, torres exteriores com 9000 HP e 60 armor e demais estruturas.
- Valores são **calibração local**, não paridade oficial certificada. Atributos não identificados em fonte direta, como dano de tiros de torre nesse snapshot, **não foram inventados**.
- `compareUnitBalance` identifica futuras mudanças por patch em HP/dano/armadura/escalamento/intervalos etc., exige validação farm, cerco, Barão, Arauto, Nexus e determinismo, sem aplicar alterações automaticamente.
- Classificações reais por item wiki exigem revisão de ID e fonte; `item_taxonomy_overrides_dev35.json` permanece vazio para não criar mapeamentos fictícios.

## Sem alterações
- Nenhuma alteração na loja visual, atributos de campeões, passagem de turno, Arena, Oracle, Golpear, Arauto, Barão, animações e Mordekaiser R.
- **Chromium dev35:** não foi executado; último E2E do navegador é histórico dev28; não há captura nova atribuída a esta etapa.
- Git preservado, sem commit/reset/clean. Histórico herdado e mudanças anteriores mantidos.

## Gates ainda abertos
- Catálogo integral autêntico por versão e identificação dos IDs internos/exclusivos.
- Validação de todas as receitas, itens de outros modos, ícones, effects/passivas/ativáveis; completar lista jogável de SR.
- Aplicação real de dados de minions/torres de patch futuro, após notas oficiais e testes (não confundir com baseline local).
- Paridade de kits QWER de campeões e ultimate do Mordekaiser V4.5.4.
