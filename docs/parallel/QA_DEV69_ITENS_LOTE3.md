# QA CoachLOL Dev69 — Itens Batch 3 (15 itens)

**Base imutável:** `dev69/items-batch2` commit `182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d`. Branch `dev69/items-batch3`, PR empilhado na branch anterior, **não** em `dev69/integration`, que não deve receber nenhum merge até solicitação do usuário. Referência congelada: LoL PC **26.21**, Data Dragon **16.21.1** em `data/riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json`.

## Escopo, preços, receita e passivas

Preços, IDs, revendas e receitas provêm do DDragon arquivado e são checados por teste de contrato; efeitos seguem regras determinísticas com limitações registradas, **não certificação Riot 1:1**.

| Riot ID | Item | Comprar/revender (gold) | Receita Riot ID | Efeito no motor | Status |
| --- | --- | --- | --- | --- | --- |
| 3153 | Espada do Rei Destruído | 3200 / 2240 | 1053+1043+1037 | Gume da Névoa: AA causa dano físico adicional conforme HP atual; terceiro acerto aplica lentidão | Implemented / NOT_CERTIFIED |
| 3302 | Terminus | 3000 / 2100 | 3051+1043 | Terminus: on-hit mágico; alterna cargas de resistências Luz e penetração Sombra | Implemented / NOT_CERTIFIED |
| 3085 | Furacão de Runaan | 2650 / 1855 | 3086+3144 | Furacão: até 2 projéteis físicos em alvos secundários VISÍVEIS, sem alvos aliados | Implemented / NOT_CERTIFIED |
| 3032 | Flechatroz de Yun Tal | 3000 / 2100 | 1038+3144+1036 | Yun Tal: acúmulo persistente de crítico até 25%; surto temporário de AS | Implemented / NOT_CERTIFIED |
| 2523 | Hexótica C44 | 2800 / 1960 | 1037+6670+1036 | Hexótica: amplificação de ataque conforme alcance; buff de alcance após abate apenas registrado (parcial) | Partial / NOT_CERTIFIED |
| 3181 | Quebracascos | 3000 / 2100 | 2021+3066+1037 | Quebracascos: cada quinto AA gera dano adicional a campeão/estrutura; aura de tropas pendente | Partial / NOT_CERTIFIED |
| 6610 | Céu Dividido | 3100 / 2170 | 2021+3133 | Céu Dividido: primeiro AA contra campeão por intervalo amplificado + cura de HP faltante | Implemented / NOT_CERTIFIED |
| 6692 | Eclipse | 2900 / 2030 | 3133+1037+1036 | Eclipse: dois acertos distintos em até 2s geram escudo de 2s, com cooldown | Implemented / NOT_CERTIFIED |
| 3508 | Colhedor de Essência | 3050 / 2135 | 3057+3133+1018 | Colhedor de Essência: conjurar habilidade arma Spellblade; AA consome e recupera mana | Implemented / NOT_CERTIFIED |
| 3072 | Sedenta por Sangue | 3400 / 2380 | 1038+1037+1053 | Sedenta: lifesteal e escudo de cura excedente, duração limitada | Implemented / NOT_CERTIFIED |
| 3077 | Tiamat | 1200 / 840 | 1036+1036 | Tiamat: cleave de AA em inimigos próximos e ativável AoE | Implemented / NOT_CERTIFIED |
| 3074 | Hidra Raivosa | 3300 / 2310 | 3077+1053+3133 | Hidra Raivosa: cleave de AA e ativável físico em área | Implemented / NOT_CERTIFIED |
| 3748 | Hidra Titânica | 3300 / 2310 | 3077+2021+1011 | Hidra Titânica: cleave de AA e ativável físico em área; cone exato ainda pendente | Partial / NOT_CERTIFIED |
| 6698 | Hidra Profana | 2850 / 1995 | 3077+2020 | Hidra Profana: cleave de AA e ativável físico em área; modificador por HP pendente | Partial / NOT_CERTIFIED |
| 6631 | Quebrapassos | 3300 / 2310 | 3077+3044+1042 | Quebrapassos: cleave de AA, ativável em área com slow e sprint temporário | Partial / NOT_CERTIFIED |

