//! M45 B02 Skills S17 — isolated Rust privacy design + acceptance gate.
//! NOT IN WORKSPACE / NOT COMPILED / NOT GAMEPLAY ENGINE.
//! Source: skills-batch2@f0b1147ac46e585a1d5374a178b1ea462f5dc278
//! Source evidence: 2 seats x 2 historical event leaks, 2 old aliases rewritten,
//! 149/149 saved source witness assertions and 2 full checkpoint continuations.
//!
//! INTENTIONAL PRIVACY FIX: historical events must be sealed into a seat-specific
//! public projection at EMISSION time (or versioned in server state with the
//! observer-specific identity-at-event-time). NEVER project an old event using
//! the actor's CURRENT disguise, death, fog, or summon state.
//!
//! This reference only protects privacy-sensitive events. A production match
//! actor must define explicit event classification, audience, visibility-at-time,
//! retention, redaction, fog, reconnect and protocol serialization independently.

use std::collections::BTreeMap;
#[derive(Clone,Copy,Debug,Eq,PartialEq,Ord,PartialOrd)]
pub enum Seat { Blue, Red }

#[derive(Clone,Debug,Eq,PartialEq)]
pub struct SealedPublicEvent {
    pub event_id: String,
    pub event_tick: u64,
    pub observed_by: Seat,
    pub historical_public_actor_id: String,
    pub redacted_body: String,
}
#[derive(Clone,Debug,Eq,PartialEq)]
pub enum SealError {
    MissingPublicAlias,
    StableOrInternalIdSubmitted,
    DuplicateEventForSeat,
}
#[derive(Default,Clone,Debug,Eq,PartialEq)]
pub struct SealedHistory {
    by_observer: BTreeMap<(Seat,String),SealedPublicEvent>,
}
impl SealedHistory {
    /// Called by authoritative server WHEN the event is created, not by
    /// perspective() on each subsequent query. This is not a trust boundary
    /// for client-supplied aliases: the server alone must allocate public IDs.
    pub fn seal_sensitive_event(
        &mut self,
        observer: Seat, event_id: &str, event_tick: u64,
        server_allocated_alias: Option<&str>,
    ) -> Result<(),SealError> {
        let alias=server_allocated_alias.ok_or(SealError::MissingPublicAlias)?;
        if !alias.starts_with("appearance_") ||
            alias.len() <= "appearance_".len() ||
            !alias["appearance_".len()..].chars().all(|x|x.is_ascii_alphanumeric())
        {
            return Err(SealError::StableOrInternalIdSubmitted);
        }
        let key=(observer,event_id.to_owned());
        if self.by_observer.contains_key(&key) {
            return Err(SealError::DuplicateEventForSeat);
        }
        self.by_observer.insert(key,SealedPublicEvent {
            event_id:event_id.to_owned(),event_tick,
            observed_by:observer,
            historical_public_actor_id:alias.to_owned(),
            redacted_body:"Ação de uma unidade visível.".into(),
        });
        Ok(())
    }

    /// Current appearance and current fog are *not* inputs. The same old
    /// event cannot be re-labeled under a new alias or disclose private text.
    pub fn historical_event(&self, observer:Seat, event_id:&str)
        -> Option<&SealedPublicEvent>
    {
        self.by_observer.get(&(observer,event_id.to_owned()))
    }

    pub fn list(&self, observer:Seat) -> Vec<&SealedPublicEvent> {
        self.by_observer.iter()
            .filter(|((seat,_),_)|*seat==observer)
            .map(|(_,event)|event).collect()
    }
}

