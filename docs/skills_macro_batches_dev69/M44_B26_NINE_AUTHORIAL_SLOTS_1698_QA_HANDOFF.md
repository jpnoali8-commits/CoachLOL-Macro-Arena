# CoachLOL Macro Arena — M44 B26 | Nine Authored Slots (1,698 bilateral PvP QA cases)

## Scope / branch / isolation
- Parent commit: `5ab47a6a1e0db96c0323e75e40e02004812c3749` (M44 B25).
- Branch: `dev69/skills-batch2` only. PR #9 stays Draft targeting `dev69/integration`; no merge.
- Candidate `engine.mjs` blob: `bd82f36a1e28358bb642bdf3bbd6f8949adcdc72`.
- New audit test blob: `edf1e2d2339dce315eec2993de3f061573b4bd9c`.
- Changes limited to `engine.mjs`, `tests/audit/v453_m44_b26_anivia_katarina_kennen_pvp.test.mjs` and this handoff.
- Keep `engine.browser.js`, version, items, other branches, and integration untouched. No Actions, Codespaces, workers or force push.

## Nine new source-authored skills, no generic substitute
`M44_B26_KITS_V453` adds nine individual PENDING/PARTIAL Q/W/E/R entries with original-rule priority in `m44B14DOriginalBoardRuleV453`.

1. **Anivia Q — Flash Frost**: 0.5-second scheduled first-contact explosion (board approximation), area stun and per-owner Chilled mark only when damaging hits are not spell-shielded. Missile travel/instant recast is **not certified**.
2. **Anivia W — Crystallize**: perpendicular finite wall at designated point, five seconds long, registered in existing `m44B18SkillWallsV453` and authoritative movement/path/obstacle checks for BOTH teams, validated before debit. No parallel wall subsystem.
3. **Anivia E — Frostbite**: directly targeted magic strike; doubles damage against a valid source-owner Chilled mark. Pre-existing Anivia R glacial zone now applies that same owner-scoped mark on valid damage.
4. **Katarina Q — Bouncing Blade**: up to three deterministic, distinct enemy bounces with no wall-spanning hits. Schedules a grounded dagger after a brief fall.
5. **Katarina W — Preparation**: temporary movement burst and delayed grounded dagger at original cast position, without mana debit (zero mana).
6. **Katarina R — Death Lotus**: 2.5-second scheduled multiple ticks against nearby champion targets; registered in shared M44 B22 channel taxonomy. Hard CC, death, movement, explicit channel interruption and realm changes cancel future ticks. Already-committed ticks are not rolled back.
   - Katarina's source-owned grounded daggers detonate upon actual pickup range, damage nearby enemies and refund a portion of E (Shunpo) cooldown. The existing Katarina E executor is augmented to use the same pickup handler. Dagger pickups remain a tactical board approximation; no full passive/rank/attack speed parity.
7. **Kennen W — Electrical Surge**: refuses queue/commit when neither valid marked nor storm-affected enemies are in range; applies magic damage and another Mark of the Storm to eligible enemies, with third-stack stun.
8. **Kennen E — Lightning Rush**: shared walkable/obstacle validation before resource debit; authorized movement, segment hit detection, one magic damage receipt and one mark per enemy, plus temporary speed.
9. **Kennen R — Slicing Maelstrom**: moving-owner six-half-second strike schedule with growing hit damage and shared per-owner marks; stops after death. Temporary defensive stat state is stored but accurate permanent/derived resistances have **not** been certified. The effect is not a stationary AoE.

**Kennen Q** existing projectile now calls the same owner-scoped mark processor on genuinely damaging hits, preventing application through a spell shield.

**Sylas/Viego** use original-source lookup without manual allowlists. Sylas stolen Katarina R can be interrupted. Viego inherits original Anivia Q/E, including Chilled synergy. Copying does not claim a full-passive/P-QWER certification.

## Exact execution and limitations
- In-memory V8 execution of exact candidate engine blob plus actual `data/coachlol_map_v6.json`, `data/masks_128.json` branch files. Historical Node assertions/file reads adapted to in-memory; no external Actions.
- Existing M44 suites B01–B25: **44 / 44 suites PASS**, **1,652 / 1,652 scenarios PASS**. Zero failures.
- New B26 `tests/audit/v453_m44_b26_anivia_katarina_kennen_pvp.test.mjs`: **23 assertions/scenarios mirrored blue/red = 46 / 46 PASS**, zero failures. Includes cost, geometry, channel cancellation, fog/target policy, spell shielding, source copying, and snapshot/checksum roundtrip.
- Combined: **45 / 45 suites, 1,698 / 1,698 PvP scenarios PASS**, zero failures.
- `new Function` V8 engine parsing passed. Not a replacement for native Node syntax validation.
- **NOT RUN**: native `node --test`, global `npm test`, synced `engine.browser.js`, live network sessions, actual two-human multiplayer, Chrome visual QA, full Nexus matches, GLB and complete patch-parity fidelity. No champion promoted to `certified`.

## Follow-up M44 B27
1. Continue catalog inventory and authored missing slots, prioritizing Katarina P/E dagger precision, Anivia egg passive/Q-recast, Kennen P/W-onhit and real derived R defense; include a second multi-champion cohort once those interactions stabilize.
2. Preserve shared original-executor for Viego Q/W/E and Sylas stolen R, no generic fallback for authored abilities.
3. Mirror both seats, adversarial revalidation, snapshot/reconnect idempotency; no integration until authorized.
4. Patch references: https://wiki.leagueoflegends.com/en-us/Anivia ; https://wiki.leagueoflegends.com/en-us/Katarina ; https://wiki.leagueoflegends.com/en-us/Kennen ; https://www.leagueoflegends.com/en-us/champions/kennen/
