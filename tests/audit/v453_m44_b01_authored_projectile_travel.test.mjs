/**
 * M44 wave 1 / B01: six authored travelling projectiles, BOTH human PvP seats.
 * Red-first regression: pre-impact damage/CC/marks are forbidden. The six
 * champions keep distinct spell semantics, not generic damaging fallbacks.
 * A passing suite is NOT proof of full P+QWER/17-dimension certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const file=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=file('coachlol_map_v6.json'),mask=file('masks_128.json');
let tests=0,snapshots=0,negatives=0;const failures=[];
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:444440,mode:'pvp',
  draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:6000,maxHp:6000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID');
 const e=a.units.find(v=>v.id===other+'_MID');
 const e2=a.units.find(v=>v.id===other+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,level:16,mana:10000,maxMana:10000,
  hp:5000,maxHp:5000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.527,y:.5,hp:10000,maxHp:10000,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;
 a.walkable=()=>true;a.obstacleLine=()=>false;
 const queue=(slot,opts={})=>a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
 const resolve=()=>{
  let receipt;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(unit,q)=>(receipt=original(unit,q));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original}
  return receipt;
 };
 const cast=(slot,opts={})=>{
  const q=queue(slot,opts);assert.equal(q.ok,true,champ+' queue '+JSON.stringify(q));
  const receipt=resolve();
  assert.equal(receipt?.ok,true,champ+' receipt '+JSON.stringify(receipt));
  return receipt;
 };
 const tick=(seconds=1)=>{
  a.gameTime+=seconds;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69();
 };
 const snap=()=>{
  const snapshot=a.snapshotV40();
  assert.equal(checksumV40(snapshot),
   checksumV40(Arena.fromSnapshotV40(map,mask,snapshot).snapshotV40()));
  snapshots++;
 };
 return {a,u,e,e2,queue,resolve,cast,tick,snap};
}
const specs=[
 {champ:'LeeSin',slot:'Q',check:({u,e,a})=>{
  assert.equal(u.m21SonicRecastV453?.targetId,e.id);
  assert.ok(e.m20MarksV453?.['sonic_'+u.id]>a.gameTime);
 }},
 {champ:'Braum',slot:'Q',check:({u,e,a})=>{
  assert.equal(a.effectResolverV41().has(e,'slow'),true);
  assert.equal(e.m21BraumConcussiveV453?.sourceId,u.id);
 }},
 {champ:'Quinn',slot:'Q',check:({u,e,a})=>{
  assert.equal(a.effectResolverV41().has(e,'blind'),true);
  assert.ok(e.m20MarksV453?.['harrier_'+u.id]>a.gameTime);
 }},
 {champ:'Rell',slot:'Q',check:({e,a})=>{
  assert.equal(a.effectResolverV41().has(e,'stun'),true);
 }},
 {champ:'Locke',slot:'Q',check:({u,e,a})=>{
  assert.ok(e.m20MarksV453?.['soul_nails_'+u.id]>a.gameTime);
  assert.equal(e.m26LockeNails?.[u.id]?.stacks,1);
 }},
 {champ:'Varus',slot:'R',check:({e,a})=>{
  assert.equal(a.effectResolverV41().has(e,'root'),true);
  assert.ok(a.boardTemporalV453Dev69.some(z=>
   z.kind==='m25_varus_chain'&&z.sourceId===e.id));
 }}
];
function run(champ,team,label,fn){
 try{fn(fixture(champ,team));tests++}
 catch(error){failures.push({champ,team,label,error:String(error?.stack||error)})}
}
for(const team of ['blue','red']){
 for(const spec of specs){
  run(spec.champ,team,'authored contact after travel only',f=>{
   const {a,u,e,cast,tick,snap}=f,pre=e.hp;
   if(spec.champ==='Rell'){
    a.applyEffectV41(e,'shield',{source:e,duration:5,power:50,
     key:'m44_shield_'+team});
   }
   const out=cast(spec.slot,{point:{x:.56,y:.5}});
   assert.equal(out.m44Projectile,true);
   assert.equal(e.hp,pre,'no pre-flight damage');
   assert.equal(a.boardTemporalV453Dev69.filter(z=>
    z.kind==='m44_authored_projectile'&&z.ownerId===u.id).length,1);
   if(spec.champ==='LeeSin'){
    assert.equal(u.m21SonicRecastV453??null,null,'Q2 cannot arm at Q1 cast');
   }
   if(spec.champ==='Quinn')
    assert.equal(e.m20MarksV453?.['harrier_'+u.id],undefined);
   tick(1);
   assert.ok(e.hp<pre,'authored projectile must contact enemy');
   spec.check(f);snap();
  });
 }
 run('LeeSin',team,'first actual colliding body owns Q2',({a,u,e,e2,cast,tick,snap})=>{
  e.x=.545;e2.x=.52;e2.y=.5;e2.hp=8000;e2.maxHp=8000;
  const hp=e.hp;
  cast('Q',{point:{x:.56,y:.5}});
  tick(1);
  assert.equal(u.m21SonicRecastV453?.targetId,e2.id);
  assert.equal(e.hp,hp,'cannot skip nearer body to preferred later target');
  assert.equal(e.m20MarksV453?.['sonic_'+u.id],undefined);
  negatives++;snap();
 });
 run('LeeSin',team,'blocked first contact never earns Q2',({a,u,e,cast,tick,snap})=>{
  const hp=e.hp;cast('Q',{point:{x:.56,y:.5}});
  a.obstacleLine=(from,to)=>to?.id===e.id;
  tick(1);
  assert.equal(e.hp,hp);assert.equal(u.m21SonicRecastV453??null,null);
  negatives++;snap();
 });
 run('LeeSin',team,'Q2 spends energy only after real mark and authority',({a,u,e,queue,resolve,cast,tick,snap})=>{
  cast('Q',{point:{x:.56,y:.5}});
  assert.equal(queue('Q',{targetId:e.id}).ok,false,
   'before impact recast is not available');
  tick(1);
  assert.equal(u.m21SonicRecastV453?.targetId,e.id);
  const mana=u.mana,cd=u.skillCds.Q;
  const ok=queue('Q',{targetId:e.id});
  assert.equal(ok.ok,true,JSON.stringify(ok));
  const res=resolve();assert.equal(res?.ok,true,JSON.stringify(res));
  assert.equal(res.recast,true);
  assert.equal(u.mana,mana,'Q2 does not debit initial mana again');
  assert.equal(u.skillCds.Q,cd,'Q2 does not restart Q1 cooldown');
  assert.equal(u.m21SonicRecastV453,null);
  negatives++;snap();
 });
 run('Braum',team,'shielded impact does not apply concussive stun/mark',
  ({a,u,e,cast,tick,snap})=>{
   cast('Q',{point:{x:.56,y:.5}});
   a.applyEffectV41(e,'spell_shield',{source:e,duration:3,
    key:'m44_braum_spell_shield_'+team});
   tick(1);
   assert.equal(e.m21BraumConcussiveV453,undefined);
   assert.equal(e.m20MarksV453?.['concussive_'+u.id],undefined);
   negatives++;snap();
  });
 run('Quinn',team,'projectile crossing blocked segment cannot blind',
  ({a,e,cast,tick,snap})=>{
   const hp=e.hp;cast('Q',{point:{x:.56,y:.5}});
   a.obstacleLine=(from,to)=>to?.id===e.id;
   tick(1);
   assert.equal(e.hp,hp);
   assert.equal(a.effectResolverV41().has(e,'blind'),false);
   negatives++;snap();
  });
 run('Varus',team,'dead target cannot initiate chain',
  ({a,e,cast,tick,snap})=>{
   cast('R',{point:{x:.56,y:.5}});
   e.hp=0;tick(1);
   assert.equal(a.boardTemporalV453Dev69.some(z=>
    z.kind==='m25_varus_chain'&&z.sourceId===e.id),false);
   negatives++;snap();
  });
 run('Braum',team,'Q stops on first enemy even with a second champion in the line',
  ({u,e,e2,cast,tick,snap})=>{
   e.x=.519;e2.x=.533;e2.y=.5;e2.hp=e2.maxHp=10000;
   const hp=e2.hp;cast('Q',{point:{x:.56,y:.5}});tick(1);
   assert.equal(e2.hp,hp,'Braum Q must stop on first victim');
   assert.equal(e2.m20MarksV453?.['concussive_'+u.id],undefined);
   negatives++;snap();
  });
 run('Quinn',team,'Valor primary Harrier+blind and nearby physical splash only',
  ({a,u,e,e2,cast,tick,snap})=>{
   e.x=.518;e2.x=.529;e2.y=.506;e2.hp=e2.maxHp=10000;
   const hp=e2.hp;cast('Q',{point:{x:.56,y:.5}});tick(1);
   assert.ok(e2.hp<hp,'secondary enemy inside Quinn Q blast radius must take damage');
   assert.equal(a.effectResolverV41().has(e2,'blind'),false);
   assert.equal(e2.m20MarksV453?.['harrier_'+u.id],undefined);
   assert.equal(a.effectResolverV41().has(e,'blind'),true);
   negatives++;snap();
  });
 run('Rell',team,'Q breaks a damage shield before dealing lance damage',
  ({a,e,cast,tick,snap})=>{
   const hp=e.hp;
   a.applyEffectV41(e,'shield',{source:e,duration:4,power:500,
    key:'m44_rell_large_shield_'+team});
   cast('Q',{point:{x:.56,y:.5}});tick(1);
   assert.ok(e.hp<hp,'Rell Q must break the shield before damage');
   assert.equal(a.effectResolverV41().has(e,'stun'),true);
   negatives++;snap();
  });
 run('Varus',team,'R bypasses minion wave and roots first real champion',
  ({a,e,u,cast,tick,snap})=>{
   const minion={id:'m44_varus_wave_'+team,kind:'minion',
    team:e.team,x:.518,y:.5,hp:900,maxHp:900,armor:0,mr:0,spawnAt:0};
   a.minions.push(minion);
   const initial=minion.hp;cast('R',{point:{x:.56,y:.5}});tick(1);
   assert.equal(minion.hp,initial,'Varus R is not blocked by minions');
   assert.equal(a.effectResolverV41().has(e,'root'),true);
   assert.ok(a.boardTemporalV453Dev69.some(z=>
    z.kind==='m25_varus_chain'&&z.ownerId===u.id&&z.sourceId===e.id));
   negatives++;snap();
  });
 run('LeeSin',team,'Q2 can actually target the first marked minion',
  ({a,u,e,queue,resolve,cast,tick,snap})=>{
   const minion={id:'m44_lee_minion_'+team,kind:'minion',
    team:e.team,x:.519,y:.5,hp:900,maxHp:900,armor:0,mr:0,spawnAt:0};
   a.minions.push(minion);
   const hp=e.hp;cast('Q',{point:{x:.56,y:.5}});tick(1);
   assert.equal(u.m21SonicRecastV453?.targetId,minion.id);
   assert.equal(e.hp,hp);
   const q=queue('Q',{targetId:minion.id});
   assert.equal(q.ok,true,'Sonic Wave marked this minion');
   const receipt=resolve();assert.equal(receipt?.ok,true);
   assert.equal(receipt.recast,true);
   assert.equal(u.m21SonicRecastV453,null);
   negatives++;snap();
  });
}
for(const x of failures)console.error('M44_TRAVEL_FAIL',JSON.stringify(x));
console.log('M44_B01_AUTHORED_TRAVEL '+JSON.stringify({
 championIdentities:specs.map(s=>s.champ+' '+s.slot),
 seats:2,scenarios:tests,snapshots,negativeChecks:negatives,
 failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
assert.equal(tests,34);
assert.equal(snapshots,34);
