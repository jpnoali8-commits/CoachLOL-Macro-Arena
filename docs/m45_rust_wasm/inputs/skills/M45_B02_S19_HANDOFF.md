# CoachLOL Macro Arena — M45 B02 Skills S19: reação real, handler HTTP e SSE de origem

**Data:** 2026-10-30. **Auditoria:** `dev69/m45-audit-skills`; **fonte somente leitura:** `dev69/skills-batch2@f0b1147ac46e585a1d5374a178b1ea462f5dc278`. Este S19 NÃO introduz JavaScript de produção e NÃO modifica a engine original. É um contrato de segurança de protocolo e QA para migração integral Rust/WASM.

## O que efetivamente foi executado

A fonte original foi recuperada do GitHub por blobs pinados: `engine.mjs` (`41679f7328a42e379fdfb8de5b92006e1bfb529f`), `authoritative_actions` dev44/dev47, `room_v453_dev47.mjs` e **`server_v453_dev47.mjs`** (`61f9d941852b6378bccccf8956aa699e8761836d`).

O teste `s19_real_impact_server_route_sse_v8.mjs` realmente invocou a engine original no V8 e os **manipuladores originais do servidor**. **161/161 assertivas PASS em 4/4 cenários**: Neeko disfarçada e Shaco com clone, defensor azul e vermelho.

Cada cenário fez o seguinte:

1. A Neeko original escolheu disfarce e Shaco original usou R criando clone; **10 campeões reais**, cópia somente na perspectiva pública.
2. Um agressor Neeko ou Shaco criou um duelo pelo método original `duelPermission` e atingiu realmente Ahri pela rotina `Arena.damage` — **54 HP perdidos** em todos os cenários, depois de defesas. A rotina original `processAmbushResponses` criou `pendingDecision` com o agressor correto. A fase externa foi posicionada em `decision` pelo teste: não alegamos turno inteiro autopausado.
3. A classe original `PvPRoomV453Dev47` e as funções originais do `server_v453_dev47.mjs` processaram chamadas simuladas: **20 GET /api/session, 12 GET /api/stream e 12 POST /api/action** no total. O *handler* HTTP é original; **http.createServer**, sockets, respostas, cookies e token→sessão vieram de stubs em memória, sem TCP ou hash criptográfico real. O resultado **não** é end-to-end HTTP nativo.
4. GET `/api/session` devolveu `appearance_1` (Neeko) ou `appearance_3` (Shaco) no `projection.units`, mas também `pendingDecision.enemyId` em `red_TOP/red_MID` ou `blue_TOP/blue_MID` em metadata. Esse é o **vazamento P1 do S18**, agora provado pela rota original após hit real.
5. O `GET /api/stream` executou a lógica original de `room.subscribe` e enviou o mesmo ID estável na carga JSON de **SSE**. O outro seat não viu a decisão e uma sessão anônima retornou 401.
6. O hit revela temporariamente o agressor à vítima até `t=4`; por isso o teste só retira a visão e compara fog após `t=5`. **A metadata e a SSE continuam vazando** o ID estável, embora a unidade disfarçada não esteja mais visível.
7. Um checkpoint real de `Arena`/`PvPRoom` foi restaurado num novo objeto e as mesmas rotas originais ainda expuseram o ID estável em `/api/session` e no stream. O snapshot bateu exatamente em `checksumV40`.
8. A rota real `POST /api/action` com `decision.reaction.targetId=red_TOP/blue_TOP` foi **negada pelo gateway original com 409 `alvo_identidade_oculta`**; a mesma ação com alias `appearance_*` autorizado recebeu 200, resolveu a reação e limpou a decisão. O retry com a mesma sequência retornou o mesmo recibo sem duplicar a ação.

**Conclusão:** é **vazamento de informação na projeção pública da sala/servidor**, não um bypass confirmado do controle de alvo. A autorização do gateway atual contém uma proteção compensatória, mas não justifica retornar o ID privado ao cliente.

## Segurança e correção Rust exigida

A lógica de `PvPRoomV453Dev47.publicInfo` original devolve `pendingDecision.enemyId` interno mesmo quando `Arena.perspective` mascara esse mesmo inimigo. Como `/api/session` serializa `room.view` e `/api/stream` transmite `room.subscribe`, ambos herdam o mesmo defeito.

**Requisito M45-G3:** todos os canais externos **HTTP, SSE e mensagens de erro** devem compartilhar **uma única projeção pública por seat**, baseada em identidade e visibilidade autorizadas. Reação recebida pelo defensor deve ter `attackerAlias` público quando atualmente observável, ou referência opaca/sem identidade quando oculto. Nenhum ID interno estável de unidade adversária deve ser retornado por outro campo. O servidor mantém `enemyId` apenas no núcleo privado para resolver os comandos reais. O gateway continua aceitando somente aliases válidos e rejeitando IDs estáveis forjados.

O artefato `s19_http_sse_reaction_privacy_gate.rs` contém **código Rust isolado de sanitização/projeção**, interface `ActualRustHttpSseRunner` e gate para **4 casos reais de HTTP/SSE Rust e 10 negativos adversariais**. **5 testes de unidade Rust escritos, 0 compilados/executados**. Não está no workspace Rust. Não declarar migração Rust por isso.

## Teste de TCP/HTTP nativo preparado (não executado)

`s19_native_node_http_sse.test.mjs` é um **teste executável de Node ≥22** com sockets de loopback reais, duas credenciais de 64 hex e hashes SHA-256, `server.listen(0,'127.0.0.1')`, `fetch`, primeira mensagem SSE, reação real, negação de ID forjado e autorização por alias. Foi publicado, **mas NÃO executado**: a engine legada não está disponível como checkout completo no container e não há acesso local de clone GitHub. Usá-lo só como QA do legado, não como implementação produtiva JS.

Pode ser executado futuramente em checkout Node do repo com:

```bash
node --test docs/m45_rust_wasm/inputs/skills/s19_native_node_http_sse.test.mjs
```

**Executado agora:** S19 V8 original **161/161 PASS** e `s19_validate_impact_http_sse.mjs` **97/97 verificações estáticas PASS**, ambas com Git blobs pinados. Fontes e valores registrados em `S19_REAL_IMPACT_HTTP_SSE_V8_RECEIPT.json` e `S19_STATIC_CONTRACT_RECEIPT.json`.

## Dependências, gates e próxima prioridade

No começo do S19, `dev69/rust-core-m45@3100812dc826d93cd025bb466a77bb688d2ce44f` tinha apenas `crates/core-state`. Sem `core-combat`, `core-champions`, `core-protocol` ou `core-server`, e sem `rustc/cargo` no container. O coordenador precisa viabilizar uma crate de **protocolo Rust autoritativo e serializer por seat**, além de execução real Rust nativa, para eliminar o bloqueio de migrar a área para código Rust de produção. **G3 rede NOT_RUN; G8 NOT_CERTIFIED**.

S10 congelado permanece **22 V8_PASS, 2 V8_FAIL, 2 NOT_RUN**. S15 clone Sylas→Shaco e S17 histórico de eventos continuam defeitos distintos sem correção no legado; S16 visão×colisão de clone permanece uma decisão de física em aberto.

**Próxima prioridade S20:** coordenar com Chat 1 a criação real de `core-protocol`/`core-server`, integrar **projeção segura da reação e histórico de eventos**, testes de dupla sessão e replay; não ampliar indefinidamente somente referências. Preservar políticas e APIs autoritativas até existir runner real. **Sem Actions manuais, merge/rebase/force-push ou edições nas branches originais.**
