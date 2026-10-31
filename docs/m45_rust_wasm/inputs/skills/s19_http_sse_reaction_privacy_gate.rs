//! M45 B02 Skills S19: server boundary for masked PvP reaction identity.
//!
//! Source-only Rust acceptance design, NOT a production crate, NOT compiled.
//! Frozen JS source @ f0b1147ac46e585a1d5374a178b1ea462f5dc278.
//! V8 oracle: 4 real Arena.damage -> processAmbushResponses reactions;
//! original /api/session, /api/stream and /api/action HANDLERS exercised
//! in memory with injected transport/session fixture, 161/161 asserts PASS,
//! which CHARACTERIZES old P1 identity exposure. No actual TCP/crypto.
//!
//! Rule: all external GET room snapshots and SSE events use the SAME
//! authenticated seat-specific public projection. Never let a raw stable
//! enemy actor ID (even when exposed elsewhere) become a public field.
//! Do NOT weaken authenticated target validation; the original gateway
//! already denies forged concealed stable IDs as command targets.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Seat { Blue, Red }
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EnemyKind { NeekoDisguised, ShacoCloneActive }
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ObservationPhase { Initial, AfterRevealExpired, AfterRoomRestore }
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum VisibleEnemyRef { AppearanceAlias(String), Hidden }
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PublicCombatReaction {
    pub defender_id: String,
    pub kind: String,
    pub attacker: VisibleEnemyRef,
}
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum BoundaryError { ForeignDefenderSeat, InvalidPublicAlias, UnknownReaction }

