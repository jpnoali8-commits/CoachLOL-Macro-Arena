//! M45 PLATFORM-A17: isolated Rust PvP protocol prototype.
//!
//! This crate is NOT the authoritative CoachLOL game engine or web server.
//! It implements the *protocol fence* for two seats with five owned units,
//! immutable request receipts, all-or-nothing typed intent admission and
//! team-filtered projection. Gameplay, persistence, HTTP cookies, actual
//! token hashing, visibility, champion kits and WASM browser UI are absent.
//!
//! Production must supply secure, expiring session authentication and a
//! durable staged transaction that includes Arena, receipts and event log
//! *before* publishing ACK/SSE. Never promote this prototype as a game-server.

use std::collections::BTreeMap;

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Team { Blue, Red }

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum SeatId { P1, P2 }
impl SeatId {
    pub const fn team(self) -> Team { match self { Self::P1 => Team::Blue, Self::P2 => Team::Red } }
    const fn index(self) -> usize { match self { Self::P1 => 0, Self::P2 => 1 } }
    pub const fn wire(self) -> &'static str { match self { Self::P1 => "p1", Self::P2 => "p2" } }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Role { Top, Jungle, Mid, Adc, Support }
impl Role {
    pub const ALL: [Self; 5] = [Self::Top, Self::Jungle, Self::Mid, Self::Adc, Self::Support];
    pub const fn wire(self) -> &'static str { match self {
        Self::Top => "TOP", Self::Jungle => "JG", Self::Mid => "MID",
        Self::Adc => "ADC", Self::Support => "SUP",
    } }
}

