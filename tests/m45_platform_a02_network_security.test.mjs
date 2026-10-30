/** M45 A02: legacy HTTP/SSE two-seat oracle. Source integration 374d87d5f49b52514ec68bbe666df086363c1ec5.
 * Run with complete checkout: node tests/m45_platform_a02_network_security.test.mjs
 * This is NOT proof of Rust native/WASM/browser parity.
 */
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {checksumV40} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';

const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),manifest=load('rift_user_manifest_v452d4.json');
const path=mkdtempSync(join(tmpdir(),'coachlol-m45-a02-'));
const make=()=>new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:path});
let server=null,passed=0;
const check=async(label,fn)=>{await fn();passed++;console.log('PASS A02 '+label);};
try {
 const registry=make();
 server=createPvPServerV453Dev47({registry,tickMs:0});
 const address=await server.listen(0),base='http://127.0.0.1:'+address.port;
 const req=async(url,method='GET',body=null,cookie='',origin=base)=>{
  const headers={};if(cookie)headers.cookie=cookie;
  if(body!==null){headers['content-type']='application/json';headers.origin=origin;}
  const response=await fetch(base+url,{method,headers,body:body===null?undefined:JSON.stringify(body)});
  const raw=await response.text();let data=null;try{data=JSON.parse(raw);}catch{}
  return {status:response.status,headers:response.headers,data,raw};
 };
 const create=await req('/api/create','POST',{maxSeats:2});
 assert.equal(create.status,201,create.raw);
 const blueCookie=create.headers.get('set-cookie').split(';')[0];
 const joinRoom=await req('/api/join','POST',{roomId:create.data.roomId});
 assert.equal(joinRoom.status,200,joinRoom.raw);
 const redCookie=joinRoom.headers.get('set-cookie').split(';')[0];
 const room=registry.get(create.data.roomId);
 await check('01 two independent seats 5 units',()=>{
  assert.notEqual(blueCookie,redCookie);assert.equal(room.players.length,2);
  assert.deepEqual(room.gateway.seats.get('p1').unitIds.slice().sort(),['blue_TOP','blue_JG','blue_MID','blue_ADC','blue_SUP'].sort());
  assert.deepEqual(room.gateway.seats.get('p2').unitIds.slice().sort(),['red_TOP','red_JG','red_MID','red_ADC','red_SUP'].sort());
  assert.throws(()=>room.join(),/sala_lotada/);
 });
 await check('02 cookie and unit spoof rejected',async()=>{
  assert.equal((await req('/api/session')).status,401);
  assert.equal((await req('/api/session','GET',null,blueCookie)).data.team,'blue');
  assert.equal((await req('/api/session','GET',null,redCookie)).data.team,'red');
  const before=checksumV40(room.arena.snapshotV40());
  const spoof=await req('/api/action','POST',{sequence:1,kind:'order.stop',unitId:'red_TOP',payload:{}},blueCookie);
  assert.equal(spoof.status,409);assert.equal(room.gateway.seats.get('p1').lastSequence,0);
  assert.equal(checksumV40(room.arena.snapshotV40()),before);
 });
 await check('03 illegal shape, sequence gap, cross-origin rejected',async()=>{
  assert.equal((await req('/api/action','POST',{sequence:1,kind:'order.stop',unitId:'blue_TOP',team:'red',payload:{}},blueCookie)).status,409);
  assert.equal((await req('/api/action','POST',{sequence:3,kind:'order.stop',unitId:'blue_TOP',payload:{}},blueCookie)).status,409);
  assert.equal((await req('/api/ready','POST',{},blueCookie,'https://attacker.invalid')).status,403);
 });
 const b={sequence:1,kind:'order.stop',unitId:'blue_TOP',payload:{}};
 const r={sequence:1,kind:'order.stop',unitId:'red_TOP',payload:{}};
 let ack;
 await check('04 both teams + idempotent receipt',async()=>{
  const a=await req('/api/action','POST',b,blueCookie);
  assert.equal(a.status,200,a.raw);ack=a.data;
  const z=await req('/api/action','POST',r,redCookie);assert.equal(z.status,200,z.raw);
  const before=checksumV40(room.arena.snapshotV40());
  const again=await req('/api/action','POST',b,blueCookie);
  assert.equal(again.status,200);assert.deepEqual(again.data,ack);
  assert.equal(checksumV40(room.arena.snapshotV40()),before);
  assert.equal((await req('/api/action','POST',{...b,kind:'order.recall'},blueCookie)).status,409);
  assert.equal(checksumV40(room.arena.snapshotV40()),before);
 });
 await check('05 visible enemy gets only public unit fields and shop quote is own',async()=>{
  for(const cookie of [blueCookie,redCookie]){
   const v=(await req('/api/session','GET',null,cookie)).data;
   assert.equal(v.projection.controlledUnitIds.length,5);
   assert.ok(v.projection.units.filter(u=>u.team!==v.team).every(u=>!Object.hasOwn(u,'items')&&!Object.hasOwn(u,'order')));
  }
  assert.equal((await req('/api/shop/quote?unitId=red_TOP&itemId=boots','GET',null,blueCookie)).status,403);
  assert.equal((await req('/api/shop/quote?unitId=blue_TOP&itemId=boots','GET',null,redCookie)).status,403);
 });
 await check('06 fog/decision filtered by team in room view',()=>{
  const visible=room.arena.visible,decision=room.arena.pendingDecision;
  try{
   room.arena.visible=(team,unit)=>unit.team===team;
   room.arena.pendingDecision={kind:'combat_reaction',unitId:'blue_TOP',enemyId:'red_TOP',at:0};
   const blue=room.view(room.players[0]),red=room.view(room.players[1]);
   assert.equal(blue.projection.units.some(u=>u.id==='red_TOP'),false);
   assert.equal(red.projection.units.some(u=>u.id==='blue_TOP'),false);
   assert.equal(red.pendingDecision,null);
   assert.equal(blue.pendingDecision.unitId,'blue_TOP');
   for(const v of [blue,red]){assert.equal(Object.hasOwn(v,'rngState'),false);assert.equal(Object.hasOwn(v,'tokenHash'),false);}
  }finally{room.arena.visible=visible;room.arena.pendingDecision=decision;}
 });
 await check('07 first ready cannot seal turn',async()=>{
  assert.equal((await req('/api/ready','POST',{},blueCookie)).status,200);
  assert.notEqual(room.arena.phase,'executing');
  assert.equal((await req('/api/action','POST',{sequence:2,kind:'order.stop',unitId:'blue_MID',payload:{}},blueCookie)).status,409);
  assert.equal((await req('/api/ready','POST',{},redCookie)).status,200);
  assert.equal(room.arena.phase,'executing');
 });
 await check('08 two SSE streams carry own projection only',async()=>{
  for(const [cookie,team] of [[blueCookie,'blue'],[redCookie,'red']]){
   const ctl=new AbortController();
   try{
    const res=await fetch(base+'/api/stream',{headers:{cookie},signal:ctl.signal});assert.equal(res.status,200);
    const {value}=await res.body.getReader().read();const frame=new TextDecoder().decode(value);
    assert.match(frame,/event: state/);
    const projected=JSON.parse(frame.split('data: ')[1].split('\n')[0]);
    assert.equal(projected.team,team);assert.equal(projected.projection.team,team);
    assert.equal(Object.hasOwn(projected,'rngState'),false);
    assert.equal(Object.hasOwn(projected,'tokenHash'),false);
   }finally{ctl.abort();}
  }
 });
 await check('09 checkpoint restore preserves receipt and RNG privately',()=>{
  const restored=make().get(room.id);assert.ok(restored);
  const blue=restored.authenticate(blueCookie.split('=')[1]);
  const red=restored.authenticate(redCookie.split('=')[1]);
  assert.equal(blue?.team,'blue');assert.equal(red?.team,'red');
  const before=checksumV40(restored.arena.snapshotV40());
  assert.deepEqual(restored.command(blue,b),ack);
  assert.equal(checksumV40(restored.arena.snapshotV40()),before);
  assert.equal(restored.view(blue).nextSequence,2);
  assert.ok(Number.isInteger(restored.checkpoint().arena.rngState));
 });
 console.log('M45 A02 '+passed+'/9 source-runtime checks passed');
}finally{if(server)await server.close();rmSync(path,{recursive:true,force:true});}
