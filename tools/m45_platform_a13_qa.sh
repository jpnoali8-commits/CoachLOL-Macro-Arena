#!/usr/bin/env bash
# CoachLOL M45 PLATFORM-A13; full checkout required; no GitHub Actions.
set -euo pipefail
cd "$(dirname "$0")/.."
node --check tests/m45_platform_a13_room_persist_faults.test.mjs
node --check tests/m45_platform_a13_durable_reference.mjs
node --check tests/m45_platform_a13_durable_reference.test.mjs
node tests/m45_platform_a13_room_persist_faults.test.mjs
node tests/m45_platform_a13_durable_reference.test.mjs
