#!/usr/bin/env bash
# M45 PLATFORM-A12; full checkout required; does not trigger Actions.
set -euo pipefail
cd "$(dirname "$0")/.."
node --check tests/m45_platform_a12_legacy_rollback_golden.test.mjs
node --check tests/m45_platform_a12_atomic_text_batch_reference.mjs
node --check tests/m45_platform_a12_atomic_batch.test.mjs
node tests/m45_platform_a12_legacy_rollback_golden.test.mjs
node tests/m45_platform_a12_atomic_batch.test.mjs
