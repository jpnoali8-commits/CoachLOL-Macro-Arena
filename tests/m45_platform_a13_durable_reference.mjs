/** M45-A13 QA ONLY: fsync+rename durable checkpoint/receipt reference.
 * Standalone Node file; NOT a CoachLOL engine, server, Rust or crash-safe DB.
 * In-process storage failure hooks emulate pre/post-rename interruption.
 */
import {openSync,closeSync,writeFileSync,readFileSync,renameSync,existsSync,fsyncSync,unlinkSync} from 'node:fs';
import {dirname} from 'node:path';
import {createHash} from 'node:crypto';
const clone=x=>JSON.parse(JSON.stringify(x));
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fresh=()=>({schema:'m45.a13.qa.v1',roomId:'a13reference',revision:0,round:1,phase:'planning',ready:[],commands:[],receipts:{},events:[],privateSeed:9001});
export class DurableCheckpointReference {
 constructor(file,{fault=null}={}) {this.file=file;this.fault=fault;if(!existsSync(file))this.write(fresh());}
 read(){const state=JSON.parse(readFileSync(this.file,'utf8'));if(state.schema!=='m45.a13.qa.v1'||state.roomId!=='a13reference')throw Error('checkpoint_invalid');return state;}
 write(next){
  const temp=this.file+'.new';let fd;
  try{
   if(this.fault==='before_temp')throw Error('INJECT_BEFORE_TEMP');
   fd=openSync(temp,'w',0o600);writeFileSync(fd,JSON.stringify(next));fsyncSync(fd);closeSync(fd);fd=undefined;
   if(this.fault==='after_temp_fsync')throw Error('INJECT_AFTER_TEMP_FSYNC');
   renameSync(temp,this.file);
   const dir=openSync(dirname(this.file),'r');try{fsyncSync(dir)}finally{closeSync(dir)}
   if(this.fault==='after_rename')throw Error('INJECT_AFTER_RENAME');
  }finally{if(fd!==undefined)closeSync(fd);if(existsSync(temp))unlinkSync(temp)}
 }
 commit(auth,command){
  const before=this.read();
  if(!auth||!['p1','p2'].includes(auth.seatId))return {ok:false,reason:'unauthorized_seat'};
  if(!command||typeof command.requestId!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(command.requestId))return {ok:false,reason:'invalid_request_id'};
  const seat=auth.seatId,key=[before.roomId,before.round,seat,command.requestId].join('|');
  const canonical={kind:command.kind,unitId:command.unitId??null,requestId:command.requestId,round:command.round};
  const fingerprint=digest(canonical),prior=before.receipts[key];
  if(prior)return prior.fingerprint===fingerprint?clone(prior.receipt):{ok:false,reason:'receipt_conflict'};
  if(command.round!==before.round||before.phase!=='planning'||before.ready.includes(seat))return {ok:false,reason:'turn_locked'};
  const staged=clone(before);
  if(command.kind==='ready'){
   if(command.unitId!==undefined)return {ok:false,reason:'invalid_ready_packet'};
   staged.ready.push(seat);if(staged.ready.length===2){staged.phase='executing';staged.ready=[];staged.executionCount=(staged.executionCount||0)+1;}
  }else if(command.kind==='order.stop'){
   const prefix=seat==='p1'?'blue_':'red_';
   if(typeof command.unitId!=='string'||!command.unitId.startsWith(prefix)||!['MID','TOP','JG','ADC','SUP'].includes(command.unitId.slice(prefix.length)))return {ok:false,reason:'unauthorized_unit'};
   staged.commands.push({seatId:seat,unitId:command.unitId,kind:command.kind});
   staged.events.push({scope:'team',team:seat==='p1'?'blue':'red',kind:'order_accepted'});
  }else return {ok:false,reason:'unsupported_action'};
  staged.revision++;
  const receipt={ok:true,requestId:command.requestId,round:command.round,kind:command.kind,revision:staged.revision};
  staged.receipts[key]={fingerprint,receipt};
  this.write(staged); // Only after durable checkpoint does the method return ACK.
  return clone(receipt);
 }
 view(auth){
  if(!auth||!['p1','p2'].includes(auth.seatId))return null;
  const s=this.read(),team=auth.seatId==='p1'?'blue':'red';
  return {roomId:s.roomId,revision:s.revision,round:s.round,phase:s.phase,ready:[...s.ready],team,
   commands:s.commands.filter(c=>c.seatId===auth.seatId).map(c=>({unitId:c.unitId,kind:c.kind})),
   events:s.events.filter(e=>e.scope==='public'||e.team===team).map(e=>({kind:e.kind}))};
 }
}
