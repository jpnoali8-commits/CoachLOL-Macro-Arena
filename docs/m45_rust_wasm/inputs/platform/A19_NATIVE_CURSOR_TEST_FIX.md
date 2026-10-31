# M45 PLATFORM-A19 — correção do teste nativo de cursor Rust

**Data:** 2026-10-30. Branch exclusiva `dev69/m45-audit-platform`.

## Evidência efetivamente recebida

Usuário executou `bash tools/m45_platform_a18_rust_qa.sh` no GitHub Codespaces, em `dev69/m45-audit-platform`. O Rust compilou e o `cargo test` reportou **43 passed; 1 failed**. Falha única:

`tests::cursors_are_bound_to_room_id_even_with_equal_epoch_and_revision`.

Isso é execução **nativa** real, não auditoria estática. Não há nova execução nativa neste chat depois do patch.

## Causa localizada no código A18

O teste criava `a = room()` com o token `blue_secure_session_0001` e `b = RoomProtocol::new("another-room", ... ["another_blue_session_0001", ...])`. No entanto, chamava `blue(&b)`, helper que executa `b.authenticate("blue_secure_session_0001").unwrap()` com a credencial da **sala A**, incompatível com B. Essa falha de autenticação esperada era transformada em pânico de `unwrap()` **antes** de comparar qualquer cursor. Não há evidência de falha na implementação de `SseCursor::wire()`.

## Correção aplicada

No teste existente, manter salas e época/revisão iguais, mas:

1. Afirmar explicitamente que a sala B **não** autentica o token azul da sala A.
2. Autenticar B com `another_blue_session_0001`.
3. Comparar `a.view(&blue(&a)).cursor.wire()` com `b.view(&b_grant).cursor.wire()`.

Sem alteração do código de produção, das regras de autorização ou dos 44 testes unitários definidos. O teste agora cobre duas invariantes sem credenciais cruzadas indevidas.

## Estado após publicar

- Compilação nativa **PASS observada antes da correção**.
- Testes nativos **43 PASS / 1 FAIL antes da correção**.
- Código do teste A19 corrigido e publicado; **44/44 pós-fix ainda NÃO EXECUTADO**.
- `cargo fmt --check`, `cargo clippy`, target WASM ainda não verificados após correção.
- Zero GitHub Actions, merges ou alterações à branch `dev69/rust-core-m45`.

## Instrução curta de revalidação no Codespaces

```bash
git pull --ff-only
cargo test --manifest-path crates/core-protocol/Cargo.toml --offline
bash tools/m45_platform_a18_rust_qa.sh
```

Se os testes nativos passarem e `cargo fmt --check` apontar apenas formatação, executar `cargo fmt --manifest-path crates/core-protocol/Cargo.toml` e mostrar o diff antes de publicar alterações. Não declarar Clippy/WASM certificados sem execução.
