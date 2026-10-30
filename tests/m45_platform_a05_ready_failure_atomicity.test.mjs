/**
 * M45 A05: original PvP room.confirm method, injected engine failure.
 * Engine failures are simulated: this is a transactional failure probe.
 * Node: node tests/m45_platform_a05_ready_failure_atomicity.test.mjs
 * Integration SHA 374d87d5f49b52514ec68bbe666df086363c1ec5; room Git blob 3bdb8cd3b737d20e3700e994a8872943e53366ae.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const source=readFileSync(new URL('../multiplayer/room_v453_dev47.mjs',import.meta.url),'utf8');
const actual=createHash('sha1').update('blob '+Buffer.byteLength(source)+String.fromCharCode(0)).update(source).digest('hex');
assert.equal(actual,'3bdb8cd3b737d20e3700e994a8872943e53366ae');
const begin=source.indexOf(' confirm(p){');
const end=source.indexOf('\n /** The server, never the browser',begin);
assert.ok(begin>=0&&end>begin,'Room.confirm boundary changed');
const confirm=Function('return ({'+source.slice(begin,end).trim()+'}).confirm')();
let successfulTurns=0,persist=0,broadcast=0,failOnce=true;
const r={
 started:true,ready:new Set(),revision:10,maxSeats:2,
 arena:{phase:'planning',pendingDecision:null,
  teams:{blue:{ready:false},red:{ready:false}},
  playTurn(){if(failOnce){failOnce=false;return {ok:false,reason:'INJECTED_ENGINE_FAIL'};}
   successfulTurns++;this.phase='executing';return {ok:true};}
 },
 persist(){persist++;},broadcast(){broadcast++;}
};
const first=confirm.call(r,{seatId:'p1'});
assert.deepEqual(first,{ok:true,revision:11,phase:'planning'});
assert.deepEqual([...r.ready],['p1']);
assert.equal(persist,1);
const failed=confirm.call(r,{seatId:'p2'});
assert.deepEqual(failed,{ok:false,reason:'INJECTED_ENGINE_FAIL'});
assert.equal(successfulTurns,0);
assert.equal(r.revision,12,'Legacy increments visible revision on failed second ready');
assert.deepEqual([...r.ready],['p1']);
assert.equal(r.arena.teams.blue.ready,false);
assert.equal(r.arena.teams.red.ready,false);
assert.equal(persist,1,'Legacy failed transaction is not persisted');
assert.equal(broadcast,1,'Legacy failed transaction is not broadcast');
const retry=confirm.call(r,{seatId:'p2'});
assert.deepEqual(retry,{ok:true,revision:13,phase:'executing'});
assert.equal(successfulTurns,1);
assert.equal(persist,2);
assert.equal(broadcast,2);
assert.deepEqual([...r.ready],[]);
assert.deepEqual(confirm.call(r,{seatId:'p2'}),{ok:false,reason:'confirmacao_indisponivel'});
assert.equal(successfulTurns,1);
console.log('A05 LEGACY_FAILURE_INJECTION_PASS: failed seal revision gap; Rust must commit atomically');
