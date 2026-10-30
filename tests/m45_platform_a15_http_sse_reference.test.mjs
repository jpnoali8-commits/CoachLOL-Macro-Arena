/** M45 PLATFORM-A15: real localhost HTTP/SSE QA transport, NOT CoachLOL production server.
 * Node 22; real sockets and fs, fake pre-authorized cookie sessions, toy store from A13.
 */
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {DurableCheckpointReference as Store} from './m45_platform_a13_durable_reference.mjs';
import {PerSeatSseResyncReference as Resync,PerSeatSseConsumerReference as Consumer} from './m45_platform_a14_sse_resync_reference.mjs';
import {SseStateStream} from './m45_platform_a07_sse_frames.mjs';

const dir=mkdtempSync(join(tmpdir(),'coachlol-m45-a15-'));
const file=join(dir,'match.json');
const TOKEN_BLUE='a'.repeat(64),TOKEN_RED='b'.repeat(64);
let count=0,host=null,opened=[];
const check=(name,fn)=>{fn();count++;console.log('PASS A15 HTTP '+name)};
function serve(store){
 const vision=new Resync(store),subs=new Map([['p1',new Set()],['p2',new Set()]]);
 const metrics={sent:0,backpressure:0,connections:0,disconnects:0,committedBroadcasts:0};
 const auth=req=>{const all=req.headers.cookie||'';const m=all.match(/(?:^|;\s*)coachlol_a15=([ab]{64})(?:;|$)/);
  if(!m)return null;if(m[1]===TOKEN_BLUE)return {seatId:'p1'};if(m[1]===TOKEN_RED)return {seatId:'p2'};return null;};
 const respond=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(body));};
 const send=(res,snapshot)=>{if(res.destroyed||res.writableEnded)return false;
  const ok=res.write(vision.wire(snapshot));metrics.sent++;if(!ok){metrics.backpressure++;res.destroy();}return ok;};
 const broadcast=()=>{metrics.committedBroadcasts++;for(const [seat,clients] of subs){const snap=vision.recover({seatId:seat});
  for(const res of [...clients])send(res,snap);}};
 const server=http.createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if(path==='/api/health')return respond(res,200,{ok:true,reference:true});
  const who=auth(req);if(!who)return respond(res,401,{ok:false,reason:'sessao_ausente'});
  if(req.method==='GET'&&path==='/api/session')return respond(res,200,{ok:true,...vision.snapshot(who)});
  if(req.method==='GET'&&path==='/api/stream'){
   const clients=subs.get(who.seatId);if(clients.size>=2)return respond(res,429,{ok:false,reason:'limite_streams'});
   res.writeHead(200,{'content-type':'text/event-stream; charset=utf-8','cache-control':'no-cache, no-store','x-accel-buffering':'no'});
   res.write(': connected\n\n');clients.add(res);metrics.connections++;
   send(res,vision.recover(who,{lastEventId:req.headers['last-event-id']??null}));
   const beat=setInterval(()=>{if(!res.destroyed&&!res.writableEnded){if(!res.write(': heartbeat\n\n')){metrics.backpressure++;res.destroy()}}},140);
   res.once('close',()=>{clearInterval(beat);clients.delete(res);metrics.disconnects++});return;
  }
  if(req.method==='POST'){
   const origin=req.headers.origin;if(origin&&origin!==`http://${req.headers.host}`&&origin!==`https://${req.headers.host}`)
    return respond(res,403,{ok:false,reason:'origem_nao_permitida'});
   if(!['/api/action','/api/ready'].includes(path))return respond(res,404,{ok:false,reason:'nao_encontrado'});
   try{
    let bytes=0,raw='';for await(const part of req){bytes+=part.length;if(bytes>8192){return respond(res,413,{ok:false,reason:'payload_excessivo'})}raw+=part;}
    const command=JSON.parse(raw);if(!command||typeof command!=='object'||Array.isArray(command))return respond(res,400,{ok:false,reason:'payload_invalido'});
    if(path==='/api/action'&&command.kind!=='order.stop')return respond(res,400,{ok:false,reason:'comando_invalido'});
    if(path==='/api/ready'&&command.kind!=='ready')return respond(res,400,{ok:false,reason:'ready_invalido'});
    const previous=store.read().revision;
    let receipt;try{receipt=store.commit(who,command)}catch(e){return respond(res,503,{ok:false,reason:'falha_persistencia'});}
    if(receipt.ok&&store.read().revision>previous)broadcast();
    return respond(res,receipt.ok?200:409,receipt);
   }catch(e){return respond(res,400,{ok:false,reason:'json_invalido'});}
  }
  return respond(res,404,{ok:false,reason:'nao_encontrado'});
 });
 return {server,metrics,subs,async listen(){await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));return 'http://127.0.0.1:'+server.address().port},async close(){for(const s of subs.values())for(const res of s)res.destroy();await new Promise(resolve=>server.close(resolve));}};
}
const cookies={blue:'coachlol_a15='+TOKEN_BLUE,red:'coachlol_a15='+TOKEN_RED};
let base='';
async function request(path,{method='GET',body=null,cookie=cookies.blue,origin=null}={}){
 const headers={};if(cookie)headers.cookie=cookie;if(origin)headers.origin=origin;if(body!==null)headers['content-type']='application/json';
 const res=await fetch(base+path,{method,headers,body:body===null?undefined:typeof body==='string'?body:JSON.stringify(body),signal:AbortSignal.timeout(4000)});
 return {status:res.status,data:await res.json()};
}
async function stream(cookie,lastEventId=null){
 const controller=new AbortController(),headers={cookie};if(lastEventId)headers['Last-Event-ID']=lastEventId;
 const res=await fetch(base+'/api/stream',{headers,signal:controller.signal});
 if(res.status!==200)return {status:res.status,data:await res.json()};
 const v={status:res.status,reader:new SseStateStream(res.body),controller,async close(){await this.reader.close();this.controller.abort()}};
 opened.push(v);return v;
}
const action=(id,unit,round=1)=>({kind:'order.stop',requestId:id,unitId:unit,round});
const ready=id=>({kind:'ready',requestId:id,round:1});
async function closeStreams(){for(const s of opened.splice(0)){try{await s.close()}catch{}}}
try{
 const store=new Store(file);host=serve(store);base=await host.listen();
 const h=await request('/api/health',{cookie:null});check('01 live loopback server health',()=>assert.equal(h.data.ok,true));
 const unauth=await request('/api/session',{cookie:null});check('02 missing cookie denied',()=>assert.equal(unauth.status,401));
 const sb=await request('/api/session'),sr=await request('/api/session',{cookie:cookies.red});
 check('03 two authenticated cookie perspectives',()=>{assert.equal(sb.data.team,'blue');assert.equal(sr.data.team,'red');assert.notEqual(sb.data.seatId,sr.data.seatId)});
 const noSse=await stream('');check('04 unauthenticated SSE rejected',()=>assert.equal(noSse.status,401));
 const blue=await stream(cookies.blue),red=await stream(cookies.red),ib=await blue.reader.next(),ir=await red.reader.next();
 check('05 two live SSE connections get seat-bound cursor',()=>{assert.equal(ib.id,'a13reference/p1/0');assert.equal(ir.id,'a13reference/p2/0');assert.equal(ib.state.team,'blue');assert.equal(ir.state.team,'red')});
 const cross=await request('/api/action',{method:'POST',cookie:cookies.red,body:action('fake-blue','blue_TOP')});
 check('06 cross-seat unit spoof blocked',()=>assert.equal(cross.data.reason,'unauthorized_unit'));
 const origin=await request('/api/action',{method:'POST',origin:'https://attacker.invalid',body:action('bad-origin','blue_TOP')});
 check('07 foreign origin blocked',()=>assert.equal(origin.status,403));
 const malformed=await request('/api/action',{method:'POST',body:'{broken'});
 check('08 invalid JSON blocked',()=>assert.equal(malformed.status,400));
 const huge=await request('/api/action',{method:'POST',body:JSON.stringify({...action('over','blue_TOP'),extra:'x'.repeat(9000)})});
 check('09 large payload rejected',()=>assert.equal(huge.status,413));
 const p=action('cmd01','blue_TOP'),accepted=await request('/api/action',{method:'POST',body:p});
 const afterBlue=await blue.reader.next(),afterRed=await red.reader.next();
 check('10 one accepted command broadcasts both authorized revisions',()=>{assert.equal(accepted.status,200);assert.equal(afterBlue.state.revision,1);assert.equal(afterRed.state.revision,1);assert.equal(afterBlue.state.projection.commands.length,1);assert.equal(afterRed.state.projection.commands.length,0)});
 const oldBroadcasts=host.metrics.committedBroadcasts,retry=await request('/api/action',{method:'POST',body:p});
 check('11 same requestId replays ACK without new broadcast',()=>{assert.deepEqual(retry.data,accepted.data);assert.equal(host.metrics.committedBroadcasts,oldBroadcasts)});
 const changed=await request('/api/action',{method:'POST',body:{...p,unitId:'blue_JG'}});
 check('12 conflicting requestId rejected',()=>assert.equal(changed.data.reason,'receipt_conflict'));
 const redMove=await request('/api/action',{method:'POST',body:action('red01','red_JG'),cookie:cookies.red});
 const secondBlue=await blue.reader.next(),secondRed=await red.reader.next();
 check('13 red command reaches both SSE while blue sees no red order',()=>{assert.equal(redMove.status,200);assert.equal(secondBlue.state.projection.commands.length,1);assert.equal(secondRed.state.projection.commands.length,1);assert.equal(secondBlue.state.revision,2)});
 const limit1=await stream(cookies.blue),limit2=await stream(cookies.blue);
 check('14 max two streams per seat enforced',()=>{assert.equal(limit1.status,200);assert.equal(limit2.status,429)});
 await blue.close();opened=opened.filter(x=>x!==blue);
 const returnBlue=await stream(cookies.blue,'a13reference/p1/0'),catchup=await returnBlue.reader.next();
 check('15 reconnect with stale cursor gets latest own snapshot',()=>{assert.equal(catchup.id,'a13reference/p1/2');assert.equal(catchup.state.projection.commands.length,1);assert.equal(catchup.state.team,'blue')});
 const foreign=await stream(cookies.red,'a13reference/p1/2'),foreignView=await foreign.reader.next();
 check('16 foreign Last-Event-ID cannot reveal enemy order',()=>{assert.equal(foreignView.state.team,'red');assert.equal(foreignView.state.projection.commands[0].unitId,'red_JG')});
 const duplicateClient=new Consumer({roomId:'a13reference',seatId:'p1'});
 check('17 duplicated recovery frames ignored by client cursor',()=>{assert.equal(duplicateClient.accept(catchup),true);assert.equal(duplicateClient.accept(catchup),false)});
 const pending=action('after-rename','blue_ADC');store.fault='after_rename';
 const noAck=await request('/api/action',{method:'POST',body:pending});store.fault=null;
 const committed=new Store(file),newAck=await request('/api/action',{method:'POST',body:pending});
 check('18 simulated lost ACK after rename retries durable receipt',()=>{assert.equal(noAck.status,503);assert.equal(newAck.status,200);assert.equal(committed.read().commands.length,3);assert.equal(newAck.data.revision,3)});
 const before=committed.read().revision;store.fault='after_temp_fsync';
 const beforeRename=await request('/api/action',{method:'POST',body:action('before-rename','blue_SUP')});store.fault=null;
 check('19 failure before rename preserves revision',()=>{assert.equal(beforeRename.status,503);assert.equal(new Store(file).read().revision,before)});
 await closeStreams();await host.close();host=null;
 host=serve(new Store(file));base=await host.listen();const reopened=await stream(cookies.blue),recovered=await reopened.reader.next();
 check('20 restart server + reconnect gets committed last revision',()=>{assert.equal(recovered.id,'a13reference/p1/3');assert.equal(recovered.state.projection.commands.length,2)});
 const bpRed=await stream(cookies.red);await bpRed.reader.next();
 const slow=[...host.subs.get('p1')][0];let falseWriteCalls=0;
 slow.write=()=>{falseWriteCalls++;return false}; // deterministic backpressure fault injection
 const pressure=await request('/api/action',{method:'POST',body:action('pressure01','blue_JG')});
 const redContinued=await bpRed.reader.next();
 check('21 false write backpressure disconnects slow blue stream',()=>{assert.equal(pressure.status,200);assert.equal(falseWriteCalls,1);assert.equal(host.metrics.backpressure,1);assert.equal(slow.destroyed,true)});
 check('22 slow blue stream does not block red SSE updates',()=>{assert.equal(redContinued.state.team,'red');assert.equal(redContinued.state.revision,4)});
 const prepared=await request('/api/ready',{method:'POST',body:ready('first-ready')});
 const exec=await request('/api/ready',{method:'POST',cookie:cookies.red,body:ready('second-ready')});
 const execAgain=await request('/api/ready',{method:'POST',cookie:cookies.red,body:ready('second-ready')});
 check('23 both ready resolve exactly once under repeated HTTP request',()=>{assert.equal(prepared.status,200);assert.equal(exec.status,200);assert.deepEqual(execAgain.data,exec.data);assert.equal(new Store(file).read().executionCount,1)});
 check('24 restart projections never include private store fields',()=>{const s=host.metrics;assert.ok(s.connections>=1);assert.equal(JSON.stringify(recovered.state).includes('privateSeed'),false);assert.equal(JSON.stringify(recovered.state).includes('receipts'),false)});
 console.log('M45 PLATFORM-A15 '+count+'/24 REAL_LOCALHOST_HTTP_SSE_NODE22_QA_REFERENCE PASS; ORIGINAL_SERVER_NOT_RUN');
}finally{await closeStreams();if(host)await host.close();rmSync(dir,{recursive:true,force:true})}
