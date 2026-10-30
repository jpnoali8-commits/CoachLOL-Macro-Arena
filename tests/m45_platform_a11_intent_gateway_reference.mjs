/**
 * M45 PLATFORM-A11 — REFERENCE ONLY: authenticated text intent -> one wire command.
 * NOT production server, not persistence, not Rust or complete semantic mapping.
 * Compile runs INSIDE server boundary using the authoritative Arena; caller
 * provides an authenticated seat resolved by server, never a client-selected team.
 * Rejects any plan requiring multiple or unsupported operations: no partial commit.
 */
const fail=(reason)=>({ok:false,reason});
const clone=(v)=>JSON.parse(JSON.stringify(v));
export class AuthenticatedTextIntentBridgeReference {
  constructor({interpretCommands}){
    if(typeof interpretCommands!=='function')throw TypeError('compiler_required');
    this.interpretCommands=interpretCommands;
    this.drafts=new Map();this.nextId=1;
  }
  seat(room,auth){
    if(!room?.started||!auth?.seatId)return null;
    const seat=room.players.find(p=>p.seatId===auth.seatId);
    // auth must originate from the trusted session/cookie layer.
    if(!seat||seat.team!==auth.team||seat.unitId!==auth.unitId||!room.gateway?.seats.has(seat.seatId))return null;
    return seat;
  }
  eligible(room,seat){
    if(!seat)return 'assento_nao_autenticado';
    if(room.arena.ended||!['preparation','planning'].includes(room.arena.phase))return 'fase_bloqueada';
    if(room.arena.pendingDecision||room.ready.has(seat.seatId)||room.arena.teams[seat.team]?.ready)return 'turno_bloqueado';
    return null;
  }
  preview(room,auth,text){
    const seat=this.seat(room,auth),blocked=this.eligible(room,seat);
    if(blocked)return fail(blocked);
    if(typeof text!=='string'||!text.trim()||text.length>1800)return fail('texto_invalido');
    const parsed=this.interpretCommands(text,room.arena,{team:seat.team,selectedId:seat.unitId});
    if(!parsed.ok)return {ok:false,reason:'texto_nao_compilavel',errors:clone(parsed.errors)};
    const actions=parsed.commands.flatMap(cmd=>cmd.actions.map(a=>({role:cmd.role,action:a})));
    // In the legacy gateway one command has one receipt. No atomic batch exists.
    // Never accept a partial prefix of a multi-operation text plan.
    if(actions.length!==1)return fail('plano_atomico_nao_suportado');
    const {role,action}=actions[0];
    const unitId=seat.team+'_'+role;
    if(!room.gateway.seats.get(seat.seatId).unitIds.includes(unitId))return fail('unidade_nao_autorizada');
    let command=null;
    if(action.type==='order'&&action.payload?.kind==='recall'&&Object.keys(action.payload).length===1)command={kind:'order.recall',unitId,payload:{}};
    else if(action.type==='upgradeSkill'&&['Q','W','E','R'].includes(action.payload))command={kind:'skill.upgrade',unitId,payload:{slot:action.payload}};
    else return fail('acao_textual_sem_contrato_wire');
    const draftId='a11-'+this.nextId++;
    const record={roomId:room.id,seatId:seat.seatId,team:seat.team,round:room.arena.round,revision:room.revision,command,receipt:null,packet:null};
    this.drafts.set(draftId,record);
    return {ok:true,draftId,roomId:room.id,round:record.round,revision:record.revision,unitId,kind:command.kind};
  }
  commit(room,auth,draftId){
    const seat=this.seat(room,auth);
    if(!seat)return fail('assento_nao_autenticado');
    const draft=this.drafts.get(draftId);
    if(!draft||draft.roomId!==room.id||draft.seatId!==seat.seatId||draft.team!==seat.team)return fail('rascunho_nao_autorizado');
    // The accepted receipt can always be re-delivered after ready/seal/turn.
    if(draft.receipt)return clone(draft.receipt);
    const blocked=this.eligible(room,seat);
    if(blocked)return fail(blocked);
    if(room.arena.round!==draft.round||room.revision!==draft.revision)return fail('rascunho_desatualizado');
    const serverSeat=room.gateway.seats.get(seat.seatId);
    const packet={sequence:serverSeat.lastSequence+1,...clone(draft.command)};
    const result=room.command(seat,packet);
    if(!result.ok)return clone(result);
    draft.packet=packet;draft.receipt=clone(result);
    return clone(result);
  }
  retryPacket(room,auth,draftId){
    const seat=this.seat(room,auth),draft=this.drafts.get(draftId);
    if(!seat||!draft||draft.seatId!==seat.seatId||draft.roomId!==room.id||!draft.packet)return null;
    return clone(draft.packet);
  }
}
