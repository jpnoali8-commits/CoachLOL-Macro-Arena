# Chat 4 → Chat 1 — M45 PLATFORM-A12: rollback global e batch atômico

**2026-10-30.** Legado fonte `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`; Chat 4 branch exclusiva `dev69/m45-audit-platform`; Rust HEAD observado `73cade4632598fbe62bb3cf5034f61cf91dd403a`.

## Descoberta P0: `applyCommands` do legado NÃO reverte o estado completo

**3/3 reproduções V8** com Arena+parser originais:
- `ADC recall; MID farmar safe` com falha injetada no `setPolicy` do MID → unidades restauradas, mas `orderHistory` e `nextId` alterados.
- `JG guardar smite; MID farmar safe` com a mesma falha → evento `smite_plan` fica no log.
- `ADC comprar espada longa; MID farmar safe` → evento `purchase` fica no log.

Em todos, `applyCommands` devolve `ok:false` e restaura unidades, mas **checksum do snapshot global difere**. Não está demonstrado exploit HTTP: cliente PvP não expõe diretamente esse método.

## Novo golden e protótipo QA

- `tests/m45_platform_a12_legacy_rollback_golden.test.mjs`: 3/3 PASS = bugs documentados do legado.
- `tests/m45_platform_a12_atomic_text_batch_reference.mjs` e `tests/m45_platform_a12_atomic_batch.test.mjs`: **20/20 PASS em V8** com Arena, gateway e sala completos. Construção de clone via `Arena.fromSnapshotV40`, aplicação integral no clone e publicação única em sucesso; descarta eventos/história/economia se falha. Dois humanos, cinco campeões cada, controle de assento, revisão, ready, dedupe, checkpoint e uma atualização SSE no sucesso.
- `A12_ATOMIC_BATCH_GOLDENS.json`: 23 vetores + 10 exigências Rust; `tools/m45_platform_a12_qa.sh`: runner checkout, Node **NOT_RUN**; `A12_REPORT.md` com evidência e limites.

**ATENÇÃO:** a referência é apenas transacional **em memória**, com `draftId` previsível, receipt `Map` não durável e `room.persist()` após swap. Não é segurança/atomicidade **durável**, não deve ser integrada em produção ou copiada literalmente ao Rust.

## Exigências ao Chat 1 — sequência sugerida

1. Quando `core-protocol/game-server` nascerem, adicionar `CommandBatch` tipado completo, com `AuthenticatedSeat`, expected epoch/round/revision e comandos de todos os cinco campeões, inclusive policy/tactics/automation/Smite/combatStyle/plan/buy.
2. Executar lote autoritativo em *staged transaction* cobrindo **Arena inteira**, RNG, history, events, IDs, economia, ready e receipts. Se qualquer ação falhar, `hash(global)` não deve mudar e não há broadcast.
3. Persistir estado + receipt **antes de ACK/SSE**. Injetar falha de I/O e restart no runner Rust; não publicar snapshot/recibo especulativo e não avançar revisão em caso de falha.
4. A03–A11 G3: eventos privados e detalhes não devem atravessar fog; `VisibleEventDTO` server default-deny para SSE, reconnect e sessão. A12 prova só ausência do evento `text_plan` own-team na perspectiva do inimigo.
5. Executar os 23 vetores A12 e os anteriores em Rust real, depois teste TCP com duas sessões e navegador. **Não declarar paridade Rust ou gate certificado antes disso**.

**Status:** G0 PARTIAL, G1 programa PARTIAL, G3/G4 Rust NOT_CERTIFIED, G7 BLOCKED, G8 NOT_RUN. Nenhum merge, Actions, force push ou modificação do ledger central.

**Próxima prioridade Chat 4: A13** — falhas de persistência, recibos e resync/visibilidade per-seat em commit transacional real.
