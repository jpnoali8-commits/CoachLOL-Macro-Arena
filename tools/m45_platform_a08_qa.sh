#!/usr/bin/env bash
# M45 A08 source-pinned QA runner. Requires full source checkout; not Rust gate.
set -euo pipefail
cd "$(dirname "$0")/.."
node --check tests/m45_platform_a08_sequence_reference.mjs
node --check tests/m45_platform_a08_sequence_reference.test.mjs
node --check tests/m45_platform_a08_client_sequence_races.test.mjs
node tests/m45_platform_a08_sequence_reference.test.mjs
node tests/m45_platform_a08_client_sequence_races.test.mjs
