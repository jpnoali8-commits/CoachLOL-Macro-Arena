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

## M45 S09 — conflito de ordens W em dois instantes

S09 adicionou a suíte bilaterial `s09_nami_w_stale.test.mjs` (azul/vermelho × targeted/board order) e evidência de código-fonte de que a fila direcionada de Nami W pode permanecer pendente após consumir cooldown de uma ordem board. O segundo cast permanece **hipótese de source**, não PASS de gameplay. `golden_plan.json` tem **26 candidatos, 0 executados**; QA estático 15/15 PASS e sintaxe do teste Node PASS. Consulte `M45_B02_S09_HANDOFF.md` e `S09_NAMI_W_RUST_CONTRACT.json`.

## M45 S10 — Execução V8 real do oráculo legado

O conector GitHub carregou a engine original e map/masks em um executor V8 isolado. Foram tentados **24/26** testes fonte, com **22 PASS, 2 FAIL e 2 dependentes de módulos servidor/HTTP não executados**. Isto NÃO é o runner Node integral: **0/26 suites Node**, Rust native/WASM **NOT_RUN**. Nami W **ghost cast pós-cooldown confirmado em quatro cenários** (azul/vermelho, duas ordens); Ahri E (M2) e Ashe R (global M14) falharam e ficaram bloqueados. Consulte `S10_V8_EXECUTION_RECEIPT.json`, `S10_RUNTIME_FIDELITY_FINDINGS.json`, `M45_B02_S10_HANDOFF.md`.


## M45 B02 S11 e S12 — V8 realmente executado (2026-10-30)

**S11:** `s11_ahri_ashe_temporal.test.mjs` executou 66/66 assertivas em V8 com engine original e adapters de import/assert. Ahri E tem atalho legado de direcionamento que rejeita a habilidade; executor de tabuleiro produz projétil temporal. Ashe R exige impacto posterior; posição distante antiga (.65,.5) cruza parede.

**S12:** `s12_projectile_fidelity_pvp.test.mjs` executou **438/438 assertivas em 34/34 cenários e 8/8 restaurações de voo** (azul/vermelho), usando o Git blob de engine congelado. Cobertura Ahri E e Ashe R: travessia, alcance, minion/champion-first, spell shield, barreira, parede, impacto, splash e hash replay. Arquivos: `S12_AUTHORIAL_PROJECTILE_RUST_FIXTURES.json`, `S12_V8_RUNTIME_RECEIPT.json`, `M45_B02_S12_HANDOFF.md`.

O S10 continua com sua matriz congelada das 26 suítes originais: **22 V8_PASS, 2 V8_FAIL, 2 NOT_RUN**. Os 66+438 testes *suplementares* **não** mudam essa contagem. `node` integral, Rust native, WASM e HTTP/privacidade seguem **NOT_RUN**. A branch Rust observada `5afd330f260c7a0b1984521732e117dfcd81396f` ainda contém somente `core-state` e não contém `core-combat` nem `core-champions`; produção Rust de habilidade permanece bloqueada até que os contratos existam.


## M45 B02 Skills S13 — contratos tipados Rust (source-only)

- `s13_intent_arbiter_reference.rs`: modelo Rust **não autoritativo** de uma intenção primária por (match/turn/actor/slot), sessão→seat, ACK idempotente, seal, limpeza terminal e rejeição de recast sem executor autoral. **6 testes Rust escritos, 0 executados; fora do Cargo workspace**.
- `s13_projectile_acceptance.rs`: interface `AuthoredProjectileRunner` e **13 casos distintos × 2 times = 26 execuções Rust futuras** para Ahri E/Ashe R, sem implementação da trait; 2 testes Rust de integridade preparados e **0 executados**.
- `S13_RUST_ACCEPTANCE_MATRIX.json`: 13 casos de paridade fonte, exceções *deliberate fidelity fix* (Nami W stale, Ahri E shortcut), divergência Nami W 75 vs 115 cura, bloqueio de recasts e requisitos de segurança/replay.
- `s13_validate_acceptance.mjs`: **48/48 verificações V8 PASS**, apenas coerência estática de arquivos/pins/contagens. `S13_STATIC_CONTRACT_RECEIPT.json` e `M45_B02_S13_HANDOFF.md` registram as limitações.

Branch Rust central verificada em `5afd330f260c7a0b1984521732e117dfcd81396f` ainda não possui `core-combat`/`core-champions`. `rustc` e `cargo` estão ausentes no executor local; **native Rust/WASM/Node originais/HTTP NOT_RUN**. Ledger S10 inalterado: **22 V8_PASS, 2 V8_FAIL, 2 NOT_RUN**; não promover nenhuma skill a MIGRATED.


## M45 B02 Skills S14 — Sylas/Viego: 4 original legacy suites executed

