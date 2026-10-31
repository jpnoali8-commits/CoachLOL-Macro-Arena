# M45 B02B-I14 — QA Rust nativo no Codespace, sem GitHub Actions

Os comandos abaixo devem ser executados no terminal do Codespace, na raiz do repositório. Não fazem merge, rebase nem force push.

## Atualizar branch da migração

```bash
git status --short
git fetch origin dev69/rust-core-m45
git switch dev69/rust-core-m45 || git switch --track -c dev69/rust-core-m45 origin/dev69/rust-core-m45
git pull --ff-only origin dev69/rust-core-m45
git log -1 --oneline
```

Se houver alterações locais e o switch falhar, preserve-as. Não use reset --hard.

## Conferir toolchain

```bash
node --version
cargo --version
rustc --version
rustup component add rustfmt clippy
rustup target add wasm32-unknown-unknown
```

Se cargo/rustc não existir, instale pelo site oficial https://rustup.rs/ dentro do Codespace; não via Actions. Instalações consomem recursos e rede do Codespace.

## Executar o gate

```bash
node tools/m45_b02b_i14_codespace_qa.mjs
```

Ele registra individualmente: testes Node M45, cargo test --offline, rustfmt, clippy -D warnings, build WASM real e smoke test do binário WASM. Nenhum comando faz download, dispara Actions, gera token ou envia logs à internet.

Recibo: `.m45-qa/i14/result.json`. Logs detalhados: `.m45-qa/i14/*.log`. Não enviar tokens nem arquivos secretos.

## Interpretação

PASS_LOCAL_ONLY_NO_CERTIFICATION comprova somente os passos locais listados e o HEAD do checkout. INCOMPLETE_BLOCKED significa toolchain ou target ausente. FAIL significa falha real no passo registrado. Em nenhum caso o resultado equivale a certificação integral de PvP ou G8.

Envie no chat o conteúdo do result.json para fazer correções com base em erros nativos reais. O executor deste chat não consegue abrir automaticamente o terminal do seu Codespace.

GitHub Actions não são usados. Codespaces possui sua própria quota. 54 testes Rust estão declarados, mas a execução só é comprovada quando o runner registrar o cargo real. As 26 suítes completas de skills e HTTP/SSE real não são cobertas por este gate.
