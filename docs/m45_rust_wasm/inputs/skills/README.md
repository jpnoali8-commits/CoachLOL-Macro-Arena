# M45 Chat 2 — Auditoria estática de skills (B02-S01)

## Proveniência

- Fonte somente leitura: `dev69/skills-batch2`, HEAD `f0b1147ac46e585a1d5374a178b1ea462f5dc278`.
- Engine: `engine.mjs`, Git blob `41679f7328a42e379fdfb8de5b92006e1bfb529f`, comprimento recebido 1116423 caracteres.
- Branch desta auditoria: `dev69/m45-audit-skills`; PR #9 intacto.
- Todos os dados em `inventory_slots.json` foram extraídos da string de fonte retornada pelo GitHub e conferidos contra os 173 IDs de roster, sem compilar nem executar a engine.

## Levantamento

- 865 P/Q/W/E/R de 173 campeões.
- Classes estáticas por slot: absent=274; reference-only=21; implemented=230; partial=340.
- 55 slots com múltiplas definições (a precedência exata precisa de revisão); 0 entradas não reconciliadas; 63 símbolos de mecânicas/executores encontrados por busca nominal.
- 244 arquivos `.test.mjs` localizados via Git tree. `candidate_test_files` é apenas associação por nome, **não** prova de execução ou cobertura.
- `implemented` significa marcador autoral referenciado pelo motor na inspeção estática, **não** paridade LoL nem QA aprovado. `partial` significa regra/descriptor e possíveis lacunas; `reference-only` é apenas metadata de V42; `absent` significa nenhum registro nos mapas consultados. Algumas habilidades podem existir apenas em handlers não registrados: revisar `mechanic_symbols.json` e classificar manualmente.
- Os termos `missing:` e `m20Missing:` rebaixam a classe da definição; fichas base dos 173 campeões não certificam skills.

## Gatilhos de migração

A função `m44B14DOriginalBoardRuleV453` intercala registros autorais, mecânicas M16, formas M14 e base genérica. A função `abilityRule` possui **fallback de treino**. A migração NÃO pode promover fallback a executor Rust autoral. Precisam de fixture específica: Sylas R delegando ao executor original, Viego aparência/P/QWE sem R emprestada, Neeko disfarce + clone, Shaco clone/armadilha/stealth, Mordekaiser realm, Azir summons/terrain, projéteis, recasts, CC e visibilidade.

## QA / gates

- G0: PARTIAL (inventário estático inicial; sem validação dinâmica de todos os executores ou comparação entre branches).
- G6: NOT_RUN (golden JS em runtime não executado neste ambiente; nenhuma equivalência Rust disponível).
- Rust native / WASM: NOT_RUN, fora da prioridade elegível sem contratos `core-combat` e `core-champions`.
- Valores de `source_test_ids`, `golden_fixture_ids` e testes de rede vazios são intencionais até existirem resultados reproduzidos. Não inventar hashes de snapshot.
- Próxima prioridade: golden fixtures azul/vermelho de casos autorais, execução por Node 22+ sobre checkout da própria branch; correlacionar métodos não registrados e garantir fonte SHA.

## Instruções de handoff ao Chat 1

Revisar `inventory_slots.json`, `mechanic_symbols.json` e conflitos. Não alterar STATUS_LEDGER.md nem manifest.json central nesta branch. Nenhum merge foi feito. B33B não commitado não foi contado.
