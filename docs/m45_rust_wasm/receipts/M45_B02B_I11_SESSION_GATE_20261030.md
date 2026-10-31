# M45 B02B-I11 — sessão autenticada antes de JSON/SSE (Rust)

Data: 2026-10-30. Base: 3cd4f124590275d37c597cdc820eab655285d98c. PR #19 Draft; target branch dev69/rust-core-m45.

### Implementação
- `SessionGate` associa tokens de 32 bytes dos assentos azul/vermelho. O futuro servidor deve gerar e manter tokens de forma independente em OS CSPRNG + TLS; não há token real produzido nem protocolo/cookie HTTP nesta mudança.
- `public_json`/`sse_frame` exigem bearer, sem argumento de seleção de team; token incorreto/revogado não retorna payload. `rotate` substitui token e `revoke` bloqueia novas publicações. Testes usam tokens repetidos APENAS como fixtures não seguras.
- `SeatPublicProjection` e fábrica `from_private` agora são `pub(crate)`, para não expor uma rota pública de projeção que aceita team arbitrário. O novo gate é o caminho pretendido para outros crates.
- Não introduz networking nem servidor real; revogação bloqueia a PRÓXIMA publicação, não frames previamente enviados. Não há garantia formal de comparação em tempo constante; proteger por TLS e revisar com crate criptográfica adequada.

### Evidências e limites
- 10 testes Rust novos DECLARADOS, 42 cumulativos, zero executados: cargo/rustc ausentes no executor, compilação native/WASM NOT_RUN.
- Gate público de código-fonte não equivale a sessão HTTP real, CSPRNG real, CSRF/origin, replay/event-time fog ou testes de navegador.
- 26 suites Node originais 0/26, HTTP/SSE real NOT_RUN. G0/G1 PARTIAL, G3/G6/G8 NOT_RUN. Sem Actions manuais. Rollback = revert único commit.