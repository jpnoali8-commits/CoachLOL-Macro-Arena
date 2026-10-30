//! M45 B02B-I09: server-side snapshot-backed PvP skill admission.
//! Native-only prototype. The server owns the snapshot; never deserialize
//! this structure from a client packet or publish it in client WASM / SSE.
//! This module admits intents only, NOT LoL spell effects or resource commits.
use crate::skill_admission::{SkillAdmission, SkillAim, SkillSlot, MAX_ID_BYTES};
use crate::skill_wire::{
    known_authored_shape, ServerCastFacts, WireCastOutcome, WireRejection,
    WireSkillRequest,
};
use crate::Team;
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct BoardPoint {
    pub x: i32,
    pub y: i32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ServerSkillSnapshot {
    pub rank: u8,
    pub ready_at_tick: u64,
    pub mana_cost: u32,
    /// This value is imported from a server-authored kit, NEVER the client.
    pub max_range: i32,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ServerUnitSnapshot {
    pub id: String,
    pub champion: String,
    pub team: Team,
    pub pos: BoardPoint,
    pub alive: bool,
    pub visible_to_blue: bool,
    pub visible_to_red: bool,
    pub mana: u32,
    /// Q/W/E/R in this order; authored values must be loaded by the server.
    pub skill: [ServerSkillSnapshot; 4],
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WorldSnapshotError {
    InvalidUnitId,
    DuplicateUnitId,
    InvalidRange,
}

/// Immutable-at-ingress snapshot, built from the authoritative match actor.
/// It does not enforce the roster of five champions or solve fog propagation.
#[derive(Debug, Clone)]
pub struct ServerSkillWorld {
    tick: u64,
    units: HashMap<String, ServerUnitSnapshot>,
}

impl ServerSkillWorld {
    /// Trusted server integration only. The browser MUST NOT supply these units.
    pub fn from_authoritative_units(
        tick: u64,
        units: impl IntoIterator<Item = ServerUnitSnapshot>,
    ) -> Result<Self, WorldSnapshotError> {
        let mut by_id = HashMap::new();
        for unit in units {
            if unit.id.is_empty() || unit.id.len() > MAX_ID_BYTES {
                return Err(WorldSnapshotError::InvalidUnitId);
            }
            if unit.skill.iter().any(|x| x.max_range < 0) {
                return Err(WorldSnapshotError::InvalidRange);
            }
            if by_id.insert(unit.id.clone(), unit).is_some() {
                return Err(WorldSnapshotError::DuplicateUnitId);
            }
        }
        Ok(Self { tick, units: by_id })
    }

    fn unit(&self, id: &str) -> Option<&ServerUnitSnapshot> {
        self.units.get(id)
    }

    fn visible_to(target: &ServerUnitSnapshot, seat: Team) -> bool {
        match seat {
            Team::Blue => target.visible_to_blue,
            Team::Red => target.visible_to_red,
        }
    }

    fn within_range(from: BoardPoint, to: BoardPoint, max_range: i32) -> bool {
        if max_range < 0 {
            return false;
        }
        // Convert BEFORE subtraction: i32 extremes must not overflow.
        let dx = i128::from(from.x) - i128::from(to.x);
        let dy = i128::from(from.y) - i128::from(to.y);
        let max = i128::from(max_range);
        dx * dx + dy * dy <= max * max
    }
}

fn slot_index(slot: SkillSlot) -> usize {
    match slot {
        SkillSlot::Q => 0,
        SkillSlot::W => 1,
        SkillSlot::E => 2,
        SkillSlot::R => 3,
    }
}

impl SkillAdmission {
    /// Only seat is supplied by the authenticated connection. Champion, team,
    /// fog, range, rank, mana and cooldown come from the server-owned snapshot.
    /// Two normal client routes share this one admission path; the future
    /// game-server still needs an atomic mana/CD commit and authored executor.
    pub fn admit_from_world(
        &mut self,
        world: &ServerSkillWorld,
        authenticated_seat: Team,
        request: WireSkillRequest,
    ) -> WireCastOutcome {
        let Some(actor) = world.unit(&request.actor_id) else {
            return WireCastOutcome::Rejected(WireRejection::ActorNotFound);
        };
        if actor.team != authenticated_seat {
            return WireCastOutcome::Rejected(WireRejection::WrongOwner);
        }

        let Some(_) = known_authored_shape(&actor.champion, request.slot) else {
            return WireCastOutcome::Rejected(WireRejection::AbilityNotMigrated);
        };
        let cached = self.has_receipt(authenticated_seat, &request.request_id);
        if !cached && !actor.alive {
            return WireCastOutcome::Rejected(WireRejection::ActorDead);
        }

        let spec = actor.skill[slot_index(request.slot)];
        // All values below are computed ONLY from trusted unit/target records.
        // Replayed requests skip readiness in admit_authorial, not ownership.
        let (target_team, target_visible, in_range) = match &request.aim {
            SkillAim::Unit(id) => match world.unit(id) {
                Some(target) if target.alive => (
                    Some(target.team),
                    ServerSkillWorld::visible_to(target, authenticated_seat),
                    ServerSkillWorld::within_range(actor.pos, target.pos, spec.max_range),
                ),
                _ => (None, false, false),
            },
            SkillAim::Point { x, y } => (
                None,
                false,
                ServerSkillWorld::within_range(
                    actor.pos,
                    BoardPoint { x: *x, y: *y },
                    spec.max_range,
                ),
            ),
            SkillAim::Direction { .. } => (None, false, spec.max_range > 0),
            SkillAim::SelfCast => (None, false, true),
        };
        let facts = ServerCastFacts {
            authenticated_seat,
            actor_owner: actor.team,
            actor_champion: &actor.champion,
            target_team,
            target_visible_to_seat: target_visible,
            learned_rank: spec.rank,
            range_checked: in_range,
            cooldown_ready: world.tick >= spec.ready_at_tick,
            resource_ready: actor.mana >= spec.mana_cost,
        };
        self.admit_authorial(facts, request)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::skill_admission::{AdmissionDecision, AdmissionReceipt};

    fn skill() -> [ServerSkillSnapshot; 4] {
        [ServerSkillSnapshot {
            rank: 1, ready_at_tick: 0, mana_cost: 70, max_range: 600,
        }; 4]
    }
    fn unit(id: &str, champion: &str, seat: Team, x: i32) -> ServerUnitSnapshot {
        ServerUnitSnapshot {
            id: id.into(), champion: champion.into(), team: seat,
            pos: BoardPoint { x, y: 0 }, alive: true,
            visible_to_blue: true, visible_to_red: true,
            mana: 100, skill: skill(),
        }
    }
    fn world(units: Vec<ServerUnitSnapshot>) -> ServerSkillWorld {
        ServerSkillWorld::from_authoritative_units(10, units).unwrap()
    }
    fn req(id: &str, actor: &str, slot: SkillSlot, aim: SkillAim) -> WireSkillRequest {
        WireSkillRequest {
            turn: 1, request_id: id.into(), actor_id: actor.into(), slot, aim,
        }
    }
    fn expect_queued(x: WireCastOutcome) -> u64 {
        match x {
            WireCastOutcome::Admission(AdmissionReceipt {
                decision: AdmissionDecision::Queued,
                cast_instance_id: Some(id),
            }) => id,
            other => panic!("expected queued, got {:?}", other),
        }
    }

    #[test]
    fn both_seats_nami_w_ally_and_visible_enemy_accepted() {
        for seat in [Team::Blue, Team::Red] {
            let enemy = if seat == Team::Blue { Team::Red } else { Team::Blue };
            for target_is_ally in [true, false] {
                let w = world(vec![
                    unit("nami", "Nami", seat, 0),
                    unit("target", "Garen", if target_is_ally { seat } else { enemy }, 500),
                ]);
                let mut admission = SkillAdmission::new(1);
                expect_queued(admission.admit_from_world(
                    &w, seat, req("w", "nami", SkillSlot::W, SkillAim::Unit("target".into())),
                ));
                assert_eq!(admission.pending_count(), 1);
            }
        }
    }

    #[test]
    fn both_seats_invisible_enemy_and_missing_target_denied() {
        for seat in [Team::Blue, Team::Red] {
            let enemy = if seat == Team::Blue { Team::Red } else { Team::Blue };
            let mut t = unit("target", "Garen", enemy, 500);
            if seat == Team::Blue { t.visible_to_blue = false; }
            else { t.visible_to_red = false; }
            let w = world(vec![unit("nami", "Nami", seat, 0), t]);
            let mut admission = SkillAdmission::new(1);
            assert_eq!(admission.admit_from_world(
                &w, seat, req("invisible", "nami", SkillSlot::W,
                    SkillAim::Unit("target".into())),
            ), WireCastOutcome::Rejected(WireRejection::InvalidTarget));
            assert_eq!(admission.admit_from_world(
                &w, seat, req("missing", "nami", SkillSlot::W,
                    SkillAim::Unit("not-here".into())),
            ), WireCastOutcome::Rejected(WireRejection::InvalidTarget));
            assert_eq!(admission.pending_count(), 0);
        }
    }

    #[test]
    fn cannot_spoof_champion_or_enemy_actor_from_client_message() {
        let w = world(vec![
            unit("blue-mid", "Bard", Team::Blue, 0),
            unit("red-mid", "Ahri", Team::Red, 0),
        ]);
        let mut a = SkillAdmission::new(1);
        assert_eq!(a.admit_from_world(&w, Team::Blue,
            req("spoof", "red-mid", SkillSlot::E,
                SkillAim::Direction { x: 20, y: 0 })),
            WireCastOutcome::Rejected(WireRejection::WrongOwner));
        assert_eq!(a.admit_from_world(&w, Team::Blue,
            req("unsupported", "blue-mid", SkillSlot::R,
                SkillAim::Point { x: 10, y: 0 })),
            WireCastOutcome::Rejected(WireRejection::AbilityNotMigrated));
        assert_eq!(a.admit_from_world(&w, Team::Blue,
            req("absent", "no-such", SkillSlot::E,
                SkillAim::Direction { x: 20, y: 0 })),
            WireCastOutcome::Rejected(WireRejection::ActorNotFound));
    }

    #[test]
    fn extreme_coordinates_do_not_overflow_range_check() {
        assert!(!ServerSkillWorld::within_range(
            BoardPoint { x: i32::MIN, y: i32::MIN },
            BoardPoint { x: i32::MAX, y: i32::MAX }, i32::MAX,
        ));
        assert!(ServerSkillWorld::within_range(
            BoardPoint { x: 0, y: 0 }, BoardPoint { x: 300, y: 400 }, 500,
        ));
        assert!(!ServerSkillWorld::within_range(
            BoardPoint { x: 0, y: 0 }, BoardPoint { x: 300, y: 400 }, 499,
        ));
    }

    #[test]
    fn rank_mana_cooldown_and_distance_are_derived_not_supplied() {
        for seat in [Team::Blue, Team::Red] {
            for case in 0..4 {
                let mut actor = unit("nami", "Nami", seat, 0);
                if case == 0 { actor.skill[1].rank = 0; }
                if case == 1 { actor.mana = 69; }
                if case == 2 { actor.skill[1].ready_at_tick = 11; }
                let target_x = if case == 3 { 601 } else { 500 };
                let w = world(vec![actor, unit("ally", "Garen", seat, target_x)]);
                let mut a = SkillAdmission::new(1);
                let expected = match case {
                    0 => WireRejection::RankNotLearned,
                    1 => WireRejection::ResourceShortage,
                    2 => WireRejection::Cooldown,
                    _ => WireRejection::OutOfRange,
                };
                assert_eq!(a.admit_from_world(&w, seat,
                    req("check", "nami", SkillSlot::W, SkillAim::Unit("ally".into()))),
                    WireCastOutcome::Rejected(expected));
            }
        }
    }

    #[test]
    fn ahri_direction_and_point_take_different_range_rules() {
        for seat in [Team::Blue, Team::Red] {
            let w = world(vec![unit("ahri", "Ahri", seat, 0)]);
            let mut a = SkillAdmission::new(1);
            expect_queued(a.admit_from_world(&w, seat,
                req("direction", "ahri", SkillSlot::E,
                    SkillAim::Direction { x: 2000, y: 100 })));
            assert_eq!(a.admit_from_world(&w, seat,
                req("point", "ahri", SkillSlot::E, SkillAim::Point { x: 601, y: 0 })),
                WireCastOutcome::Rejected(WireRejection::OutOfRange));
        }
    }

    #[test]
    fn duplicate_ack_survives_target_death_without_new_pending() {
        let w = world(vec![
            unit("nami", "Nami", Team::Blue, 0),
            unit("ally", "Garen", Team::Blue, 100),
        ]);
        let request = req("original", "nami", SkillSlot::W, SkillAim::Unit("ally".into()));
        let mut a = SkillAdmission::new(1);
        let ack = a.admit_from_world(&w, Team::Blue, request.clone());
        expect_queued(ack.clone());
        let mut dead = unit("ally", "Garen", Team::Blue, 100);
        dead.alive = false;
        let replay_world = world(vec![unit("nami", "Nami", Team::Blue, 0), dead]);
        assert_eq!(a.admit_from_world(&replay_world, Team::Blue, request), ack);
        assert_eq!(a.pending_count(), 1);
    }

    #[test]
    fn invalid_snapshot_rejects_duplicates_and_negative_range() {
        let a = unit("same", "Nami", Team::Blue, 0);
        let b = unit("same", "Ahri", Team::Red, 0);
        assert_eq!(
            ServerSkillWorld::from_authoritative_units(10, vec![a.clone(), b])
                .unwrap_err(),
            WorldSnapshotError::DuplicateUnitId
        );
        let mut bad = a;
        bad.skill[1].max_range = -1;
        assert_eq!(
            ServerSkillWorld::from_authoritative_units(10, vec![bad])
                .unwrap_err(),
            WorldSnapshotError::InvalidRange
        );
    }
}
