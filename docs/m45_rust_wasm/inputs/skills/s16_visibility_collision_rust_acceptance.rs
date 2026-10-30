//! CoachLOL Macro Arena M45 B02 Skills S16 — typed migration acceptance.
//! Not a crate/workspace member, NOT compiled and NOT an authored combat engine.
//! Frozen JS oracle f0b1147ac46e585a1d5374a178b1ea462f5dc278.
//! Source-only S16 evidence: 18 scenarios, 295 V8 assertion checks passed.
//! No actual Rust, WASM, HTTP, browser or real fog has been certified.
//!
//! IMPORTANT: source uses canSeePoint(attackerTeam,clone) in the SERVER combat
//! pool. Whether an unseen decoy must still intercept an in-flight line
//! missile is a deliberate pending LoL-physics design decision. The reference
//! results are NOT the intended behavior and this model cannot certify fog.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Team { Blue, Red }
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Identity {
    ConcurrentNeekoShacoAliases,
    AhriEvsNeekoW,
    AhriEvsShacoR,
    AsheRvsNeekoW,
    AsheRvsShacoR,
}
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Vision { VisibleAtImpact, LostBeforeImpact }
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Case { pub team: Team, pub identity: Identity, pub vision: Vision }

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WorldObservation {
    /// True actor IDs and owner seat must be retained only in server state.
    pub seat: Team,
    pub roster: usize,
    pub distinct_visible_aliases: usize,
    pub stable_actor_ids_exposed: bool,
    pub internal_clone_ids_exposed: bool,
    pub stale_alias_action_accepted: bool,
    pub enemy_attack_fog_hidden_alias_accepted: bool,
    pub request_replay_double_committed: bool,
    pub snapshot_roundtrip_equivalent: bool,
    pub champion_behind_decoy_hp: i32,
    pub clone_hp: i32,
    pub projectile_terminated: bool,
}

pub trait ActualAuthoritativeRustMatchRunner {
    fn run_actual_match_case(&mut self, input: Case)
        -> Result<WorldObservation, String>;
}

pub const VISIBLE_PROJECTILE_CASES: [Identity; 4] = [
    Identity::AhriEvsNeekoW, Identity::AhriEvsShacoR,
    Identity::AsheRvsNeekoW, Identity::AsheRvsShacoR,
];
pub const SOURCE_VISIBLE_CLONE_HP: [i32;4] = [1420,1380,1300,1200];
pub const SOURCE_HIDDEN_CLONE_HP: [i32;4] = [1500,1500,1500,1500];
pub const SOURCE_HIDDEN_ASHE_OWNER_HP: [i32;2] = [1346,1348];

pub fn planned_cases() -> Vec<Case> {
    let mut all = Vec::with_capacity(18);
    for team in [Team::Blue, Team::Red] {
        all.push(Case { team, identity:Identity::ConcurrentNeekoShacoAliases,
            vision:Vision::VisibleAtImpact });
        for identity in VISIBLE_PROJECTILE_CASES {
            for vision in [Vision::VisibleAtImpact,Vision::LostBeforeImpact] {
                all.push(Case { team, identity, vision });
            }
        }
    }
    all
}

/// Gate for findings *not under disputed fog collision semantics*. The caller
/// must run real core-combat/core-champions/core-protocol and supply observations.
/// This routine DOES NOT implement spells, move entities or create fake outcomes.
pub fn check_uncontested_properties<R:ActualAuthoritativeRustMatchRunner>(
    runner:&mut R,
) -> Result<usize,String> {
    let mut checked=0;
    for case in planned_cases(){
        let observed=runner.run_actual_match_case(case)
            .map_err(|e| format!("{:?}: {}",case,e))?;
        if observed.seat != case.team || observed.roster != 10 ||
            observed.stable_actor_ids_exposed ||
            observed.internal_clone_ids_exposed ||
            observed.stale_alias_action_accepted ||
            observed.enemy_attack_fog_hidden_alias_accepted ||
            observed.request_replay_double_committed ||
            !observed.snapshot_roundtrip_equivalent {
            return Err(format!("privacy/ownership/replay mismatch {:?}: {:?}",case,observed));
        }
        if case.identity == Identity::ConcurrentNeekoShacoAliases {
            if observed.distinct_visible_aliases != 3 {
                return Err(format!("concurrent public aliases collided: {:?}",observed));
            }
        } else if case.vision==Vision::VisibleAtImpact {
            let idx=VISIBLE_PROJECTILE_CASES.iter()
                .position(|x| *x==case.identity).ok_or("unknown fixture")?;
            if observed.clone_hp!=SOURCE_VISIBLE_CLONE_HP[idx] ||
                observed.champion_behind_decoy_hp!=1500 ||
                !observed.projectile_terminated {
                return Err(format!("visible authored projectile mismatch {:?}: {:?}",case,observed));
            }
        } else {
            // Keep this observation separate from acceptance. No automatic
            // interpretation of source invisibility-collision as intended.
            // The native integration MUST report exact swept collision data
            // for both source state and selected gameplay physics rule.
        }
        checked+=1;
    }
    Ok(checked)
}
/// Unresolved: should an unseen physical clone intercept a line missile?
/// Frozen JS says NO for these scenarios. It uses viewer canSeePoint in
/// boardCombatEnemyPoolV453Dev69 (around original engine line 4076),
/// even though authored missiles are authoritative world objects.
/// Resolve this at core-combat design time; any behavior change must have
/// versioned goldens and real two-seat replay/visibility tests.
pub const OPEN_GATE: &str = "S16_VISIBILITY_DEPENDENT_PROJECTILE_CLONE_COLLISION";
pub const REQUIRED_ADVERSARIAL_NEGATIVE_CASES: [&str; 8] = [
    "enemy_stable_neeko_id_rejected_while_disguised",
    "enemy_stable_shaco_id_rejected_while_cloned",
    "enemy_internal_clone_entity_id_rejected",
    "expired_clone_public_alias_rejected",
    "fog_hidden_public_alias_rejected",
    "old_shaco_owner_alias_rejected_after_clone_expiry",
    "neeko_alias_rejected_after_disguise_cancelled",
    "same_sequence_different_alias_payload_rejected",
];

#[cfg(test)]
mod source_data_only_tests {
    use super::*;
    #[test]
    fn fixture_plan_is_bilateral_and_has_no_duplicate() {
        let f=planned_cases();
        assert_eq!(f.len(),18);
        assert_eq!(f.iter().filter(|x|x.team==Team::Blue).count(),9);
        assert_eq!(f.iter().filter(|x|x.team==Team::Red).count(),9);
        assert_eq!(f.iter().filter(|x|x.vision==Vision::LostBeforeImpact).count(),8);
    }
    #[test]
    fn champion_specific_clone_damage_remains_distinct() {
        assert_eq!(SOURCE_VISIBLE_CLONE_HP,[1420,1380,1300,1200]);
        assert_eq!(SOURCE_HIDDEN_ASHE_OWNER_HP,[1346,1348]);
    }
    #[test]
    fn uncertainty_and_negative_security_gates_are_explicit() {
        assert_eq!(REQUIRED_ADVERSARIAL_NEGATIVE_CASES.len(),8);
        assert_eq!(OPEN_GATE,"S16_VISIBILITY_DEPENDENT_PROJECTILE_CLONE_COLLISION");
    }
}
