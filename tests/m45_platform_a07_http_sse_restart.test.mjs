/** M45 A07 — real Node HTTP/SSE/disk test; NOT_RUN without full checkout.
 * Run: node tests/m45_platform_a07_http_sse_restart.test.mjs
 * Legacy source dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5.
 */
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
import {SseStateStream} from './m45_platform_a07_sse_frames.mjs';
const dir=mkdtempSync(join(tmpdir(),'coachlol-m45-a07-http-'));
let host=null,opened=[],n=0;
const check=(name,fn)=>{fn();n++;console.log('PASS A07 HTTP '+name);};
const start=async()=>{host=createPvPServerV453Dev47({checkpointDir:dir,tickMs:0});const addr=await host.listen(0);return 'http://127.0.0.1:'+addr.port;};
async function request(base,path,{method='GET',body=null,cookie=''}={}){
 const headers={};if(cookie)headers.cookie=cookie;if(body!==null)headers['content-type']='application/json';
 const res=await fetch(base+path,{method,headers,body:body===null?undefined:JSON.stringify(body),signal:AbortSignal.timeout(7000)});
 const raw=await res.text();let json=null;try{json=JSON.parse(raw);}catch{}
 return {status:res.status,json,raw,cookie:res.headers.get('set-cookie')?.split(';')[0]};
}
async function stream(base,cookie){
 const ctl=new AbortController(),res=await fetch(base+'/api/stream',{headers:{cookie},signal:ctl.signal});
 assert.equal(res.status,200);
 const item={ctl,frames:new SseStateStream(res.body)};opened.push(item);return item;
}
async function closeStreams(){for(const x of opened.splice(0)){try{await x.frames.close();}catch{}x.ctl.abort();}}
try{
 let base=await start();
 const a=await request(base,'/api/create',{method:'POST',body:{maxSeats:2}});
 assert.equal(a.status,201,a.raw);assert.ok(a.cookie);
 const b=await request(base,'/api/join',{method:'POST',body:{roomId:a.json.roomId}});
 assert.equal(b.status,200,b.raw);assert.ok(b.cookie);
 check('01 two cookies, one match',()=>{assert.notEqual(a.cookie,b.cookie);assert.equal(a.json.team,'blue');assert.equal(b.json.team,'red');});
 const unauth=await request(base,'/api/stream');
 check('02 anonymous SSE rejected',()=>assert.equal(unauth.status,401));
 const blue=await stream(base,a.cookie),red=await stream(base,b.cookie);
 const startBlue=await blue.frames.next(),startRed=await red.frames.next();
 check('03 SSE boot has one perspective and five units per human',()=>{
  assert.equal(startBlue.id,null);assert.equal(startRed.id,null);
  assert.equal(startBlue.state.team,'blue');assert.equal(startRed.state.team,'red');
  assert.equal(startBlue.state.projection.controlledUnitIds.length,5);
  assert.equal(startRed.state.projection.controlledUnitIds.length,5);
 });
 const cmd={sequence:1,kind:'order.stop',unitId:'blue_TOP',payload:{}};
 const action=await request(base,'/api/action',{method:'POST',body:cmd,cookie:a.cookie});
 assert.equal(action.status,200,action.raw);
 const afterBlue=await blue.frames.next(),afterRed=await red.frames.next();
 check('04 command broadcast respects each session',()=>{
  assert.equal(afterBlue.state.team,'blue');assert.equal(afterRed.state.team,'red');
  assert.equal(afterBlue.state.revision,afterRed.state.revision);
  assert.equal(afterBlue.state.nextSequence,2);assert.equal(afterRed.state.nextSequence,1);
  assert.equal(JSON.stringify(afterRed.state).includes('tokenHash'),false);
 });
 const duplicate=await request(base,'/api/action',{method:'POST',body:cmd,cookie:a.cookie});
 check('05 original action ACK replayed',()=>{assert.equal(duplicate.status,200);assert.deepEqual(duplicate.json,action.json);});
 const firstReady=await request(base,'/api/ready',{method:'POST',body:{},cookie:a.cookie});
 assert.equal(firstReady.status,200,firstReady.raw);
 const lockedBlue=await blue.frames.next(),lockedRed=await red.frames.next();
 check('06 half-ready prevents simultaneous turn resolution',()=>{
  assert.equal(lockedBlue.state.ready.includes('p1'),true);
  assert.equal(lockedRed.state.ready.includes('p1'),true);
  assert.equal(lockedBlue.state.phase,'preparation');
 });
 await closeStreams();await host.close();host=null;
 base=await start();
 const rBlue=await request(base,'/api/session',{cookie:a.cookie}),rRed=await request(base,'/api/session',{cookie:b.cookie});
 check('07 checkpoint persists both seats and first ready',()=>{
  assert.equal(rBlue.status,200);assert.equal(rRed.status,200);
  assert.equal(rBlue.json.team,'blue');assert.equal(rRed.json.team,'red');
  assert.equal(rBlue.json.ready.includes('p1'),true);
 });
 const reconnect=await stream(base,a.cookie),snap=await reconnect.frames.next();
 check('08 reconnect sends current filtered state (legacy no event IDs)',()=>{
  assert.equal(snap.id,null);assert.equal(snap.state.team,'blue');
  assert.equal(snap.state.revision,rBlue.json.revision);
  assert.equal(snap.state.projection.controlledUnitIds.length,5);
 });
 const again=await request(base,'/api/action',{method:'POST',body:cmd,cookie:a.cookie});
 check('09 action ACK survives disk restore',()=>{assert.equal(again.status,200);assert.deepEqual(again.json,action.json);});
 const redReady=await request(base,'/api/ready',{method:'POST',body:{},cookie:b.cookie});
 assert.equal(redReady.status,200,redReady.raw);
 const started=await reconnect.frames.next();
 check('10 second ready seals one match',()=>{assert.equal(started.state.phase,'executing');assert.deepEqual(started.state.ready,[]);});
 const retryReady=await request(base,'/api/ready',{method:'POST',body:{},cookie:b.cookie});
 check('11 known legacy ready retry failure',()=>{assert.equal(retryReady.status,409);assert.equal(retryReady.json.reason,'confirmacao_indisponivel');});
 console.log('M45 A07 LEGACY HTTP/SSE+DISK '+n+'/11 PASS (NOT Rust/browser certification)');
}finally{await closeStreams();if(host)await host.close();rmSync(dir,{recursive:true,force:true});}
