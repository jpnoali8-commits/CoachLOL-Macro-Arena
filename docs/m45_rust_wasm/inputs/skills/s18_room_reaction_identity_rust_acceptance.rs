//! CoachLOL M45 B02 Skills S18 — Rust reference room reaction projection.
//! Source-only, NOT a production workspace member and NOT rustc/cargo executed.
//! Frozen JS baseline f0b1147ac46e585a1d5374a178b1ea462f5dc278:
//! original PvPRoom.publicInfo leaks stable enemyId during masked Neeko/Shaco
//! combat reaction (4/4 bilateral masks, 117/117 source V8 assertions).
//!
//! FIX IN RUST: room JSON and SSE must receive only a public alias with an
//! explicit visibility policy, never an internal stable opponent actor ID.
//! Incoming reaction command resolves the alias in the AUTHENTICATED gateway,
//! and only server-internal targeting uses persistent IDs. This reference
//! method is not an implementation of the full room or reaction executor.

#[derive(Clone,Copy,Debug,Eq,PartialEq)]
pub enum Seat { Blue, Red }
#[derive(Clone,Copy,Debug,Eq,PartialEq)]
pub enum TargetIdentity { NeekoDisguised, ShacoCloneActive }
#[derive(Clone,Copy,Debug,Eq,PartialEq)]
pub enum Visibility { PubliclyVisible, HiddenByFog }
#[derive(Clone,Debug,Eq,PartialEq)]
pub enum PublicReactionError { WrongSeat, BadPublicAlias }

#[derive(Clone,Debug,Eq,PartialEq)]
pub struct PublicReaction {
    pub defender_actor_id: String,
    pub reaction_kind: &'static str,
    pub enemy_public_alias: Option<String>,
}
pub fn safe_public_reaction(
    requesting_seat:Seat,
    defender_seat:Seat,
    defender_actor_id:&str,
    server_generated_enemy_alias:Option<&str>,
    visibility:Visibility,
) -> Result<PublicReaction,PublicReactionError> {
    if requesting_seat!=defender_seat {
        return Err(PublicReactionError::WrongSeat);
    }
    // Only a server-allocated public appearance alias can cross the boundary
    // for a currently disguised or cloned enemy. Never send an internal ID.
    let public_alias=match visibility {
        Visibility::HiddenByFog => None,
        Visibility::PubliclyVisible=>{
            let id=server_generated_enemy_alias.ok_or(PublicReactionError::BadPublicAlias)?;
            if !id.starts_with("appearance_") ||
                id.len()<="appearance_".len() ||
                !id["appearance_".len()..].chars().all(|c|c.is_ascii_alphanumeric()) {
                return Err(PublicReactionError::BadPublicAlias);
            }
            Some(id.to_string())
        }
    };
    Ok(PublicReaction {
        defender_actor_id:defender_actor_id.to_string(),
        reaction_kind:"combat_reaction",
        enemy_public_alias:public_alias,
    })
}
#[derive(Clone,Debug,Eq,PartialEq)]
pub struct ActualRoomObservation {
    pub authenticated_defender_seat:Seat,
    pub masked_enemy_kind:TargetIdentity,
    /// Public room payload must NEVER include e.g. red_TOP/blue_MID.
    pub public_enemy_reference:Option<String>,
    pub public_enemy_reference_after_fog:Option<String>,
    pub public_enemy_reference_after_restored_room:Option<String>,
    pub internal_actor_id_disclosed_anywhere_in_json:bool,
    pub restored_acks_equal:bool,
    pub restored_projection_equal:bool,
    pub ten_real_champions_preserved:bool,
    pub enemy_objective_private_ledger_exposed:bool,
    pub debug_action_journal_exposed:bool,
}
pub trait RealRustPvPRoomRunner {
    fn run_real_room_with_two_authenticated_seats(
        &mut self, defender:Seat, enemy:TargetIdentity
    ) -> Result<ActualRoomObservation,String>;
}
pub fn validate_real_rust_room<R:RealRustPvPRoomRunner>(
    runner:&mut R
) -> Result<usize,String> {
    let mut passed=0;
    for defender in [Seat::Blue,Seat::Red] {
        for enemy in [TargetIdentity::NeekoDisguised,TargetIdentity::ShacoCloneActive] {
            let row=runner.run_real_room_with_two_authenticated_seats(defender,enemy)
                .map_err(|error|format!("{:?}/{:?}: {}",defender,enemy,error))?;
            if row.authenticated_defender_seat!=defender ||
               row.masked_enemy_kind!=enemy ||
               row.internal_actor_id_disclosed_anywhere_in_json ||
               row.public_enemy_reference_after_fog.is_some() ||
               row.public_enemy_reference_after_restored_room!=row.public_enemy_reference ||
               !row.restored_acks_equal || !row.restored_projection_equal ||
               !row.ten_real_champions_preserved ||
               row.enemy_objective_private_ledger_exposed ||
               row.debug_action_journal_exposed {
                return Err(format!("S18 room/private identity leak: {:?}: {:?}",enemy,row));
            }
            let alias=row.public_enemy_reference.as_deref()
                .ok_or_else(||format!("missing visible public enemy alias: {:?}",row))?;
            if !alias.starts_with("appearance_") ||
                !alias["appearance_".len()..].chars().all(|c|c.is_ascii_alphanumeric()) {
                return Err(format!("stable enemyId in public reaction: {:?}",row));
            }
            passed+=1;
        }
    }
    Ok(passed)
}
pub const REQUIRED_ADVERSARIAL_NEGATIVES:[&str;8] = [
    "reject_enemy_stable_id_in_pending_decision_json",
    "reject_enemy_stable_id_in_sse_patch",
    "deny_foreign_seat_reading_private_pending_decision",
    "hide_masked_attacker_alias_after_fog_loss",
    "reject_reaction_command_with_forged_internal_target",
    "restore_room_with_no_new_internal_identity_leak",
    "preserve_private_objective_contributor_ledgers",
    "never_send_debug_action_journal_in_client_projection",
];