- `S14_SYLAS_VIEGO_ORIGINAL_V8_RECEIPT.json`: **4/4 original source test bodies V8_PASS; 154/154 scenarios, 1.894/1.894 assertivas, 154 snapshots roundtripped**. Original four Git SHA pins and each suite's actual output recorded. **78** of those cases belong to S10's already-passing B14D suite; **76** are from three original suites outside the 26-suite S10 selection. No double-counting.
- `s14_sylas_viego_rust_acceptance.rs`: Rust-only **typed interface (not implementation)** covering 15 Sylas original-R donors and 12 Viego P/QWE donors, both sides → 54 **future** native runs; 10 explicit negative acceptance requirements and 4 Rust unit tests **prepared but NOT_RUN**. No fallback generic.
- `s14_validate_sylas_viego.mjs` ran **79/79 static checks in V8 PASS** against saved exact GitHub files, including S10 prior overlap. `S14_STATIC_CONTRACT_RECEIPT.json` and `M45_B02_S14_HANDOFF.md` contain precise evidence and blockers.

Latest Rust coordinator HEAD observed `ddbdf8e9ee4345646c70162c1637e5b08670708a`, still only `core-state`. No Rust compiler locally, `core-combat`/`core-champions` absent; Rust native/WASM/real HTTP, complete champion kits all NOT_RUN/NOT_CERTIFIED. Original full Node 0/26; S10 remains 22 PASS, 2 FAIL, 2 NOT_RUN.


## M45 B02 Skills S15 — Neeko/Shaco/Sylas clone identity and targetability

- Original `tests/v453_dev69_clones_m15.test.mjs`: **20 checks V8 PASS then check 21 V8 FAIL** (Sylas steals Shaco R; owner=**Sylas** but spawned/public clone=**Shaco**, expected Sylas). Original remainder 22–24 and HTTP manifest test 25 NOT_RUN. Full original Node ESM NOT_RUN.
- Original independent `tests/audit/v453_clone_targetability_audit.test.mjs --strict`: **24/24 PASS**, zero remaining P1 clone-targetability failures in source `f0b1147a`. Both original gateway dev44/dev47 and actual engine were used, with import/assert/structuredClone shims and synthetic visibility.
- `s15_clone_identity_security.test.mjs`: **88/88 real V8 assert checks, 8 bilateral cases PASS**. Pass **characterizes a known bug twice**, not successful Rust parity. Original source Sylas R temporary `u.champ=Shaco` and `m15Summon` copies that donor instead of real Sylas into `appearance`. Both colored seats prove mismatch and snapshot persistence.
- `s15_clone_disguise_rust_acceptance.rs`: typed **non-production** contract, 6 scenarios × 2 seats = 12 future real Rust positives, 8 negatives and 3 Rust unit tests **prepared / 0 executed**. Requires real server and `core-combat/core-champions` crates.
- `S15_CLONE_IDENTITY_V8_RECEIPT.json`, `S15_STATIC_CONTRACT_RECEIPT.json` and `M45_B02_S15_HANDOFF.md` pin original Git blobs, source failure and versioned Rust *deliberate fidelity fix*. `s15_validate_clone_receipt.mjs` V8 static cross-check **53/53 PASS**.

The S10 original 26-suite status remains 22 V8_PASS, 2 V8_FAIL, 2 NOT_RUN; original M15 entry remains NOT_RUN in the **frozen S10 ledger**, and S15 evidence is reported separately. Coordinator `dev69/rust-core-m45` at `4bf98495e32dffb67cde32542f76af11d85a66f8` still has only `core-state`; Rust native/WASM and two-seat HTTP NOT_RUN. No Actions, merges, original engine modifications or champion certifications.


## M45 B02 Skills S16 — aliases simultâneos e colisão temporal com fog

- `s16_multi_alias_temporal_clone_pvp.test.mjs`: execução real de corpo suplementar usando engine e gateway original no V8: **18/18 cenários, 295/295 assertivas, 38 checkpoints snapshot→restore PASS** (2 equipes, 2 grupos de aliases simultâneos, 8 impactos em clones visíveis, 8 impactos após perda de visão).
- Neeko disfarçada de Shaco + Shaco real + clone Shaco geraram **3 aliases públicos distintos** por partida, permitindo alvos públicos autorizados sem aceitar IDs persistentes internos, replay de pacote duplicado ou alias expirado/oculto.
- **Risco de fidelidade S16:** clones ocultos pela perda de `canSeePoint` saem do pool de colisão física; Ahri E/Ashe R acertam clone quando visível, mas não quando ele está oculto. No caso da Ashe, o projétil alcança o campeão verdadeiro atrás. Ainda **POTENTIAL_FIDELITY_RISK**, depende de decisão da regra física e de testes reais de fog/servidor.
- `S16_ALIAS_TEMPORAL_V8_RECEIPT.json` registra o corpus original, valores, efeitos e limitação da visibilidade sintética. `s16_visibility_collision_rust_acceptance.rs` contém interface Rust **não executada**, com 18 casos positivos e 8 negativos futuros, 3 testes Rust preparados e gate explícito de incerteza.
- `s16_validate_alias_temporal.mjs`: **63/63 verificações estáticas V8 PASS**, documentadas em `S16_STATIC_CONTRACT_RECEIPT.json`; `M45_B02_S16_HANDOFF.md` para o coordenador.

