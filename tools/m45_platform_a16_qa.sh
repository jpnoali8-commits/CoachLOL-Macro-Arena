#!/usr/bin/env bash
# M45 A16 original HTTP handler parity: run in full checkout WITHOUT GitHub Actions.
set -euo pipefail
cd "$(dirname "$0")/.."
node --check tests/m45_platform_a16_legacy_http_handler.test.mjs
node tests/m45_platform_a16_legacy_http_handler.test.mjs
# True TCP original server tests (also require full checkout):
node tests/m45_platform_a02_network_security.test.mjs
node tests/m45_platform_a07_http_sse_restart.test.mjs