### Arquitetura

- **Família ao contato:** `ITEM_ATTACK_RULES_V453_DEV69_B3` centraliza parâmetros; `afterBasicAttackItemsV453Dev69B3` resolve Bork, Terminus, Runaan, Yun Tal, Quebracascos e os cleaves. Procs aninhados são rotulados `item_*` e não tornam a disparar ataques básicos.
- **Família de combate:** ataques de Sundered Sky e Hexótica aplicam modificador ao golpe primário; `afterChampionHitItemsV453Dev69B3` resolve Eclipse sem proc de item. Spellblade reaproveita o motor existente de habilidade → AA.
- **Família Hidra:** `activateCleaveItemV453Dev69B3` recebe apenas team/owner/item real, valida fase e `effectResolver.canAct('item')`, aplica dano somente nos inimigos dentro de distância física e **visíveis ao time**, e grava cooldown do campeão. O servidor existente fornece `item.activate`; controles visuais de HUD não foram adicionados nesta branch.
- **Economia:** receita real recursiva, consumo de componentes uma vez, venda oficial, exclusividade de itens `cleave`, bloqueio de dois Spellblades, Undo LIFO sem lucro e revogação irrevogável após deixar fisicamente fonte. Cada estado e CD fica no campeão para snapshot/replay.
- **Catálogo:** 202 itens SR normais, **137 engine_playable / 65 reference_only** no **head empilhado**, NÃO na integração atual. Os 65 são intocados.

## FAST QA Node local

`node --check engine.mjs` **PASS** e `node tests/v453_dev69_items_batch3_attack_family.test.mjs` **19/19 PASS**, cobrindo itens, preço/sell/receitas, Tiamat→Hidra, unificação Cleave/Spellblade, on-hit, visão, CC, ativáveis e cooldown, ownership adversário, Undo físico e snapshot.

Regressões locais anteriores: `v453_dev69_items_bulk_18` **23/23**, `v453_dev69_items_batch2` **11/11**, `v453_dev69_items_batch1` **8/8**, dev61 **22/22**, dev62 **18/18**, dev64 **26/26**, dev68 **40/40**. Workspace local dev68 + patches de itens; não representa CI remoto da branch conjunta de Skills.

## Pendências e riscos honestos

- **HEXÓTICA C44:** bônus de alcance pós-abate ainda não altera todos os cálculos de alcance da engine; registrado mas parcial.
- **QUEBRACASCOS:** aura de defesa das tropas de cerco/super pendente; dano ao quinto contato usa adaptador.
- **HIDRAS:** alcance/shape de cone e efeitos condicionados a HP, detalhes de ativos e roubo de vida de splash não são 1:1.
- **RUNAN/YUN TAL/TERMINUS:** critical strike, splash secundário e efeitos de penetração são adaptações do motor de turnos, não cálculos idênticos aos servidores LoL.
- **ECLIPSE/CÉU DIVIDIDO:** tempos e valores têm aproximações e precisam de QA de várias fontes de ataque.
- **QA externo:** `npm test` integral, Chrome PvP 2 sessões, sincronização `engine.browser.js` e release bloqueadas até auditor após integração sequencial. Histórico/78 assets binários seguem o bloqueador da Issue #1.

## Ordem de revisão para o auditor

1. Revisar e mesclar PR #10 (18 itens) antes de qualquer lote sucessor.
2. Reapontar este PR de `dev69/items-batch2` para `dev69/integration` após o merge anterior, revisar diff sem reverter Skills, rodar as regressões Node e então mesclar.
3. Repetir para próximos lotes e executar `python tools/sync_browser_v43.py` **somente na integração**, além de `npm run test:v453:dev69:integration`, `npm test`, UI real, fog, Undo, Nexus natural, CRC/SHA. `main` permanece bloqueada.
4. Rollback com `git revert`, sem force push, reset hard ou engine substituída por cópia histórica.

Cadeia formal: [STACKED_ITEMS_DEV69.md](STACKED_ITEMS_DEV69.md).
