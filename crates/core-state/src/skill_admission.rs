//! M45 B02B-I05. Private admission prototype, not a combat engine.
//! The server MUST independently authenticate seat, load actor ownership from
//! server state and validate target team, fog, range, rank, resource and cooldown.
//! Do not expose pending intents or receipt history in client WASM / SSE.
use crate::Team;
use std::collections::HashMap;

pub const MAX_ID_BYTES: usize = 128;
pub const MAX_RECEIPTS: usize = 16_384;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum SkillSlot { Q, W, E, R }

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TargetShape {
    TargetAny, TargetEnemy, TargetAlly, LineEnemy, ConeEnemy, SelfCast, Point, Recast
}
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SkillAim {
    Unit(String), Point { x: i32, y: i32 },
    Direction { x: i32, y: i32 }, SelfCast
}
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SkillRequest {
    pub turn: u32,
    pub request_id: String,
    pub actor_id: String,
    pub slot: SkillSlot,
    pub shape: TargetShape,
    pub aim: SkillAim,
}
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AdmissionDecision {
    Queued, RequestIdPayloadConflict, SlotAlreadyPending, TurnSealed, WrongTurn,
    ActorNotOwned, InvalidCommand, InvalidAim, RecastRequiresExistingCast,
    ReceiptCapacityReached, CastInstanceOverflow,
}
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AdmissionReceipt {
    pub decision: AdmissionDecision,
    pub cast_instance_id: Option<u64>,
}
impl AdmissionReceipt {
    fn denied(decision: AdmissionDecision) -> Self {
        Self { decision, cast_instance_id: None }
    }
    fn queued(cast_id: u64) -> Self {
        Self { decision: AdmissionDecision::Queued, cast_instance_id: Some(cast_id) }
    }
}
#[derive(Debug, Clone)]
struct CachedRequest {
    payload: SkillRequest,
    receipt: AdmissionReceipt,
}
#[derive(Debug, Clone)]
struct PendingPrimary {
    cast_id: u64,
    committed: bool,
}

/// One primary intent per authenticated seat + actor + QWER slot,
/// regardless of legacy board, targeted or combo route.
/// One instance MUST be created per match; clone is NOT serialized restore.
#[derive(Debug, Clone)]
pub struct SkillAdmission {
    turn: u32,
    sealed: bool,
    next_id: u64,
    receipts: HashMap<(Team, String), CachedRequest>,
    pending: HashMap<(Team, String, SkillSlot), PendingPrimary>,
    in_flight: HashMap<u64, (Team, String, SkillSlot)>,
}
impl SkillAdmission {
    pub fn new(turn: u32) -> Self {
        Self { turn, sealed: false, next_id: 0, receipts: HashMap::new(),
            pending: HashMap::new(), in_flight: HashMap::new() }
    }
    pub fn turn(&self) -> u32 { self.turn }
    pub fn is_sealed(&self) -> bool { self.sealed }
    pub fn pending_count(&self) -> usize { self.pending.len() }
    pub fn in_flight_count(&self) -> usize { self.in_flight.len() }
    pub fn receipt_count(&self) -> usize { self.receipts.len() }
    pub(crate) fn has_receipt(&self, seat: Team, id: &str) -> bool {
        self.receipts.contains_key(&(seat, id.to_owned()))
    }
    fn valid_aim(r: &SkillRequest) -> bool {
        match (&r.shape, &r.aim) {
            (TargetShape::TargetAny | TargetShape::TargetEnemy | TargetShape::TargetAlly,
             SkillAim::Unit(id)) => !id.is_empty() && id.len() <= MAX_ID_BYTES,
            (TargetShape::LineEnemy | TargetShape::ConeEnemy,
             SkillAim::Direction { x, y }) => *x != 0 || *y != 0,
            (TargetShape::LineEnemy | TargetShape::ConeEnemy,
             SkillAim::Point { .. }) => true,
            (TargetShape::LineEnemy | TargetShape::ConeEnemy,
             SkillAim::Unit(id)) => !id.is_empty() && id.len() <= MAX_ID_BYTES,
            (TargetShape::SelfCast, SkillAim::SelfCast) => true,
            (TargetShape::Point, SkillAim::Point { .. }) => true,
            _ => false,
        }
    }

