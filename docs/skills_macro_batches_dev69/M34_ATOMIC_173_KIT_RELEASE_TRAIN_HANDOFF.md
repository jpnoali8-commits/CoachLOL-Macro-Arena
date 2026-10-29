# M34 — Atomic kit release train, not five-champion releases

Date: 2026-10-29. Owner: Skills on \`dev69/skills-batch2\`.
PR: [#9](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/pull/9), Draft into \`dev69/integration\`, no merge. Nothing in \`main\`, the Items branch, \`version.json\` or \`engine.browser.js\` is modified.

## Why the previous production strategy felt slow

B01 was repeatedly tested as one ability, one unique mechanic, or one champion witness per micro-milestone. The 35 real authored B01 identities and the 140 partially executable QWER slots are valuable implementation evidence, **but not 35 full kits**. Adding another few hero interactions per M-number cannot turn them into releases by itself. M34 introduces a production/acceptance contract in addition to runtime engineering.

CoachLOL remains a simultaneous-turn strategic PvP board game using LoL champion mechanics: two human owners, five champions each. Reuse deterministic **geometry, timings, damage, range, fog, CC, entities, receipts and snapshots**, but never share away champion-specific P/Q/W/E/R, forms, triggers, recasts, marks or counterplay. This is neither a frame-by-frame MOBA rewrite nor a system of anonymous generic champion skills.

## Executable release train: 173 champions, five fixed packages

- \`tools/skills_m34_atomic_release_train.mjs\` consumes the real frozen M19 champion source, real route names and runtime descriptors, and the M31 B01 authored ledger. It produces a **173 champion / 692 QWER** machine-readable matrix, not 173 hand-maintained duplicated audits.
- B01–B04 must each deliver **35 individually complete P+QWER kits**, B05 must deliver **33**, before a macro release can be flagged READY_FOR_INTEGRATOR_REVIEW.
- The atomic unit of approval is an **entire champion kit** (P, Q, W, E, R, recasts/forms and all applicable interactions). A programmer may implement multiple distinct mechanics in a shared primitive, but a green isolated mechanical test or runtime route can never mark an unfinished kit as completed.
- The package unit of delivery is a **full cohort**. Related engine primitives may be developed continuously, but there is no promotion of 2–5 partial champion kits as a "finished macro package".
- A kit must have an explicitly authored rule, no unresolved fallback, no outstanding \`m20Status: partial_executable\` or \`m20Missing\` debt, a champion-specific proof for **every P/Q/W/E/R**, and an executed proof for **each of the 17 M27 dimensions** (if inapplicable: justified, positively tested N/A). A source filename or a passing unrelated QA suite does not certify identity.
- Certifications require suites under \`tests/skills/kit_release/*.test.mjs\` executed by the real Node tool, with machine-readable \`COACHLOL_KIT_PROOF_V1\` receipts whose champion, slot, identity, scenario and dimensions match the claim. The release train runs them and fails closed. The schema is \`coachlol.skills.atomic-kit-evidence.v1\`. No claims have been submitted or retroactively invented.
- A full batch can be marked READY_FOR_INTEGRATOR_REVIEW **only when every individual kit passes**; this is still not a merge or a public release. The integrator retains Node/browser bundle synchronization and merged cross-domain QA.

Regenerate reproducibly:

\`\`\`sh
node tests/audit/v453_m34_atomic_release_train.test.mjs
node tools/skills_m34_atomic_release_train.mjs --out docs/skills_macro_batches_dev69/M34_ATOMIC_RELEASE_TRAIN.json
\`\`\`

The generated JSON is uploaded as part of the existing Skills Actions artifact alongside M19, M27 and M31. **No CSV guesses, no new PRs for micro-batches**. The detailed blocker list per champion is the working queue for the next large implementation pass.

## Gameplay engineering included in M34

New owner-only, two-turn authoritative charge interaction on the **five existing individual authored skills**:

| Champion | Independent skill identity kept intact |
|---|---|
| Xerath Q | Arcanopulse long-range charged line |
| Varus Q | Piercing Arrow charged damage/range |
| Vi Q | Vault Breaker charge-dependent displacement |
| Zac E | Elastic Slingshot reach, HP resource rather than mana |
| Galio W | Shield of Durand charge-dependent area/taunt |

\`queueBoardChargeStartV453Dev69(team,id,slot)\` consumes a tactical action and stores \`m34ChargeStateV453\` only **after** an authorized, un-stunned server commit. It does not double-pay cooldown or mana. \`queueBoardChargeReleaseV453Dev69\` derives the exact 0–2-second charge duration from \`gameTime\`, marks the issued action and double-checks the real stored state before the actual champion skill fires. Expired, forged, stunned, wrongly owned and duplicated charges fail without mana/cooldown debits. Charge state is in V40 champion snapshots; successful release consumes only its own charge.

**Important remaining work:** The older direct \`queueBoardSkillV453Dev69({chargeSeconds})\` interface is retained for existing M28/M29 fixtures; its externally supplied duration is not a trustworthy public PvP API and must be removed from any public multiplayer ingress in favor of the new two-stage interface. The client UI has not yet been wired to the two-stage control. Those five kits are **not** fully certified from this primitive, and reference numbers require patch validation.

## QA / architectural speed

- \`tests/audit/v453_m34_atomic_release_train.test.mjs\`: all 173 champions, all 692 QWER reference slots, five 35/35/35/35/33 cohorts, existing 35 B01 witnesses, counterexample forged proof rejected; 17 dimensions, **0 unjustified full certifications**.
- \`tests/audit/v453_m34_charge_lifecycle_atomic.test.mjs\`: 5 distinct charged champion mechanics × 2 PvP seats; 10 starts, 10 releases, 24 negative owner/duplicate/interruption/forgery cases, 24 deterministic snapshots. M34 does not replace each identity with a shared damage spell.
- The existing M20–M33 specialist QA, Logic QA and Projectile QA remain active. The specialist workflow now has **per-branch concurrency / cancel-in-progress** to avoid spending capacity on superseded commits.
- Produce the code, fixture matrix and docs **together in a single Git-tree commit** for future macros, run one specialist QA per finished bundle, and leave one Draft PR for the integrator. The multiple small commits needed to construct M34 are a transition, not the new target workflow.
- Every further M35+ increment should be planned by the 35-champion release train, implement all interacting skills for the group, use per-champion full-kit evidence and report *only* the number genuinely completed. Fix shared primitives once when needed; implement the diverse champion-specific behavior separately.

**Current honest completion:** B01 0/35 certified, B02 0/35, B03 0/35, B04 0/35, B05 0/33; **0/173 kits fully certified**, **0/5 macro-batches integration-ready**. Historical successfully executed QWER, unique champion witnesses and partial mechanic checks must stay visible as engineering coverage, not be promoted to finished kits. Integration QA is still blocked by the one-time Node → \`engine.browser.js\` sync owned by the integrator.

## M35 next implementation sequence

1. Treat the B01 35-row ledger as a **kit-completion backlog**, not a request for another 5-witness milestone. Resolve actual \`m20Missing\` functional debts, not just rename flags. Target the real interactive gaps in P, Q, W, E and R for as many B01 champions per committed macro as possible.
2. Expose the secure two-stage charge API and Cassiopeia tactical facing on the **authoritative multiplayer interface**, with server-disclosed, owner-only events. Keep simultaneous orders, fog/Realm boundaries, undo/receipts, interrupted spells and snapshot replay.
3. Batch related high-risk behaviors: charge & channel (five above), form & recast (Rell, Lee Sin, Fizz, Jarvan, Heimer), ally anchoring/projectiles (Milio, Lulu, Lucian, Galio, Shen), lethal/passives (Urgot, Zilean, Varus, Karthus), and item/rune/spell interactions for every affected individual kit.
4. Author full champion release-proof suites with real gameplay assertions; only then submit a READY_FOR_CERTIFICATION claim and let the CLI run them. Keep B01–B05 identity data separate, but run the whole 173-slot audit and all QWER against the shared engine in one CI.
5. Integrator handles \`engine.browser.js\` regeneration and full Skills+Items integration **once** at the macro release boundary; never merge this Draft PR from Skills.

**Hard invariant:** no champion identity deletions, no generic fallback substitutions, no false claim of "35 finished" from just a green macro scenario matrix.
