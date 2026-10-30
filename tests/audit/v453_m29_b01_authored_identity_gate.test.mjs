/**
 * M29 B01: eight champion-specific mechanics exercised on BOTH human PvP seats.
 * Behavioral receipts, no fallback certification; all effects are server-owned.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const cohort=['Corki','Seraphine','Milio','Quinn','TahmKench','MasterYi','Yunara','Vi'];
let passed=0;const failures=[];
function setup(champ,team){
 const foe=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:290012,mode:'pvp',draft:{[team]:{MID:champ},[foe]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:4000,maxHp:4000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),enemy=a.units.find(v=>v.id===foe+'_MID'),
  secondary=a.units.find(v=>v.id===foe+'_TOP'),ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:4000,maxHp:4000,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:.515,y:.5,hp:6500,maxHp:6500,armor:0,mr:0});
 Object.assign(secondary,{x:.518,y:.504,hp:6500,maxHp:6500});
 Object.assign(ally,{x:.512,y:.5,hp:4000,maxHp:4000});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,opts={})=>{
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(q.ok,true,champ+' '+slot+': '+JSON.stringify(q));
  a.resolveBoardSkillsV453Dev69();
 };
 const step=(seconds=1)=>{a.gameTime+=seconds;a.round++;a.actionLocksV40={};};
 return {a,u,enemy,secondary,ally,cast,step};
}
for(const champ of cohort)for(const team of ['blue','red'])try{
 const {a,u,enemy,secondary,ally,cast,step}=setup(champ,team);
 if(champ==='Corki'){
  u.m22MagazineV453={charges:5,nextAt:10,shots:2};
  const hp=secondary.hp;
  cast('R',{point:{x:.55,y:.5}});
  assert.equal(u.m22MagazineV453.shots,3,'third missile is Big One');
  assert.ok(secondary.hp<hp,'Big One must splash nearby non-primary enemy');
 }else if(champ==='Seraphine'){
  assert.equal(a.applyEffectV41(enemy,'slow',{source:u,duration:5,power:.3}).ok,true);
  cast('E',{point:{x:.55,y:.5}});
  assert.equal(a.effectResolverV41().has(enemy,'root'),true,'Beat Drop upgrades slow to root');
  step();u.skillCds.E=0;
  cast('E',{point:{x:.55,y:.5}});
  assert.equal(a.effectResolverV41().has(enemy,'stun'),true,'Beat Drop upgrades root to stun');
 }else if(champ==='Milio'){
  cast('E',{targetId:ally.id});
  assert.equal(u.m29MilioEStock?.charges,1);
  assert.ok(ally.boardSpeedV453Dev69?.until>a.gameTime,'Warm Hugs grants ally speed');
  step();u.skillCds.E=0;cast('E',{targetId:ally.id});
  assert.equal(u.m29MilioEStock.charges,0);
  step();u.skillCds.E=0;const mana=u.mana;
  const denied=a.queueBoardSkillV453Dev69(team,u.id,'E',{targetId:ally.id});
  assert.equal(denied.ok,false);assert.equal(denied.reason,'m29_milio_no_charges');
  assert.equal(u.mana,mana,'denied cast must not spend mana');
  a.gameTime=17;a.advanceBoardPassivesV453Dev69();
  assert.equal(u.m29MilioEStock.charges,1,'first Milio charge regenerates');
 }else if(champ==='Quinn'){
  cast('W',{point:{x:.515,y:.5}});
  assert.ok(enemy.m20MarksV453?.['harrier_'+u.id]>a.gameTime,'W seeds visible nearest Harrier');
  const hp=enemy.hp;
  a.damage(enemy,80,u,'physical','basic');
  assert.ok(enemy.hp<hp-80,'Harrier improves subsequent actual basic');
  assert.ok(!(enemy.m20MarksV453?.['harrier_'+u.id]>a.gameTime),'Harrier is consumed');
 }else if(champ==='TahmKench'){
  for(let i=0;i<3;i++)a.damage(enemy,25,u,'physical','basic');
  assert.equal(enemy.m24TasteV453?.[u.id]?.stacks,3);
  cast('Q',{point:{x:.55,y:.5}});
  assert.equal(a.effectResolverV41().has(enemy,'stun'),true,'three Taste stacks empower Q');
  assert.equal(enemy.m24TasteV453?.[u.id]?.stacks,1,'Tongue consumes 3 Taste and applies a fresh stack');
 }else if(champ==='MasterYi'){
  cast('W');
  assert.ok(u.m29YiMeditateUntil>a.gameTime);
  u.statusEffectsV41=[];
  let hp=u.hp;a.damage(u,150,enemy,'magic','spell');
  const reduced=hp-u.hp;
  step(4);hp=u.hp;a.damage(u,150,enemy,'magic','spell');
  const normal=hp-u.hp;
  assert.ok(reduced<normal,'Meditate reduces non-true damage during finite board window');
 }else if(champ==='Yunara'){
  cast('Q');const hp=secondary.hp;
  a.damage(enemy,75,u,'physical','basic');
  assert.ok(secondary.hp<hp,'Q volley spreads to a second nearby enemy');
 }else if(champ==='Vi'){
  const far={x:.53,y:.5},mana=u.mana;
  const denial=a.queueBoardSkillV453Dev69(team,u.id,'Q',
   {point:far,chargeSeconds:0});
  assert.equal(denial.ok,false);assert.equal(denial.reason,'m29_vi_charge_range');
  assert.equal(u.mana,mana);
  enemy.x=.53;
  cast('Q',{point:far,chargeSeconds:2});
  assert.equal(u.x,far.x,'charged Q must relocate Vi');
  assert.ok(enemy.hp<6500,'charged Q impacts enemy');
 }
 const snap=a.snapshotV40(),restored=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(checksumV40(snap),checksumV40(restored.snapshotV40()));
 passed++;
}catch(error){failures.push({champ,team,error:String(error?.stack||error)})}
for(const x of failures)console.error('M29_IDENTITY_FAIL',JSON.stringify(x));
console.log('M29_AUTHORED_IDENTITY_QA '+JSON.stringify({champions:cohort.length,
 seats:2,passed,failed:failures.length,certifiedChampions:0}));
assert.equal(failures.length,0);assert.equal(passed,cohort.length*2);
