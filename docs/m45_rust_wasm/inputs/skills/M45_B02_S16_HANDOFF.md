# CoachLOL Macro Arena — M45 B02 Skills S16: múltiplos aliases, visão e projéteis temporais

**Data:** 2026-10-30. **Branch:** `dev69/m45-audit-skills`. **Origem congelada:** `dev69/skills-batch2@f0b1147ac46e585a1d5374a178b1ea462f5dc278`, engine blob `41679f7328a42e379fdfb8de5b92006e1bfb529f`.

## Evidência realmente executada

O corpo completo do novo teste suplementar `s16_multi_alias_temporal_clone_pvp.test.mjs` foi recuperado da branch de auditoria e executado com a **engine Arena original** e os **gateways originais dev44/dev47** em V8 isolado, apenas substituindo bootstrap/import/assert/structuredClone do Node. **295/295 asserções, 18/18 cenários, 38 comparações de snapshot→restore imediatas PASS.** Cenários: ambos os lados; **2 configurações de alias simultâneo**, **8 colisões de projétil com clone visível** e **8 situações equivalentes com a visão retirada antes do impacto**. Não foi executado o loader Node completo, nem servidor, nem Rust/WASM.

O arquivo `S16_ALIAS_TEMPORAL_V8_RECEIPT.json` registra valores e hashes de origem. `s16_validate_alias_temporal.mjs` passou **63/63 verificações estáticas** de pins, contagens, regras do contrato e matriz S10; registrado em `S16_STATIC_CONTRACT_RECEIPT.json`.

### Resultado A — aliases simultâneos e segurança de perspectiva

Em cada time, `Neeko TOP` se disfarçou de `Shaco MID` aliado, `Shaco MID` criou clone de sua R, e `Ahri MID` adversária observou **três Shacos aparentes** com IDs públicos distintos: `appearance_1` (Neeko), `appearance_3` (Shaco real), `appearance_2` (clone). Todos puderam ser alvos por alias público autorizado. IDs estáveis de Neeko/Shaco e ID interno de entidade foram negados. Repetição idêntica de sequência não duplicou recibo; sequência reutilizada com payload diferente foi rejeitada. Retirada simulada de visão apagou os três da perspectiva e negou seus aliases até retorno da visão. Após expiração do clone (18s), aliases do clone e antigo Shaco real deixaram de ser acionáveis, enquanto alias de Neeko permaneceu até o cancelamento do disfarce. **10 campeões de verdade** em todo momento.

**Limite:** visão foi controlada por `a.canSeePoint`; isso não é prova de fog real com wards/brush nem HTTP autenticado.

### Resultado B — colisão de míssil com clone visível

Com ponto inicial do lançador `(.48,.5)`, clone à frente (`x=.5` Neeko ou `x≈.51334` Shaco), proprietário real atrás `x=.58`, um míssil Ahri E ou Ashe R lançado em t0 atinge clone visível até t1, não proprietário real. HP dos clones após contato (idênticos nos lados azul/vermelho):
- Ahri E → Neeko W clone: **1420/1500**; Ahri E → Shaco R clone: **1380/1500** (recebe 1,5× dano).
- Ashe R → Neeko W clone: **1300/1500**; Ashe R → Shaco R clone: **1200/1500** (1,5×).
- Proprietário real permanece **1500/1500** nesses quatro casos.

### Resultado C — diferença com clone oculto: risco de fidelidade

Ao retirar `canSeePoint(attackerTeam,clone)` entre lançamento e resolução, **o mesmo clone não recebe colisão**. Ahri E termina por alcance sem atingir o campeão atrás; Ashe R prossegue e causa dano ao **campeão real** atrás: HP final **1346** (Neeko) ou **1348** (Shaco) em cada time. O dano exato do campeão real depende de sua resistência, por isso não se compara diretamente a 200 de dano bruto.

**Causa concreta:** o `boardCombatEnemyPoolV453Dev69` da engine original (linhas 4073–4083, especialmente 4076) inclui clones somente se `this.canSeePoint(u.team,v)`. O projétil autoral faz a colisão em `advanceBoardTemporalV453Dev69` (linhas 10212–10245) com esse pool. Campeões reais continuam candidatos mesmo sem o filtro de visão. Assim, a perda de visão altera a física do clone, potencialmente revelando caminhos com efeito diferente do esperado.

**Classificação:** `S16_VISIBILITY_DEPENDENT_PROJECTILE_CLONE_COLLISION` = **POTENTIAL_FIDELITY_RISK_NOT_YET_CLASSIFIED_AS_GAMEPLAY_BUG**. Não copiar silenciosamente para Rust nem corrigi-lo automaticamente sem confirmar a regra de projéteis físicos versus corpos ocultos e testar PvP verdadeiro. Separar colisão autoritativa de permissão de selecionar/alvejar alias; a projeção ao cliente deve manter a identidade interna oculta.

### Contrato de migração Rust

`s16_visibility_collision_rust_acceptance.rs` contém interface tipada `ActualAuthoritativeRustMatchRunner`, **18 futuros casos de aceitação bilateral**, **8 requisitos negativos de ACL** e **3 testes de integridade Rust não executados**. A política de colisão oculta permanece explicitamente pendente, não incorporada como aprovação. O contrato exige snapshot roundtrip, e **não** afirma replay continuado, que não foi testado.

O coordenador `dev69/rust-core-m45` no HEAD `94e22180623ca20477165221e9e9251ff508c1e8` ainda contém somente `core-state`, sem `core-combat` e `core-champions`. **Rust native/WASM/HTTP NOT_RUN; G8 NOT_CERTIFIED.** Nenhum Actions, merge, rebase ou escrita na engine/branches originais. O S10 (26 suítes originais) permanece **22 V8_PASS, 2 V8_FAIL, 2 NOT_RUN; Node original 0**.

## S17 sugerido

Auditar mais interações com **projeção de eventos/visão e snapshots durante múltiplas mudanças de identidade** e preparar o critério de mudança da física de colisão oculta. Assim que as crates centrais existirem, implementar e executar esses contratos no **Rust autoritativo**, sem criar fallback genérico.
