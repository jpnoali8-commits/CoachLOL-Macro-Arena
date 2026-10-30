/** M30 B01 blocker: four named identities and adversarial PvP receipts, no full certifications. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const d=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=d('coachlol_map_v6.json'),mask=d('masks_128.json');
const champs=['Lucian','Varus','Mel','Viktor'];const seats=['blue','red'];
let passed=0;const failures=[];
function setup(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:303030,mode:'pvp',
  draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:3500,maxHp:3500,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID'),
  back=a.units.find(v=>v.id===other+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:3500,maxHp:3500,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(back,{x:.531,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,opts={})=>{
  const r=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(r.ok,true,champ+' '+slot+' '+JSON.stringify(r));
  let execution;const old=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,q)=>(execution=old(v,q));
  a.resolveBoardSkillsV453Dev69();a.executeBoardSkillV453Dev69=old;
  assert.equal(execution?.ok,true,'commit '+champ+' '+slot+' '+JSON.stringify(execution));
 };
 const next=(sec=1)=>{a.gameTime+=sec;a.round++;a.actionLocksV40={};};
 const replay=()=>{const snap=a.snapshotV40();assert.equal(checksumV40(snap),
  checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));};
 return {a,u,e,back,cast,next,replay,team,other};
}
function run(champ,team,name,fn){
 try{fn(setup(champ,team));passed++}
 catch(error){failures.push({champ,team,name,error:String(error.stack||error)})}
}
for(const team of seats){
 run('Lucian',team,'mandatory primary, piercing line',({a,u,e,back,cast,replay})=>{
  const mana=u.mana,snap=checksumV40(a.snapshotV40());
  let r=a.queueBoardSkillV453Dev69(team,u.id,'Q',{point:{x:.55,y:.5}});
  assert.equal(r.ok,false);assert.equal(r.reason,'m30_lucian_initial_target');
  assert.equal(u.mana,mana);assert.equal(checksumV40(a.snapshotV40()),snap);
  cast('Q',{targetId:e.id});
  assert.ok(e.hp<7000,'initial legal target must take damage');
  assert.ok(back.hp<7000,'piercing follow-through must hit opponent behind target');
  replay();
 });
 run('Lucian',team,'fog and executor invalidation',({a,u,e,replay})=>{
  const before=u.mana;
  a.visible=(t,v)=>v.id!==e.id;
  const q=a.queueBoardSkillV453Dev69(team,u.id,'Q',{targetId:e.id});
  assert.equal(q.ok,false);assert.equal(u.mana,before);
  a.visible=()=>true;
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'Q',{targetId:e.id}).ok,true);
  a.visible=(t,v)=>v.id!==e.id;
  let exec=null;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,order)=>(exec=original(v,order));
  a.resolveBoardSkillsV453Dev69();
  assert.equal(exec.ok,false);assert.equal(exec.reason,'m30_lucian_target_lost');
  assert.equal(u.mana,before);assert.equal(u.skillCds.Q,0);
  replay();
 });
 run('Varus',team,'W enhanced Q and blight stacks',({a,u,e,cast,next,replay})=>{
  e.x=.535;e.hp=3000;
  const noBuff=setup('Varus',team);
  noBuff.e.x=.535;noBuff.e.hp=3000;
  noBuff.cast('Q',{point:{x:.56,y:.5},chargeSeconds:2});
  const baseline=noBuff.e.hp;
  cast('W');assert.ok(u.m30VarusEmpoweredQUntil>a.gameTime);
  next();
  const mana=u.mana;
  const bad=a.queueBoardSkillV453Dev69(team,u.id,'Q',{point:{x:.56,y:.5},chargeSeconds:3});
  assert.equal(bad.ok,false);assert.equal(u.mana,mana);
  assert.ok(u.m30VarusEmpoweredQUntil>a.gameTime);
  cast('Q',{point:{x:.56,y:.5},chargeSeconds:2});
  assert.ok(e.hp<baseline,'W empowers exactly next committed Q against missing HP');
  assert.equal(u.m30VarusEmpoweredQUntil,0);
  replay();
 });
 run('Mel',team,'individual projectile receipts and collision occlusion',({a,u,e,back,cast,replay})=>{
  e.x=.513;back.x=.52;
  cast('Q',{point:{x:.525,y:.5}});
  const z=a.boardTemporalV453Dev69.find(v=>v.kind==='m28_mel_volley');
  assert.ok(z,'Q must schedule its named follow-up volley');
  const hp=e.hp;a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
  assert.equal(z.m30ProjectileReceipts?.length,3,'three separately owned projectile collision receipts');
  assert.ok(z.m30ProjectileReceipts.some(x=>x.targetId===e.id),'at least one projectile must hit primary');
  assert.ok(e.hp<hp,'real projectile collision deals follow-up damage');
  const after=e.hp;
  a.advanceBoardTemporalV453Dev69();assert.equal(e.hp,after,'no repeated tick in one board second');
  a.obstacleLine=()=>true;a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
  assert.equal(e.hp,after,'solid wall interrupts future projectile impacts');
  replay();
 });
 run('Viktor',team,'earned upgrade gates and tactical selection',({a,u,e,cast,next,replay})=>{
  const initial=checksumV40(a.snapshotV40());
  const bad=a.queueBoardViktorEvolutionV453Dev69(team,u.id,'Q');
  assert.equal(bad.ok,false);assert.equal(bad.reason,'fragmentos_insuficientes');
  assert.equal(checksumV40(a.snapshotV40()),initial);
  a.damage(e,20,u,'magic','spell');assert.equal(u.m30ViktorFragments,25);
  a.damage(e,20,u,'magic','spell');assert.equal(u.m30ViktorFragments,25,'same victim research lockout');
  u.m30ViktorFragments=300;
  for(const slot of ['Q','E','W'])assert.equal(a.queueBoardViktorEvolutionV453Dev69(team,u.id,slot).ok,true);
  assert.equal(u.m30ViktorAugments.R,true,'third chosen augmentation unlocks ultimate evolution');
  assert.equal(u.m30ViktorFragments,0);
  assert.equal(a.queueBoardViktorEvolutionV453Dev69(team,u.id,'Q').ok,false);
  cast('Q',{targetId:e.id});
  assert.ok(a.effectResolverV41().has(u,'shield'),'evolved Q still self-shields');
  next();cast('E',{point:{x:.54,y:.5}});
  const shock=a.boardTemporalV453Dev69.find(z=>z.kind==='m26_viktor_aftershock');
  assert.ok(shock&&shock.power>95,'E aftershock upgrades actual second impact');
  next();cast('R',{point:{x:.52,y:.5}});
  const storm=a.boardTemporalV453Dev69.find(z=>z.kind==='m28_viktor_storm');
  assert.ok(storm&&storm.m30Evolved&&storm.until>=a.gameTime+6,'evolved R gains a longer storm');
  replay();
 });
}
for(const f of failures)console.error('M30_PQWER_FAIL',JSON.stringify(f));
console.log('M30_B01_IDENTITY_QA '+JSON.stringify({champions:champs.length,seats:2,
 cases:passed,expected:10,failed:failures.length,certifiedChampions:0}));
assert.equal(failures.length,0);assert.equal(passed,10);
