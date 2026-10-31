#!/usr/bin/env bash
# M45 B12G - run native Rust in YOUR Codespace, without GitHub Actions.
# Isolates audit branch in a disposable detached worktree; no branch checkout.
set -Eeuo pipefail
ROOT="$(git rev-parse --show-toplevel)"
REF="refs/remotes/origin/dev69/m45-audit-items"
OUT="$HOME/coachlol-m45-qa/items-$(date -u +%Y%m%dT%H%M%SZ)-$$"
mkdir -p "$OUT"
printf 'QA_LOG_DIR=%s\n' "$OUT"
if ! command -v cargo >/dev/null || ! command -v rustc >/dev/null; then
  printf 'BLOCKED: Rust toolchain unavailable in Codespace.\n' | tee "$OUT/blocked.txt" >&2
  exit 2
fi
{
  printf 'GITHUB_ACTIONS_USED=0\n'
  printf 'CURRENT_BRANCH=%s\n' "$(git -C "$ROOT" branch --show-current)"
  printf 'CURRENT_SHA=%s\n' "$(git -C "$ROOT" rev-parse HEAD)"
  cargo --version
  rustc --version
} | tee "$OUT/environment.txt"
git -C "$ROOT" fetch --no-tags origin \
  "+refs/heads/dev69/m45-audit-items:$REF"
TMP="$(mktemp -d -t coachlol-items-XXXXXXXX)"
WORK="$TMP/work"
cleanup() {
  git -C "$ROOT" worktree remove --force "$WORK" >/dev/null 2>&1 || true
  rm -rf "$TMP"
}
trap cleanup EXIT
git -C "$ROOT" worktree add --detach "$WORK" "$REF"
git -C "$WORK" rev-parse HEAD | tee "$OUT/items_sha.txt"
FAILURES=0
gate() {
  local key="$1"
  shift
  echo "=== $key ==="
  if "$@" 2>&1 | tee "$OUT/$key.log"; then
    printf '%s=PASS\n' "$key" | tee -a "$OUT/gates.txt"
  else
    printf '%s=FAIL\n' "$key" | tee -a "$OUT/gates.txt"
    FAILURES=$((FAILURES+1))
  fi
}
gate test_items cargo test --offline --manifest-path \
  "$WORK/crates/core-items/Cargo.toml"
gate test_economy cargo test --offline --manifest-path \
  "$WORK/crates/core-economy/Cargo.toml"
if command -v rustfmt >/dev/null; then
  gate fmt_items cargo fmt --manifest-path \
    "$WORK/crates/core-items/Cargo.toml" -- --check
  gate fmt_economy cargo fmt --manifest-path \
    "$WORK/crates/core-economy/Cargo.toml" -- --check
else
  echo 'FMT=NOT_RUN' | tee -a "$OUT/gates.txt"
fi
if command -v rustup >/dev/null \
    && rustup target list --installed | grep -qx 'wasm32-unknown-unknown'; then
  gate wasm_items cargo check --offline --target wasm32-unknown-unknown \
    --manifest-path "$WORK/crates/core-items/Cargo.toml"
  gate wasm_economy cargo check --offline --target wasm32-unknown-unknown \
    --manifest-path "$WORK/crates/core-economy/Cargo.toml"
else
  echo 'WASM=NOT_RUN_TARGET_MISSING' | tee -a "$OUT/gates.txt"
fi
printf 'GITHUB_ACTIONS_USED=0\nFAILURES=%s\n' "$FAILURES" | tee -a "$OUT/gates.txt"
printf 'QA_LOG_DIR=%s\n' "$OUT"
test "$FAILURES" -eq 0
