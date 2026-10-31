# CoachLOL Macro Arena — M45 PLATFORM-A18
## Rust core-protocol: isolamento de salas, visibilidade default-deny e preparação de rodadas

**Data:** 2026-10-30. Escrita exclusiva: `dev69/m45-audit-platform`. Fonte Rust A17: `faa9186e6efd15457810848ee8f4fd506be68bed`. A branch `dev69/rust-core-m45` foi apenas consultada; nela permanece somente o crate `core-state`, sem `core-protocol` ou `game-server` (HEAD observado `d75cb818533bf637979f9f48c3cb98d3041615e6`). Sem merge/rebase/force-push/GitHub Actions.

### Execução comprovada

- **18/18 PASS, Node 22**, teste de estrutura e invariantes estáticos `tests/m45_platform_a18_rust_security_audit.test.mjs`; script `tools/m45_platform_a18_rust_qa.sh` executado com saída de status **78**, especificamente `RUST_NOT_RUN_NO_TOOLCHAIN`. A verificação de sintaxe JS com `node --check` também passou.
- **44 testes unitários Rust DEFINIDOS, 0 executados**: eram 36 na A17, mais 8 novos. **`cargo test`: NOT_RUN**, **`rustc`: NOT_INSTALLED**, **`cargo fmt`: NOT_RUN**, **`cargo clippy`: NOT_RUN**, **WASM: NOT_RUN**.
- O terminal do ambiente não contém `rustc`, `cargo`, `rustup`; `curl` para GitHub/Rust não consegue resolução DNS. Não foi utilizado Action em momento algum para contornar a restrição de cota.
- O protocolo não foi ligado ao servidor original, ao frontend nem ao motor LoL. Não se permite afirmar G3/G4 como certificados.

### Implementação efetiva em Rust

O arquivo `crates/core-protocol/src/lib.rs` passou a incluir:

**A18-FIX-01 — isolamento de autorização P0:** na A17, `AuthenticatedSeat {seat,epoch}` poderia ser aceito por uma segunda `RoomProtocol` com o mesmo valor de `epoch`. Na A18, a assinatura **muda** para `RoomProtocol::new(room_id, epoch, credentials)`, o grant carrega a identidade da sala e `seat()` compara `room_id` **e** `epoch`. IDs vazios, maiores que 64 bytes ou contendo separadores de caminho/espaços são rejeitados. O servidor autoritativo deverá garantir ID globalmente único e persistido. Este é um defeito identificado por inspeção do contrato e um teste de regressão **escrito, ainda não executado em Rust**. O construtor foi alterado intencionalmente antes de integrar o crate ao coordenador.

**A18-FIX-02 — scope + kind whitelist P0:** na A17, um produtor que classificasse `OrderQueued` como evento `Public` poderia fazê-lo aparecer em ambas as equipes. A A18 usa match conjunto de escopo/tipo: `OrderQueued` e `ReadyConfirmed` **somente Team(owner)**; `TurnSealed` **somente Public**; `Unknown`, `Unclassified` e combinações erradas são descartadas. Dados arbitrários em `internal_details` não são serializados para `VisibleEvent`. Isso endurece o protocolo, mas não corrige o evento anônimo no motor JS legado nem certifica visibilidade completa de skills/itens/wards.

**A18-FIX-03 — estágio de mudança de turno P1:** `stage_next_round(&self)` cria clone e aplica `begin_next_round()` no clone. O estado publicado continua intacto. Em produção, o servidor precisa incluir **Arena inteira, economia, efeitos, RNG, recibos e journal** na mesma transação durável antes de publicar uma nova versão; esse contrato é independente do armazenamento real que ainda não existe.

**A18-FIX-04 — cursor SSE entre salas:** `SseCursor` inclui `room_id/room_epoch/seat/revision`. Uma sala com mesma época e revisão não deve ter o mesmo cursor de outra sala, evitando confusão na reconexão. O cursor continua **apenas informativo**, jamais autentica uma sessão ou substitui cookies assinados.

### Escopo de testes Rust definidos

O novo conjunto acrescenta testes de room ID inválido, cursores distintos com mesma época, grant de outra sala rejeitado, clone do mesmo room válido, evento de ordem ou ready acidentalmente público descartado, evento seal classificado como team descartado, avanço de rodada staged sem mutação e erro de estágio sem mudança. Os 36 testes existentes para dois jogadores, cinco roles, batch, receipts, ready e segurança continuam presentes. Todos aguardam compilação nativa.

### Riscos ainda abertos

1. `AuthenticatedSeat` e `credentials` ainda são um **modelo de QA**, sem cookies HttpOnly/SameSite, sessão expirada/rotacionada ou hash criptográfico de produção. A identidade da sala será emitida e garantida exclusivamente pelo servidor real.
2. `submit()` faz swap **em memória**, não commit de disco. O método `stage_request()` e o novo `stage_next_round()` isolam propostas, mas não implementam persistência, locks entre writers nem rollback de engine.
3. As intenções são apenas tipadas e enfileiradas; **não** implementam macro gameplay, persistência de ordens entre turnos, combate, passivas, skills, itens, parser PT-BR ou 30 minutos de LoL.
4. Rust, WASM, `cargo fmt`, Clippy, HTTP TCP da engine original, duas sessões browser e todas as suítes de paridade Rust permanecem **NOT_RUN**. Não modificar o ledger/G8 do coordenador para PASS.
5. Fonte usa somente a stdlib e nenhum global `AtomicU64`, para manter o protocolo independente de recursos de atomics e adequado à revisão multiplataforma; **sem** prova de compilação WASM.

### Próximo passo e ordem recomendada

A prioridade **A19** é conseguir validação Rust nativa real. Em ambiente com toolchain instalado executar `bash tools/m45_platform_a18_rust_qa.sh` (testes antes de fmt/clippy) e corrigir os erros efetivamente produzidos; então integrar `crates/core-protocol` ao *workspace existente do coordenador*, preservando `core-state`, e iniciar `game-server` autoritativo. **Não** criar mais uma camada JS como substituto de compilação nem gastar Actions até o próximo gate de certificação acordado.