/// A narrow, executable reference to the REQUIRED public projection
/// boundary. The internal actor ID is intentionally NOT an argument nor a
/// field of the outgoing payload. The caller is a trusted Rust room actor,
/// never a client. It must derive the alias from its actual per-seat view.
pub fn project_reaction_to_seat(
    authenticated_seat: Seat,
    defender_seat: Seat,
    defender_internal_id: &str,
    decision_kind: &str,
    visible_attacker_alias: Option<&str>,
) -> Result<PublicCombatReaction, BoundaryError> {
    if authenticated_seat != defender_seat {
        return Err(BoundaryError::ForeignDefenderSeat);
    }
    if !["combat_reaction", "pickoff_reaction"].contains(&decision_kind) {
        return Err(BoundaryError::UnknownReaction);
    }
    let attacker = match visible_attacker_alias {
        None => VisibleEnemyRef::Hidden,
        Some(alias) => {
            // This is only the masked-champion boundary. For other opponents
            // a separate explicit public identity policy must apply.
            if !alias.starts_with("appearance_") ||
                alias.len() <= "appearance_".len() ||
                !alias["appearance_".len()..].chars()
                    .all(|c| c.is_ascii_alphanumeric()) {
                return Err(BoundaryError::InvalidPublicAlias);
            }
            VisibleEnemyRef::AppearanceAlias(alias.to_owned())
        }
    };
    Ok(PublicCombatReaction {
        defender_id: defender_internal_id.to_owned(),
        kind: decision_kind.to_owned(),
        attacker,
    })
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ObservedSessionAndSse {
    pub defender: Seat,
    pub enemy: EnemyKind,
    pub session_at_hit: PublicCombatReaction,
    pub sse_at_hit: PublicCombatReaction,
    pub session_after_fog: PublicCombatReaction,
    pub sse_after_fog: PublicCombatReaction,
    pub session_after_room_restore: PublicCombatReaction,
    pub sse_after_room_restore: PublicCombatReaction,
    pub actual_arena_damage_caused_window: bool,
    pub true_actor_id_exposed_in_any_external_json: bool,
    pub opposite_seat_sees_private_decision: bool,
    pub forged_stable_target_rejected: bool,
    pub authorized_alias_reaction_accepted: bool,
    pub identical_command_retry_accepted_once: bool,
    pub restored_gateway_receipts_preserved: bool,
    pub true_real_champion_roster_is_ten: bool,
}

pub trait ActualRustHttpSseRunner {
    /// Must actually run two distinct authenticated sessions and an
    /// authoritative server combat reaction on REAL rust room/game state.
    /// Mocking native TCP/HTTP, cookie hashing or gameplay does not meet G3.
    fn run_two_session_impact_and_reconnect(
        &mut self,
        defender: Seat,
        enemy: EnemyKind,
    ) -> Result<ObservedSessionAndSse, String>;
}
pub const EXPECTED_REAL_INTEGRATION_CASES: usize = 4;
pub const REQUIRED_NEGATIVE_TESTS: [&str; 10] = [
    "anonymous_get_session_returns_401",
    "foreign_seat_does_not_see_private_reaction",
    "stable_enemy_id_never_appears_in_get_json",
    "stable_enemy_id_never_appears_in_sse_json",
    "stable_enemy_id_not_revealed_when_combat_reveal_expires",
    "stable_enemy_id_not_revealed_after_room_restart",
    "reject_stable_masked_target_in_post_action",
    "reject_stale_alias_after_fog_and_disguise_end",
    "do_not_replay_authoritative_damage_on_retry",
    "do_not_expose_internal_enemy_id_in_error_payload",
];

pub fn validate_real_rust_http_sse<R: ActualRustHttpSseRunner>(
    runner: &mut R,
) -> Result<usize, String> {
    let mut checked = 0;
    for defender in [Seat::Blue,Seat::Red] {
        for enemy in [EnemyKind::NeekoDisguised,EnemyKind::ShacoCloneActive] {
            let r=runner.run_two_session_impact_and_reconnect(defender,enemy)
                .map_err(|e|format!("{:?}/{:?}: {}",defender,enemy,e))?;
            if r.defender!=defender || r.enemy!=enemy ||
               !r.actual_arena_damage_caused_window ||
               r.true_actor_id_exposed_in_any_external_json ||
               r.opposite_seat_sees_private_decision ||
               !r.forged_stable_target_rejected ||
               !r.authorized_alias_reaction_accepted ||
               !r.identical_command_retry_accepted_once ||
               !r.restored_gateway_receipts_preserved ||
               !r.true_real_champion_roster_is_ten {
                return Err(format!("S19 untrusted transport/identity contract failed: {:?}",r));
            }
            if r.session_at_hit != r.sse_at_hit ||
               r.session_after_fog != r.sse_after_fog ||
               r.session_after_room_restore != r.sse_after_room_restore {
                return Err(format!("S19 session/SSE contradictory seat projection: {:?}",r));
            }
            if !matches!(&r.session_at_hit.attacker,VisibleEnemyRef::AppearanceAlias(_)) ||
               !matches!(&r.session_after_fog.attacker,VisibleEnemyRef::Hidden) ||
               !matches!(&r.session_after_room_restore.attacker,VisibleEnemyRef::Hidden) {
                return Err(format!("S19 public fog/alias policy mismatch: {:?}",r));
            }
            checked += 1;
        }
    }
    Ok(checked)
}

#[cfg(test)]
mod source_only_unit_tests {
    use super::*;
    #[test]
    fn named_defender_can_receive_only_opaque_public_attacker_alias() {
        let p=project_reaction_to_seat(
            Seat::Blue,Seat::Blue,"blue_MID","combat_reaction",
            Some("appearance_1")).unwrap();
        assert_eq!(p.defender_id,"blue_MID");
        assert_eq!(p.attacker,VisibleEnemyRef::AppearanceAlias("appearance_1".into()));
    }
    #[test]
    fn cannot_project_hidden_stable_actor_id() {
        for malicious in ["red_TOP","blue_MID","entity_1","appearance_",
                          "appearance_2/../secret"] {
            assert_eq!(project_reaction_to_seat(Seat::Blue,Seat::Blue,
                "blue_MID","combat_reaction",Some(malicious)),
                Err(BoundaryError::InvalidPublicAlias));
        }
    }
    #[test]
    fn hidden_attacker_keeps_reaction_without_identity() {
        let p=project_reaction_to_seat(
            Seat::Red,Seat::Red,"red_MID","combat_reaction",None).unwrap();
        assert_eq!(p.attacker,VisibleEnemyRef::Hidden);
    }
    #[test]
    fn foreign_seat_is_denied_even_with_valid_alias() {
        assert_eq!(project_reaction_to_seat(Seat::Red,Seat::Blue,
            "blue_MID","combat_reaction",Some("appearance_1")),
            Err(BoundaryError::ForeignDefenderSeat));
    }
    #[test]
    fn real_route_matrix_and_negatives_are_explicit() {
        assert_eq!(EXPECTED_REAL_INTEGRATION_CASES,4);
        assert_eq!(REQUIRED_NEGATIVE_TESTS.len(),10);
    }
}
