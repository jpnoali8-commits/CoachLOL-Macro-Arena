# M45 — Coordenação de chats, branches e freeze de desenvolvimento

## Objetivo: não perder produção e evitar engines divergentes

Os três chats DEV69 anteriores não executam tarefas em background. Para impor a nova decisão em outro chat, envie o comando abaixo no chat correspondente. O próximo pedido "próxima prioridade" neste chat segue o ledger, não ordena os demais sozinho.

### Chat 1 — SKILLS (dev69/skills-batch2, PR #9 Draft)

~~~text
COACHLOL M45 — CONGELAMENTO DE SKILLS JS: suspenda imediatamente novas P/QWER passivas em engine.mjs. Preserve o HEAD f0b1147... e PR #9 Draft; não faça merge ou force-push. Faça apenas backup, inventário de todos símbolos/skills/passivas especiais implementadas M14–M44, testes e fixtures golden por SHA, documentando implemented/partial/reference-only e quaisquer blobs B33B NÃO commitados (não assumir que pertencem ao HEAD). Migração de skills existentes será feita em crates Rust conforme docs/m45_rust_wasm/PLANO_MESTRE_MIGRACAO_TOTAL.md e COORDENACAO_CHATS_E_GIT.md na branch de migração. Não produzir novos kits antes de G8. Traga matriz e referências ao integrador.
~~~

### Chat 2 — ITENS (dev69/items-batch2)

~~~text
COACHLOL M45 — CONGELAMENTO DE ITENS JS: suspenda imediatamente novos itens/efeitos em engine.mjs. Preserve integralmente o HEAD e todos os commits; sem merge/force-push. Faça somente inventário de todos itens implementados/parciais/reference-only, receitas, ativos/passivos, buffs, runas, trinkets, economia, gold, Undo e testes com fixtures golden por SHA. Handoff para port em crates Rust core-items/core-economy; mantenha PRs em Draft. Nenhuma nova produção de itens antes de M45 G8. Referências: docs/m45_rust_wasm/PLANO_MESTRE_MIGRACAO_TOTAL.md e INVENTARIO_FONTES_E_MATRIZ.md.
~~~

### Chat 3 — INTEGRAÇÃO (dev69/integration)

~~~text
COACHLOL M45 — PRIORIDADE MÁXIMA: migração integral Rust/WASM. Preserve o HEAD de integração e main (sem merge), scripts, frontend, assets/Issue #1 e servidor JS como oráculos. Não aplique cópia integral de engine.mjs da skills/items; reconcilie por contrato e fixtures. O plano canônico está em docs/m45_rust_wasm/START_HERE.md na branch dev69/rust-core-m45 (PR #19 Draft). A arquitetura final requer servidor PvP Rust nativo, regras Rust, WASM somente público e UI TypeScript/HTML/CSS. Pare expansão JS e priorize gate G0–G8. Não declare promoção/release sem QA nativo/WASM/browser/2 sessões e assets.
~~~

## Contrato de trabalho multi-chat

- **Coordenador/migrador:** branch dev69/rust-core-m45, PR #19 Draft; edita crates Rust, ledger, goldens de migração e projeto inicial. Decide contratos e schema após revisão do integrador.
- **Especialista skills legado:** conserva skills branch como oracle, inventaria kit P/QWER, depois propõe PR isolado para crates/core-champions ou domínio permitido com base na branch Rust. Evita engine.browser.js e não refatora network/ownership.
- **Especialista itens legado:** conserva items branch como oracle; depois propõe PR para core-items/economy com base Rust, sem alterar itens JS da integração.
- **Integrador:** autoridade única para game-server, APIs, frontend, build, merge e release. Pode manter em Draft PR #19 até gates de pacote; NÃO integrar código incompleto como autoridade.
- **Conflito:** implementar tipo comum uma vez em core-state/protocol; especialistas usam API, não duplicam enum/ID/snapshot e não reescrevem arquivos compartilhados ao mesmo tempo.
- **Git:** proteger main, PR #9 e branches atuais; não force/rebase sem explícita autorização; no commit da migração atualizar git ledger + handoff.
- **QA:** testes focalizados por crate; golden comparativo no migrador; npm test/server E2E/browser na integração; não criar Actions sem necessidade real; asset issue continua independente e bloqueia release.
- **Mudança de arquitetura:** requer ADR com motivação, compatibilidade e rollback; não derivar "todo código de cliente precisa ser Rust" — UI fica web.

## Como consolidar materiais históricos

1. Inventariar primeiro nos 3 HEADs, sem merge de engines.
2. Criar snapshot/fixture por símbolo importante com prova da source branch+SHA.
3. Identificar duplicatas de nomes, conflitos de mecânicas e testes desalinhados.
4. Planejar port Rust em ordem de dependência de efeitos compartilhados e gameplay.
5. Registrar "implemented", "partial", "reference_only" por comportamento; evitar promover stub para completo.
6. Só após auditoria e G8 remover JS antigo do **runtime**; manter fixtures/oráculo histórico.
