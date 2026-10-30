//! M45 B02 Skills S13 — *ISOLATED SPECIFICATION MODEL* for Rust migration.
//!
//! NOT added to Cargo workspace; NOT an authoritative match actor or gameplay engine.
//! No compiled/cargo/native/WASM test was executed when authored.
//! Compile later with: rustc --edition=2021 --test s13_intent_arbiter_reference.rs -o /tmp/s13_intent && /tmp/s13_intent
//! Frozen oracle: skills-batch2 f0b1147ac46e585a1d5374a178b1ea462f5dc278
//! This model captures ONE primary cast request per actor/slot/turn, deterministic
//! request receipts, session-seat ownership, seal and cooldown anti-resurrection.
//! Real core-combat must implement eligibility, resource debit, projectiles, recasts,
//! reconnect, private projections, snapshots and effect ordering separately.

use std::collections::{BTreeMap, BTreeSet};

#[derive(Clone, Copy, Debug, Eq, PartialEq, Ord, PartialOrd)]
pub enum Seat { Blue, Red }

#[derive(Clone, Copy, Debug, Eq, PartialEq, Ord, PartialOrd)]
pub enum Slot { Q, W, E, R }

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Route { Board, Directional, Targeted }

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PrimaryCast {
    pub request_id: String,
    pub match_id: String,
    pub turn: u32,
    pub actor_id: String,
    pub slot: Slot,
    pub route: Route,
    pub target_digest: String,
    // A reactivation requires an independently verified registered cast instance.
    // It is never silently treated as a second primary cast.
    pub recast_of: Option<u64>,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Reject {
    RequestIdPayloadConflict,
    WrongMatch,
    WrongTurn,
    TurnSealed,
    ActorNotOwned,
    AbilityNotMigrated,
    SlotAlreadyPending,
    RecastRequiresAuthorialExecutor,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Receipt {
    pub accepted: bool,
    pub reason: Option<Reject>,
    pub revision: u64,
    pub cast_id: Option<u64>,
}
impl Receipt {
    fn rejected(reason: Reject, revision: u64) -> Self {
        Self { accepted: false, reason: Some(reason), revision, cast_id: None }
    }
}

pub struct IntentGate {
    match_id: String,
    turn: u32,
    sealed: bool,
    revision: u64,
    next_cast_id: u64,
    owners: BTreeMap<String, Seat>,
    abilities: BTreeSet<(String, Slot)>,
    pending: BTreeMap<(String, Slot), u64>,
    committed: BTreeSet<u64>,
    receipts: BTreeMap<(Seat, String), (PrimaryCast, Receipt)>,
}

impl IntentGate {
    pub fn new(match_id: impl Into<String>, owners: BTreeMap<String, Seat>,
               abilities: BTreeSet<(String, Slot)>) -> Self {
        Self {
            match_id: match_id.into(), turn: 1, sealed: false, revision: 0,
            next_cast_id: 0, owners, abilities, pending: BTreeMap::new(),
            committed: BTreeSet::new(), receipts: BTreeMap::new(),
        }
    }

    /// Only the authenticated connection supplies seat. The payload does NOT.
    pub fn submit(&mut self, seat: Seat, cmd: PrimaryCast) -> Receipt {
        let receipt_key = (seat, cmd.request_id.clone());
        if let Some((old_cmd, old_receipt)) = self.receipts.get(&receipt_key) {
            return if old_cmd == &cmd {
                old_receipt.clone() // ACK replay, never second enqueue/debit
            } else {
                Receipt::rejected(Reject::RequestIdPayloadConflict, self.revision)
            };
        }
        let reject = if cmd.match_id != self.match_id {
            Some(Reject::WrongMatch)
        } else if cmd.turn != self.turn {
            Some(Reject::WrongTurn)
        } else if self.sealed {
            Some(Reject::TurnSealed)
        } else if self.owners.get(&cmd.actor_id) != Some(&seat) {
            Some(Reject::ActorNotOwned)
        } else if cmd.recast_of.is_some() {
            Some(Reject::RecastRequiresAuthorialExecutor)
        } else if !self.abilities.contains(&(cmd.actor_id.clone(), cmd.slot)) {
            Some(Reject::AbilityNotMigrated)
        } else if self.pending.contains_key(&(cmd.actor_id.clone(), cmd.slot)) {
            Some(Reject::SlotAlreadyPending)
        } else { None };
        let receipt = if let Some(reason) = reject {
            Receipt::rejected(reason, self.revision)
        } else {
            self.revision += 1;
            self.next_cast_id += 1;
            self.pending.insert((cmd.actor_id.clone(), cmd.slot), self.next_cast_id);
            Receipt {
                accepted: true, reason: None, revision: self.revision,
                cast_id: Some(self.next_cast_id),
            }
        };
        self.receipts.insert(receipt_key, (cmd, receipt.clone()));
        receipt
    }

    pub fn seal(&mut self) -> bool {
        if self.sealed { false } else { self.sealed = true; true }
    }

    /// Claims one sealed primary cast ONCE, with no mana/damage logic in this model.
    pub fn take_for_commit(&mut self, actor_id: &str, slot: Slot) -> Option<u64> {
        if !self.sealed { return None; }
        let id = self.pending.remove(&(actor_id.to_owned(), slot))?;
        self.committed.insert(id);
        Some(id)
    }

    pub fn begin_next_turn(&mut self) -> Result<u32, &'static str> {
        if !self.sealed || !self.pending.is_empty() {
            return Err("sealed turn must be drained first");
        }
        let next = self.turn.checked_add(1).ok_or("turn overflow")?;
        self.turn = next;
        self.sealed = false;
        // Keep receipts indefinitely in this reference: production requires a
        // versioned retention horizon and checkpoint/reconnect protection.
        Ok(next)
    }
    pub fn pending_count(&self) -> usize { self.pending.len() }
    pub fn committed_count(&self) -> usize { self.committed.len() }
    pub fn revision(&self) -> u64 { self.revision }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn model() -> IntentGate {
        let mut owners = BTreeMap::new();
        owners.insert("blue_MID".to_owned(), Seat::Blue);
        owners.insert("red_MID".to_owned(), Seat::Red);
        let mut abilities = BTreeSet::new();
        abilities.insert(("blue_MID".to_owned(), Slot::W));
        abilities.insert(("red_MID".to_owned(), Slot::W));
        IntentGate::new("m45_s13", owners, abilities)
    }
    fn request(seat: Seat, id: &str, route: Route) -> PrimaryCast {
        PrimaryCast {
            request_id: id.to_owned(), match_id: "m45_s13".to_owned(),
            turn: 1,
            actor_id: match seat { Seat::Blue => "blue_MID", Seat::Red => "red_MID" }.to_owned(),
            slot: Slot::W, route, target_digest: "ally_TOP".to_owned(),
            recast_of: None,
        }
    }

    #[test]
    fn nami_w_both_seats_both_queue_orders_cannot_double_commit() {
        for seat in [Seat::Blue, Seat::Red] {
            for (first, second) in [
                (Route::Board, Route::Targeted),
                (Route::Targeted, Route::Board),
            ] {
                let mut gate = model();
                let one = gate.submit(seat, request(seat, "first", first));
                let two = gate.submit(seat, request(seat, "second", second));
                assert!(one.accepted);
                assert_eq!(two.reason, Some(Reject::SlotAlreadyPending));
                assert_eq!(gate.pending_count(), 1);
                assert!(gate.seal());
                assert_eq!(gate.take_for_commit(
                    match seat { Seat::Blue => "blue_MID", Seat::Red => "red_MID" },
                    Slot::W), one.cast_id);
                assert_eq!(gate.take_for_commit(
                    match seat { Seat::Blue => "blue_MID", Seat::Red => "red_MID" },
                    Slot::W), None);
                assert_eq!(gate.committed_count(), 1);
                gate.begin_next_turn().unwrap();
                // Future game clock progression does NOT replay a committed old intent.
                assert_eq!(gate.pending_count(), 0);
                let duplicate = gate.submit(seat, request(seat, "first", first));
                assert_eq!(duplicate, one);
                assert_eq!(gate.pending_count(), 0);
            }
        }
    }
    #[test]
    fn duplicate_request_ack_is_exact_and_side_effect_free() {
        for seat in [Seat::Blue, Seat::Red] {
            let mut gate = model();
            let req = request(seat, "dup", Route::Board);
            let first = gate.submit(seat, req.clone());
            let rev = gate.revision();
            for _ in 0..3 { assert_eq!(gate.submit(seat, req.clone()), first); }
            assert_eq!(gate.revision(), rev);
            assert_eq!(gate.pending_count(), 1);
        }
    }
    #[test]
    fn same_request_id_different_payload_rejects_without_erasing_original() {
        let mut gate = model();
        let a = request(Seat::Blue, "req1", Route::Board);
        let first = gate.submit(Seat::Blue, a.clone());
        let mut changed = a.clone(); changed.route = Route::Directional;
        assert_eq!(gate.submit(Seat::Blue, changed).reason,
                   Some(Reject::RequestIdPayloadConflict));
        assert_eq!(gate.submit(Seat::Blue, a), first);
        assert_eq!(gate.pending_count(), 1);
    }
    #[test]
    fn authenticated_owner_and_seal_are_enforced() {
        let mut gate = model();
        assert_eq!(gate.submit(Seat::Red, request(Seat::Blue, "attack", Route::Board))
            .reason, Some(Reject::ActorNotOwned));
        assert!(gate.seal());
        assert_eq!(gate.submit(Seat::Blue, request(Seat::Blue, "late", Route::Board))
            .reason, Some(Reject::TurnSealed));
        assert_eq!(gate.pending_count(), 0);
        gate.begin_next_turn().unwrap();
    }
    #[test]
    fn unregistered_and_recast_do_not_get_generic_damage_fallback() {
        let mut gate = model();
        let mut unknown = request(Seat::Blue, "unknown", Route::Board);
        unknown.slot = Slot::Q;
        assert_eq!(gate.submit(Seat::Blue, unknown).reason,
                   Some(Reject::AbilityNotMigrated));
        let mut recast = request(Seat::Blue, "recast", Route::Board);
        recast.recast_of = Some(12);
        assert_eq!(gate.submit(Seat::Blue, recast).reason,
                   Some(Reject::RecastRequiresAuthorialExecutor));
    }
    #[test]
    fn each_authenticated_seat_has_separate_single_slot_arbitration() {
        let mut gate = model();
        let blue = gate.submit(Seat::Blue, request(Seat::Blue, "shared", Route::Board));
        let red = gate.submit(Seat::Red, request(Seat::Red, "shared", Route::Board));
        assert!(blue.accepted && red.accepted);
        assert_ne!(blue.cast_id, red.cast_id);
        assert_eq!(gate.pending_count(), 2);
        gate.seal();
        gate.take_for_commit("blue_MID", Slot::W).unwrap();
        gate.take_for_commit("red_MID", Slot::W).unwrap();
        assert_eq!(gate.committed_count(), 2);
    }
}
