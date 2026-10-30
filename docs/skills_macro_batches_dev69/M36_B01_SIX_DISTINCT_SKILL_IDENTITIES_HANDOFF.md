# M36 — B01 nine distinct authored champion slot mechanics, 35-champion cohort preserved

**Date:** 2026-10-29. **Owner:** Skills / `dev69/skills-batch2`. **PR:** #9 Draft → `dev69/integration`, no merge.

## Why this implementation matters

M35's full 35-champion queue identified partially executable QWER without an explicitly auditable authored hook. M36 addresses **nine independent mechanics in real server-side gameplay**, instead of renaming missing tags, creating an anonymous generic fallback, or inventing 35 completed kits. This is a **simultaneous-turn board strategy PvP** with two human owners of five champions each, not a frame-by-frame MOBA. Shared shape, collision, damage, status, owner attribution, fog and snapshots stay reusable; unique champion identity is authored explicitly in the kit.

## Nine separate champion skills improved

| Champion | Skill | Unique executable mechanic added |
|---|---|---|
| Xerath | E — Shocking Orb | Actual hit distance determines stun duration (0.75–2.25 simulated seconds). Native line/max-hit/range are preserved; both near and far contacts are asserted. |
| Gragas | R — Explosive Cask | Knockback propagates radially from the **explosion center**, not from Gragas. Terrain-safe existing displacement, owner attribution and snapshot state remain. |
| Sejuani | Q — Arctic Assault | Checks the **actual dash path** for champion contact and stops early at the first collision. No full-distance teleport through a hit champion. |
| Tahm Kench | W — Abyssal Dive | One paid cast schedules a **delayed, interruptible** surfacing at the designated board location; the real arrival displaces Tahm and impacts/knocks up nearby enemies once. No immediate generic dash/damage. |
| Jarvan IV | W — Golden Aegis | Counts nearby eligible enemy champions and grants an additional shield component scaled by that real count, distinct from the existing base shield and slow. |
| Urgot | Q + W — Corrosive Charge / Purge | Actual Q contact marks its victim with owner-specific expiry. W without an explicit target prioritizes that **visible, in-range marked** enemy and locks only that target for its existing three follow-up shots. Explicit W target remains player-controlled. |
| Galio | E — Justice Punch | Backstep against the aimed vector before its forward dash; contact checks the actual path and halts on the first enemy champion rather than teleporting through multiple victims. |
| Fizz | Q — Urchin Strike | On confirmed spell hit, adds its own physical **ability on-hit** packet using the item/on-hit engine, distinct from its magic damage and targeted dash; no on-hit when the primary hit is blocked. |
| Yunara | W — Arc of Judgment / Arc of Ruin | Base W remains broad spinning bead; during her existing R Transcendent state it becomes a **narrower laser** with increased damage, resolved through the native directional lane and enemy collision. |

The engine changes preserve individual skill costs, range, damage types, snapshots, authoritative PvP, and legacy regression tests. Each new marker/key corresponds to an observable effect, not just a label. Some numerical values are discrete board adaptations pending patch-level audit.

## QA and certification

- New test: `tests/audit/v453_m36_b01_six_authored_identity_families.test.mjs` — six authored scenarios × both human PvP seats = 12 scenarios / 12 deterministic snapshots, checks actual geometry, duration, delayed resolve, ownership, damage, and Q→W target linkage.
- Additional test: `tests/audit/v453_m36_three_more_real_identity_slots.test.mjs` — Galio E, Fizz Q and Yunara W+R variants × both human seats = six native identity scenarios with six deterministic snapshots, no generic-fallback replacement.
- Existing M20–M35 specialist tests must remain green. `engine.browser.js` is owned by the integrator and deliberately not touched here.
- M35's 35 champion / 140 QWER work queue and M34's 173 / 692 audit remain the release acceptance gates.
- **No champion P+QWER kit is claimed complete**. B01 is still 0/35 fully certified and total roster 0/173; these six specific authored skill mechanics are implemented, not six certified kits.
- The integrated CI may still fail at the existing integrator-owned browser regeneration diff. Do not mark npm full integration as passed until independently verified.

## Next engineering priorities

Continue **family-wide** on the fixed full B01 queue: Alistar W→Q contact/counterplay, Galio E authored backwards-then-forward terrain movement, Fizz Q on-hit true interactions, Locke/Yunara form variants, sustained W/R channel correctness, spell/item/rune cross-combination and full P+QWER proofs. Build one macro code+QA+handoff bundle per group, not tiny PRs. Never remove identities or swap champion skills for generic damage placeholders. Integrator owns merged QA and browser synchronization.
