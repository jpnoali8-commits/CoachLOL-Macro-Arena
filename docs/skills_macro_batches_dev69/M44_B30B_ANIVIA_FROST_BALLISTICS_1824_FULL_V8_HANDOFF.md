# CoachLOL Macro Arena — M44 B30B | Anivia Flash Frost authoritative ballistic pass/shatter
**Parent:** `c64cc81747ecd622b6134c51449d7ff4e22cd549` (M44 B30A). **Branch:** `dev69/skills-batch2`; PR #9 remains Draft and unmerged.

## Source-authored implementation
- Anivia Q travels 950 game-world units/s over 1100 range, with 220 missile width, no instant cast-global hit, one source-owned passage hit ledger per target, and a separate 225-radius shatter on early recast or maximum range.
- Passage deals [50,70,90,110,130] (+25% AP) magic damage, 3-second Chilled and 20%/30%/40% slow according to R rank. Detonation independently deals [60,95,130,165,200] (+45% AP), refreshes Chilled/slow, and stuns 1.1–1.5 seconds by Q rank.
- Official Q mana [80,85,90,95,100] and cooldown [11,10,9,8,7]. Recast allowed after existing 0.25 simulated-second gate; no second mana/cooldown debit. Uses actual traveled projectile distance independent of click-distance; flies to maximum range and shatters.
- Swept segments compare with authoritative obstacleLine, resolve a deterministic first barrier boundary with bisection, and do not damage enemies behind the barrier. Launch-realm ownership remains stable even if the caster dies.
- B30 projectile ledgers `m44B30Direction`, `m44B30Distance`, `m44B30PassHits` and `m44B30RecastDistance` are plain-data snapshot/checksum compatible. No generic fallback; existing Sylas/Viego original-source reuse stays intact.
- Prior B26 and B28 tests were updated, not deleted, solely for the intentionally changed official source contract: Q5 mana 100 instead of 80; first passage chills/slows without premature detonation stun; .25-second recast position uses world distance (237.5 units) rather than arbitrary half-click interpolation; earlier burst target moved to match the new physical position.

## Full M44 V8 candidate QA
- Candidate `engine.mjs` blob: `17699719259ba4257c0c337268777005b92c5325`.
- New B30B test blob: `333a99d890a6e7c3a0dacd287b96638fa2c21581`. 11 authored cases × 2 teams = **22/22 PASS**. Covers speed, width, range, mana, pass-only slows, multi-target sweeps, no re-hits, automatic burst, recast, expiry, shield two-stage damage, deterministic obstacle interception, caster death, V40 snapshot reconstruction and mirrored PvP.
- Existing B30A: **12/12 PASS**; all historical 48 M44 suites B01–B29 rerun on the candidate with updated B26/B28 assertions: **1,790/1,790 PASS**.
- **TOTAL 50/50 M44 suites, 1,824/1,824 mirrored PvP scenarios, zero failures**, executed in isolated JS V8 using exact candidate engine source, real repository map/mask JSON, original authored test bodies and equivalent in-memory adapters for Node ESM/fs/assert. The 48-suite history was not skipped or merely inferred.

## Restrictions and pending gates
- Not native `node --test`, full `npm test`, multiplayer-over-network integration, visual/browser/GLB validation, actual game release test or full official P+QWER champion certification. Do not promote Anivia, Kennen or any kit to certified.
- No Actions, Codespaces, workers, merges, force-push, or changes to `engine.browser.js`, `version.json`, `main`, `dev69/integration` or Items. PR #9 Draft remains staging for Skills.
- Riot/Wiki source: https://wiki.leagueoflegends.com/en-us/Anivia and https://www.leagueoflegends.com/en-au/news/game-updates/patch-10-25-notes/
- Next authored priority: Katarina Q trajectory/visibility/fallback and E on-hit; then larger cohorts of distinct champion P/Q/W/E/R slots with mirrored QA, leaving final full-platform gates to milestone integration.
