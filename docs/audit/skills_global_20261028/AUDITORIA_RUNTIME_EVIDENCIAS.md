# Resultados empiricos da auditoria global — regra, enfileiramento e entidades

## Referencia / limite
- **Codigo de jogo congelado:** `b7676d57160ddbc2315e258d03f3c94dd5a81189`.
- **Branch somente de QA:** `audit/skills-global-20261028-b7676d`; nenhuma alteracao em `engine.mjs`, `dev69/skills-batch2`, `dev69/integration`, `main`, navegador ou Itens.
- **Execucao remota [40799518739](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40799518739)**: Node 22, suite de inventario + 24 cenarios de clones + M9/M15/M16.
- **Resultado de execucao de QA:** workflow PASS quer dizer apenas que os *probes* foram executados. Os **10 casos P1 de clone permanecem com falha de comportamento** e foram registrados explicitamente. `--strict` para reparo.
- O documento e os CSVs **NAO certificam kits**; um slot `board_effect` pode ser apenas prototipo e `training` e contrato generico sem fidelidade.

## Descobertas quantificadas pelo executor, nao somente por JSON
O programa consultou o proprio `abilityRule()` para **173 campeoes × QWER × 2 seats = 1.384 chamadas**. Todas retornaram uma regra sem excecao de runtime; o tipo `training` foi detectado em **1.018 chamadas**, equivalentes a **509 de 692 slots distintos QWER** (**73,55%**).

| Classes de cobertura por campeao | Campeoes | Slots QWER training por campeao |
| --- | ---: | ---: |
| Sem nenhum slot QWER personalizado na cadeia canonica | **114** | 4 |
| Com um slot nao-training | **16** | 3 |
| Com dois slots nao-training | **2** | 2 |
| Com tres slots nao-training | **1** | 1 |
| Com quatro slots nao-training | **40** | 0 |
| **Total** | **173** | **509 slots `training`** |

**59 campeoes possuem ao menos um slot QWER nao-training; 40 possuem quatro slots nao-training.** Isso **nao** prova que os 40 possuam P+QWER completos, nem que esses 183 slots nao-training sejam certificados. Os 114 com quatro slots training sao lacuna funcional frente ao objetivo de elenco completo, mas `training` nao equivale automaticamente a `BROKEN` em runtime.

Matriz por campeao, com tipo, shape e marcador de implementação tal qual retornados pela engine: [AUDITORIA_QWER_ROUTING_RUNTIME.csv](AUDITORIA_QWER_ROUTING_RUNTIME.csv). Reproducao: [v453_global_contract_execution_audit.test.mjs](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/blob/audit/skills-global-20261028-b7676d/tests/audit/v453_global_contract_execution_audit.test.mjs).

## Cadeia de execucao dos contratos authored (probes estrategicos)
A suite faz fixture independente, ambas equipes, rank maximo, recurso suficiente e alvos legitimamente visiveis; chama o enfileiramento autoritativo e depois o executor para medir efeitos minimos e cobranca de custo.

| Familia | Contratos × 2 equipes | Casts aceitos | Recusados | Excecoes inesperadas |
| --- | ---: | ---: | ---: | ---: |
| M9 — 30 descritores/120 slots | 240 | 236 | 4 `passiveOnly` | 0 |
| M16 — 19 campeoes/22 slots | 44 | 44 | 0 | 0 |
| M14 — 3 campeoes, 2 formas/24 variantes | 48 | 46 | 2 `passiveOnly` | 0 |
| M15 — Neeko W e Shaco R | 4 | 4 | 0 | 0 |
| **Total** | **336** | **330** | **6 intencionais** | **0** |

O prototipo detectou cobranca de custo/cooldown em **236/236 casts aceitos M9, 42/44 M16, 46/46 M14, 4/4 M15**. Os dois casts M16 restantes sao da categoria de estoque de cargas e precisam ser avaliados pela primitiva de charges (nao inferir 'gratis' de uma leitura de mana/cooldown). `applied` foi observado em parte das cenas, mas pode nao aparecer quando efeito depende de alvo, janela, buff ou condicao.

**Isso e QA de despacho, nao QA de fidelidade.** Um cast aceito que paga recurso ainda pode falhar ao executar um summon, stun, trap, projétil ou passiva. As lacunas de P+QWER, follow-up, efeitos/targetability e interacoes permanecem.

## P1: reproduzido em runtime — clones vs skills
O teste de identidade/selecionabilidade concluiu **24 cenarios = 14 PASS + 10 P1_REPRODUCED** nos dois seats, em [run 40799020225](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40799020225), repetidos em [run 40799518739](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40799518739).

- Teemo Q e Annie Q falham ao selecionar clone de Shaco com alias valido; Teemo Q falha com clones Neeko/Wukong.
- Annie W em cone nao causa dano no clone que esta dentro da trajetoria, pois o `enemyPool` da familia M9 nao inclui invocacoes.
- AA contra os clones visiveis funciona. IDs reais/expirados, fog, controle de seat e replay de snapshot nao regrediram nos cenarios testados.
- Issue de correcao do motor universal: **[#18](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/issues/18)**. Recomendacao: resolver `targetable entity` de forma compartilhada por AA, targeted, cone, circle, line, efeitos e conjuracao, sem adicionar um decimo primeiro campeao.

## Ordem de correcao (sem copiar skill por skill)
1. **P1 — targetable entity** (Issue #18), unificar contratos de ataque/skill/AoE/trap/clone e validar 10 cenarios estritos + negativos.
2. **P1 — 509 slots training em PvP**: mapa de `kind` e efeitos por familia; em lotes grandes de 25–40 campeoes (quando a primitiva permitir), implementar P+QWER reais com recasts/estados/relacoes estrategicas. Nao habilitar falso dano generico como habilidade completa.
3. **P1 — vertical de certificados:** por campeao exigir todos ranks, alcance, mana/CD/charges, alvos e fog, colisao/CC/reacao, itens/runas, Azul/Vermelho, morte/respawn, checkpoint/replay/reconexao, navegador e release no integrador.
4. **Gates do auditor:** matriz de interacoes por primitiva e excecoes, nao produto cartesiano indiscriminado; evitar benchmarks que medem somente registro/cast/return code.

## Resultados e estados
- [Workflow isolado](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/blob/audit/skills-global-20261028-b7676d/.github/workflows/skills-global-audit.yml).
- **M15:** 25/25 regressao. **M16:** 73/73 regressao. **M9:** 28/28 regressao, todos neste CI.
- `CERTIFIED` de champion: **0 comprovados nesta auditoria**. `BROKEN` global nao deve ser atribuido indiscriminadamente a todas as skills de clones; a falha confirmada e a **familia de selecao de entidades por skills Q/AoE**.
- Nao rodados: Chromium de duas sessoes, `npm test` global e comparacao da engine pos-merge; continuam bloqueados para certificacao.
