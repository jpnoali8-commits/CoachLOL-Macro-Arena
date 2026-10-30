# CoachLOL Macro Arena — M44 B30A | Kennen R storm-mark cap and immunity

**Parent:** `e77df570bcbe4b8c7f5868d31a2d2b35559a3130` (B29 full-regression addendum). **Branch:** `dev69/skills-batch2`; PR #9 remains Draft, unmerged.

## Implemented
- Slicing Maelstrom still produces six deterministic damage pulses every 0.5 simulated seconds, with its existing per-victim damage scaling and hit ledger.
- Each victim receives at most **three** Mark of the Storm applications *from that storm*. Further damaging pulses refresh a six-second, source-owned immunity to additional R-applied marks. Other champion owners are not conflated.
- State persists in the authoritative `m44B30KennenStormImmunity` target ledger and `markCounts` storm ledger, both plain-data fields compatible with V40 snapshot/checksum restoration.
- Existing passive mark processor is reused. No generic spell fallback, no changes to the source executor for Sylas/Viego and no changes to normal Q/W/E mark logic.

## QA executed on candidate blob
- `engine.mjs` blob: `bde88b0d25d8c9196666dd994cc8844f4258185c`.
- New test suite blob: `96a4730f7ee5388fda95efd52b35e198c622b749`.
- B26 regression: 46/46; B27: 28/28; B28: 32/32; B29: 32/32; B30A: 12/12.
- **Total executed: 5/5 suites, 150/150 mirrored PvP scenarios passed, 0 failed.**
- Actual engine source, repo map/masks, V40 snapshots/checksums and existing test bodies ran in isolated JavaScript V8; Node ESM imports/file loading were adapted in memory. No tests ignored or removed.

## Honest scope
Only this source-specific Kennen R contract is updated. The 48-suite full M44 regression (1,790 old cases), native Node `node --test`, browser/UI/GLB, actual remote two-human multiplayer, and complete champion certification were **not run** for B30A. Do not represent this sublot as a complete kit.

## Next source-authorial priority
B30B: Anivia Q 950-unit/sec swept flight, independent passage slow/damage hit ledger versus 225-radius shatter/stun; preserve early recast without double debit, world/realm collision, first valid hits and snapshots. Then Katarina Q trajectory/E interactions and remaining champion-specific slots.

No merges, Actions, Codespaces, external workers, browser rebuild or changes to main/integration/items.
