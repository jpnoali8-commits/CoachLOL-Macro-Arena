//! CoachLOL M45 B02 S13 — typed *ACCEPTANCE PORT* for future Rust engine.
//! This source is a non-production contract draft, not compiled or executed yet.
//! It intentionally does NOT contain projectile combat logic or an automatic fallback.
//! The Rust match runner must supply actual results via AuthoredProjectileRunner.
//! Source oracle: S12 V8 438/438, skills-batch2 f0b1147a,
//! engine blob 41679f7328a42e379fdfb8de5b92006e1bfb529f.

#[derive(Debug, Clone, Copy, Eq, PartialEq)]
pub enum Seat { Blue, Red }
#[derive(Debug, Clone, Copy, Eq, PartialEq)]
pub enum ChampionSlot { AhriE, AsheR }
#[derive(Debug, Clone, Copy, Eq, PartialEq)]
pub enum ScenarioKind {
    CleanHit, PrimarySpellShield, LaneMinion, EnemyProjectileBarrier,
    AtlasWall, BeyondRange, SecondarySplash, SecondarySplashShield,
}
#[derive(Debug, Clone, Copy, Eq, PartialEq)]
pub enum CrowdControl { Charm, Stun, Slow }
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Expected {
    pub accept: bool,
    pub mana_after_cast: u16,
    pub primary_hp: i32,
    pub secondary_hp: Option<i32>,
    pub minion_hp: Option<i32>,
    pub cc_primary: Option<CrowdControl>,
    pub cc_secondary: Option<CrowdControl>,
    pub impact_tick: Option<u32>,
}
#[derive(Debug, Clone, Copy, Eq, PartialEq)]
pub struct Case {
    pub id: &'static str,
    pub slot: ChampionSlot,
    pub kind: ScenarioKind,
    // Exactly one simulated primary cast, with shared canonical start.
    // The origin is (0.5, 0.5), rank 1, 1000 mana, 1500 HP target.
    pub target_x_milli: i32,
}
pub trait AuthoredProjectileRunner {
    // Must source seat authorization from the test session, not client-provided team.
    // Must execute real core-clock/core-map/core-combat/core-champions code.
    // Never satisfy acceptance via hard-coded results from this file.
    fn run_case(&mut self, seat: Seat, case: Case) -> Expected;
}
pub const FIXTURES: [Case; 13] = [
    Case{id:"AHRI_E_NORMAL",slot:ChampionSlot::AhriE,kind:ScenarioKind::CleanHit,target_x_milli:540},
    Case{id:"AHRI_E_SPELL_SHIELD",slot:ChampionSlot::AhriE,kind:ScenarioKind::PrimarySpellShield,target_x_milli:540},
    Case{id:"AHRI_E_MINION_INTERCEPT",slot:ChampionSlot::AhriE,kind:ScenarioKind::LaneMinion,target_x_milli:540},
    Case{id:"AHRI_E_PROJECTILE_BARRIER",slot:ChampionSlot::AhriE,kind:ScenarioKind::EnemyProjectileBarrier,target_x_milli:540},
    Case{id:"AHRI_E_ATLAS_WALL",slot:ChampionSlot::AhriE,kind:ScenarioKind::AtlasWall,target_x_milli:650},
    Case{id:"AHRI_E_RANGE_CLAMP",slot:ChampionSlot::AhriE,kind:ScenarioKind::BeyondRange,target_x_milli:580},
    Case{id:"ASHE_R_NORMAL",slot:ChampionSlot::AsheR,kind:ScenarioKind::CleanHit,target_x_milli:580},
    Case{id:"ASHE_R_SPELL_SHIELD",slot:ChampionSlot::AsheR,kind:ScenarioKind::PrimarySpellShield,target_x_milli:580},
    Case{id:"ASHE_R_IGNORES_MINION",slot:ChampionSlot::AsheR,kind:ScenarioKind::LaneMinion,target_x_milli:580},
    Case{id:"ASHE_R_PROJECTILE_BARRIER",slot:ChampionSlot::AsheR,kind:ScenarioKind::EnemyProjectileBarrier,target_x_milli:580},
    Case{id:"ASHE_R_ATLAS_WALL",slot:ChampionSlot::AsheR,kind:ScenarioKind::AtlasWall,target_x_milli:650},
    Case{id:"ASHE_R_EXPLOSION_SECONDARY",slot:ChampionSlot::AsheR,kind:ScenarioKind::SecondarySplash,target_x_milli:580},
    Case{id:"ASHE_R_SPLASH_SHIELD",slot:ChampionSlot::AsheR,kind:ScenarioKind::SecondarySplashShield,target_x_milli:580},
];
pub const fn expected(f: Case) -> Expected {
    use ChampionSlot::{AhriE,AsheR};
    use ScenarioKind::*;
    let ahri = matches!(f.slot, AhriE);
    let mana = if ahri { 940 } else { 900 };
    match (f.slot, f.kind) {
        (AhriE,CleanHit) => Expected{accept:true,mana_after_cast:mana,primary_hp:1420,
            secondary_hp:None,minion_hp:None,cc_primary:Some(CrowdControl::Charm),
            cc_secondary:None,impact_tick:Some(2)},
        (AsheR,CleanHit) => Expected{accept:true,mana_after_cast:mana,primary_hp:1300,
            secondary_hp:None,minion_hp:None,cc_primary:Some(CrowdControl::Stun),
            cc_secondary:None,impact_tick:Some(3)},
        (_,PrimarySpellShield) => Expected{accept:true,mana_after_cast:mana,primary_hp:1500,
            secondary_hp:None,minion_hp:None,cc_primary:None,
            cc_secondary:None,impact_tick:None},
        (AhriE,LaneMinion) => Expected{accept:true,mana_after_cast:mana,primary_hp:1500,
            secondary_hp:None,minion_hp:Some(820),cc_primary:None,
            cc_secondary:None,impact_tick:None},
        (AsheR,LaneMinion) => Expected{accept:true,mana_after_cast:mana,primary_hp:1300,
            secondary_hp:None,minion_hp:Some(900),cc_primary:Some(CrowdControl::Stun),
            cc_secondary:None,impact_tick:Some(3)},
        (_,EnemyProjectileBarrier)|(_,AtlasWall)|(_,BeyondRange) =>
            Expected{accept:true,mana_after_cast:mana,primary_hp:1500,
                secondary_hp:None,minion_hp:None,cc_primary:None,
                cc_secondary:None,impact_tick:None},
        (AsheR,SecondarySplash) => Expected{accept:true,mana_after_cast:mana,primary_hp:1300,
            secondary_hp:Some(1430),minion_hp:None,cc_primary:Some(CrowdControl::Stun),
            cc_secondary:Some(CrowdControl::Slow),impact_tick:Some(3)},
        (AsheR,SecondarySplashShield) => Expected{accept:true,mana_after_cast:mana,primary_hp:1300,
            secondary_hp:Some(1500),minion_hp:None,cc_primary:Some(CrowdControl::Stun),
            cc_secondary:None,impact_tick:Some(3)},
        _ => Expected{accept:false,mana_after_cast:1000,primary_hp:1500,
            secondary_hp:None,minion_hp:None,cc_primary:None,
            cc_secondary:None,impact_tick:None},
    }
}
/// Actual migration gate: call only with the real engine adapter when crates exist.
/// Exact HP, CC and tick expectations are source-oracle facts for synthetic setups.
/// This does not check fog, real server, spell shield consumption or replay hashes;
/// those need independent native/WASM and two-seat integration tests.
pub fn check_runner<R: AuthoredProjectileRunner>(runner: &mut R)
    -> Result<usize, String>
{
    let mut passed=0;
    for seat in [Seat::Blue, Seat::Red] {
        for f in FIXTURES {
            let actual = runner.run_case(seat, f);
            let want=expected(f);
            if actual != want {
                return Err(format!("S13 authored projectile {} {:?}: expected {:?}, got {:?}",
                    f.id,seat,want,actual));
            }
            passed+=1;
        }
    }
    Ok(passed)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn typed_cases_are_distinct_and_source_pinned() {
        let mut ids = std::collections::BTreeSet::new();
        for f in FIXTURES { assert!(ids.insert(f.id)); assert!(expected(f).accept); }
        assert_eq!(ids.len(), 13);
        // This is data integrity only; no projectile gameplay is executed.
    }
    #[test]
    fn near_far_and_minion_contracts_do_not_collapse_to_generic_projectile() {
        assert_ne!(expected(FIXTURES[0]), expected(FIXTURES[6]));
        assert_ne!(expected(FIXTURES[2]), expected(FIXTURES[8]));
        assert_eq!(expected(FIXTURES[0]).impact_tick, Some(2));
        assert_eq!(expected(FIXTURES[6]).impact_tick, Some(3));
    }
}
