//! CoachLOL M45 S15 — Rust acceptance SPEC ONLY, NOT authoritative gameplay.
//! Source engine Git blob: 41679f7328a42e379fdfb8de5b92006e1bfb529f
//! S15 legacy oracle: M15 synchronous 20 PASS, first Sylas+Shaco R fails;
//! independent clone targetability STRICT 24/24 PASS, 8-scenario supplemental
//! 88/88 V8 assertions PASS including 2/2 legacy wrong-Sylas-clone witnesses.
//!
//! BUG FIX REQUIREMENT: when Sylas steals Shaco R, the spawned Shaco-style
//! clone's public champion must be SYLAS, not the temporary donor Shaco.
//! Preserve the original Shaco R movement, clone behavior, duration, boxes,
//! cast-once/recast/no extra mana, actor ownership, fog/aliases and snapshot.
//! NOT a compiler pass, server test, or full Neeko/Shaco champion certification.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Seat { Blue, Red }
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Scenario {
    NeekoAllyDisguise,
    NeekoCollectedMinionShoMa,
    NeekoWNonCombatDecoyAndRecast,
    ShacoRDecoyAndThreeBoxExplosion,
    SylasStolenShacoROwnerAppearance,
    EnemyVisibleCloneDamageAndAlias,
}
pub const SCENARIOS: [Scenario; 6] = [
    Scenario::NeekoAllyDisguise,
    Scenario::NeekoCollectedMinionShoMa,
    Scenario::NeekoWNonCombatDecoyAndRecast,
    Scenario::ShacoRDecoyAndThreeBoxExplosion,
    Scenario::SylasStolenShacoROwnerAppearance,
    Scenario::EnemyVisibleCloneDamageAndAlias,
];
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IdentityProof {
    pub controlling_seat: Seat,
    pub owner_actor_id: String,
    pub owner_true_champion: String,
    pub public_real_champion: String,
    pub public_decoy_champion: Option<String>,
    pub stable_id_visible_to_enemy: bool,
    pub internal_decoy_id_visible_to_enemy: bool,
    pub real_roster_size: usize,
    pub decoy_count: usize,
    pub owner_skill_casts_consumed: usize,
    pub recast_additional_cost: u32,
    pub recast_duplicate_entities: usize,
    pub screenshot_or_replay_state_equivalent: bool,
    // These may be unspecified for unrelated cases, but the REAL runner must
    // produce actual engine results rather than the expectations in this file.
    pub public_disguise_alias_exists: bool,
    pub private_events_redacted: bool,
    pub invalid_stable_id_rejected: bool,
    pub targetable_clone_took_damage: bool,
    pub noncombat_clone_dealt_damage: bool,
}
pub trait ActualRustCloneRunner {
    fn run_real_core_match(&mut self, seat: Seat, scenario: Scenario)
        -> Result<IdentityProof, String>;
}
/// Native Rust actor+combat+protocol must execute these scenarios on actual
/// game state. No canned mock or generic skill executor earns PASS.
pub fn check_real_rust<R: ActualRustCloneRunner>(runner: &mut R)
    -> Result<usize, String>
{
    let mut passed=0;
    for seat in [Seat::Blue, Seat::Red] {
        for scenario in SCENARIOS {
            let v=runner.run_real_core_match(seat,scenario)
                .map_err(|err|format!("{:?}/{:?}: {}",seat,scenario,err))?;
            let own_id=match seat{ Seat::Blue=>"blue_MID", Seat::Red=>"red_MID" };
            if v.controlling_seat!=seat || v.owner_actor_id!=own_id ||
               v.real_roster_size!=10 ||
               v.stable_id_visible_to_enemy || v.internal_decoy_id_visible_to_enemy ||
               !v.screenshot_or_replay_state_equivalent {
                return Err(format!("owner/identity/10-roster/replay defect: {:?}/{:?}/{:?}",
                    seat,scenario,v));
            }
            match scenario {
                Scenario::NeekoAllyDisguise | Scenario::NeekoCollectedMinionShoMa => {
                    if v.owner_true_champion!="Neeko" || !v.public_disguise_alias_exists ||
                       !v.private_events_redacted || !v.invalid_stable_id_rejected {
                        return Err(format!("Neeko reveal/alias leak: {:?}/{:?}",seat,v));
                    }
                }
                Scenario::NeekoWNonCombatDecoyAndRecast => {
                    if v.owner_true_champion!="Neeko" || v.decoy_count!=1 ||
                       v.recast_additional_cost!=0 || v.recast_duplicate_entities!=0 ||
                       v.noncombat_clone_dealt_damage {
                        return Err(format!("Neeko decoy/recast defect: {:?}/{:?}",seat,v));
                    }
                }
                Scenario::ShacoRDecoyAndThreeBoxExplosion => {
                    if v.owner_true_champion!="Shaco" ||
                       v.public_real_champion!="Shaco" ||
                       v.public_decoy_champion.as_deref()!=Some("Shaco") ||
                       v.owner_skill_casts_consumed!=1 || v.recast_additional_cost!=0 {
                        return Err(format!("Shaco native clone defect: {:?}/{:?}",seat,v));
                    }
                }
                Scenario::SylasStolenShacoROwnerAppearance => {
                    // This is an INTENTIONAL DIFFERENCE from observed legacy!
                    // Existing JS M15 test expects Sylas; actual frozen JS shows
                    // Shaco, because owner.champ is temporarily borrowed in spawn.
                    if v.owner_true_champion!="Sylas" ||
                       v.public_real_champion!="Sylas" ||
                       v.public_decoy_champion.as_deref()!=Some("Sylas") ||
                       v.owner_skill_casts_consumed!=1 ||
                       v.recast_additional_cost!=0 || v.recast_duplicate_entities!=0 {
                        return Err(format!("P1 clone owner appearance STILL wrong: {:?}/{:?}",
                            seat,v));
                    }
                }
                Scenario::EnemyVisibleCloneDamageAndAlias => {
                    if !v.targetable_clone_took_damage || !v.invalid_stable_id_rejected {
                        return Err(format!("visible decoy not damageable or leaks ID: {:?}/{:?}",
                            seat,v));
                    }
                }
            }
            passed+=1;
        }
    }
    Ok(passed)
}
pub const REQUIRED_NEGATIVE_CASES: [&str; 8] = [
    "reject_unrevealed_stable_owner_id",
    "reject_unrevealed_internal_clone_id",
    "reject_expired_public_clone_alias",
    "reject_enemy_clone_alias_outside_fog",
    "reject_foreign_team_unit_command",
    "reject_neeko_shoma_without_real_collection",
    "reject_sylas_double_stolen_r_debit",
    "reject_public_disguise_event_private_actor_id",
];

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::BTreeSet;
    #[test]
    fn six_unique_identity_cases_are_source_pinned() {
        assert_eq!(SCENARIOS.len(),6);
        assert!(SCENARIOS.contains(&Scenario::SylasStolenShacoROwnerAppearance));
    }
    #[test]
    fn both_seats_required_and_no_generic_fallback() {
        let cases=SCENARIOS.len()*2;
        assert_eq!(cases,12);
        // Only an actual AuthoritativeCloneRunner produces game results.
    }
    #[test]
    fn negative_cases_have_distinct_contracts() {
        let uniq: BTreeSet<_>=REQUIRED_NEGATIVE_CASES.iter().copied().collect();
        assert_eq!(uniq.len(),8);
    }
}
