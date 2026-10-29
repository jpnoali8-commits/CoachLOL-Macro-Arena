/**
 * M42/B01: family-wide owner authorization and three champion-specific
 * preflight/commit races. NOT a certification test.
 * All 35 champion kits / 140 slots x both opposing human PvP seats,
 * then Mel R, Corki missile inventory, Lee Sin W2 exact state.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,BOARD_M20_B01_V453} from '../../engine.mjs';
import {buildM35B01WorkQueue} from '../../tools/skills_m35_b01_cohort_work_queue.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const queue=buildM35B01WorkQueue();
assert.equal(queue.metrics.champions,35);
assert.equal(queue.metrics.qwer,140);
assert.equal(queue.metrics.unresolvedLegacyTags,20);
const failures=[];
let negatives=0,ownerChecks=0,snapshots=0,identities=0;
const seats=['blue','red'];
function fixture(champ,seat){
 const other=seat==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:424242,mode:'pvp',
  draft:{[seat]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:5000,maxHp:5000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===seat+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID'),
  e2=a.units.find(v=>v.id===other+'_TOP'),
  ally=a.units.find(v=>v.id===seat+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:4000,maxHp:4000,
  mana:10000,maxMana:10000,level:16,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.525,y:.5,hp:7000,maxHp:7000,mr:0});
 Object.assign(e2,{x:.526,y:.5,hp:7000,maxHp:7000,mr:0});
 Object.assign(ally,{x:.51,y:.5,hp:4000,maxHp:4000});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const plan=(slot,o={})=>a.queueBoardSkillV453Dev69(seat,u.id,slot,o);
 const commit=()=>{let receipt;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,q)=>(receipt=original(v,q));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original}
  return receipt;
 };
 const cast=(slot,o={})=>{const q=plan(slot,o);
  assert.equal(q.ok,true,champ+slot+' queue '+JSON.stringify(q));
  const r=commit();assert.equal(r?.ok,true,champ+slot+' commit '+JSON.stringify(r));return r;
 };
 const snap=()=>{const s=a.snapshotV40();
  assert.equal(checksumV40(s),checksumV40(Arena.fromSnapshotV40(map,mask,s).snapshotV40()));
  snapshots++;
 };
 return {a,u,e,e2,ally,seat,other,plan,commit,cast,snap};
}
for(const champ of queue.champions.map(x=>x.champion))for(const seat of seats){
 try{
  const {a,u,other,snap}=fixture(champ,seat);
  // In board PvP, one human controls all 5 allied champions. Every QWER
  // order from the opposing human for this unit is invalid, not a no-cost
  // tentative reconfiguration of owner state.
  const before=a.snapshotV40();
  for(const slot of ['Q','W','E','R']){
   assert.ok(BOARD_M20_B01_V453[champ][slot]);
   const res=a.queueBoardSkillV453Dev69(other,u.id,slot,{
    point:{x:.52,y:.5},targetId:u.id});
   assert.equal(res?.ok,false,champ+':'+slot+': enemy spoof accepted');
   assert.equal(u.pendingBoardV453Dev69??null,null);
   negatives++;ownerChecks++;
  }
  assert.equal(checksumV40(before),checksumV40(a.snapshotV40()),
   champ+' enemy owner invalid orders changed the board');
  assert.equal(queue.champions.find(c=>c.champion===champ)?.kitStatus,'NOT_CERTIFIED');
  snap();
 }catch(err){failures.push({champ,seat,case:'140-slot owner boundary',error:String(err?.stack||err)})}
}
for(const seat of seats){
 try{
  const {a,u,e,e2,plan,commit,cast,snap}=fixture('Mel',seat);
  const token='overwhelm_'+u.id;
  const originalMana=u.mana;
  e.m20MarksV453={[token]:a.gameTime+6};
  a.visible=(t,v)=>v.id!==e.id;
  let denial=plan('R');
  assert.equal(denial.ok,false);
  assert.equal(denial.reason,'m42_mel_no_visible_marks');
  assert.equal(u.mana,originalMana);
  negatives++;
  a.visible=()=>true;
  assert.equal(plan('R').ok,true);
  a.visible=(t,v)=>v.id!==e.id;
  let result=commit();
  assert.equal(result.ok,false);
  assert.equal(result.reason,'m42_mel_mark_hidden_before_commit');
  assert.equal(u.mana,originalMana);assert.equal(u.skillCds.R,0);
  negatives++;
  e2.m20MarksV453={[token]:a.gameTime+6};
  a.visible=(t,v)=>v.id!==e2.id;
  const hp=e.hp,hiddenHP=e2.hp;
  cast('R');
  assert.ok(e.hp<hp);
  assert.equal(e2.hp,hiddenHP,'global Mel R cannot hit an unseen marked enemy');
  snap();identities++;
 }catch(err){failures.push({champ:'Mel',seat,error:String(err?.stack||err)})}
 try{
  const {a,u,e,plan,commit,snap}=fixture('Corki',seat);
  // Two restored missiles by simulated time, no real queue-stage mutation.
  a.gameTime=25;u.m22MagazineV453={charges:0,nextAt:5,shots:7};
  const ammoBefore=structuredClone(u.m22MagazineV453);
  const originalMana=u.mana,originalCd=u.skillCds.R;
  assert.equal(plan('R',{point:{x:.53,y:.5}}).ok,true);
  assert.deepEqual(u.m22MagazineV453,ammoBefore,
   'preview cannot regenerate authoritative missiles');
  u.m22MagazineV453.nextAt=50;
  const denial=commit();
  assert.equal(denial.ok,false);
  assert.equal(denial.reason,'m42_corki_ammo_spent_before_commit');
  assert.equal(u.mana,originalMana);assert.equal(u.skillCds.R,originalCd);
  negatives++;
  a.gameTime=51;a.round++;a.actionLocksV40={};
  const before=structuredClone(u.m22MagazineV453);
  assert.equal(plan('R',{point:{x:.53,y:.5}}).ok,true);
  assert.deepEqual(u.m22MagazineV453,before);
  const ok=commit();assert.equal(ok.ok,true);
  assert.equal(u.m22MagazineV453.charges,0);
  assert.equal(u.m22MagazineV453.shots,8);
  assert.ok(u.mana<originalMana);
  snap();identities++;
 }catch(err){failures.push({champ:'Corki',seat,error:String(err?.stack||err)})}
 try{
  const {a,u,ally,cast,plan,commit,snap}=fixture('LeeSin',seat);
  cast('W',{targetId:ally.id});
  assert.equal(u.m22SecondaryV453.W?.kind,'vamp');
  // One player queues W2; before simultaneous authoritative commit, a
  // different energy-consuming event exhausts the same champion ledger.
  u.m33LeeEnergyV453={value:35,at:a.gameTime};
  assert.equal(plan('W').ok,true);
  u.m33LeeEnergyV453={value:0,at:a.gameTime};
  const denied=commit();
  assert.equal(denied.ok,false);
  assert.equal(denied.reason,'m42_lee_recast_energy_lost_before_commit');
  assert.equal(u.m22IronWillV453??null,null,
   'no lifesteal buff may apply before energy prevalidation');
  assert.equal(u.m22SecondaryV453.W.kind,'vamp',
   'failed W2 retains valid recast state');
  negatives++;snap();identities++;
 }catch(err){failures.push({champ:'LeeSin',seat,error:String(err?.stack||err)})}
}
for(const x of failures)console.error('M42_COHORT_FAIL',JSON.stringify(x));
console.log('M42_B01_COHORT '+JSON.stringify({
 champions:queue.metrics.champions,qwer:queue.metrics.qwer,seats:2,
 ownerBoundaries:ownerChecks,negativeChecks:negatives,
 atomicChampionCases:identities,snapshots,
 legacyDebt:queue.metrics.unresolvedLegacyTags,
 certificationDimensions:queue.dimensions.length,certifiedKits:0,
 failures:failures.length}));
assert.equal(failures.length,0);
assert.equal(ownerChecks,280);
assert.equal(identities,6);
assert.equal(snapshots,76);
