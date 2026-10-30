#!/usr/bin/env bash
# M45 PLATFORM-A14 (requires complete repo checkout; never triggers Actions).
set -euo pipefail
cd "$(dirname "$0")/.."
for p in \
 tests/m45_platform_a14_legacy_sse_recovery.test.mjs \
 tests/m45_platform_a14_sse_resync_reference.mjs \
 tests/m45_platform_a14_sse_resync_reference.test.mjs; do node --check "$p"; done
node tests/m45_platform_a14_legacy_sse_recovery.test.mjs
node tests/m45_platform_a14_sse_resync_reference.test.mjs
