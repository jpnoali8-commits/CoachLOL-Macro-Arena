# CoachLOL Macro Arena — M45 B02 Skills S18: vazamento de identidade no protocolo PvP da sala

**Data:** 2026-10-30 · **Audit branch:** `dev69/m45-audit-skills` · **Origem imutável:** `dev69/skills-batch2@f0b1147ac46e585a1d5374a178b1ea462f5dc278` · **Engine original Git blob:** `41679f7328a42e379fdfb8de5b92006e1bfb529f`.

## Resultado executado — falha P1 de protocolo

O S18 executou o corpo **salvo no GitHub** de `s18_pvp_room_pending_identity_pvp.test.mjs` contra a **Arena original**, os gateways originais dev44+dev47 e a classe **PvPRoomV453Dev47 original**. Apenas o bootstrap ESM/imports/Node `assert`/`structuredClone` foi adaptado para V8 isolado. **121/121 assertivas, quatro cenários bilaterais PASS** — PASS significa defeito reproduzido. O teste está pinado no Git blob `e5a9a3ced7b42e485aeb3049a5a6c569daa9d9eb`; todos os Git SHA originais no `S18_PVP_ROOM_IDENTITY_V8_RECEIPT.json`.

| Time defensor | Oponente mascarado | ID público correto em `projection.units` | ID interno exposto em `pendingDecision.enemyId` |
|---|---|---|---|
| Azul | Neeko inimiga disfarçada | `appearance_1` | `red_TOP` |
| Azul | Shaco inimigo com clone ativo | `appearance_3` | `red_MID` |
| Vermelho | Neeko inimiga disfarçada | `appearance_1` | `blue_TOP` |
| Vermelho | Shaco inimigo com clone ativo | `appearance_3` | `blue_MID` |

Todos os quatro casos verificaram: o adversário **não** aparece com ID estável na `projection.units`, mas o campo de metadata **top-level da sala** inclui o ID estável; perda artificial posterior de `canSeePoint` remove o inimigo da projeção, mas **não remove o ID interno de `pendingDecision`**. São **4/4 exposições por alias visível e 4/4 persistências após perda artificial de visão**.

### Causa no código e alcance

`multiplayer/room_v453_dev47.mjs` em `PvPRoomV453Dev47.publicInfo(p)` constroi:

```js
pendingDecision: this.gateway?.seats.get(p.seatId)?.unitIds.includes(this.arena.pendingDecision?.unitId)
  ? {kind:this.arena.pendingDecision.kind,unitId:this.arena.pendingDecision.unitId,
     enemyId:this.arena.pendingDecision.enemyId}
  : null
```

A proteção de **seat ACL** está correta: os quatro cenários comprovaram `pendingDecision===null` para o outro seat, não autorizado como defensor. O problema está em o **jogador autorizado** receber a identidade **privada do atacante inimigo**, diferente do alias público da mesma sala. A `Arena.pauseForDecision('combat_reaction', defender.id, maskedEnemy.id)` foi chamada diretamente — é a API original que `processAmbushResponses()` usa — para construir uma decisão válida. **Não afirmamos que houve duelo/AA genuinamente resolvido, HTTP ao vivo ou ataque em ambiente adversarial real.** Trata-se de vulnerabilidade concreta **do caminho de projeção quando a condição de decisão ocorre**, não de uma exploração HTTP comprovada.

A sequência original `Arena.snapshotV40 → Arena.fromSnapshotV40 → PvPRoomV453Dev47(rebuilt/restored gateway)` teve a mesma perspectiva e metadata, por **4/4 restarts**, e o vazamento manteve-se após perda sintética de visão. O teste também verificou que `objectiveLedger` do time oposto não é retornado (fixture injetada apenas para testar filtragem, não objetivo realmente abatido), que o placar próprio é numérico e que `actionJournalV40`/`lastTacticalAlerts` não são campos da projeção da sala. A projeção pode mostrar **11 avatares públicos** (10 campeões reais + 1 clone), enquanto `Arena.units.length` permanece 10 — não confundir os dois totais.

**Identificador:** `S18_PUBLIC_ROOM_PENDING_DECISION_STABLE_ENEMY_ID`. **Severidade:** P1 privacidade/protocolo. **Status:** reproduzido no V8, sem correção na engine legada.

### Correção e aceitação Rust

A sala Rust deve transportar uma representação pública **por seat** da reação, com `enemy_public_alias` gerado pelo servidor **somente se atualmente observável e autorizado**, ou `null`/referência opaca sem identidade se invisível. Não serializar `enemyId` persistente para jogador adversário. A resposta do defensor não pode inventar seu próprio ID interno: o gateway Rust resolve novamente o alias no **estado autoritativo atual**, aplica posse, visão, cooldowns e ordem. O server continua usando `enemyId` internamente sem expô-lo em JSON ou SSE.

O artefato `s18_room_reaction_identity_rust_acceptance.rs` fornece uma função **concreta mas isolada**, `safe_public_reaction`, para sanitizar o campo, além de trait `RealRustPvPRoomRunner` e validação real **4 casos (Neeko/Shaco × os dois times)** e oito requisitos negativos explícitos, incluindo vazamento no SSE, ACL de sessão, stale alias, fog e restore. **Cinco testes unitários Rust preparados, 0 compilados/executados**, não integrar cegamente como engine pronta.

### QA e gates

`s18_validate_pvp_room_identity.mjs` executou **76/76 verificações estáticas PASS** contra blobs, resultados, origem, requisitos Rust e recibos S17/S16/S10; evidência `S18_STATIC_CONTRACT_RECEIPT.json`.

A branch coordenadora `dev69/rust-core-m45` ainda tem somente `core-state` no HEAD observado `3cd4f124590275d37c597cdc820eab655285d98c`; sem `core-combat` ou `core-champions`. Localmente não há `rustc`/`cargo`. **Rust nativo, WASM, Node ESM integral, HTTP autenticado/SSE e navegação real NOT_RUN; G8 NOT_CERTIFIED**. S10 mantém 22 V8_PASS, 2 V8_FAIL, 2 NOT_RUN; S17 vazamento de histórico P1 continua confirmado, sem correção. Nenhuma GitHub Action, merge, rebase ou escrita na engine/branches originais.

## Próxima prioridade S19

Prosseguir em **segurança de todos os campos JSON da sala e gateway**: testar verdadeira sessão HTTP com dois tokens quando ambiente/runner existir, SSE e janela de reação real, e preparar integração do reparo de projeção no Rust. Priorizar implementar as crates autoritativas necessárias em vez de sucessivos contratos isolados, sob coordenação do Chat 1.
