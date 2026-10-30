# M45 Chat 4 → Chat 1 — PLATFORM-A11: Fence do preview, comandos PT-BR e recibos

**Data 2026-10-30.** `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5` imutável. Rust observado `73cade4632598fbe62bb3cf5034f61cf91dd403a`. Branch de auditoria escrita `dev69/m45-audit-platform`.

## QA comprovado
- `tests/m45_platform_a11_intent_gateway_reference.mjs` + `tests/m45_platform_a11_auth_intent_bridge.test.mjs`: **20/20 PASS V8 isolado** com código real de Arena, `commands.mjs`, gateway e room. Não integrados à produção. `node` checkout **NOT_RUN**.
- `A11_TEXT_WIRE_COVERAGE.json`: **44 probes reais** (22 frases × 2 equipes), classificados: 14 batch atomic obrigatório, 22 tipo não mapeado, 4 diretamente mapeáveis (`recall` e `upgradeSkill`), 4 não interpretáveis.
- `A11_AUTH_TEXT_INTENT_CONTRACT.json`: **10 requisitos formais** de autenticação, preview privado, ready fence, batches, recibos, fog/voice.
- `A11_REPORT.md`: evidência e limites; `tools/m45_platform_a11_qa.sh`: runner em checkout, NOT_RUN.

## P0 para core-protocol e game-server Rust

**A. Ready/fence por assento:** após `Room.confirm(p1)`, `room.ready.has('p1')=true` mas `Arena.teams.blue.ready=false`. `room.command` nega, mas `commands.mjs.applyCommands` direto ainda aplica no legado. Não existe endpoint texto no PvP legado: **não é prova de exploit HTTP**. O Rust deve validar ready no mesmo ator/transação para *toda* origem de comando, inclusive texto/voz.

**B. Batch completo/sem fallback:** `MID farmar safe` equivale a quatro ações (`policy+tactics+automation+order`); o gateway atual não suporta lote atômico dessa semântica. `JG guardar smite`, `TOP freezar wave`, `ADC kite` também são tipos ausentes do wire. **Não substituir por `order.stop` ou aceitar prefixo!** Criar command enums/cargo core-protocol e ação transacional autoritativa em game-server, sem expor o mundo completo para o frontend.

**C. Preview e recibo:** o servidor resolve a compilação com identidade derivada da sessão (2 humanos × 5 campeões), salva draft não adivinhável vinculado a sala/seat/round/revision/TTL; commit com requestId é idempotente e durável; replay de ACK exato após seal/restauração; cliente só exibe resumo redigido/filtrado. Nosso bridge de testes usa Map + IDs sequenciais: **apenas ferramenta de QA, não produção**.

**D. Voz e UI:** transcrição final pt-BR local e opt-in abre prévia, nunca aplica automaticamente. Novo frontend PvP/WASM precisará trazer texto/voz que hoje estão em `app.js`, não em `pvp_client_v453_dev47.js`.

**Status:** apenas `crates/core-state` está presente no Rust HEAD consultado. `core-protocol`/`game-server` ainda ausentes; G1 baseline validada mas programa PARTIAL; G3/G4/G8 não certificados. Zero merges ou Actions nesta entrega.

**Próxima prioridade Chat 4 — A12:** batch atômico, recusa de conversão parcial e comportamento em dois clientes; handoff do novo test ao coordenador quando os crates existirem.
