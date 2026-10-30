# CoachLOL Macro Arena — M45 PLATFORM-A12
## Auditoria de atomicidade de múltiplos campeões, rollback completo e projeção PvP

**Data:** 2026-10-30. **Somente** branch `dev69/m45-audit-platform`. Base de referência imutável `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`; Rust HEAD consultado `dev69/rust-core-m45@73cade4632598fbe62bb3cf5034f61cf91dd403a`. Sem merge, force-push, rebase, alterações de fontes legadas ou chamadas manuais a Actions.

### Resultado executado — não confundir reprodução de bug com aprovação de segurança

| Bateria | Resultado | Limite de evidência |
|---|---|---|
| `tests/m45_platform_a12_legacy_rollback_golden.test.mjs` | **3/3 PASS V8** | reproduz **três falhas** existentes do legado |
| `tests/m45_platform_a12_atomic_batch.test.mjs` | **20/20 PASS V8** | valida um **modelo QA** de estágio/swap contra a Arena+Room+gateway originais |
| `A12_ATOMIC_BATCH_GOLDENS.json` | **23 vetores** e **10 exigências Rust** | contrato proposto, não implementação |
| Node com checkout completo, HTTP/SSE real, Rust/WASM | **NOT_RUN** | código legado obtido por conector; V8 isolado sem checkout de módulo |
| Persistência atômica em disco e crash/recovery | **NOT_RUN** | o modelo QA é apenas transacional **em memória** |

Foram executados os corpos dos scripts carregados dos blobs GitHub em um V8 isolado, utilizando fontes reais de `engine.mjs`, `commands.mjs`, `authoritative_actions_v453_dev44/47.mjs`, `room_v453_dev47.mjs`, dados de mapa, máscara e manifest. Para o isolado, foram removidos os marcadores de import/export ES e fornecido um `structuredClone` JSON-compatible. As classes e os métodos legados permaneceram originais. Não foi feita execução Node de módulos locais nem benchmark do servidor Rust.

### Descoberta principal — rollback incompleto do `applyCommands` legado

`commands.mjs` tem uma função `applyCommands(preview, arena, {team})` que faz snapshot de **somente** `arena.units.filter(u => u.team === team)`. Em falha, restaura essas unidades; **não** restaura `orderHistory`, `nextId`, `events`, `eventCounter`, nem o restante do estado global alterado por chamadas auxiliares.

Fault injection testada: compilar duas ordens reais, permitir que a primeira ação seja aplicada e injetar `arena.setPolicy = () => false` apenas para a segunda parte, `MID farmar safe`. Resultado de `applyCommands` é `{ok:false,...}`; o checksum das unidades azuis volta à versão anterior, mas o snapshot completo da Arena muda.

1. `ADC recall; MID farmar safe`: deixa registro de `recall` em `orderHistory` e `nextId` incrementado, apesar da recusa do plano.
2. `JG guardar smite; MID farmar safe`: deixa evento `smite_plan`, embora a unidade e a política de Smite tenham sido revertidas.
3. `ADC comprar espada longa; MID farmar safe`: deixa evento `purchase`, embora o inventário/estado da unidade tenha sido restaurado.

**Implicação:** ao migrar, eventos, histórico de ordens, economia, contadores, RNG, wards, objetivos e recibos de transação devem integrar o mesmo commit; jamais publicar eventos de um batch que posteriormente falha. Esses testes são isolamento de método/fault injection, **não** demonstram que o endpoint PvP HTTP atual exponha `applyCommands` com entrada externa.

### Protótipo de referência seguro no escopo QA, não produção

`tests/m45_platform_a12_atomic_text_batch_reference.mjs` implementa `AtomicTextBatchReference` somente para testar o destino pretendido. Ele resolve assento confiável, fase, `room.ready`, rodada/revisão; compila o texto no servidor **simulado** com `interpretCommands`; reconstrói uma Arena usando `Arena.fromSnapshotV40`; executa o **`applyCommands` original no clone**; em falha descarta todo o clone; em sucesso muda o ponteiro `room.arena` e `room.gateway.arena`, incrementa a revisão uma vez e faz **um** persist/broadcast.

