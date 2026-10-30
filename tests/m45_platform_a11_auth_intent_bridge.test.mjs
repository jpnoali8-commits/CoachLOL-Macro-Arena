/**
 * M45 A11: server-side preview fence reference against original Arena/Room/Gateway.
 * Node in full checkout: node tests/m45_platform_a11_auth_intent_bridge.test.mjs
 * Source dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5
 * This tests a PROPOSED safe subset, NOT installed on legacy HTTP or Rust.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
import {interpretCommands} from '../commands.mjs';
import {PvPRoomV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
import {AuthenticatedTextIntentBridgeReference} from './m45_platform_a11_intent_gateway_reference.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),man=read('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=man.baseFeatures;map.riftBundlesV452d4=man.variants;
let id=0,passed=0;
function create(){
 const arena=new Arena(map,mask,{mode:'pvp',seed:4511+id++});
 const blue={seatId:'p1',team:'blue',role:'MID',unitId:'blue_MID',tokenHash:'b'};
 const red={seatId:'p2',team:'red',role:'MID',unitId:'red_MID',tokenHash:'r'};
 const room=new PvPRoomV453Dev47({id:'a11a1101',arena,restored:{players:[blue,red]},checkpointPath:null});
 return {arena,room,blue,red,bridge:new AuthenticatedTextIntentBridgeReference({interpretCommands})};
}
function check(name,fn){fn();passed++;console.log('PASS A11 '+name);}
check('01 preview recall does not mutate arena or consume seq',()=>{
 const t=create(),state=checksumV40(t.arena.snapshotV40());
 const d=t.bridge.preview(t.room,t.blue,'ADC recall');
 assert.equal(d.ok,true);assert.equal(d.kind,'order.recall');assert.equal(d.unitId,'blue_ADC');
 assert.equal(checksumV40(t.arena.snapshotV40()),state);
 assert.equal(t.room.gateway.seats.get('p1').lastSequence,0);
});
check('02 recall commit uses authoritative room command and returns ACK',()=>{
 const t=create(),d=t.bridge.preview(t.room,t.blue,'ADC recall');
 const result=t.bridge.commit(t.room,t.blue,d.draftId);
 assert.equal(result.ok,true);assert.equal(result.kind,'order.recall');assert.equal(result.sequence,1);
 assert.equal(result.unitId,'blue_ADC');
 assert.equal(t.arena.units.find(u=>u.id==='blue_ADC').order.kind,'recall');
});
check('03 red authenticated seat controls its own ADC and not blue',()=>{
 const t=create(),before=checksumV40(t.arena.units.filter(u=>u.team==='blue'));
 const d=t.bridge.preview(t.room,t.red,'ADC recall');
 assert.equal(d.unitId,'red_ADC');
 assert.equal(t.bridge.commit(t.room,t.red,d.draftId).ok,true);
 assert.equal(checksumV40(t.arena.units.filter(u=>u.team==='blue')),before);
});
check('04 unsupported multi-operation safe farm plan rejected atomically',()=>{
 const t=create(),before=checksumV40(t.arena.snapshotV40());
 assert.equal(t.bridge.preview(t.room,t.blue,'MID farmar safe, sem trocar').reason,'plano_atomico_nao_suportado');
 assert.equal(checksumV40(t.arena.snapshotV40()),before);
});
check('05 jungle multi-step plan refuses partial lowering',()=>{
 const t=create(),before=checksumV40(t.arena.snapshotV40());
 const d=t.bridge.preview(t.room,t.blue,'JG red de baixo depois krugs de baixo');
 assert.equal(d.reason,'acao_textual_sem_contrato_wire');
 assert.equal(checksumV40(t.arena.snapshotV40()),before);
});
check('06 smite policy without wire operation is rejected',()=>{
 const t=create();
 assert.equal(t.bridge.preview(t.room,t.blue,'JG guardar smite').reason,'acao_textual_sem_contrato_wire');
});
check('07 single kite style cannot silently drop combat behavior',()=>{
 const t=create();
 assert.equal(t.bridge.preview(t.room,t.blue,'ADC kite com AA').reason,'plano_atomico_nao_suportado');
});
check('08 unknown role or invalid text never gets draft',()=>{
 const t=create();
 assert.equal(t.bridge.preview(t.room,t.blue,'unknown invalid').reason,'texto_nao_compilavel');
 assert.equal(t.bridge.preview(t.room,t.blue,'').reason,'texto_invalido');
 assert.equal(t.bridge.preview(t.room,t.blue,'a'.repeat(1801)).reason,'texto_invalido');
});
check('09 forged authenticated context cannot select opponent seat',()=>{
 const t=create();
 const fake={seatId:'p1',team:'red',unitId:'red_MID'};
 assert.equal(t.bridge.preview(t.room,fake,'ADC recall').reason,'assento_nao_autenticado');
});
check('10 a stolen draft ID cannot be committed by other seat',()=>{
 const t=create(),d=t.bridge.preview(t.room,t.blue,'ADC recall');
 assert.equal(t.bridge.commit(t.room,t.red,d.draftId).reason,'rascunho_nao_autorizado');
 assert.equal(t.room.gateway.seats.get('p1').lastSequence,0);
});
check('11 unknown or malicious ID cannot be committed',()=>{
 const t=create();
 assert.equal(t.bridge.commit(t.room,t.blue,'a11-fake').reason,'rascunho_nao_autorizado');
});
check('12 first ready before preview forbids text draft',()=>{
 const t=create();assert.equal(t.room.confirm(t.blue).ok,true);
 assert.equal(t.arena.teams.blue.ready,false);
 assert.equal(t.bridge.preview(t.room,t.blue,'ADC recall').reason,'turno_bloqueado');
});
check('13 ready between preview and commit forbids mutation',()=>{
 const t=create(),d=t.bridge.preview(t.room,t.blue,'ADC recall');
 assert.equal(t.room.confirm(t.blue).ok,true);
 assert.equal(t.bridge.commit(t.room,t.blue,d.draftId).reason,'turno_bloqueado');
 assert.equal(t.arena.units.find(u=>u.id==='blue_ADC').order.kind,'auto');
});
check('14 other seat command increments revision and invalidates draft',()=>{
 const t=create(),d=t.bridge.preview(t.room,t.blue,'ADC recall');
 const other=t.room.command(t.red,{sequence:1,kind:'order.stop',unitId:'red_TOP',payload:{}});
 assert.equal(other.ok,true);
 assert.equal(t.bridge.commit(t.room,t.blue,d.draftId).reason,'rascunho_desatualizado');
});
check('15 identical commit retry returns original receipt without second mutation',()=>{
 const t=create(),d=t.bridge.preview(t.room,t.blue,'ADC recall');
 const first=t.bridge.commit(t.room,t.blue,d.draftId);
 const before=checksumV40(t.arena.snapshotV40()),revision=t.room.revision;
 assert.deepEqual(t.bridge.commit(t.room,t.blue,d.draftId),first);
 assert.equal(t.room.revision,revision);assert.equal(checksumV40(t.arena.snapshotV40()),before);
});
check('16 retry packet is exactly canonical original action packet',()=>{
 const t=create(),d=t.bridge.preview(t.room,t.blue,'ADC recall');
 const before=t.bridge.retryPacket(t.room,t.blue,d.draftId);assert.equal(before,null);
 const first=t.bridge.commit(t.room,t.blue,d.draftId);
 const packet=t.bridge.retryPacket(t.room,t.blue,d.draftId);
 assert.deepEqual(packet,{sequence:1,kind:'order.recall',unitId:'blue_ADC',payload:{}});
 assert.equal(t.bridge.retryPacket(t.room,t.red,d.draftId),null);
 assert.deepEqual(t.room.command(t.blue,packet),first);
});
check('17 accepted draft receipt recoverable even after both ready',()=>{
 const t=create(),d=t.bridge.preview(t.room,t.blue,'ADC recall');
 const ack=t.bridge.commit(t.room,t.blue,d.draftId);
 assert.equal(t.room.confirm(t.blue).ok,true);
 assert.equal(t.room.confirm(t.red).ok,true);
 assert.deepEqual(t.bridge.commit(t.room,t.blue,d.draftId),ack);
});
check('18 server checkpoint carries action receipt for replay after restore',()=>{
 const t=create(),d=t.bridge.preview(t.room,t.blue,'ADC recall');
 const receipt=t.bridge.commit(t.room,t.blue,d.draftId);
 const stored=t.room.checkpoint(),restore=Arena.fromSnapshotV40(map,mask,stored.arena);
 const newRoom=new PvPRoomV453Dev47({id:t.room.id,arena:restore,restored:stored,checkpointPath:null});
 const packet=t.bridge.retryPacket(t.room,t.blue,d.draftId);
 assert.deepEqual(newRoom.command(t.blue,packet),receipt);
});
check('19 previous round draft cannot be used after turn resolution',()=>{
 const t=create(),d=t.bridge.preview(t.room,t.blue,'ADC recall');
 assert.equal(t.room.confirm(t.blue).ok,true);assert.equal(t.room.confirm(t.red).ok,true);
 for(let i=0;i<9&&t.arena.phase==='executing';i++)assert.equal(t.room.advance(5).ok,true);
 assert.equal(t.arena.round,2);
 assert.equal(t.bridge.commit(t.room,t.blue,d.draftId).reason,'rascunho_desatualizado');
});
check('20 entire plan containing extra action is not silently reduced to recall',()=>{
 const t=create(),before=checksumV40(t.arena.snapshotV40());
 const d=t.bridge.preview(t.room,t.blue,'ADC recall; MID farmar safe');
 assert.equal(d.reason,'plano_atomico_nao_suportado');
 assert.equal(checksumV40(t.arena.snapshotV40()),before);
});
console.log('M45 A11 '+passed+'/20 source-pinned reference-to-LEGACY_gateway tests; RUST NOT_CERTIFIED');
