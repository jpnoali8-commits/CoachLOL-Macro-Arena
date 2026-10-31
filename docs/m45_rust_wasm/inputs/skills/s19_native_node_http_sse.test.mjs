/**
 * Future actual Node.js TCP HTTP + SSE regression. SOURCE-ONLY, NOT_RUN here.
 * Run from repository root only when original JS modules and Node >=22 exist:
 *   node --test docs/m45_rust_wasm/inputs/skills/s19_native_node_http_sse.test.mjs
 * This is a temporary test of frozen legacy behavior; NOT a JS production
 * feature, not Rust/WASM certification. Does not trigger GitHub Actions.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomBytes,createHash} from 'node:crypto';
import {Arena} from '../../../../engine.mjs';
import {PvPRoomV453Dev47} from '../../../../multiplayer/room_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../../../../multiplayer/server_v453_dev47.mjs';

const read=n=>JSON.parse(readFileSync(new URL('../../../../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const opposite=t=>t==='blue'?'red':'blue';
async function onceSSE(response){
 const stream=response.body.getReader();
 const decoder=new TextDecoder();
 let pending='';
 try{
  for(let i=0;i<12;i++){
   const {done,value}=await stream.read();
   if(done)break;
   pending+=decoder.decode(value,{stream:true});
   const match=pending.match(/event: state\ndata: ([^\n]+)\n\n/);
   if(match)return JSON.parse(match[1]);
  }
  throw new Error('SSE first state not received');
 }finally{await stream.cancel().catch(()=>{});}
}
async function check(ourTeam,enemyKind){
 const enemyTeam=opposite(ourTeam);
 const arena=new Arena(map,mask,{seed:1919,mode:'pvp',
  draft:{[enemyTeam]:{TOP:'Neeko',MID:'Shaco'},[ourTeam]:{MID:'Ahri'}}});
 for(const u of arena.units)Object.assign(u,{x:.08,y:.08,autoAttack:false,
  autoFollow:false,autoFarm:false,autoJungle:false});
 const neeko=arena.units.find(u=>u.id===enemyTeam+'_TOP'),
  shaco=arena.units.find(u=>u.id===enemyTeam+'_MID'),
  defender=arena.units.find(u=>u.id===ourTeam+'_MID');
 for(const u of [neeko,shaco,defender])Object.assign(u,{
  hp:1500,maxHp:1500,level:6,mana:1000,maxMana:1000,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(neeko,{x:.51,y:.5});Object.assign(shaco,{x:.52,y:.5});
 Object.assign(defender,{x:.49,y:.5});
 arena.canSeePoint=()=>true; // controlled fog, actual sockets and cookie SHA
 assert.equal(arena.queueNeekoDisguiseV453M15(enemyTeam,neeko.id,shaco.id).ok,true);
 assert.equal(arena.queueKitSkillV42(enemyTeam,shaco.id,'R',{x:.54,y:.5}).ok,true);
 arena.resolveBoardSkillsV453Dev69();
 const attacker=enemyKind==='Neeko'?neeko:shaco;
 const publicAlias=enemyKind==='Neeko'?neeko.neekoDisguiseV453M15.publicId:
  shaco.shacoPublicAliasV453M15;
 arena.gameTime=2;
 assert.equal(arena.duelPermission(attacker,defender),true);
 assert.ok(arena.damage(defender,65,attacker,'physical','basic')>0);
 arena.gameTime=3;arena.processAmbushResponses();arena.phase='decision';
 assert.equal(arena.pendingDecision.enemyId,attacker.id);
 const tokens={blue:randomBytes(32).toString('hex'),red:randomBytes(32).toString('hex')};
 const players=['blue','red'].map((team,i)=>({seatId:'p'+(i+1),team,
  role:'MID',unitId:team+'_MID',
  tokenHash:createHash('sha256').update(tokens[team]).digest('hex')}));
 const room=new PvPRoomV453Dev47({id:'19191919',arena,maxSeats:2,
  restored:{players}});
 const registry={rooms:new Map([[room.id,room]]),
  session(token){
   const player=room.authenticate(token);
   return player?{room,player}:null;
  }};
 const service=createPvPServerV453Dev47({registry,tickMs:0});
 let opened=false;
 try{
  const addr=await service.listen(0,'127.0.0.1');opened=true;
  const base='http://127.0.0.1:'+addr.port;
  const visit=(team,path,options={})=>fetch(base+path,{
   ...options,headers:{
    ...(team?{cookie:'coachlol_pvp47='+tokens[team]}:{}),
    ...(options.body?{'content-type':'application/json'}:{}),
    ...options.headers
   }
  });
  const own=await visit(ourTeam,'/api/session');
  assert.equal(own.status,200);
  const view=await own.json();
  assert.ok(view.projection.units.some(u=>u.id===publicAlias));
  assert.ok(!view.projection.units.some(u=>u.id===attacker.id));
  // Intentional bug witness: this should FAIL once Rust/legacy fixed.
  assert.equal(view.pendingDecision.enemyId,attacker.id);
  const other=await (await visit(enemyTeam,'/api/session')).json();
  assert.equal(other.pendingDecision,null);
  const unauthorized=await visit(null,'/api/session');
  assert.equal(unauthorized.status,401);
  const controller=new AbortController();
  const limit=setTimeout(()=>controller.abort(),5000);
  try{
   const events=await visit(ourTeam,'/api/stream',{signal:controller.signal});
   assert.equal(events.status,200);
   const packet=await onceSSE(events);
   assert.equal(packet.pendingDecision.enemyId,attacker.id);
  }finally{clearTimeout(limit);controller.abort();}
  const forged=await visit(ourTeam,'/api/action',{
   method:'POST',body:JSON.stringify({sequence:1,kind:'decision.reaction',
    unitId:defender.id,payload:{targetId:attacker.id,response:'fight',steps:[]}})
  });
  assert.equal(forged.status,409);
  assert.equal((await forged.json()).reason,'alvo_identidade_oculta');
  const allowed=await visit(ourTeam,'/api/action',{
   method:'POST',body:JSON.stringify({sequence:1,kind:'decision.reaction',
    unitId:defender.id,payload:{targetId:publicAlias,response:'fight',steps:[]}})
  });
  assert.equal(allowed.status,200);
  assert.equal((await allowed.json()).ok,true);
  assert.equal(arena.pendingDecision,null);
 }finally{
  if(opened)await service.close();
 }
}
for(const team of ['blue','red'])
 for(const enemyKind of ['Neeko','Shaco'])
  test('S19 legacy real network P1 witness '+team+' vs '+enemyKind,
   async()=>{await check(team,enemyKind);});
