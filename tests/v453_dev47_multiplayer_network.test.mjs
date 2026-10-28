import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Arena,checksumV40} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
import {PLAYER_ACTION_KINDS_V453_DEV47} from '../multiplayer/authoritative_actions_v453_dev47.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),manifest=load('rift_user_manifest_v452d4.json');
const temp=mkdtempSync(join(tmpdir(),'coachlol-dev47-'));
const create=()=>new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:temp});
let n=0;function test(t,fn){fn();console.log('✓ dev47 '+t);n++;}let registry=create(),r=registry.create(2),room=r.room;
const a=r.player,secretA=r.token,bJoin=room.join(),b=bJoin.player,secretB=bJoin.token;
test('gateway já auditado é reutilizado, com posse vinculada no servidor',()=>{assert.equal(room.gateway.seats.get('p1').unitId,'blue_MID');assert.equal(room.gateway.seats.get('p2').unitId,'red_MID');assert.equal(PLAYER_ACTION_KINDS_V453_DEV47.includes('order.retreat'),true);});
test('duas sessões diferentes; token desconhecido não resolve',()=>{assert.equal(room.authenticate(secretA)?.seatId,'p1');assert.equal(room.authenticate(secretB)?.seatId,'p2');assert.equal(room.authenticate('x'.repeat(64)),null);});
test('perspectiva fog restrita por equipe, nenhuma fotografia de estado cru',()=>{const enemy=room.arena.units.find(u=>u.id==='red_MID');enemy.x=.50;enemy.y=.50;room.arena.visible=(t,u)=>u.team===t;
 const blue=room.view(a),red=room.view(b);assert.equal(blue.projection.units.some(u=>u.id==='red_MID'),false);assert.equal(red.projection.units.some(u=>u.id==='blue_MID'),false);assert.equal('rngState'in blue,false);assert.equal('state'in blue,false);});
test('ordem real de movimento do jogador azul e vermelho chega ao próprio motor',()=>{const one=room.command(a,{sequence:1,kind:'order.move',payload:{point:{x:.4,y:.4}}});const two=room.command(b,{sequence:1,kind:'order.move',payload:{point:{x:.6,y:.6}}});assert.ok(one.ok,JSON.stringify(one));assert.ok(two.ok,JSON.stringify(two));assert.equal(room.arena.units.find(u=>u.id==='blue_MID').order.kind,'route');});
test('recuar de uma equipe não pode comandar unidade inimiga',()=>{const ret=room.command(a,{sequence:2,kind:'order.retreat',payload:{}});assert.ok(ret.ok,JSON.stringify(ret));assert.ok(room.arena.units.find(u=>u.id==='blue_MID').retreatUntil>0);assert.equal(room.gateway.seats.get('p1').unitId,'blue_MID');});
test('mesmo pacote com sequência repetida não cria nova ação nem estado',()=>{const before=checksumV40(room.arena.snapshotV40());const x=room.command(a,{sequence:2,kind:'order.retreat',payload:{}});assert.ok(x.ok);assert.equal(checksumV40(room.arena.snapshotV40()),before);assert.equal(room.command(a,{sequence:2,kind:'order.stop',payload:{}}).ok,false);});
test('confirmar um lado não inicia o turno antes de ambos',()=>{const x=room.confirm(a);assert.ok(x.ok);assert.notEqual(room.arena.phase,'executing');assert.equal(room.command(a,{sequence:3,kind:'order.stop',payload:{}}).ok,false);});
test('ambas confirmações iniciam exatamente uma execução compartilhada',()=>{const x=room.confirm(b);assert.ok(x.ok,JSON.stringify(x));assert.equal(room.arena.phase,'executing');assert.equal(room.ready.size,0);});
test('servidor avança em trecho sem cliente inventar ticks ou trocar fase',()=>{const was=room.arena.gameTime;const x=room.advance(1);assert.ok(x.ok,JSON.stringify(x));assert.ok(room.arena.gameTime>was);});
test('checkpoint preserva sala, gateway e sessão durante reinício',()=>{const previous=room.arena.gameTime;const loaded=create().get(room.id);assert.ok(loaded);assert.equal(loaded.arena.gameTime,previous);assert.equal(loaded.authenticate(secretA)?.unitId,'blue_MID');assert.equal(loaded.gateway.seats.get('p2').lastSequence,1);assert.equal(loaded.view(loaded.players[0]).nextSequence,3);});
test('sala cheia recusa terceiro jogador',()=>{assert.throws(()=>room.join(),/sala_lotada/);});
test('resposta de combate de dono da unidade desbloqueia a execucao sem auto-bot',()=>{
 const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest}),own=reg.create(2),other=own.room.join(),battle=own.room;
 battle.arena.phase='decision';battle.arena.executionRemaining=10;battle.arena.pendingDecision={kind:'combat_reaction',unitId:'blue_MID',enemyId:'red_MID',at:0};
 const ok=battle.command(own.player,{sequence:1,kind:'decision.reaction',payload:{targetId:'red_MID',steps:[],response:'defend'}});
 assert.ok(ok.ok,JSON.stringify(ok));assert.equal(battle.arena.pendingDecision,null);assert.equal(battle.arena.phase,'executing');
});
test('oponente nao responde a decisao privada da equipe azul',()=>{
 const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest}),own=reg.create(2),other=own.room.join(),battle=own.room;
 battle.arena.phase='decision';battle.arena.executionRemaining=10;battle.arena.pendingDecision={kind:'combat_reaction',unitId:'blue_MID',enemyId:'red_MID',at:0};
 assert.equal(battle.view(other.player).pendingDecision,null);
 assert.equal(battle.command(other.player,{sequence:1,kind:'decision.reaction',payload:{targetId:'blue_MID',steps:[],response:'defend'}}).ok,false);
 assert.equal(battle.arena.pendingDecision.unitId,'blue_MID');
});

