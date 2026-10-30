/**
 * M45 PLATFORM-A09: authoritative command and snapshot wire oracle for Rust migration.
 * Run: node tests/m45_platform_a09_gateway_contract.test.mjs
 * Source: dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5.
 * Executes REAL legacy Arena + gateway dev44/dev47 + room dev47. NOT Rust certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
import {PvPRoomV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json'),manifest=data('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=manifest.baseFeatures;map.riftBundlesV452d4=manifest.variants;
let fixtureCount=0,checks=0;
function fixture(){
 const a=new Arena(map,mask,{mode:'pvp',seed:4910+fixtureCount++});
 const blue={seatId:'p1',team:'blue',role:'MID',unitId:'blue_MID',tokenHash:'mock-blue'};
 const red={seatId:'p2',team:'red',role:'MID',unitId:'red_MID',tokenHash:'mock-red'};
 const room=new PvPRoomV453Dev47({id:'a09a0911',arena:a,restored:{players:[blue,red]},checkpointPath:null});
 return {arena:a,room,blue,red};
}
const send=(room,player,seq,unit,kind='order.stop',payload={})=>room.command(player,{sequence:seq,unitId:unit,kind,payload});
function check(label,fn){fn();checks++;console.log('PASS A09 GATEWAY '+label);}
check('01 exactly two humans, five controlled units per team',()=>{
 const {room,arena}=fixture();
 assert.equal(arena.units.length,10);
 assert.equal(room.gateway.seats.size,2);
 for(const [seat,team] of [['p1','blue'],['p2','red']]){
  const ids=room.gateway.seats.get(seat).unitIds;
  assert.equal(ids.length,5);assert.ok(ids.every(id=>id.startsWith(team+'_')));
 }
});
check('02 accepted commands and independent per-seat sequences',()=>{
 const {room,blue,red}=fixture();
 const a=send(room,blue,1,'blue_TOP'),b=send(room,red,1,'red_JG');
 assert.equal(a.ok,true);assert.equal(b.ok,true);
 assert.equal(a.sequence,1);assert.equal(b.sequence,1);
 assert.equal(room.gateway.seats.get('p1').lastSequence,1);
 assert.equal(room.gateway.seats.get('p2').lastSequence,1);
});
check('03 identical packet retry returns identical immutable ACK',()=>{
 const {room,blue,arena}=fixture(),cmd={sequence:1,kind:'order.stop',unitId:'blue_TOP',payload:{}};
 const first=room.command(blue,cmd),hash=checksumV40(arena.snapshotV40());
 assert.deepEqual(room.command(blue,cmd),first);
 assert.equal(checksumV40(arena.snapshotV40()),hash);
});
check('04 same sequence but different command is rejected',()=>{
 const {room,blue,arena}=fixture();send(room,blue,1,'blue_TOP');
 const hash=checksumV40(arena.snapshotV40());
 assert.equal(send(room,blue,1,'blue_TOP','order.recall').reason,'sequencia_reutilizada_com_dados_diferentes');
 assert.equal(checksumV40(arena.snapshotV40()),hash);
});
check('05 both seats cannot order the opposing champions',()=>{
 const {room,blue,red}=fixture();
 assert.equal(send(room,blue,1,'red_TOP').reason,'unidade_nao_autorizada');
 assert.equal(send(room,red,1,'blue_TOP').reason,'unidade_nao_autorizada');
 assert.equal(room.gateway.seats.get('p1').lastSequence,0);
 assert.equal(room.gateway.seats.get('p2').lastSequence,0);
});
check('06 unknown authenticated seat rejected at gateway',()=>{
 const {room}=fixture();
 assert.equal(room.gateway.submit('unknown',{sequence:1,kind:'order.stop',payload:{}}).reason,'seat_desconhecido');
});
check('07 spoof team and arbitrary top-level fields rejected',()=>{
 const {room,blue}=fixture(),base={sequence:1,unitId:'blue_TOP',kind:'order.stop',payload:{}};
 assert.equal(room.command(blue,{...base,team:'red'}).reason,'comando_invalido');
 assert.equal(room.command(blue,{...base,seatId:'p2'}).reason,'comando_invalido');
});
check('08 nonpositive, fractional or non-number sequence rejected',()=>{
 const {room,blue}=fixture();
 for(const seq of [0,-1,1.5,'1',null,Number.MAX_SAFE_INTEGER+1]){
  assert.equal(send(room,blue,seq,'blue_TOP').reason,'comando_invalido');
 }
});
check('09 skipped sequence is rejected',()=>{
 const {room,red}=fixture();
 assert.equal(send(room,red,2,'red_TOP').reason,'sequencia_fora_de_ordem');
});
check('10 invalid order.stop payload rejected',()=>{
 const {room,blue}=fixture();
 for(const payload of [{extra:true},[],null,'',{'point':{x:.2,y:.2}}]){
  assert.equal(send(room,blue,1,'blue_TOP','order.stop',payload).reason,'comando_invalido');
 }
});
check('11 unsupported kinds and malformed abilities rejected without cast',()=>{
 const {room,blue}=fixture();
 assert.equal(send(room,blue,1,'blue_TOP','order.teleport',{}).reason,'comando_invalido');
 assert.equal(send(room,blue,1,'blue_TOP','skill.ground',{slot:'T',point:{x:.2,y:.2}}).reason,'comando_invalido');
 assert.equal(send(room,blue,1,'blue_TOP','skill.ground',{slot:'Q',point:{x:.2,y:.2},bypass:true}).reason,'comando_invalido');
});
check('12 out-of-bounds movement/ward rejected; boundary positions valid schema',()=>{
 const {room,blue,arena}=fixture();
 const before=checksumV40(arena.snapshotV40());
 for(const p of [{x:-.1,y:0},{x:1.01,y:.5},{x:NaN,y:.5},{x:0,y:Infinity},{x:.5}]){
  assert.equal(send(room,blue,1,'blue_TOP','order.move',{point:p}).reason,'comando_invalido');
 }
 assert.equal(checksumV40(arena.snapshotV40()),before);
});
check('13 invisible enemy targeting denied by authoritative fog',()=>{
 const {room,arena,blue,red}=fixture(),original=arena.visible;
 try{
  arena.visible=(team,unit)=>team===unit.team;
  assert.equal(send(room,blue,1,'blue_TOP','order.attack',{targetId:'red_TOP'}).reason,'alvo_indisponivel');
  assert.equal(send(room,red,1,'red_TOP','order.attack',{targetId:'blue_TOP'}).reason,'alvo_indisponivel');
 }finally{arena.visible=original;}
});
check('14 proper per-side filtered view hides enemy when out of vision',()=>{
 const {room,arena,blue,red}=fixture(),original=arena.visible;
 try{
  arena.visible=(team,u)=>team===u.team;
  for(const [p,other] of [[blue,'red'],[red,'blue']]){
   const result=room.view(p);
   assert.equal(result.projection.units.some(u=>u.team===other),false);
   assert.equal(result.projection.controlledUnitIds.length,5);
   assert.equal(Object.hasOwn(result,'rngState'),false);
   assert.equal(Object.hasOwn(result,'tokenHash'),false);
  }
 }finally{arena.visible=original;}
});
check('15 visible enemy unit is serialized through constrained fields',()=>{
 const {room,arena,blue}=fixture(),original=arena.visible;
 try{
  arena.visible=(team,u)=>team===u.team||u.id==='red_TOP';
  const opponent=room.view(blue).projection.units.find(u=>u.id==='red_TOP');
  assert.ok(opponent);assert.equal(Object.hasOwn(opponent,'items'),false);
  assert.equal(Object.hasOwn(opponent,'order'),false);
 }finally{arena.visible=original;}
});
check('16 first ready seals only owner; cannot add new packet',()=>{
 const {room,arena,blue,red}=fixture();
 const first=room.confirm(blue);
 assert.equal(first.ok,true);assert.notEqual(arena.phase,'executing');
 assert.equal(send(room,blue,1,'blue_TOP').reason,'turno_bloqueado');
 assert.equal(send(room,red,1,'red_TOP').ok,true);
});
check('17 second ready begins one deterministic engine execution',()=>{
 const {room,arena,blue,red}=fixture();
 assert.equal(room.confirm(blue).ok,true);
 assert.equal(room.confirm(red).ok,true);
 assert.equal(arena.phase,'executing');
 assert.equal(room.ready.size,0);
 assert.equal(send(room,blue,1,'blue_TOP').reason,'turno_bloqueado');
});
check('18 accepted command receipt survives seal and restart',()=>{
 const {room,arena,blue,red}=fixture(),msg={sequence:1,kind:'order.stop',unitId:'blue_TOP',payload:{}};
 const ack=room.command(blue,msg);
 assert.equal(room.confirm(blue).ok,true);
 assert.equal(room.confirm(red).ok,true);
 assert.deepEqual(room.command(blue,msg),ack);
 const stored=room.checkpoint(),restoredArena=Arena.fromSnapshotV40(map,mask,stored.arena);
 const again=new PvPRoomV453Dev47({id:room.id,arena:restoredArena,restored:stored,checkpointPath:null});
 assert.deepEqual(again.command(blue,msg),ack);
 assert.equal(again.gateway.seats.get('p1').lastSequence,1);
});
check('19 invalid packet cannot mutate Arena checksum',()=>{
 const {room,arena,blue}=fixture(),hash=checksumV40(arena.snapshotV40());
 assert.equal(send(room,blue,4,'red_TOP','order.stop').ok,false);
 assert.equal(send(room,blue,1,'blue_TOP','order.move',{point:{x:2,y:2}}).ok,false);
 assert.equal(checksumV40(arena.snapshotV40()),hash);
});
check('20 known legacy event leak remains a G3 failure not a passing privacy test',()=>{
 const {arena,room,blue,red}=fixture();
 arena.event('A09_PRIVATE_UNCLASSIFIED_CANARY');
 assert.equal(room.view(blue).projection.events.some(e=>e.text==='A09_PRIVATE_UNCLASSIFIED_CANARY'),true);
 assert.equal(room.view(red).projection.events.some(e=>e.text==='A09_PRIVATE_UNCLASSIFIED_CANARY'),true);
});
console.log('M45 A09 '+checks+'/20 LEGACY_RUNTIME_GOLDENS, security gap remains; RUST NOT_CERTIFIED');
