# CoachLOL Macro Arena — M45 PLATFORM-A14
## SSE reconnect/resync, ACK recovery, duplicate frames and private-event boundary

**2026-10-30.** Escrita exclusiva em `dev69/m45-audit-platform`. Origem somente leitura `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`. Rust consultado `dev69/rust-core-m45@5afd330f260c7a0b1984521732e117dfcd81396f`. Nenhum merge/force push/rebase, sem mudanças em engine, servidor, cliente real, skills, items ou Rust. Nenhuma GitHub Action chamada.

## QA executado e escopo

| Suite | Resultado | Método |
| --- | --- | --- |
| `tests/m45_platform_a14_legacy_sse_recovery.test.mjs` | **14/14 PASS** | V8 isolado com Arena, gateway dev44/dev47 e Room dev47 originais, mapa/máscara/manifest reais; source file `server_v453_dev47.mjs` para asserções estáticas |
| `tests/m45_platform_a14_sse_resync_reference.test.mjs` | **16/16 PASS** | **Node 22.16.0** e arquivos reais temporários Linux, store QA A13, leitor SSE incremental A07, referência de resync/consumidor A14 |
| `node --check` dos dois módulos A14 de referência | **PASS** | Node local |
| Correspondência SHA dos dois módulos de referência com blobs GitHub | **2/2 exact** | `git hash-object` |
| `A14_SSE_RESYNC_VECTORS.json` | **30 vetores, 6 lacunas** | contrato proposto Rust |
| Node full checkout / HTTP SSE real / dois browsers / Rust/WASM | **NOT_RUN** | sem certificado de plataforma |
| Efeitos de queda real de processo / TLS/cookies / concorrência / backpressure | **NOT_RUN** | não foram simulados na rede |

O V8 remove invólucros ES import/export, usa clone JSON-compatible no gateway e mantém métodos/classes legados reais. V8 **não** equivale ao servidor TCP de Node. O Node autossuficiente A14 roda a referência *proposta* usando storage durável de QA da A13; **não** roda a Arena real nem o `game-server` Rust.

## Resultado A: reconexão do legado

`PvPRoomV453Dev47.subscribe(p,send)` chama `send(this.view(p))` **imediatamente** e em cada `broadcast()` subsequente. Quando a conexão é refeita, chega apenas o estado atual autorizado; não existe journal de eventos por assento ou replay incremental. `server_v453_dev47.mjs` emite `: connected`, `event: state` e JSON da perspectiva sem `id:`, sem `Last-Event-ID`, com heartbeat 15 s, mas sem tratamento de pressão de escrita (`res.write`).

Nos **14 cenários V8**:
- Bootstrap separado azul/vermelho, cinco campeões próprios; comando azul transmite uma revisão para ambos com `nextSequence` independente.
- `room.broadcast()` duas vezes sem mudança gera **dois frames extras com a mesma `revision`**. O cliente legado aceita `v.revision >= lastRevision`, então re-renderiza duplicatas.
- Desconexão/reconexão entrega **snapshot mais recente**, não journal dos eventos intermediários.
- Retry idêntico de `room.command` devolve recibo igual sem nova mutação ou novo broadcast, inclusive após `Arena.fromSnapshotV40`/restore.
- Evento `team:'red'` oculto fica fora do snapshot azul; **evento anônimo com `public:false` atravessa os dois lados** (falha de privacidade já conhecida). Os campeões inimigos não visíveis permanecem ocultos no campo `projection.units`.
- Checkpoint cru, `tokenHash` e `rngState` não aparecem nas projeções observadas. `ready` do p1 e seus recibos de ação persistem por restore; retry de `ready` ainda não é idempotente.
- `unsubscribe` corta callback antigo; assinante que lança erro num **broadcast posterior ao bootstrap** é removido sem derrubar transmissão do outro assento.
- Verificação de fonte confirma ausência de cursor e `Last-Event-ID` no legado.

**O PASS nos casos de vazamento é diagnóstico de problema, NÃO aprovação de privacidade.** Nenhum problema novo foi corrigido diretamente no código legado.

## Resultado B: referência Node de snapshot resync seguro

