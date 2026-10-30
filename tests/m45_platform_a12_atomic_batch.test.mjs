/** M45 PLATFORM-A12: QA-only atomic multi-champion transaction oracle.
 * node tests/m45_platform_a12_atomic_batch.test.mjs (full legacy checkout)
 * Source pinned dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5.
 * Original applyCommands() has NONATOMIC global side effects; this oracle stages.
 * In-memory only, NOT production Rust, HTTP, database or crash-durable guarantee.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
import {interpretCommands,applyCommands} from '../commands.mjs';
import {PvPRoomV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
import {AtomicTextBatchReference} from './m45_platform_a12_atomic_text_batch_reference.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),man=read('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=man.baseFeatures;map.riftBundlesV452d4=man.variants;
let id=0,count=0;
function make({beforeApply=null}={}){
 const arena=new Arena(map,mask,{mode:'pvp',seed:8610+id++});
 const blue={seatId:'p1',team:'blue',role:'MID',unitId:'blue_MID',tokenHash:'blue-test'},
 red={seatId:'p2',team:'red',role:'MID',unitId:'red_MID',tokenHash:'red-test'};
 const room=new PvPRoomV453Dev47({id:'a12a1212',arena,restored:{players:[blue,red]},checkpointPath:null});
 const bridge=new AtomicTextBatchReference({Arena,interpretCommands,applyCommands,map,mask,beforeApply});
 return {room,blue,red,bridge};
}
const hash=room=>checksumV40(room.arena.snapshotV40());
function check(title,fn){fn();count++;console.log('PASS A12 ATOMIC '+title);}
check('01 preview two champions is pure and reports four or more actions',()=>{
 const t=make(),before=hash(t.room);
 const d=t.bridge.preview(t.room,t.blue,'ADC recall; MID farmar safe');
 assert.equal(d.ok,true);assert.deepEqual(d.roles,['ADC','MID']);assert.ok(d.actionCount>2);
 assert.equal(hash(t.room),before);assert.equal(t.room.revision,0);
});
check('02 successful blue batch commits both champions in one revision',()=>{
 const t=make(),d=t.bridge.preview(t.room,t.blue,'ADC recall; MID farmar safe');
 const r=t.bridge.commit(t.room,t.blue,d.draftId);
 assert.equal(r.ok,true);assert.equal(r.revision,1);assert.equal(t.room.revision,1);
 assert.equal(t.room.arena.units.find(x=>x.id==='blue_ADC').order.kind,'recall');
 assert.equal(t.room.arena.units.find(x=>x.id==='blue_MID').policy,'safe');
});
check('03 red can atomically commit own freeze/kite distinct from blue',()=>{
 const t=make(),blueHash=checksumV40(t.room.arena.units.filter(u=>u.team==='blue'));
 const d=t.bridge.preview(t.room,t.red,'TOP freezar wave; ADC kite com AA');
 assert.equal(d.ok,true);
 assert.equal(t.bridge.commit(t.room,t.red,d.draftId).ok,true);
 assert.equal(t.room.arena.units.find(x=>x.id==='red_TOP').tactics.wave,'freeze');
 assert.equal(t.room.arena.units.find(x=>x.id==='red_ADC').combatStyle,'kite');
 assert.equal(checksumV40(t.room.arena.units.filter(u=>u.team==='blue')),blueHash);
});
check('04 exactly one network broadcast per multi-action batch',()=>{
 const t=make(),bl=[],rd=[];
 const off1=t.room.subscribe(t.blue,x=>bl.push(x)),off2=t.room.subscribe(t.red,x=>rd.push(x));
 const before=[bl.length,rd.length],d=t.bridge.preview(t.room,t.blue,'ADC recall; MID farmar safe');
 assert.equal(t.bridge.commit(t.room,t.blue,d.draftId).ok,true);
 assert.deepEqual([bl.length,rd.length],[before[0]+1,before[1]+1]);
 off1();off2();
});
check('05 no blue text plan event exposed to red after successful batch',()=>{
 const t=make(),rd=[],off=t.room.subscribe(t.red,x=>rd.push(x));
 const d=t.bridge.preview(t.room,t.blue,'ADC recall; MID farmar safe');
 assert.equal(t.bridge.commit(t.room,t.blue,d.draftId).ok,true);
 const projection=rd.at(-1).projection;
 assert.equal(projection.events.some(e=>e.kind==='text_plan'&&e.team==='blue'),false);
 off();
});
check('06 failed second MID policy leaves complete world byte-identical',()=>{
 const t=make({beforeApply:a=>{a.setPolicy=()=>false}}),d=t.bridge.preview(t.room,t.blue,'ADC recall; MID farmar safe'),before=hash(t.room);
 const r=t.bridge.commit(t.room,t.blue,d.draftId);
 assert.equal(r.reason,'batch_abortado');assert.equal(hash(t.room),before);
 assert.equal(t.room.revision,0);
 assert.equal(t.room.arena.orderHistory.length,0);
});
check('07 failed Smite then MID policy has zero ghost event',()=>{
 const t=make({beforeApply:a=>{a.setPolicy=()=>false}}),d=t.bridge.preview(t.room,t.blue,'JG guardar smite; MID farmar safe'),before=hash(t.room),events=t.room.arena.events.length;
 const r=t.bridge.commit(t.room,t.blue,d.draftId);
 assert.equal(r.reason,'batch_abortado');assert.equal(hash(t.room),before);
 assert.equal(t.room.arena.events.length,events);
});
check('08 failed shop purchase then MID policy has zero ghost purchase',()=>{
 const t=make({beforeApply:a=>{a.setPolicy=()=>false}}),d=t.bridge.preview(t.room,t.blue,'ADC comprar espada longa; MID farmar safe'),before=hash(t.room),events=t.room.arena.events.length;
 const r=t.bridge.commit(t.room,t.blue,d.draftId);
 assert.equal(r.reason,'batch_abortado');assert.equal(hash(t.room),before);
 assert.equal(t.room.arena.events.length,events);
});
check('09 failed batch cannot broadcast speculative event or mutate either team',()=>{
 const t=make({beforeApply:a=>{a.setPolicy=()=>false}}),b=[],r=[],off1=t.room.subscribe(t.blue,x=>b.push(x)),off2=t.room.subscribe(t.red,x=>r.push(x));
 const original=[b.length,r.length],draft=t.bridge.preview(t.room,t.blue,'JG guardar smite; MID farmar safe');
 assert.equal(t.bridge.commit(t.room,t.blue,draft.draftId).ok,false);
 assert.deepEqual([b.length,r.length],original);off1();off2();
});
check('10 after own ready preview is rejected',()=>{
 const t=make();assert.equal(t.room.confirm(t.blue).ok,true);
 assert.equal(t.bridge.preview(t.room,t.blue,'ADC recall').reason,'turno_bloqueado');
});
check('11 ready after preview prevents commit',()=>{
 const t=make(),d=t.bridge.preview(t.room,t.blue,'ADC recall');
 assert.equal(t.room.confirm(t.blue).ok,true);
 assert.equal(t.bridge.commit(t.room,t.blue,d.draftId).reason,'turno_bloqueado');
});
check('12 a foreign seat cannot use the other player draft',()=>{
 const t=make(),d=t.bridge.preview(t.room,t.blue,'ADC recall');
 assert.equal(t.bridge.commit(t.room,t.red,d.draftId).reason,'rascunho_nao_autorizado');
});
check('13 forged seat/team context rejected',()=>{
 const t=make();
 assert.equal(t.bridge.preview(t.room,{seatId:'p1',team:'red',unitId:'red_MID'},'ADC recall').reason,'assento_nao_autenticado');
});
check('14 stale revision from other seat command cancels batch',()=>{
 const t=make(),d=t.bridge.preview(t.room,t.blue,'ADC recall; MID farmar safe');
 assert.equal(t.room.command(t.red,{sequence:1,kind:'order.stop',unitId:'red_TOP',payload:{}}).ok,true);
 assert.equal(t.bridge.commit(t.room,t.blue,d.draftId).reason,'rascunho_desatualizado');
});
check('15 successful duplicate commit replays stored in-memory receipt only',()=>{
 const t=make(),d=t.bridge.preview(t.room,t.blue,'ADC recall; MID farmar safe');
 const first=t.bridge.commit(t.room,t.blue,d.draftId),snapshot=hash(t.room),revision=t.room.revision;
 assert.deepEqual(t.bridge.commit(t.room,t.blue,d.draftId),first);
 assert.equal(hash(t.room),snapshot);assert.equal(t.room.revision,revision);
});
check('16 pending second draft from same original revision cannot overwrite first',()=>{
 const t=make(),a=t.bridge.preview(t.room,t.blue,'ADC recall'),b=t.bridge.preview(t.room,t.blue,'MID farmar safe');
 assert.equal(t.bridge.commit(t.room,t.blue,a.draftId).ok,true);
 assert.equal(t.bridge.commit(t.room,t.blue,b.draftId).reason,'rascunho_desatualizado');
});
check('17 authenticated action receipts remain valid after staged swap',()=>{
 const t=make(),ack=t.room.command(t.blue,{sequence:1,kind:'order.stop',unitId:'blue_JG',payload:{}}),draft=t.bridge.preview(t.room,t.blue,'ADC recall; MID farmar safe');
 assert.equal(ack.ok,true);assert.equal(t.bridge.commit(t.room,t.blue,draft.draftId).ok,true);
 assert.deepEqual(t.room.command(t.blue,{sequence:1,kind:'order.stop',unitId:'blue_JG',payload:{}}),ack);
});
check('18 after successful batch server checkpoint can restore typed intent state',()=>{
 const t=make(),d=t.bridge.preview(t.room,t.blue,'JG guardar smite; MID farmar safe');
 assert.equal(t.bridge.commit(t.room,t.blue,d.draftId).ok,true);
 const state=t.room.checkpoint(),arena=Arena.fromSnapshotV40(map,mask,state.arena);
 const again=new PvPRoomV453Dev47({id:t.room.id,arena,restored:state,checkpointPath:null});
 assert.equal(again.arena.units.find(x=>x.id==='blue_MID').policy,'safe');
 assert.equal(again.arena.units.find(x=>x.id==='blue_JG').smitePolicy.mode,'hold');
});
check('19 no silently accepted unknown text command',()=>{
 const t=make();const d=t.bridge.preview(t.room,t.blue,'unknownfoobar nonsense');
 assert.equal(d.reason,'plano_invalido');assert.equal(t.room.revision,0);
});
check('20 untrusted client never directly selects opponent team',()=>{
 const t=make(),d=t.bridge.preview(t.room,t.blue,'ADC recall');
 assert.equal(d.ok,true);assert.equal(t.bridge.commit(t.room,t.red,d.draftId).ok,false);
 assert.equal(t.room.arena.units.find(x=>x.id==='red_ADC').order.kind,'auto');
});
console.log('M45 A12 '+count+'/20 STAGED_BATCH_REFERENCE_V8; PRODUCTION_RUST_NOT_CERTIFIED');
