#!/usr/bin/env bash
# M45 A09: requires full checkout; no GitHub Actions, no Rust promotion.
set -euo pipefail
cd "$(dirname "$0")/.."
node --check tests/m45_platform_a09_gateway_contract.test.mjs
node --check tests/m45_platform_a09_ptbr_parser_contract.test.mjs
node tests/m45_platform_a09_gateway_contract.test.mjs
node tests/m45_platform_a09_ptbr_parser_contract.test.mjs
