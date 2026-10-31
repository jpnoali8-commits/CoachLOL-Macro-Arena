/** A18 Node static guardrail checks ONLY. These never compile or execute Rust. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../crates/core-protocol/src/lib.rs',import.meta.url),'utf8');
const cargo=readFileSync(new URL('../crates/core-protocol/Cargo.toml',import.meta.url),'utf8');
// rustfmt may split/indent syntax without changing meaning; lexical guards
// must not depend on source whitespace. These are NOT semantic Rust tests.
const lex=snippet=>snippet.replace(/\s+/g,'').replace(/,([}\])])/g,'$1');
const compact=lex(source);
const hasCode=snippet=>compact.includes(lex(snippet));
const includesCode=(haystack,needle)=>haystack.includes(lex(needle));
let n=0;
function check(label,fn){fn();n++;console.log(`PASS A18 STATIC ${label}`)}
const between=(a,b)=>{const left=lex(a),right=lex(b);const start=compact.indexOf(left),end=compact.indexOf(right,start+left.length);assert.ok(start>=0&&end>start,`Missing ${a} or ${b}`);return compact.slice(start,end)};
check('01 Rust crate is a standalone cdylib/rlib with no external crates',()=>{
 assert.match(cargo,/name\s*=\s*"coachlol-core-protocol"/);
 assert.match(cargo,/crate-type\s*=\s*\["rlib", "cdylib"\]/);
 assert.match(cargo,/\[dependencies\]\s*\n# Dependency-free/);
});
check('02 exactly two authenticated seats and five original role names',()=>{
 assert.ok(hasCode('pub enum SeatId { P1, P2 }'));
 assert.match(source,/pub const ALL: \[Self; 5\]/);
 for(const role of ['TOP','JG','MID','ADC','SUP'])assert.ok(hasCode(`"${role}"`));
});
check('03 room credential fields and grant fields not public',()=>{
 assert.ok(hasCode('pub struct AuthenticatedSeat { seat: SeatId, epoch: u64, room_id: String }'));
 assert.ok(hasCode('credentials: [String; 2]'));
 assert.ok(!hasCode('pub credentials:'));
});
check('04 requestId and admission preflight before clone or mutation',()=>{
 const submit=between('    pub fn submit(', '    #[cfg(test)]');
 const order=['request.request_id.is_empty()', 'self.receipts.get(&key)', 'self.seat_ready[seat.index()]', 'request.expected_revision != self.revision','for operation in operations { operation.validate()?; }','let mut next = self.clone();','next.receipts.insert(key, (request, receipt.clone()));','*self = next;'];
 const ix=order.map(s=>{const at=submit.indexOf(lex(s));assert.ok(at>=0,s);return at});
 assert.ok(ix.every((p,i)=>i===0||p>ix[i-1]));
});
check('05 original request body, ready, canonical payload and response typed',()=>{
 for(const name of ['enum RequestBody','struct ClientRequest','struct Receipt','enum Intent','enum ProtocolError','enum Phase'])assert.ok(hasCode(name));
 assert.ok(hasCode('RequestIdConflict'));
});
check('06 unsupported and invalid operations refuse entire batch',()=>{
 for(const err of ['UnsupportedIntent','InvalidCoordinates','InvalidRoleForIntent','EmptyBatch','TooManyOperations'])assert.ok(hasCode(err));
 assert.ok(hasCode('Intent::HoldSmite{role:Role::Mid}'));
});
check('07 own-team projection discards opposite seat queued actions',()=>{
 assert.ok(hasCode('self.queued.iter().filter(|q| q.seat == seat)'));
 assert.ok(hasCode('self.seat(grant)?'));
 assert.ok(hasCode('self.view(grant)'));
});
check('08 event producer whitelist drops unknown and unclassified private events',()=>{
 assert.ok(hasCode('(EventScope::Public, EventKind::TurnSealed) => VisibleEventKind::TurnSealed'));
 assert.ok(hasCode('(EventScope::Team(owner), EventKind::OrderQueued) if *owner == team'));
 assert.ok(hasCode('(EventScope::Team(owner), EventKind::ReadyConfirmed) if *owner == team'));
 assert.ok(hasCode('_ => return None'));
 assert.ok(hasCode('EventScope::Unclassified'));
 assert.ok(!between('pub struct VisibleEvent {','pub struct SseCursor').includes('internal_details'));
});
check('09 cursor includes epoch and authorized seat and committed-like revision placeholder',()=>{
 for(const x of ['pub room_epoch: u64','pub seat: SeatId','pub revision: u64'])assert.ok(hasCode(x));
 assert.ok(hasCode('self.view(grant)'));
 assert.ok(hasCode('pub room_id: String'));
});
check('10 raw session tokens and internal events not printed by RoomProtocol Debug',()=>{
 const dbg=between('impl std::fmt::Debug for RoomProtocol','impl RoomProtocol {');
 assert.ok(!dbg.includes('self.credentials'));
 assert.ok(!dbg.includes('self.events)'));
 assert.ok(!dbg.includes('self.receipts)'));
});
check('11 event injection helper exists only for Rust unit tests',()=>{
 assert.match(source,/\#\[cfg\(test\)\]\s+fn append_internal_event\(/);
});
check('12 Rust source bracket/string/comment scanner structurally balanced',()=>{
 const stack=[];let state='code';let i=0;
 const matching={')':'(',']':'[','}':'{'};
 while(i<source.length){const c=source[i],p=source[i+1];
  if(state==='line'){if(c==='\n')state='code';i++;continue}
  if(state==='block'){if(c==='*'&&p==='/'){state='code';i+=2}else i++;continue}
  if(state==='string'){if(c==='\\'){i+=2;continue}if(c==='"')state='code';i++;continue}
  if(c==='/'&&p==='/'){state='line';i+=2;continue}
  if(c==='/'&&p==='*'){state='block';i+=2;continue}
  if(c==='"'){state='string';i++;continue}
  if('([{'.includes(c))stack.push(c);
  else if(')]}'.includes(c))assert.equal(stack.pop(),matching[c],`Unexpected bracket at ${i}`);
  i++;
 }
 assert.equal(state,'code');assert.deepEqual(stack,[]);
});
check('13 Rust tests are present with unique symbols',()=>{
 const names=[...source.matchAll(/#\[test\]\s*fn ([A-Za-z_0-9]+)/g)].map(m=>m[1]);
 assert.equal(names.length,44);assert.equal(new Set(names).size,44);
});
check('14 no unsafe Rust, unchecked panics or network operations in production section',()=>{
 const logic=compact.split('#[cfg(test)]modtests')[0];
 assert.doesNotMatch(logic,/\bunsafe\b\s*\{/);
 assert.doesNotMatch(logic,/\.unwrap\(\)/);
 assert.doesNotMatch(logic,/TcpListener|TcpStream|std::net::/);
});
check('15 cross-room authorization capability binds unique instance',()=>{
 assert.ok(hasCode('grant.room_id != self.room_id'));
 assert.ok(hasCode('room_id: self.room_id.clone()'));
 assert.ok(hasCode('pub fn new(room_id: &str, epoch: u64'));
 assert.ok(hasCode('InvalidRoomId'));
 assert.doesNotMatch(source,/AtomicU64|AtomicUsize/);
 assert.ok(hasCode('cross_room_grants_rejected_even_when_epoch_matches'));
 assert.ok(hasCode('cursors_are_bound_to_room_id_even_with_equal_epoch_and_revision'));
});
check('16 events require allowed scope-kind combination',()=>{
 const body=between('pub fn view(&self, grant:', '    /// A foreign or bogus Last-Event-ID');
 assert.ok(includesCode(body, '(EventScope::Team(owner), EventKind::OrderQueued) if *owner == team'));
 assert.ok(includesCode(body, '(EventScope::Team(owner), EventKind::ReadyConfirmed) if *owner == team'));
 assert.ok(includesCode(body, '(EventScope::Public, EventKind::TurnSealed)'));
 for(const name of ['public_order_and_ready_events_are_default_denied','team_scoped_seal_event_is_default_denied']) assert.ok(hasCode(name));
});
check('17 next-round stage never mutates published state',()=>{
 const body=between('pub fn stage_next_round(&self)', 'pub fn begin_next_round(&mut self)');
 assert.ok(includesCode(body, 'let mut staged = self.clone();'));
 assert.ok(includesCode(body, 'staged.begin_next_round()?;'));
 assert.ok(!includesCode(body, '*self ='));
 assert.ok(hasCode('staging_next_round_preserves_published_receipts'));
});
check('18 Rust dependency and runner remain offline, no GitHub Actions',()=>{
 assert.ok(cargo.includes('Dependency-free'));
 assert.ok(!hasCode('tokio::'));
 assert.ok(!hasCode('serde::'));
});
console.log(`M45 A18 ${n}/18 Node static guards PASS; Rust compilation and Clippy are separate gates`);
