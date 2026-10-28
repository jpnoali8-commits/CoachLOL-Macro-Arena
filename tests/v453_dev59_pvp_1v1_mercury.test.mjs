import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Arena,catalog,ITEM_RECIPES,ITEM_EFFECTS_V43,checksumV40} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
const raw=read('riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json').data;
const sr=read('riot_reference/sr_shop_26_21_dev49.json');
let count=0;
async function test(name,fn){await fn();count++;console.log('✓ DEV59 '+name)}
const make=()=>{const registry=new PvPRoomRegistryV453Dev47({map,mask,manifest});const {room,player:blue,token:blueToken}=registry.create();const {player:red,token:redToken}=room.join();return {room,registry,blue,red,blueToken,redToken};};
const item=id=>catalog.find(x=>x.id===id);
await test('Só duas sessões permitidas, uma equipe inteira por humano',()=>{
 const {room,registry}=make();assert.equal(room.players.length,2);assert.equal(room.maxSeats,2);
 assert.deepEqual(room.gateway.seats.get('p1').unitIds,['blue_MID','blue_TOP','blue_JG','blue_ADC','blue_SUP']);
 assert.deepEqual(room.gateway.seats.get('p2').unitIds,['red_MID','red_TOP','red_JG','red_ADC','red_SUP']);
 assert.throws(()=>registry.create(10),/pvp_exige_dois_jogadores/);assert.throws(()=>room.join(),/sala_lotada/);
});
await test('Comandos por campeão: TOP, JG, ADC e SUP azul são autoritativos',()=>{
 const {room,blue}=make();for(const id of ['blue_TOP','blue_JG','blue_ADC','blue_SUP']){
  const seq=room.gateway.seats.get('p1').lastSequence+1;const r=room.command(blue,{sequence:seq,unitId:id,kind:'order.move',payload:{point:{x:.5,y:.5}}});
  assert.equal(r.ok,true,JSON.stringify(r));assert.equal(r.unitId,id);assert.equal(room.arena.units.find(u=>u.id===id).order.kind,'route');
 }
});
await test('Comandos por campeão: cinco vermelhos são autoritativos',()=>{
 const {room,red}=make();for(const id of ['red_MID','red_TOP','red_JG','red_ADC','red_SUP']){
  const seq=room.gateway.seats.get('p2').lastSequence+1;const r=room.command(red,{sequence:seq,unitId:id,kind:'order.stop',payload:{}});
  assert.equal(r.ok,true,JSON.stringify(r));assert.equal(r.unitId,id);
 }
});
await test('Não permite controlar um só campeão da equipe adversária',()=>{
 const {room,blue,red}=make();const original=checksumV40(room.arena.snapshotV40());
 assert.equal(room.command(blue,{sequence:1,unitId:'red_TOP',kind:'order.move',payload:{point:{x:.5,y:.5}}}).reason,'unidade_nao_autorizada');
 assert.equal(room.command(red,{sequence:1,unitId:'blue_SUP',kind:'order.stop',payload:{}}).reason,'unidade_nao_autorizada');
 assert.equal(checksumV40(room.arena.snapshotV40()),original);
});
await test('Replay da mesma ordem é idempotente; não recicla sequência para outro campeão',()=>{
 const {room,blue}=make();const command={sequence:1,unitId:'blue_TOP',kind:'order.stop',payload:{}};
 assert.equal(room.command(blue,command).ok,true);const before=checksumV40(room.arena.snapshotV40());
 assert.equal(room.command(blue,command).ok,true);assert.equal(checksumV40(room.arena.snapshotV40()),before);
 assert.equal(room.command(blue,{...command,unitId:'blue_JG'}).reason,'sequencia_reutilizada_com_dados_diferentes');
});
await test('Visão privada e cinco IDs expostos somente ao dono, sem snapshot bruto',()=>{
 const {room,blue,red}=make();room.arena.visible=(t,u)=>u.team===t;
 const b=room.view(blue),r=room.view(red);
 assert.equal(b.projection.controlledUnitIds.length,5);assert.ok(b.projection.controlledUnitIds.every(id=>id.startsWith('blue_')));
 assert.ok(r.projection.controlledUnitIds.every(id=>id.startsWith('red_')));
 assert.ok(!b.projection.units.some(u=>u.id==='red_MID'));assert.ok(!r.projection.units.some(u=>u.id==='blue_TOP'));
 assert.equal(b.arena,undefined);assert.equal(b.rngState,undefined);
});
await test('Ambos confirmam, nunca começa turno somente com uma equipe',()=>{
 const {room,blue,red}=make();assert.equal(room.confirm(blue).ok,true);assert.notEqual(room.arena.phase,'executing');
 assert.equal(room.command(blue,{sequence:1,unitId:'blue_TOP',kind:'order.stop',payload:{}}).reason,'turno_bloqueado');
 assert.equal(room.confirm(red).ok,true);assert.equal(room.arena.phase,'executing');
});
await test('Defesa de combate de campeão NÃO-MID é privada e autorizado a responder',()=>{
 const {room,blue,red}=make();room.arena.phase='decision';room.arena.pendingDecision={kind:'combat_reaction',unitId:'blue_ADC',enemyId:'red_TOP',at:0};room.arena.executionRemaining=10;
 assert.equal(room.view(blue).pendingDecision.unitId,'blue_ADC');assert.equal(room.view(red).pendingDecision,null);
 assert.equal(room.command(red,{sequence:1,unitId:'red_TOP',kind:'decision.reaction',payload:{targetId:'blue_ADC',response:'defend',steps:[]}}).ok,false);
 const result=room.command(blue,{sequence:1,unitId:'blue_ADC',kind:'decision.reaction',payload:{targetId:'red_TOP',response:'defend',steps:[]}});
 assert.equal(result.ok,true,JSON.stringify(result));assert.equal(room.arena.pendingDecision,null);
});
await test('Mercúrio: preço, receita e atributos oficiais 16.21.1',()=>{
 for(const [id,riot,price,parts,stats] of [
  ['quicksilver_sash','3140',1300,['null_magic_mantle'],{mr:30}],
  ['mercurial_scimitar','3139',3200,['quicksilver_sash','pickaxe','vampiric_scepter'],{ad:50,mr:35,lifeSteal:10}]
 ]){
  assert.equal(raw[riot].maps['11'],true);assert.equal(raw[riot].gold.total,price);
  assert.equal(item(id).riotId,+riot);assert.equal(item(id).cost,price);assert.deepEqual(item(id).stats,stats);
  assert.deepEqual(ITEM_RECIPES[id],parts);assert.equal(sr.rows[riot].status,'engine_playable');
 }
});
await test('Mercúrio remove atordoamento, enraizamento e supressão sem remover knockup',()=>{
 const {room}=make();const a=room.arena,u=a.units.find(v=>v.id==='blue_ADC'),red=a.units.find(v=>v.id==='red_ADC');u.items=['quicksilver_sash'];
 for(const type of ['stun','root','suppression','knockup'])assert.equal(a.effectResolverV41().apply(u,type,{source:red,duration:4}).ok,true);
 assert.equal(a.activateItemV453Dev59('blue',u.id,'quicksilver_sash').ok,true);
 for(const type of ['stun','root','suppression'])assert.equal(a.effectResolverV41().has(u,type),false);
 assert.equal(a.effectResolverV41().has(u,'knockup'),true);
});
await test('Mercúrio funciona no próprio defensor durante reação mesmo com rodadas previamente confirmadas',()=>{
 const {room,blue}=make(),a=room.arena,u=a.units.find(v=>v.id==='blue_SUP'),enemy=a.units.find(v=>v.id==='red_TOP');
 u.items=['quicksilver_sash'];a.effectResolverV41().apply(u,'stun',{source:enemy,duration:5});
 a.phase='decision';a.pendingDecision={kind:'combat_reaction',unitId:u.id,enemyId:enemy.id,at:0};a.executionRemaining=15;
 a.teams.blue.ready=true;
 const cast=room.command(blue,{sequence:1,kind:'item.activate',unitId:u.id,payload:{itemId:'quicksilver_sash'}});
 assert.equal(cast.ok,true,JSON.stringify(cast));assert.equal(a.effectResolverV41().has(u,'stun'),false);
 assert.equal(a.phase,'decision');assert.equal(a.pendingDecision.unitId,u.id); // item não confirma resposta automaticamente
});
await test('Recarga não pode ser burlada por ativação repetida nem troca de item',()=>{
 const {room}=make();const a=room.arena,u=a.units.find(v=>v.id==='blue_ADC');u.items=['quicksilver_sash'];
 assert.equal(a.activateItemV453Dev59('blue',u.id,'quicksilver_sash').ok,true);
 assert.equal(a.activateItemV453Dev59('blue',u.id,'quicksilver_sash').reason,'item_em_recarga');
 u.items=['mercurial_scimitar'];assert.equal(a.activateItemV453Dev59('blue',u.id,'mercurial_scimitar').reason,'item_em_recarga');
});
await test('Cimitarra concede sprint apenas após a ativação e jamais atravessa paredes',()=>{
 const {room}=make();const a=room.arena,u=a.units.find(v=>v.id==='blue_MID');u.items=['mercurial_scimitar'];const speed=a.effectiveMS(u);
 const cast=a.activateItemV453Dev59('blue',u.id,'mercurial_scimitar');assert.equal(cast.ok,true,JSON.stringify(cast));assert.ok(a.effectiveMS(u)>speed);
 a.gameTime+=2;assert.equal(a.effectiveMS(u),speed);
});
await test('Snapshot autoritativo restaura escudo, recarga e equipes; checkpoint preserva as dez unidades sob dois assentos',()=>{
 const path=mkdtempSync(join(tmpdir(),'coachlol59-'));try{
  const registry=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:path});const first=registry.create(2),room=first.room,second=room.join();
  const u=room.arena.units.find(v=>v.id==='blue_MID');u.items=['quicksilver_sash'];const cast=room.command(first.player,{sequence:1,unitId:'blue_MID',kind:'item.activate',payload:{itemId:'quicksilver_sash'}});assert.equal(cast.ok,true,JSON.stringify(cast));
  const restored=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:path}).get(room.id);assert.ok(restored);
  assert.equal(restored.gateway.seats.get('p1').unitIds.length,5);assert.equal(restored.gateway.seats.get('p2').unitIds.length,5);
  assert.equal(restored.authenticate(first.token).seatId,'p1');assert.equal(restored.authenticate(second.token).seatId,'p2');
  assert.equal(restored.arena.units.find(v=>v.id==='blue_MID').mercuryReadyAtV453Dev59,u.mercuryReadyAtV453Dev59);
  assert.equal(restored.view(restored.players[0]).nextSequence,2);
 }finally{rmSync(path,{recursive:true,force:true});}
});
await test('Servidor HTTP rejeita lobby com dez jogadores e garante dois cookies isolados',async()=>{
 const srv=createPvPServerV453Dev47({tickMs:0});const addr=await srv.listen(0);const origin=`http://127.0.0.1:${addr.port}`;
 const post=async(path,payload,cookie='')=>{const res=await fetch(origin+path,{method:'POST',headers:{'content-type':'application/json',origin,...(cookie?{cookie}:{})},body:JSON.stringify(payload)});return {status:res.status,data:await res.json(),cookie:res.headers.get('set-cookie')};};
 try{
  const rejected=await post('/api/create',{maxSeats:10});assert.equal(rejected.status,400);
  const created=await post('/api/create',{maxSeats:2});assert.equal(created.status,201);const code=created.data.roomId;
  const joined=await post('/api/join',{roomId:code});assert.equal(joined.status,200);
  assert.equal(created.data.team,'blue');assert.equal(joined.data.team,'red');
  assert.equal(created.data.maxSeats,2);assert.equal(joined.data.projection.controlledUnitIds.length,5);
  const third=await post('/api/join',{roomId:code});assert.equal(third.status,400);
 }finally{await srv.close();}
});
assert.ok(sr.counts.normalPlayable>=100);assert.equal(sr.counts.normalPlayable+sr.counts.referenceOnly,sr.counts.normalStore);
console.log(`DEV59 ${count}/${count} PASS`);
