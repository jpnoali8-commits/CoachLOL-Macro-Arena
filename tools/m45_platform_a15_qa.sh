#!/usr/bin/env bash
# M45 PLATFORM-A15 Node transport runner in complete checkout, no Actions.
set -euo pipefail
cd "$(dirname "$0")/.."
for p in \
 tests/m45_platform_a07_sse_frames.mjs \
 tests/m45_platform_a13_durable_reference.mjs \
 tests/m45_platform_a14_sse_resync_reference.mjs \
 tests/m45_platform_a15_http_sse_reference.test.mjs; do node --check "$p"; done
node tests/m45_platform_a15_http_sse_reference.test.mjs
# Full legacy server HTTP goldens (separate coverage; NOT_RUN at A15):
# node tests/m45_platform_a02_network_security.test.mjs
# node tests/m45_platform_a07_http_sse_restart.test.mjs
