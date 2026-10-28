/** V4.5.3-dev63: two independently authenticated scripted clients, one
 * authoritative server, organic Nexus wins in both directions. No botPlan,
 * fake structure damage or simulated 'human actually clicked' claims. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {Arena,checksumV40} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
const report=[];let passed=0;
function check(label,fn){fn();passed++;console.log('✓ DEV63 '+label);}
for(const [seed,winner] of [[26,'blue'],[42,'red']]){
 const registry=new PvPRoomRegistryV453Dev47({map,mask,manifest});
 const srv=createPvPServerV453Dev47({registry,tickMs:0});
 const addr=await srv.listen(0),base=`http://127.0.0.1:${addr.port}`;
 const send=async(path,method='GET',payload=null,cookie='')=>{
  const resp=await fetch(base+'/api/'+path,{method,headers:{...(payload!==null?{'content-type':'application/json',origin:base}:{}),...(cookie?{cookie}:{})},body:payload!==null?JSON.stringify(payload):undefined});
  return {status:resp.status,data:await resp.json(),cookie:resp.headers.get('set-cookie')};
 };
 let room=null,blue='',red='';const decisions={},timeStart=performance.now();let rounds=0;
 try{
  const create=await send('create','POST',{maxSeats:2});assert.equal(create.status,201);
  blue=create.cookie.split(';')[0];room=registry.get(create.data.roomId);
  // Production game logic, deterministic RNG chosen by the trusted TEST harness.
  // Clients never select or control seeds; this never mutates structures or HP.
  room.arena=new Arena(registry.map,registry.mask,{seed,mode:'pvp'});
  const joined=await send('join','POST',{roomId:create.data.roomId});red=joined.cookie.split(';')[0];
  check(`${winner} seed ${seed}: duas sessões HTTP e cinco campeões cada`,()=>{
   assert.notEqual(blue,red);assert.equal(joined.data.team,'red');assert.equal(room.gateway.seats.get('p1').unitIds.length,5);assert.equal(room.gateway.seats.get('p2').unitIds.length,5);
  });
  const blueStart=await send('session','GET',null,blue),redStart=await send('session','GET',null,red);
  check(`${winner} seed ${seed}: visão privada, sem inventário inimigo`,()=>{
   assert.equal(blueStart.data.projection.units.filter(u=>u.team==='red').length,0);
   assert.equal(redStart.data.projection.units.filter(u=>u.team==='blue').length,0);
   assert.equal(Object.keys(blueStart.data.projection.shopUndoStateV453Dev62).length,5);
   assert.equal('rngState' in blueStart.data,false);
  });
  const streamAbort=new AbortController();
  const ev=await fetch(base+'/api/stream',{headers:{cookie:blue},signal:streamAbort.signal});
  const frame=new TextDecoder().decode((await ev.body.getReader().read()).value);
  check(`${winner} seed ${seed}: SSE nativo entrega perspectiva autenticada`,()=>{
   assert.equal(ev.status,200);assert.match(frame,/event: state/);
   assert.match(frame,/"team":"blue"/);assert.ok(!frame.includes('rngState'));
  });streamAbort.abort();
  const passive=winner==='blue'?'red':'blue',active=winner,passiveCookie=passive==='red'?red:blue,activeCookie=active==='blue'?blue:red;
  let passiveSeq=0,activeSeq=0;
  for(const role of ['TOP','JG','MID','ADC','SUP']){
   const stop=await send('action','POST',{sequence:++passiveSeq,unitId:`${passive}_${role}`,kind:'order.stop',payload:{}},passiveCookie);
   assert.equal(stop.status,200,JSON.stringify(stop.data));
  }
  check(`${winner} seed ${seed}: um jogador comanda as cinco unidades (HOLD)`,()=>{
   for(const role of ['TOP','JG','MID','ADC','SUP']){
    assert.equal(room.arena.units.find(u=>u.id===`${passive}_${role}`).order.kind,'hold');
   }
  });
  const wrong=await send('action','POST',{sequence:passiveSeq+1,unitId:`${active}_MID`,kind:'order.stop',payload:{}},passiveCookie);
  check(`${winner} seed ${seed}: sem controle da equipe inimiga`,()=>assert.equal(wrong.data.reason,'unidade_nao_autorizada'));
  const up=await send('action','POST',{sequence:++activeSeq,unitId:`${active}_MID`,kind:'skill.upgrade',payload:{slot:'Q'}},activeCookie);
  check(`${winner} seed ${seed}: ação QWER enviada pelo cliente à unidade própria`,()=>{
   assert.equal(up.status,200,JSON.stringify(up.data));assert.equal(room.arena.units.find(u=>u.id===`${active}_MID`).skillRanks.Q,1);
  });
  const purchase=await send('action','POST',{sequence:++activeSeq,unitId:`${active}_MID`,kind:'item.buy',payload:{itemId:'boots'}},activeCookie);
  const undo=await send('action','POST',{sequence:++activeSeq,unitId:`${active}_MID`,kind:'item.undo',payload:{}},activeCookie);
  check(`${winner} seed ${seed}: compra e Desfazer privados sem ouro extra`,()=>{
   assert.equal(purchase.status,200);assert.equal(undo.status,200);
   const u=room.arena.units.find(u=>u.id===`${active}_MID`);assert.equal(u.gold,500);assert.ok(!u.items.includes('boots'));
  });
  const preTime=room.arena.gameTime,first=await send('ready','POST',{},blue);
  const midState=await send('session','GET',null,red);
  check(`${winner} seed ${seed}: uma confirmação não avança tempo`,()=>{
   assert.equal(first.status,200);assert.equal(room.arena.gameTime,preTime);assert.equal(midState.data.phase,'preparation');
  });
  const blocked=await send('action','POST',{sequence:activeSeq+1,unitId:`${active}_MID`,kind:'order.stop',payload:{}},blue);
  if(active==='blue')check(`${winner} seed ${seed}: ações bloqueadas após confirmar`,()=>assert.equal(blocked.status,409));
  const second=await send('ready','POST',{},red);
  check(`${winner} seed ${seed}: segunda confirmação começa um único turno`,()=>{
   assert.equal(second.status,200);assert.equal(room.arena.phase,'executing');
  });rounds++;
  const priorStructureHp=Object.fromEntries(room.arena.structures.map(s=>[s.id,s.hp]));
  while(!room.arena.ended&&room.arena.gameTime<2400&&rounds<95){
   if(room.arena.pendingDecision){
    const d=room.arena.pendingDecision;decisions[d.kind]=(decisions[d.kind]||0)+1;
    const side=d.unitId.startsWith('blue_')?'blue':'red',cookie=side==='blue'?blue:red;
    let seq=side==='blue'?active==='blue'?++activeSeq:++passiveSeq:active==='red'?++activeSeq:++passiveSeq;
    const kind=d.kind==='duel_request'?'decision.duel':'decision.reaction';
    const payload=d.kind==='duel_request'?{response:'defend'}:{targetId:d.enemyId,response:'defend',steps:[]};
    const r=await send('action','POST',{sequence:seq,unitId:d.unitId,kind,payload},cookie);
    assert.equal(r.status,200,`reaction ${JSON.stringify({d,r})}`);
   } else if(room.arena.phase==='executing'){
    const before=room.arena.gameTime;const result=room.advance(5);
    assert.ok(result.ok,JSON.stringify(result));assert.ok(room.arena.gameTime>before);
   } else if(room.arena.phase==='planning'){
    const l=await send('ready','POST',{},blue);const r=await send('ready','POST',{},red);
    assert.equal(l.status,200,JSON.stringify(l.data));assert.equal(r.status,200,JSON.stringify(r.data));rounds++;
   } else throw Error('fase_nao_tratada: '+room.arena.phase);
   if(room.arena.gameTime%150===0&&room.arena.phase==='planning')assert.deepEqual(room.arena.validateInvariants(),[]);
  }
  const final=await send('session','GET',null,activeCookie),opponent=await send('session','GET',null,passiveCookie);
  const dead=room.arena.structures.find(s=>s.id===`${passive}_nexus`);
  if(seed===26){
   writeFileSync(new URL('../docs/QA_EVIDENCE_V453_DEV63/final_blue_session.json',import.meta.url),JSON.stringify(final.data));
   writeFileSync(new URL('../docs/QA_EVIDENCE_V453_DEV63/final_red_session.json',import.meta.url),JSON.stringify(opponent.data));
  }
  check(`${winner} seed ${seed}: vitória NATURAL por dano no Nexus e terminalidade de turno`,()=>{
   assert.ok(room.arena.ended,'no Nexus end by 2400s');assert.equal(room.arena.winner,winner);
   assert.equal(dead.hp,0);assert.equal(dead.alive,false);assert.equal(priorStructureHp[dead.id],5500);
   assert.equal(room.arena.phase,'finished');assert.equal(room.arena.executionRemaining,0);
   assert.equal(final.data.ended,true);assert.equal(final.data.winner,winner);assert.equal(opponent.data.winner,winner);
   assert.equal(final.data.phase,'finished');assert.equal(opponent.data.phase,'finished');
   assert.ok(room.arena.roundHistory.length>=1);
  });
  check(`${winner} seed ${seed}: sem comandos/turnos extras após Nexus`,async()=>{
   const t=room.arena.gameTime;
   assert.equal((await send('ready','POST',{},activeCookie)).status,409);
   assert.equal((await send('action','POST',{sequence:activeSeq+1,unitId:`${active}_MID`,kind:'item.buy',payload:{itemId:'boots'}},activeCookie)).status,409);
   assert.equal(room.advance(5).ok,false);assert.equal(room.arena.gameTime,t);
  });
  const dir=mkdtempSync(join(tmpdir(),'coachlol-dev63-'));
  try{
   room.checkpointPath=join(dir,room.id+'.json');room.persist();
   const loaded=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:dir});const restart=createPvPServerV453Dev47({registry:loaded,tickMs:0});
   const addr2=await restart.listen(0);
   try{
    const url=`http://127.0.0.1:${addr2.port}/api/session`;
    const a=await (await fetch(url,{headers:{cookie:blue}})).json(),b=await(await fetch(url,{headers:{cookie:red}})).json();
    check(`${winner} seed ${seed}: reconexão do checkpoint preserva ambas sessões e vitória`,()=>{
     assert.equal(a.ended,true);assert.equal(b.ended,true);assert.equal(a.winner,winner);assert.equal(b.winner,winner);
     assert.equal(a.projection.time,room.arena.gameTime);
     assert.equal(checksumV40(loaded.get(room.id).arena.snapshotV40()),checksumV40(room.arena.snapshotV40()));
    });
   }finally{await restart.close();}
  }finally{room.checkpointPath=null;rmSync(dir,{recursive:true,force:true});}
  report.push({seed,winner,gameSeconds:room.arena.gameTime,rounds,decisions,deadNexus:dead.id,towerDeaths:room.arena.structures.filter(s=>s.type==='tower'&&!s.alive).map(s=>s.id),minionWaves:room.arena.waveIndex,realMs:Math.round(performance.now()-timeStart)});
 }finally{await srv.close();}
}
console.log(`DEV63 ${passed}/${passed} PASS scripted HTTP 2 sessions + real SSE + 2 natural Nexus matches`);
console.log('DEV63_REPORT '+JSON.stringify(report));
