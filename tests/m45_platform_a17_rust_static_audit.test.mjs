/** A17 Node static guardrail checks ONLY. These never compile or execute Rust. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../crates/core-protocol/src/lib.rs',import.meta.url),'utf8');
const cargo=readFileSync(new URL('../crates/core-protocol/Cargo.toml',import.meta.url),'utf8');
let n=0;
function check(label,fn){fn();n++;console.log(`PASS A17 STATIC ${label}`)}
const between=(a,b)=>{const start=source.indexOf(a),end=source.indexOf(b,start+a.length);assert.ok(start>=0&&end>start,`Missing ${a} or ${b}`);return source.slice(start,end)};
check('01 Rust crate is a standalone cdylib/rlib with no external crates',()=>{
 assert.match(cargo,/name\s*=\s*"coachlol-core-protocol"/);
 assert.match(cargo,/crate-type\s*=\s*\["rlib", "cdylib"\]/);
 assert.match(cargo,/\[dependencies\]\s*\n# Dependency-free/);
});
check('02 exactly two authenticated seats and five original role names',()=>{
 assert.match(source,/pub enum SeatId \{ P1, P2 \}/);
 assert.match(source,/pub const ALL: \[Self; 5\]/);
 for(const role of ['TOP','JG','MID','ADC','SUP'])assert.ok(source.includes(`"${role}"`));
});
check('03 room credential fields and grant fields not public',()=>{
 assert.match(source,/pub struct AuthenticatedSeat \{ seat: SeatId, epoch: u64 \}/);
 assert.match(source,/credentials: \[String; 2\]/);
 assert.ok(!source.includes('pub credentials:'));
});
check('04 requestId and admission preflight before clone or mutation',()=>{
 const submit=between('    pub fn submit(', '    #[cfg(test)]');
 const order=['request.request_id.is_empty()', 'self.receipts.get(&key)', 'self.seat_ready[seat.index()]', 'request.expected_revision != self.revision','for operation in operations { operation.validate()?; }','let mut next = self.clone();','next.receipts.insert(key, (request, receipt.clone()));','*self = next;'];
 const ix=order.map(s=>{const at=submit.indexOf(s);assert.ok(at>=0,s);return at});
 assert.ok(ix.every((p,i)=>i===0||p>ix[i-1]));
});
check('05 original request body, ready, canonical payload and response typed',()=>{
 for(const name of ['enum RequestBody','struct ClientRequest','struct Receipt','enum Intent','enum ProtocolError','enum Phase'])assert.ok(source.includes(name));
 assert.ok(source.includes('RequestIdConflict'));
});
check('06 unsupported and invalid operations refuse entire batch',()=>{
 for(const err of ['UnsupportedIntent','InvalidCoordinates','InvalidRoleForIntent','EmptyBatch','TooManyOperations'])assert.ok(source.includes(err));
 assert.ok(source.includes('Intent::HoldSmite{role:Role::Mid}'));
});
check('07 own-team projection discards opposite seat queued actions',()=>{
 assert.ok(source.includes('self.queued.iter().filter(|q| q.seat == seat)'));
 assert.ok(source.includes('self.seat(grant)?'));
 assert.ok(source.includes('self.view(grant)'));
});
check('08 event producer whitelist drops unknown and unclassified private events',()=>{
 assert.ok(source.includes('EventKind::Unknown(_) => return None'));
 assert.ok(source.includes('EventScope::Unclassified'));
 assert.ok(!between('pub struct VisibleEvent {','pub struct SseCursor').includes('internal_details'));
});
check('09 cursor includes epoch and authorized seat and committed-like revision placeholder',()=>{
 for(const x of ['pub room_epoch: u64','pub seat: SeatId','pub revision: u64'])assert.ok(source.includes(x));
 assert.ok(source.includes('self.view(grant)'));
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
 assert.equal(names.length,36);assert.equal(new Set(names).size,36);
});
check('14 no unsafe Rust, unchecked panics or network operations in production section',()=>{
 const logic=source.split('#[cfg(test)]\nmod tests')[0];
 assert.doesNotMatch(logic,/\bunsafe\b\s*\{/);
 assert.doesNotMatch(logic,/\.unwrap\(\)/);
 assert.doesNotMatch(logic,/TcpListener|TcpStream|std::net::/);
});
console.log(`M45 A17 ${n}/14 Node static guards PASS; Rust compile/test NOT_RUN (toolchain absent)`);
