/**
 * CoachLOL M45 A08 — PROPOSED client reconciliation reference, QA ONLY.
 * Not integrated into the game, not a production JS engine, not Rust certification.
 * Data contracts deliberately kept JSON serializable for Rust/WASM comparison.
 */
const valid = s => typeof s === 'string' && s.length > 0;
const clone = v => JSON.parse(JSON.stringify(v));
export class ClientSequenceReference {
  constructor() { this.epoch = 0; this.roomId = null; this.seatId = null; this.next = 1; this.lastRevision = -1; this.pending = null; this.observedNext = 1; }
  bind({roomId, seatId, nextSequence = 1, revision = 0}) {
    if(!valid(roomId) || !valid(seatId) || !Number.isSafeInteger(nextSequence) || nextSequence < 1 || !Number.isSafeInteger(revision) || revision < 0) throw Error('invalid_session');
    this.epoch++;
    this.roomId = roomId; this.seatId = seatId; this.next = nextSequence; this.observedNext = nextSequence; this.lastRevision = revision; this.pending = null;
    return this.epoch;
  }
  command({kind, unitId, payload}) {
    if(!this.roomId) throw Error('session_missing');
    if(this.pending) throw Error('awaiting_previous_receipt');
    if(!valid(kind) || !valid(unitId) || !payload || Array.isArray(payload) || typeof payload !== 'object') throw Error('command_invalid');
    this.pending = {epoch:this.epoch, roomId:this.roomId,seatId:this.seatId, packet:clone({sequence:this.next,kind,unitId,payload})};
    return clone(this.pending.packet);
  }
  onSnapshot(snapshot) {
    if(!snapshot || snapshot.roomId !== this.roomId || snapshot.seatId !== this.seatId) return false;
    if(!Number.isSafeInteger(snapshot.revision) || snapshot.revision < this.lastRevision || !Number.isSafeInteger(snapshot.nextSequence) || snapshot.nextSequence < 1) return false;
    this.lastRevision = snapshot.revision;
    this.observedNext = Math.max(this.observedNext,snapshot.nextSequence);
    if(!this.pending) this.next=Math.max(this.next,this.observedNext);
    return true;
  }
  onAck(ack,{roomId,seatId,epoch}) {
    if(epoch!==this.epoch || roomId!==this.roomId || seatId!==this.seatId) return false;
    if(!this.pending) return false;
    const p=this.pending.packet;
    if(ack?.ok!==true || ack.sequence!==p.sequence || ack.unitId!==p.unitId || ack.kind!==p.kind) return false;
    this.next=Math.max(this.next,p.sequence+1,this.observedNext);
    this.pending=null;
    return true;
  }
  retry(){return this.pending?clone(this.pending.packet):null;}
}
