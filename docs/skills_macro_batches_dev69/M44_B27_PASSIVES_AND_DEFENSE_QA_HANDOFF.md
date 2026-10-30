# CoachLOL Macro Arena — M44 B27: Anivia, Katarina, Kennen passive contracts

## Branch / isolation
- Parent: `6306fedfb61f872d440391787fe7168e80ec08ff`, branch `dev69/skills-batch2`, Draft PR #9, **NO MERGE**.
- Files: engine.mjs, B26 regression fixture, new B27 test suite, this handoff.
- Untouched: engine.browser.js, integration, main, version, items, GitHub Actions and Codespaces.

## Authorial mechanisms (WIP)
- **Anivia Rebirth:** initial lethal damage starts a six-second, attackable egg on the existing controlled actor, without death credit. The egg cannot act; its destruction pays one real death. Surviving until the deterministic simulation-time deadline returns with 35% max HP. Cooldown 240s; egg HP is a 60% max HP board approximation. Not full patch fidelity.
- **Katarina Voracity:** real champion kill or eligible assist reduces the absolute cooldown deadlines for Q/W/E/R by 15 seconds, floored at current game time. Non-participation and minion kills do not trigger. The same source-owned champion handler applies to possessed Katarina on Viego.
- **Kennen W passive:** every fifth successfully damaging basic attack while W is learned adds source-owned Mark of the Storm via shared Q/W/E/R mark processor; deals rank-scaled bonus magic damage. No onhit recursion or automatic artificial basic attacks.
- **Kennen R bonus defense:** +25/50/75 armor/MR, active only during storm and computed through shared derived stats, never written to baseline attributes. Impacts actual damage mitigation.

## QA
- Evaluated exact candidate engine and both automated suites in V8 using repository map/mask data.
- Revised B26 bilateral suite: **46/46 PASS**. Viego must actually kill Anivia's egg before taking a soul.
- New B27 bilateral suite: **28/28 PASS** (14 cases × blue/red), including snapshot/checksum reconstruction after every scenario.
- **74/74 PASS across these two suites.** No unverified 1,652 historical-case claim. Native Node, full M44 regression, two-browser sessions, integrated multiplayer, QA visuals and full match simulation were NOT run.
- No complete champion kit certified. Milestone is partial source-authored parity and needs comprehensive QA later.

## B28 follow-up
- Recastable traveling Anivia Q and precise source hit/Chilled rules.
- Allow Katarina E to target her grounded dagger positions; refine pickup/damage and radius.
- Kennen E collision/AA restrictions and third-stack CC immunity behavior.
- Continue next multiple-champion cohort through authored registry without generic fallback.
