# M45 Chat 2 — Auditoria independente de skills (B02-S01–S03)

## Origem imutável

- Fonte: `dev69/skills-batch2`, commit `f0b1147ac46e585a1d5374a178b1ea462f5dc278`.
- Engine: `engine.mjs`, Git blob SHA `41679f7328a42e379fdfb8de5b92006e1bfb529f`.
- PR #9 permanece Draft, sem merge; nenhum código de gameplay nem `engine.browser.js` alterado.

## Inventário estático

- 173 campeões × 5 slots = **865** IDs exclusivos, status inicial: **{"absent":268,"reference-only":20,"implemented":234,"partial":343}**.
- 56 registros multivariantes históricos, dos quais 29 eram artefatos do scanner e restaram 27 slots legitimamente multivariantes; 7 exceções por executores fora do registro (Mordekaiser R, Sylas R, Viego P, Neeko P, K'Sante R, Ezreal R e Jinx R).
- 63 símbolos mecânicos candidatos; 280 slots possuem etiquetas de dependência estática; 16 slots têm ponteiro para um dos onze planos golden.
- 244 testes `.test.mjs` localizados na árvore; os nomes em `candidate_test_files` são pistas e **não** teste executado nem prova de cobertura.

**Limitações de classificação:** `implemented` indica presença de código/marcador de executor específico, não equivalência Riot, completude de kit ou certificação. `partial` representa descrição adaptada, marcador sem prova completa ou `missing` explícito; `reference-only` não habilita gameplay autoral; `absent` significa que os registros enumerados não contêm a habilidade. Há `abilityRule` com fallback de treino, e há executores especiais fora dos registries. Por isso `absent` NÃO prova ausência absoluta de comportamento no JavaScript. A fase seguinte precisa auditar caminhos de código e resolver os 55 conflitos por precedência efetiva.

## Artefatos

- `inventory_slots.json`: cada um dos 865 slots, todas as variantes descobertas, símbolo, commit/blob SHA, status, dependências, testes candidatos, pendências, resultado esperado como não capturado e estado Rust `SOURCE_ONLY`.
- `mechanic_symbols.json`: 63 símbolos de métodos/executores, com linha de origem e SHA.
- `executor_only_reconciliation.json`: sete slots antes ocultos nos handlers especiais.
- `golden_plan.json`: onze suítes de teste legadas, caminho e blob Git, seed, ambos os assentos e marcador esperado; **SPEC_ONLY_NOT_RUN**.
- `run_golden.mjs`: executor reproduzível com verificação de blob e logs/hash local.
- `STATIC_QA_RECEIPT.json`: auditoria estática real dos registros, fontes, isolamento de arquivos e 10/10 testes fonte.
- `HANDOFF_CHAT1_M45_B02_SKILLS.md`: resumo e contrato de dependências para o coordenador.

## Comandos em checkout Node 22+

~~~bash
node docs/m45_rust_wasm/inputs/skills/run_golden.mjs --verify-only
node docs/m45_rust_wasm/inputs/skills/run_golden.mjs
~~~

O primeiro comando verifica somente proveniência local, o segundo **executa** as onze suítes JavaScript bilaterais, falha se qualquer uma falhar e gera `golden_results.local.json`. Esse arquivo deve ser analisado e versionado como evidência apenas após execução genuína; não deve ser forjado.

## QA executado / NÃO executado

- Auditoria estática V8 com acesso ao GitHub: **PASS**. 865 IDs únicos, 7 exceções, SHA de engine imutável, dez fontes de testes (S03) SHA/mirrored conferidas, apenas arquivos deste diretório modificados.
- QA gameplay Node 22: **NOT_RUN**. O checkout local deste ambiente não consegue acessar o repositório privado para executar a engine.
- Rust native / WASM / rede real / browser: **NOT_RUN**.
- G0: **PARTIAL**; G6 **NOT_RUN**; G8 **NOT_CERTIFIED**. No B33B não commitado não há conteúdo disponível no HEAD.

## Próxima prioridade técnica

Executar golden baseline em um checkout autenticado, salvar seeds+before/after+events+snapshots+filtro de visão por assento, classificar executores não registrados, cruzar 55 sobreposições com precedência real e só então integrar contratos `core-combat/core-champions` publicados pelo Chat 1. Não migrar executores Rust enquanto esses contratos não existirem.

## Atualização S04 — auditoria de precedência

A revisão do executor discriminou 56 overlaps aparentes (29 duplicações da leitura estática de passivas, 16 variações de forma/transformação, 10 overlaps com dados V42 e 1 com contrato V382). As 29 duplicações eram do relatório de inventário, **não do código legado**: removidas apenas as repetições do JSON. Permanecem 27 entradas multivariantes distintas e 865 feature IDs. Comparar `precedence_overlaps.json` e `M45_B02_S04_RECEIPT.md`.

Foi incluída a suíte `precedence_blue_red.test.mjs` (seed 450204), pinada como 11º item em `golden_plan.json`, e um QA de fonte reproduzível `verify_precedence_source.mjs`. O teste novo cobre seleção de forma Nidalee/Elise/Shyvana/Gnar, route V42 vs V382 e snapshot por assento; **não foi executado ainda**. A verificação independente estática contra blobs GitHub passou 13 invariantes; não equivale a PASS de Node, de combate PvP nem de Rust.

~~~bash
node docs/m45_rust_wasm/inputs/skills/verify_precedence_source.mjs
node docs/m45_rust_wasm/inputs/skills/run_golden.mjs --verify-only
node docs/m45_rust_wasm/inputs/skills/run_golden.mjs
~~~

O DNS de `github.com` falhou neste ambiente local, impossibilitando checkout do repositório privado; `NOT_RUN` permanece honesto. O Chat 1 mantém exclusivamente o ledger central, contratos e PR #19.

## M45 S05 — Descoberta de executores e recuperação do catálogo V42

**Origem:** `dev69/skills-batch2` commit `f0b1147ac46e585a1d5374a178b1ea462f5dc278`, engine Git blob `41679f7328a42e379fdfb8de5b92006e1bfb529f`.

O scanner inicial de `CHAMPION_KITS_V42` deixou de registrar os cinco descritores de Ezreal, primeiro campeão no bloco. O S05 recuperou os **35 descritores P/Q/W/E/R de 7 campeões** e 25 rotas de implementação/hook sem inventar habilidades. Das reclassificações, 22 evoluíram para **partial** a partir de evidências de runtime; paridade, rota e efeito permanecem não certificados. `inventory_slots.json` v4: **234 implemented, 365 partial, 1 reference-only, 265 absent**, em 865 IDs.

O campo `duplicate_slots=50` agora contém variantes de registro **e** evidências de handler alternativas; a S04 isolou originalmente 27 slots com múltiplos descritores. Isso não representa 50 conflitos de gameplay.

`golden_plan.json` passa a incluir **19 suítes**, com 8 adições dos testes existentes M1–M7 e batch2. As oito fontes novas foram verificadas por blob SHA, saída esperada e assentos azul/vermelho. **Nenhuma das 19 foi executada neste turno**; Node não consegue clonar o repositório devido à resolução de DNS, embora o conector Github confirme que ele é público.

Artefatos: `S05_V42_HANDLER_RECONCILIATION.json`, `S05_STATIC_QA_RECEIPT.json`, `M45_B02_S05_HANDOFF.md`.

Comandos para execução no checkout real:

~~~bash
node docs/m45_rust_wasm/inputs/skills/verify_precedence_source.mjs
node docs/m45_rust_wasm/inputs/skills/run_golden.mjs --verify-only
node docs/m45_rust_wasm/inputs/skills/run_golden.mjs
~~~

**Verificador S05 corrigido:** `verify_precedence_source.mjs` agora espera 27 entradas multivariantes de registro do S04, 50 linhas multi-evidência atuais, 35 descritores V42, 25 handlers e 19 fontes golden. O arquivo foi atualizado na branch; sua execução Node completa ainda está `NOT_RUN` neste ambiente sem checkout local.

## M45 S08 — conflito Nami W e especificação Rust

- Duas rotas legadas para Nami W: `M44_B13A` tabuleiro (bounces 725) e V42 targeted (depende de `abilityRule(u,'W').bounceRange` indefinido na regra M44). Há também risco de duas intenções simultâneas no mesmo slot e de pending stale após gate de cooldown: hipótese estática aguardando Node real.
- Teste bilateral novo `s08_nami_w_routes.test.mjs` (6 casos, histórico de mana/HP, hashes/eventos e ownership); sintaxe Node 22 PASS e blob exato conferido; **gameplay NOT_RUN**.
- `S08_NAMI_W_RUST_CONTRACT.json` descreve a reconciliação e política intencional Rust, não implementação. `golden_plan.json` agora tem **25 suítes NOT_RUN**. Nenhuma skill Rust portada/certificada.
- Consulte `M45_B02_S08_HANDOFF.md` antes de migrar o slot W. O script real exige checkout fixado; o ambiente atual segue sem resolver DNS do GitHub.
