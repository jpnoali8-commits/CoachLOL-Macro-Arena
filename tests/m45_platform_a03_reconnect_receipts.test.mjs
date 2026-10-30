/** M45 PLATFORM-A03: two-seat recovery and receipt replay; SOURCE ONLY 374d87d5f49b52514ec68bbe666df086363c1ec5.
 * Run after full checkout: node tests/m45_platform_a03_reconnect_receipts.test.mjs
 */
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {checksumV40} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),manifest=load('rift_user_manifest_v452d4.json');
const dir=mkdtempSync(join(tmpdir(),'coachlol-a03-reconnect-'));
const registry=()=>new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:dir});
let count=0;
function check(name,fn){fn();count++;console.log('PASS A03 RECONNECT '+name);}
try{
 const rooms=registry(),first=rooms.create(2),other=first.room.join(),room=first.room;
 const blue={sequence:1,kind:'order.stop',unitId:'blue_TOP',payload:{}};
 const red={sequence:1,kind:'order.stop',unitId:'red_TOP',payload:{}};
 const bAck=room.command(first.player,blue),rAck=room.command(other.player,red);
 assert.ok(bAck.ok,JSON.stringify(bAck));assert.ok(rAck.ok,JSON.stringify(rAck));
 check('01 duplicate ACK does not mutate state before seal',()=>{
  const hash=checksumV40(room.arena.snapshotV40());
  assert.deepEqual(room.command(first.player,blue),bAck);
  assert.equal(room.command(first.player,{...blue,kind:'order.recall'}).ok,false);
  assert.equal(checksumV40(room.arena.snapshotV40()),hash);
 });
 check('02 after blue ready, restart maintains lock without resolving',()=>{
  assert.ok(room.confirm(first.player).ok);
  assert.notEqual(room.arena.phase,'executing');
  const restored=registry().get(room.id);
  assert.ok(restored);
  assert.equal(restored.ready.has('p1'),true);
  assert.notEqual(restored.arena.phase,'executing');
  assert.equal(restored.command(restored.players[0],{sequence:2,kind:'order.stop',unitId:'blue_MID',payload:{}}).ok,false);
 });
 check('03 two tokens and five permissions survive restore',()=>{
  const restored=registry().get(room.id);
  assert.equal(restored.authenticate(first.token)?.seatId,'p1');
  assert.equal(restored.authenticate(other.token)?.seatId,'p2');
  assert.deepEqual(restored.gateway.seats.get('p1').unitIds,room.gateway.seats.get('p1').unitIds);
  assert.equal(checksumV40(restored.arena.snapshotV40()),checksumV40(room.arena.snapshotV40()));
  const snapshot=restored.checkpoint().arena;
  assert.equal(snapshot.schema,'coachlol.snapshot.v4');
  assert.ok(Number.isInteger(snapshot.rngState));
  for(const p of restored.players){const v=restored.view(p);
   assert.equal(Object.hasOwn(v,'rngState'),false);
   assert.equal(Object.hasOwn(v,'tokenHash'),false);
  }
 });
 check('04 duplicate on restored room works even after blue ready',()=>{
  const restored=registry().get(room.id);
  const owner=restored.authenticate(first.token);
  const hash=checksumV40(restored.arena.snapshotV40());
  assert.deepEqual(restored.command(owner,blue),bAck);
  assert.equal(restored.command(owner,{...blue,kind:'order.recall'}).ok,false);
  assert.equal(checksumV40(restored.arena.snapshotV40()),hash);
  assert.equal(restored.view(owner).nextSequence,2);
 });
 check('05 red second ready seals; old ACK survives executing phase',()=>{
  const restored=registry().get(room.id);
  const r=restored.authenticate(other.token),b=restored.authenticate(first.token);
  const ok=restored.confirm(r);assert.ok(ok.ok,JSON.stringify(ok));
  assert.equal(restored.arena.phase,'executing');
  assert.equal(restored.ready.size,0);
  const hash=checksumV40(restored.arena.snapshotV40());
  assert.deepEqual(restored.command(b,blue),bAck);
  assert.equal(restored.command(r,{sequence:2,kind:'order.stop',unitId:'blue_JG',payload:{}}).ok,false);
  assert.equal(checksumV40(restored.arena.snapshotV40()),hash);
 });
 console.log('LEGACY SOURCE ONLY: '+count+'/5 PASS (not Rust/2-browser certification)');
}finally{rmSync(dir,{recursive:true,force:true});}
