#!/usr/bin/env bash
# M45 A11: checkout-only QA; never call GitHub Actions.
set -euo pipefail
cd "$(dirname "$0")/.."
node --check tests/m45_platform_a11_intent_gateway_reference.mjs
node --check tests/m45_platform_a11_auth_intent_bridge.test.mjs
node tests/m45_platform_a11_auth_intent_bridge.test.mjs
