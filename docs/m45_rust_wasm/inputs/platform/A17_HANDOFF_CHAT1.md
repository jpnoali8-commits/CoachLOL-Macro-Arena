# Chat 4 → Chat 1 — M45 PLATFORM-A17: novo crate Rust de protocolo PvP

**Data:** 2026-10-30. Origem integração `374d87d5f49b52514ec68bbe666df086363c1ec5` somente leitura; branch exclusiva `dev69/m45-audit-platform`. Último Rust verificado ao iniciar: `94e22180623ca20477165221e9e9251ff508c1e8` (consultar HEAD novamente antes de integrar).

## Código novo para incorporar **mediante revisão**

- `crates/core-protocol/Cargo.toml` — crate Rust independente, sem dependências; por escolha, não alterou o workspace `Cargo.toml` do Chat 1.
- `crates/core-protocol/src/lib.rs` — ~28 KB de Rust real. `RoomProtocol`, `AuthenticatedSeat`, tipos de `Intent`, `ClientRequest`, `Receipt`, `TeamSnapshot`, `VisibleEvent`, `SseCursor`; 2 humanos × 5 funções; validação em lote, recibos idempotentes, ready e separação da visão. `stage_request()` é a fronteira para transação durável futura.
- **36 testes Rust `#[test]` definidos, NOT_RUN** (sem `cargo`/`rustc` no ambiente). **14/14 PASS Node** de auditoria estática executada, que NÃO compila Rust.
- `tools/m45_platform_a17_rust_qa.sh` — node checks + `cargo fmt`, `cargo test --offline`, `cargo clippy --offline`. Execução aqui retornou **exit 78 (cargo missing)**.
- `A17_RUST_PROTOCOL_MATRIX.json` com 36 casos + prioridades e estado; `A17_REPORT.md` com riscos e QA.

## Cuidados obrigatórios

1. **Não promover a produção:** crate é protótipo de admissão do protocolo; não tem HTTP, engine, fog real, skills/itens, parser, checkpoint durável, WAL, WebAssembly ABI, ou browser. `submit()` só troca estado na memória. `stage_request()` produz candidato para o servidor persistir antes de publicar.
2. **Não reutilizar credencial QA como login:** `RoomProtocol::authenticate` compara tokens temporários em memória, não valida cookies, expiração, revogação nem hash constante. Implementar sessão segura no Rust `game-server`.
3. **Batch seguro mas gameplay ausente:** o enum `Intent` aceita stop/recall/farm safe/smite hold/freeze/kite/move, enfileira-os e rejeita Unsupported. Isso NÃO executa a habilidade/passiva, compra, dano, macro real ou scripts da engine. Portar TODO catálogo sem fallback genérico.
4. **Privacidade:** `VisibleEvent` faz whitelist sintética e esconde detalhes, mas não representa todos produtores de eventos e fog de LoL. O vazamento legado dos eventos anônimos A16 permanece e precisa ser corrigido no backend novo.
5. **Receipts:** idempotência de `requestId` funciona somente em memória. Persistir o conjunto `Arena+protocol+round+revision+receipt+events+RNG` **antes do ACK/SSE**, conforme A12/A13/A14.
6. **Coordenação:** criar/integrar `crates/core-protocol` em `dev69/rust-core-m45` após revisar a API, adicionar membro ao workspace e executar `cargo test`, clippy, wasm build; não realizar merges/rebases/force pushes inadvertidamente, nem gastar Actions regularmente.

## Próxima etapa do coordenador

1. Executar o runner com Rust nativo local ou uma única validação consolidada relevante. Corrigir erros reais de compilação e de test, se existirem, antes de declarar PASS.
2. Integrar enums e autenticação a `core-state`/novo `game-server`, com autoridade do servidor, `ready` idempotente e recibos duráveis.
3. Adicionar persistência transacional, projeções de fog e SSE auth por equipe; usar cenários A08–A16 para paridade e divergências deliberadas de segurança.

**Status:** G0 PARTIAL; G1 baseline somente; G3/G4/G8 NOT_CERTIFIED. Sem Actions nem merge neste lote.
