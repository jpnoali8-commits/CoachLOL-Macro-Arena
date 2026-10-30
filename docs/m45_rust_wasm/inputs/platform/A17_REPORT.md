# CoachLOL Macro Arena — M45 PLATFORM-A17

**Data:** 2026-10-30. **Escrita somente na branch** `dev69/m45-audit-platform`, partindo de `4170cd60a9ff310964144b492554b4ddc79fab49`. Originais `dev69/integration` e `dev69/rust-core-m45` preservados. Sem merge, rebase, force-push, Actions ou códigos novos em JavaScript autoritativo.

## Objetivo e implementação

Esta etapa deixa de produzir somente oráculos JS e introduz **código-fonte Rust novo**: um crate independente `crates/core-protocol` para admissão de intenções PvP, validação de assento, recibos idempotentes e projeção mínima por equipe. Foi implementado em branch paralela, **não integrado** ao workspace do coordenador. A branch de Rust verificada (`94e22180623ca20477165221e9e9251ff508c1e8`) possuía apenas `crates/core-state`.

**Principais recursos de código:**

- Tipos `SeatId::{P1,P2}`, `Team::{Blue,Red}` e `Role` com cinco funções (TOP/JG/MID/ADC/SUP). O time é derivado do assento autenticado; operações não possuem campo de time do navegador.
- `RoomProtocol::authenticate` vincula credencial de QA a um `AuthenticatedSeat` com `epoch`; essa credencial e seu modelo de comparação não são autenticação segura de produção. O futuro `game-server` precisa gerar/verificar tokens seguros e revogáveis.
- `ClientRequest::{Batch,Ready}` com `request_id`, `expected_round`, `expected_revision`, preflight de **todas** as operações antes de alterar qualquer estado, limite de 64 e coordenadas normalizadas. Operações desconhecidas são recusadas; policy Smite apenas para JG.
- Recibos determinísticos na memória identificados por `(round,seat,request_id)`; replay idêntico retorna o mesmo recibo **mesmo depois de ambos confirmarem**; conflito de conteúdo recebe `RequestIdConflict`.
- `RoomProtocol::stage_request` permite obter nova sala+recibo em *proposta isolada*, preservando a sala ativa intacta. `submit` ainda realiza swap **apenas em memória**: a camada Rust de persistência deverá gravar Arena, protocolo, RNG, eventos, revisão e recibo de forma atômica **antes** de aplicar o estado ou enviar ACK/SSE.
- `Ready` marca somente seu assento; segundo ready sela a rodada sem executar combate (a engine Rust ainda não existe). `begin_next_round` é chamado externamente após resolver o turno e não simula o mundo.
- `TeamSnapshot` contém somente intenções do próprio assento, campos mínimos e `SseCursor(epoch,seat,revision)`. `VisibleEvent` é allowlist; eventos não classificados/desconhecidos não chegam ao cliente e nenhum `internal_details` é incluído. A formatação de `Debug` da sala não imprime credenciais privadas.

**Esse crate é protótipo de fronteira do protocolo, NÃO servidor PvP Rust nem migração integral do jogo.** Ele não possui HTTP, browser, WebAssembly bindings, fog real, unidades do mapa, itens, skills, economy, parser PT-BR, conexão de SSE, checkpoint/WAL ou recuperação de crash. A simples declaração de `crate-type = ["rlib", "cdylib"]` NÃO prova compilação WASM.

## QA e verdade dos resultados

| Evidência | Resultado |
| --- | --- |
| Testes unitários Rust `#[test]` definidos | **36 escritos — NOT_RUN** |
| Auditoria estática do texto Rust e contrato (Node 22) | **14/14 PASS — executada** |
| Runner Rust `bash tools/m45_platform_a17_rust_qa.sh` | Executado; **exit 78, cargo ausente** |
| `rustc`, `cargo test`, `cargo fmt`, `cargo clippy` | **NOT_RUN — toolchain indisponível** |
| `wasm32-unknown-unknown`, navegador, servidor real | **NOT_RUN** |
| CI GitHub Actions | **Não acionada** |

`tests/m45_platform_a17_rust_static_audit.test.mjs` faz 14 asserções estáticas: crate sem dependências, cinco funções, grants privados, ordem das validações antes da mutação, tipos de recibos, rejeição de intents inválidas, visão por assento, default-deny de eventos, cursor, Debug redigido, helper de eventos restrito aos testes, balanceamento estrutural, 36 nomes de testes únicos e ausência de `unsafe`/`unwrap()` na parte não-teste. **Nenhuma dessas verificações compila ou executa código Rust**; não tratá-las como prova de validade sintática/tipagem/lifetime.

O arquivo `A17_RUST_PROTOCOL_MATRIX.json` lista os 36 testes Rust por nome como `DEFINED_NOT_EXECUTED`, os hashes Git de arquivos e as sete prioridades de integração.

## Riscos e limitações que bloqueiam promoção

1. **Compilação pendente:** este ambiente não contém `/usr/bin/rustc` nem `cargo`, e a rede terminal não alcança GitHub para instalar. Não usar um workflow a cada sublote; coordenador pode rodar uma bateria agrupada quando integrar o crate.
2. **Persistência P0:** recibos e revisões apenas em memória, sem WAL, fsync, serialização canônica ou IO fault injection em Rust. Etapas A12/A13/A14 continuam exigências obrigatórias.
3. **Autenticação P0:** credenciais fixas recebidas na construção são artefatos de referência; não criar cookies, rotação, revogação ou login seguro. Não expor `RoomProtocol` inteiro por Debug/serialização de usuário.
4. **LoL completo ausente:** as intenções são fila tipada, não resolvem luta, item, skill, Smite, jungle, macro turnos, 5 campeões e mundo real. `Intent::Unsupported` falha fechado para não esconder a dívida técnica.
5. **Fronteira G3:** `VisibleEvent` só cobre eventos sintéticos, não faz fog por coordenadas, wards, ilusões, armadilhas ou snapshots completos da Arena. Não copiar eventos anônimos legados A03–A16.
6. **Capacidade WASM ausente:** nenhuma exportação ABI ou bundle/browser testado, apesar do crate ter tipo cdylib.
7. **Workspace isolado:** não mudar automaticamente `Cargo.toml` do `dev69/rust-core-m45`; fazer revisão e adicionar `crates/core-protocol` ao workspace por commit coordenado, sem mexer nas branches de skills/itens.

## QA reproduzível

```bash
# Em branch dev69/m45-audit-platform com checkout completo:
node tests/m45_platform_a17_rust_static_audit.test.mjs
# Com toolchain instalada:
bash tools/m45_platform_a17_rust_qa.sh
# Esse runner formata e depois executa 36 Rust unit tests e clippy offline.
```

**Gates:** G0 PARTIAL; G1 core-state baseline Rust/WASM PASS_BASELINE_ONLY mas programa PARTIAL; G3/G4 Rust NOT_CERTIFIED; G7 BLOCKED; G8 NOT_RUN.

**Próxima prioridade A18:** rodar os 36 testes com `cargo` no workspace do coordenador, corrigir possíveis erros de compilação e iniciar integração de `CommandBatch` com mundo Rust, checkpoint durável e sessão HTTP; evitar continuar exclusivamente em oráculos JS.
