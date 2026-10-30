/** M14 Kalista Fate's Call API bound to the cross-branch Black Spear oath.
 * The ITEM implementation lives on items-full-audit until integrator merges.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
import {AuthoritativeActionsV453Dev47} from '../multiplayer/authoritative_actions_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
const file=x=>JSON.parse(readFileSync(new URL('../data/'+x,import.meta.url)));
const map=file('coachlol_map_v6.json'),mask=file('masks_128.json');
let count=0;function check(name,fn){fn();count++;console.log('✓ M14 KALISTA '+name)}
function fixture(team){
 const other=team==='blue'?'red':'blue',a=new Arena(map,mask,{seed:6916,mode:'pvp',draft:{[team]:{MID:'Kalista'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoJungle:false,autoFarm:false});
 const u=a.units.find(v=>v.id===team+'_MID'),ally=a.units.find(v=>v.id===team+'_TOP'),
  enemy=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{x:.5,y:.5,champ:'Kalista',hp:1250,maxHp:1250,mana:1000,maxMana:1000,
  level:6,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(ally,{x:.511,y:.5,hp:1500,maxHp:1500,stasisUntil:0});
 Object.assign(enemy,{x:.53,y:.5,hp:1500,maxHp:1500});
 a.visible=()=>true;return {a,u,ally,enemy,team,other};
}
for(const team of ['blue','red']){
 const z=fixture(team);
 check(team+' R unavailable without Black Spear oath',()=>{
  const x=z.a.queueSpecialUltimate(team,z.u.id);
  assert.equal(x.ok,false);assert.match(x.reason,/juramentado/);
 });
 z.u.oathswornIdV453Dev69C=z.ally.id;
 check(team+' R queues once and launch target is locked during planning',()=>{
  const r=z.a.queueSpecialUltimate(team,z.u.id);
  assert.equal(r.ok,true,r.reason);
  const land={x:.528,y:.5};
  const q=z.a.queueKalistaLaunchV453M14(team,z.u.id,land);
  assert.equal(q.ok,true,q.reason);
  assert.equal(z.a.queueKalistaLaunchV453M14(z.other,z.u.id,land).ok,false);
 });
 check(team+' real R spends one cost, recalls bound ally into stasis and persists',()=>{
  z.a.resolveSpecialUltimates();
  assert.equal(z.u.mana,900);
  assert.ok(z.ally.stasisUntil>z.a.gameTime);
  assert.equal(z.ally.fatesHeldByV453M14,z.u.id);
  assert.equal(z.a.mapDistance(z.ally,z.u),0);
  const clone=Arena.fromSnapshotV40(map,mask,z.a.snapshotV40());
  assert.equal(checksumV40(z.a.snapshotV40()),checksumV40(clone.snapshotV40()));
 });
 check(team+' launch resolves 1s later, clears stasis and knocks up nearby enemy',()=>{
  z.a.gameTime=1;z.a.advanceKalistaFatesV453M14();
  assert.equal(z.u.fatesCallV453M14,null);
  assert.equal(z.ally.fatesHeldByV453M14,null);
  assert.equal(z.ally.stasisUntil,0);
  assert.ok(z.a.mapDistance(z.ally,{x:.528,y:.5})<1);
  assert.equal(z.a.effectResolverV41().has(z.enemy,'knockup'),true);
 });
 check(team+' no second launch, no second charge or leftover effect',()=>{
  const position={x:z.ally.x,y:z.ally.y},mana=z.u.mana;
  z.a.gameTime=2;z.a.advanceKalistaFatesV453M14();
  assert.deepEqual({x:z.ally.x,y:z.ally.y},position);
  assert.equal(z.u.mana,mana);
  assert.equal(z.a.queueKalistaLaunchV453M14(team,z.u.id,{x:.51,y:.5}).ok,false);
 });
}
async function http(){
 const server=createPvPServerV453Dev47({tickMs:0});
 const addr=await server.listen(0,'127.0.0.1'),origin='http://127.0.0.1:'+addr.port;
 const post=(path,cookie,payload)=>fetch(origin+'/api/'+path,{method:'POST',headers:{
  'content-type':'application/json',...(cookie?{cookie}:{})},body:JSON.stringify(payload)});
 try{
  const created=await post('create',null,{maxSeats:2}),blue=await created.json(),
   blueCookie=created.headers.get('set-cookie')?.split(';')[0];
  const joined=await post('join',null,{roomId:blue.roomId}),
   redCookie=joined.headers.get('set-cookie')?.split(';')[0];
  const room=server.rooms.get(blue.roomId),u=room.arena.units.find(v=>v.id==='blue_MID'),
   ally=room.arena.units.find(v=>v.id==='blue_TOP');
  Object.assign(u,{champ:'Kalista',x:.5,y:.5,level:6,mana:1000,
   skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0},
   oathswornIdV453Dev69C:ally.id});
  Object.assign(ally,{x:.51,y:.5});
  const r=await post('action',blueCookie,{sequence:1,kind:'skill.ultimate',unitId:u.id,payload:{}});
  assert.equal(r.status,200);
  const no=await post('action',redCookie,{sequence:1,kind:'skill.kalista_launch',
   unitId:u.id,payload:{point:{x:.527,y:.5}}});
  assert.equal(no.status,409);
  const yes=await post('action',blueCookie,{sequence:2,kind:'skill.kalista_launch',
   unitId:u.id,payload:{point:{x:.527,y:.5}}});
  assert.equal(yes.status,200);
  count++;console.log('✓ M14 KALISTA two-seat HTTP launch ownership');
  const kit=(await (await fetch(origin+'/api/kits',{headers:{cookie:blueCookie}})).json());
  assert.equal(kit.specials.Kalista.R.implemented,'oath_bound_prototype');
  count++;console.log('✓ M14 KALISTA authenticated manifest marks non-certified pact adapter');
 }finally{await server.close();}
}
await http();
console.log('DEV69 KALISTA M14 '+count+'/'+count+' PASS');
