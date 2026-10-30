/** M45 A14 QA ONLY: per-seat SSE snapshot resynchronization, not production. */
const teamOf=seat=>seat==='p1'?'blue':seat==='p2'?'red':null;
const clone=value=>JSON.parse(JSON.stringify(value));
export class PerSeatSseResyncReference {
 constructor(store){if(!store||typeof store.read!=='function')throw TypeError('store_required');this.store=store;}
 read(auth){const team=teamOf(auth?.seatId);if(!team)return null;
  const s=this.store.read();return {s,team,seatId:auth.seatId};}
 snapshot(auth){const c=this.read(auth);if(!c)return null;const {s,team,seatId}=c;
  // This strict DTO is intentionally narrower than legacy Arena.perspective().
  const events=s.events.filter(e=>e&&['public','team'].includes(e.scope)&&
   (e.scope==='public'||e.team===team)&&['order_accepted'].includes(e.kind))
   .map(e=>({kind:e.kind}));
  const commands=s.commands.filter(x=>x.seatId===seatId)
   .map(x=>({unitId:x.unitId,kind:x.kind}));
  return {roomId:s.roomId,seatId,team,revision:s.revision,round:s.round,
   phase:s.phase,ready:[...s.ready],projection:{commands,events}};
 }
 static id(snapshot){return [snapshot.roomId,snapshot.seatId,snapshot.revision].join('/');}
 recover(auth,{lastEventId=null}={}){
  const state=this.snapshot(auth);if(!state)return {ok:false,reason:'unauthorized'};
  const id=PerSeatSseResyncReference.id(state);
  let reason='initial';
  if(lastEventId!==null){
   const match=typeof lastEventId==='string'?lastEventId.match(/^([a-zA-Z0-9_-]+)\/(p[12])\/(0|[1-9][0-9]*)$/):null;
   if(!match||match[1]!==state.roomId||match[2]!==state.seatId)reason='foreign_or_invalid_cursor';
   else {
    const cursor=Number(match[3]);
    if(!Number.isSafeInteger(cursor)||cursor>state.revision)reason='future_cursor';
    else if(cursor===state.revision)reason='same_revision_snapshot';
    else reason='gap_snapshot';
   }
  }
  return {ok:true,id,reason,frame:{event:'state',id,data:state}};
 }
 wire(result){if(!result?.ok)throw Error('invalid_frame');
  return 'event: state\nid: '+result.id+'\ndata: '+JSON.stringify(result.frame.data)+'\n\n';}
}
export class PerSeatSseConsumerReference {
 constructor({roomId,seatId}){this.roomId=roomId;this.seatId=seatId;this.lastRevision=-1;this.lastEventId=null;this.current=null;}
 accept(frame){const value=frame?.state??frame?.data;
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  if(value.roomId!==this.roomId||value.seatId!==this.seatId||!Number.isSafeInteger(value.revision)||value.revision<0)return false;
  const id=PerSeatSseResyncReference.id(value);
  if(frame.id!==id||value.revision<=this.lastRevision)return false;
  this.lastRevision=value.revision;this.lastEventId=id;this.current=clone(value);return true;
 }
}
