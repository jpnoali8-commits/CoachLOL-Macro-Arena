/**
 * M45 A06 full engine + room + gateway oracle, source 374d87d5f49b52514ec68bbe666df086363c1ec5.
 * Run: node tests/m45_platform_a06_full_arena_pvp_golden.test.mjs
 * This is not HTTP/SSE, browser, Rust, WASM or production security certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
import {PvPRoomV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=manifest.baseFeatures;map.riftBundlesV452d4=manifest.variants;
const arena=new Arena(map,mask,{mode:'pvp',seed:2002});
const blue={seatId:'p1',team:'blue',role:'MID',unitId:'blue_MID',tokenHash:'fixture-blue'},
red={seatId:'p2',team:'red',role:'MID',unitId:'red_MID',tokenHash:'fixture-red'};
const room=new PvPRoomV453Dev47({id:'a06a0611',arena,maxSeats:2,restored:{players:[blue,red]},checkpointPath:null});
let n=0;function check(s,fn){fn();n++;console.log('PASS A06 '+s)}
check('01 two humans control five champions per team',()=>{
 assert.equal(room.started,true);assert.equal(arena.units.length,10);
 assert.deepEqual(room.gateway.seats.get('p1').unitIds,['blue_MID','blue_TOP','blue_JG','blue_ADC','blue_SUP']);
 assert.deepEqual(room.gateway.seats.get('p2').unitIds,['red_MID','red_TOP','red_JG','red_ADC','red_SUP']);
});
check('02 both team fog views omit enemy hidden units',()=>{
 const old=arena.visible;try{arena.visible=(who,u)=>who===u.team;
 const a=room.view(blue),b=room.view(red);
 assert.equal(a.projection.units.some(x=>x.team==='red'),false);
 assert.equal(b.projection.units.some(x=>x.team==='blue'),false);
 assert.equal(a.projection.controlledUnitIds.length,5);
 assert.equal(b.projection.controlledUnitIds.length,5);
 assert.equal(Object.hasOwn(a,'rngState'),false);
 }finally{arena.visible=old}
});
const orders=[];
for(const [p,t] of [[blue,'blue'],[red,'red']])for(const [i,role] of ['MID','TOP','JG','ADC','SUP'].entries())
 orders.push({p,message:{sequence:i+1,kind:'order.stop',unitId:t+'_'+role,payload:{}}});
const receipts=new Map();
check('03 ten authoritative commands across both seats',()=>{
 for(const {p,message} of orders){const ack=room.command(p,message);assert.equal(ack.ok,true,JSON.stringify({message,ack}));
 receipts.set(p.seatId+':'+message.sequence,ack)}
 assert.equal(room.gateway.seats.get('p1').lastSequence,5);
 assert.equal(room.gateway.seats.get('p2').lastSequence,5);
});
check('04 unauthorized enemy and sequence gaps rejected',()=>{
 const hash=checksumV40(arena.snapshotV40());
 assert.equal(room.command(blue,{sequence:6,kind:'order.stop',unitId:'red_TOP',payload:{}}).reason,'unidade_nao_autorizada');
 assert.equal(room.command(blue,{sequence:7,kind:'order.stop',unitId:'blue_TOP',payload:{}}).reason,'sequencia_fora_de_ordem');
 assert.equal(checksumV40(arena.snapshotV40()),hash);
});
check('05 retry all ten ACKs no double mutation',()=>{
 const hash=checksumV40(arena.snapshotV40());
 for(const {p,message} of orders)assert.deepEqual(room.command(p,message),receipts.get(p.seatId+':'+message.sequence));
 assert.equal(room.command(blue,{sequence:1,kind:'order.recall',unitId:'blue_MID',payload:{}}).reason,'sequencia_reutilizada_com_dados_diferentes');
 assert.equal(checksumV40(arena.snapshotV40()),hash);
});
check('06 first ready does not execute',()=>{
 assert.equal(room.confirm(blue).ok,true);assert.equal(arena.phase,'preparation');
 assert.equal(room.ready.has('p1'),true);assert.equal(room.ready.has('p2'),false);
 assert.equal(room.confirm(blue).reason,'confirmacao_indisponivel');
});
check('07 checkpoint restore keeps one ready and receipts',()=>{
 const c=room.checkpoint(),a=Arena.fromSnapshotV40(map,mask,c.arena);
 const restored=new PvPRoomV453Dev47({id:room.id,arena:a,maxSeats:2,restored:c,checkpointPath:null});
 assert.equal(restored.ready.has('p1'),true);assert.equal(restored.ready.has('p2'),false);
 assert.equal(a.phase,'preparation');assert.equal(restored.gateway.seats.get('p1').lastSequence,5);
 assert.deepEqual(restored.command(blue,orders[0].message),receipts.get('p1:1'));
});
let sealed;
check('08 second ready triggers real engine, durable original ACKs',()=>{
 const second=room.confirm(red);assert.equal(second.ok,true,JSON.stringify(second));
 assert.equal(arena.phase,'executing');assert.equal(room.ready.size,0);
 assert.deepEqual(room.command(blue,orders[0].message),receipts.get('p1:1'));
 sealed=room.checkpoint();
});
check('09 executing restore preserves receipts and private RNG',()=>{
 const a=Arena.fromSnapshotV40(map,mask,sealed.arena);
 const restored=new PvPRoomV453Dev47({id:room.id,arena:a,maxSeats:2,restored:sealed,checkpointPath:null});
 assert.equal(a.phase,'executing');
 assert.deepEqual(restored.command(red,orders[5].message),receipts.get('p2:1'));
 assert.equal(restored.view(blue).projection.controlledUnitIds.length,5);
 assert.equal(Object.hasOwn(restored.view(blue),'rngState'),false);
 assert.ok(Number.isInteger(restored.checkpoint().arena.rngState));
});
check('10 server-driven tick, sealed commands remain rejected',()=>{
 const now=arena.gameTime,r=room.advance(1);
 assert.equal(r.ok,true,JSON.stringify(r));assert.ok(arena.gameTime>=now);
 assert.equal(room.command(blue,{sequence:6,kind:'order.stop',unitId:'blue_ADC',payload:{}}).ok,false);
});
console.log('A06 REAL ARENA + GATEWAY + ROOM '+n+'/10 PASS, HTTP/SSE RUST WASM NOT_RUN');
