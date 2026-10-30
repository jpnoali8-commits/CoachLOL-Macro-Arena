# CoachLOL Macro Arena — M45 PLATFORM-A11 — Fencing de preview texto/voz para gateway autenticado

**Data:** 2026-10-30. Branch de escrita exclusiva `dev69/m45-audit-platform`. Integração legada somente leitura `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`. Rust coordinator consultado `dev69/rust-core-m45@73cade4632598fbe62bb3cf5034f61cf91dd403a`. Sem merge/rebase/force push/uso manual de GitHub Actions.

## Execução A11 — resultados estritamente discriminados

- **20/20 PASS no V8 isolado**, invocando `tests/m45_platform_a11_auth_intent_bridge.test.mjs` e `tests/m45_platform_a11_intent_gateway_reference.mjs` contra `engine.mjs` real, `commands.mjs` real, `authoritative_actions_v453_dev44/47` real, `room_v453_dev47` real e map/masks/manifests reais; remoção somente de invólucro de imports/exports e JSON clone equivalente em payloads. Os testes foram criados como blobs GitHub e o conteúdo exato dos blobs foi executado. **PASS é conformidade do adaptador QA e observação das respostas do legado, não que a plataforma Rust esteja implementada.**
- **44 probes adicionais do parser de origem em V8**, 22 frases PT-BR × azul/vermelho. Classes: 14 `REQUIRES_ATOMIC_BATCH`; 22 `UNMAPPED_INTENT_TYPE`; 2 `SINGLE_MAPPABLE_RECALL`; 2 `SINGLE_MAPPABLE_UPGRADE`; 4 `PARSE_REJECTED`. Exportadas em `A11_TEXT_WIRE_COVERAGE.json`. Classificação de *forma* da intenção, não prova de sucesso da skill/compra/Smite na engine.
- `node --check`/Node de checkout completo **NOT_RUN** por DNS GitHub não resolvido localmente. Cargo Rust/wasm da plataforma, HTTP real, navegador e microfone **NOT_RUN**.
- O Rust HEAD foi enumerado por árvore GitHub (sem truncamento): **`crates/core-state` presente; `crates/core-protocol` e `crates/game-server` ainda ausentes**. Baseline core-state Rust nativo/WASM tem evidência anterior no ledger do coordenador, mas **não** constitui G3/G4/G8 da plataforma.

## Diagnósticos e restrições reais

1. **Lacuna A10 já confirmada:** `room.confirm(blue)` marca `room.ready.has('p1')`, porém a `Arena.teams.blue.ready` continua `false` até ambos confirmarem. A rota autorizada `room.command` bloqueia novo comando do assento. `commands.mjs.applyCommands` usado diretamente sobre Arena *não* observa `room.ready`. Como não existe endpoint HTTP `text_plan` na sala PvP legada, **não está demonstrada exploração remota**. Qualquer integração nova sem fence de assento produziria essa violação.
2. **Diferença de semântica importante:** `interpretCommands('MID farmar safe')` gera `policy`, `tactics`, `automation` e `order{kind:farm}`, enquanto o gateway transportável não tem forma atômica de enviar esse conjunto. `JG guardar smite` gera `smitePolicy`, `TOP freezar wave` gera `tactics + automation`, `ADC kite com AA` gera `combatStyle + automation`. Não traduzir silenciosamente só uma parte. O subset QA aceita **somente uma ação direta** (`ADC recall -> order.recall`; `MID upar Q -> skill.upgrade`) e rejeita todos os outros pacotes sem mutar nada.
3. **Protótipo QA deliberadamente restritivo:** `AuthenticatedTextIntentBridgeReference` reside em `tests/` e compila texto no lado *simulado* do servidor. Registra draft em Map local, valida assento autenticado (objeto fornecido pelo harness), unidade do próprio time, fase, `room.ready`, `round` e `revision`. `commit` chama `room.command` real e armazena recibo/bytes para retry exato; rejeita drafts antigos/roubados ou com múltiplas ações. **Não é código de produção**: draft IDs sequenciais/predizíveis, sem tempo de expiração, armazenamento durável, tokens reais ou batch transacional. **Não transportar essa implementação para servidor.**
4. **20 testes de referência executados:** prévia sem alteração da Arena; recall azul/vermelho autorizado; Smite/kite/farm plano complexo rejeitado integralmente; texto inválido; credencial forjada e ID de draft de outro assento; preview e commit após primeiro ready bloqueados; revision stale após comando do outro assento; reenvio idempotente após ACK perdido; recibo após duas confirmações; checkpoint/server restore preserva recibo de ação; novo round invalida draft anterior; nenhuma aplicação parcial de `ADC recall; MID farmar safe`.
5. O `room.command` original *já* contém recuperação canônica de recibos por sequência, inclusive após seal/restart. Entretanto `POST /api/ready` continua não idempotente no legado; o contrato Rust requer recibos duráveis para ambos, incluindo transação no último ready.
6. Compilar na Arena integral no servidor é útil para referência legada, mas **não** dá permissão para retornar estados privados ao cliente. Preview e SSE futuros devem conter somente informação própria/pública, com eventos default-deny e verificação dos observadores no servidor.

## Entrega formal ao Chat 1

`A11_AUTH_TEXT_INTENT_CONTRACT.json` contém 10 requisitos. Protocolo-alvo (não implementado):
- `PreviewIntentRequest` traz texto final, sala/revisão/rodada esperadas, mas **não confia** em `team`, `seatId`, `unitIds`, comandos compilados ou `voiceProvider` do cliente.
- O servidor autentica cookie, deriva um humano por time + cinco campeões; resolve comandos no lado autoritativo; retorna `draft_id` opaco/inadivinhável e resumo filtrado; mantém comandos internos com validade curta, vínculo a `roomEpoch/seat/round/revision`.
- `CommitDraftRequest` inclui `draft_id, request_id`; motor revalida em transação, rejeita qualquer operação não suportada e só aceita **todo o plano ou nada**. Recibos idempotentes persistidos antes do ACK/stream para recuperar após lost-ACK, seal, restart e reconexão.
- **Ready é fence por assento**, mesmo que `Arena.teams[team].ready` esteja temporariamente false. Rejeitar draft antigo e callbacks de outra sessão; nenhuma transcrição local de voz deve aplicar sem confirmação do jogador.
- Manter texto/voz PT-BR na camada pública WASM/UI somente como entrada, sem engine autoritativa JavaScript nem acesso a ordem inimiga oculta.

## Execução futura com checkout integral

```bash
bash tools/m45_platform_a11_qa.sh
# chama node --check em ambos os scripts e executa 20 cenários do bridge
```

**Gates:** G0 PARTIAL; G1 programa PARTIAL (baseline core-state Rust+WASM previamente comprovado); G3/G4 servidor/paridade Rust NOT_IMPLEMENTED/NOT_CERTIFIED; G7 browser/assets BLOCKED; G8 NOT_RUN. Nenhum workflow/Action acionado neste lote. Não alterar o ledger do Chat 1 nem as branches de integração/skills/itens.

**Próxima prioridade Chat 4:** contrato de batch autoritativo atômico de ordens de texto de múltiplos campeões, golden de rollback + eventos privados sob reconcile de duas sessões e, quando existir `core-protocol/game-server`, teste Rust do contrato do A11.
