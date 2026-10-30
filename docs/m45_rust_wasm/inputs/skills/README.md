# M45 Chat 2 — Auditoria independente de skills (B02-S01–S03)

## Origem imutável

- Fonte: `dev69/skills-batch2`, commit `f0b1147ac46e585a1d5374a178b1ea462f5dc278`.
- Engine: `engine.mjs`, Git blob SHA `41679f7328a42e379fdfb8de5b92006e1bfb529f`.
- PR #9 permanece Draft, sem merge; nenhum código de gameplay nem `engine.browser.js` alterado.

## Inventário estático

- 173 campeões × 5 slots = **865** IDs exclusivos, status inicial: **{"absent":268,"reference-only":20,"implemented":234,"partial":343}**.
- 55 slots com múltiplos registros; 7 exceções por executores fora do registro (Mordekaiser R, Sylas R, Viego P, Neeko P, K'Sante R, Ezreal R e Jinx R).
- 63 símbolos mecânicos candidatos; 280 slots possuem etiquetas de dependência estática; 16 slots têm ponteiro para um dos dez planos golden.
- 244 testes `.test.mjs` localizados na árvore; os nomes em `candidate_test_files` são pistas e **não** teste executado nem prova de cobertura.

**Limitações de classificação:** `implemented` indica presença de código/marcador de executor específico, não equivalência Riot, completude de kit ou certificação. `partial` representa descrição adaptada, marcador sem prova completa ou `missing` explícito; `reference-only` não habilita gameplay autoral; `absent` significa que os registros enumerados não contêm a habilidade. Há `abilityRule` com fallback de treino, e há executores especiais fora dos registries. Por isso `absent` NÃO prova ausência absoluta de comportamento no JavaScript. A fase seguinte precisa auditar caminhos de código e resolver os 55 conflitos por precedência efetiva.

## Artefatos

- `inventory_slots.json`: cada um dos 865 slots, todas as variantes descobertas, símbolo, commit/blob SHA, status, dependências, testes candidatos, pendências, resultado esperado como não capturado e estado Rust `SOURCE_ONLY`.
- `mechanic_symbols.json`: 63 símbolos de métodos/executores, com linha de origem e SHA.
- `executor_only_reconciliation.json`: sete slots antes ocultos nos handlers especiais.
- `golden_plan.json`: dez suítes de teste legadas, caminho e blob Git, seed, ambos os assentos e marcador esperado; **SPEC_ONLY_NOT_RUN**.
- `run_golden.mjs`: executor reproduzível com verificação de blob e logs/hash local.
- `STATIC_QA_RECEIPT.json`: auditoria estática real dos registros, fontes, isolamento de arquivos e 10/10 testes fonte.
- `HANDOFF_CHAT1_M45_B02_SKILLS.md`: resumo e contrato de dependências para o coordenador.

## Comandos em checkout Node 22+

~~~bash
node docs/m45_rust_wasm/inputs/skills/run_golden.mjs --verify-only
node docs/m45_rust_wasm/inputs/skills/run_golden.mjs
~~~

O primeiro comando verifica somente proveniência local, o segundo **executa** as dez suítes JavaScript bilaterais, falha se qualquer uma falhar e gera `golden_results.local.json`. Esse arquivo deve ser analisado e versionado como evidência apenas após execução genuína; não deve ser forjado.

## QA executado / NÃO executado

- Auditoria estática V8 com acesso ao GitHub: **PASS**. 865 IDs únicos, 7 exceções, SHA de engine imutável, dez fontes de testes SHA/mirrored conferidas, apenas arquivos deste diretório modificados.
- QA gameplay Node 22: **NOT_RUN**. O checkout local deste ambiente não consegue acessar o repositório privado para executar a engine.
- Rust native / WASM / rede real / browser: **NOT_RUN**.
- G0: **PARTIAL**; G6 **NOT_RUN**; G8 **NOT_CERTIFIED**. No B33B não commitado não há conteúdo disponível no HEAD.

## Próxima prioridade técnica

Executar golden baseline em um checkout autenticado, salvar seeds+before/after+events+snapshots+filtro de visão por assento, classificar executores não registrados, cruzar 55 sobreposições com precedência real e só então integrar contratos `core-combat/core-champions` publicados pelo Chat 1. Não migrar executores Rust enquanto esses contratos não existirem.
