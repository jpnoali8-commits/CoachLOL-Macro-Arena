#!/usr/bin/env bash
# CoachLOL M45 A10: Full checkout only; no GitHub Actions or Rust certification.
set -euo pipefail
cd "$(dirname "$0")/.."
for test in tests/m45_platform_a10_parser_multiturn.test.mjs tests/m45_platform_a10_voice_ui_contract.test.mjs tests/m45_platform_a10_enter_preview_contract.test.mjs; do
  node --check "$test"
  node "$test"
done
