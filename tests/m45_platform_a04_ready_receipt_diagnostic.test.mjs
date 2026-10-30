/**
 * M45 PLATFORM-A04: source-pinned room.confirm() idempotency diagnostic.
 * A diagnostic PASS proves LEGACY retry rejection, NOT that ready is reliable.
 * Run: node tests/m45_platform_a04_ready_receipt_diagnostic.test.mjs
 * Source integration 374d87d5f49b52514ec68bbe666df086363c1ec5; room blob 3bdb8cd3b737d20e3700e994a8872943e53366ae.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const s=readFileSync(new URL('../multiplayer/room_v453_dev47.mjs',import.meta.url),'utf8');
const sha=createHash('sha1').update('blob '+Buffer.byteLength(s)+String.fromCharCode(0)).update(s).digest('hex');
assert.equal(sha,'3bdb8cd3b737d20e3700e994a8872943e53366ae');
const name=' confirm(p){',ix=s.indexOf(name);
assert.ok(ix>=0);
const start=s.indexOf('{',ix),end=s.indexOf('\n /** The server, never the browser',start);
assert.ok(end>start);
const snippet=s.slice(ix,end).trim();
const confirm=Function('return ({'+snippet+'}).confirm')();
let executions=0,persisted=0,notified=0;
const room={
 started:true,
 arena:{phase:'planning',pendingDecision:null,teams:{blue:{ready:false},red:{ready:false}},
  playTurn(){executions++;this.phase='executing';return {ok:true};}},
 ready:new Set(),maxSeats:2,revision:0,
 persist(){persisted++;},broadcast(){notified++;}
};
const a=confirm.call(room,{seatId:'p1'});
assert.equal(a.ok,true);assert.equal(a.phase,'planning');assert.equal(executions,0);
const lostAckRetry=confirm.call(room,{seatId:'p1'});
assert.deepEqual(lostAckRetry,{ok:false,reason:'confirmacao_indisponivel'});
assert.equal(executions,0);
const b=confirm.call(room,{seatId:'p2'});
assert.equal(b.ok,true);assert.equal(b.phase,'executing');assert.equal(executions,1);
const retryAfterSeal=confirm.call(room,{seatId:'p2'});
assert.deepEqual(retryAfterSeal,{ok:false,reason:'confirmacao_indisponivel'});
assert.equal(executions,1);
assert.equal(persisted,2);assert.equal(notified,2);
console.log('LEGACY READY DIAGNOSTIC: 2 successful accepts, 2 rejected retries, 1 execution');
console.log('RUST REQUIRED: same ready request_id must return stored ACK before and after seal/reconnect');
