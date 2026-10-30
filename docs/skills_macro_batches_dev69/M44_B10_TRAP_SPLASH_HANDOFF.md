# CoachLOL Macro Arena — M44 B10: trap trigger versus secondary splash

Date: 2026-10-29. Dedicated head branch `dev69/skills-batch2`, PR #9 to `dev69/integration` remains **Draft / unmerged**. Origin M44 B09 HEAD `614dd69986940cd78c0720a367b9a19bdcafc535`.

## Authored engine fix — four champions, no new spell slots

**Root cause**: the M16 automatic trap scheduler obtained `candidates` strictly within the trap's *trigger radius*, then reused that already-clipped list for *secondary explosion and CC areas* that are intentionally larger. The secondary area could never reach legitimate targets outside the smaller trigger radius. This affected separate, champion-owned ability identities.

**Implementation**: `engine.mjs` adds `m44B10TrapSplashTargetsV453Dev69(owner,trap,radius)`. It queries actual enemy combat entities independently from the triggering candidates, checks HP, spawn time, combat realm, ownership and the requested *authored* radius, then sorts by stable ID for reproducibility. It does **not** invent a new generic champion skill or alter the trap placement, charges, arm time or expiry logic.

1. **Teemo R — Noxious Trap**: secondary poison/slow splash now queries a proper 250-unit radius, not only the smaller 145-unit activation radius. The existing real DoT effect remains.
2. **Jhin E — Captive Audience**: initial slow around the triggering lotus now covers its authored 180-unit radius rather than being clipped to the 135-unit trigger radius. The already-existing delayed 220-unit detonation is unchanged.
3. **Shaco W — Jack in the Box**: a triggered box applies its fear to eligible enemy champions in a 270-unit area instead of only the first triggering victim. The previously existing miniature box summon remains once per trigger.
4. **Maokai E — Sapling Toss**: the explosion checks its distinct 250-unit radius, and the existing 320-unit brush-empowered radius, rather than being pre-clipped to the 175-unit trigger radius.

These are **four corrected existing spell identities, zero new P/Q/W/E/R slots, and zero certified full kits**. No anonymous damage fallback, no gameplay balance or item changes.

## Executed QA (ChatGPT JavaScript V8, actual authoritative engine)

Actual `engine.mjs`, `data/coachlol_map_v6.json` and `data/masks_128.json` loaded into JavaScript V8. All relevant snapshots were checked with `checksumV40` and `Arena.fromSnapshotV40`. Tests are directional fixtures, not production certification.

New executable `tests/audit/v453_m44_b10_trap_splash_pvp.test.mjs`:
- 4 champions × blue/red × (secondary **inside splash but outside trigger**, secondary **outside splash**, and secondary **in a separate combat realm**): **24/24 PASS**, 24 checksums/snapshot roundtrips.
- Fixtures use actual trap creation and game-clock M16 resolver; they do *not* exercise full user casting/connected two-client networking. Separate realm isolation is enforced in a fixture stub, not a full Mordekaiser R browser/network test.

All legacy M44 scoped suites were rerun on the B10 engine:
- B01: 34/34 PASS
- B02: 18/18 PASS
- B03: 106/106 PASS
- B04: 100/100 PASS
- B05: 104/104 PASS
- B06: 16/16 PASS
- B07: 74/74 PASS
- B08: 48/48 PASS
- B09: 58/58 PASS
- B10: 24/24 PASS
- **Combined M44 B01–B10: 582/582 scoped PASS; 0 full kits certified.**

**NOT_RUN**: native `node --check`, repository-wide `npm test`, browser bundle sync/`engine.browser.js` parity, Chromium e2e, two connected human PvP clients, full 17-dimension P+QWER champion-kit gate, complex mixed-champion fog/clone/Rift interactions and exact current Riot balance verification. The V8 runtime successfully parsed/evaluated the complete engine but is not a substitute for those gates. No GitHub Actions, Codespaces or worker was triggered.

## Commits and boundaries

- Engine fix: `e010f99638893c02769be7e7bd8547d1a8371856`
- Regression suite: `937278ac6a706342846bff5802324e1a7ee63078`
- Handoff: this commit.

Only `dev69/skills-batch2` changed. Do not touch `main`, `dev69/integration`, `engine.browser.js`, `version.json`, items, workflows, or merge PR #9.

## Recommended B11 priority

Produce a **larger authored multi-champion cohort**, not a second generic trap abstraction: Twitch P/W/E venom stacks, Teemo W/E and R counterplay, Caitlyn Q full/reduced pass-through + W headshot interaction, Shaco E + Box/clone, Nidalee hunted interaction, Neeko W clone/disguise targetability, Orianna Ball/passive and persistent statuses. Confirm real spell identities against patch references; commit only tested contracts, preserve names/owner-scoped ledgers, terrain, fog, simultaneous-order constraints, consumptions, death, recasts and V40 snapshots. Existing partially implemented M16 and M15 abilities must be **extended rather than overridden**. Prefer a coherent larger champion batch, but report individual slots separately and do not inflate full kit counts.

Sources for qualitative identity only (not exact numerical certification):
- https://www.leagueoflegends.com/en-us/champions/teemo/
- https://wiki.leagueoflegends.com/en-us/Shaco
- https://wiki.leagueoflegends.com/en-us/Jhin
- https://wiki.leagueoflegends.com/en-us/Maokai
