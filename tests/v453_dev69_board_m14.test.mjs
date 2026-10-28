/** M14 — Mordekaiser realm and spatial authoritative contracts.
 * Realm infrastructure is not a claim of complete Mordekaiser QWER parity.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
const file=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=file('coachlol_map_v6.json'),mask=file('masks_128.json');
let count=0;
function check(label,fn){fn();count++;console.log('✓ M14 '+label)}
function setup(team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:6914,mode:'pvp',draft:{[team]:{MID:'Mordekaiser'}}});
 for(const u of a.units)Object.assign(u,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const m=a.units.find(u=>u.id===team+'_MID'),enemy=a.units.find(u=>u.id===other+'_MID');
 Object.assign(m,{champ:'Mordekaiser',x:.5,y:.5,level:6,hp:1300,maxHp:1300,mana:0,maxMana:100,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:.525,y:.5,hp:1800,maxHp:1800});
 a.visible=()=>true;
 return {a,m,enemy,team,other};
}
for(const team of ['blue','red']){
 const {a,m,enemy,other}=setup(team);
 check(team+' R authoritatively starts 7s realm at target map position',()=>{
  assert.equal(a.queueSpecialUltimate(team,m.id,enemy.id).ok,true);
  a.resolveSpecialUltimates();
  const r=a.realmContextV453Dev69;
  assert.ok(r);assert.equal(r.radiusWorld,1200);assert.equal(r.endsAt,7);
  assert.deepEqual(r.centerWorld,{x:enemy.x,y:enemy.y});
  assert.equal(m.skillCds.R>0,true);
  assert.equal(m.mana,0,'Mordekaiser is manaless');
  assert.equal(a.units.length,10,'realm never spawns copied champions');
 });
 check(team+' both seats receive realm overlay but main world hides enemy realm actor',()=>{
  const self=a.perspective(team),otherView=a.perspective(other);
  assert.ok(self.realm&&otherView.realm);
  assert.equal(self.realm.units.length,2);
  assert.equal(otherView.realm.units.length,2);
  assert.ok(self.units.find(u=>u.id===m.id),'owner retains HUD unit');
  assert.ok(otherView.units.find(u=>u.id===enemy.id),'other owner retains HUD unit');
  assert.equal(self.units.some(u=>u.id===enemy.id),false);
  assert.equal(otherView.units.some(u=>u.id===m.id),false);
  assert.equal(self.realm.terrain.length,25);
  for(const row of self.realm.terrain)
   assert.equal(row.wall.length,25);
 });
 check(team+' damage crosses NO dimensions; realm duel damage still applies',()=>{
  const outside=a.units.find(u=>u.team===team&&u.id!==m.id);
  const outsideEnemy=a.units.find(u=>u.team===other&&u.id!==enemy.id);
  const hpM=m.hp,hpEnemy=enemy.hp;
  assert.equal(a.damage(m,125,outsideEnemy,'physical','spell'),0);
  assert.equal(a.damage(outsideEnemy,125,m,'magic','spell'),0);
  assert.equal(a.damage(enemy,125,outside,'magic','spell'),0);
  assert.equal(m.hp,hpM);assert.equal(enemy.hp,hpEnemy);
  const actual=a.damage(enemy,125,m,'magic','spell');
  assert.ok(actual>0);assert.equal(enemy.hp<hpEnemy,true);
 });
 check(team+' circle and original wall mask constrain movement',()=>{
  const r=a.realmContextV453Dev69,far={
   x:r.centerWorld.x+1500/a.worldWidth,y:r.centerWorld.y};
  assert.equal(a.realmValidV453Dev69(m,far),false);
  assert.equal(a.setOrder(team,m.id,{kind:'move',destination:far}).ok,false);
  const legal={x:r.centerWorld.x-150/a.worldWidth,y:r.centerWorld.y};
  assert.equal(a.realmValidV453Dev69(m,legal),a.walkable(legal.x,legal.y));
  const wallPoint={x:.01,y:.01};
  assert.equal(a.realmValidV453Dev69(m,wallPoint),false);
 });
 check(team+' world movement inside realm becomes actual return position',()=>{
  const from={x:m.x,y:m.y},candidate={x:m.x+.004,y:m.y};
  assert.equal(a.realmValidV453Dev69(m,candidate),true);
  m.x=candidate.x;m.y=candidate.y;
  a.gameTime=3;a.advanceRealmV453Dev69();
  const before={x:m.x,y:m.y};
  const snap=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
  assert.equal(checksumV40(snap.snapshotV40()),checksumV40(a.snapshotV40()));
  a.gameTime=7;a.advanceRealmV453Dev69();
  assert.equal(a.realmContextV453Dev69,null);
  assert.deepEqual({x:m.x,y:m.y},before);
  assert.notDeepEqual({x:m.x,y:m.y},from);
 });
 const death=setup(team);
 check(team+' death cancels realm; no stuck circle or persistent overlay',()=>{
  death.a.startRealmV453Dev69(death.m,death.enemy);
  death.enemy.hp=0;death.a.advanceRealmV453Dev69();
  assert.equal(death.a.realmContextV453Dev69,null);
  assert.equal(death.a.perspective(team).realm,null);
 });
 const changed=setup(team);
 check(team+' elemental geometry revision change ends realm deterministically',()=>{
  changed.a.startRealmV453Dev69(changed.m,changed.enemy);
  changed.a.riftV452d4.revision++;
  changed.a.advanceRealmV453Dev69();
  assert.equal(changed.a.realmContextV453Dev69,null);
 });
}
async function httpQA(){
 const app=createPvPServerV453Dev47({tickMs:0});
 const address=await app.listen(0,'127.0.0.1'),url='http://127.0.0.1:'+address.port;
 const post=(path,cookie,body)=>fetch(url+'/api/'+path,{method:'POST',headers:{
  'content-type':'application/json',...(cookie?{cookie}:{})},body:JSON.stringify(body)});
 try{
  const created=await post('create',null,{maxSeats:2}),blue=await created.json(),
   bCookie=created.headers.get('set-cookie').split(';')[0];
  const joined=await post('join',null,{roomId:blue.roomId}),
   rCookie=joined.headers.get('set-cookie').split(';')[0];
  assert.equal(joined.status,200);
  const room=app.rooms.get(blue.roomId),
   u=room.arena.units.find(u=>u.id==='blue_MID'),
   foe=room.arena.units.find(u=>u.id==='red_MID');
  Object.assign(u,{champ:'Mordekaiser',x:.5,y:.5,hp:1200,level:6,mana:0,
   skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
  Object.assign(foe,{x:.525,y:.5,hp:1000});
  const attack=await post('action',bCookie,{sequence:1,kind:'skill.ultimate',
   unitId:u.id,payload:{targetId:foe.id}});
  assert.equal(attack.status,200);
  room.arena.resolveSpecialUltimates();
  const bView=(await (await fetch(url+'/api/session',{headers:{cookie:bCookie}})).json()).projection,
   rView=(await (await fetch(url+'/api/session',{headers:{cookie:rCookie}})).json()).projection;
  assert.ok(bView.realm&&rView.realm);
  assert.equal(bView.realm.id,rView.realm.id);
  count++;console.log('✓ M14 two authenticated browser-seat projections render same realm');
  const html=await (await fetch(url+'/multiplayer.html')).text(),
   js=await (await fetch(url+'/multiplayer/pvp_client_v453_dev47.js')).text();
  assert.ok(html.includes('realmOverlayV453')&&html.includes('realmCanvasV453'));
  assert.ok(js.includes('renderRealmV453')&&js.includes('realm.terrain'));
  count++;console.log('✓ M14 served PvP UI includes upper-left realm viewport and terrain renderer');
 }finally{await app.close();}
}
await httpQA();
console.log('DEV69 M14 '+count+'/'+count+' PASS');