    /// owner_from_server MUST come from trusted match state, not the client.
    /// Receipt admission NEVER charges mana or spawns a projectile.
    pub(crate) fn admit(
        &mut self, authenticated_seat: Team, owner_from_server: Team,
        request: SkillRequest
    ) -> AdmissionReceipt {
        if request.request_id.is_empty() || request.request_id.len() > MAX_ID_BYTES
            || request.actor_id.is_empty() || request.actor_id.len() > MAX_ID_BYTES {
            return AdmissionReceipt::denied(AdmissionDecision::InvalidCommand);
        }
        let key = (authenticated_seat, request.request_id.clone());
        if let Some(prev) = self.receipts.get(&key) {
            return if prev.payload == request { prev.receipt.clone() }
                else { AdmissionReceipt::denied(AdmissionDecision::RequestIdPayloadConflict) };
        }
        if self.receipts.len() >= MAX_RECEIPTS {
            return AdmissionReceipt::denied(AdmissionDecision::ReceiptCapacityReached);
        }
        let pending_key = (authenticated_seat, request.actor_id.clone(), request.slot);
        let result = if request.turn != self.turn {
            AdmissionReceipt::denied(AdmissionDecision::WrongTurn)
        } else if self.sealed {
            AdmissionReceipt::denied(AdmissionDecision::TurnSealed)
        } else if authenticated_seat != owner_from_server {
            AdmissionReceipt::denied(AdmissionDecision::ActorNotOwned)
        } else if request.shape == TargetShape::Recast {
            AdmissionReceipt::denied(AdmissionDecision::RecastRequiresExistingCast)
        } else if !Self::valid_aim(&request) {
            AdmissionReceipt::denied(AdmissionDecision::InvalidAim)
        } else if self.pending.contains_key(&pending_key) {
            AdmissionReceipt::denied(AdmissionDecision::SlotAlreadyPending)
        } else if let Some(next) = self.next_id.checked_add(1) {
            self.next_id = next;
            self.pending.insert(pending_key, PendingPrimary { cast_id: next, committed: false });
            AdmissionReceipt::queued(next)
        } else {
            AdmissionReceipt::denied(AdmissionDecision::CastInstanceOverflow)
        };
        self.receipts.insert(key, CachedRequest {
            payload: request, receipt: result.clone()
        });
        result
    }
    pub fn seal(&mut self) -> bool {
        if self.sealed { return false; }
        self.sealed = true;
        true
    }
    /// Returns true once; the future server must atomically commit cost/CD
    /// and this transition together, never in two durable transactions.
    pub fn mark_committed_once(
        &mut self, seat: Team, actor_id: &str, slot: SkillSlot, cast_id: u64
    ) -> bool {
        if !self.sealed { return false; }
        let key = (seat, actor_id.to_owned(), slot);
        match self.pending.get_mut(&key) {
            Some(p) if p.cast_id == cast_id && !p.committed => {
                p.committed = true; true
            }
            _ => false,
        }
    }
    /// Clears all old entry-route representations. No cooldown ghost cast.
    pub fn retire(
        &mut self, seat: Team, actor_id: &str, slot: SkillSlot, cast_id: u64
    ) -> bool {
        let key = (seat, actor_id.to_owned(), slot);
        if self.pending.get(&key).is_some_and(|p| p.cast_id == cast_id) {
            self.pending.remove(&key);
            return true;
        }
        if self.in_flight.get(&cast_id).is_some_and(|saved| saved == &key) {
            self.in_flight.remove(&cast_id);
            return true;
        }
        false
    }
    /// Request receipts retained across turns for reconnect/retry in memory.
    /// Persistent serialization and receipt eviction belong to later packages.
    /// Advance only when sealed and all queued primaries have been committed.
    /// In-flight/temporal projectiles remain tracked across turns; they can only
    /// be retired by an explicit terminal event (impact, interruption, death).
    /// Never discard uncommitted accepted casts or resurrect old targeted casts.
    pub fn next_turn(&mut self) -> Option<u32> {
        if !self.sealed || self.pending.values().any(|p| !p.committed) {
            return None;
        }
        let next = self.turn.checked_add(1)?;
        // All pending primaries are committed. Preserve their cast instances
        // independently of next turn admission, until terminal resolution.
        for (key, cast) in std::mem::take(&mut self.pending) {
            self.in_flight.insert(cast.cast_id, key);
        }
        self.turn = next;
        self.sealed = false;
        Some(next)
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    fn req(turn: u32, id: &str, actor: &str, slot: SkillSlot,
           shape: TargetShape, aim: SkillAim) -> SkillRequest {
        SkillRequest { turn, request_id: id.into(), actor_id: actor.into(),
            slot, shape, aim }
    }
    #[test]
    fn nami_w_two_seats_and_both_route_orders_no_double_queue_or_ghost() {
        for seat in [Team::Blue, Team::Red] {
            for board_first in [false, true] {
                let mut a = SkillAdmission::new(1);
                let targeted = req(1, "target", "nami", SkillSlot::W,
                    TargetShape::TargetAny, SkillAim::Unit("ally".into()));
                let board = req(1, "board", "nami", SkillSlot::W,
                    TargetShape::TargetAny, SkillAim::Unit("enemy".into()));
                let (first, second) = if board_first { (board, targeted) }
                    else { (targeted, board) };
                let ack = a.admit(seat, seat, first.clone());
                assert_eq!(ack.decision, AdmissionDecision::Queued);
                assert_eq!(a.admit(seat, seat, first), ack);
                assert_eq!(a.admit(seat, seat, second).decision,
                    AdmissionDecision::SlotAlreadyPending);
                assert_eq!(a.pending_count(), 1);
                assert!(a.seal());
                let cast_id = ack.cast_instance_id.unwrap();
                assert!(a.mark_committed_once(seat, "nami", SkillSlot::W, cast_id));
                assert!(!a.mark_committed_once(seat, "nami", SkillSlot::W, cast_id));
                assert!(a.retire(seat, "nami", SkillSlot::W, cast_id));
                assert!(!a.retire(seat, "nami", SkillSlot::W, cast_id));
                assert_eq!(a.next_turn(), Some(2));
                assert_eq!(a.pending_count(), 0);
                assert_eq!(a.admit(seat, seat, req(2, "fresh", "nami", SkillSlot::W,
                    TargetShape::TargetAny, SkillAim::Unit("ally".into()))).decision,
                    AdmissionDecision::Queued);
            }
        }
    }
    #[test]
    fn ahri_e_direction_is_admitted_not_executed() {
        for seat in [Team::Blue, Team::Red] {
            let mut a = SkillAdmission::new(7);
            assert_eq!(a.admit(seat, seat, req(7, "e", "ahri", SkillSlot::E,
                TargetShape::LineEnemy, SkillAim::Direction { x: 600, y: 200 }))
                .decision, AdmissionDecision::Queued);
            assert_eq!(a.pending_count(), 1);
        }
    }
    #[test]
    fn ownership_shape_and_recast_denials_do_not_enqueue() {
        for seat in [Team::Blue, Team::Red] {
            let wrong = if seat == Team::Blue { Team::Red } else { Team::Blue };
            let mut a = SkillAdmission::new(1);
            assert_eq!(a.admit(seat, wrong, req(1, "own", "nami", SkillSlot::W,
                TargetShape::TargetAny, SkillAim::Unit("ally".into())))
                .decision, AdmissionDecision::ActorNotOwned);
            assert_eq!(a.admit(seat, seat, req(1, "shape", "nami", SkillSlot::W,
                TargetShape::TargetAny, SkillAim::Point { x: 1, y: 2 }))
                .decision, AdmissionDecision::InvalidAim);
            assert_eq!(a.admit(seat, seat, req(1, "recast", "nami", SkillSlot::W,
                TargetShape::Recast, SkillAim::SelfCast))
                .decision, AdmissionDecision::RecastRequiresExistingCast);
            assert_eq!(a.pending_count(), 0);
        }
    }
    #[test]
    fn cached_ack_survives_in_memory_clone_turn_advance_and_payload_conflict() {
        let mut a = SkillAdmission::new(3);
        let x = req(3, "same", "nami", SkillSlot::W, TargetShape::TargetAny,
            SkillAim::Unit("ally".into()));
        let ack = a.admit(Team::Blue, Team::Blue, x.clone());
        assert!(a.seal());
        let mut recovered_in_memory = a.clone();
        assert_eq!(recovered_in_memory.admit(Team::Blue, Team::Blue, x.clone()), ack);
        let mut changed = x.clone();
        changed.aim = SkillAim::Unit("enemy".into());
        assert_eq!(recovered_in_memory.admit(Team::Blue, Team::Blue, changed)
            .decision, AdmissionDecision::RequestIdPayloadConflict);
        assert_eq!(recovered_in_memory.admit(Team::Blue, Team::Blue,
            req(3, "late", "nami", SkillSlot::W, TargetShape::TargetAny,
                SkillAim::Unit("ally".into()))).decision, AdmissionDecision::TurnSealed);
        assert_eq!(recovered_in_memory.next_turn(), None);
        let cast_id = ack.cast_instance_id.unwrap();
        assert!(recovered_in_memory.mark_committed_once(
            Team::Blue, "nami", SkillSlot::W, cast_id));
        assert!(recovered_in_memory.retire(Team::Blue, "nami", SkillSlot::W, cast_id));
        assert_eq!(recovered_in_memory.next_turn(), Some(4));
        assert_eq!(recovered_in_memory.admit(Team::Blue, Team::Blue, x), ack);
        assert_eq!(recovered_in_memory.pending_count(), 0);
    }
    #[test]
    fn independent_seats_can_reuse_request_ids_no_double_actor_pending() {
        let mut a = SkillAdmission::new(1);
        for seat in [Team::Blue, Team::Red] {
            let mid = req(1, "id", "mid", SkillSlot::E, TargetShape::LineEnemy,
                SkillAim::Direction { x: 1, y: 0 });
            assert_eq!(a.admit(seat, seat, mid).decision, AdmissionDecision::Queued);
            let other = req(1, "id", "support", SkillSlot::W,
                TargetShape::TargetAny, SkillAim::Unit("ally".into()));
            assert_eq!(a.admit(seat, seat, other).decision,
                AdmissionDecision::RequestIdPayloadConflict);
        }
        assert_eq!(a.pending_count(), 2);
    }

    #[test]
    fn in_flight_ahri_e_survives_round_advance_both_teams() {
        for seat in [Team::Blue, Team::Red] {
            let mut a = SkillAdmission::new(8);
            let e = req(8, "ahri-e", "ahri", SkillSlot::E, TargetShape::LineEnemy,
                SkillAim::Direction { x: 800, y: 200 });
            let ack = a.admit(seat, seat, e.clone());
            let cast_id = ack.cast_instance_id.unwrap();
            assert_eq!(a.next_turn(), None);
            assert!(a.seal());
            // A sealed but uncommitted cast cannot vanish by advancing turn.
            assert_eq!(a.next_turn(), None);
            assert_eq!(a.pending_count(), 1);
            assert!(a.mark_committed_once(seat, "ahri", SkillSlot::E, cast_id));
            // A committed temporal cast continues across the next turn.
            assert_eq!(a.next_turn(), Some(9));
            assert_eq!(a.pending_count(), 0);
            assert_eq!(a.in_flight_count(), 1);
            assert_eq!(a.admit(seat, seat, e), ack);
            let second = req(9, "ahri-e-next", "ahri", SkillSlot::E,
                TargetShape::LineEnemy, SkillAim::Direction { x: 500, y: 0 });
            let fresh = a.admit(seat, seat, second.clone());
            assert_eq!(fresh.decision, AdmissionDecision::Queued);
            assert_ne!(fresh.cast_instance_id, Some(cast_id));
            assert_eq!(a.admit(seat, seat, req(9, "third", "ahri", SkillSlot::E,
                TargetShape::LineEnemy, SkillAim::Direction { x: 400, y: 0 }))
                .decision, AdmissionDecision::SlotAlreadyPending);
            assert!(a.retire(seat, "ahri", SkillSlot::E, cast_id));
            assert_eq!(a.in_flight_count(), 0);
            assert_eq!(a.pending_count(), 1);
        }
    }

    #[test]
    fn mixed_committed_and_uncommitted_slots_block_turn_advance() {
        let mut a = SkillAdmission::new(12);
        let nami = a.admit(Team::Blue, Team::Blue, req(12, "w", "nami",
            SkillSlot::W, TargetShape::TargetAny, SkillAim::Unit("ally".into())));
        let ahri = a.admit(Team::Red, Team::Red, req(12, "e", "ahri",
            SkillSlot::E, TargetShape::LineEnemy, SkillAim::Direction { x: 1, y: 0 }));
        assert_eq!(a.pending_count(), 2);
        a.seal();
        assert!(a.mark_committed_once(Team::Blue, "nami", SkillSlot::W,
            nami.cast_instance_id.unwrap()));
        assert_eq!(a.next_turn(), None);
        assert_eq!(a.pending_count(), 2);
        assert!(a.mark_committed_once(Team::Red, "ahri", SkillSlot::E,
            ahri.cast_instance_id.unwrap()));
        assert_eq!(a.next_turn(), Some(13));
        assert_eq!(a.pending_count(), 0);
        assert_eq!(a.in_flight_count(), 2);
        assert!(a.retire(Team::Blue, "nami", SkillSlot::W,
            nami.cast_instance_id.unwrap()));
        assert!(a.retire(Team::Red, "ahri", SkillSlot::E,
            ahri.cast_instance_id.unwrap()));
        assert_eq!(a.pending_count(), 0);
        assert_eq!(a.in_flight_count(), 0);
    }

    #[test]
    fn terminal_old_projectile_never_removes_new_pending_cast() {
        for seat in [Team::Blue, Team::Red] {
            let mut a = SkillAdmission::new(4);
            let old = a.admit(seat, seat, req(4, "old", "ahri", SkillSlot::E,
                TargetShape::LineEnemy, SkillAim::Direction { x: 10, y: 0 }));
            a.seal();
            let old_id = old.cast_instance_id.unwrap();
            assert!(a.mark_committed_once(seat, "ahri", SkillSlot::E, old_id));
            assert_eq!(a.next_turn(), Some(5));
            let fresh = a.admit(seat, seat, req(5, "fresh", "ahri", SkillSlot::E,
                TargetShape::LineEnemy, SkillAim::Direction { x: 10, y: 1 }));
            assert_eq!(fresh.decision, AdmissionDecision::Queued);
            assert_ne!(fresh.cast_instance_id, Some(old_id));
            assert!(a.retire(seat, "ahri", SkillSlot::E, old_id));
            assert_eq!(a.pending_count(), 1);
            assert_eq!(a.in_flight_count(), 0);
            assert!(!a.retire(seat, "ahri", SkillSlot::E, old_id));
            assert_eq!(a.pending_count(), 1);
        }
    }

    #[test]
    fn in_flight_terminal_requires_matching_seat_actor_and_slot() {
        let mut a = SkillAdmission::new(1);
        let ack = a.admit(Team::Blue, Team::Blue, req(1, "id", "ahri",
            SkillSlot::E, TargetShape::LineEnemy, SkillAim::Direction { x: 2, y: 0 }));
        a.seal();
        let id = ack.cast_instance_id.unwrap();
        assert!(a.mark_committed_once(Team::Blue, "ahri", SkillSlot::E, id));
        assert_eq!(a.next_turn(), Some(2));
        assert!(!a.retire(Team::Red, "ahri", SkillSlot::E, id));
        assert!(!a.retire(Team::Blue, "nami", SkillSlot::E, id));
        assert!(!a.retire(Team::Blue, "ahri", SkillSlot::W, id));
        assert_eq!(a.in_flight_count(), 1);
        assert!(a.retire(Team::Blue, "ahri", SkillSlot::E, id));
        assert_eq!(a.in_flight_count(), 0);
    }
}
