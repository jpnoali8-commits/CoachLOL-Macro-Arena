# M45 B02 Skills S20 — Rust `core-protocol` proposto, integração por PR Draft

**Data:** 2026-10-30. **Auditoria:** `dev69/m45-audit-skills`. **Origem congelada:** `dev69/skills-batch2@f0b1147ac46e585a1d5374a178b1ea462f5dc278`. **Base Rust consultada:** `dev69/rust-core-m45@daf1df4ce7259cc6502e1b1e7b19a4ca19cd443f`.

## Entrega efetiva
- A branch **`dev69/m45-skills-s20-protocol`**, criada diretamente do HEAD Rust do Chat 1, contém uma crate Rust funcional quanto à implementação de código-fonte (`crates/core-protocol`) e PR [#20](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/pull/20) **Draft** direcionado a `dev69/rust-core-m45`.
- Arquivos: `crates/core-protocol/Cargo.toml`, `src/lib.rs`, `README.md`, `S20_STATIC_SOURCE_QA.json`. Não houve alteração no workspace raiz ou em arquivos de `core-state`.
- `ReactionProtocol` implementa registro privado pós-impacto, projeção autorizada por seat, JSON/SSE compartilhados, alias da visão presente, rejeição de alvos estáveis/stale, histórico selado em event-time, restauração clonada e validação de defensor do próprio time.
- **8 testes Rust escritos, NÃO executados**; **22/22 verificações estáticas executadas e aprovadas**. Não confundir inspeção estática com `cargo test`.

## Bloqueios e vulnerabilidade derivada
- A crate ainda não está integrada ao servidor Rust nem ao combate real. Não cria ou escuta sockets, não autentica tokens, não aplica dano, não controla idempotência de ACK nem reidrata o `Arena` em Rust. Nenhum gate G3/G8 passa por esta entrega.
- Além do P1 do S19 em `pendingDecision.enemyId`, o `core-state/src/pvp_projection.rs` consultado em `daf1df4...` serializa `VisibleUnit.id`, `PublicPvPEvent::VisibleImpact.source_id/target_id` a partir dos IDs privados dos `ServerUnitSnapshot` quando visíveis. O Chat 1 precisa decidir um único resolvedor de alias/visibilidade por seat também para `units` e `events`. Isso é uma **superfície de risco identificada por inspeção**, não exploração Rust em rede demonstrada.
- `SeatIdentityView` é uma interface *trusted* e depende do adaptador de perspectiva do servidor Rust. `public_json(seat,...)` requer que o seat seja derivado da sessão autenticada, jamais do cliente. `react_*` e `evt_*` devem ser IDs opacos não correlacionáveis, gerados no servidor.

## Comandos de QA no Codespace (zero Actions)
```bash
git fetch origin dev69/m45-skills-s20-protocol
git switch dev69/m45-skills-s20-protocol
cargo test --manifest-path crates/core-protocol/Cargo.toml --offline
cargo fmt --manifest-path crates/core-protocol/Cargo.toml -- --check
```
O PR permanece Draft até Chat 1 revisar e o Codespace executar e registrar resultados reais. CI não foi acionada manualmente e não houve merge, rebase ou force-push.

## Handoff Chat 1 e Chat 4
1. Chat 1: revisar `core-protocol`, incorporar ao workspace ao resolver divergências, exigir `cargo test` / `cargo fmt`; unificar ID/alias na `core-state` para todas as projeções.
2. Chat 4: implementar `core-server` real (HTTP, SSE, session room binding, TLS e reconexão), aplicar autorizações atuais, sequências idempotentes e reações oriundas do combate Rust; nenhuma API externa serializa estruturas privadas.
3. Gate real: executar Neeko/Shaco bilateral, 2 sessões, fog após impacto, reconexão, SSE inicial/push, histórico e replay; comparar com oráculo S19. Distinguir bug legado reproduzido de correção Rust certificada.
4. S10 continua congelado **22 V8_PASS / 2 V8_FAIL / 2 NOT_RUN**; S19 permanece **161/161 V8_PASS caracterizando vazamento**, não paridade Rust.