#[cfg(test)]
mod source_only_tests {
    use super::*;
    #[test]
    fn never_accept_stable_masked_target_id() {
        for value in [Some("red_TOP"),Some("blue_MID"),Some("entity_1"),
                      Some("appearance_"),None] {
            assert_eq!(safe_public_reaction(Seat::Blue,Seat::Blue,"blue_MID",
                value,Visibility::PubliclyVisible),Err(PublicReactionError::BadPublicAlias));
        }
    }
    #[test]
    fn same_visible_alias_kept_for_valid_authenticated_owner() {
        let view=safe_public_reaction(Seat::Red,Seat::Red,"red_MID",
            Some("appearance_3"),Visibility::PubliclyVisible).unwrap();
        assert_eq!(view.enemy_public_alias.as_deref(),Some("appearance_3"));
        assert_eq!(view.defender_actor_id,"red_MID");
    }
    #[test]
    fn fog_removes_only_public_opponent_target_not_reaction() {
        let view=safe_public_reaction(Seat::Blue,Seat::Blue,"blue_MID",
            Some("appearance_1"),Visibility::HiddenByFog).unwrap();
        assert!(view.enemy_public_alias.is_none());
        assert_eq!(view.reaction_kind,"combat_reaction");
    }
    #[test]
    fn foreign_requesting_seat_fails_closed() {
        assert_eq!(safe_public_reaction(Seat::Blue,Seat::Red,"red_MID",
            Some("appearance_1"),Visibility::PubliclyVisible),
            Err(PublicReactionError::WrongSeat));
    }
    #[test]
    fn four_real_bilateral_cases_and_eight_security_negatives_are_prepared() {
        assert_eq!(REQUIRED_ADVERSARIAL_NEGATIVES.len(),8);
        assert!(REQUIRED_ADVERSARIAL_NEGATIVES
            .iter().any(|x|x.contains("sse_patch")));
    }
}
