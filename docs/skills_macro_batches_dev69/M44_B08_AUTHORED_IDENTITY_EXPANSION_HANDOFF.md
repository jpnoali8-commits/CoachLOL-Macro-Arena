# CoachLOL Macro Arena — M44 B08: authored identities, seeds, shielding, ball and recasts

Date: 2026-10-29. Exclusive branch `dev69/skills-batch2`, PR #9 remains Draft to `dev69/integration`. No merge, Actions, Codespaces, worker, user-local work.

## Scope: ten new authored slots across eight champions

| Champion | Slot(s) | Authored board mechanic | Remaining work |
|---|---|---|---|
| Orianna | E, R | Command: Protect sends Ball from existing origin to a real allied champion, applies travel damage, grants shield and attaches Ball to carrier; R shockwave follows Ball at resolution, damages and terrain-checks displacement/stun. Ball snaps to self when carrier dies or exceeds leash. B07 Q/W now resolve from canonical Ball position. | Passive Clockwork Windup, exact projectile timing, Ball auto pickup, exact shielding values and subtle interruptions |
| Karma | R | Mantra arms next Q for a finite owner-scoped window, without second Q cost; Soulflare Q receives extra power and schedules a *separate* delayed burst on impact or unobstructed endpoint. | W/E empowered contracts, passive cooldown refund, exact ranks and visuals |
| Senna | Q | Piercing Darkness travels along a single bounded line, deals physical damage to opponents and heals intersected friendly champions from the same saved aim. | Target-unit/ward anchors, passive souls, full timing and ally effects |
| Thresh | W | Dark Passage places a location-owned temporary lantern; shields each eligible ally once; second authorized order pulls an allied champion standing by the lantern back to Thresh without second mana/cooldown, validating terrain at commit. Caster never dashes to place lantern. | Full ally acceptance workflow, lantern vision and counterplay |
| Zyra | W, Q | Rampant Growth persists up to two seed positions; Deadly Spines is a perpendicular rectangular strike that consumes nearby valid seeds, germinating owner-specific spitting plants that autonomously attack for three ticks. | E seed interaction, full plant species/lifetime/targeting, passive seed generation |
| Nautilus | R | Depth Charge is a real delayed target-bound strike; secondary champions crossing the route take reduced damage and knockup, target takes full shock. | Full tracking cadence, obstacle treatment, proper passive+W+E contracts |
| Renata | E | Loyalty Program uses *one* range-clipped ray; shields allied champions hit, damages and slows enemies. | W rescue, R hostile frenzy, exact E two-bolt behavior |
| Pyke | E | Phantom Undertow makes the legal dash immediately and runs a delayed backtracking phantom with real collision/stun; never uses the generic movement handler twice. | R execute resets, passive grey health, exact charged Q hold timing |

All ten slots are explicit in `M44_B08_KITS_V453`, with skill-specific scheduling and resolution. No universal anonymous fallback introduced. Damage coefficients/durations are board-adaptation prototypes, **not** complete live League parity.

## Existing-slot corrections

- **Draven R2**: explicit player order reverses outbound Whirling Death in the temporal engine, checks original axe ID/owner, no extra mana or cooldown.
- **Renata Q2**: Handshake pushes the original bound victim; sweep checks for secondary enemies, damages them and applies 0.5s stun to unshielded champion collisions only.
- **Pyke Q**: zero-charge input executes a short stab without hook displacement. Nonzero charge is valid board input with bounded attack range. Denied short-charge orders cannot debit mana.
- **Orianna Q/W**: both use canonical Ball location, including live allied carrier attachment, instead of stale cast-time coordinate.
- **Thresh W / Zyra W / Pyke E**: explicitly skip unrelated universal `move_point` automatic relocation, avoiding caster teleports or twice-applied dash.
- **Renata E**: line endpoint clipped to 800 range regardless of remote click.

## Evidence in this ChatGPT session

Authoritative game is the complete `engine.mjs` evaluated in JavaScript V8 with the actual `data/coachlol_map_v6.json` and `data/masks_128.json`. The new runnable test file is:
`tests/audit/v453_m44_b08_authored_identity_expansion.test.mjs`

Every B08 scenario tests both blue/red sides and a V40 snapshot/checksum roundtrip. Focused B08 suite covers delays, primary/secondary collisions, ally shields and movement, terrain failures, spell shields, expiry, mana-free recasts, wrong ranges and the Zyra seed/plant ledger.

- B01 34/34 PASS
- B02 18/18 PASS
- B03 106/106 PASS
- B04 100/100 PASS
- B05 104/104 PASS
- B06 16/16 PASS
- B07 74/74 PASS
- **B08 48/48 PASS**
- **Total M44: 500/500 PASS**
- Complete 17-axis P+QWER certified kits by M44 milestones: **0**.

Full repository `npm test`, native `node --check`, Chromium, browser bundle parity, real two-client network PvP, release/canonical champion comparison: **NOT_RUN**. Do not present these scoped test results as final Riot parity.

## Next focus

1. Fill the highest-identity gaps in a larger multi-champion coorte, prioritizing Gnar form transitions, Draven Q/W/passive, Karma W/E empowered options, Orianna passive and Ball pickup, Zyra E plants and Renata W/R; keep no generic filler.
2. Run mixed-roster simultaneous PvP interactions in both viewpoints, fog, stasis, spell shield and death before claiming certified kits. Ensure journal/snapshot replay and 17-dimension audit eventually cover P+QWER as a single kit.
3. No changes to main, integration branch, items, engine.browser.js, version.json or Actions. Leave PR #9 Draft without merge.

Public mechanic references used for qualitative identity:
- https://wiki.leagueoflegends.com/en-us/Orianna
- https://wiki.leagueoflegends.com/en-us/Renata_Glasc
