/**
 * M44 B09 — Gnar (Mini/Mega), Draven (Q/W/E/passive), Karma (W/E Mantra),
 * Zyra (E seed + R), Renata (W/R). Scoped authoritative PvP fixtures.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B09_KITS_V453,M44_B09_GNAR_MEGA_V453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let passed=0,snapshots=0;const failures=[];
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:440909,mode:'pvp',draft:{
  [team]:{MID:champ,TOP:'Annie'},[other]:{MID:'Annie',TOP:'Malphite'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:7000,maxHp:7000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 for(const v of a.minions||[])Object.assign(v,{x:.08,y:.08});
 const u=a.units.find(v=>v.id===team+'_MID'),e=a.units.find(v=>v.id===other+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP'),
  second=a.units.find(v=>v.id===other+'_TOP');
 Object.assign(u,{x:.5,y:.5,hp:5000,maxHp:5000,level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.527,y:.5,hp:12000,maxHp:12000,armor:0,mr:0});
 Object.assign(ally,{x:.519,y:.5,hp:3500,maxHp:7000,armor:0,mr:0});
 Object.assign(second,{x:.08,y:.08,hp:10000,maxHp:10000,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 function cast(slot,options={}){
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,{
   point:options.point??null,targetId:options.targetId??null});
  assert.equal(q.ok,true,'queue '+champ+' '+slot+': '+JSON.stringify(q));
  const native=a.executeBoardSkillV453Dev69.bind(a);let receipt;
  a.executeBoardSkillV453Dev69=(unit,payload)=>(receipt=native(unit,payload));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=native}
  assert.equal(receipt?.ok,true,'execute '+champ+' '+slot+': '+JSON.stringify(receipt));
  return receipt;
 }
 function tick(){a.gameTime++;a.round++;a.actionLocksV40={};a.advanceBoardPassivesV453Dev69();}
 return {a,u,e,ally,second,cast,tick,team,other};
}
function check(champ,team,label,run){
 const f=fixture(champ,team);
 try{run(f);const snap=f.a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;snapshots++;
 }catch(error){failures.push({champ,team,label,error:String(error?.stack||error)})}
}
for(const team of ['blue','red']){
 check('Gnar',team,'Mini W passive cannot be cast',({a,u})=>{
  assert.equal(a.queueBoardSkillV453Dev69(u.team,u.id,'W').ok,false);
 });
 check('Gnar',team,'R mini unavailable before Rage Gene',({a,u})=>{
  assert.equal(a.queueBoardSkillV453Dev69(u.team,u.id,'R').ok,false);
 });
 check('Gnar',team,'Mini E jumps and applies delayed impact',({u,e,cast,tick})=>{
  const hp=e.hp;cast('E',{point:{x:.53,y:.5}});
  assert.ok(u.x>.5);tick();assert.ok(e.hp<hp);
 });
 check('Gnar',team,'three Mini basic receipts trigger Hyper',({a,u,e})=>{
  const hp=e.hp;for(let i=0;i<3;i++)a.damage(e,25,u,'physical','basic');
  assert.ok(e.hp<hp-75);assert.equal(e.m44B09GnarHyper[u.id].stacks,0);
  assert.ok(u.m44B09Gnar.rage>0);
 });
 check('Gnar',team,'full Rage switches next Q to Mega Boulder',({a,u,e,cast,tick})=>{
  u.m44B09Gnar={form:'mini',rage:100,until:0,lockUntil:0,readyAt:1};
  const rec=cast('Q',{point:{x:.56,y:.5}});assert.equal(rec.m44Projectile,true);
  assert.equal(u.m44B09Gnar.form,'mega');
  const z=a.boardTemporalV453Dev69.find(v=>v.champ==='Gnar'&&v.slot==='Q');
  assert.equal(z.m44B09Boulder,true);tick();
  assert.ok(e.hp<12000);assert.equal(z.m44ReturnLeg,false);
 });
 check('Gnar',team,'Mega W Wallop stuns without generic status fallback',({a,u,e,cast})=>{
  u.m44B09Gnar={form:'mega',rage:0,until:a.gameTime+10,lockUntil:a.gameTime+20};
  const hp=e.hp;const r=cast('W',{point:{x:.56,y:.5}});
  assert.equal(r.mega,true);assert.ok(e.hp<hp);
  assert.ok(a.effectResolverV41().has(e,'stun'));
 });
 check('Gnar',team,'Mega E Crunch damages arrival circle',({a,u,e,cast,tick})=>{
  u.m44B09Gnar={form:'mega',rage:0,until:a.gameTime+10,lockUntil:a.gameTime+20};
  const hp=e.hp;cast('E',{point:{x:.53,y:.5}});tick();assert.ok(e.hp<hp);
 });
 check('Gnar',team,'Mega R GNAR! damages stuns displaces',({a,u,e,cast})=>{
  u.m44B09Gnar={form:'mega',rage:0,until:a.gameTime+10,lockUntil:a.gameTime+20};
  const x=e.x,hp=e.hp;cast('R',{point:{x:.56,y:.5}});
  assert.ok(e.hp<hp);assert.ok(e.x>x);assert.ok(a.effectResolverV41().has(e,'stun'));
 });
 check('Gnar',team,'Mega expires and causes Rage lockout',({a,u,tick})=>{
  u.m44B09Gnar={form:'mega',rage:0,until:a.gameTime+1,lockUntil:a.gameTime+10};
  tick();assert.equal(u.m44B09Gnar.form,'mini');assert.ok(u.m44B09Gnar.lockUntil>a.gameTime);
  assert.equal(a.m44B09GnarMegaEligibleV453Dev69(u),false);
 });
 check('Gnar',team,'Rage readiness automatically transforms after grace',({a,u,tick})=>{
  u.m44B09Gnar={form:'mini',rage:100,until:0,lockUntil:0,readyAt:1};
  a.gameTime=5;tick();assert.equal(u.m44B09Gnar.form,'mega');
 });
 check('Draven',team,'Q arms two Spinning Axes, capped and owner-scoped',({u,cast,tick})=>{
  assert.equal(cast('Q').readied,1);
  u.skillCds.Q=0;tick();assert.equal(cast('Q').readied,2);
 });
 check('Draven',team,'real AA consumes axe then catch resets W',({a,u,e,cast,tick})=>{
  cast('Q');u.skillCds.W=a.gameTime+12;
  const hp=e.hp;a.damage(e,55,u,'physical','basic');
  assert.ok(e.hp<hp-55);
  assert.equal(u.m44B09AxeReady.charges,0);
  assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m44_b09_draven_axe_catch'));
  tick();assert.equal(u.m44B09AxeReady.charges,1);
  assert.ok(u.m44B09Adoration>=2);assert.ok(u.skillCds.W<=a.gameTime);
 });
 check('Draven',team,'W speed buff has independent temporary owner clock',({u,cast})=>{
  const r=cast('W');assert.equal(r.bloodRush,true);
  assert.ok(u.boardSpeedV453Dev69.until>0);assert.ok(u.m44B09BloodRushUntil>0);
 });
 check('Draven',team,'E Stand Aside projectile slows and knocks sideways',({a,e,cast,tick})=>{
  const hp=e.hp,y=e.y;cast('E',{point:{x:.56,y:.5}});
  assert.equal(e.hp,hp);tick();assert.ok(e.hp<hp);assert.ok(e.y!==y);
  assert.ok(a.effectResolverV41().has(e,'slow'));
 });
 check('Draven',team,'E spell shield absorbs slow and displacement',({a,e,cast,tick})=>{
  const y=e.y;a.applyEffectV41(e,'spell_shield',{source:e,duration:4,key:'b09_dshield'});
  cast('E',{point:{x:.56,y:.5}});tick();
  assert.equal(e.y,y);assert.equal(a.effectResolverV41().has(e,'slow'),false);
 });
 check('Draven',team,'Adoration stacks convert to gold only on champion kill',({a,u,e})=>{
  const minion={id:'b09_enemy_minion',kind:'melee',
   team:u.team==='blue'?'red':'blue',x:.526,y:.5,hp:30,maxHp:30,
   armor:0,mr:0,spawnAt:a.gameTime};
  a.minions.push(minion);
  a.damage(minion,70,u,'physical','basic');
  assert.ok(u.m44B09Adoration>=1);
  const gold=u.gold;e.hp=35;a.damage(e,100,u,'physical','basic');
  assert.equal(u.m44B09Adoration,0);assert.ok(u.gold>gold);
 });
 check('Karma',team,'W Focused Resolve roots after two ticks',({a,e,cast,tick})=>{
  const hp=e.hp;const r=cast('W',{targetId:e.id});
  assert.equal(r.tether,true);assert.ok(e.hp<hp);
  assert.equal(a.effectResolverV41().has(e,'root'),false);
  tick();assert.equal(a.effectResolverV41().has(e,'root'),false);
  tick();assert.ok(a.effectResolverV41().has(e,'root'));
 });
 check('Karma',team,'W tether breaks outside range',({a,e,cast,tick})=>{
  cast('W',{targetId:e.id});e.x=.8;tick();tick();
  assert.equal(a.effectResolverV41().has(e,'root'),false);
 });
 check('Karma',team,'Mantra W grants first and second heal only on link',({a,u,e,cast,tick})=>{
  u.hp=1000;cast('R');const old=u.hp;
  const r=cast('W',{targetId:e.id});assert.equal(r.empowered,true);
  assert.ok(u.hp>old);const initial=u.hp;tick();tick();assert.ok(u.hp>initial);
 });
 check('Karma',team,'E Inspire shields target and grants speed',({a,ally,cast})=>{
  const r=cast('E',{targetId:ally.id});assert.equal(r.shielded,true);
  assert.ok(a.effectResolverV41().has(ally,'shield'));
  assert.ok(ally.boardSpeedV453Dev69.until>a.gameTime);
 });
 check('Karma',team,'Mantra E shields multiple allies without second R mana',({a,u,ally,cast})=>{
  cast('R');const r=cast('E',{targetId:ally.id});
  assert.equal(r.empowered,true);assert.ok(a.effectResolverV41().has(ally,'shield'));
  assert.ok(a.effectResolverV41().has(u,'shield'));
  assert.equal(u.m44B08Mantra,null);
 });
 check('Zyra',team,'E Grasping Roots germinates W seeds on its line',({a,u,e,cast,tick})=>{
  cast('W',{point:{x:e.x,y:e.y}});
  cast('E',{point:{x:.56,y:.5}});tick();tick();
  assert.equal(u.m44B08ZyraSeeds.length,0);
  assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m44_b08_zyra_plant'));
 });
 check('Zyra',team,'R Stranglethorns damages and knocks up after one tick',({a,e,cast,tick})=>{
  const hp=e.hp;cast('R',{point:{x:e.x,y:e.y}});
  assert.equal(e.hp,hp);tick();assert.ok(e.hp<hp);
  assert.ok(a.effectResolverV41().has(e,'knockup'));
 });
 check('Zyra',team,'R empowers own plants with extra attack ticks',({a,u,e,cast,tick})=>{
  a.boardTemporalV453Dev69.push({id:++a.boardTemporalIdV453Dev69,
   kind:'m44_b08_zyra_plant',ownerId:u.id,team:u.team,
   point:{x:e.x,y:e.y},power:20,shots:2,
   nextAt:a.gameTime+2,until:a.gameTime+3.1});
  cast('R',{point:{x:e.x,y:e.y}});tick();
  const p=a.boardTemporalV453Dev69.find(z=>z.kind==='m44_b08_zyra_plant');
  assert.ok(p.shots>=4);
 });
 check('Renata',team,'W Bailout defers lethal damage to 1 HP',({a,u,ally,e,cast})=>{
  cast('W',{targetId:ally.id});ally.hp=40;
  a.damage(ally,200,e,'physical','spell');
  assert.equal(ally.hp,1);assert.equal(ally.m44B09Bailout.triggered,true);
 });
 check('Renata',team,'W debt expires without takedown',({a,ally,e,cast,tick})=>{
  cast('W',{targetId:ally.id});ally.hp=40;
  a.damage(ally,200,e,'physical','spell');
  a.gameTime=4;tick();assert.equal(ally.hp,0);
  assert.equal(ally.deaths,1,'Bailout expiry uses real death pipeline');
  assert.ok(ally.deadUntil>a.gameTime,'real respawn timer');
 });
 check('Renata',team,'W ally takedown saves Bailout and restores HP',({a,u,e,ally,cast})=>{
  cast('W',{targetId:ally.id});ally.hp=40;
  a.damage(ally,200,e,'physical','spell');assert.equal(ally.hp,1);
  e.hp=30;a.damage(e,100,ally,'physical','basic');
  assert.ok(ally.hp>1);assert.equal(ally.m44B09Bailout,null);
 });
 check('Renata',team,'R enslaves foes, forces actual allied damage next turn',({a,e,second,cast,tick})=>{
  second.x=.53;second.y=.5;const hp=second.hp;
  cast('R',{point:{x:.56,y:.5}});tick();
  assert.ok(e.m44B09Hostile);assert.equal(second.hp,hp);
  tick();assert.ok(second.hp<hp);
 });
 check('Renata',team,'R spell shield denies Hostile Takeover',({a,e,cast,tick})=>{
  a.applyEffectV41(e,'spell_shield',{source:e,duration:4,key:'b09_rshield'});
  cast('R',{point:{x:.56,y:.5}});tick();
  assert.equal(e.m44B09Hostile,undefined);
 });
}
for(const error of failures)console.error('M44_B09_FAIL',JSON.stringify(error));
console.log('M44_B09_IDENTITY '+JSON.stringify({
 champions:Object.keys(M44_B09_KITS_V453),newSlots:11,
 megaVariants:Object.keys(M44_B09_GNAR_MEGA_V453),
 bilateral:2,passed,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,58);