S10 continua **22 V8_PASS, 2 V8_FAIL, 2 NOT_RUN**, Node completo 0/26. Branch Rust em `94e22180623ca20477165221e9e9251ff508c1e8` ainda somente `core-state`; combat/champions, Rust native, WASM e servidor HTTP sem execução. Nenhuma Action ou merge; nenhuma alteração na engine de produção.


## M45 B02 Skills S17 — eventos históricos e reconexão

- `s17_event_reprojection_and_reconnect_pvp.test.mjs`: teste suplementar **efetivamente executado** contra a Arena e gateways originais em V8: **149/149 assertivas PASS**, **4 vazamentos de eventos antigos** e **2 trocas retroativas do alias de Neeko**, todos nos dois times. PASS confirma que o defeito existe no legado, não que deve ser copiado.
- **Falha P1 `S17_RETROACTIVE_HISTORICAL_EVENT_ID_AND_TEXT_DISCLOSURE`**: `Arena.perspective().events` (`engine.mjs:3261–3276`) usa o disfarce/clone **atual** para projetar evento antigo. Após expiração de Shaco R ou cancelamento de Neeko, a perspectiva do adversário revela `blue_MID/red_MID` e `blue_TOP/red_TOP` e textos privados antigos mesmo sem visão atual; novo disfarce atribui novo alias a evento antigo.
- **2/2 continuações reais pós-checkpoint PASS**: `Arena.fromSnapshotV40` e `gateway.restore(exportSession())` executaram mesma evolução, preservando `checksumV40`, visão do adversário, ACK de retry, recibos e revisões; a falha ainda ocorre identicamente. Visão **sintética**, não fog/HTTP real.
- `S17_EVENT_HISTORY_V8_RECEIPT.json` e `M45_B02_S17_HANDOFF.md`: evidência, causa, correção intencional e handoff. `s17_validate_event_history.mjs` foi executado em V8 com **71/71 verificações estáticas PASS**, `S17_STATIC_CONTRACT_RECEIPT.json`.
- `s17_sealed_event_history_rust_acceptance.rs`: modelo **isolado não-produtivo** de histórico público selado por seat no instante do evento + interface exigindo Neeko e Shaco no Rust real; 4 testes Rust escritos, **0 executados**. Não publicar IDs persistentes ou texto privado por reinterpretação de estado atual.

Matriz S10 original intacta (**22 V8_PASS / 2 V8_FAIL / 2 NOT_RUN; Node original 0/26**). Rust `dev69/rust-core-m45` ainda apenas `core-state` no HEAD observado `b7a44676dd64b6b2f89ba2e3fca680e531136d76`. Rust native/WASM/servidor HTTP NOT_RUN; G8 NOT_CERTIFIED. Nenhum GitHub Actions, merge ou edição nas branches originais.


## M45 B02 Skills S18 — metadata da sala PvP revela ID estável do inimigo mascarado

- `s18_pvp_room_pending_identity_pvp.test.mjs`: teste suplementar **executado contra Arena, gateway e PvPRoomV453Dev47 originais** em V8 com shims de bootstrap. **121/121 assertivas PASS, 4 cenários bilaterais** (Neeko disfarçada, Shaco com clone, defensor azul/vermelho). PASS caracteriza falha, **não** migração correta.
- **P1 `S18_PUBLIC_ROOM_PENDING_DECISION_STABLE_ENEMY_ID`:** `PvPRoom.publicInfo(p).pendingDecision.enemyId` entrega `red_TOP/red_MID/blue_TOP/blue_MID` mesmo quando a projeção adversária mostra apenas `appearance_1` ou `appearance_3`. Persistência confirmada após perda sintética de visão e **4/4 restaurações de sala/gateway**.
- ACL de **quem** recebe a janela de reação funcionou, mas o **conteúdo** entregue à pessoa autorizada tem dados privados do oponente. `Arena.pauseForDecision()` real foi usado para construir decisão válida; **nenhum ataque real, HTTP ou SSE foi executado**.
- Em `projection`, ledgers de objetivo inimigo com fixtures artificiais foram filtrados; `actionJournalV40` e `lastTacticalAlerts` não foram serializados; `Arena.units.length=10` embora `projection.units` possa mostrar 11 figuras por conta de clone.
- `s18_room_reaction_identity_rust_acceptance.rs`: função Rust **de referência** para sanitizar a reação por alias público de servidor, interface de **4 cenários reais futuros**, 8 negativos e 5 testes Rust preparados, **0 executados**. Requer core protocolo/combate/campeões e validação de segurança em sessão real.
- `S18_PVP_ROOM_IDENTITY_V8_RECEIPT.json`, `S18_STATIC_CONTRACT_RECEIPT.json`, `M45_B02_S18_HANDOFF.md` guardam as evidências. `s18_validate_pvp_room_identity.mjs` V8 **76/76 verificações estáticas PASS**.

S10 original permanece **22 V8_PASS / 2 V8_FAIL / 2 NOT_RUN**, full Node 0/26. Rust native/WASM/real HTTP/SSE NOT_RUN; G8 NOT_CERTIFIED. Sem Actions/merge/edição da engine original.
