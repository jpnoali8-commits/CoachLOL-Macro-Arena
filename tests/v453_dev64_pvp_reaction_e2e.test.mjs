/** Dev64 — real hit -> manual reaction on BOTH teams -> checkpoint -> retry.
 * A controlled test fixture places two MID units close enough for a real
 * engine.attack() impact. Clients perform all reactions through HTTP. This is
 * not a claim of full match played by humans or of complete QWER kit parity.
 */
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {checksumV40} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
let count=0;function check(name,fn){fn();count++;console.log('✓ DEV64 '+name);}
for(const defending of ['blue','red']){
 const dir=mkdtempSync(join(tmpdir(),'coachlol-dev64-'));
 const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:dir});
 let server=createPvPServerV453Dev47({registry:reg,tickMs:0});
 let addr=await server.listen(0),base=`http://127.0.0.1:${addr.port}`;
 const query=async(path,method='GET',payload=null,cookie='')=>{
  const response=await fetch(base+'/api/'+path,{method,headers:{...(cookie?{cookie}:{}),...(payload===null?{}:{'content-type':'application/json',origin:base})},body:payload===null?undefined:JSON.stringify(payload)});
  return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')};
 };
 try{
  const first=await query('create','POST',{}),blueCookie=first.cookie.split(';')[0],room=reg.get(first.data.roomId);
  const second=await query('join','POST',{roomId:first.data.roomId}),redCookie=second.cookie.split(';')[0];
  const defenderCookie=defending==='blue'?blueCookie:redCookie;
  const attackerCookie=defending==='blue'?redCookie:blueCookie;
  const attackerId=`${defending==='blue'?'red':'blue'}_MID`,defenderId=`${defending}_MID`;
  const defender=room.arena.units.find(u=>u.id===defenderId),attacker=room.arena.units.find(u=>u.id===attackerId);
  check(`${defending} autenticação independente`,()=>{assert.notEqual(blueCookie,redCookie);assert.equal(room.players.length,2);});
  const upgrade=await query('action','POST',{sequence:1,unitId:defenderId,kind:'skill.upgrade',payload:{slot:'Q'}},defenderCookie);
  check(`${defending} Q aprendida pelo dono`,()=>{assert.equal(upgrade.status,200);assert.ok(defender.skillRanks.Q>0);});
  // Spatial proximity is a test-only setup. No invented impact, no direct
  // modification of HP, shield, duelRequests or pendingDecision.
  defender.x=attacker.x=.5;defender.y=attacker.y=.5;
  assert.equal((await query('ready','POST',{},blueCookie)).status,200);
  assert.equal((await query('ready','POST',{},redCookie)).status,200);
  const before=defender.hp;
  assert.equal(room.arena.duelPermission(attacker,defender),true);
  room.arena.attack(attacker,defender,25,'basic');
  check(`${defending} impacto real no motor`,()=>{assert.ok(defender.hp<before);assert.ok(Object.values(room.arena.duelRequests).some(r=>r.responder===defenderId&&r.firstHitAt===0));});
  const advanced=room.advance(1);
  check(`${defending} pausa no impacto posterior sem resolução automática`,()=>{
   assert.equal(advanced.paused,true);assert.equal(room.arena.phase,'decision');assert.equal(room.arena.pendingDecision.unitId,defenderId);
   assert.equal(room.arena.pendingDecision.kind,'combat_reaction');
  });
  const blueV=await query('session','GET',null,blueCookie),redV=await query('session','GET',null,redCookie);
  const own=defending==='blue'?blueV:redV,enemy=defending==='blue'?redV:blueV;
  check(`${defending} janela de reação privada`,()=>{
   assert.equal(own.data.pendingDecision.unitId,defenderId);assert.equal(enemy.data.pendingDecision,null);
   assert.equal(own.data.paused,true);assert.equal(enemy.data.paused,true);
   assert.equal(own.data.team,defending);
  });
  writeFileSync(new URL(`../docs/QA_EVIDENCE_V453_DEV64/${defending}_owner_pending.json`,import.meta.url),JSON.stringify(own.data));
  writeFileSync(new URL(`../docs/QA_EVIDENCE_V453_DEV64/${defending}_opponent_pending.json`,import.meta.url),JSON.stringify(enemy.data));
  const inactive=await query('action','POST',{sequence:1,unitId:attackerId,kind:'decision.reaction',payload:{targetId:defenderId,response:'fight',steps:[]}},attackerCookie);
  check(`${defending} atacante não pode responder pela vítima`,()=>{assert.equal(inactive.status,409);assert.equal(room.arena.pendingDecision.unitId,defenderId);});
  check(`${defending} checkpoint conserva decisão pendente`,()=>{room.persist();assert.ok(checksumV40(room.arena.snapshotV40()));});
  await server.close();
  const restored=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:dir});
  const loaded=restored.get(room.id);
  check(`${defending} reconexão no meio do combate conserva a pausa`,()=>{
   assert.ok(loaded);assert.equal(loaded.arena.pendingDecision.unitId,defenderId);assert.equal(loaded.arena.phase,'decision');
   assert.equal(loaded.gateway.seats.get(defending==='blue'?'p1':'p2').lastSequence,1);
  });
  server=createPvPServerV453Dev47({registry:restored,tickMs:0});addr=await server.listen(0);base=`http://127.0.0.1:${addr.port}`;
  const restoredOwner=await query('session','GET',null,defenderCookie);
  check(`${defending} jogador pode reconectar sem consumir resposta`,()=>{assert.equal(restoredOwner.status,200);assert.equal(restoredOwner.data.pendingDecision.unitId,defenderId);});
  const invalid=await query('action','POST',{sequence:2,unitId:defenderId,kind:'decision.reaction',payload:{targetId:attackerId,response:'fight',steps:['R']}},defenderCookie);
  check(`${defending} R não aprendida recusada sem consumir sequência`,()=>{assert.equal(invalid.status,409);assert.match(invalid.data.reason,/não aprendida/);assert.equal(loaded.gateway.seats.get(defending==='blue'?'p1':'p2').lastSequence,1);});
  const command={sequence:2,unitId:defenderId,kind:'decision.reaction',payload:{targetId:attackerId,response:'defend',steps:['Q']}};
  const answer=await query('action','POST',command,defenderCookie);
  check(`${defending} resposta Q manual retoma execução`,()=>{
   assert.equal(answer.status,200,JSON.stringify(answer.data));assert.equal(loaded.arena.pendingDecision,null);assert.equal(loaded.arena.phase,'executing');
   assert.deepEqual(loaded.arena.units.find(u=>u.id===defenderId).reactionCombo.combo,['Q']);
   assert.equal(Object.values(loaded.arena.duelRequests).find(r=>r.responder===defenderId)?.state,'ready');
  });
  const digest=checksumV40(loaded.arena.snapshotV40());
  const retry=await query('action','POST',command,defenderCookie),tampered=await query('action','POST',{...command,payload:{...command.payload,steps:['W']}},defenderCookie);
  check(`${defending} retry não duplica efeito nem permite alterar comando`,()=>{
   assert.equal(retry.status,200);assert.deepEqual(retry.data,answer.data);assert.equal(tampered.status,409);
   assert.equal(tampered.data.reason,'sequencia_reutilizada_com_dados_diferentes');
   assert.equal(checksumV40(loaded.arena.snapshotV40()),digest);
  });
  const tick=loaded.advance(1);
  check(`${defending} jogo avança novamente no servidor e consome Q`,()=>{
   assert.ok(tick.ok,JSON.stringify(tick));assert.ok(loaded.arena.gameTime>1);
   const queued=loaded.arena.units.find(u=>u.id===defenderId).reactionCombo;
   assert.equal(queued?.comboIndex,1);assert.equal(queued?.comboStatus,'concluído');
  });
 }finally{await server.close();rmSync(dir,{recursive:true,force:true});}
}
console.log(`DEV64 ${count}/${count} PASS`);
