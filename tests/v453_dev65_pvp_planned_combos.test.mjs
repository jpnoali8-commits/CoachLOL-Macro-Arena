/** Dev65: attack combos from the planning phase, authenticated for both teams. */
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
let count=0;function check(label,fn){fn();count++;console.log('✓ DEV65 '+label);}
for(const attackingTeam of ['blue','red']){
 const dir=mkdtempSync(join(tmpdir(),'coachlol-dev65-'));
 const registry=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:dir});
 let server=createPvPServerV453Dev47({registry,tickMs:0});let addr=await server.listen(0),base=`http://127.0.0.1:${addr.port}`;
 const request=async(path,payload,cookie='')=>{const r=await fetch(base+'/api/'+path,{method:payload===undefined?'GET':'POST',headers:{...(cookie?{cookie}:{}),...(payload===undefined?{}:{'content-type':'application/json',origin:base})},body:payload===undefined?undefined:JSON.stringify(payload)});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')};};
 try{
  const create=await request('create',{}),blueCookie=create.cookie.split(';')[0],room=registry.get(create.data.roomId);
  const join=await request('join',{roomId:room.id}),redCookie=join.cookie.split(';')[0];
  const ownCookie=attackingTeam==='blue'?blueCookie:redCookie,oppCookie=attackingTeam==='blue'?redCookie:blueCookie;
  const otherTeam=attackingTeam==='blue'?'red':'blue',ownId=attackingTeam+'_MID',oppId=otherTeam+'_MID';
  const own=room.arena.units.find(u=>u.id===ownId),opp=room.arena.units.find(u=>u.id===oppId);
  check(`${attackingTeam} autenticação 2 sessões`,()=>{assert.equal(room.players.length,2);assert.notEqual(blueCookie,redCookie);});
  const unauthorized=await request('action',{sequence:1,unitId:ownId,kind:'order.combo',payload:{targetId:oppId,steps:['Q']}},oppCookie);
  check(`${attackingTeam} jogador adversário não pode comandar atacante`,()=>{assert.equal(unauthorized.status,409);});
  own.x=opp.x=.5;own.y=opp.y=.5;own.autoAttack=opp.autoAttack=false;own.autoFollow=opp.autoFollow=false;
  const unlearned=await request('action',{sequence:1,unitId:ownId,kind:'order.combo',payload:{targetId:oppId,steps:['Q']}},ownCookie);
  check(`${attackingTeam} Q não aprendida rejeitada`,()=>{assert.equal(unlearned.status,409);assert.equal(own.order.kind,'auto');});
  const upgrade=await request('action',{sequence:1,unitId:ownId,kind:'skill.upgrade',payload:{slot:'Q'}},ownCookie);
  check(`${attackingTeam} upgrade pelo dono`,()=>{assert.equal(upgrade.status,200);assert.equal(own.skillRanks.Q,1);});
  const notEquipped=await request('action',{sequence:2,unitId:ownId,kind:'order.combo',payload:{targetId:oppId,steps:['EXHAUST']}},ownCookie);
  check(`${attackingTeam} feitiço não equipado rejeitado`,()=>{assert.equal(notEquipped.status,409);});
  const malformed=await request('action',{sequence:2,unitId:ownId,kind:'order.combo',payload:{targetId:oppId,steps:['Q','X']}},ownCookie);
  check(`${attackingTeam} steps inválidas rejeitadas`,()=>{assert.equal(malformed.status,409);});
  const blinded=await request('action',{sequence:2,unitId:ownId,kind:'order.combo',payload:{targetId:otherTeam+'_TOP',steps:['Q']}},ownCookie);
  check(`${attackingTeam} inimigo oculto não pode ser selecionado`,()=>{assert.equal(blinded.status,409);});
  const opponentHp=opp.hp,mana=own.mana;
  const command={sequence:2,unitId:ownId,kind:'order.combo',payload:{targetId:oppId,steps:['Q','IGNITE']}};
  const accepted=await request('action',command,ownCookie),again=await request('action',command,ownCookie);
  check(`${attackingTeam} ordem autoritativa e recibo idempotente`,()=>{assert.equal(accepted.status,200,JSON.stringify(accepted.data));assert.deepEqual(again.data,accepted.data);assert.deepEqual(own.order.combo,['Q','IGNITE']);});
  // Save real fog-filtered HTTP session for a browser-only DOM smoke.
  const uiSnapshot=await request('session',undefined,ownCookie);
  writeFileSync(new URL('../docs/QA_EVIDENCE_V453_DEV65/'+attackingTeam+'_planning_session.json',import.meta.url),JSON.stringify(uiSnapshot.data));
  room.persist();
  await server.close();const restored=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:dir});const loaded=restored.get(room.id);
  server=createPvPServerV453Dev47({registry:restored,tickMs:0});addr=await server.listen(0);base=`http://127.0.0.1:${addr.port}`;
  check(`${attackingTeam} reconnect antes do commit`,()=>{assert.deepEqual(loaded.arena.units.find(u=>u.id===ownId).order.combo,['Q','IGNITE']);assert.equal(loaded.gateway.seats.get(attackingTeam==='blue'?'p1':'p2').lastSequence,2);});
  const blueReady=await request('ready',{},blueCookie),redReady=await request('ready',{},redCookie);
  check(`${attackingTeam} dois jogadores confirmam simultaneamente`,()=>{assert.equal(blueReady.status,200);assert.equal(redReady.status,200);assert.equal(loaded.arena.phase,'executing');});
  const actor=loaded.arena.units.find(u=>u.id===ownId),victim=loaded.arena.units.find(u=>u.id===oppId);
  const t1=loaded.advance(1);
  check(`${attackingTeam} Q gasta mana e causa dano`,()=>{assert.equal(t1.ok,true,JSON.stringify(t1));assert.equal(actor.order.comboIndex,1);assert.ok(actor.mana<mana);assert.ok(victim.hp<opponentHp);assert.ok(actor.skillCds.Q>loaded.arena.gameTime);});
  let n=0;while(actor.order.comboIndex<2&&n++<8){
   if(loaded.arena.pendingDecision){const d=loaded.arena.pendingDecision;const cookie=d.unitId.startsWith('blue_')?blueCookie:redCookie;const seq=loaded.gateway.seats.get(d.unitId.startsWith('blue_')?'p1':'p2').lastSequence+1;const reply=await request('action',{sequence:seq,unitId:d.unitId,kind:'decision.reaction',payload:{targetId:d.enemyId,response:'defend',steps:[]}},cookie);assert.equal(reply.status,200,JSON.stringify(reply.data));}
   if(loaded.arena.phase==='executing'&&!loaded.arena.pendingDecision)loaded.advance(1);
  }
  check(`${attackingTeam} IGNITE efetivo após janela de reação`,()=>{assert.equal(actor.order.comboIndex,2,JSON.stringify({status:actor.order.comboStatus,phase:loaded.arena.phase,pending:loaded.arena.pendingDecision}));assert.ok(actor.igniteCd>loaded.arena.gameTime);assert.ok(loaded.arena.delayedEffects.some(x=>x.kind==='ignite_dot'&&x.targetId===oppId));});
  const igniteJournal=loaded.arena.actionJournalV40.filter(e=>e.kind==='summoner'&&e.type==='ignite'&&e.actorId===ownId);
  check(`${attackingTeam} commit único de feitiço`,()=>{assert.equal(igniteJournal.length,1);assert.equal(igniteJournal[0].source,'combo');});
  const ownPerspective=await request('session',undefined,ownCookie),oppPerspective=await request('session',undefined,oppCookie);
  check(`${attackingTeam} snapshots privados por equipe`,()=>{assert.equal(ownPerspective.status,200);assert.equal(oppPerspective.status,200);assert.equal(ownPerspective.data.team,attackingTeam);assert.equal(oppPerspective.data.team,otherTeam);});
 }finally{await server.close();rmSync(dir,{recursive:true,force:true});}
}
console.log(`DEV65 ${count}/${count} PASS`);
