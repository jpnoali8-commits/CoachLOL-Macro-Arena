/** CoachLOL dev47: two browser sessions, one authoritative deterministic match.
 * The room never sends Arena snapshots/RNG or enemy private state to clients.
 */
import {randomBytes,createHash} from 'node:crypto';
import {mkdirSync,writeFileSync,renameSync,readdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {Arena} from '../engine.mjs';
import {AuthoritativeActionsV453Dev47} from './authoritative_actions_v453_dev47.mjs';
const newId=(bytes=12)=>randomBytes(bytes).toString('hex');
const hash=s=>createHash('sha256').update(s).digest('hex');
const ROLES=['MID','TOP','JG','ADC','SUP'];
const defaults=[['blue','MID'],['red','MID']];
export class PvPRoomV453Dev47 {
 constructor({id,arena,maxSeats=2,checkpointPath=null,restored=null}){
  if(maxSeats!==2)throw Error('pvp_exige_dois_jogadores_um_por_equipe');
  this.id=id;this.arena=arena;this.maxSeats=maxSeats;this.checkpointPath=checkpointPath;
  this.assignments=defaults;
  this.players=restored?.players||[];this.ready=new Set(restored?.ready||[]);this.revision=restored?.revision||0;
  this.gateway=null;this.gatewayCheckpoint=restored?.gateway||null;this.lastStateAt=0;
  this.subscribers=new Set();
  if(this.players.length===this.maxSeats)this.buildGateway();
 }
 get started(){return this.players.length===this.maxSeats;}
 buildGateway(){const seats=this.players.map(p=>({seatId:p.seatId,unitId:p.unitId,
   // Um jogador humano controla todos os cinco campeoes da sua equipe.
   unitIds:ROLES.map(role=>`${p.team}_${role}`)}));this.gateway=new AuthoritativeActionsV453Dev47(this.arena,seats,{restoredState:this.gatewayCheckpoint});this.gatewayCheckpoint=null;}
 join(){if(this.started)throw Error('sala_lotada');
  const seatId='p'+(this.players.length+1),[team,role]=this.assignments[this.players.length];
  const token=newId(32),p={seatId,team,role,unitId:`${team}_${role}`,tokenHash:hash(token)};
  this.players.push(p);if(this.started){this.buildGateway();this.arena.mode='pvp';}
  this.revision++;this.persist();this.broadcast();return {token,player:p};
 }
 authenticate(token){if(typeof token!=='string'||token.length!==64||!/^[0-9a-f]+$/.test(token))return null;
  const dig=hash(token);return this.players.find(p=>p.tokenHash===dig)||null;}
 publicInfo(p){return {roomId:this.id,maxSeats:this.maxSeats,connected:this.players.length,seatId:p.seatId,unitId:p.unitId,team:p.team,role:p.role,round:this.arena.round,phase:this.arena.phase,ready:[...this.ready],started:this.started,nextSequence:(this.gateway?.seats.get(p.seatId)?.lastSequence||0)+1,revision:this.revision,paused:!!this.arena.pendingDecision,pendingDecision:this.gateway?.seats.get(p.seatId)?.unitIds.includes(this.arena.pendingDecision?.unitId)?{kind:this.arena.pendingDecision.kind,unitId:this.arena.pendingDecision.unitId,enemyId:this.arena.pendingDecision.enemyId}:null,ended:!!this.arena.ended,winner:this.arena.ended?this.arena.winner:null};}
 view(p){if(!p)return null;const data=this.started?this.gateway.view(p.seatId):null;
  if(data){
   // Only owner's champions: never disclose opponents' inventory or shop distance.
   data.shopUndoAvailableV453Dev61=Object.fromEntries(data.controlledUnitIds.map(id=>{const r=this.arena.canUndoShopV453Dev61(p.team,id);return [id,r.ok?{kind:r.kind,itemId:r.itemId,amount:r.amount}:null];}));
   data.shopUndoStateV453Dev62=Object.fromEntries(data.controlledUnitIds.map(id=>{const r=this.arena.canUndoShopV453Dev61(p.team,id);return [id,r.ok?{ok:true,kind:r.kind,itemId:r.itemId,amount:r.amount}:{ok:false,reason:r.reason||'Desfazer indisponível'}];}));
   // Only authenticated owners receive active recast slots. Never expose
   // opposing charge coordinates, timer IDs or private board plans.
   data.boardRecastsV453Dev69=Object.fromEntries(data.controlledUnitIds.map(id=>
    [id,(this.arena.boardTemporalV453Dev69||[]).filter(z=>z.ownerId===id&&
     z.team===p.team&&z.kind==='satchel_charge'&&z.until>=this.arena.gameTime)
     .map(z=>({slot:'W',expiresAt:z.until}))]));
   data.shopInRangeV453Dev60=Object.fromEntries(data.controlledUnitIds.map(id=>{
    const u=this.arena.units.find(x=>x.id===id&&x.team===p.team);
    const shop=this.arena.map.objects.find(x=>x.id===p.team+'_spawn_shop');
    return [id,!!(u&&(u.hp<=0||(shop&&this.arena.mapDistance(u,shop)<=1125)))];
   }));
  }
  return {...this.publicInfo(p),projection:data};}
 command(p,command){if(!this.started)return {ok:false,reason:'aguardando_jogadores'};
  // A network retry of a committed packet must return the existing receipt
  // even after the reaction resumed, the turn locked or the Nexus fell.
  // The gateway checks canonical bytes + seat ownership; this never replays
  // damage, a shop operation or a reaction.
  const seat=this.gateway?.seats.get(p.seatId);
  if(seat&&Number.isSafeInteger(command?.sequence)&&command.sequence>0&&command.sequence<=seat.lastSequence)
   return this.gateway.submit(p.seatId,command);
  const reaction=['decision.duel','decision.reaction'].includes(command?.kind)||(command?.kind==='item.activate'&&this.arena.phase==='decision');
  if((!reaction&&(this.ready.has(p.seatId)||this.arena.phase==='executing'||this.arena.pendingDecision))||(reaction&&this.arena.phase!=='decision'))return {ok:false,reason:'turno_bloqueado'};
  const result=this.gateway.submit(p.seatId,command);if(result.ok){this.revision++;this.persist();this.broadcast();}return result;}
 confirm(p){if(!this.started)return {ok:false,reason:'aguardando_jogadores'};
  if(this.arena.pendingDecision)return {ok:false,reason:'decisao_pendente'};
  if(!['preparation','planning'].includes(this.arena.phase)||this.ready.has(p.seatId))return {ok:false,reason:'confirmacao_indisponivel'};
  this.ready.add(p.seatId);this.revision++;
  if(this.ready.size===this.maxSeats){
   // Unit owners lock first; both teams are committed simultaneously.
   this.arena.teams.blue.ready=true;this.arena.teams.red.ready=true;
   const r=this.arena.playTurn({autoStarter:false});
   if(!r.ok){this.arena.teams.blue.ready=false;this.arena.teams.red.ready=false;this.ready.delete(p.seatId);return r;}
   this.ready.clear();
  }
  this.persist();this.broadcast();return {ok:true,revision:this.revision,phase:this.arena.phase};
 }
 /** The server, never the browser, advances the world. */
 advance(seconds=1){if(this.arena.phase!=='executing'||this.arena.pendingDecision||this.arena.ended)return {ok:false,reason:'sem_execucao'};
  const r=this.arena.continueExecution(Math.min(5,Math.max(1,Math.trunc(seconds))));this.revision++;this.persist();this.broadcast();return r;
 }
 subscribe(p,send){const sub={seatId:p.seatId,send};this.subscribers.add(sub);send(this.view(p));return ()=>this.subscribers.delete(sub);}
 broadcast(){for(const sub of [...this.subscribers]){const p=this.players.find(p=>p.seatId===sub.seatId);if(!p)continue;try{sub.send(this.view(p));}catch{this.subscribers.delete(sub);}}}
 checkpoint(){return {schema:'coachlol.pvp-room.v1',id:this.id,maxSeats:this.maxSeats,players:this.players,ready:[...this.ready],revision:this.revision,gateway:this.gateway?.exportSession()||this.gatewayCheckpoint,arena:this.arena.snapshotV40()};}
 persist(){if(!this.checkpointPath)return;const file=this.checkpointPath,temporary=file+'.new';writeFileSync(temporary,JSON.stringify(this.checkpoint()));renameSync(temporary,file);}
}
export class PvPRoomRegistryV453Dev47 {
 constructor({map,mask,manifest=null,checkpointDir=null,maxRooms=24}){this.map=structuredClone(map);this.mask=mask;
  if(manifest){this.map.riftBaseFeaturesV452d4=manifest.baseFeatures;this.map.riftBundlesV452d4=manifest.variants;}
  this.checkpointDir=checkpointDir;this.maxRooms=maxRooms;this.rooms=new Map();if(checkpointDir){mkdirSync(checkpointDir,{recursive:true});this.load();}}
 create(maxSeats=2){if(maxSeats!==2)throw Error('pvp_exige_dois_jogadores_um_por_equipe');if(this.rooms.size>=this.maxRooms)throw Error('limite_de_salas');
  let id;do{id=newId(4)}while(this.rooms.has(id));const arena=new Arena(this.map,this.mask,{mode:'pvp',seed:Math.floor(Math.random()*999999)+1});
  const room=new PvPRoomV453Dev47({id,arena,maxSeats,checkpointPath:this.checkpointDir&&join(this.checkpointDir,id+'.json')});this.rooms.set(id,room);const {token,player}=room.join();return {room,token,player};
 }
 get(id){return typeof id==='string'?this.rooms.get(id):undefined;}
 session(token){for(const room of this.rooms.values()){const player=room.authenticate(token);if(player)return {room,player};}return null;}
 load(){for(const file of readdirSync(this.checkpointDir).filter(f=>/^[0-9a-f]{8}\.json$/.test(f))){
  try{const obj=JSON.parse(readFileSync(join(this.checkpointDir,file),'utf8'));if(obj.schema!=='coachlol.pvp-room.v1'||obj.id!==file.slice(0,8))continue;
   const arena=Arena.fromSnapshotV40(this.map,this.mask,obj.arena);arena.mode='pvp';const room=new PvPRoomV453Dev47({id:obj.id,arena,maxSeats:obj.maxSeats,checkpointPath:join(this.checkpointDir,file),restored:obj});this.rooms.set(obj.id,room);
  }catch(err){process.stderr.write(`dev47 checkpoint ignorado ${file}: ${err.message}\n`);}
 }}
 advanceAll(){for(const room of this.rooms.values())if(room.started&&room.arena.phase==='executing')room.advance(1);}
}
