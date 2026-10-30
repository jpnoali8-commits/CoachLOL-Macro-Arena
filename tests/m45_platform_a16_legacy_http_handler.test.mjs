/**
 * M45 PLATFORM-A16 — real legacy HTTP route code, Arena, Gateway and Room, in
 * a synchronous fake HTTP transport. No TCP or filesystem checkpoint in this test.
 * Run with full checkout: node tests/m45_platform_a16_legacy_http_handler.test.mjs
 * Source pin dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve,join} from 'node:path';
import {Arena,catalog,ITEM_RECIPES,officialSaleValueV453Dev60} from '../engine.mjs';
import {PvPRoomV453Dev47} from '../multiplayer/room_v453_dev47.mjs';

const legacyServerSource=readFileSync(new URL('../multiplayer/server_v453_dev47.mjs',import.meta.url),'utf8');
const gitSha=createHash('sha1').update('blob '+Buffer.byteLength(legacyServerSource)+String.fromCharCode(0)).update(legacyServerSource).digest('hex');
assert.equal(gitSha,'d6ed7a4b0dd30f2bf22c3d5876e3ac6b293ddf5d');
const source=legacyServerSource.replace(/^import[^\n]*\n/gm,'')
 .replace(/\bexport\s+(?=function\s)/g,'')
 .replaceAll('import.meta.url',JSON.stringify(new URL('../multiplayer/server_v453_dev47.mjs',import.meta.url).href))
 .split('\nif(process.argv[1]')[0];
assert.ok(source.includes('const server=http.createServer('),'source server handler changed');
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json'),manifest=data('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=manifest.baseFeatures;map.riftBundlesV452d4=manifest.variants;
let created=0;
const registry={
 rooms:new Map(),
 create(){
  const arena=new Arena(map,mask,{mode:'pvp',seed:16016+created++});
  const room=new PvPRoomV453Dev47({id:'a16a1616',arena,maxSeats:2,checkpointPath:null});
  this.rooms.set(room.id,room);
  const {token,player}=room.join();return {room,token,player};
 },
 get(id){return this.rooms.get(id)},
 session(token){for(const room of this.rooms.values()){const player=room.authenticate(token);if(player)return {room,player}}return null}
};
const http={createServer:handler=>({handler})};
const compiled=Function('http','URL','readFileSync','fileURLToPath','resolve','join',
 'catalog','ITEM_RECIPES','officialSaleValueV453Dev60','PvPRoomRegistryV453Dev47',
 'setInterval','clearInterval','process','console',
 source+';return createPvPServerV453Dev47;');
const createServer=compiled(http,URL,readFileSync,fileURLToPath,resolve,join,
 catalog,ITEM_RECIPES,officialSaleValueV453Dev60,null,
 ()=>42,()=>{},{argv:[]},{log(){}});
const host=createServer({registry,tickMs:0});
function mockResponse(){
 const res={status:0,head:{},headers:{},writes:[],body:'',events:{},destroyed:false,
  setHeader(k,v){this.headers[k]=v},
  writeHead(status,head){this.status=status;this.head=head},
  end(body=''){this.body+=String(body)},
  write(data){this.writes.push(String(data));return true},
  on(ev,fn){this.events[ev]=fn;return this},
  close(){this.destroyed=true;this.events.close?.()}
 };
 return res;
}
async function route(path,{method='GET',cookie='',body=null,origin=null}={}){
 const headers={};if(cookie)headers.cookie=cookie;if(origin)headers.origin=origin;
 const req={url:path,method,headers,
  async *[Symbol.asyncIterator](){if(body!==null)yield typeof body==='string'?body:JSON.stringify(body)}
 };
 const res=mockResponse();await host.server.handler(req,res);
 let data=null;try{data=JSON.parse(res.body)}catch{}
 return {status:res.status,data,headers:res.head,response:res};
}
const cmd=(seq=1,unitId='blue_TOP')=>({sequence:seq,kind:'order.stop',unitId,payload:{}});
let count=0;
function check(name,fn){fn();count++;console.log('PASS A16 ORIGINAL_ROUTE '+name);}
const creation=await route('/api/create',{method:'POST',body:{maxSeats:2}});
const blueCookie=creation.headers['set-cookie']?.split(';')[0];
check('01 original create route returns cookie + one blue human',()=>{
 assert.equal(creation.status,201);assert.equal(creation.data.team,'blue');assert.ok(blueCookie?.startsWith('coachlol_pvp47='));
 assert.ok(creation.headers['set-cookie'].includes('HttpOnly'));assert.ok(creation.headers['set-cookie'].includes('SameSite=Strict'));
});
const joined=await route('/api/join',{method:'POST',body:{roomId:creation.data.roomId}});
const redCookie=joined.headers['set-cookie']?.split(';')[0];
check('02 original join route creates second red human',()=>{
 assert.equal(joined.status,200);assert.equal(joined.data.team,'red');assert.notEqual(blueCookie,redCookie);
 assert.equal(registry.rooms.get(creation.data.roomId).gateway.seats.get('p1').unitIds.length,5);
 assert.equal(registry.rooms.get(creation.data.roomId).gateway.seats.get('p2').unitIds.length,5);
});
const missing=await route('/api/session');
check('03 missing cookie receives 401',()=>assert.equal(missing.status,401));
const unknown=await route('/api/session',{cookie:'coachlol_pvp47='+'f'.repeat(64)});
check('04 invalid cookie receives 401',()=>assert.equal(unknown.status,401));
const blueSession=await route('/api/session',{cookie:blueCookie}),redSession=await route('/api/session',{cookie:redCookie});
check('05 original session endpoint projects distinct teams',()=>{
 assert.equal(blueSession.data.team,'blue');assert.equal(redSession.data.team,'red');
 assert.equal(blueSession.data.projection.controlledUnitIds.length,5);
 assert.equal(redSession.data.projection.controlledUnitIds.length,5);
});
const denied=await route('/api/action',{method:'POST',cookie:blueCookie,body:cmd(1,'red_TOP')});
check('06 blue cannot order red unit',()=>{assert.equal(denied.status,409);assert.equal(denied.data.reason,'unidade_nao_autorizada')});
const cross=await route('/api/action',{method:'POST',cookie:blueCookie,origin:'https://attacker.invalid',body:cmd()});
check('07 cross-origin mutation returns 403',()=>assert.equal(cross.status,403));
const outOfOrder=await route('/api/action',{method:'POST',cookie:blueCookie,body:cmd(2)});
check('08 sequence gap returns 409',()=>assert.equal(outOfOrder.status,409));
const extra=await route('/api/action',{method:'POST',cookie:blueCookie,body:{...cmd(),team:'red'}});
check('09 extra untrusted team field rejected',()=>assert.equal(extra.status,409));
const anonymousStream=await route('/api/stream');
check('10 stream without session returns 401',()=>assert.equal(anonymousStream.status,401));
const sBlue=await route('/api/stream',{cookie:blueCookie}),sRed=await route('/api/stream',{cookie:redCookie});
check('11 two original SSE handlers send own initial snapshots',()=>{
 assert.equal(sBlue.status,200);assert.equal(sRed.status,200);
 assert.equal(sBlue.response.writes[0],': connected\n\n');
 assert.equal(sRed.response.writes[0],': connected\n\n');
 assert.ok(sBlue.response.writes[1].includes('"team":"blue"'));
 assert.ok(sRed.response.writes[1].includes('"team":"red"'));
});
const first=await route('/api/action',{method:'POST',cookie:blueCookie,body:cmd()});
check('12 authorized command returns original ACK',()=>{assert.equal(first.status,200);assert.equal(first.data.sequence,1)});
check('13 original SSE broadcasts to both original subscribers',()=>{
 assert.equal(sBlue.response.writes.length,3);assert.equal(sRed.response.writes.length,3);
 assert.ok(sBlue.response.writes[2].includes('"nextSequence":2'));
 assert.ok(sRed.response.writes[2].includes('"nextSequence":1'));
});
const duplicate=await route('/api/action',{method:'POST',cookie:blueCookie,body:cmd()});
check('14 replayed packet returns identical ACK without duplicate stream',()=>{
 assert.deepEqual(duplicate.data,first.data);assert.equal(sBlue.response.writes.length,3);
});
const conflict=await route('/api/action',{method:'POST',cookie:blueCookie,body:{...cmd(),kind:'order.recall'}});
check('15 changed command on used seq rejected',()=>assert.equal(conflict.data.reason,'sequencia_reutilizada_com_dados_diferentes'));
const firstReady=await route('/api/ready',{method:'POST',cookie:blueCookie,body:{}});
check('16 first seat ready does not start engine',()=>{
 assert.equal(firstReady.status,200);assert.notEqual(registry.rooms.get(creation.data.roomId).arena.phase,'executing');
});
const afterReady=await route('/api/action',{method:'POST',cookie:blueCookie,body:cmd(2)});
check('17 first ready prevents further blue commands',()=>assert.equal(afterReady.data.reason,'turno_bloqueado'));
const redReady=await route('/api/ready',{method:'POST',cookie:redCookie,body:{}});
check('18 red ready starts one simultaneous turn',()=>{
 assert.equal(redReady.status,200);assert.equal(registry.rooms.get(creation.data.roomId).arena.phase,'executing');
});
const retryReady=await route('/api/ready',{method:'POST',cookie:redCookie,body:{}});
check('19 legacy ready replay still fails rather than idempotently ACK',()=>{
 assert.equal(retryReady.status,409);assert.equal(retryReady.data.reason,'confirmacao_indisponivel');
});
const snap=await route('/api/session',{cookie:blueCookie});
check('20 session response never exposes raw server checkpoint secrets',()=>{
 for(const k of ['tokenHash','rngState','gatewayCheckpoint'])assert.equal(JSON.stringify(snap.data).includes(k),false);
});
check('21 server stream has no id or Last-Event-ID cursor even for valid sessions',()=>{
 assert.equal(/(^|\n)id:/.test(sBlue.response.writes.join('')),false);
 assert.equal(legacyServerSource.includes('Last-Event-ID'),false);
});
const room=registry.rooms.get(creation.data.roomId),before=sBlue.response.writes.length;
room.broadcast();
check('22 duplicate revision stream frames emitted for unchanged state',()=>{
 assert.equal(sBlue.response.writes.length,before+1);
 const states=sBlue.response.writes.filter(x=>x.startsWith('event: state'));
 const rev=states.map(x=>JSON.parse(x.split('\ndata: ')[1].trim()).revision);
 assert.equal(rev.at(-1),rev.at(-2));
});
sBlue.response.close();const beforeClosed=sBlue.response.writes.length;room.broadcast();
check('23 closing blue stream detaches only blue subscriber',()=>{
 assert.equal(sBlue.response.writes.length,beforeClosed);
 assert.ok(sRed.response.writes.length>beforeClosed);
});
const reconnect=await route('/api/stream',{cookie:blueCookie});
check('24 reconnect sends single latest authorized state and no journal',()=>{
 assert.equal(reconnect.status,200);assert.equal(reconnect.response.writes.length,2);
 assert.ok(reconnect.response.writes[1].includes('"team":"blue"'));
 assert.equal(/(^|\n)id:/.test(reconnect.response.writes[1]),false);
});
const oldRevision=room.revision;room.arena.event('A16_ANONYMOUS_PRIVATE_CANARY');
room.broadcast();
check('25 anonymous private legacy event leaks in original HTTP SSE to both seats',()=>{
 const b=sRed.response.writes.at(-1),a=reconnect.response.writes.at(-1);
 assert.ok(a.includes('A16_ANONYMOUS_PRIVATE_CANARY'));
 assert.ok(b.includes('A16_ANONYMOUS_PRIVATE_CANARY'));
 assert.equal(room.revision,oldRevision);
});
const bigBody=await route('/api/action',{method:'POST',cookie:blueCookie,body:{...cmd(2),payload:{blob:'x'.repeat(9000)}}});
check('26 original body parser rejects oversized JSON payload',()=>assert.equal(bigBody.status,400));
const bogusJoin=await route('/api/join',{method:'POST',body:{roomId:'../../bad'}});
check('27 original join endpoint rejects malformed room code',()=>assert.equal(bogusJoin.status,400));
const extraReady=await route('/api/ready',{method:'POST',cookie:redCookie,body:{team:'red'}});
check('28 ready packet with extra fields rejected',()=>assert.equal(extraReady.status,400));
console.log('M45 PLATFORM-A16 '+count+'/28 ORIGINAL_SERVER_ROUTES_V8; NO_REAL_TCP_OR_RUST');