test('PvP 1x1 com cinco campeões para cada jogador e sem dez assentos humanos',()=>{const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest});const duel=reg.create(2);duel.room.join();assert.equal(duel.room.players.length,2);assert.equal(duel.room.gateway.seats.get('p1').unitIds.length,5);assert.equal(duel.room.gateway.seats.get('p2').unitIds.length,5);assert.throws(()=>reg.create(10),/pvp_exige_dois_jogadores/);});

const srv=createPvPServerV453Dev47({registry,checkpointDir:temp,tickMs:0});const address=await srv.listen(0);const base=`http://127.0.0.1:${address.port}`;
const request=async(path,method='GET',payload=null,cookie='')=>{const headers={};if(payload!==null){headers['content-type']='application/json';headers.origin=base;}if(cookie)headers.cookie=cookie;const resp=await fetch(base+path,{method,headers,body:payload===null?undefined:JSON.stringify(payload)});return {status:resp.status,headers:resp.headers,data:await resp.json()};};
try{
 const created=await request('/api/create','POST',{maxSeats:2});assert.equal(created.status,201);
 const cc=created.headers.get('set-cookie');assert.match(cc,/HttpOnly/);assert.match(cc,/SameSite=Strict/);
 const cookie1=cc.split(';')[0];const id=created.data.roomId;
 const second=await request('/api/join','POST',{roomId:id});assert.equal(second.status,200);const cookie2=second.headers.get('set-cookie').split(';')[0];
 const firstState=await request('/api/session','GET',null,cookie1),secondState=await request('/api/session','GET',null,cookie2);
 assert.equal(firstState.data.team,'blue');assert.equal(secondState.data.team,'red');assert.equal(firstState.data.started,true);n++;console.log('✓ dev47 dois clientes HTTP conectados à mesma sala');
 const malformed=await request('/api/action','POST',{sequence:1,kind:'order.move',payload:{point:{x:2,y:.5}}},cookie1);assert.equal(malformed.status,409);n++;console.log('✓ dev47 rejeita geometria inválida');
 const move=await request('/api/action','POST',{sequence:1,kind:'order.move',payload:{point:{x:firstState.data.projection.units.find(u=>u.id==='blue_MID').x,y:firstState.data.projection.units.find(u=>u.id==='blue_MID').y}}},cookie1);assert.equal(move.status,200,JSON.stringify(move.data));n++;console.log('✓ dev47 entrada HTTP autoritativa');
 const stolen=await request('/api/action','POST',{sequence:2,kind:'order.attack',payload:{targetId:'blue_MID'}},cookie2);assert.equal(stolen.status,409);n++;console.log('✓ dev47 bloqueio de alvo não permitido');
 const intruder=await request('/api/session');assert.equal(intruder.status,401);n++;console.log('✓ dev47 acesso não autenticado bloqueado');
 const origin=await fetch(base+'/api/ready',{method:'POST',headers:{'content-type':'application/json',origin:'https://evil.invalid',cookie:cookie1},body:'{}'});assert.equal(origin.status,403);n++;console.log('✓ dev47 bloqueio cross-origin');
 const firstLock=await request('/api/ready','POST',{},cookie1);assert.equal(firstLock.status,200);const secondLock=await request('/api/ready','POST',{},cookie2);assert.equal(secondLock.status,200);const st=await request('/api/session','GET',null,cookie1);assert.equal(st.data.phase,'executing');n++;console.log('✓ dev47 pronto de ambos conecta ordem à rodada');
 const html=await fetch(base+'/multiplayer.html');assert.equal(html.status,200);assert.match(await html.text(),/Confirmar turno/);const leak=await fetch(base+'/.git/config');assert.equal(leak.status,404);n++;console.log('✓ dev47 cliente público e diretórios privados não servidos');
 // SSE emits the perspective for the cookie owner, not Arena.snapshotV40.
 const controller=new AbortController();const es=await fetch(base+'/api/stream',{headers:{cookie:cookie1},signal:controller.signal});assert.equal(es.status,200);const reader=es.body.getReader();const first=await reader.read();const frame=new TextDecoder().decode(first.value);assert.match(frame,/event: state/);assert.ok(!frame.includes('rngState'));controller.abort();n++;console.log('✓ dev47 SSE privado por sessão');
}finally{await srv.close();rmSync(temp,{recursive:true,force:true});}
console.log(`DEV47 ${n}/${n} PASS`);
