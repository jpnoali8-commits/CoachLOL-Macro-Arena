# M44 B05 — Jhin Deadly Flourish, Xayah feathers and seven bespoke projectiles

2026-10-29. `dev69/skills-batch2`; PR #9 is Draft targeting `dev69/integration`; no merge.

## Champion-owned production
9 champions / 12 spell contracts:
- Jhin W: actual minion-penetrating line, reduced minion damage, champion-shaped clone interception, stop on first champion/decoy. W roots only champions marked **before** impact by genuine Jhin/allied champion damage or an armed Lotus Trap; four-second mark. Spell shield blocks root; unmarked W may damage but not root.
- Xayah P/Q/W/E/R: Clean Cuts grants limited empowered basic attacks on real casts; basic hit deposits owned six-second feather. Q uses two separate travelling daggers and two finite feather objects; second body receives reduced Q damage. W supplies a temporary bonus/attack-speed proxy and movement on champion hit. E recalls actual owner feathers along independent trajectories at next tick and roots on three distinct, unshielded feather impacts; R supplies a brief defensive leap proxy and five directional feathers. **Full frame-level untargetability, exact attack-speed stats and all P+QWER dimensions remain uncertified.**
- Kennen Q: first-body shuriken, owner-scoped 3-mark electrical stun.
- Ezreal Q: first-body Mystic Shot with 1.5s cooldown refund only on actual damage.
- Lux Q: two-body Light Binding with individual root.
- Ahri E: first-body charm with no pre-impact packet.
- Jinx W: first-body Zap slow and team-scoped reveal.
- Kai'Sa W: distant Void Seeker first-body, 2 Plasma stacks and reveal.
- Caitlyn E: independent terrain-checked recoil **at launch**, net slow on first body contact, owner-scoped Headshot only on non-shielded champion hit.

No generic fallback added; all existing M44 B01-B04 functions and PvP state preserved. Explicit registry `M44_B05_KITS_V453` overlays only these authored champion+slot contracts.

## QA
- Actual full engine `Arena` evaluated in isolated V8 with real map/masks.
- M44 B01 34/34, B02 18/18, B03 106/106, B04 100/100 PASS in the same source run.
- M44 B05 **100/100 PASS** both teams. Covers launch vs contact, spell shields, minions, walls, 2 rays, prior allied mark, Lotus trigger, clone interception, source-owned feathers, Clean Cuts, Bladecaller triple root, expiration, Kennen stacks, Ezreal refund, Lux two-body cap, Kai'Sa plasma, and Caitlyn recoil. 100 V40 snapshots/checksums.
- Total 358/358 scoped scenarios, 0 full kits certified.
- Native `node --check`, `npm test`, Chromium, browser parity, networked two-client PvP, 17-dimension kit certification: **NOT_RUN**.

## References and QA debt
- Jhin Deadly Flourish: https://wiki.leagueoflegends.com/en-us/Jhin
- Xayah Clean Cuts / Double Daggers / Bladecaller: https://wiki.leagueoflegends.com/en-us/Xayah
- The `R` defensive state is a tactical one-tick protection proxy, **not a 1:1 untargetability certification**.
- Future B06: complete source-owned feather/R/passive details, Jhin W/R nuanced counterplay, extra high-identity champions in bulk, clone/vision/fog and server PvP certification once all authored slots are complete.

This commit adds only one test and one handoff file. Previous B05 edits affected `engine.mjs` only; no Items, browser, version, Actions, Codespaces, integration or main modification.
