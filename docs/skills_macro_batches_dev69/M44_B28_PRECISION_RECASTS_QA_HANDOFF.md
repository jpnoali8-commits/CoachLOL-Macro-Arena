# CoachLOL Macro Arena — M44 B28 | Authored Recasts and Dagger Blinks

Parent `bb39fecda730a8ee04151e33c63a88d27caf8e18` — branch `dev69/skills-batch2`, PR #9 **Draft, never merged**.

## Changes
- Anivia Q now records a source-owned in-flight token, can recast after a 0.25 s windup, deterministically interpolates projectile location at reactivation, detonates once via the existing temporal AoE and shared Chilled/stun contract, with **zero extra resource debit**. Automatic impact remains at the B26 fixed 0.5 s board horizon; this is not exact 950-unit/sec Riot ballistic parity.
- Katarina E can target **only existing owner ground daggers**, by server ID `dagger_<id>` or near-click within 125 board units. It validates range, ownership, realm, walkability, expiry and cast eligibility before debit, revalidates on commit, teleports, uses source-owned pickup and applies authored E damage to the nearest enemy champion. Enemy unit E is unchanged. Daggers now keep launch realm in snapshots. Cross-wall unit collision and targeting fidelity remain under review.
- Kennen E now has an explicit two-second no-basic-attacks state and can end via no-cost recast after 0.5 simulated seconds. AAs are blocked both by action gate and direct attack handler. Existing single-pass contact damage and mark rules are preserved; energy restoration and bonus AS need a later targeted pass.
- No generic QWER fallback or parallel Sylas/Viego executor added; original-source registry continues to govern copied Q/W/E/R.

## QA
- In-memory V8 evaluation of actual candidate `engine.mjs` with repository map and masks, blue/red PvP, per-case snapshot/checksum reconstruction.
- B26: **46/46 PASS**; B27: **28/28 PASS**; new B28: **32/32 PASS**.
- **106/106 PASS** across 3 focused suites (not yet a claim of complete B01–B28 QA).
- No native Node, browser, two-human live network, or full match run; no champion certified.

## Isolation
Only `engine.mjs`, `tests/audit/v453_m44_b28_precision_recasts_pvp.test.mjs` and this handoff changed. No changes to `engine.browser.js`, `version.json`, Items, `main` or `dev69/integration`. No Actions, Codespaces or worker. No merge.

## B29
Implement authentic multi-tick Anivia Q ballistic passage/hit ledger and wall interruption; refine Katarina dagger placement, Shunpo blink and on-hit treatment; Kennen E energy refund/attack-speed release, re-stun duration, R per-target cadence; continue missing champion source identities.
Sources: https://wiki.leagueoflegends.com/en-us/Anivia ; https://wiki.leagueoflegends.com/en-us/Katarina ; https://wiki.leagueoflegends.com/en-us/Kennen .
