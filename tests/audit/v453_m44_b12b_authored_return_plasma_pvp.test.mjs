/** M44 B12B — eight authored skills, two real PvP seats, V40 roundtrips. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B12B_KITS_V453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let passed=0,snapshots=0;const failures=[];
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:441213,mode:'pvp',
  draft:{[team]:{MID:champ},[other]:{MID:'Annie',TOP:'Malphite'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:9000,maxHp:9000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 for(const v of a.minions)Object.assign(v,{x:.08,y:.08});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID'),
  sec=a.units.find(v=>v.id===other+'_TOP');
 Object.assign(u,{x:.5,y:.5,hp:5000,maxHp:5000,mana:10000,maxMana:10000,
  level:16,skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.52,y:.5,hp:12000,maxHp:12000,mr:0,armor:0});
 Object.assign(sec,{x:.08,y:.08,hp:12000,maxHp:12000,mr:0,armor:0});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 function cast(slot,opts={}){
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,{
   targetId:opts.targetId??null,point:opts.point??null});
  assert.equal(q.ok,true,'queue '+champ+':'+slot+':'+JSON.stringify(q));
  let receipt;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,intent)=>(receipt=original(actor,intent));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=original;}
  assert.equal(receipt?.ok,true,'commit '+champ+':'+slot+':'+JSON.stringify(receipt));
  return receipt;
 }
 function tick(){a.gameTime++;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69();}
 return {a,u,e,sec,cast,tick};
}
function check(champ,team,label,run){
 try{
  const f=fixture(champ,team);run(f);
  const snap=f.a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;snapshots++;
 }catch(err){failures.push({champ,team,label,error:String(err?.stack||err)});}
}
for(const team of ['blue','red']){
 check('Akshan',team,'Q flying outward, no instant damage',({e,cast,tick})=>{
  const hp=e.hp,r=cast('Q',{point:{x:.565,y:.5}});
  assert.equal(r.m44Projectile,true);assert.equal(e.hp,hp);
  for(let i=0;i<5;i++)tick();assert.ok(e.hp<hp);
 });
 check('Akshan',team,'Avengerang damages outbound and return',({e,cast,tick})=>{
  cast('Q',{point:{x:.565,y:.5}});tick();const first=e.hp;
  for(let i=0;i<4;i++)tick();
  assert.ok(e.hp<first);
 });
 check('Talon',team,'Q melee critical branch',({e,cast})=>{
  e.x=.51;
  const r=cast('Q',{targetId:e.id});
  assert.equal(r.noxianDiplomacy,true);assert.equal(r.melee,true);
 });
 check('Talon',team,'Q range-based legal leap',({u,e,cast})=>{
  const x=u.x,r=cast('Q',{targetId:e.id});
  assert.equal(r.noxianDiplomacy,true);assert.equal(r.melee,false);
  assert.ok(u.x>x);
 });
 check('Talon',team,'W Rake slows on return leg',({a,e,cast,tick})=>{
  cast('W',{point:{x:.56,y:.5}});
  for(let i=0;i<4;i++)tick();
  assert.equal(a.effectResolverV41().has(e,'slow'),true);
 });
 check('Viego',team,'Q real Blade thrust and mark',({a,u,e,cast})=>{
  const hp=e.hp,r=cast('Q',{point:{x:.55,y:.5}});
  assert.equal(r.blade,true);assert.ok(r.hitCount>=1&&e.hp<hp);
  assert.ok(e.m44B12ViegoMark?.[u.id]>a.gameTime);
 });
 check('Viego',team,'Q-marked basic receives the authored second strike',({a,u,e,cast})=>{
  cast('Q',{point:{x:.55,y:.5}});const hp=e.hp;
  a.damage(e,25,u,'physical','basic');assert.ok(e.hp<hp-25);
 });
 check('Viego',team,'R Heartbreaker arrives and hits primary plus nearby enemy',({u,e,sec,cast})=>{
  sec.x=.524;sec.y=.5;const hp=e.hp,hp2=sec.hp;
  const r=cast('R',{point:{x:e.x,y:e.y}});
  assert.equal(r.heartbreaker,true);assert.equal(r.hitCount,2);
  assert.ok(e.hp<hp&&sec.hp<hp2);
 });
 check('Khazix',team,'W Void Spike real projectile splash',({e,sec,cast,tick})=>{
  sec.x=.524;sec.y=.5;const hp=sec.hp;
  cast('W',{point:{x:.56,y:.5}});tick();assert.ok(sec.hp<hp);
 });
 check('Khazix',team,'W heals if owner stands close to detonation',({u,e,cast,tick})=>{
  e.x=.516;u.hp=2000;const hp=u.hp;
  cast('W',{point:{x:.56,y:.5}});tick();assert.ok(u.hp>hp);
 });
 check('Kaisa',team,'Q missiles seek enemy in authored radius',({e,cast})=>{
  const hp=e.hp,r=cast('Q');
  assert.equal(r.icathianRain,true);assert.ok(r.missiles>0&&e.hp<hp);
 });
 check('Kaisa',team,'evolved Q launches twelve missiles',({u,cast})=>{
  u.m16KaisaEvolvedQ=true;assert.equal(cast('Q').missiles,12);
 });
 check('Kaisa',team,'R cannot target unmarked enemy',({a,u,e})=>{
  assert.equal(a.queueBoardSkillV453Dev69(u.team,u.id,'R',{targetId:e.id}).ok,false);
 });
 check('Kaisa',team,'W hit creates genuine Killer Instinct Plasma window',({a,u,e,cast,tick})=>{
  cast('W',{point:{x:.56,y:.5}});tick();
  assert.ok(e.m44B12KaisaPlasma?.[u.id]>a.gameTime);
 });
 check('Kaisa',team,'R teleports near Plasma target and shields',({a,u,e,cast})=>{
  e.m44B12KaisaPlasma={[u.id]:a.gameTime+5};
  const x=u.x,r=cast('R',{targetId:e.id});
  assert.equal(r.killerInstinct,true);assert.ok(u.x>x);
  assert.equal(a.effectResolverV41().has(u,'shield'),true);
 });
 check('Kaisa',team,'R invalidated Plasma between queue and commit spends nothing',({a,u,e})=>{
  e.m44B12KaisaPlasma={[u.id]:a.gameTime+5};
  assert.equal(a.queueBoardSkillV453Dev69(u.team,u.id,'R',{targetId:e.id}).ok,true);
  e.m44B12KaisaPlasma[u.id]=0;const mana=u.mana;
  const result=a.executeBoardSkillV453Dev69(u,u.pendingBoardV453Dev69);
  assert.equal(result.ok,false);assert.equal(u.mana,mana);
 });
}
for(const e of failures)console.error('M44_B12B_FAIL',JSON.stringify(e));
console.log('M44_B12B_QA '+JSON.stringify({champions:Object.keys(M44_B12B_KITS_V453),
 activeSlots:8,passed,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,32);
