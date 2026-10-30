/**
 * M45 PLATFORM-A12 — isolated QA reference for an atomic multi-champion text batch.
 * This is NOT production Rust, not a secure API, and not durable crash-safe commit.
 * The original engine/parser run on a staged Arena; no original state is modified
 * when any action fails. The entire staged Arena is swapped once on success.
 */
const fail=reason=>({ok:false,reason});
export class AtomicTextBatchReference {
 constructor({Arena,interpretCommands,applyCommands,map,mask,beforeApply=null}){
  if(!Arena||!interpretCommands||!applyCommands||!map||!mask)throw Error('dependencies_missing');
  Object.assign(this,{Arena,interpretCommands,applyCommands,map,mask,beforeApply});
  this.drafts=new Map();this.nextDraft=1;
 }
 seat(room,auth){
  if(!room?.started||!auth?.seatId)return null;
  const p=room.players.find(p=>p.seatId===auth.seatId);
  return p&&p.team===auth.team&&p.unitId===auth.unitId&&room.gateway?.seats.has(p.seatId)?p:null;
 }
 block(room,seat){
  if(!seat)return 'assento_nao_autenticado';
  if(!['planning','preparation'].includes(room.arena.phase)||room.arena.ended||room.arena.pendingDecision)return 'fase_bloqueada';
  if(room.ready.has(seat.seatId)||room.arena.teams[seat.team]?.ready)return 'turno_bloqueado';
  return null;
 }
 preview(room,auth,text){
  const seat=this.seat(room,auth),blocked=this.block(room,seat);
  if(blocked)return fail(blocked);
  if(typeof text!=='string'||!text.trim()||text.length>1800)return fail('texto_invalido');
  const parsed=this.interpretCommands(text,room.arena,{team:seat.team,selectedId:seat.unitId});
  if(!parsed.ok)return {ok:false,reason:'plano_invalido'};
  const ops=parsed.commands.flatMap(cmd=>cmd.actions.map(action=>({role:cmd.role,action})));
  if(!ops.length||ops.some(x=>!room.gateway.seats.get(seat.seatId).unitIds.includes(seat.team+'_'+x.role)))
   return fail('sem_unidades_autorizadas');
  const id='a12-'+this.nextDraft++;
  this.drafts.set(id,{seatId:seat.seatId,team:seat.team,roomId:room.id,round:room.arena.round,revision:room.revision,text,actions:ops.length,receipt:null});
  return {ok:true,draftId:id,round:room.arena.round,revision:room.revision,actionCount:ops.length,roles:[...new Set(ops.map(x=>x.role))]};
 }
 commit(room,auth,draftId){
  const seat=this.seat(room,auth);
  if(!seat)return fail('assento_nao_autenticado');
  const d=this.drafts.get(draftId);
  if(!d||d.roomId!==room.id||d.seatId!==seat.seatId||d.team!==seat.team)return fail('rascunho_nao_autorizado');
  if(d.receipt)return {...d.receipt};
  const blocked=this.block(room,seat);
  if(blocked)return fail(blocked);
  if(d.round!==room.arena.round||d.revision!==room.revision)return fail('rascunho_desatualizado');
  const staged=this.Arena.fromSnapshotV40(this.map,this.mask,room.arena.snapshotV40());
  const compiled=this.interpretCommands(d.text,staged,{team:seat.team,selectedId:seat.unitId});
  if(!compiled.ok)return fail('plano_invalido');
  const ops=compiled.commands.flatMap(x=>x.actions.map(a=>({role:x.role,action:a})));
  if(ops.length!==d.actions||ops.some(x=>!room.gateway.seats.get(seat.seatId).unitIds.includes(seat.team+'_'+x.role)))
   return fail('plano_alterado');
  if(this.beforeApply)this.beforeApply(staged,{room,seat,draft:d});
  const outcome=this.applyCommands(compiled,staged,{team:seat.team});
  if(!outcome.ok)return {ok:false,reason:'batch_abortado',errors:outcome.errors||[]};
  // In-memory atomically swap only after full success. No intermediate SSE.
  room.arena=staged;room.gateway.arena=staged;
  room.revision++;
  d.receipt={ok:true,revision:room.revision,round:room.arena.round,actionCount:d.actions,roles:[...new Set(ops.map(x=>x.role))]};
  room.persist();room.broadcast();
  return {...d.receipt};
 }
}
