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

## M44 collision-identity follow-through — 2026-10-29

Engine commit `66f4316`; new test commit `985aec8`. HEADs must be rechecked before edits.

- Braum Q: first real enemy body, only one Concussive Blows stack, no beam piercing.
- Quinn Q: Valor stops on first body; primary alone receives Harrier and current board blind/slow approximation; physical splash hits other nearby enemy entities (210 units) without duplicating marks or CC. Accurate nearsight/per-vision semantics remain a *champion-identity debt*, never label full kit certified.
- Varus R: ordinary minion waves no longer absorb this champion-tether ultimate; champion-shaped decoys can intercept it; chain starts only from a real champion struck, not a decoy.
- Rell Q: removes existing damage shields before applying its own damage, respects spell-shield counterplay, continues through multiple enemies.
- Lee Sin Q1/Q2: a minion that was actually hit and marked can be resolved during the Q2 queue and authoritative execution; cost/cooldown remains champion-owned.
- `tests/audit/v453_m44_b01_authored_projectile_travel.test.mjs` expanded from 24 to 34 bilateral cases. Its full engine execution is still **NOT_RUN** in this session.
- Isolated real-code QA: **14/14 PASS**, with the real exported `skillshotHitsV42` and real `advanceBoardTemporalV453Dev69` method, and mocked Arena dependencies. Does not validate complete match, snapshots, 17-dimension P+QWER kit certification, or Node/browser parity.

## Verification status

- **QA M43 at parent commit:** previously green per historical handoff.
- **Historical M43 quick QA:** PASS per user screenshot; predates M44 and cannot certify current code.
- **M44 targeted ChatGPT QA (2026-10-29):** PASS 14/14 isolated blue/red scenarios by executing the actual M44 temporal scheduler and projectile collider with mocked arena dependencies; this validates focused collision semantics, not the complete engine or browser.
- **M44 full Node engine regression:** NOT_RUN; intentionally deferred until the champion/skills milestone is complete, while new authored regressions remain mandatory to avoid accumulating faults.
- **Node → browser sync and Chromium PvP:** responsibility of integration; NOT CERTIFIED.
- **M44 new test:** `tests/audit/v453_m44_b01_authored_projectile_travel.test.mjs`, 34 two-seat scenarios (10 new specific regressions) including delayed hit, no pre-impact mark, contact-specific semantics, first-body target, blocked path, spell shield, target death, Q2 energy / cooldown, deterministic V40 snapshot.
- **Cohort fast gate:** `node tests/audit/v453_m44_b01_authored_projectile_travel.test.mjs`, followed by `node tests/audit/v453_m43_b01_persistent_identity_family.test.mjs`, `node tests/audit/v453_m42_b01_owner_atomic_cohort.test.mjs`, and historic M20/M32; all results must be captured from real Codespaces execution.
- **Full historical regression** may identify legitimate earlier instant-hit assumptions. Do not ignore failures or edit assertions to fake green; triage by authoritative board semantics.
- No Codespaces, GitHub Actions or Work is required for the current production workflow. The existing executor remains optional; no infra branches are needed for M44 code delivery.

## Next M44 wave — must remain a large authored family

After first wave and regression fixes, advance with Rell, Braum and Lee follow-through; add additional distinct projectile families such as Sejuani R, Milio Q, Lucian W and champions outside B01, preserving each damage/CC/recast identity and their own exact ordering. Audit clones/decoys, hidden enemies, realm changes and terrain occlusion, source-of-truth receipts, reconnect/checkpoint and PvP simultaneous races. Do not claim the M44 big cohort finished after six slots.

## Release boundaries

GitHub Actions are disabled by user. Focused execution is performed directly in ChatGPT when possible; comprehensive Node/browser QA remains NOT_RUN until the full Skills milestone. Keep `dev69/skills-batch2` independent and PR #9 Draft. Integrator alone regenerates browser from Node, reconciles Items, handles assets and release. No bot-AI scope.
