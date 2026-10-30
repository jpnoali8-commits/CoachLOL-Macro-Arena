/** M45 PLATFORM-A13 — original PvPRoom persist failure diagnostic.
 * Source-pinned to dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5.
 * Node (full checkout): node tests/m45_platform_a13_room_persist_faults.test.mjs
 * The injected persist() error simulates a failed durable operation, not actual
 * disk failure. A PASS documents unsafe legacy failure semantics.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
import {PvPRoomV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
const json=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const map=json('coachlol_map_v6.json'),mask=json('masks_128.json'),manifest=json('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=manifest.baseFeatures;map.riftBundlesV452d4=manifest.variants;
let seed=4700,passed=0;
function fixture(){
 const arena=new Arena(map,mask,{mode:'pvp',seed:seed++});
 const blue={seatId:'p1',team:'blue',role:'MID',unitId:'blue_MID',tokenHash:'mock-blue'},
       red={seatId:'p2',team:'red',role:'MID',unitId:'red_MID',tokenHash:'mock-red'};
 const room=new PvPRoomV453Dev47({id:'a13a1313',arena,maxSeats:2,restored:{players:[blue,red]},checkpointPath:null});
 return {room,blue,red};
}
function restore(checkpoint){
 const arena=Arena.fromSnapshotV40(map,mask,checkpoint.arena);
 return new PvPRoomV453Dev47({id:checkpoint.id,arena,maxSeats:2,restored:checkpoint,checkpointPath:null});
}
function failPersist(room){
 const saved=room.persist;
 room.persist=()=>{throw Error('A13_SIMULATED_DISK_FAILURE')};
 return ()=>{room.persist=saved};
}
const stop={sequence:1,kind:'order.stop',unitId:'blue_TOP',payload:{}};
function check(name,fn){fn();passed++;console.log('PASS A13 LEGACY_PERSIST '+name)}
check('01 failed action persistence mutates memory and revision without ACK',()=>{
 const {room,blue}=fixture(),baseline=room.checkpoint(),before=checksumV40(room.arena.snapshotV40());
 const undo=failPersist(room);
 assert.throws(()=>room.command(blue,stop),/A13_SIMULATED_DISK_FAILURE/);undo();
 assert.equal(room.revision,baseline.revision+1);
 assert.notEqual(checksumV40(room.arena.snapshotV40()),before);
 assert.equal(room.gateway.seats.get('p1').lastSequence,1);
 const reset=restore(baseline);
 assert.equal(reset.gateway.seats.get('p1').lastSequence,0);
 assert.equal(reset.revision,baseline.revision);
});
check('02 failed action persists no broadcast yet in-memory ACK is recoverable',()=>{
 const {room,blue,red}=fixture(),bl=[],rd=[];
 const off1=room.subscribe(blue,x=>bl.push(x)),off2=room.subscribe(red,x=>rd.push(x));
 const before=[bl.length,rd.length],undo=failPersist(room);
 assert.throws(()=>room.command(blue,stop),/A13_SIMULATED_DISK_FAILURE/);undo();
 assert.deepEqual([bl.length,rd.length],before);
 assert.equal(room.command(blue,stop).ok,true); // old receipt replay, no persist attempt
 assert.deepEqual([bl.length,rd.length],before);
 off1();off2();
});
check('03 failed first ready sets seat fence despite no checkpoint',()=>{
 const {room,blue}=fixture(),baseline=room.checkpoint(),undo=failPersist(room);
 assert.throws(()=>room.confirm(blue),/A13_SIMULATED_DISK_FAILURE/);undo();
 assert.equal(room.ready.has('p1'),true);assert.equal(room.revision,baseline.revision+1);
 assert.equal(room.confirm(blue).reason,'confirmacao_indisponivel');
 assert.equal(restore(baseline).ready.has('p1'),false);
});
check('04 failed second ready plays turn in memory but restored image is still planning',()=>{
 const {room,blue,red}=fixture();
 assert.equal(room.confirm(blue).ok,true);
 const before=room.checkpoint(),undo=failPersist(room);
 assert.throws(()=>room.confirm(red),/A13_SIMULATED_DISK_FAILURE/);undo();
 assert.equal(room.arena.phase,'executing');assert.equal(room.ready.size,0);
 const reset=restore(before);
 assert.equal(reset.arena.phase,'preparation');
 assert.equal(reset.ready.has('p1'),true);
 assert.equal(reset.ready.has('p2'),false);
});
check('05 failed tick persistence advances in memory but not restart state',()=>{
 const {room,blue,red}=fixture();room.confirm(blue);room.confirm(red);
 const saved=room.checkpoint(),time=room.arena.gameTime,undo=failPersist(room);
 assert.throws(()=>room.advance(5),/A13_SIMULATED_DISK_FAILURE/);undo();
 assert.ok(room.arena.gameTime>time);
 assert.equal(restore(saved).arena.gameTime,time);
});
check('06 successful command persists via room-provided hook before broadcast',()=>{
 const {room,blue}=fixture();
 const views=[],off=room.subscribe(blue,v=>views.push(v));
 let saved=null;
 room.persist=()=>{saved=room.checkpoint()};
 const before=views.length,ack=room.command(blue,stop);
 assert.equal(ack.ok,true);assert.ok(saved);
 assert.equal(saved.revision,room.revision);
 assert.equal(saved.gateway.seats.find(s=>s.seatId==='p1').lastSequence,1);
 assert.equal(views.length,before+1);
 off();
});
console.log('M45 A13 '+passed+'/6 LEGACY_ORIGINAL_ROOM_PERSIST_FAULTS; DISK_IO_NOT_RUN');
