/**
 * M45 PLATFORM-A08: exact client send/render/connect functions against real legacy Room.
 * A PASS reproduces legacy command/snapshot bugs, NOT a security or Rust G4 PASS.
 * Source integration 374d87d5f49b52514ec68bbe666df086363c1ec5.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Arena} from '../engine.mjs';
import {PvPRoomV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
const client=readFileSync(new URL('../multiplayer/pvp_client_v453_dev47.js',import.meta.url),'utf8');
const sha=createHash('sha1').update('blob '+Buffer.byteLength(client)+String.fromCharCode(0)).update(client).digest('hex');
assert.equal(sha,'43f42ef9e9022db8aa3cb96a299e8ed69d8522f3','Client source drift');
const s=client.indexOf('async function send('),e=client.indexOf('async function sendGroup(',s);
assert.ok(s>=0&&e>s,'send() changed');
const sendSource=client.slice(s,e);
const sequenceLine=client.match(/function render\(v\)\{state=v;(sequence=Math\.max\(sequence,v\.nextSequence\|\|1\);)/)?.[1];
assert.equal(sequenceLine,'sequence=Math.max(sequence,v.nextSequence||1);');
const c=client.indexOf('function connect(){'),d=client.indexOf('function draw(){',c);
assert.ok(c>=0&&d>c,'connect() changed');
const connectSource=client.slice(c,d);
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),manifest=load('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=manifest.baseFeatures;map.riftBundlesV452d4=manifest.variants;
let counter=0;
function createRoom(){
 const arena=new Arena(map,mask,{mode:'pvp',seed:3091+(counter++)});
 const blue={seatId:'p1',team:'blue',role:'MID',unitId:'blue_MID',tokenHash:'mock-blue'};
 const red={seatId:'p2',team:'red',role:'MID',unitId:'red_MID',tokenHash:'mock-red'};
 const room=new PvPRoomV453Dev47({id:'a08'+String(counter).padStart(5,'0'),arena,restored:{players:[blue,red]},checkpointPath:null});
 return {room,blue,red};
}
function clientFor(first,{pushSseBeforeAck=false,dropFirstAck=false}={}){
 let active=first,ui,accepted=0;const attempts=[],messages=[];
 const api=async(route,packet)=>{
  assert.equal(route,'action');
  const receipt=active.room.command(active.blue,packet);
  attempts.push({packet:{...packet},receipt:{...receipt}});
  if(receipt.ok){
   accepted++;
   if(pushSseBeforeAck)ui.render(active.room.view(active.blue));
   if(dropFirstAck&&accepted===1)throw Error('lost_after_commit');
  }
  if(!receipt.ok)throw Error(receipt.reason);
  return receipt;
 };
 ui=Function('api','announce',`let sequence=1,networkLock=Promise.resolve(),state={started:true},selectedUnitId='blue_TOP';
 const render=v=>{state=v;${sequenceLine}};${sendSource}
 return {send,render,next:()=>sequence};`)(api,t=>messages.push(t));
 return {ui,attempts,messages,switchRoom(next){active=next;ui.render(active.room.view(active.blue));}};
}
let n=0;
async function check(label,fn){await fn();n++;console.log('PASS A08 '+label);}
await check('01 normal two-command sequence 1,2',async()=>{
 const m=createRoom(),b=clientFor(m);
 assert.equal((await b.ui.send('order.stop',{},'blue_TOP')).ok,true);
 assert.equal((await b.ui.send('order.stop',{},'blue_JG')).ok,true);
 assert.deepEqual(b.attempts.map(x=>x.packet.sequence),[1,2]);
});
await check('02 serialized parallel UI commands',async()=>{
 const m=createRoom(),b=clientFor(m);
 const [x,y]=await Promise.all([b.ui.send('order.stop',{},'blue_TOP'),b.ui.send('order.stop',{},'blue_ADC')]);
 assert.equal(x.ok,true);assert.equal(y.ok,true);
 assert.deepEqual(b.attempts.map(x=>x.packet.sequence),[1,2]);
});
await check('03 early SSE before ACK makes sequence gap',async()=>{
 const m=createRoom(),b=clientFor(m,{pushSseBeforeAck:true});
 assert.equal((await b.ui.send('order.stop',{},'blue_TOP')).ok,true);
 assert.equal(b.ui.next(),3);
 const next=await b.ui.send('order.stop',{},'blue_MID');
 assert.deepEqual(next,{ok:false,reason:'sequencia_fora_de_ordem'});
 assert.deepEqual(b.attempts.map(x=>x.packet.sequence),[1,3]);
 assert.equal(m.room.gateway.seats.get('p1').lastSequence,1);
});
await check('04 lost ACK then changed packet conflicts with cached receipt',async()=>{
 const m=createRoom(),b=clientFor(m,{dropFirstAck:true});
 assert.equal((await b.ui.send('order.stop',{},'blue_TOP')).ok,false);
 assert.equal(b.ui.next(),1);
 assert.deepEqual(await b.ui.send('order.recall',{},'blue_TOP'),{ok:false,reason:'sequencia_reutilizada_com_dados_diferentes'});
 assert.equal(m.room.gateway.seats.get('p1').lastSequence,1);
});
await check('05 manual exact packet resend recovers the original ACK',async()=>{
 const m=createRoom(),b=clientFor(m,{dropFirstAck:true});
 assert.equal((await b.ui.send('order.stop',{},'blue_TOP')).ok,false);
 assert.equal((await b.ui.send('order.stop',{},'blue_TOP')).ok,true);
 assert.deepEqual(b.attempts.map(x=>x.packet.sequence),[1,1]);
 assert.equal(b.ui.next(),2);
});
await check('06 room switch fails to reset nextSequence',async()=>{
 const one=createRoom(),b=clientFor(one);
 assert.equal((await b.ui.send('order.stop',{},'blue_TOP')).ok,true);
 const fresh=createRoom();b.switchRoom(fresh);
 assert.equal(b.ui.next(),2);
 assert.deepEqual(await b.ui.send('order.stop',{},'blue_TOP'),{ok:false,reason:'sequencia_fora_de_ordem'});
});
await check('07 stale lastRevision drops new-room SSE boot',async()=>{
 let instances=[],rendered=[];
 class ES{constructor(url){this.url=url;instances.push(this);this.handlers={}}addEventListener(k,cb){this.handlers[k]=cb}
 emit(v){this.handlers.state({data:JSON.stringify(v)})}close(){this.closed=true}}
 const api=Function('EventSource','render',`let lastRevision=50,stream=null;
 const $=()=>({textContent:''});${connectSource};return {connect,last:()=>lastRevision};`)(ES,v=>rendered.push(v));
 api.connect();
 instances[0].emit({roomId:'new-room',revision:0});
 assert.equal(rendered.length,0);
 instances[0].emit({roomId:'new-room',revision:50});
 assert.equal(rendered.length,1);
});
await check('08 same-room out-of-order SSE frames are ignored',async()=>{
 let instances=[],rendered=[];
 class ES{constructor(){instances.push(this);this.handlers={}}addEventListener(k,cb){this.handlers[k]=cb}
 emit(v){this.handlers.state({data:JSON.stringify(v)})}close(){}}
 const api=Function('EventSource','render',`let lastRevision=0,stream=null;
 const $=()=>({textContent:''});${connectSource};return {connect};`)(ES,v=>rendered.push(v));
 api.connect();instances[0].emit({roomId:'r1',revision:4});instances[0].emit({roomId:'r1',revision:3});
 assert.deepEqual(rendered.map(v=>v.revision),[4]);
});
console.log('A08 '+n+'/8 DIAGNOSTIC_CLIENT_SYNC_V8; G4_NOT_CERTIFIED');
