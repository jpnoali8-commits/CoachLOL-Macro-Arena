# CoachLOL Macro Arena — M44 B22: authored channel interruptions, delivery classes and realm-safe cancellation

**Date:** 2026-10-30. **Branch:** `dev69/skills-batch2`. **Parent:** `9f29c0619afa2c1a6e10f401576ccddc4bf93867`. **PR #9:** remains Draft into `dev69/integration`; no merge.

## Implementation (engine.mjs)
- `m44B22DeliveryKindV453`: explicit categorization of already-authored delivery semantics: temporal/active projectile, beam, channel, windup and delayed impact. Unknown entries remain `unknown` (never substitute a fallback skill). No new complete champion kits are falsely certified.
- `m44B22CancelChannelsV453` and `m44B22ChannelInterruptRecordV453`: original caster/team and reason-indexed, bounded, serializable cancellation receipts, removing **only** cancellable `cone_channel`, `m20_requiem_channel`, `m22_artillery_channel` and active `jhin_r_channel`. Already-launched Jhin R bullets and other authored missiles, beams, timed impacts and boomerang flights persist.
- Viktor R and Kassadin Q original interrupt handlers now call this same reusable mechanism rather than maintaining isolated three-channel lists. Jhin's `m16JhinChannel` gets interrupted as well.
- `m44B22ChannelInterruptReasonV453` drives temporal interruption based on CC, death, >60 world unit displacement and cast realm changes. `m44B22CastRealmId` is written on new temporal channel states only; legacy snapshots without it retain compatibility. Death Defied Karthus R channel is explicitly exempt from normal death/CC cancellation for the existing valid postmortem window.
- Jhin R writes cast realm and start timing, invalidates remaining shots on CC, movement, death, expiry and realm change. A recast after realm change fails before firing. Existing performed skills are not rolled back and existing missiles are not removed.

## QA executed against the exact B22 engine blob
- **Engine blob SHA:** `b0cce78985c6230c2be6fff44d1d1397c0af6f4c`
- **B22 authored test SHA:** `5602ae51c2751f67bb80ca11ad27d1ee4933301a`
- B01–B17 historic **36 suites = 1392/1392 PvP scenarios passed**.
- B18 **28/28**, B19 **16/16**, B20 **16/16**, B21 **22/22** — no failures.
- **B22 new 15 scenarios mirrored on both blue and red = 30/30**; 207 assertion calls; no failures. Includes identity taxonomy, Viktor/Jhin original R, Kassadin original Q, released Morgana Q, already fired Jhin R bullet, Miss Fortune R cone, Xerath R state cleanup, Karthus R movement and Death Defied, Jhin expiry, source realm changes, unchanged delayed impacts and snapshot restore of interruption receipts.
- Total **41/41 suites, 1504/1504 PvP scenarios passed in isolated JavaScript V8** on the single B22 candidate engine. All suites ran against actual `engine.mjs` and the repository's real `data/coachlol_map_v6.json` and `data/masks_128.json`, with Node import/assert/file adapters in memory.

## Non-claims and scope
- This is V8 execution QA, **not** native Node `node --test`, browser UI, networked authoritative PvP server, full game match, full catalog or parity certification.
- **No complete passive/QWER kits newly certified**. Trained simplified numerical ranges/timing are not asserted Riot patch-perfect.
- No GitHub Actions, Codespaces, workers, merge, new branch, version change, item/UI or main integration modifications.

## Next priority M44 B23
Extend authored channel taxonomy to existing charge/windup records such as Irelia W, Sett W and Galio W without suppressing their exception behaviors; validate projectile persistence after caster death and cross-realm relocation; then progress larger complete champion identity batches on the shared executor, with per-batch QA.
