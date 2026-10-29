# M44 B01 / Wave 1 — travelling projectile authority (NOT CERTIFIED)

Date: 2026-10-29. Branch: `dev69/skills-batch2`, existing PR #9 Draft -> `dev69/integration`.
No merge, no engine.browser.js, no version.json or Items changes.

## Implementation (six separate champion identities)

- Lee Sin Q1 / Sonic Wave: no instant hit or false Q2. Server-owned flying segment, genuine first-body collision, successful sonic mark and Q2 window only after real impact; Q2's existing energy, ownership, realm, distance, obstacle and cooldown paths remain separate.
- Braum Q: projectile segment + Concussive Blows ownership and stacking + own slow after impact.
- Quinn Q: Harrier mark, blind and slow on actual contact, never when launched.
- Rell Q: authored Q contact, shield-break and brief stun with spell-shield counterplay.
- Locke Q: Soul Nails owned mark and per-target stack ledger on real contact.
- Varus R: contact root and its distinct downstream sequential root-chain temporal object; never instant full-line chain.

M44 timed objects use immutable cast origin/destination, owner and team, bounded finite numeric hit caps, deterministic hitIds, discrete travel steps, segment collision against entities/terrain, same-realm tests, spell shields and authoritative damage. No generic fallback was substituted.

The six identities share the **geometry/timing primitive**, not their impact rules. All six require full champion P+QWER 17-dimension certification later; zero kits certified here.

## Verification status

- **QA M43 at parent commit:** previously green per historical handoff.
- **Codespaces QA QUICK at M43:** PASS, reported by user screenshot (integration / skills / items lanes). This predates M44 and does not certify these changes.
- **M44 current engine and test runner:** Not executed in Codespaces yet. No PASS assertion.
- **Node → browser sync and Chromium PvP:** responsibility of integration; NOT CERTIFIED.
- **M44 new test:** `tests/audit/v453_m44_b01_authored_projectile_travel.test.mjs`, 24 two-seat scenarios including delayed hit, no pre-impact mark, contact-specific semantics, first-body target, blocked path, spell shield, target death, Q2 energy / cooldown, deterministic V40 snapshot.
- **Cohort fast gate:** `node tests/audit/v453_m44_b01_authored_projectile_travel.test.mjs`, followed by `node tests/audit/v453_m43_b01_persistent_identity_family.test.mjs`, `node tests/audit/v453_m42_b01_owner_atomic_cohort.test.mjs`, and historic M20/M32; all results must be captured from real Codespaces execution.
- **Full historical regression** may identify legitimate earlier instant-hit assumptions. Do not ignore failures or edit assertions to fake green; triage by authoritative board semantics.
- The offline runner in branch `ops/offline-qa-dev69` now includes M44 in QUICK/FULL skills QA.

## Next M44 wave — must remain a large authored family

After first wave and regression fixes, advance with Rell, Braum and Lee follow-through; add additional distinct projectile families such as Sejuani R, Milio Q, Lucian W and champions outside B01, preserving each damage/CC/recast identity and their own exact ordering. Audit clones/decoys, hidden enemies, realm changes and terrain occlusion, source-of-truth receipts, reconnect/checkpoint and PvP simultaneous races. Do not claim the M44 big cohort finished after six slots.

## Release boundaries

GitHub Actions are disabled by user; validation runs in existing Codespaces, not GitHub Actions. Keep `dev69/skills-batch2` independent and PR #9 Draft. Integrator alone regenerates browser from Node, reconciles Items, handles assets and release. No bot-AI scope.
