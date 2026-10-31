# M45 — Chat 3 — B02B-ITEMS B12C / Integridade da fonte e ACL Rust

Data: 2026-10-30. Branch exclusiva `dev69/m45-audit-items`.

## Implementação e correção
**Corrigida a validação de identidade de campeão no crate Rust** `core-economy`:
- Antes: `id.starts_with(prefix) && id.ends_with(role.source_code())`, aceitando `blue_FAKE_MID`.
- Agora: `id == format!("{prefix}{}", role.source_code())`, restringindo a exatamente `blue_TOP/JG/MID/ADC/SUP` e correspondentes `red_*`.
- Dois novos `#[test]` Rust: 5 funções × 2 equipes × entradas adulteradas, e negação atômica de compra/venda (sem mutação de ouro/inventário).
- **A falha foi verificada estaticamente no fonte Rust pré-correção; não se afirma um exploit de servidor em produção** porque o servidor Rust autoritativo ainda não existe.

## Validação executada nesta etapa
Foi executado no V8 isolado o novo validador `static_rust_items_b12c.mjs` com as fontes congeladas originais:
- 125/125 registros Rust com ID, preço, revenda, tags, roleLock, pet, missão e receitas idênticos aos da engine JS;
- 1.000/1.000 operações de receita batendo com `recipePurchasePartsV453Dev30` da engine original;
- 258 registros da fixture de loja com formato/índices válidos em 44 sessões blue/red. Esta verificação é **estrutural**, não uma reexecução nativa Rust nem um replay completo de loja.
- Duas verificações independentes retornaram resultado idêntico.

Arquivos novos: `static_rust_items_b12c.mjs`, `validate_rust_items_b12c.test.mjs`, `QA_RUST_SOURCE_B12C.json`. O runner Node poderá executar read-only com source-lock do B03.

## Limite inalterado
Tentativa explícita nesta sessão no container: `cargo`, `rustc`, `rustfmt` não encontrados (nem com busca nas instalações locais). Terminal sem DNS para `github.com` ou `static.rust-lang.org`, sem pacote Rust offline. Portanto **cargo test, rustfmt, clippy, WASM, HTTP e G8 NÃO EXECUTADOS**. A correção Rust ainda exige compilação e revisão de integração pelo coordenador. **Não rodar Actions só para compilar um sublote**.

## Próxima prioridade B12D
Conectar o modelo de `ShopContext` ao estado autoritativo/clock do coordenador quando interfaces estabilizarem, e implementar transação de estatísticas + gold + itens atomicamente. Antes disso, estabelecer cargo nativo de forma sustentável e corrigir qualquer falha de compilação/testes reais.
