#!/usr/bin/env bash
# M45 B02: local native + real WASM proof. This is NOT run by GitHub Actions.
set -euo pipefail
cd "$(dirname "$0")/.."
for name in rustc cargo node; do
  if ! command -v "$name" >/dev/null 2>&1; then
    echo "M45 BLOCKED_TOOLCHAIN: missing $name; native/WASM NOT_RUN" >&2
    exit 42
  fi
done
rustc --version
cargo --version
cargo test --workspace --all-targets --offline
cargo fmt --all --check
cargo clippy --workspace --all-targets --offline -- -D warnings
if ! command -v rustup >/dev/null 2>&1; then
  echo 'M45 BLOCKED_TARGET: rustup unavailable; native QA complete, WASM NOT_RUN' >&2
  exit 43
fi
if ! rustup target list --installed | grep -Fxq wasm32-unknown-unknown; then
  echo 'M45 BLOCKED_TARGET: wasm32-unknown-unknown not installed; WASM NOT_RUN' >&2
  exit 43
fi
cargo build --release -p coachlol-core-state --target wasm32-unknown-unknown --offline
node --test tests/audit/m45_wasm_binary_smoke.test.mjs
echo 'M45 native and WASM checks PASSED on this runner.'
