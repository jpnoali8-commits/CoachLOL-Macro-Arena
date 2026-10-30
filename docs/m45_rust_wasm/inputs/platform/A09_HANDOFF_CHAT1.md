# Chat 4 → Chat 1 — M45 PLATFORM-A09

**2026-10-30.** Platform branch `dev69/m45-audit-platform`; origin `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`. Rust HEAD verificado `0dda9398cb9e37b3a54d74cea8ab9b698a752fee`.

## Entregas verificadas

- `tests/m45_platform_a09_gateway_contract.test.mjs`: **20/20 PASS em V8 isolado** com Arena integral, gateway dev44/dev47, sala dev47 e dados reais. Dois humanos, cinco unidades cada, autorização, estrutura e sequência de comandos, recibo após seal/restore, fog, visão e checksum. Caso 20 confirma lacuna privada de evento anônimo (**não é segurança PASS**).
- `tests/m45_platform_a09_ptbr_parser_contract.test.mjs`: **15/15 PASS em V8 isolado** sobre `commands.mjs` original e Arena real. Gírias/ações PT-BR, Smite, jungle, farm, compras, peel, duas equipes, negativos e bloqueio de edição após ready.
- `A09_ORACLE_MANIFEST.json`: 35 vetores versionados com proveniência de blobs e diferença explícita entre legado e requisito seguro Rust.
- `tools/m45_platform_a09_qa.sh`: runner local de Node --check + duas suites; **NOT_RUN em checkout** por DNS.
- `A09_REPORT.md`: escopo, metodologia, riscos e resultados.

## Contratos requisitados ao Chat 1

1. `core-protocol`: enum de comandos de input por assento autenticado, `unitIds` 5/5, `sequence` per-seat, `requestId` e `expectedRound`, payloads com campos estritos; sem aceitar `team`/seat do pacote e sem poderes pelo nome do campeão mencionado.
2. `game-server`: `canonicalCommand + CommandReceipt` persistidos antes de resposta, replay idêntico e rejeição de conflito, inclusive após seal/restauração. `ready` também idempotente conforme A05/A08.
3. `VisibleEventDTO`/SSE com default-deny e whitelist de campos. O gap legado continua confirmado na projeção integral.
4. Parser PT-BR/voz mantém semântica, mas **`interpretCommands` não é API de rede autenticada**. Plano gerado deve ser revisado/validado pelo servidor Rust por ordem, campeão e fase.

O Rust HEAD traz apenas `crates/core-state`; `core-protocol` e `game-server` ainda não existem. O ledger relata G1 WASM baseline comprovado; **G1 programa PARTIAL**, G3/G4 Rust NOT_CERTIFIED, G7 BLOCKED, G8 NOT_RUN. Não requisitar Actions a cada lote.

**QA não realizado:** node full checkout, 2 browsers HTTP/SSE, Rust protocol/server parity. Nenhuma alteração nas branches originais, nenhum merge ou mudança no ledger do coordenador.

Próxima prioridade Chat 4: A10 parser/voz + persistência de ordens e snapshot dual-side com testes fonte SHA-pinned; aguardar API de `core-protocol` antes de paridade Rust real.
