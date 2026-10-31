#!/usr/bin/env bash
# M45 PLATFORM-A18: native Rust verification only when offline Rust toolchain exists.
# Never dispatches GitHub Actions and never mutates project source via cargo fmt.
set -euo pipefail
cd "$(dirname "$0")/.."
node --check tests/m45_platform_a18_rust_security_audit.test.mjs
node tests/m45_platform_a18_rust_security_audit.test.mjs
if ! command -v rustc >/dev/null 2>&1 || ! command -v cargo >/dev/null 2>&1; then
  echo 'RUST_NOT_RUN_NO_TOOLCHAIN: cargo/rustc unavailable; 44 Rust unit tests remain NOT_RUN' >&2
  exit 78
fi
rustc --version
cargo --version
cargo test --manifest-path crates/core-protocol/Cargo.toml --offline
cargo fmt --manifest-path crates/core-protocol/Cargo.toml --check
cargo clippy --manifest-path crates/core-protocol/Cargo.toml --all-targets --offline -- -D warnings