Os **20 testes V8** cobrem dois humanos × cinco campeões, lote multi-op de ADC+MID, roteamento à equipe vermelha, 1 broadcast em sucesso, sem evento privado de texto azul enviado ao vermelho no caso positivo, rollback de histórico/eventos/compra, zero broadcasts quando falha, bloqueio ready do próprio assento, draft de outro seat, contexto forjado, revisão stale, receipt idempotente em memória, manutenção de recibo de ação do gateway depois do swap, checkpoint restore e rejeição de texto inválido.

**Limitações não negociáveis:**
- Referência em `tests/` apenas; **não** implantada em `multiplayer/server`, motor JS, Rust ou WASM.
- O `draftId` é contador previsível em `Map`, sem token/autenticação reais, TTL, limite de memória, endpoint ou persistência; jamais copiar isso para produção.
- A troca `room.arena=staged` acontece **antes** da `room.persist()`: falha de I/O nesse momento **não** possui rollback robusto. Portanto esse protótipo **não demonstra atomicidade durável ou recuperação de crash**. No Rust, a camada transacional deve persistir estado+recibo+revisão com garantias de recuperação antes de publicar/ACK.
- O clone não remove falhas pré-existentes de `Arena.perspective`: eventos anônimos `public:false` ainda podem atravessar fog (A03–A11). Apenas o evento `text_plan` com equipe azul foi verificado como não exposto na visão vermelha. Isso **não** certifica SSE completo nem privacidade de eventos arbitrários.
- Não há teste de simultaneidade real de threads/processos ou testes de stress/fuzz nesse lote. O JS isolado é sequencial.

### Requisitos para o servidor Rust e o adapter público WASM

1. O comando PT-BR é uma intenção não confiável. `core-protocol` precisa de enums de ações tipadas e lote com autorização por `match/seat/round/epoch`, além de validação de unidade e estado.
2. Validar e executar **todo o plano ou nada** em sandbox/transação autoritativa; sem fallback silencioso para `order.stop`, nem prefixo parcial de `MID farmar safe`, kite, Smite, compras, wards ou rotas.
3. Atomicidade de estado **global**, incluindo ordem, história, IDs, eventos, economia, RNG, equipes, fase, revisões, filas e recibos; `checksum(pre) == checksum(post)` em todo erro. O Rust deve fornecer teste de fault injection de I/O antes/depois do commit durável.
4. Aplicar `ready` como fence autenticado por assento: o primeiro a confirmar não pode editar a própria intenção, o segundo ainda pode confirmar/planejar; execução avança apenas após os dois.
5. Recibos idempotentes por `(match,seat,round,requestId)`, serialização canônica de payload, deduplicação pós-restart e replay de ACK mesmo depois do turno selado.
6. SSE e `/api/session` publicam **somente** projeções por seat usando `VisibleEventDTO` allowlist; drafts/compra/Smite e posição oculta não vazam para o adversário.
7. Compatibilidade com `Arena.fromSnapshotV40` e intents por campeão ao migrar a semântica, sem transportar implementação autoritativa de JS para o novo runtime.
8. Testar ambos os assentos, reconexões, falhas de disco e turnos simultâneos reais **quando `game-server` e `core-protocol` Rust existirem**.

### Comandos de QA para checkout local

```bash
bash tools/m45_platform_a12_qa.sh
```

O shell roda `node --check` de três arquivos e duas suítes. **Não foi executado num checkout completo neste chat.**

**Gates:** G0 PARTIAL, G1 programa PARTIAL (baseline core-state Rust/WASM anteriormente demonstrado pelo coordenador), G3 e G4 Rust NOT_CERTIFIED, G7 BLOCKED, G8 NOT_RUN.

**Próxima prioridade A13:** snapshot transacional e recibo durável com injeção de falha de persistência/reconnect; auditoria da allowlist SSE de eventos gerados por lote, preservando fonte e branch original.
