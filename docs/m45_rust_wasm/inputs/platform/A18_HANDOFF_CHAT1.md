# M45 Chat 4 → Chat 1 — PLATFORM-A18: protocolo Rust revisado, ainda não compilado

**2026-10-30.** Base plataforma A17 `faa9186e6efd15457810848ee8f4fd506be68bed`; branch própria `dev69/m45-audit-platform`; branch de Rust do coordenador preservada, HEAD visto `d75cb818533bf637979f9f48c3cb98d3041615e6`.

## O que foi implementado

- `crates/core-protocol/src/lib.rs`: **Rust novo**, altera `RoomProtocol::new(room_id, epoch, credentials)` para ligar grants a sala **e** época. Corrige confusão de autorização se dois rooms compartilharem época. Introduz `InvalidRoomId` e valida IDs.
- `SseCursor` inclui `room_id/epoch/seat/revision`; não aceitar cursor como credencial.
- `RoomProtocol::view` filtra **scope AND kind**; OrderQueued/ReadyConfirmed Team(owner) apenas; TurnSealed Public apenas; erro de classificação não pode tornar privada uma ordem visível ao adversário.
- `stage_next_round()` evita mutar estado publicado antes de commit durável. Continua faltando motor/estado/journal durável.
- **44 testes Rust presentes; NOT_RUN** (36 A17 + 8 A18). **18/18 Node guardrails estáticos executados e PASS**; runner real retorna 78, `cargo/rustc` ausentes. Sem ações GitHub, merges ou mudanças em coordenador.

## Ações concretas do Chat 1 (na ordem)

1. **Compilar Rust de verdade** em toolchain disponível: `bash tools/m45_platform_a18_rust_qa.sh`, depois corrigir qualquer erro real de `cargo test`, `fmt`, `clippy`. Os 44 testes foram definidos, não executados. Não declarar PASS sem output de cargo.
2. Revisar interface nova: `RoomProtocol::new(room_id,epoch,credentials)`. **Mudança incompatível** com construtor A17; o crate ainda não foi integrado na branch do coordenador. Incorporar `crates/core-protocol` ao `Cargo.toml` existente **adicionando membro** `crates/core-protocol`, sem substituir o `core-state`.
3. Garantir `room_id` aleatório/único no servidor com persistência e impedir reutilização de ID+epoch em salas distintas. A18 não fornece essa garantia: exige do server.
4. Implementar `game-server`: autenticar sessions reais, processar batches tipados com todos os 5 campeões por team, persistir **Arena inteira + protocolo + receipts + revision + journal/RNG** antes de ACK/SSE, tratar failed storage, reconnect, ready e bateladas atomicamente.
5. Validar `VisibleEventDTO` contra **cada** evento de skills, itens, mapa, wards e fog, incluindo canary legado anônimo P0 (A03/A09/A14/A16). O whitelist A18 cobre apenas os 3 tipos de protocolo, não certifica o domínio LoL.
6. Executar golden do servidor legado Node A02/A07/A16 e testar paridade HTTP/SSE **no Rust verdadeiro** quando houver server. Manter os gates G3/G4/G8 não certificados até então.

## Status honesto

- Arquivos Rust escritos: **SIM**.
- Node 18/18 guards: **PASS EXECUTADO**.
- `rustc`, `cargo`, Rust unit tests 44/44, Rust WASM e server: **NOT_RUN**.
- Sem Actions, sem merge/rebase/force-push, sem mudanças nas branches originais.

**Próxima prioridade Chat 4 A19:** garantir compilação real antes de ampliar o protocolo; se toolchain continuar ausente, focar na integração segura sem falsear testes.
