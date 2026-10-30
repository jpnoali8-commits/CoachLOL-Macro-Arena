# CoachLOL Macro Arena — M44 B32B | borrowed Twitch R and secondary on-hit (54 suites / 1,926 bilateral PvP)

## Scope and parent
- Parent `96c8da240d370362c0e0471177e237f8f159cd60`, branch `dev69/skills-batch2`, PR #9 Draft, no merge.
- Original engine `engine.mjs` candidate blob `c4dc20a499801b93a503f49332e528624fd48593`.
- New suite `tests/audit/v453_m44_b32b_twitch_borrowed_onhit_pvp.test.mjs`, blob `371af239c1a2911eb94495cdebc4c3cba128ace1`.
- No changes to engine.browser.js, versions, items, integration or main. No Actions, Codespaces, workers or force-push.

## Shared original-skill hardening
1. **Sylas borrows Twitch R behavior, not Twitch passive.** Existing B14D original executor still casts Twitch.R on the Sylas actor (same ID/team/ownership). B32A's R gave Sylas a valid serialized six-second buff but the AA implementation incorrectly required `attacker.champ==='Twitch'`, so Sylas did not pierce or gain the actual R bonus damage. The B32B attack pipeline instead checks active source-owned `m44B32ATwitchSpray` and absence of a Viego possession, allowing stolen R to enhance Sylas AAs. No copy list or duplicate Sylas executor.
2. **Piercing secondary hits invoke opted-in on-hit item effects** via the unique source tag `m44_b32b_twitch_secondary`. The existing one-time on-hit dispatcher handles each distinct hit without reentering the basic-attack action, AA cooldown, or item-proc recursion.
3. **Twitch's Deadly Venom passive applies to actual secondary hits** only if the true champion owner is Twitch, not Sylas: native Twitch's owner-scoped poison can stack on every pierced live enemy, with shield/realm/death guards under the established damage pipeline.
4. R bullets may traverse terrain, even if a subsequent enemy is unseen: this is intentional per desktop LoL reference; attacker must still authorize the primary AA, and all impacts enforce launch realm and shared target geometry. The tactical B32A approximation is instantaneous; full 5000u/s projectile flight and primary target evasion are future parity debts.

## QA executed on exact candidate
- The historical **53 M44 suites** B01–B32A all executed in V8 against the exact candidate engine and repo map/mask fixtures: **1,902/1,902** PvP cases PASS. Historical tests were not deleted or weakened.
- B32B adds 12 champion- and owner-specific checks mirrored blue/red: **24/24 PASS**, including original registry, Sylas stealing Twitch R, actual buffed range and piercing AA, preserving Sylas ID/team, no Twitch poison passive on Sylas, native Twitch poison on secondary contacts, exactly-once Recurve Bow on-hit secondary, off-axis misses, enemy fog and terrain passage, cross-realm exclusion, duration expiry, snapshots V40.
- **TOTAL: 54/54 M44 suites; 1,926/1,926 PvP scenarios; zero failures.**
- Actual V8 code execution in ChatGPT with in-memory assert/fs/URL adapters. NOT native Node `node --test`/global npm test, browser bundle/UI, multiplayer network, GLB/VFX, long matches, or 17-axis complete P+QWER patch 26.21 certification. Certified full kits: 0.

## Next priority M44 B33
- Preserve the full 54-suite regression gate and scale unique P+QWER authorial implementations across larger 25–40-champion cohorts, without equating table entries or reference-only stats with implemented skills.
- Candidate hardening: real 5000u/s Twitch R projectiles with impact timing and primary evasion; Talon wall topological-sector identity instead of 300u approximated sectors; test owner/control/fog under PvP socket transport when integration approved.
- Source references: https://wiki.leagueoflegends.com/en-us/Twitch and https://wiki.leagueoflegends.com/en-us/Talon
