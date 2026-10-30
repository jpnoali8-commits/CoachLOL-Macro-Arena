# CoachLOL Macro Arena — M44 B25 | Thresh R, Pyke R, Evelynn Q

## Branch / base
- Parent (B24): `cb5dc929944ee8727127083d716989c7ee67f7f7`.
- Branch: `dev69/skills-batch2` exclusively; PR #9 **Draft**, base `dev69/integration`; **NO MERGE**.
- Original engine.mjs blob at B24: `97f626a9db05055a08f093a1902b250082ac026a`.
- New B25 engine candidate blob: `bd7b09e157b18917480ee9b31a2b58814a068d3a`.
- New test source blob: `0befe98a47e9204272d58b108e1560fd963712eb`.
- Exactly 3 files in this commit: `engine.mjs`, `tests/audit/v453_m44_b25_thresh_pyke_evelynn_pvp.test.mjs`, and this handoff.
- No changes to `engine.browser.js`, `version.json`, items, Actions, Codespaces, other branches, or main.

## Three authentic authored slots, NOT complete champion kits
The `M44_B25_KITS_V453` table is prioritized by `m44B14DOriginalBoardRuleV453` before previous M44 kit tables; all new behaviors are source-authored and refuse unrecognized B25 identities before committing. No generic fallback is used for these identities.

1. **Thresh R — The Box**: creates five independent, server-owned, serializable spectral perimeter segments centered at the cast location. The first wall broken by an opponent deals magic damage and slow; later wall breaks slow without more damage. Each segment breaks once, no friendly damage, spell-shield support, realm checks, fixed duration. The polygon/contact method is a **board geometry approximation**, not full Riot visual/patch parity or a physical movement-blocking collider.
2. **Pyke R — Death from Below**: selects an on-board target point within range, produces a deferred 0.5s cross-like impact shape; champion targets below rank-scaled threshold can be truly executed; shielded/higher HP targets are treated separately. On a successful execute, a 20s no-cost/no-CD recast is available; authorized landing movement respects terrain/realm. No phantom reset if no target was executed. **Important omissions**: authoritative Your Cut/gold sharing, exact Riot lethality/HP rank formula, complete collision/jump parity, kill credit and special death prevention interactions have not been certified.
3. **Evelynn Q — Hate Spike**: first directed projectile-like lane strike applies a per-owner 3-proc mark **only on genuine unblocked hit**; three individually timed 0.5s recasts can fire without another mana or cooldown debit; targeting checks range, fog, realm and walls; no recursion on proc damage. The initial hit is resolved tactically/instantaneously; actual missile travel and full Riot targeting priorities remain **partial**.

## Engine integration and invariants
- Source-authored normal champion dispatch and Viego possession share the same original B25 Q/W/E implementation. Sylas Hijack uses original Pyke R and the authorized Pyke recast even after the temporary source identity ends; no champion-specific copy allowlists.
- All first-stage casts go through existing authoritative `performActionV40` debit exactly once. Recasts use no resource debit; cooldown and mana remain unchanged.
- Deferred effects are `boardTemporalV453Dev69` JSON records with deterministic ordering, realm checks and stable per-actor ownership.
- Spell-shield negative test found/fixed in B25: blocked Evelynn dart no longer seeds a mark.
- Future integration must re-check exact current branch HEAD before applying changes; do not silently overwrite another actor's work.

## QA actually executed on the exact candidate blob
**V8 runner**, loading the exact `engine.mjs` blob above plus genuine `data/coachlol_map_v6.json` and `data/masks_128.json` from this branch; Node `assert` and file access were adapted in-memory for offline execution. All cases were executed against live `Arena`, including snapshot/checksum restoration (in existing suites).

- **43 / 43 historical M44 suites B01–B24**: **1,608 / 1,608** scenarios passed, **0 failures**.
- **1 / 1 new B25 suite**: 22 distinct scenarios mirrored both PvP seats = **44 / 44** passed, **0 failures**.
- **Combined: 44 / 44 suites, 1,652 / 1,652 scenarios PASS.**
- Includes Thresh perimeter/friendly-fire/one-hit/realm, Pyke X/execution/low/high HP/spell shield/20s recast/invalid target, Evelynn Q first hit/triple no-cost reactivations/mark/visibility/spell shield/realm, Sylas borrowed Pyke R and Viego possessed Evelynn Q.
- No GitHub Actions minutes used. **NOT_RUN**: native `node --test`/`npm test`, browser tests, regenerated `engine.browser.js`, networking/two genuine remote browser players, end-to-end complete matches, GLB assets and full official 26.21 fidelity. These gates remain for the later integrator and certification milestone.
- No champion was upgraded to `certified` by this milestone.

## Next production priority (M44 B26)
Continue source-authored missing identities in multi-champion cohorts after verifying the actual current registry first. For Thresh, Pyke and Evelynn, prioritize refining remaining P/QWER identities and precise PvP interactions (including Pyke gold mechanics and Evelynn projectile targeting). Preserve original-executor reuse by Sylas/Viego, bilateral snapshots and exact one-time debit. Leave the PR Draft and do not integrate/browser-sync without authorization.
