/** M12 Ziggs recast, Brand conditional Q/R and Darius passive; not complete Riot kits. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,BOARD_KITS_V453_DEV69,checksumV40} from '../engine.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let count=0;const check=(name,fn)=>{fn();count++;console.log('✓ M12 '+name)};
function setup(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:6912,mode:'pvp',draft:{[team]:{MID:champ}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),enemy=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{champ,x:.5,y:.5,hp:1400,maxHp:1400,level:6,mana:1000,maxMana:1000,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:.522,y:.5,hp:2000,maxHp:2000,mr:0,armor:0});
 a.visible=()=>true;return {a,u,enemy,team,other};
}
check('M12 contract tags remain explicitly prototypes',()=>{
 assert.equal(BOARD_KITS_V453_DEV69.Ziggs.W.boardTemporal,'satchel_charge');
 assert.equal(BOARD_KITS_V453_DEV69.Brand.Q.stunIfAblaze,true);
 assert.equal(BOARD_KITS_V453_DEV69.Brand.R.brandChain,3);
 assert.equal(BOARD_KITS_V453_DEV69.Darius.R.dariusExecutionScale,.2);
});
for(const team of ['blue','red']){
 const z=setup('Ziggs',team);
 check(team+' Ziggs W persists and can recast without a second mana/CD charge',()=>{
  assert.equal(z.a.queueKitSkillV42(team,z.u.id,'W',{x:z.enemy.x,y:z.enemy.y}).ok,true);
  z.a.resolveBoardSkillsV453Dev69();
  assert.equal(z.u.mana,920);assert.equal(z.enemy.hp,2000);
  const cd=z.u.skillCds.W;
  const q=z.a.queueKitSkillV42(team,z.u.id,'W',null);
  assert.equal(q.ok,true);assert.equal(q.recast,true);
  assert.equal(z.a.queueKitSkillV42(team,z.u.id,'W',null).ok,false);
  z.a.resolveBoardSkillsV453Dev69();
  assert.equal(z.u.mana,920);assert.equal(z.u.skillCds.W,cd);
  assert.ok(z.enemy.hp<2000);assert.equal(z.a.boardTemporalV453Dev69.length,0);
  const hp=z.enemy.hp;z.a.resolveBoardSkillsV453Dev69();assert.equal(z.enemy.hp,hp);
  assert.equal(z.a.queueKitSkillV42(team,z.u.id,'W',null).ok,false);
  assert.equal(z.a.queueKitSkillV42(z.other,z.u.id,'W',null).ok,false);
 });
 const a=setup('Ziggs',team);
 check(team+' Ziggs auto detonation fires once and snapshot remains identical',()=>{
  a.a.queueKitSkillV42(team,a.u.id,'W',{x:a.enemy.x,y:a.enemy.y});
  a.a.resolveBoardSkillsV453Dev69();
  const cp=Arena.fromSnapshotV40(map,mask,a.a.snapshotV40());
  assert.equal(checksumV40(a.a.snapshotV40()),checksumV40(cp.snapshotV40()));
  a.a.gameTime=4;a.a.advanceBoardTemporalV453Dev69();
  assert.ok(a.enemy.hp<2000);assert.equal(a.a.boardTemporalV453Dev69.length,0);
  const hp=a.enemy.hp;a.a.advanceBoardTemporalV453Dev69();assert.equal(a.enemy.hp,hp);
 });
 const b=setup('Brand',team);
 check(team+' Brand Q first applies Ablaze without inventing a stun',()=>{
  assert.equal(b.a.queueDirectionalSkill(team,b.u.id,'Q',{x:.9,y:.5}).ok,true);
  b.a.resolveBoardSkillsV453Dev69();
  assert.equal(b.a.effectResolverV41().has(b.enemy,'stun'),false);
  assert.ok((b.enemy.boardBrandAblazeV453Dev69?.[b.u.id]||0)>0);
 });
 const marked=setup('Brand',team);
 check(team+' Brand W Ablaze into Q stuns marked enemy',()=>{
  marked.a.queueKitSkillV42(team,marked.u.id,'W',{x:marked.enemy.x,y:marked.enemy.y});
  marked.a.resolveBoardSkillsV453Dev69();marked.a.gameTime=1;
  marked.a.queueDirectionalSkill(team,marked.u.id,'Q',{x:.9,y:.5});
  marked.a.resolveBoardSkillsV453Dev69();
  assert.ok(marked.a.effectResolverV41().has(marked.enemy,'stun'));
 });
 const c=setup('Brand',team);
 check(team+' Brand R finds exactly nearby alternate enemies',()=>{
  const second=c.a.units.find(v=>v.id===c.other+'_TOP'),
   third=c.a.units.find(v=>v.id===c.other+'_JG');
  Object.assign(second,{x:.535,y:.5,hp:2000,maxHp:2000,mr:0});
  Object.assign(third,{x:.548,y:.5,hp:2000,maxHp:2000,mr:0});
  assert.equal(c.a.queueTargetedSkill(team,c.u.id,'R',c.enemy.id).ok,true);
  c.a.resolveBoardSkillsV453Dev69();
  assert.ok(c.enemy.hp<2000);assert.ok(second.hp<2000);assert.ok(third.hp<2000);
 });
 const d=setup('Darius',team);
 check(team+' Darius AAs build up to five separate stable bleed stacks',()=>{
  for(let i=0;i<6;i++)d.a.damage(d.enemy,2,d.u,'physical','basic');
  assert.equal(d.enemy.boardHemorrhageV453Dev69[d.u.id].stacks,5);
  const cp=Arena.fromSnapshotV40(map,mask,d.a.snapshotV40());
  assert.equal(cp.units.find(v=>v.id===d.enemy.id).boardHemorrhageV453Dev69[d.u.id].stacks,5);
 });
 check(team+' Darius R benefits from existing stacks before spell damage',()=>{
  const plain=setup('Darius',team);
  d.enemy.hp=2000;d.enemy.maxHp=2000;
  d.a.gameTime=1;plain.a.gameTime=1;
  assert.equal(d.a.queueTargetedSkill(team,d.u.id,'R',d.enemy.id).ok,true);
  assert.equal(plain.a.queueTargetedSkill(team,plain.u.id,'R',plain.enemy.id).ok,true);
  d.a.resolveBoardSkillsV453Dev69();plain.a.resolveBoardSkillsV453Dev69();
  const high=2000-d.enemy.hp,base=2000-plain.enemy.hp;
  assert.ok(high>base*1.6,String(high)+' vs '+String(base));
 });
 const expired=setup('Darius',team);
 check(team+' Darius passive expires and next AA starts with one stack',()=>{
  expired.a.damage(expired.enemy,2,expired.u,'physical','basic');
  expired.a.gameTime=6;expired.a.damage(expired.enemy,2,expired.u,'physical','basic');
  assert.equal(expired.enemy.boardHemorrhageV453Dev69[expired.u.id].stacks,1);
 });
}
async function webQA(){
 const app=createPvPServerV453Dev47({tickMs:0});
 const address=await app.listen(0,'127.0.0.1'),base='http://127.0.0.1:'+address.port;
 const post=(path,cookie,payload)=>fetch(base+'/api/'+path,{method:'POST',
  headers:{'content-type':'application/json',...(cookie?{cookie}:{})},body:JSON.stringify(payload)});
 try{
  const cr=await post('create',null,{maxSeats:2}),blue=await cr.json(),
   blueCookie=cr.headers.get('set-cookie')?.split(';')[0];
  const jr=await post('join',null,{roomId:blue.roomId}),
   redCookie=jr.headers.get('set-cookie')?.split(';')[0];
  assert.equal(jr.status,200);
  const room=app.rooms.get(blue.roomId),u=room.arena.units.find(v=>v.id==='blue_MID');
  Object.assign(u,{champ:'Ziggs',x:.5,y:.5,level:6,mana:1000,
   skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
  const placed=await post('action',blueCookie,{sequence:1,kind:'skill.ground',
   unitId:u.id,payload:{slot:'W',point:{x:.522,y:.5}}});
  assert.equal(placed.status,200);
  room.arena.resolveBoardSkillsV453Dev69();
  const own=await (await fetch(base+'/api/session',{headers:{cookie:blueCookie}})).json(),
   other=await (await fetch(base+'/api/session',{headers:{cookie:redCookie}})).json();
  assert.equal(own.projection.boardRecastsV453Dev69.blue_MID[0].slot,'W');
  assert.equal(Object.values(other.projection.boardRecastsV453Dev69).flat().length,0);
  count++;console.log('✓ M12 owner-only HTTP recast readiness');
  const stolen=await post('action',redCookie,{sequence:1,kind:'skill.self',
   unitId:u.id,payload:{slot:'W'}});
  assert.equal(stolen.status,409);
  const mana=u.mana;
  const proper=await post('action',blueCookie,{sequence:2,kind:'skill.self',
   unitId:u.id,payload:{slot:'W'}});
  assert.equal(proper.status,200);
  room.arena.resolveBoardSkillsV453Dev69();
  assert.equal(u.mana,mana);assert.equal(room.arena.boardTemporalV453Dev69.length,0);
  count++;console.log('✓ M12 HTTP unauthorized opponent denied, authorized free recast');
 }finally{await app.close();}
}
await webQA();
console.log('DEV69 M12 '+count+'/'+count+' PASS');
