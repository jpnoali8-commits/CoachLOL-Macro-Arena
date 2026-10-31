//! M45 B02B-I08: private fail-closed bridge from authored source to skill admission.
//! This is NOT a complete champion registry and is NOT a combat or client WASM API.
//! Inputs in ServerCastFacts must be DERIVED by an authenticated Rust match server.
//! The browser cannot choose a shape, a champion, ownership, visibility or readiness.
use crate::skill_admission::{
    AdmissionDecision, AdmissionReceipt, SkillAdmission, SkillAim, SkillRequest, SkillSlot,
    TargetShape, MAX_ID_BYTES,
};
use crate::Team;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WireSkillRequest {
    pub turn: u32,
    pub request_id: String,
    pub actor_id: String,
    pub slot: SkillSlot,
    pub aim: SkillAim,
}

/// All fields here are trusted facts created by the future native game-server.
/// The target team MUST come from a server-owned lookup of the supplied target ID.
/// Range, fog, cooldown and resource predicates MUST be computed by the server,
/// never accepted as boolean flags provided in a client action packet.
#[derive(Debug, Clone, Copy)]
pub(crate) struct ServerCastFacts<'a> {
    pub authenticated_seat: Team,
    pub actor_owner: Team,
    pub actor_champion: &'a str,
    pub target_team: Option<Team>,
    pub target_visible_to_seat: bool,
    pub learned_rank: u8,
    pub range_checked: bool,
    pub cooldown_ready: bool,
    pub resource_ready: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WireRejection {
    AbilityNotMigrated,
    ActorNotFound,
    ActorDead,
    WrongOwner,
    InvalidAim,
    InvalidTarget,
    RankNotLearned,
    OutOfRange,
    Cooldown,
    ResourceShortage,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum WireCastOutcome {
    Rejected(WireRejection),
    Admission(AdmissionReceipt),
}

/// Explicitly reconciled legacy source facts ONLY. All other champion+slot
/// combinations are blocked; never infer authorial execution from an API list.
pub fn known_authored_shape(champion: &str, slot: SkillSlot) -> Option<TargetShape> {
    match (champion, slot) {
        ("Nami", SkillSlot::W) => Some(TargetShape::TargetAny),
        ("Ahri", SkillSlot::E) => Some(TargetShape::LineEnemy),
        _ => None,
    }
}

fn canonicalize(
    facts: ServerCastFacts<'_>,
    request: WireSkillRequest,
) -> Result<SkillRequest, WireRejection> {
    let Some(shape) = known_authored_shape(facts.actor_champion, request.slot) else {
        return Err(WireRejection::AbilityNotMigrated);
    };
    let valid_aim = match (&shape, &request.aim) {
        (TargetShape::TargetAny, SkillAim::Unit(id)) => {
            !id.is_empty() && id.len() <= MAX_ID_BYTES
        }
        (TargetShape::LineEnemy, SkillAim::Direction { x, y }) => *x != 0 || *y != 0,
        (TargetShape::LineEnemy, SkillAim::Point { .. }) => true,
        _ => false,
    };
    if !valid_aim {
        return Err(WireRejection::InvalidAim);
    }
    Ok(SkillRequest {
        turn: request.turn,
        request_id: request.request_id,
        actor_id: request.actor_id,
        slot: request.slot,
        shape,
        aim: request.aim,
    })
}

fn check_server_facts(
    facts: ServerCastFacts<'_>,
    shape: TargetShape,
) -> Result<(), WireRejection> {
    if facts.authenticated_seat != facts.actor_owner {
        return Err(WireRejection::WrongOwner);
    }
    if shape == TargetShape::TargetAny
        && (facts.target_team.is_none()
            || (facts.target_team != Some(facts.authenticated_seat)
                && !facts.target_visible_to_seat))
    {
        return Err(WireRejection::InvalidTarget);
    }
    if facts.learned_rank == 0 {
        return Err(WireRejection::RankNotLearned);
    }
    if !facts.range_checked {
        return Err(WireRejection::OutOfRange);
    }
    if !facts.cooldown_ready {
        return Err(WireRejection::Cooldown);
    }
    if !facts.resource_ready {
        return Err(WireRejection::ResourceShortage);
    }
    Ok(())
}

impl SkillAdmission {
    /// Future server calls this after it resolves actor and target IDs.
    /// First canonicalize shape from the SERVER champion registry.
    /// Already admitted identical requests replay original ACK even after
    /// cooldown/visibility changes, without queuing another cast.
    /// Unknown or partial kits always fail closed, never generic fallback.
    pub(crate) fn admit_authorial(
        &mut self,
        facts: ServerCastFacts<'_>,
        request: WireSkillRequest,
    ) -> WireCastOutcome {
        let canonical = match canonicalize(facts, request) {
            Ok(canonical) => canonical,
            Err(error) => return WireCastOutcome::Rejected(error),
        };

        // Ownership is checked before any cached ACK can be replayed.
        if facts.authenticated_seat != facts.actor_owner {
            return WireCastOutcome::Rejected(WireRejection::WrongOwner);
        }

        if !self.has_receipt(facts.authenticated_seat, &canonical.request_id) {
            if let Err(error) = check_server_facts(facts, canonical.shape) {
                return WireCastOutcome::Rejected(error);
            }
        }
        WireCastOutcome::Admission(self.admit(
            facts.authenticated_seat,
            facts.actor_owner,
            canonical,
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn facts<'a>(seat: Team, champion: &'a str) -> ServerCastFacts<'a> {
        ServerCastFacts {
            authenticated_seat: seat,
            actor_owner: seat,
            actor_champion: champion,
            target_team: Some(seat),
            target_visible_to_seat: true,
            learned_rank: 1,
            range_checked: true,
            cooldown_ready: true,
            resource_ready: true,
        }
    }
    fn req(id: &str, slot: SkillSlot, aim: SkillAim) -> WireSkillRequest {
        WireSkillRequest {
            turn: 1,
            request_id: id.into(),
            actor_id: "mid".into(),
            slot,
            aim,
        }
    }

    #[test]
    fn nami_w_ally_and_enemy_both_seats_resolve_server_shape() {
        for seat in [Team::Blue, Team::Red] {
            for target_is_ally in [true, false] {
                let mut state = SkillAdmission::new(1);
                let mut context = facts(seat, "Nami");
                context.target_team = Some(if target_is_ally {
                    seat
                } else if seat == Team::Blue {
                    Team::Red
                } else {
                    Team::Blue
                });
                let ack = state.admit_authorial(
                    context,
                    req("w", SkillSlot::W, SkillAim::Unit("visible-target".into())),
                );
                assert!(matches!(
                    ack,
                    WireCastOutcome::Admission(AdmissionReceipt {
                        decision: AdmissionDecision::Queued,
                        cast_instance_id: Some(_),
                    })
                ));
                assert_eq!(state.pending_count(), 1);
            }
        }
    }

    #[test]
    fn nami_w_denies_invisible_enemy_and_missing_target() {
        for seat in [Team::Blue, Team::Red] {
            let mut a = SkillAdmission::new(1);
            let mut f = facts(seat, "Nami");
            f.target_team = Some(if seat == Team::Blue { Team::Red } else { Team::Blue });
            f.target_visible_to_seat = false;
            assert_eq!(
                a.admit_authorial(f, req("enemy", SkillSlot::W, SkillAim::Unit("enemy".into()))),
                WireCastOutcome::Rejected(WireRejection::InvalidTarget)
            );
            f.target_team = None;
            assert_eq!(
                a.admit_authorial(f, req("missing", SkillSlot::W, SkillAim::Unit("missing".into()))),
                WireCastOutcome::Rejected(WireRejection::InvalidTarget)
            );
            assert_eq!(a.pending_count(), 0);
        }
    }

    #[test]
    fn ahri_e_direction_and_map_point_are_typed_both_seats() {
        for seat in [Team::Blue, Team::Red] {
            for aim in [
                SkillAim::Direction { x: 300, y: 50 },
                SkillAim::Point { x: 700, y: 900 },
            ] {
                let mut a = SkillAdmission::new(1);
                let ack = a.admit_authorial(facts(seat, "Ahri"), req("e", SkillSlot::E, aim));
                assert!(matches!(
                    ack,
                    WireCastOutcome::Admission(AdmissionReceipt {
                        decision: AdmissionDecision::Queued,
                        cast_instance_id: Some(_),
                    })
                ));
                // No temporal projectile or CC is executed by this prototype.
                assert_eq!(a.in_flight_count(), 0);
            }
        }
    }

    #[test]
    fn mismatched_shape_or_unknown_kit_does_not_fallback() {
        let mut a = SkillAdmission::new(1);
        let invalid = a.admit_authorial(
            facts(Team::Blue, "Nami"),
            req("invalid", SkillSlot::W, SkillAim::Point { x: 12, y: 12 }),
        );
        assert_eq!(invalid, WireCastOutcome::Rejected(WireRejection::InvalidAim));
        assert_eq!(
            a.admit_authorial(
                facts(Team::Blue, "Nami"),
                req("partial", SkillSlot::Q, SkillAim::Unit("enemy".into())),
            ),
            WireCastOutcome::Rejected(WireRejection::AbilityNotMigrated)
        );
        assert_eq!(
            a.admit_authorial(
                facts(Team::Blue, "Bard"),
                req("bard", SkillSlot::R, SkillAim::Point { x: 20, y: 20 }),
            ),
            WireCastOutcome::Rejected(WireRejection::AbilityNotMigrated)
        );
        assert_eq!(a.pending_count(), 0);
    }

    #[test]
    fn stale_requests_keep_cached_ack_without_reexecution() {
        for seat in [Team::Blue, Team::Red] {
            let mut a = SkillAdmission::new(1);
            let f = facts(seat, "Nami");
            let input = req("once", SkillSlot::W, SkillAim::Unit("ally".into()));
            let ack = a.admit_authorial(f, input.clone());
            let mut changed_facts = f;
            changed_facts.cooldown_ready = false;
            changed_facts.resource_ready = false;
            changed_facts.range_checked = false;
            changed_facts.target_visible_to_seat = false;
            assert_eq!(a.admit_authorial(changed_facts, input.clone()), ack);
            let mut conflict = input;
            conflict.aim = SkillAim::Unit("another".into());
            assert_eq!(
                a.admit_authorial(changed_facts, conflict),
                WireCastOutcome::Admission(AdmissionReceipt {
                    decision: AdmissionDecision::RequestIdPayloadConflict,
                    cast_instance_id: None,
                })
            );
            assert_eq!(a.pending_count(), 1);
        }
    }

    #[test]
    fn no_admission_for_wrong_seat_or_unready_skill() {
        let mut a = SkillAdmission::new(1);
        let mut f = facts(Team::Blue, "Ahri");
        f.actor_owner = Team::Red;
        let cast = || req("id", SkillSlot::E, SkillAim::Direction { x: 10, y: 0 });
        assert_eq!(
            a.admit_authorial(f, cast()),
            WireCastOutcome::Rejected(WireRejection::WrongOwner)
        );
        f.actor_owner = Team::Blue;
        f.learned_rank = 0;
        assert_eq!(
            a.admit_authorial(f, cast()),
            WireCastOutcome::Rejected(WireRejection::RankNotLearned)
        );
        f.learned_rank = 1;
        f.range_checked = false;
        assert_eq!(
            a.admit_authorial(f, cast()),
            WireCastOutcome::Rejected(WireRejection::OutOfRange)
        );
        f.range_checked = true;
        f.cooldown_ready = false;
        assert_eq!(
            a.admit_authorial(f, cast()),
            WireCastOutcome::Rejected(WireRejection::Cooldown)
        );
        f.cooldown_ready = true;
        f.resource_ready = false;
        assert_eq!(
            a.admit_authorial(f, cast()),
            WireCastOutcome::Rejected(WireRejection::ResourceShortage)
        );
        assert_eq!(a.pending_count(), 0);
    }
}
