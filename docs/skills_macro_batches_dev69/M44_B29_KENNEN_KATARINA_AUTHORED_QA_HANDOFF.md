# CoachLOL Macro Arena — M44 B29 | Kennen Energy/AS and Katarina Daggers

Parent: `b15e6ecc6062fe0a9b0409498658d823cc9fac0b`, protected production branch `dev69/skills-batch2`, PR #9 **Draft, unmerged**.

## Implemented authorial behavior
**Kennen P / E**:
- Mark of the Storm (shared Q/W/E/R processor): owner-scoped third stack consumes marks, restores 25 energy, stuns for 1.25s first time, and 0.5s if the same owner stuns the same target again within six simulated seconds. Repeat ledger is snapshot-serializable.
- Lightning Rush (E): updated authored cost to 80 energy, base damage to 80/120/160/200/240 (+80% AP), secondary non-champion damage multiplier 0.65, and one +40 energy restoration per cast upon damaging at least one enemy.
- Leaving E after the existing .5s recast window (or on natural expiry) grants 50/60/70/80/90% attack speed for four simulated seconds, through the shared basic-attack interval, without permanently modifying base stats or double-awarding a buff. Direct AAs remain disallowed during the active lightning state.
- Status remains tactical contract fidelity rather than complete official attack-speed cap/windup parity; no kit certification.

**Katarina Q / P**:
- Q bounce deals the same authored magic hit to up to three distinct victims rather than diminishing damage per bounce.
- Ground dagger lands ~350 world units opposite the **first** struck unit after 1.02 simulated seconds, regardless of subsequent bounces; clamps to world board bounds and uses a walkable fallback for terrain.
- Pickup occurs only in the source owner's active combat realm, does not collect remote/cross-realm dagger positions and refunds Shunpo E based on its rank and level (78/84/90/96% of the original slot cooldown).
- Shunpo target ownership and no-second-debit recasts from B28 remain unchanged. Q's complete official missile travel/visibility is still pending.

## Files
- `engine.mjs` — authorial refinement without generic fallback.
- `tests/audit/v453_m44_b26_anivia_katarina_kennen_pvp.test.mjs` — adjust exactly two historical expectations: Q dagger landing at 1.02, and E 40 energy refund.
- `tests/audit/v453_m44_b29_kennen_katarina_fidelity_pvp.test.mjs` — 16 identity/negative scenarios each mirrored blue/red, with snapshot/checksum validation.
- This handoff.

## Candidate QA
- B26: 46/46 pass, B27: 28/28 pass, B28: 32/32 pass, B29: 32/32 pass.
- **138/138 PASS across these four focused suites** executed from exact GitHub candidate source in a V8 runtime using real map/mask JSON and in-memory Node harness adaptation.
- Do not describe this as native Node CI/browser/game-completion certification; the 48-suite full M44 regression must be executed against the committed candidate before any broader count is claimed.
- No Actions, Codespaces, worker, merge, main/integration or browser bundle modifications.

## Highest next priority — M44 B30
- Anivia Flash Frost: continuous physical travel at 950 units/s, separate per-target pass-through damage/slow from radius-225 detonation/stun, and automatic shatter at maximum range while maintaining recast/snapshot validity.
- Katarina Q first-target distance and walkability fidelity with server-authoritative visibility; real missile timing beyond the cast proxy.
- Kennen storm's target-specific hit limit and source/mark immunity; review later full kit and two-session PvP.
- Continue additional source-authored champion slots in cohort batches after stabilizing these contracts.
