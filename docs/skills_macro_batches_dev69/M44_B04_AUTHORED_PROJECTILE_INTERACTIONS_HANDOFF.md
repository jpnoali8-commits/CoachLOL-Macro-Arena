# CoachLOL M44 B04 — 11 author-owned travelling skills

2026-10-29. Source branch `dev69/skills-batch2`, PR #9 Draft -> `dev69/integration`. No merge or force updates.

## Production
- `4b43c15a9672f8248f839d214cbb896f538629da`: initial B04 champion/slot contracts.
- `6164dd5fbd154e14ff75021793dd00ced2902d85`: genuine Seraphine Encore ally extension, Warwick champion-first interception, TF Wild Cards same-cast damage deduplication.
- `5da74da1b553569a7aa4b2b5fd18a105a71cfbc8`: Amumu Q and Warwick R must never dash before actual projectile contact.

Ten champions, eleven skill identities, no generic fallback:
- Leona E: first and subsequent champion roots, arrive only at last affected champion after flight completes.
- Amumu Q: minions can intercept, champion impact grants stun and only then Bandage Toss relocation.
- Janna Q: Howling Gale projectile knocks up contacted champions.
- Veigar Q: Baleful Strike has a hard cap of two impacted bodies.
- Sona R: Crescendo travels through bodies applying author-owned stun.
- Seraphine E: Beat Drop conditional slow, root, or stun according to LIVE pre-hit CC.
- Seraphine R: Encore charms touched champions; real ally OR enemy champion contact extends flight, capped at two board extensions, no damage on ally.
- Xerath E: Shocking Orb first-body impact stuns by range.
- Twisted Fate Q: three angled Wild Cards with one mana/CD charge, shared per-cast id/hit ledger stops duplicate damages from overlapping rays.
- Warwick R: champion-first missile bypasses minions and only suppresses/dashes after confirmed contact.
- Xin Zhao W: spear slow plus author-scoped impact mark.

## QA provenance and limits
- Source `engine.mjs` actually evaluated in V8 with complete real `coachlol_map_v6.json` and `masks_128.json`. Real Arena class, real V40 snapshots/checksums, both PvP seats; not mocks of scheduler.
- M44 B01 **34/34 PASS**, B02 **18/18 PASS**, B03 **106/106 PASS**.
- B04 **100/100 PASS** including spell shields, minion interception, hard terrain, dash debit before impact, Leona last-target choice, Seraphine ally extension and CC upgrade, TF cast dedup, Veigar cap, snapshots.
- Total M44 scoped **258/258 PASS** (34+18+106+100), 0 kits certified.
- Native `node --check`, `npm test`, Chromium, network PvP clients, full browser bundle parity, complete P+QWER coverage and final LoL patch parity **NOT_RUN** in this chat.

Only `engine.mjs`, this B04 test and this handoff were changed. No browser bundle, Actions, Codespaces, integration, items, version.json or main edits.

## Next
B05: investigate and author Jhin W marked-target projectile and Xayah's actual persistent feathers/recalled flight with 2+ line hits and rooted targets, plus clone/stealth counterplay. Do NOT create fallback skills or ship partial kits as full certification.
