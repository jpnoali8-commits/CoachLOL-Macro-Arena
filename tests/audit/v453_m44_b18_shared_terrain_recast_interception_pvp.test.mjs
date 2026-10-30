/* M44 B18: authoritative authored terrain + recast + dash interception, mirrored human seats. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,m44B14DOriginalBoardRuleV453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const scenarios=[];
function fixture(side,mine='Yorick',theirs='Annie'){
 const other=side==='blue'?'red':'blue';
 const a=new Arena(map,mask,{mode:'pvp',seed:18180,
  draft:{[side]:{MID:mine},[other]:{MID:theirs}}});
 for(const z of a.units)Object.assign(z,{x:.07,y:.07,hp:20000,maxHp:20000,
  armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const z of a.minions)Object.assign(z,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;
 const u=a.units.find(z=>z.id===side+'_MID'),v=a.units.find(z=>z.id===other+'_MID');
 for(const z of [u,v])Object.assign(z,{level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.525,y:.5});
 const execute=(actor,slot,options={})=>{
  const queued=a.queueBoardSkillV453Dev69(actor.team,actor.id,slot,options);
  assert.equal(queued.ok,true,JSON.stringify(queued));
  let receipt;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(who,q)=>{
   const result=original(who,q);if(who.id===actor.id)receipt=result;return result;};
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original}
  assert.ok(receipt,'real authoritative receipt missing');
  return receipt;
 };
 return {a,u,v,side,other,execute};
}
const test=(name,mine,opponent,run)=>scenarios.push({name,mine,opponent,run});
test('yorick circular collider and A* trap','Yorick','Annie',({a,u,v,execute})=>{
 assert.equal(execute(u,'W',{point:{x:v.x,y:v.y}}).wallCollisionCertified,true);
 const inside={x:v.x,y:v.y},outside={x:.555,y:.5};
 assert.ok(a.m44B18SkillWallsV453().some(w=>w.shape==='ring'));
 assert.equal(a.walkable(v.x+220/a.worldWidth,v.y),false);
 assert.equal(a.obstacleLine(inside,outside),true);
 assert.equal(a.findPath(inside,outside),null,'closed cage should have no A* path');
 a.gameTime+=5;
 assert.equal(a.obstacleLine(inside,outside),false);
 assert.ok(a.findPath(inside,outside),'path restored after ring expires');
});
test('taliyah wall segment collision and expiration','Taliyah','Annie',({a,u,v,execute})=>{
 assert.equal(execute(u,'R',{point:{x:.53,y:.5}}).wallCollisionCertified,true);
 const from={x:.525,y:.48},to={x:.525,y:.52};
 assert.equal(a.obstacleLine(from,to),true);
 assert.equal(a.walkable(.525,.5),false);
 const snap=a.snapshotV40();
 const restored=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(restored.obstacleLine(from,to),true);
 a.gameTime+=6;assert.equal(a.obstacleLine(from,to),false);
});
test('azir wall blocks crossing, A* routes around finite wall','Azir','Annie',({a,u,v,execute})=>{
 assert.equal(execute(u,'R',{point:{x:.53,y:.5}}).wallCollisionCertified,true);
 const from={x:.52,y:.5},to={x:.54,y:.5};
 assert.equal(a.obstacleLine(from,to),true);
 const path=a.findPath(from,to);assert.ok(path,'finite wall must allow a detour');
 const steps=[from,...path];
 for(let i=1;i<steps.length;i++)
  assert.equal(a.m44B18SkillWallLineV453(steps[i-1],steps[i]),false,
   'A* cannot cut a player-created wall');
 a.gameTime+=5;assert.equal(a.obstacleLine(from,to),false);
});
test('lissandra claw recast without second cost','Lissandra','Annie',({a,u,v,execute})=>{
 assert.equal(execute(u,'E',{point:{x:.54,y:.5}}).clawRecastAvailable,true);
 const mana=u.mana,cd=u.skillCds.E;
 a.gameTime+=1;
 const receipt=execute(u,'E');assert.equal(receipt.glacialPathTeleport,true);
 assert.equal(receipt.spentMana,0);
 assert.equal(u.mana,mana);assert.equal(u.skillCds.E,cd);
 assert.equal(u.x,.54);assert.equal(u.m44B17GlacialPath,null);
});
test('lissandra flight gate rejects early recast','Lissandra','Annie',({a,u,execute})=>{
 execute(u,'E',{point:{x:.54,y:.5}});
 const mana=u.mana,cd=u.skillCds.E;
 const fail=a.queueBoardSkillV453Dev69(u.team,u.id,'E');
 assert.equal(fail.reason,'m44_b18_claw_in_flight');
 assert.equal(u.mana,mana);assert.equal(u.skillCds.E,cd);
});
test('lissandra destination changed after queue fails closed','Lissandra','Annie',({a,u,execute})=>{
 execute(u,'E',{point:{x:.54,y:.5}});a.gameTime+=1;
 const mana=u.mana,cd=u.skillCds.E,x=u.x;
 assert.equal(a.queueBoardSkillV453Dev69(u.team,u.id,'E').ok,true);
 const old=a.walkable;a.walkable=()=>false;
 let receipt;const real=a.executeBoardSkillV453Dev69.bind(a);
 a.executeBoardSkillV453Dev69=(actor,q)=>(receipt=real(actor,q));
 try{a.resolveBoardSkillsV453Dev69()}finally{
  a.executeBoardSkillV453Dev69=real;a.walkable=old}
 assert.equal(receipt?.reason,'m44_b18_claw_destination_blocked');
 assert.equal(u.mana,mana);assert.equal(u.skillCds.E,cd);assert.equal(u.x,x);
});
for(const [enemy,slot,opts] of [
 ['Samira','E','target'],['Briar','R','target'],
 ['Diana','E','target'],['Ekko','E','point']])
 test('poppy W denies '+enemy+' '+slot+' before debit','Poppy',enemy,
 ({a,u,v,execute})=>{
  assert.equal(execute(u,'W').steadfastPresence,true);
  const mana=v.mana,cd=v.skillCds[slot],p=opts==='target'?
   {targetId:u.id}:{point:{x:.535,y:.5}};
  const q=a.queueBoardSkillV453Dev69(v.team,v.id,slot,p);
  assert.equal(q.ok,true,JSON.stringify(q));
  const real=a.executeBoardSkillV453Dev69.bind(a);let receipt;
  a.executeBoardSkillV453Dev69=(actor,cmd)=>{
   const r=real(actor,cmd);if(actor.id===v.id)receipt=r;return r;};
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=real}
  assert.equal(receipt?.reason,'m44_b17_poppy_anti_dash');
  assert.equal(v.mana,mana);assert.equal(v.skillCds[slot],cd);
  assert.ok(u.m44B17Steadfast.blocked>=1);
 });
test('poppy W does not reject taliyah wall cast','Poppy','Taliyah',
 ({a,u,v,execute})=>{
  execute(u,'W');
  const out=execute(v,'R',{point:{x:.54,y:.5}});
  assert.equal(out.weaversWall,true);
 });
test('poppy W does not reject Bard terrain portal','Poppy','Bard',
 ({a,u,v,execute})=>{
  execute(u,'W');
  const original=a.obstacleLine;
  a.obstacleLine=(p,to)=>p?.id===v.id&&to?.x===.54;
  try{
   const out=execute(v,'E',{point:{x:.54,y:.5}});
   assert.equal(out.magicalJourney,true);
  }finally{a.obstacleLine=original}
 });
test('Sylas stolen Azir R creates collision under Sylas owner','Sylas','Azir',
 ({a,u,v,execute})=>{
  assert.equal(a.queueSylasHijackV453M14(u.team,u.id,v.id).ok,true);
  a.resolveSylasHijacksV453M14();
  const receipt=execute(u,'R',{point:{x:.53,y:.5}});
  assert.equal(receipt.hijacked,true);
  assert.equal(u.champ,'Sylas');
  assert.ok(a.m44B18SkillWallsV453().some(w=>w.ownerId===u.id));
  assert.equal(a.obstacleLine({x:.52,y:.5},{x:.54,y:.5}),true);
 });
test('Viego copied Yorick W is owned by Viego source ID','Viego','Yorick',
 ({a,u,v,execute})=>{
  v.hp=100;a.damage(v,500,u,'true','spell');
  const soul=u.m44B14CSouls?.[0];assert.ok(soul);
  assert.equal(a.queueViegoPossessV453M44B14C(u.team,u.id,soul.id).ok,true);
  a.resolveBoardSkillsV453Dev69();
  assert.equal(u.champ,'Yorick');
  const out=execute(u,'W',{point:{x:.54,y:.5}});
  assert.equal(out.wallCollisionCertified,true);
  assert.ok(a.m44B18SkillWallsV453().some(w=>w.ownerId===u.id));
  assert.equal(u.id,u.team+'_MID');
 });
let passed=0,restored=0;const failures=[];
for(const side of ['blue','red'])for(const entry of scenarios){
 try{
  const f=fixture(side,entry.mine,entry.opponent);
  entry.run(f);const snap=f.a.snapshotV40();
  assert.equal(checksumV40(snap),checksumV40(
   Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  assert.equal(f.u.id,side+'_MID');assert.equal(f.u.team,side);
  passed++;restored++;
 }catch(e){failures.push({side,name:entry.name,error:String(e?.stack||e)})}
}
for(const v of failures)console.error('M44_B18_FAIL',JSON.stringify(v));
console.log('M44_B18 '+JSON.stringify({scenarios:scenarios.length,seats:2,
 passed,restored,failures:failures.length,completeKitsCertified:0}));
assert.equal(failures.length,0);assert.equal(passed,scenarios.length*2);
