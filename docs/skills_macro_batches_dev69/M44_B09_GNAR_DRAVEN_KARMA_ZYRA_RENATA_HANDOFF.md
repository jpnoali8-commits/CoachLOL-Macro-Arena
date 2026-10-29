# CoachLOL Macro Arena — M44 B09: Mini/Mega Gnar, Draven, Karma, Zyra, Renata

Date: 2026-10-29. Exclusive branch `dev69/skills-batch2`, PR #9 remains Draft to `dev69/integration`. Source parent commit `56269b5a1b46d6abb47a9bfdca938128cc8ff04c`.

## Implemented authored scope

**Five champions, eleven new named spell-slot contracts** (Gnar W/E/R, Draven Q/W/E, Karma W/E, Zyra R, Renata W/R) plus **Mega Gnar Q variant** on the earlier B07 slot, and champion-specific passive/interaction improvements. These are NOT 5 fully certified champions. No anonymous fallback introduced.

1. **Gnar Rage Gene:** actual damage dealt/taken increments bounded rage in a serializable owner ledger; full rage promotes the next spell to the Mega kit, or automatically transforms after a short grace period. Mega lasts 15 simulated seconds, then Mini returns with a 15-second rage lockout. Mini W is a genuine *passive-only* Hyper mark: three real basic hits detonate bonus magic damage. Mini E schedules a destination-area Hop; Mega Q is a single-hit Boulder that **does not erroneously boomerang**; Mega W stuns with Wallop; Mega E Crunch has a larger/slowing landing zone; Mega R GNAR! stuns and terrain-checks knockback. The four Mega QWER definitions are separate `M44_B09_GNAR_MEGA_V453` records. Prior B07 Mini Q still returns.
2. **Draven:** Q prepares up to two Spinning Axes, consumed on genuine basic attack only, with a non-recursive physical bonus packet and a saved axe landing/catch temporal. Catch replenishes an axe, awards owner-scoped Adoration and refunds W cooldown; W gives an individual Blood Rush speed window; E Stand Aside is a traveling ray that slows and laterally displaces unshielded champions (terrain validated). Adoration is accumulated on minion kills and paid out on a real champion kill via the normal gold+economy ledger, never direct untracked mutation. Existing B07 R and B08 manual return remain intact.
3. **Karma:** W Focused Resolve must hit an enemy champion and stay in 700 range/line-of-sight for the delayed root two ticks later. Mantra W heals on cast and, on completed tether, heals again. E Inspire shields/speeds the selected ally; Mantra E consumes the owner buff once and provides nearby *reduced* secondary shields and speed. Existing Mantra Q Soulflare from B08 is preserved.
4. **Zyra:** E Grasping Roots consumes only valid seeds intersecting its actual line and produces owner-scoped firing plants; R Stranglethorns executes as a delayed circle that damages and knocks up valid unshielded enemies, extending nearby owned plants' attacks. Prior Q/W/seed ledger remains.
5. **Renata Glasc:** W Bailout is target-bound; fatal damage sets an allied champion to one HP for a limited window, an allied takedown saves that champion for 20% HP, and expiry invokes `damage(...,'true','m44_b09_bailout_expire')` through the **real death ledger**, preserving deaths, respawn timer, attribution and economy. R Hostile Takeover is a traveled line applying owner-scoped enemy frenzy, **no fabricated direct R damage**. On the later time ticks, each affected enemy is forced to damage the nearest ally within 650 if one exists. Spell shields block the state; scope is a board adaptation with further action suppression/targeting fidelity still outstanding.

These are explicit `M44_B09_KITS_V453` and `M44_B09_GNAR_MEGA_V453` definitions with named branches in the existing authoritative engine. They are tailored to the simultaneous-order PvP board game, NOT ten human-controlled MMO/RTS agents.

## QA: execution evidence

New executable: `tests/audit/v453_m44_b09_gnar_draven_karma_zyra_renata_identity.test.mjs`.

Executed in ChatGPT's full JavaScript V8 evaluation with **actual** `engine.mjs`, `data/coachlol_map_v6.json`, `data/masks_128.json`. 29 distinct authored scenarios repeated for **blue and red** (58 total). Each verifies V40 snapshot checksum/replay roundtrip. Scenarios cover Mini/Mega spell routing, rage lockout, three-hit Hyper, ult knockback, temporal axe catch, W reset, Adoration gold payment, Mantra Q/W/E, delayed roots and interruption by range, Zyra E seed and R plant buff, shield negations, Renata R ally attacks and W rescue, death+respawn expiration.

M44 focused test summary:
- B01 **34/34 PASS**
- B02 **18/18 PASS**
- B03 **106/106 PASS**
- B04 **100/100 PASS**
- B05 **104/104 PASS**
- B06 **16/16 PASS**
- B07 **74/74 PASS**
- B08 **48/48 PASS**
- B09 **58/58 PASS**
- **M44 B01-B09: 558/558 PASS**, zero newly certified complete P+QWER kits.

**NOT_RUN:** native `node --check`; entire repository `npm test`; Chromium / `engine.browser.js` parity; two connected network PvP clients; full 17-dimension champion-kit certification; patch-exact Riot numbers and death/disconnect behavior. This scoped QA must not be described as full production certification.

## Known debt / next priority

- Gnar: true Mega stat package, wall collision stun differentiation, dynamic cast-time form/cooldown parity, exact rage rates, leap bounce.
- Draven: full trajectory prediction/axe pickup acceptance, attack speed interactions, R true execute, adoration assist formulas.
- Karma: target-specific shield ranks, W link interruptions, passive Mantra refund on damage, W/E empowered exact timing.
- Zyra: plant species by Q/E, enemy targeting and zone position, seed line blocking, passive seed spawns.
- Renata: correct Frenzy retargeting and action suppression under simultaneous orders; W kill/assist confirmation and bailout count; passive Financing.
- Continue scaling authored multi-champion mechanics in large coherent batches, with full P+QWER+passive QA only after deeper parity. No generic fake identity, no inflated certified count.

Git boundary: Do not edit `main`, `dev69/integration`, Items, browser bundle, `version.json`, Github Actions or Codespaces. **Do not merge PR #9.**

Source references for qualitative spell identity (not a claim of numerical parity): 
- https://www.leagueoflegends.com/pt-br/champions/gnar/
- https://wiki.leagueoflegends.com/en-us/Draven
- https://www.leagueoflegends.com/pt-br/champions/renata/
