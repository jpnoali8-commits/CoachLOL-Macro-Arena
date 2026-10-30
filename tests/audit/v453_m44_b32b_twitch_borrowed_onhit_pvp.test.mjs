/* M44 B32B — borrowed Twitch R, native poison and per-target piercing on-hit. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,m44B14DOriginalBoardRuleV453} from '../../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
function fixture(side,champ='Twitch'){
 const foe=side==='blue'?'red':'blue';
 const a=new Arena(map,mask,{mode:'pvp',seed:32323,
  draft:{[side]:{MID:champ},[foe]:{MID:'Twitch'}}});
 for(const z of a.units)Object.assign(z,{x:.07,y:.07,hp:20000,maxHp:20000,
  armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,
  autoJungle:false,level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 for(const z of a.minions)Object.assign(z,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const u=a.units.find(z=>z.id===side+'_MID'),v=a.units.find(z=>z.id===foe+'_MID');
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.535,y:.5});
 const extras=a.units.filter(z=>z.team===foe&&z.id!==v.id);
 function cast(slot='R',options={}){
  const queue=a.queueBoardSkillV453Dev69(side,u.id,slot,options);
  assert.equal(queue.ok,true,'queue '+JSON.stringify(queue));
  let receipt;const orig=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(unit,q)=>{const r=orig(unit,q);
   if(unit.id===u.id)receipt=r;return r;};
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=orig;}
  assert.equal(receipt?.ok,true,'commit '+JSON.stringify(receipt));
  return receipt;
 }
 function steal(){
  const q=a.queueSylasHijackV453M14(side,u.id,v.id);
  assert.equal(q.ok,true,JSON.stringify(q));
  a.resolveSylasHijacksV453M14();
  assert.equal(u.sylasStolenV453M14?.sourceChamp,'Twitch');
  return cast('R');
 }
 function checkpoint(){
  const snap=a.snapshotV40(),restored=Arena.fromSnapshotV40(map,mask,snap);
  assert.equal(checksumV40(restored.snapshotV40()),checksumV40(snap));
 }
 return {a,u,v,foe,extras,cast,steal,checkpoint};
}
let passed=0;
for(const side of ['blue','red']){
 const test=(name,fn)=>{try{const f=fn();f?.checkpoint?.();passed++}
 catch(e){throw Error(side+' '+name+': '+String(e?.stack||e))}};
 test('single original R registry used by Sylas',()=>{
  assert.equal(m44B14DOriginalBoardRuleV453('Twitch','R').m44B32AId,'Twitch.R');
  return fixture(side);
 });
 test('native Twitch Q W E remain unchanged',()=>{
  for(const s of ['Q','W','E'])
   assert.ok(m44B14DOriginalBoardRuleV453('Twitch',s));
  return fixture(side);
 });
 test('Sylas R borrows original executor and retains owner identity',()=>{
  const f=fixture(side,'Sylas'),{u,a}=f,id=u.id,team=u.team;
  assert.equal(f.steal().sprayAndPray,true);
  assert.equal(u.champ,'Sylas');assert.equal(u.id,id);assert.equal(u.team,team);
  assert.equal(u.sylasStolenV453M14,null);
  return f;
 });
 test('Sylas receives copied Twitch R attack range',()=>{
  const f=fixture(side,'Sylas'),{a,u}=f;
  const old=a.itemAttackRangeV453Dev38(u);
  f.steal();assert.ok(a.itemAttackRangeV453Dev38(u)>old+.019);
  return f;
 });
 test('Sylas basic attack can pierce secondary',()=>{
  const f=fixture(side,'Sylas'),{a,u,v,extras}=f;
  f.steal();Object.assign(extras[0],{x:.55,y:.5,hp:20000});
  a.attack(u,v,100);assert.ok(extras[0].hp<20000);
  return f;
 });
 test('Sylas cannot steal Twitch passive poison',()=>{
  const f=fixture(side,'Sylas'),{a,u,v,extras}=f;
  f.steal();Object.assign(extras[0],{x:.55,y:.5,hp:20000});
  a.attack(u,v,100);
  assert.equal(extras[0].m16TwitchPoison?.[u.id],undefined);
  return f;
 });
 test('native Twitch R puts poison on secondary',()=>{
  const f=fixture(side),{a,u,v,extras}=f;
  f.cast();Object.assign(extras[0],{x:.55,y:.5,hp:20000});
  a.attack(u,v,100);
  assert.equal(extras[0].m16TwitchPoison?.[u.id]?.stacks,1);
  return f;
 });
 test('secondary triggers exactly one independent on-hit item pipeline',()=>{
  const f=fixture(side),{a,u,v,extras}=f;
  f.cast();u.items=['recurve_bow'];
  Object.assign(extras[0],{x:.55,y:.5,hp:20000});
  const sources=[],old=a.damage.bind(a);
  a.damage=(target,raw,source,type,tag)=>{
   if(target.id===extras[0].id)sources.push(tag);
   return old(target,raw,source,type,tag);
  };
  a.attack(u,v,100);
  assert.equal(sources.filter(x=>x==='m44_b32b_twitch_secondary').length,1);
  assert.equal(sources.filter(x=>x==='item_recurve').length,1);
  return f;
 });
 test('secondaries off axis do not take attack or item effects',()=>{
  const f=fixture(side),{a,u,v,extras}=f;f.cast();u.items=['recurve_bow'];
  Object.assign(extras[0],{x:.55,y:.55,hp:20000});
  a.attack(u,v,100);assert.equal(extras[0].hp,20000);
  return f;
 });
 test('Twitch bolts cross walls and do not require new fog acquisition',()=>{
  const f=fixture(side),{a,u,v,extras}=f;
  f.cast();Object.assign(extras[0],{x:.55,y:.5,hp:20000});
  a.obstacleLine=()=>true;a.visible=(team,target)=>target.id!==extras[0].id;
  a.attack(u,v,100);assert.ok(extras[0].hp<20000);
  return f;
 });
 test('realm isolation excludes secondary collisions',()=>{
  const f=fixture(side),{a,u,v,extras}=f;
  f.cast();Object.assign(extras[0],{x:.55,y:.5,hp:20000});
  const orig=a.sameCombatRealmV453Dev69.bind(a);
  a.sameCombatRealmV453Dev69=(x,y)=>y.id!==extras[0].id&&orig(x,y);
  a.attack(u,v,100);assert.equal(extras[0].hp,20000);
  return f;
 });
 test('expiry removes extra range and piercing for Sylas',()=>{
  const f=fixture(side,'Sylas'),{a,u,v,extras}=f;
  const normal=a.itemAttackRangeV453Dev38(u);
  f.steal();a.gameTime=7;
  assert.equal(a.itemAttackRangeV453Dev38(u),normal);
  Object.assign(extras[0],{x:.55,y:.5,hp:20000});
  a.attack(u,v,100);assert.equal(extras[0].hp,20000);
  return f;
 });
}
console.log('M44_B32B_PASS '+passed+'/'+passed);
