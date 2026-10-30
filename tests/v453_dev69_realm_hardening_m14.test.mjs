/** M14b — Realm edge and cross-dimensional command safety contracts.
 * This prevents resource spend for impossible moves and attack orders.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
const file=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=file('coachlol_map_v6.json'),mask=file('masks_128.json');
let count=0;
function check(label,fn){fn();count++;console.log('✓ M14b '+label);}
function setup(team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:69148,mode:'pvp',draft:{[team]:{MID:'Mordekaiser'}}});
 for(const u of a.units)Object.assign(u,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const m=a.units.find(u=>u.id===team+'_MID'),foe=a.units.find(u=>u.id===other+'_MID');
 Object.assign(m,{champ:'Mordekaiser',x:.5,y:.5,hp:1500,maxHp:1500,level:6,mana:100,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(foe,{x:.525,y:.5,hp:1500,maxHp:1500});
 a.visible=()=>true;
 assert.equal(a.startRealmV453Dev69(m,foe).ok,true);
 const realm=a.realmContextV453Dev69;
 return {a,m,foe,team,other,realm};
}
function boundary(a,r){
 for(let k=0;k<128;k++){
  const angle=k*2*Math.PI/128,
   calc=(d)=>({x:r.centerWorld.x+Math.cos(angle)*d/a.worldWidth,
    y:r.centerWorld.y+Math.sin(angle)*d/a.worldHeight});
  const inside=calc(1100),outside=calc(1320);
  if(a.walkable(inside.x,inside.y)&&a.walkable(outside.x,outside.y))
   return {inside,outside};
 }
 throw Error('Fixture: no walkable rim pair for realm boundary');
}
for(const team of ['blue','red']){
 const t=setup(team);
 check(team+' planned paths may not leave the actual realm circle',()=>{
  const rim=boundary(t.a,t.realm);
  assert.equal(t.a.realmValidV453Dev69(t.m,rim.inside),true);
  assert.equal(t.a.realmValidV453Dev69(t.m,rim.outside),false);
  assert.equal(t.a.realmPathValidV453M14(t.m,rim.inside,
   [rim.outside,rim.inside]),false);
  const n=t.a.setPlan(team,t.m.id,[{point:rim.outside,action:'move',duration:0}]);
  assert.equal(n.ok,false);
 });
 check(team+' Flash cannot cross border and consumes no cooldown',()=>{
  const rim=boundary(t.a,t.realm);
  t.m.x=rim.inside.x;t.m.y=rim.inside.y;
  t.realm.lastValid[t.m.id]={...rim.inside};
  const current=t.m.flashCd||0,point={x:t.m.x,y:t.m.y};
  const cast=t.a.castEscape(team,t.m.id,'flash',rim.outside);
  assert.equal(cast.ok,false);
  assert.equal(cast.reason,'reino_limite_ou_colisor');
  assert.equal(t.m.flashCd||0,current);
  assert.deepEqual({x:t.m.x,y:t.m.y},point);
 });
 check(team+' Teleport is unavailable inside realm without spend',()=>{
  t.m.summonerSlots=['flash','tp'];t.m.tpCd=0;
  const tp=t.a.queueSummoner(team,t.m.id,'tp',null);
  assert.equal(tp.ok,false);assert.equal(tp.reason,'teleporte_incompativel_com_reino');
  assert.equal(t.m.tpCd,0);
 });
 check(team+' realm blocks external ward / farming plan without spending charges',()=>{
  const count=t.m.wardCharges;
  const ward=t.a.setOrder(team,t.m.id,{kind:'ward',
   destination:{x:t.m.x,y:t.m.y},wardType:'stealth'});
  assert.equal(ward.ok,false);assert.equal(ward.reason,'reino_ordem_fora_do_duelo');
  const planned=t.a.setPlan(team,t.m.id,[{point:{x:t.m.x,y:t.m.y},action:'jungle',duration:0}]);
  assert.equal(planned.ok,false);
  assert.equal(t.m.wardCharges,count);
 });
 check(team+' cross-realm attack, Ignite and target references are denied',()=>{
  const outside=t.a.units.find(u=>u.team===t.other&&u.id!==t.foe.id);
  Object.assign(outside,{x:t.m.x+.01,y:t.m.y,hp:1000});
  const attack=t.a.setOrder(team,t.m.id,{kind:'attack',targetId:outside.id});
  assert.equal(attack.ok,false);assert.equal(attack.reason,'reino_alvo_fora_do_duelo');
  t.m.summonerSlots=['flash','ignite'];
  const ignite=t.a.queueSummoner(team,t.m.id,'ignite',outside.id);
  assert.equal(ignite.ok,false);assert.equal(ignite.reason,'alvo_em_outro_reino');
  assert.equal(t.m.igniteCd||0,0);
  assert.equal(t.a.queueSummoner(team,t.m.id,'ignite',t.foe.id).ok,true,
   'legal enemy inside realm must still be usable');
 });
 check(team+' realm checkpoint includes latest owned coordinate and private state',()=>{
  const restored=Arena.fromSnapshotV40(map,mask,t.a.snapshotV40());
  assert.equal(checksumV40(restored.snapshotV40()),checksumV40(t.a.snapshotV40()));
  assert.equal(restored.realmContextV453Dev69.id,t.realm.id);
  t.a.gameTime=7;t.a.advanceRealmV453Dev69();
  assert.equal(t.a.realmContextV453Dev69,null);
  assert.ok(t.a.walkable(t.m.x,t.m.y));
 });
}
console.log('DEV69 REALM HARDENING M14 '+count+'/'+count+' PASS');