`tests/m45_platform_a14_sse_resync_reference.mjs` tem classes **exclusivas de QA** `PerSeatSseResyncReference` e `PerSeatSseConsumerReference`. Lê o **último checkpoint gravado** por `DurableCheckpointReference` A13, monta DTO com whitelist explícita e devolve `event: state`, `id: roomId/seatId/revision` e `data: JSON`. O consumidor só aceita mudança quando `roomId`, `seatId` e `id` condizem e a revisão é estritamente maior que a última.

Os **16 testes Node PASS** incluem:
- Inicialização e autenticação simulada dos dois assentos, ordens de cada time sem revelar a unidade adversária.
- Cursor estranho/de outro assento/de outra sala, inválido, futuro, perdido e idêntico: envia snapshot **da própria equipe**; cursor nunca concede permissão.
- Integração com parser SSE da A07, inclusive chunk dividido, e consumidor que ignora frames duplicados, antigos e com ID adulterado.
- Recibo de comando recuperado do arquivo após reiniciar instância; revisão/cursor coerentes com checkpoint.
- Falha **após rename** (ACK perdido): o retry recupera recibo já persistido, sem reexecução da ordem nem avanço duplicado de revisão.
- Falha **antes do rename**: checkpoint e cursor permanecem na revisão anterior.
- Evento com `scope` ausente, `kind` desconhecido ou detalhes extras não é copiado por spread; campos `privateDebug`, `privateSeed` e eventos da equipe oposta não entram no frame azul. A whitelist de tipos é deliberadamente restrita.
- Primeiro e segundo `ready` confirmados duravelmente, com `executionCount=1` após reenvio.
- Dois frames idênticos no mesmo chunk SSE são analisados, mas o consumidor só aceita o primeiro.

**Limites:** roomId de demonstração fixo, um processo/um escritor, auth como objeto de teste, enum `order.stop/ready`, sem LoL real, sem autenticação HTTP, rate limit, journal de replay, offset de byte ou troca real de sala. O cursor textual é usado como identidade de snapshot, **não token seguro**, e o servidor real precisará de `roomEpoch` para impedir colisões entre gerações e mudanças de assento. Persistência real depois de queda/kill, `ENOSPC`, SSE sobre HTTP, browser, Rust e WASM permanecem pendentes. A referência não deve ser promovida a código de produção.

## Contrato Rust exigido

1. Determinar `AuthenticatedSeat` e time do cookie/sessão confiável. `Last-Event-ID` é só indicação de cursor, não autenticação.
2. Gerar `SseCursor{roomEpoch,seatId,committedRevision}`, com `committedRevision` originada **somente de transação já persistida**. Não publicar SSE enquanto checkpoint/recibo falhar (A12/A13).
3. Na conexão/reconexão, revalidar sessão e enviar um snapshot completo *por equipe* com campos e eventos whitelist. Não serializar checkpoint, RNG, ordens/wards invisíveis, inventário adversário, `tokenHash` ou dados arbitários em `details`.
4. Cursor de outra sala/seat, inválido/futuro ou gap deve forçar snapshot novo autorizado; se houver journal futuro, qualquer replay dele também passa pelo filtro da sessão atual.
5. Cliente mantém `roomEpoch + seat + revision` e rejeita frames duplicados/anteriores; ACK perdido é recuperado via recibo persistente, não pela contagem de frames SSE.
6. Implementar limites/backpressure, timeout e `drain`, cancelamento de stream e política de heartbeat que não vaze informação. Evitar que cliente lento segure toda a sala.
7. Cobrir matriz com dois humanos e cinco campeões cada, testes de fog/eventos anônimos e queda de processo usando Rust `core-protocol`/`game-server` assim que criados.

## Execução futura em checkout integral

```bash
bash tools/m45_platform_a14_qa.sh
```

Este runner executa `node --check` e as duas suítes. **NOT_RUN** nesse chat como checkout de todos os módulos Node devido ao bloqueio de obtenção local via DNS. Os **dois testes de referência Native Node 16/16 foram de fato executados**, usando mesmos blobs/hashes publicados.

**Status:** G0 PARTIAL; G1 baseline Rust/WASM core-state parcial do programa; G3/G4 servidor Rust e frontend não certificados; G7 assets/browser bloqueados; G8 NOT_RUN.

**Próxima prioridade A15:** transporte HTTP SSE com duas sessões reais se for possível reconstruir checkout Node, incluindo close/reconnect, backpressure e eventos privados. Na ausência de servidor Rust, manter evidência marcada como legado/ref.