/// A typed *intent*. Queuing one never resolves LoL mechanics. Unmodelled
/// commands MUST be rejected instead of substituting a generic order.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Intent {
    Stop { role: Role },
    Recall { role: Role },
    FarmSafe { role: Role },
    HoldSmite { role: Role },
    FreezeWave { role: Role },
    Kite { role: Role },
    Move { role: Role, x_millionths: i64, y_millionths: i64 },
    Unsupported { role: Role, original_kind: String },
}
impl Intent {
    pub fn role(&self) -> Role { match self {
        Self::Stop { role } | Self::Recall { role } | Self::FarmSafe { role }
        | Self::HoldSmite { role } | Self::FreezeWave { role } | Self::Kite { role }
        | Self::Move { role, .. } | Self::Unsupported { role, .. } => *role,
    } }
    fn validate(&self) -> Result<(), ProtocolError> {
        match self {
            Self::Unsupported { .. } => Err(ProtocolError::UnsupportedIntent),
            Self::HoldSmite { role } if *role != Role::Jungle => Err(ProtocolError::InvalidRoleForIntent),
            Self::Move { x_millionths, y_millionths, .. }
                if !(0..=1_000_000).contains(x_millionths)
                    || !(0..=1_000_000).contains(y_millionths) => Err(ProtocolError::InvalidCoordinates),
            _ => Ok(()),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum RequestBody { Batch(Vec<Intent>), Ready }

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ClientRequest {
    pub request_id: String,
    pub expected_round: u32,
    pub expected_revision: u64,
    pub body: RequestBody,
}
impl ClientRequest {
    pub fn batch(request_id: &str, round: u32, revision: u64, operations: Vec<Intent>) -> Self {
        Self { request_id: request_id.into(), expected_round: round, expected_revision: revision,
            body: RequestBody::Batch(operations) }
    }
    pub fn ready(request_id: &str, round: u32, revision: u64) -> Self {
        Self { request_id: request_id.into(), expected_round: round, expected_revision: revision,
            body: RequestBody::Ready }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Phase { Planning, SealedForResolution }

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ProtocolError {
    InvalidCredentials, InvalidRoomId, Unauthorized, InvalidRequestId, WrongRound, StaleRevision,
    AlreadyReady, WrongPhase, EmptyBatch, TooManyOperations, UnsupportedIntent,
    InvalidCoordinates, InvalidRoleForIntent, RequestIdConflict, RevisionOverflow, RoundOverflow,
}

/// This value can only be created by `RoomProtocol::authenticate`. It must be
/// treated as a private server-side capability. It is not serialized to users.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct AuthenticatedSeat { seat: SeatId, epoch: u64, room_id: String }
impl AuthenticatedSeat {
    pub const fn seat(&self) -> SeatId { self.seat }
    pub const fn team(&self) -> Team { self.seat.team() }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Receipt {
    pub request_id: String,
    pub round: u32,
    pub revision: u64,
    pub admitted_intents: usize,
    pub is_ready: bool,
    pub round_sealed: bool,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct QueuedIntent { pub seat: SeatId, pub intent: Intent }

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum EventScope { Public, Team(Team), Unclassified }
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum EventKind { OrderQueued, ReadyConfirmed, TurnSealed, Unknown(String) }
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DomainEvent {
    pub scope: EventScope,
    pub kind: EventKind,
    /// Never sent to clients. Private details are not passed through by spread.
    pub internal_details: String,
}
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum VisibleEventKind { OrderQueued, ReadyConfirmed, TurnSealed }
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct VisibleEvent { pub kind: VisibleEventKind }

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SseCursor { pub room_id: String, pub room_epoch: u64, pub seat: SeatId, pub revision: u64 }
impl SseCursor {
    pub fn wire(&self) -> String {
        format!("{}/{}/{}/{}", self.room_id, self.room_epoch, self.seat.wire(), self.revision)
    }
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct TeamSnapshot {
    pub room_id: String,
    pub room_epoch: u64,
    pub seat: SeatId,
    pub round: u32,
    pub revision: u64,
    pub phase: Phase,
    pub own_ready: bool,
    pub both_ready: bool,
    pub own_intents: Vec<Intent>,
    pub visible_events: Vec<VisibleEvent>,
    pub cursor: SseCursor,
}

/// Deep cloneable state is a *staging primitive* only. A real server must
/// atomically persist the whole world+this protocol state before publishing it.
#[derive(Clone, PartialEq, Eq)]
pub struct RoomProtocol {
    room_id: String,
    epoch: u64,
    round: u32,
    revision: u64,
    phase: Phase,
    seat_ready: [bool; 2],
    credentials: [String; 2],
    queued: Vec<QueuedIntent>,
    events: Vec<DomainEvent>,
    receipts: BTreeMap<(u32, SeatId, String), (ClientRequest, Receipt)>,
}
impl std::fmt::Debug for RoomProtocol {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("RoomProtocol")
            .field("room_id", &self.room_id)
            .field("epoch", &self.epoch)
            .field("round", &self.round)
            .field("revision", &self.revision)
            .field("phase", &self.phase)
            .field("seat_ready", &self.seat_ready)
            .field("queued_count", &self.queued.len())
            .field("events_count", &self.events.len())
            .field("receipts_count", &self.receipts.len())
            .finish()
    }
}
impl RoomProtocol {
    /// The caller MUST supply a unique, persistent room ID. It is not a secret;
    /// never use a reused ID/epoch pair for independent rooms. Authentication
    /// still requires a separate private cookie/session layer in production.
    /// `credentials` are temporary QA secrets, NOT real browser auth.
    pub fn new(room_id: &str, epoch: u64, credentials: [String; 2]) -> Result<Self, ProtocolError> {
        if room_id.is_empty() || room_id.len() > 64
            || !room_id.bytes().all(|c| c.is_ascii_alphanumeric() || c == b'-' || c == b'_') {
            return Err(ProtocolError::InvalidRoomId);
        }
        if epoch == 0 || credentials.iter().any(|s| s.len() < 16 || s.len() > 256)
            || credentials[0] == credentials[1]
            || credentials.iter().any(|s| !s.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_')) {
            return Err(ProtocolError::InvalidCredentials);
        }
        Ok(Self { room_id: room_id.into(), epoch,
            round: 1, revision: 0, phase: Phase::Planning,
            seat_ready: [false; 2], credentials, queued: Vec::new(), events: Vec::new(),
            receipts: BTreeMap::new() })
    }
    pub fn authenticate(&self, token: &str) -> Option<AuthenticatedSeat> {
        // Token validation and rotation belong in the real HTTP auth gateway.
        let seat = if token == self.credentials[0] { SeatId::P1 }
            else if token == self.credentials[1] { SeatId::P2 }
            else { return None };
        Some(AuthenticatedSeat { seat, epoch: self.epoch, room_id: self.room_id.clone() })
    }
    fn seat(&self, grant: &AuthenticatedSeat) -> Result<SeatId, ProtocolError> {
        if grant.epoch != self.epoch || grant.room_id != self.room_id {
            return Err(ProtocolError::Unauthorized);
        }
        Ok(grant.seat)
    }
    pub const fn round(&self) -> u32 { self.round }
    pub const fn revision(&self) -> u64 { self.revision }
    pub const fn phase(&self) -> Phase { self.phase }
    pub fn is_ready(&self, seat: SeatId) -> bool { self.seat_ready[seat.index()] }
    #[cfg(test)]
    fn queued(&self) -> &[QueuedIntent] { &self.queued }
    pub fn receipts_len(&self) -> usize { self.receipts.len() }

    /// Build a proposal while leaving the live room unchanged. The future
    /// authoritative server must persist the returned staged room+receipt
    /// before replacing any published state or sending SSE/HTTP ACK.
    pub fn stage_request(&self, grant: &AuthenticatedSeat, request: ClientRequest) -> Result<(Self, Receipt), ProtocolError> {
        let mut candidate = self.clone();
        let receipt = candidate.submit(grant, request)?;
        Ok((candidate, receipt))
    }
    pub fn submit(&mut self, grant: &AuthenticatedSeat, request: ClientRequest) -> Result<Receipt, ProtocolError> {
        let seat = self.seat(grant)?;
        if request.request_id.is_empty() || request.request_id.len() > 64
            || !request.request_id.bytes().all(|c| c.is_ascii_alphanumeric() || c == b'-' || c == b'_') {
            return Err(ProtocolError::InvalidRequestId);
        }
        let key = (request.expected_round, seat, request.request_id.clone());
        // A durable receipt must be consulted BEFORE phase/ready/revision checks,
        // so a lost ACK can be replayed after both seats have confirmed.
        if let Some((canonical, receipt)) = self.receipts.get(&key) {
            return if canonical == &request { Ok(receipt.clone()) }
                else { Err(ProtocolError::RequestIdConflict) };
        }
        if request.expected_round != self.round { return Err(ProtocolError::WrongRound); }
        if self.phase != Phase::Planning { return Err(ProtocolError::WrongPhase); }
        if self.seat_ready[seat.index()] { return Err(ProtocolError::AlreadyReady); }
        if request.expected_revision != self.revision { return Err(ProtocolError::StaleRevision); }
        let next_revision = self.revision.checked_add(1).ok_or(ProtocolError::RevisionOverflow)?;
        match &request.body {
            RequestBody::Batch(operations) => {
                if operations.is_empty() { return Err(ProtocolError::EmptyBatch); }
                if operations.len() > 64 { return Err(ProtocolError::TooManyOperations); }
                // Validate the ENTIRE batch before any writes to staged or live state.
                for operation in operations { operation.validate()?; }
            }
            RequestBody::Ready => {}
        }
        let mut next = self.clone();
        let mut receipt = Receipt { request_id: request.request_id.clone(), round: self.round,
            revision: next_revision, admitted_intents: 0, is_ready: false, round_sealed: false };
        match &request.body {
            RequestBody::Batch(operations) => {
                receipt.admitted_intents = operations.len();
                for operation in operations {
                    next.queued.push(QueuedIntent { seat, intent: operation.clone() });
                }
                next.events.push(DomainEvent { scope: EventScope::Team(seat.team()),
                    kind: EventKind::OrderQueued, internal_details: "private plan not sent to opponent".into() });
            }
            RequestBody::Ready => {
                next.seat_ready[seat.index()] = true;
                receipt.is_ready = true;
                next.events.push(DomainEvent { scope: EventScope::Team(seat.team()),
                    kind: EventKind::ReadyConfirmed, internal_details: "internal ready".into() });
                if next.seat_ready.iter().all(|x| *x) {
                    next.phase = Phase::SealedForResolution;
                    receipt.round_sealed = true;
                    next.events.push(DomainEvent { scope: EventScope::Public,
                        kind: EventKind::TurnSealed, internal_details: "internal turn state".into() });
                }
            }
        }
        next.revision = next_revision;
        next.receipts.insert(key, (request, receipt.clone()));
        // IN-MEMORY atomic swap. The real server must do durable commit first.
        *self = next;
        Ok(receipt)
    }

    #[cfg(test)]
    fn append_internal_event(&mut self, event: DomainEvent) {
        // Only used by tests; an authoritative server event journal will own this.
        self.events.push(event);
    }
    pub fn view(&self, grant: &AuthenticatedSeat) -> Result<TeamSnapshot, ProtocolError> {
        let seat = self.seat(grant)?;
        let team = seat.team();
        let own_intents = self.queued.iter().filter(|q| q.seat == seat)
            .map(|q| q.intent.clone()).collect();
        let visible_events = self.events.iter().filter_map(|e| {
            if !matches!(&e.scope, EventScope::Public) && !matches!(&e.scope, EventScope::Team(t) if *t == team) {
                return None;
            }
            // Scope AND kind must match the protocol allowlist. A mistakenly
            // public OrderQueued/ReadyConfirmed event is NOT safe to reveal.
            let kind = match (&e.scope, &e.kind) {
                (EventScope::Team(owner), EventKind::OrderQueued) if *owner == team => VisibleEventKind::OrderQueued,
                (EventScope::Team(owner), EventKind::ReadyConfirmed) if *owner == team => VisibleEventKind::ReadyConfirmed,
                (EventScope::Public, EventKind::TurnSealed) => VisibleEventKind::TurnSealed,
                _ => return None,
            };
            Some(VisibleEvent { kind })
        }).collect();
        Ok(TeamSnapshot { room_id: self.room_id.clone(), room_epoch: self.epoch, seat, round: self.round,
            revision: self.revision, phase: self.phase, own_ready: self.is_ready(seat),
            both_ready: self.seat_ready.iter().all(|x| *x), own_intents, visible_events,
            cursor: SseCursor { room_id: self.room_id.clone(), room_epoch: self.epoch,
                seat, revision: self.revision } })
    }
    /// A foreign or bogus Last-Event-ID is NEVER used as authentication.
    /// Return the current authorized snapshot for any cursor/gap, like A14.
    pub fn resync(&self, grant: &AuthenticatedSeat, _last_event_id: Option<&str>) -> Result<TeamSnapshot, ProtocolError> {
        self.view(grant)
    }
    /// May be called ONLY by the authoritative simulation after it committed
    /// resolution. This is not a gameplay method and does not simulate combat.
    /// Stage the next round without mutating the published room. The future
    /// game-server must durably commit its *full world* and this proposal before
    /// swapping the live state or broadcasting the next-turn snapshot.
    pub fn stage_next_round(&self) -> Result<Self, ProtocolError> {
        let mut staged = self.clone();
        staged.begin_next_round()?;
        Ok(staged)
    }
    pub fn begin_next_round(&mut self) -> Result<u32, ProtocolError> {
        if self.phase != Phase::SealedForResolution { return Err(ProtocolError::WrongPhase); }
        let round = self.round.checked_add(1).ok_or(ProtocolError::RoundOverflow)?;
        let revision = self.revision.checked_add(1).ok_or(ProtocolError::RevisionOverflow)?;
        self.round = round;
        self.revision = revision;
        self.phase = Phase::Planning;
        self.seat_ready = [false; 2];
        self.queued.clear();
        self.events.clear();
        Ok(self.round)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn room() -> RoomProtocol {
        RoomProtocol::new("room-test", 20261030, ["blue_secure_session_0001".into(), "red_secure_session_0002".into()]).unwrap()
    }
    fn blue(s: &RoomProtocol) -> AuthenticatedSeat { s.authenticate("blue_secure_session_0001").unwrap() }
    fn red(s: &RoomProtocol) -> AuthenticatedSeat { s.authenticate("red_secure_session_0002").unwrap() }
    fn stop(role: Role) -> Intent { Intent::Stop { role } }
    fn req(id: &str, rev: u64, ops: Vec<Intent>) -> ClientRequest { ClientRequest::batch(id, 1, rev, ops) }
    fn ready(id: &str, rev: u64) -> ClientRequest { ClientRequest::ready(id, 1, rev) }

    #[test] fn credentials_must_be_distinct_and_nontrivial() {
        assert_eq!(RoomProtocol::new("room-test", 1, ["short".into(), "different".into()]), Err(ProtocolError::InvalidCredentials));
        assert_eq!(RoomProtocol::new("room-test", 1, ["same_token_with_length".into(), "same_token_with_length".into()]), Err(ProtocolError::InvalidCredentials));
        assert_eq!(RoomProtocol::new("room-test", 0, ["blue_secure_session_0001".into(), "red_secure_session_0002".into()]), Err(ProtocolError::InvalidCredentials));
    }
    #[test] fn room_id_validation_prevents_path_and_empty_identifiers() {
        for id in ["", "other/room", "../escape", "bad room", "!", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"] {
            assert_eq!(RoomProtocol::new(id, 7, ["blue_secure_session_0001".into(), "red_secure_session_0002".into()]),
                Err(ProtocolError::InvalidRoomId));
        }
    }
    #[test] fn cursors_are_bound_to_room_id_even_with_equal_epoch_and_revision() {
        let a = room();
        let b = RoomProtocol::new("another-room", 20261030,
            ["another_blue_session_0001".into(), "another_red_session_0002".into()]).unwrap();
        // Each room has its own credentials: do not use room A's blue token in B.
        assert!(b.authenticate("blue_secure_session_0001").is_none());
        let b_grant = b.authenticate("another_blue_session_0001").unwrap();
        assert_ne!(a.view(&blue(&a)).unwrap().cursor.wire(), b.view(&b_grant).unwrap().cursor.wire());
    }
    #[test] fn debug_representation_redacts_credentials_and_details() {
        let r=room();let printed=format!("{:?}",r);
        assert!(!printed.contains("blue_secure_session_0001"));
        assert!(!printed.contains("red_secure_session_0002"));
        assert!(!printed.contains("receipts:"));
    }
    #[test] fn invalid_session_is_denied() { assert!(room().authenticate("wrong").is_none()); }
    #[test] fn two_seats_five_roles() { assert_eq!(Role::ALL.len(), 5); assert_eq!(SeatId::P1.team(), Team::Blue); assert_eq!(SeatId::P2.team(), Team::Red); }
    #[test] fn private_grant_bound_to_epoch() {
        let r = room(); let grant = blue(&r);
        let new_r = RoomProtocol::new("room-test", 99, ["blue_secure_session_0001".into(), "red_secure_session_0002".into()]).unwrap();
        assert_eq!(new_r.view(&grant), Err(ProtocolError::Unauthorized));
    }
    #[test] fn preview_initial_snapshot_has_only_self_and_cursor() {
        let r=room();let a=r.view(&blue(&r)).unwrap();let b=r.view(&red(&r)).unwrap();
        assert_eq!(a.cursor.wire(), "room-test/20261030/p1/0");
        assert_eq!(b.cursor.wire(), "room-test/20261030/p2/0");
        assert!(a.own_intents.is_empty() && b.own_intents.is_empty());
    }
    #[test] fn empty_and_long_batch_are_rejected_without_mutation() {
        let mut r=room();let grant=blue(&r);let before=r.clone();
        assert_eq!(r.submit(&grant,req("e",0,vec![])),Err(ProtocolError::EmptyBatch));
        assert_eq!(r.submit(&grant,req("huge",0,vec![stop(Role::Mid);65])),Err(ProtocolError::TooManyOperations));
        assert_eq!(r,before);
    }
    #[test] fn staged_acceptance_does_not_modify_live_room() {
        let r=room();let g=blue(&r);let original=r.clone();
        let (staged,receipt)=r.stage_request(&g,req("staged",0,vec![Intent::Recall {role:Role::Adc}])).unwrap();
        assert_eq!(r,original);assert_eq!(r.revision(),0);
        assert_eq!(staged.revision(),1);assert_eq!(receipt.revision,1);
    }
    #[test] fn failed_staging_keeps_live_room_unchanged() {
        let r=room();let g=blue(&r);let original=r.clone();
        let result=r.stage_request(&g,req("bad",0,vec![stop(Role::Top),Intent::Unsupported {role:Role::Mid,original_kind:"unknown".into()}]));
        assert_eq!(result,Err(ProtocolError::UnsupportedIntent));assert_eq!(r,original);
    }
    #[test] fn staged_ready_does_not_seal_published_state() {
        let r=room();let g=blue(&r);
        let (staged,ack)=r.stage_request(&g,ready("ready-blue",0)).unwrap();
        assert!(ack.is_ready);assert!(!r.is_ready(SeatId::P1));assert!(staged.is_ready(SeatId::P1));
    }
    #[test] fn malformed_request_ids_fail_closed() {
        let mut r=room();let g=blue(&r);
        for id in ["", "invalid id", "a/b", "\n", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"] {
            assert_eq!(r.submit(&g,req(id,0,vec![stop(Role::Top)])),Err(ProtocolError::InvalidRequestId));
        }
        assert_eq!(r.revision(),0);
    }
    #[test] fn invalid_coordinates_rollback_complete_batch() {
        let mut r=room();let g=blue(&r);let before=r.clone();
        let ops=vec![Intent::Recall{role:Role::Adc}, Intent::Move {role:Role::Mid,x_millionths:-1,y_millionths:500_000}];
        assert_eq!(r.submit(&g,req("badmove",0,ops)),Err(ProtocolError::InvalidCoordinates));
        assert_eq!(r,before);
    }
    #[test] fn unsupported_action_rejected_without_fallback() {
        let mut r=room();let g=blue(&r);let before=r.clone();
        let ops=vec![stop(Role::Adc),Intent::Unsupported {role:Role::Mid,original_kind:"sylas-steal-r".into()}];
        assert_eq!(r.submit(&g,req("unknown",0,ops)),Err(ProtocolError::UnsupportedIntent));
        assert_eq!(r,before);
    }
    #[test] fn smite_policy_requires_jungle_role() {
        let mut r=room();let g=blue(&r);let before=r.clone();
        assert_eq!(r.submit(&g,req("wrongrole",0,vec![Intent::HoldSmite{role:Role::Mid}])),Err(ProtocolError::InvalidRoleForIntent));
        assert_eq!(r,before);
    }
    #[test] fn valid_move_boundaries() {
        let mut r=room();let g=blue(&r);
        assert!(r.submit(&g,req("move",0,vec![Intent::Move{role:Role::Top,x_millionths:0,y_millionths:1_000_000}])).is_ok());
    }
    #[test] fn typed_five_champion_batch_has_one_revision() {
        let mut r=room();let g=blue(&r);
        let ops=Role::ALL.iter().copied().map(stop).collect();
        let receipt=r.submit(&g,req("all5",0,ops)).unwrap();
        assert_eq!(receipt.admitted_intents,5);
        assert_eq!(receipt.revision,1);
        assert_eq!(r.queued().len(),5);
    }
    #[test] fn red_team_sees_no_blue_orders() {
        let mut r=room();let a=blue(&r);let b=red(&r);
        r.submit(&a,req("b",0,vec![Intent::FarmSafe{role:Role::Mid}])).unwrap();
        assert_eq!(r.view(&a).unwrap().own_intents.len(),1);
        assert_eq!(r.view(&b).unwrap().own_intents.len(),0);
        assert!(r.view(&b).unwrap().visible_events.is_empty());
    }
    #[test] fn both_players_have_independent_queues() {
        let mut r=room();let a=blue(&r);let b=red(&r);
        r.submit(&a,req("blue-1",0,vec![stop(Role::Top)])).unwrap();
        r.submit(&b,req("red-1",1,vec![stop(Role::Jungle)])).unwrap();
        assert_eq!(r.view(&a).unwrap().own_intents,vec![stop(Role::Top)]);
        assert_eq!(r.view(&b).unwrap().own_intents,vec![stop(Role::Jungle)]);
    }
    #[test] fn stale_revision_fails_without_side_effect() {
        let mut r=room();let a=blue(&r);let b=red(&r);
        r.submit(&a,req("a",0,vec![stop(Role::Mid)])).unwrap();
        let before=r.clone();
        assert_eq!(r.submit(&b,req("b",0,vec![stop(Role::Mid)])),Err(ProtocolError::StaleRevision));
        assert_eq!(r,before);
    }
    #[test] fn idempotent_request_replays_exact_receipt() {
        let mut r=room();let a=blue(&r);
        let p=req("id",0,vec![stop(Role::Mid)]);
        let receipt=r.submit(&a,p.clone()).unwrap();let state=r.clone();
        assert_eq!(r.submit(&a,p).unwrap(),receipt);assert_eq!(r,state);
    }
    #[test] fn changed_payload_with_same_request_id_rejected() {
        let mut r=room();let a=blue(&r);
        r.submit(&a,req("id",0,vec![stop(Role::Mid)])).unwrap();let state=r.clone();
        assert_eq!(r.submit(&a,req("id",0,vec![stop(Role::Top)])),Err(ProtocolError::RequestIdConflict));
        assert_eq!(r,state);
    }
    #[test] fn different_seats_can_use_same_request_id() {
        let mut r=room();let a=blue(&r);let b=red(&r);
        assert!(r.submit(&a,req("same",0,vec![stop(Role::Mid)])).is_ok());
        assert!(r.submit(&b,req("same",1,vec![stop(Role::Mid)])).is_ok());
        assert_eq!(r.receipts_len(),2);
    }
    #[test] fn first_ready_blocks_own_edits_but_not_red() {
        let mut r=room();let a=blue(&r);let b=red(&r);
        assert!(r.submit(&a,ready("r1",0)).unwrap().is_ready);
        assert_eq!(r.submit(&a,req("late",1,vec![stop(Role::Mid)])),Err(ProtocolError::AlreadyReady));
        assert!(r.submit(&b,req("still-legal",1,vec![stop(Role::Mid)])).is_ok());
    }
    #[test] fn second_ready_seals_once() {
        let mut r=room();let a=blue(&r);let b=red(&r);
        r.submit(&a,ready("blue",0)).unwrap();
        let end=r.submit(&b,ready("red",1)).unwrap();
        assert!(end.round_sealed);assert_eq!(r.phase(),Phase::SealedForResolution);
        assert_eq!(r.submit(&b,ready("new",2)),Err(ProtocolError::WrongPhase));
    }
    #[test] fn duplicate_ready_after_seal_returns_original_receipt() {
        let mut r=room();let a=blue(&r);let b=red(&r);
        let p=ready("blue",0);let ack=r.submit(&a,p.clone()).unwrap();
        r.submit(&b,ready("red",1)).unwrap();let before=r.clone();
        assert_eq!(r.submit(&a,p).unwrap(),ack);assert_eq!(r,before);
    }
    #[test] fn request_id_conflict_after_seal_is_rejected() {
        let mut r=room();let a=blue(&r);let b=red(&r);
        r.submit(&a,ready("ready",0)).unwrap();r.submit(&b,ready("red",1)).unwrap();
        assert_eq!(r.submit(&a,ready("ready",1)),Err(ProtocolError::RequestIdConflict));
    }
    #[test] fn old_receipt_replays_even_after_next_round() {
        let mut r=room();let a=blue(&r);let b=red(&r);
        let p=req("first",0,vec![stop(Role::Top)]);let ack=r.submit(&a,p.clone()).unwrap();
        r.submit(&a,ready("bready",1)).unwrap();r.submit(&b,ready("rready",2)).unwrap();
        assert_eq!(r.begin_next_round(),Ok(2));
        assert_eq!(r.submit(&a,p).unwrap(),ack);
    }
    #[test] fn cross_room_grants_rejected_even_when_epoch_matches() {
        let a = room(); let grant = blue(&a);
        let b = RoomProtocol::new("another-room", 20261030, ["another_blue_session_0001".into(), "another_red_session_0002".into()]).unwrap();
        assert_eq!(b.view(&grant), Err(ProtocolError::Unauthorized));
        let mut b_clone = b.clone();
        assert_eq!(b_clone.submit(&grant, req("stolen", 0, vec![stop(Role::Top)])), Err(ProtocolError::Unauthorized));
        assert_eq!(b_clone, b);
    }
    #[test] fn correct_grant_still_valid_for_same_room_staging_clone() {
        let a = room(); let grant = blue(&a);
        let (staged, receipt) = a.stage_request(&grant, req("staged-auth", 0, vec![stop(Role::Top)])).unwrap();
        assert_eq!(staged.view(&grant).unwrap().revision, receipt.revision);
        assert_eq!(a.revision(), 0);
    }
    #[test] fn public_order_and_ready_events_are_default_denied() {
        let mut r = room(); let a = blue(&r); let b = red(&r);
        for kind in [EventKind::OrderQueued, EventKind::ReadyConfirmed] {
            r.append_internal_event(DomainEvent { scope: EventScope::Public, kind,
                internal_details: "secret (misclassified by producer)".into() });
        }
        assert!(r.view(&a).unwrap().visible_events.is_empty());
        assert!(r.view(&b).unwrap().visible_events.is_empty());
    }
    #[test] fn team_scoped_seal_event_is_default_denied() {
        let mut r = room(); let a = blue(&r); let b = red(&r);
        r.append_internal_event(DomainEvent { scope: EventScope::Team(Team::Blue),
            kind: EventKind::TurnSealed, internal_details: "misclassified seal".into() });
        assert!(r.view(&a).unwrap().visible_events.is_empty());
        assert!(r.view(&b).unwrap().visible_events.is_empty());
    }
    #[test] fn staging_next_round_preserves_published_receipts() {
        let mut r = room(); let a = blue(&r); let b = red(&r);
        let packet = req("first", 0, vec![stop(Role::Top)]);
        let receipt = r.submit(&a, packet.clone()).unwrap();
        r.submit(&a, ready("blue", 1)).unwrap();
        r.submit(&b, ready("red", 2)).unwrap();
        let original = r.clone();
        let staged = r.stage_next_round().unwrap();
        assert_eq!(r, original);
        assert_eq!(staged.round(), 2);
        assert_eq!(staged.phase(), Phase::Planning);
        let mut recovered = staged;
        assert_eq!(recovered.submit(&a, packet).unwrap(), receipt);
    }
    #[test] fn rejected_stage_next_round_does_not_mutate_state() {
        let r = room(); let before = r.clone();
        assert_eq!(r.stage_next_round(), Err(ProtocolError::WrongPhase));
        assert_eq!(r, before);
    }
    #[test] fn next_round_resets_ready_and_own_orders() {
        let mut r=room();let a=blue(&r);let b=red(&r);
        r.submit(&a,req("order",0,vec![stop(Role::Adc)])).unwrap();
        r.submit(&a,ready("readyblue",1)).unwrap();r.submit(&b,ready("readyred",2)).unwrap();
        assert_eq!(r.begin_next_round(),Ok(2));
        assert_eq!(r.phase(),Phase::Planning);assert!(!r.is_ready(SeatId::P1));
        assert!(r.view(&a).unwrap().own_intents.is_empty());
    }
    #[test] fn cannot_advance_without_both_ready() { let mut r=room();assert_eq!(r.begin_next_round(),Err(ProtocolError::WrongPhase)); }
    #[test] fn unknown_events_and_details_are_never_projected() {
        let mut r=room();let a=blue(&r);
        r.append_internal_event(DomainEvent {scope:EventScope::Unclassified,kind:EventKind::Unknown("private-canary".into()),internal_details:"SECRET".into()});
        r.append_internal_event(DomainEvent {scope:EventScope::Public,kind:EventKind::Unknown("unknown".into()),internal_details:"SECRET".into()});
        assert!(r.view(&a).unwrap().visible_events.is_empty());
    }
    #[test] fn red_private_events_do_not_appear_on_blue() {
        let mut r=room();let a=blue(&r);let b=red(&r);
        r.append_internal_event(DomainEvent {scope:EventScope::Team(Team::Red),kind:EventKind::OrderQueued,internal_details:"SECRET".into()});
        assert!(r.view(&a).unwrap().visible_events.is_empty());
        assert_eq!(r.view(&b).unwrap().visible_events,vec![VisibleEvent{kind:VisibleEventKind::OrderQueued}]);
    }
    #[test] fn public_known_events_redact_details() {
        let mut r=room();let a=blue(&r);
        r.append_internal_event(DomainEvent {scope:EventScope::Public,kind:EventKind::TurnSealed,internal_details:"private_rng=123".into()});
        assert_eq!(r.view(&a).unwrap().visible_events,vec![VisibleEvent{kind:VisibleEventKind::TurnSealed}]);
    }
    #[test] fn stolen_cursor_does_not_change_authorized_team() {
        let r=room();let a=blue(&r);let cursor=r.view(&red(&r)).unwrap().cursor.wire();
        let b=r.resync(&a,Some(&cursor)).unwrap();
        assert_eq!(b.seat,SeatId::P1);assert_eq!(b.cursor.wire(),"room-test/20261030/p1/0");
    }
    #[test] fn clone_restore_keeps_receipts_and_revision() {
        let mut r=room();let a=blue(&r);let p=req("receipt",0,vec![stop(Role::Top)]);
        let receipt=r.submit(&a,p.clone()).unwrap();
        let mut restored=r.clone();assert_eq!(restored.submit(&a,p).unwrap(),receipt);
        assert_eq!(restored.revision(),1);
    }
    #[test] fn wrong_round_rejected_without_mutation() {
        let mut r=room();let a=blue(&r);let before=r.clone();
        assert_eq!(r.submit(&a,ClientRequest::batch("bad-round",2,0,vec![stop(Role::Top)])),Err(ProtocolError::WrongRound));
        assert_eq!(r,before);
    }
    #[test] fn batch_operation_order_preserved() {
        let mut r=room();let a=blue(&r);
        let ops=vec![Intent::Recall{role:Role::Adc},Intent::FarmSafe{role:Role::Mid},Intent::HoldSmite{role:Role::Jungle}];
        assert!(r.submit(&a,req("plan",0,ops.clone())).is_ok());
        assert_eq!(r.view(&a).unwrap().own_intents,ops);
    }
}
