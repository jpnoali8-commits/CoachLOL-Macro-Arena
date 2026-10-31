/**
 * M45 B02 Skills S19 — source-executed dual-seat PvP route + SSE regression.
 *
 * Expects injected ORIGINAL Arena/PvPRoom/createPvPServerV453Dev47 functions,
 * real map and masks, and strict assert. Does NOT implement a new engine.
 *
 * A mocked http.createServer, fake URL router, deterministic token-to-seat
 * fixture registry and inert heartbeat are used in the V8-only executor.
 * Real original HTTP HANDLER is executed, including /api/session,
/api/stream,
 * /api/action, room.view(), gateway and Arena combat damage/reactions.
 * NO TCP socket, actual HTTP client, real cryptography or real SSE network.
 * Never describe passing assertions as Rust/WASM/native or network E2E.
 */
export async function runM45S19({
 Arena,checksumV40,PvPRoomV453Dev47,createPvPServerV453Dev47,
 map,mask,assert
}){
 let assertions=0;
 const eq=(a,b,message)=>{assert.equal(a,b,message);assertions++;};
 const ok=(v,message)=>{assert.ok(v,message);assertions++;};
 const same=(a,b,message)=>{assert.deepEqual(a,b,message);assertions++;};
 const players=[
  {seatId:'p1',team:'blue',role:'MID',unitId:'blue_MID',tokenHash:'fixture-blue'},
  {seatId:'p2',team:'red',role:'MID',unitId:'red_MID',tokenHash:'fixture-red'}
 ];
 const tokens={blue:'a'.repeat(64),red:'b'.repeat(64)};
 const cases=[];
 for(const defenderTeam of ['blue','red'])
 for(const attackerKind of ['Neeko','Shaco']){
  const attackerTeam=defenderTeam==='blue'?'red':'blue';
  const arena=new Arena(map,mask,{seed:1919,mode:'pvp',
   draft:{[attackerTeam]:{TOP:'Neeko',MID:'Shaco'},[defenderTeam]:{MID:'Ahri'}}});
  for(const u of arena.units)Object.assign(u,{
   x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
  const neeko=arena.units.find(u=>u.id===attackerTeam+'_TOP'),
   shaco=arena.units.find(u=>u.id===attackerTeam+'_MID'),
   defender=arena.units.find(u=>u.id===defenderTeam+'_MID');
  for(const u of [neeko,shaco,defender])Object.assign(u,{
   hp:1500,maxHp:1500,level:6,mana:1000,maxMana:1000,
   skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
  Object.assign(neeko,{x:.51,y:.5});
  Object.assign(shaco,{x:.52,y:.5});
  Object.assign(defender,{x:.49,y:.5});
  arena.canSeePoint=()=>true;
  eq(arena.queueNeekoDisguiseV453M15(attackerTeam,neeko.id,shaco.id).ok,true,
   'real Neeko disguise');
  eq(arena.queueKitSkillV42(attackerTeam,shaco.id,'R',
   {x:.54,y:.5}).ok,true,'real Shaco R enqueue');
  arena.resolveBoardSkillsV453Dev69();
  const shacoClone=arena.boardSummonsV453Dev69.find(s=>s.kind==='shaco_clone');
  ok(shacoClone,'Shaco R created a clone');
  eq(arena.units.length,10,'no cloned roster slot');
  const attacker=attackerKind==='Neeko'?neeko:shaco;
  const alias=attackerKind==='Neeko'?neeko.neekoDisguiseV453M15.publicId:
   shaco.shacoPublicAliasV453M15;
  ok(alias.startsWith('appearance_'),'server public alias exists');
  // IMPORTANT: an actual original damage hit records the duel's first hit.
  // The normal tick orchestration phase is staged to decision manually;
  // no complete naturally paced turn/HTTP E2E is being claimed.
  arena.gameTime=2;
  eq(arena.duelPermission(attacker,defender),true,'legitimate duel visibility');
  const actualDamage=arena.damage(defender,65,attacker,'physical','basic');
  ok(actualDamage>0,'genuine original Arena.damage caused defender hit');
  const request=arena.duelRequests[arena.duelKey(attacker,defender)];
  eq(request.firstHitAt,2,'actual combat marked firstHitAt');
  arena.gameTime=3;
  arena.processAmbushResponses();
  eq(arena.pendingDecision?.unitId,defender.id,
   'real original reaction processor selected defender');
  eq(arena.pendingDecision?.enemyId,attacker.id,
   'real original reaction processor selected attacker');
  arena.phase='decision'; // normally orchestrated by authoritative turn
  const room=new PvPRoomV453Dev47({
   id:'19191919',arena,maxSeats:2,restored:{players:structuredClone(players)}
  });
  const registry={
   currentRoom:room,
   rooms:new Map([[room.id,room]]),
   session(token){
    const seat=token===tokens.blue?'blue':token===tokens.red?'red':null;
    if(!seat)return null;
    const player=this.currentRoom.players.find(p=>p.team===seat);
    return player?{room:this.currentRoom,player}:null;
   }
  };
  const exposed=createPvPServerV453Dev47({registry,tickMs:0});
  ok(typeof exposed.server.handler==='function',
   'actual source createServer handler captured');
  async function transport(seat,path,method='GET',payload=null){
   const token=tokens[seat]||null;
   const req={method,url:path,headers:{
    host:'localhost',...(token?{cookie:'coachlol_pvp47='+token}:{})
   },async *[Symbol.asyncIterator](){
    if(payload!==null)yield JSON.stringify(payload);
   }};
   const res={status:null,headers:{},writes:[],ended:false,body:null,
    listeners:{},destroyed:false,
    setHeader(k,v){this.headers[k]=v},
    writeHead(status,headers){this.status=status;Object.assign(this.headers,headers)},
    end(data){this.ended=true;this.body=data??null},
    write(data){this.writes.push(data);return true},
    on(event,fn){this.listeners[event]=fn}
   };
   await exposed.server.handler(req,res);
   return {response:res,status:res.status,
    json:res.body?JSON.parse(res.body):null,
    stateEvents:()=>res.writes.filter(x=>x.startsWith('event: state\n'))
      .map(x=>JSON.parse(x.slice('event: state\ndata: '.length).trim()))
   };
  }
  const valid=await transport(defenderTeam,'/api/session');
  eq(valid.status,200,'original server GET /api/session');
  const publicEnemy=valid.json.projection.units.find(u=>u.id===alias);
  ok(publicEnemy,'opponent public projection correctly uses mask alias');
  ok(!valid.json.projection.units.some(u=>u.id===attacker.id),
   'opponent internal actor ID does not appear as unit');
  eq(valid.json.pendingDecision.enemyId,attacker.id,
   'P1 SOURCE BUG: room metadata exposes stable enemy ID');
  const adversary=await transport(attackerTeam,'/api/session');
  eq(adversary.status,200,'other seat authenticates via fixture registry');
  eq(adversary.json.pendingDecision,null,'reaction window only defender seat');
  const guest=await transport(null,'/api/session');
  eq(guest.status,401,'anonymous request rejected');
  eq(guest.json.reason,'sessao_ausente','no mock token in cookie');
  const streaming=await transport(defenderTeam,'/api/stream');
  eq(streaming.status,200,'original server /api/stream handler');
  eq(streaming.response.headers['content-type'],
   'text/event-stream; charset=utf-8','SSE media type');
  eq(streaming.stateEvents().length,1,'first SSE state pushed');
  eq(streaming.stateEvents()[0].pendingDecision.enemyId,attacker.id,
   'P1 BUG also serialized by ORIGINAL SSE route');
  const otherStream=await transport(attackerTeam,'/api/stream');
  eq(otherStream.stateEvents()[0].pendingDecision,null,
   'SSE to opposite seat excludes defender decision');
  arena.canSeePoint=()=>false;
  arena.gameTime=5; // actual hit gives 2s reveal; wait until it expires
  room.broadcast();
  eq(streaming.stateEvents().length,2,'SSE broadcast after fog update');
  eq(streaming.stateEvents()[1].pendingDecision.enemyId,attacker.id,
   'P1 BUG persisted after synthetic fog loss in SSE');
  const fogView=await transport(defenderTeam,'/api/session');
  eq(fogView.json.pendingDecision.enemyId,attacker.id,
   'P1 BUG also persisted after synthetic fog loss in session');
  ok(!fogView.json.projection.units.some(u=>u.id===alias),
   'fog mask removes public enemy alias from unit view');
  // Reconnect after arena + authenticated gateway checkpoint. No real disk.
  const cp=room.checkpoint();
  const loaded=Arena.fromSnapshotV40(map,mask,cp.arena);
  eq(checksumV40(cp.arena),checksumV40(loaded.snapshotV40()),
   'full Arena snapshot restored with exact checksum');
  loaded.canSeePoint=()=>false;
  const resumed=new PvPRoomV453Dev47({id:cp.id,arena:loaded,maxSeats:2,
   restored:cp});
  registry.currentRoom=resumed;registry.rooms.set(cp.id,resumed);
  const afterRestore=await transport(defenderTeam,'/api/session');
  eq(afterRestore.json.pendingDecision.enemyId,attacker.id,
   'P1 BUG still on source restored room');
  same(afterRestore.json.projection,fogView.json.projection,
   'source public projection preserved on reconnect');
  const streamRestored=await transport(defenderTeam,'/api/stream');
  eq(streamRestored.stateEvents()[0].pendingDecision.enemyId,attacker.id,
   'P1 BUG also on reconnected SSE subscription');
  // Show actual gateway authorization: even when a stable enemyId was leaked,
  // sending that concealed ID is DENIED by the current authoritative gateway.
  loaded.canSeePoint=()=>true;
  const forged=await transport(defenderTeam,'/api/action','POST',{
   sequence:1,kind:'decision.reaction',unitId:defender.id,
   payload:{targetId:attacker.id,response:'fight',steps:[]}
  });
  eq(forged.status,409,'forged stable target rejected by actual route');
  eq(forged.json.reason,'alvo_identidade_oculta',
   'gateway forbids leaked concealed stable ID as reaction target');
  const allowed=await transport(defenderTeam,'/api/action','POST',{
   sequence:1,kind:'decision.reaction',unitId:defender.id,
   payload:{targetId:alias,response:'fight',steps:[]}
  });
  eq(allowed.status,200,'server dispatch accepts authorized public alias');
  eq(allowed.json.ok,true,'real gateway processed defender reaction');
  eq(loaded.pendingDecision,null,'authorized reaction closes window');
  eq(resumed.gateway.seats.get(players.find(p=>p.team===defenderTeam).seatId).lastSequence,
   1,'only successful command consumes sequence');
  const idempotent=await transport(defenderTeam,'/api/action','POST',{
   sequence:1,kind:'decision.reaction',unitId:defender.id,
   payload:{targetId:alias,response:'fight',steps:[]}
  });
  same(idempotent.json,allowed.json,'retry gets same ack with no re-dispatch');
  eq(streamRestored.stateEvents().at(-1).pendingDecision,null,
   'SSE after authorized reaction no longer exposes a decision');
  for(const connection of [streaming,otherStream,streamRestored])
   connection.response.listeners.close?.();
  cases.push({defenderTeam,attackerKind,alias,stableId:attacker.id,
   actualDamage,sessionLeak:true,sseLeak:true,fogLeak:true,
   restoreLeak:true,forgedStableDenied:true,validAliasAccepted:true});
 }
 eq(cases.length,4,'four bilateral two-champion source fixtures');
 return {status:'V8_SOURCE_BUG_REPRODUCED_NOT_NETWORK_OR_RUST_PARITY',
  assertions,cases,completed:4,
  source_actual_impact_reactions:4,original_server_session_routes:4,
  original_server_sse_subscriptions:8,restored_room_sessions:4,
  forged_stable_id_rejections:4,valid_alias_reactions:4,
  live_tcp_http:'NOT_RUN',actual_cookie_crypto:'NOT_RUN',rust:'NOT_RUN',wasm:'NOT_RUN'};
}
