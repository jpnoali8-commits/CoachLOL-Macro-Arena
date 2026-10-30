# M44 B03 — 12 individually authored projectile identities

2026-10-29. Branch `dev69/skills-batch2`, PR #9 Draft to `dev69/integration`. No merge.

## Production (not full-kit certification)
Engine commit `f112f6132f21c026718f3307b46e682bf82884ad`, collision/ownership fix `9aaf2b68cb76d93391bf062fc31eb83f0949809b`.

The twelve explicit champion+slot contracts:
1. Ashe R — champion-first travelling arrow, distance stun, collision-centered splash and slow (splash may damage minions).
2. Morgana Q — Dark Binding first-body root on real contact.
3. Blitzcrank Q — terrain-checked Rocket Grab pull after first contact.
4. Brand Q — Blaze DoT and stun only against preexisting Blaze.
5. Dr. Mundo Q — first-body cleaver with current-HP-dependent damage and slow (training scaling, not final Riot formula).
6. Olaf Q — line axe slow and finite owner-only pickup reducing Q cooldown.
7. Sivir Q — outbound and returning physical boomerang with separate hit receipts per leg.
8. Kog'Maw Q — true first-body contact applies the existing owner-scoped resistance shred.
9. Tahm Kench Q — slow, owner Taste stacks, conditional consumption into stun.
10. Nidalee (human) Q — distance-scaled spear with Hunted and team-scoped true-sight on impact.
11. Varus Q — charged/empowered piercing projectile; Blight detonation only on actual hit. Never inherits Varus R's minion-pass or spreading root.
12. Elise (human) E — Cocoon first-body collision with stun; no false launch CC.

No generic fallback or new infrastructure. Existing M44 B01/B02 interactions remain intact. The engine uses shared swept segment timing and each spell's individual effects. Browser code and Items untouched.

## Actual source-code QA in ChatGPT
- Complete real `engine.mjs` compiled and executed inside V8 with real map/masks. Real `Arena` instances, not a mock scheduler.
- `M44 B01` **34/34 PASS**, `M44 B02` **18/18 PASS**.
- `M44 B03` **106/106 PASS** across both human teams: launch vs contact, spell shields, minion interception/Ashe splash, hard terrain, V40 snapshots, Sivir outbound/return, Olaf pickup, Brand pre-Blaze, Tahm Taste and Varus Blight/R isolation.
- This is an isolated JS runtime, **not native Node execution**. `npm test`, browser parity, Chromium, multi-session PvP and 17-dimension full kits are **NOT_RUN**.

## Next
Expand further authored identities and correct high-severity regressions immediately. Full integrated QA remains at completed champion+skills milestone before release. PR #9 remains Draft; no merging main/integration, no Actions/Codespaces/worker or new infrastructure.
