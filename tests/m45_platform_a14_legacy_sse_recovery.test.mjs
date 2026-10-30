/**
 * CoachLOL M45 PLATFORM-A14 legacy source-pinned SSE recovery diagnostics.
 * Full checkout: node tests/m45_platform_a14_legacy_sse_recovery.test.mjs
 * A PASS documents the behavior (including known security defects), not Rust
 * security certification. No HTTP/socket or browser is executed in this test.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
import {PvPRoomV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),manifest=load('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=manifest.baseFeatures;map.riftBundlesV452d4=manifest.variants;
let seed=88140,passed=0;
function fixture(){
 const arena=new Arena(map,mask,{mode:'pvp',seed:seed++});
 const blue={seatId:'p1',team:'blue',unitId:'blue_MID',role:'MID',tokenHash:'test-blue'};
 const red={seatId:'p2',team:'red',unitId:'red_MID',role:'MID',tokenHash:'test-red'};
 const room=new PvPRoomV453Dev47({id:'a14a1414',arena,restored:{players:[blue,red]},checkpointPath:null});
 return {room,arena,blue,red};
}
const cmd=(room,p,seq=1,unitId='blue_TOP')=>room.command(p,{sequence:seq,kind:'order.stop',unitId,payload:{}});
const check=(label,fn)=>{fn();passed++;console.log('PASS A14 LEGACY '+label);};
check('01 each subscription immediately sends a distinct team perspective',()=>{
 const {room,blue,red}=fixture(),b=[],r=[];
 const ob=room.subscribe(blue,x=>b.push(x)),or=room.subscribe(red,x=>r.push(x));
 assert.equal(b.length,1);assert.equal(r.length,1);
 assert.equal(b[0].team,'blue');assert.equal(r[0].team,'red');
 assert.equal(b[0].projection.controlledUnitIds.length,5);
 assert.equal(r[0].projection.controlledUnitIds.length,5);
 ob();or();
});
check('02 accepted blue command broadcasts one state to each seat',()=>{
 const {room,blue,red}=fixture(),b=[],r=[];
 const ob=room.subscribe(blue,x=>b.push(x)),or=room.subscribe(red,x=>r.push(x));
 assert.equal(cmd(room,blue).ok,true);
 assert.equal(b.length,2);assert.equal(r.length,2);
 assert.equal(b[1].revision,r[1].revision);
 assert.equal(b[1].nextSequence,2);assert.equal(r[1].nextSequence,1);
 ob();or();
});
check('03 repeated unchanged broadcast generates duplicate revision frames',()=>{
 const {room,blue}=fixture(),events=[],off=room.subscribe(blue,x=>events.push(x));
 const before=events.at(-1).revision;room.broadcast();room.broadcast();
 assert.equal(events.length,3);
 assert.deepEqual(events.map(x=>x.revision),[before,before,before]);
 off();
});
check('04 reconnect sends current snapshot, not lost intermediate messages',()=>{
 const {room,blue}=fixture(),old=[],off=room.subscribe(blue,x=>old.push(x));
 off();
 assert.equal(cmd(room,blue).ok,true);
 const reconnected=[],disconnect=room.subscribe(blue,x=>reconnected.push(x));
 assert.equal(reconnected.length,1);
 assert.equal(reconnected[0].revision,room.revision);
 assert.equal(reconnected[0].nextSequence,2);
 disconnect();
});
check('05 command duplicate after reconnect recovers same ACK without broadcast',()=>{
 const {room,blue}=fixture(),frames=[],off=room.subscribe(blue,x=>frames.push(x));
 const packet={sequence:1,kind:'order.stop',unitId:'blue_TOP',payload:{}};
 const ack=room.command(blue,packet),length=frames.length,before=checksumV40(room.arena.snapshotV40());
 assert.deepEqual(room.command(blue,packet),ack);
 assert.equal(frames.length,length);
 assert.equal(checksumV40(room.arena.snapshotV40()),before);off();
});
check('06 persisted room snapshot recovers receipt and matching per-seat revision',()=>{
 const {room,arena,blue}=fixture();
 const packet={sequence:1,kind:'order.stop',unitId:'blue_TOP',payload:{}},ack=room.command(blue,packet);
 const stored=room.checkpoint(),restoredArena=Arena.fromSnapshotV40(map,mask,stored.arena);
 const resumed=new PvPRoomV453Dev47({id:room.id,arena:restoredArena,restored:stored,checkpointPath:null});
 const b=[],off=resumed.subscribe(blue,v=>b.push(v));
 assert.equal(b[0].revision,stored.revision);
 assert.equal(b[0].nextSequence,2);
 assert.deepEqual(resumed.command(blue,packet),ack);
 assert.equal(b.length,1);off();
});
check('07 red private event is excluded from hidden blue perspective',()=>{
 const {room,arena,blue,red}=fixture(),prev=arena.visible;
 try{
  arena.visible=(team,u)=>team===u.team;
  arena.event('A14_RED_SECRET','red','purchase','red_TOP');
  const b=room.view(blue),r=room.view(red);
  assert.equal(b.projection.events.some(e=>e.text==='A14_RED_SECRET'),false);
  assert.equal(r.projection.events.some(e=>e.text==='A14_RED_SECRET'),true);
 }finally{arena.visible=prev;}
});
check('08 unclassified private event leaks to both teams in original legacy',()=>{
 const {room,arena,blue,red}=fixture(),prev=arena.visible;
 try{
  arena.visible=(team,u)=>team===u.team;
  arena.event('A14_PRIVATE_CANARY');
  assert.equal(room.view(blue).projection.events.some(e=>e.text==='A14_PRIVATE_CANARY'),true);
  assert.equal(room.view(red).projection.events.some(e=>e.text==='A14_PRIVATE_CANARY'),true);
 }finally{arena.visible=prev;}
});
check('09 fog hides enemy unit even when unclassified event is leaked',()=>{
 const {room,arena,blue,red}=fixture(),prev=arena.visible;
 try{
  arena.visible=(team,u)=>team===u.team;
  arena.event('A14_PRIVATE_CANARY');
  for(const [p,opponent] of [[blue,'red'],[red,'blue']])
   assert.equal(room.view(p).projection.units.some(u=>u.team===opponent),false);
 }finally{arena.visible=prev;}
});
check('10 view never sends checkpoint private fields or other seat token hash',()=>{
 const {room,blue,red}=fixture();
 for(const p of [blue,red]){
  const v=room.view(p),json=JSON.stringify(v);
  for(const key of ['tokenHash','rngState','privateSeed','gatewayCheckpoint'])assert.equal(json.includes(key),false);
 }
});
check('11 ready state and receipt survive reconnect from restored checkpoint',()=>{
 const {room,arena,blue,red}=fixture(),packet={sequence:1,kind:'order.stop',unitId:'blue_TOP',payload:{}};
 const ack=room.command(blue,packet);
 assert.equal(room.confirm(blue).ok,true);
 const checkpoint=room.checkpoint(),loaded=Arena.fromSnapshotV40(map,mask,checkpoint.arena);
 const restored=new PvPRoomV453Dev47({id:room.id,arena:loaded,restored:checkpoint});
 const snapshots=[],off=restored.subscribe(blue,x=>snapshots.push(x));
 assert.deepEqual(snapshots[0].ready,['p1']);
 assert.deepEqual(restored.command(blue,packet),ack);
 assert.equal(restored.confirm(blue).reason,'confirmacao_indisponivel');
 off();
});
check('12 subscriber unsubscribe prevents stale callback delivery',()=>{
 const {room,blue}=fixture(),frames=[],off=room.subscribe(blue,x=>frames.push(x));
 off();room.broadcast();assert.equal(frames.length,1);
});
check('13 throwing subscriber removed without preventing other seat broadcast',()=>{
 const {room,blue,red}=fixture(),r=[];let calls=0;
 const drop=room.subscribe(blue,()=>{if(++calls>1)throw Error('mock closed connection')});
 const off=room.subscribe(red,x=>r.push(x));
 assert.equal(r.length,1);room.broadcast();assert.equal(r.length,2);
 room.broadcast();assert.equal(r.length,3);assert.equal(calls,2);
 drop();off();
});
check('14 source has no SSE cursor, replay journal or Last-Event-ID negotiation',()=>{
 const roomSource=readFileSync(new URL('../multiplayer/room_v453_dev47.mjs',import.meta.url),'utf8');
 const serverSource=readFileSync(new URL('../multiplayer/server_v453_dev47.mjs',import.meta.url),'utf8');
 assert.equal(/Last-Event-ID|lastEventId|event:\s*state\\nid:/.test(serverSource),false);
 assert.equal(/lastEventId|eventCursor|replayJournal/.test(roomSource),false);
 assert.equal(serverSource.includes("event: state\\ndata: "),true);
});
console.log('M45 A14 '+passed+'/14 LEGACY_SSE_RECOVERY_V8; HTTP/RUST NOT_RUN');