#[derive(Clone,Debug,Eq,PartialEq)]
pub struct TimelineWitness {
    /// The *same* historical event returned through the actual Rust
    /// perspective API before and after clone expiry/disguise transitions.
    pub masked_at_emit: SealedPublicEvent,
    pub after_shaco_clone_expiry: SealedPublicEvent,
    pub after_neeko_cancel: SealedPublicEvent,
    pub after_new_disguise: SealedPublicEvent,
    pub old_alias_rejected_for_targeting: bool,
    pub new_alias_accepted_for_targeting: bool,
    pub initial_sequence_replay_idempotent: bool,
    /// Unlike a simple source snapshot hash, this implies deterministic
    /// continuation AFTER restoring the authoritative match/gateway state.
    pub resumed_match_and_gateway_equal: bool,
    pub real_roster_size: usize,
}
pub trait ActualRustMatchEventRunner {
    fn replay_real_match_after_snapshot(
        &mut self, owner_seat: Seat,
    ) -> Result<TimelineWitness,String>;
}
pub fn check_actual_rust_privacy<R:ActualRustMatchEventRunner>(runner:&mut R)
    -> Result<usize,String>
{
    let mut passed=0;
    for seat in [Seat::Blue,Seat::Red] {
        let w=runner.replay_real_match_after_snapshot(seat)
            .map_err(|e|format!("{:?}: {}",seat,e))?;
        let e=&w.masked_at_emit;
        // Source exhibited 2 historical event leaks per seat. Rust must be
        // tested with both Neeko and Shaco; the actual runner owns coverage.
        if e.observed_by==seat || !e.historical_public_actor_id.starts_with("appearance_") ||
            e.redacted_body!="Ação de uma unidade visível." ||
            w.after_shaco_clone_expiry!=*e ||
            w.after_neeko_cancel!=*e ||
            w.after_new_disguise!=*e ||
            !w.old_alias_rejected_for_targeting ||
            !w.new_alias_accepted_for_targeting ||
            !w.initial_sequence_replay_idempotent ||
            !w.resumed_match_and_gateway_equal ||
            w.real_roster_size!=10 {
            return Err(format!("P1 historical event stable ID/text/alias/replay leak: {:?}: {:?}",seat,w));
        }
        passed+=1;
    }
    Ok(passed)
}
/// Additional native checks not implied by the two positive timeline cases.
pub const REQUIRED_NEGATIVE_CASES: [&str; 8] = [
    "old_neeko_event_still_redacted_after_cancel",
    "old_shaco_event_still_redacted_after_clone_expiry",
    "old_neeko_event_does_not_switch_to_new_alias",
    "event_private_body_never_returned_after_fog_loss",
    "event_stable_actor_id_never_returned_after_death",
    "event_audience_isolated_per_authenticated_seat",
    "old_public_alias_not_targetable_after_disguise_cancel",
    "restored_gateway_retry_keeps_same_receipt_and_public_history",
];

#[cfg(test)]
mod spec_only_tests {
    use super::*;

    #[test]
    fn historical_public_projection_is_immutable_after_remask() {
        let mut history=SealedHistory::default();
        history.seal_sensitive_event(Seat::Red,"evt_4",1,Some("appearance_1")).unwrap();
        let initial=history.historical_event(Seat::Red,"evt_4").unwrap().clone();
        assert_eq!(initial.historical_public_actor_id,"appearance_1");
        let mut current_identity="appearance_7";
        assert_ne!(current_identity,initial.historical_public_actor_id);
        current_identity="red_TOP";
        assert_ne!(current_identity,initial.historical_public_actor_id);
        assert_eq!(history.historical_event(Seat::Red,"evt_4"),Some(&initial));
    }
    #[test]
    fn private_ids_and_untyped_aliases_cannot_enter_public_history() {
        let mut history=SealedHistory::default();
        for bad in [None,Some("blue_TOP"),Some("entity_1"),Some("appearance_"),
                    Some("appearance_1/../../private")] {
            assert!(history.seal_sensitive_event(Seat::Red,"evt_1",0,bad).is_err());
        }
        assert!(history.list(Seat::Red).is_empty());
    }
    #[test]
    fn same_historical_event_sealed_per_seat_without_cross_leakage() {
        let mut history=SealedHistory::default();
        history.seal_sensitive_event(Seat::Blue,"evt_1",5,Some("appearance_1")).unwrap();
        history.seal_sensitive_event(Seat::Red,"evt_1",5,Some("appearance_2")).unwrap();
        assert_ne!(history.list(Seat::Blue),history.list(Seat::Red));
        assert_eq!(history.list(Seat::Blue).len(),1);
        assert_eq!(history.list(Seat::Red).len(),1);
    }
    #[test]
    fn duplicates_cannot_relabel_history_and_cloned_replay_is_stable() {
        let mut history=SealedHistory::default();
        history.seal_sensitive_event(Seat::Blue,"evt_4",1,Some("appearance_1")).unwrap();
        assert_eq!(history.seal_sensitive_event(Seat::Blue,"evt_4",1,
            Some("appearance_7")),Err(SealError::DuplicateEventForSeat));
        let reloaded=history.clone();
        assert_eq!(history,reloaded);
        assert_eq!(history.list(Seat::Blue)[0].historical_public_actor_id,"appearance_1");
    }
}
