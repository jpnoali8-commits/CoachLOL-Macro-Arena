/* M44 B33A — Sion, Ornn, Yasuo six authored Q/W identity contracts, mirrored PvP. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,m44B14DOriginalBoardRuleV453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
function fixture(team,champ){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{mode:'pvp',seed:333301,
  draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const z of a.units)Object.assign(z,{x:.06,y:.06,hp:20000,maxHp:20000,armor:0,mr:0,
  autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false,level:16,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 for(const z of a.minions)Object.assign(z,{x:.06,y:.06});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const u=a.units.find(z=>z.id===team+'_MID'),v=a.units.find(z=>z.id===other+'_MID');
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.525,y:.5});
 function cast(slot,args={}){
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,args);
  assert.equal(q.ok,true,'queue '+JSON.stringify(q));
  let receipt;const old=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(z,action)=>{const got=old(z,action);
   if(z.id===u.id)receipt=got;return got;};
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=old;}
  assert.equal(receipt?.ok,true,'commit '+JSON.stringify(receipt));
  return receipt;
 }
 function checkpoint(){
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
 }
 return {a,u,v,team,other,cast,checkpoint};
}
let passed=0,snapshots=0;
for(const team of ['blue','red']){
 const run=(name,fn)=>{try{const f=fn();f.checkpoint();snapshots++;passed++}
  catch(e){throw Error(team+' '+name+': '+String(e.stack||e))}};
 run('exact six slots, no generic fallback',()=>{
  const f=fixture(team,'Sion');
  for(const c of ['Sion','Ornn','Yasuo'])for(const slot of ['Q','W'])
   assert.equal(m44B14DOriginalBoardRuleV453(c,slot).m44B33Id,c+'.'+slot);
  for(const c of ['Sion','Ornn','Yasuo'])for(const slot of ['E','R'])
   assert.equal(m44B14DOriginalBoardRuleV453(c,slot),null);
  return f;
 });
 run('Sion Q short charge does damage, not hard CC',()=>{
  const f=fixture(team,'Sion'),{u,v,a}=f;
  const start=v.hp,r=f.cast('Q',{point:{x:.55,y:.5},chargeSeconds:.5});
  assert.equal(r.chargeSeconds,.5);assert.ok(v.hp<start);
  assert.equal(a.effectResolverV41().has(v,'knockup'),false);
  assert.equal(a.effectResolverV41().has(v,'stun'),false);
  return f;
 });
 run('Sion Q full charge knocks up',()=>{
  const f=fixture(team,'Sion'),{v,a}=f;
  const r=f.cast('Q',{point:{x:.55,y:.5},chargeSeconds:1.7});
  assert.equal(r.decimatingSmash,true);assert.equal(r.hitCount,1);
  assert.equal(a.effectResolverV41().has(v,'knockup'),true);
  return f;
 });
 run('Sion Q charge gate rejects invalid without spending mana',()=>{
  const f=fixture(team,'Sion'),{u,a}=f,before=u.mana;
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'Q',{
   point:{x:.55,y:.5},chargeSeconds:2.3}).ok,false);
  assert.equal(u.mana,before);
  return f;
 });
 run('Sion W delayed recast, shield removed, no second mana/CD',()=>{
  const f=fixture(team,'Sion'),{a,u,v}=f;
  const r=f.cast('W');assert.equal(r.soulFurnace,true);
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'W').ok,false);
  const mana=u.mana,cd=u.skillCds.W,firstHp=v.hp;
  a.gameTime=1.1;const r2=f.cast('W');
  assert.equal(r2.recast,true);assert.equal(r2.spentMana,0);
  assert.equal(u.mana,mana);assert.equal(u.skillCds.W,cd);
  assert.ok(v.hp<firstHp);
  assert.equal(a.effectResolverV41().has(u,'shield'),false);
  return f;
 });
 run('Sion W depleted shield cannot explode',()=>{
  const f=fixture(team,'Sion'),{a,u,v}=f;f.cast('W');a.gameTime=1.1;
  a.damage(u,10000,v,'true','spell');
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'W').ok,false);
  return f;
 });
 run('Ornn Q fissure deals damage and creates delayed terrain',()=>{
  const f=fixture(team,'Ornn'),{a,v}=f,r=f.cast('Q',{point:{x:.55,y:.5}});
  assert.equal(r.volcanicRupture,true);assert.ok(v.hp<20000);
  assert.equal(a.m44B18SkillWallPointV453({x:.55,y:.5}),false);
  a.gameTime=1.126;
  assert.equal(a.m44B18SkillWallPointV453({x:.55,y:.5}),true);
  return f;
 });
 run('Ornn Q pillar eventually expires',()=>{
  const f=fixture(team,'Ornn'),{a}=f;
  f.cast('Q',{point:{x:.55,y:.5}});a.gameTime=5.126;
  assert.equal(a.m44B18SkillWallPointV453({x:.55,y:.5}),false);
  return f;
 });
 run('Ornn W marks Brittle and basic attack consumes owner mark',()=>{
  const f=fixture(team,'Ornn'),{a,u,v}=f;
  const r=f.cast('W',{point:{x:.55,y:.5}});
  assert.equal(r.bellowsBreath,true);assert.equal(r.hitCount,1);
  assert.ok(v.m44B33OrnnBrittle[u.id]>a.gameTime);
  a.attack(u,v,100);
  assert.equal(v.m44B33OrnnBrittle[u.id],undefined);
  assert.equal(a.effectResolverV41().has(v,'knockup'),true);
  return f;
 });
 run('Ornn W cone misses flank',()=>{
  const f=fixture(team,'Ornn'),{a,v}=f;
  Object.assign(v,{x:.5,y:.525});f.cast('W',{point:{x:.55,y:.5}});
  assert.equal(v.hp,20000);
  assert.equal(v.m44B33OrnnBrittle,undefined);
  return f;
 });
 run('Yasuo Q two stacks then long-range tornado',()=>{
  const f=fixture(team,'Yasuo'),{a,u,v}=f;
  assert.equal(f.cast('Q',{point:{x:.525,y:.5}}).tornado,false);
  a.gameTime=4.01;
  assert.equal(f.cast('Q',{point:{x:.525,y:.5}}).tornado,false);
  assert.equal(u.m44B33YasuoTempest.stacks,2);
  a.gameTime=8.02;Object.assign(v,{x:.55,y:.5});
  const r=f.cast('Q',{point:{x:.555,y:.5}});
  assert.equal(r.tornado,true);assert.equal(r.hitCount,1);
  assert.equal(a.effectResolverV41().has(v,'knockup'),true);
  assert.equal(u.m44B33YasuoTempest.stacks,0);
  return f;
 });
 run('Yasuo Q short-range gate and expired stacks',()=>{
  const f=fixture(team,'Yasuo'),{a,u}=f;
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'Q',{point:{x:.55,y:.5}}).ok,false);
  f.cast('Q',{point:{x:.525,y:.5}});a.gameTime=6.1;
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'Q',{point:{x:.55,y:.5}}).ok,false);
  return f;
 });
 run('Yasuo W wall intercepts enemy bolts only and expires',()=>{
  const f=fixture(team,'Yasuo'),{a,u,v}=f;
  const r=f.cast('W',{point:{x:.515,y:.5}});
  assert.equal(r.windWall,true);
  assert.ok(a.m44B21ProjectileBarrierHitV453({x:.54,y:.5},{x:.5,y:.5},
   f.other,v));
  assert.equal(a.m44B21ProjectileBarrierHitV453({x:.5,y:.5},{x:.54,y:.5},
   team,u),null);
  a.gameTime=4.01;
  assert.equal(a.m44B21ProjectileBarrierHitV453({x:.54,y:.5},{x:.5,y:.5},
   f.other,v),null);
  return f;
 });
 run('Sion W recast revalidates destroyed shield before execution',()=>{
  const f=fixture(team,'Sion'),{a,u,v}=f;f.cast('W');a.gameTime=1.1;
  const mana=u.mana,cd=u.skillCds.W;
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'W').ok,true);
  a.damage(u,9000,v,'true','spell');
  let receipt;const old=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(z,action)=>{const r=old(z,action);
   if(z.id===u.id)receipt=r;return r;};
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=old;}
  assert.equal(receipt.ok,false);assert.equal(u.mana,mana);
  assert.equal(u.skillCds.W,cd);return f;
 });
 run('Yasuo tornado loses reach if stacks expire between queue and commit',()=>{
  const f=fixture(team,'Yasuo'),{a,u,v}=f;
  f.cast('Q',{point:{x:.525,y:.5}});
  a.gameTime=4.01;f.cast('Q',{point:{x:.525,y:.5}});
  a.gameTime=8.02;
  const mana=u.mana,cd=u.skillCds.Q;
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'Q',{
   point:{x:.555,y:.5}}).ok,true);
  a.gameTime=10.02;
  let receipt;const old=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(z,action)=>{const r=old(z,action);
   if(z.id===u.id)receipt=r;return r;};
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=old;}
  assert.equal(receipt.ok,false);
  assert.equal(u.mana,mana);assert.equal(u.skillCds.Q,cd);return f;
 });
 run('Viego possession reuses original Sion Q source code',()=>{
  const f=fixture(team,'Viego'),{a,u,v,other}=f;
  v.champ='Sion';v.hp=100;
  a.damage(v,500,u,'true','spell');
  const soul=u.m44B14CSouls?.[0];assert.ok(soul);
  assert.equal(a.queueViegoPossessV453M44B14C(team,u.id,soul.id).ok,true);
  a.resolveBoardSkillsV453Dev69();
  assert.equal(u.champ,'Sion');assert.equal(u.id,team+'_MID');
  const target=a.units.find(z=>z.team===other&&z.id!==v.id);
  Object.assign(target,{x:.525,y:.5,hp:20000});
  assert.equal(f.cast('Q',{point:{x:.55,y:.5},chargeSeconds:1.6}).decimatingSmash,true);
  return f;
 });
 run('snapshot stays deterministic after Ornn wall and Sion-style clocks',()=>{
  const f=fixture(team,'Ornn');f.cast('Q',{point:{x:.55,y:.5}});
  f.a.gameTime=1.3;return f;
 });
}
console.log('M44_B33A_PASS '+passed+'/'+passed+' snapshots='+snapshots);
