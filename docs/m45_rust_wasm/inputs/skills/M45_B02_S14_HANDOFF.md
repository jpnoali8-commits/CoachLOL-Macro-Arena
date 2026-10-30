# CoachLOL Macro Arena — M45 B02 Skills S14

**Date:** 2026-10-30. **Audit branch:** `dev69/m45-audit-skills`. **Frozen original:** `dev69/skills-batch2` @ `f0b1147ac46e585a1d5374a178b1ea462f5dc278`. **Core coordinator HEAD inspected:** `ddbdf8e9ee4345646c70162c1637e5b08670708a`.

## Next prerequisite scan

Confirmed coordinator workspace has **only `crates/core-state`**, still no `core-combat` and no `core-champions`. Local execution sandbox has Node, but **no `rustc`, `cargo` or repository checkout via DNS**. No Actions triggered. Accordingly S13 Rust model remains uncompiled; all native/wasm gates stay **NOT_RUN**.

## Executed S14 original legacy source suites

Fetched frozen original engine/map/masks by GitHub Git blob SHA and four **original** test source blobs, then executed each **full original test body** in isolated V8, adapting only Node imports, file loader and `assert`/`console`. Each suite's own original assert checks, cases, catch/failure records and snapshot-restore comparisons remained in place.

| Original source test | Git blob SHA | Scenarios | Assertions | Snapshot roundtrips | V8 |
|---|---|---:|---:|---:|---|
| `tests/audit/v453_m44_b14c_sylas_hijack_authored_r_pvp.test.mjs` | `122014a5690277ab1ee3ea88054545d63569901d` | 22 | 266 | 22 | PASS |
| `tests/audit/v453_m44_b14c_viego_owner_possession_pvp.test.mjs` | `df33700bb71565d10665f8be763e3dce41429366` | 22 | 192 | 22 | PASS |
| `tests/audit/v453_m44_b14d_shared_original_sylas_viego_pvp.test.mjs` | `c720308368d3ce474f2d5eae767b4f849ad05a37` | 78 | 974 | 78 | PASS |
| `tests/audit/v453_m44_b17_shared_sylas_viego_pvp.test.mjs` | `f84512a69664f46beaf4949fb57d6269138269ce` | 32 | 462 | 32 | PASS |
| **Executed total** | | **154** | **1,894** | **154** | **ALL PASS** |

**Crucial no-double-counting:** the original B14D test with **78 scenarios** was already one of S10's 22 V8_PASS golden suites. S14 reexecuted it independently, but the **newly exercised suites outside the S10 selection cover 76 additional source cases and 920 original assert checks**, not 154 new cases. S10's 26-suite matrix is unchanged: **22 V8_PASS, 2 V8_FAIL, 2 NOT_RUN; full Node 0/26**.

### Identity migration invariants captured

- **Sylas Hijack R:** steals the original donor champion R **executor**, not the donor's current borrowed appearance. Executes original authored R with Sylas actor ID, team, kill credit and 0 extra mana; consumes stolen cast once; donor passive must **not** leak. A possessed Viego donor still offers the **original Viego R**, not Hwei's R. Unsupported original R fails closed, never invented damage.
- **Viego:** soul spawned by actual qualifying death; forbidden forged/expired/hidden souls and double claims. Possession changes visible champion, borrows donor passive + Q/W/E source, keeps original R, actor ID and seat ownership. Specific on-hits/effects include Twitch poison, Teemo poison, Azir soldiers, Bard shrines and Hwei QQ. Native R, death and duration expiry clean possession; original cooldown reinstated. Tests exercised endpoint snapshot restore.
- **Boundary:** source tests use mocked `visible`, `canSeePoint`, `walkable`, `obstacleLine` for controlled battle identities and inflated health. **Do not** treat their passes as verified real two-seat ACL or fog, nor as full kits (all four source test logs contain `certifiedKits:0` / `completePqwerKitsCertified:0`).

### Concrete Rust acceptance artifact

`s14_sylas_viego_rust_acceptance.rs` creates a **typed non-production acceptance runner** with **15 original R donors (Sylas)** + **12 P/QWE donors (Viego)** × both seats = **54 planned positive native run cases** plus **10 specified negative requirements**. Includes four *prepared but unexecuted* Rust data tests. The trait intentionally has no mock implementation and cannot assert real migrated gameplay. Requires core-champions, core-combat, match owner/ACL, replay and authoritative snapshot integration.

`s14_validate_sylas_viego.mjs` was executed in V8 using the **actual saved JS validator source**: **79/79 static checks PASS** for SHA pins, per-suite assertions and counts, explicit S10 overlap, Rust donor corpora and negative case coverage. See `S14_STATIC_CONTRACT_RECEIPT.json`.

### Handoff / next priority S15

When core modules become available, **implement** the real `AuthoritativeBorrowRunner` against native Rust champion+combat crates and run 54 positive cases plus negative/fog/replay cross-seat tests. Until then the most valuable audit is clone/disguise identity and visibility (Neeko/Shaco, Viego↔Sylas) with original true source, which is a known S10 blocked test. Never replace actual historical behavior with a generic copy engine.

**Status:** S14 source V8 PASS, static validator V8 PASS, full original Node ESM NOT_RUN, Rust native NOT_RUN, WASM NOT_RUN, server ACL NOT_RUN, G8 NOT_CERTIFIED. No Actions, no original branch writes, no merges/rebases/force pushes.
