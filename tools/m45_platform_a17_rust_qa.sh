#!/usr/bin/env bash
# M45 PLATFORM-A17: offline, no GitHub Actions or coordinator branch changes.
set -euo pipefail
cd "$(dirname "$0")/.."
node --check tests/m45_platform_a17_rust_static_audit.test.mjs
node tests/m45_platform_a17_rust_static_audit.test.mjs
if ! command -v cargo >/dev/null 2>&1; then
  echo 'RUST_NOT_RUN: cargo is not installed in this environment' >&2
  exit 78
fi
cargo fmt --manifest-path crates/core-protocol/Cargo.toml
cargo fmt --manifest-path crates/core-protocol/Cargo.toml --check
cargo test --manifest-path crates/core-protocol/Cargo.toml --offline
cargo clippy --manifest-path crates/core-protocol/Cargo.toml --all-targets --offline -- -D warnings
