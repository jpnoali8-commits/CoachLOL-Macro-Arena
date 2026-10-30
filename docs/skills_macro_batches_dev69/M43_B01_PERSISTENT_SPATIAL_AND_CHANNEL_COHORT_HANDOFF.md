# M43 B01 — Authored persistent spatial and channel-counterplay families

Date: **2026-10-29**. Repository: `jpnoali8-commits/CoachLOL-Macro-Arena`.
Exclusive Skills branch: **`dev69/skills-batch2`**.
Existing **PR #9 Draft**, target `dev69/integration`, **NO MERGE**.
Previous M42 HEAD: `7e8737bedd24a39e916f7942b908aa9822b66b57`.
Tested M43 code HEAD: **`e3cc0d91893b64db55d56bb174b04e0a3dcd8650`**.

## Production principles

- CoachLOL is a **simultaneous-turn tactical board game**, two human
  players controlling all ten champions (five per side), **not a MOBA RTS**.
- This M43 batch improves **ten distinct champion identities**, using
  shared deterministic temporal, collision and combat-realms primitives
  but **never generic fallback abilities**.
- No `engine.browser.js` or `version.json` edits. Integrator owns
  Node → browser regeneration.
- No release or individual champion kit certification. Existing
  `m20Status:'partial_executable'` remains truthful.

## Family A — delayed identity, vision and interrupts (four champions)

1. **Quinn W Heightened Senses** (one finite owned `m43_quinn_heightened`
   temporal object per committed cast):
   initial nearest visible champion can receive Harrier; while the
   short-lived watch remains, one newly *visible*, in-radius,
   same-realm and unobstructed enemy per tick can acquire its own
   Harrier mark. A stable `hitIds` list prevents repeat selections.
   No omniscient ID disclosure or indefinite vision after expiry.
2. **Heimerdinger R+E upgraded grenade cluster**:
   own timed five-grenade centers; each enemy is damaged once.
   A real center hit (≤95 board units from an eligible center)
   stuns; valid fringe impact (≤155) slows instead. Terrain and
   spell shield protect from the secondary CC. Normal E and other
   upgrade identities still use their existing authored handlers.
3. **Mel Q Searing Brilliance volley**:
   retains the already authored multiple timed shots and per-shot
   `m30ProjectileReceipts`. An enemy behind the first blocked
   body cannot be selected as a fallback from that same projectile.
   Adds a distinct `blocked` receipt for collision replay/audit.
   Only real landed projectiles apply their own Overwhelm marks.
   M42 Mel R visibility/mark authorization remains enforced.
4. **Viktor R Chaos Storm interruption**:
   a canceled temporal enemy channel receives `m43InterruptedAt`
   before being removed from the active queue, and the authoritative
   temporal scheduler refuses to reinsert canceled channel objects
   into `keep`. Prevents resurrected Requiem/artillery/cone
   channels on interrupted/captured iterator state.

## Family B — spatial hazard persistence and counterplay (three champions)

5. **Varus E Hail of Arrows**:
   the existing owner-authored ground effect continues to apply
   anti-healing to actual entrants, **and now applies slow to late
   entrants**, with a finite duration and same-realm checks. No
   retroactive or endless buff outside the zone.
6. **Alistar E Trample**:
   the owned temporal damage zone now updates to Alistar's current
   board cell each tick; follow-up Trample stacks apply near the
   caster rather than the original cast cell. Stops dealing damage
   when the caster is dead.
7. **Braum R Glacial Fissure**:
   the persistent fissure slow respects the real authored line
   plus obstacle collision from its origin to the contacted enemy,
   instead of applying through blocked terrain. The initial R
   impact and champion-specific CC are untouched.

## Family C — moving attack and supportive zones (three champions)

8. **Corki E Gatling Gun**:
   on each discrete simulation tick, the direction vector remains
   that of Corki's original authored cast but its origin follows
   Corki's current board position. Actual front-line contacts
   refresh individual `m26CorkiShred` stacks; victims behind terrain
   cannot receive a line hit. Ends if Corki dies or loses skill action
   authority.
9. **Lucian R The Culling**:
   physical pulse hits on its locked authored firing line additionally
   check real obstruction on **each** time step; the ordinary
   authorized hit/damage and channel duration remain unchanged.
10. **Milio W Cozy Campfire**:
   in the existing owner-centered board adaptation, the aura
   now follows its owner for periodic ally healing/range effects,
   rather than leaving a duplicate ghost heal zone at the cast
   coordinate. Healing ceases when the owner is dead.

## Mandatory specialist QA / code-HEAD results

- [Skills M43 `40932803458`](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40932803458):
  **PASS**, zero failures, same source-code commit `e3cc0d918...`.
  - `tests/audit/v453_m43_b01_persistent_identity_family.test.mjs`:
    **12/12** two-human-seat scenarios, 12 V40 snapshots,
    8 negative checks, four champion identities.
  - `tests/audit/v453_m43_b01_secondary_hazards.test.mjs`:
    **6/6** scenarios, six V40 snapshots, four negative checks,
    three champion identities.
  - `tests/audit/v453_m43_b01_mobile_geometry_family.test.mjs`:
    **6/6** scenarios, six V40 snapshots, four negative checks,
    three champion identities.
  - Combined: **24/24** new scenarios, **24/24** stable V40
    snapshot checks, **16** negative checks, **10** distinct champions.
  - Historical gates still ran: M20 **280/280** QWER receipts;
    M32 **280/280** atomic commit cases; M42 **280/280** negative
    ownership boundary across **35 B01 champions** and both seats.
- [Logic `40932811303`](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40932811303):
  **PASS**.
- [Projectiles `40932811320`](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40932811320):
  **PASS**.
- [Integrated `40932811307`](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40932811307):
  **FAIL** at integrator-owned `Verify official Node to browser
  regeneration`; the full `npm test` milestone remains **SKIPPED**.
  No sync was attempted on Skills branch.

### Cohort certification gate

The official M35 queue remains **35 champions**, 35 passives and
**140 authored QWER**; its full-kit certification requires 17 dimensions
per champion. **0/35 fully certified**. **20 unresolved historical
`m20Missing` tags** remain. M43 did not retire tags just because
an isolated behavior passed; full parity and counterplay proof is still
missing. Globally the M34 gate reports 173 champions, 692 QWER,
0 fully certified, 369 training fallback slots beyond B01.

In particular, a working Quinn W sight watch is **not** an entire
Heightened Senses passive implementation; the Heimer E upgraded
grenades still require complete item/projectile/terrain parity;
the Mel Q initial cast still uses its pre-existing authored
approximation; none of these constitutes a full kit release.

## Suggested M44 big-cohort priority

Do not change focus to bot AI or reimplement generic LoL skill
scripts. From the remaining M35 debt queue, prioritize **true
authored projectile travel and two-stage hit authority**, e.g.
Lee Sin Q Sonic Wave → Resonating Strike, then integrate
visibility/realm/defensive response races with other projectiles and
trap/decoy families across the B01 roster. Audit all 35 active kits
and both PvP seats; use large authored families but preserve each
individual champion's parameters and counterplay.

Branch and PR ownership remain unchanged. **DO NOT MERGE #9.**
