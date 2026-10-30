/** M45 PLATFORM-A07 — real Arena + gateway + room SSE callback oracle.
 * In checkout: node tests/m45_platform_a07_room_stream_golden.test.mjs
 * Pinned source dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5
 * OBSERVED LEGACY privacy flaw is asserted as diagnostic, NOT security certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
import {PvPRoomV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=manifest.baseFeatures;map.riftBundlesV452d4=manifest.variants;
const arena=new Arena(map,mask,{mode:'pvp',seed:1507});
const blue={seatId:'p1',team:'blue',unitId:'blue_MID',role:'MID',tokenHash:'mockBlue'},
red={seatId:'p2',team:'red',unitId:'red_MID',role:'MID',tokenHash:'mockRed'};
const room=new PvPRoomV453Dev47({id:'a07a0722',arena,restored:{players:[blue,red]},checkpointPath:null});
const frames={blue:[],red:[]},offBlue=room.subscribe(blue,v=>frames.blue.push(v)),
offRed=room.subscribe(red,v=>frames.red.push(v));
let passed=0;function check(name,fn){fn();passed++;console.log('PASS A07_ROOM '+name);}
check('01 initial push to each authenticated seat',()=>{
 assert.equal(frames.blue.length,1);assert.equal(frames.red.length,1);
 assert.equal(frames.blue[0].team,'blue');assert.equal(frames.red[0].team,'red');
});
check('02 each controls five units',()=>{
 assert.equal(frames.blue[0].projection.controlledUnitIds.length,5);
 assert.equal(frames.red[0].projection.controlledUnitIds.length,5);
});
check('03 no RNG and token hash in initial network projection',()=>{
 for(const team of ['blue','red']){
  const v=JSON.stringify(frames[team][0]);
  assert.equal(v.includes('tokenHash'),false);assert.equal(v.includes('rngState'),false);
 }
});
check('04 accepted action broadcasts to both subscribers',()=>{
 const b=frames.blue.length,r=frames.red.length;
 const cmd=room.command(blue,{sequence:1,kind:'order.stop',unitId:'blue_TOP',payload:{}});
 assert.equal(cmd.ok,true);
 assert.equal(frames.blue.length,b+1);assert.equal(frames.red.length,r+1);
});
check('05 one ready broadcasts state but does not execute',()=>{
 const result=room.confirm(blue);assert.equal(result.ok,true);
 assert.equal(room.ready.has('p1'),true);assert.equal(arena.phase,'preparation');
 assert.equal(frames.blue.at(-1).ready.includes('p1'),true);
 assert.equal(frames.red.at(-1).ready.includes('p1'),true);
});
const originalVisible=arena.visible;
try{
 arena.visible=(who,u)=>who===u.team;
 arena.event('RED_PRIVATE_SHOP','red','purchase','red_TOP');
 arena.event('UNOWNED_A07_PRIVATE_CANARY');
 room.broadcast();
 check('06 owned red private message excluded from blue callback',()=>{
  assert.equal(frames.blue.at(-1).projection.events.some(e=>e.text==='RED_PRIVATE_SHOP'),false);
 });
 check('07 anonymous nonpublic message leaks to both in legacy',()=>{
  for(const team of ['blue','red'])
   assert.equal(frames[team].at(-1).projection.events.some(e=>e.text==='UNOWNED_A07_PRIVATE_CANARY'),true);
 });
 check('08 hidden enemies still excluded in same callback',()=>{
  assert.equal(frames.blue.at(-1).projection.units.some(u=>u.team==='red'),false);
  assert.equal(frames.red.at(-1).projection.units.some(u=>u.team==='blue'),false);
 });
}finally{arena.visible=originalVisible;}
const oldLast=frames.blue.at(-1);
offBlue();
room.broadcast();
check('09 disconnect stops old callback',()=>{
 assert.equal(frames.blue.at(-1),oldLast);
});
const n=frames.blue.length,offBlue2=room.subscribe(blue,v=>frames.blue.push(v));
check('10 reconnect sends latest sanitized state, not event log journal',()=>{
 assert.equal(frames.blue.length,n+1);
 assert.equal(frames.blue.at(-1).revision,room.revision);
});
check('11 duplicate ready is rejected (legacy known issue)',()=>{
 assert.deepEqual(room.confirm(blue),{ok:false,reason:'confirmacao_indisponivel'});
});
check('12 second ready resolves phase',()=>{
 const ok=room.confirm(red);assert.equal(ok.ok,true);
 assert.equal(arena.phase,'executing');
});
const checkpoint=room.checkpoint();
const recoveredArena=Arena.fromSnapshotV40(map,mask,checkpoint.arena);
const recovered=new PvPRoomV453Dev47({id:room.id,arena:recoveredArena,restored:checkpoint,checkpointPath:null});
const restarted=[];const offRestarted=recovered.subscribe(blue,v=>restarted.push(v));
check('13 restore then reconnect preserves seat-owned projection',()=>{
 assert.equal(restarted.length,1);assert.equal(restarted[0].team,'blue');
 assert.equal(restarted[0].projection.controlledUnitIds.length,5);
 assert.equal(restarted[0].revision,recovered.revision);
});
offRestarted();offBlue2();offRed();
console.log('A07 REAL ARENA+GATEWAY+ROOM SSE CALLBACK '+passed+'/13 LEGACY_DIAGNOSTIC; HTTP/RUST NOT_RUN');
