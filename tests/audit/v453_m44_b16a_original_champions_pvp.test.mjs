/* M44 B16A: bilingual-side authored slots and shared Sylas/Viego source execution. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B16A_KITS_V453,m44B14DOriginalBoardRuleV453} from '../../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const receipts={
 AurelionSol:'fallingStar',Lissandra:'ringOfFrost',Taliyah:'unraveledEarth',
 Yorick:'mourningMist',Malzahar:'maleficVisions',Fiddlesticks:'terrify',
 Nocturne:'unspeakableHorror',Skarner:'seismicBastion',Belveth:'aboveAndBelow',
 Rakan:'battleDance',Pantheon:'shieldVault',Diana:'paleCascade',
 Akshan:'comeuppance',Leblanc:'etherealChains'
};
let passed=0,snapshots=0;const failures=[];
function scenario(side,champ,label,run){
 try{
  const other=side==='blue'?'red':'blue';
  const a=new Arena(map,mask,{seed:16160,mode:'pvp',
   draft:{[side]:{MID:champ},[other]:{MID:'Annie'}}});
  for(const v of a.units)Object.assign(v,{x:.07,y:.07,hp:20000,maxHp:20000,
   armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
  for(const v of a.minions)Object.assign(v,{x:.07,y:.07});
  a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;
  a.obstacleLine=()=>false;
  const u=a.units.find(v=>v.id===side+'_MID'),
   victim=a.units.find(v=>v.id===other+'_MID'),
   ally=a.units.find(v=>v.team===side&&v.id!==u.id);
  Object.assign(u,{x:.5,y:.5,level:16,mana:10000,maxMana:10000,
   skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
  Object.assign(victim,{x:.528,y:.5});
  Object.assign(ally,{x:.527,y:.502,hp:1000,maxHp:20000});
  const cast=(slot,opts={})=>{
   const q=a.queueBoardSkillV453Dev69(side,u.id,slot,opts);
   assert.equal(q.ok,true,JSON.stringify(q));
   let result;const real=a.executeBoardSkillV453Dev69.bind(a);
   a.executeBoardSkillV453Dev69=(actor,order)=>(result=real(actor,order));
   try{a.resolveBoardSkillsV453Dev69()}
   finally{a.executeBoardSkillV453Dev69=real}
   assert.equal(result?.ok,true,JSON.stringify(result));return result;
  };
  run({a,u,victim,ally,other,cast});
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;snapshots++;
 }catch(error){failures.push({side,champ,label,error:String(error?.stack||error)})}
}
for(const side of ['blue','red']){
 for(const [champ,slots] of Object.entries(M44_B16A_KITS_V453))
  scenario(side,champ,'native',({u,victim,ally,cast})=>{
   const [slot,rule]=Object.entries(slots)[0];
   assert.equal(m44B14DOriginalBoardRuleV453(champ,slot,u),rule);
   const options=rule.shape==='target_enemy'?{targetId:victim.id}:
    rule.shape==='target_ally'?{targetId:ally.id}:
    ['circle_enemy','line_enemy','cone_enemy','move_point'].includes(rule.shape)?
     {point:{x:.53,y:.5}}:{};
   assert.equal(cast(slot,options)[receipts[champ]],true);
   assert.equal(u.id,side+'_MID');assert.equal(u.team,side);
  });
 scenario(side,'AurelionSol','empowered R',({u,cast})=>{
  u.m44B13Stardust=100;
  assert.equal(cast('R',{point:{x:.53,y:.5}}).skiesDescend,true);
 });
 scenario(side,'Nocturne','tether stays',({a,u,victim,cast})=>{
  cast('E',{targetId:victim.id});
  a.gameTime+=2;a.advanceBoardPassivesV453Dev69();
  assert.equal(u.m44B16NocturneTether,null);
  assert.equal(a.effectResolverV41().has(victim,'fear'),true);
 });
 scenario(side,'Leblanc','chain stays',({a,u,victim,cast})=>{
  cast('E',{point:{x:.53,y:.5}});
  a.gameTime+=2;a.advanceBoardPassivesV453Dev69();
  assert.equal(u.m44B16LeblancChain,null);
  assert.equal(a.effectResolverV41().has(victim,'root'),true);
 });
 scenario(side,'Malzahar','DoT ownership',({a,u,victim,cast})=>{
  cast('E',{targetId:victim.id});
  assert.ok(victim.m44B16Malefic?.[u.id]);
  const hp=victim.hp;a.gameTime+=1;a.advanceBoardPassivesV453Dev69();
  assert.ok(victim.hp<hp);
 });
 scenario(side,'Taliyah','moved into stones',({a,u,victim,cast})=>{
  cast('E',{point:{x:victim.x,y:victim.y}});
  a.gameTime+=1;a.advanceBoardPassivesV453Dev69();
  const hp=victim.hp;victim.x+=.005;
  a.gameTime+=1;a.advanceBoardPassivesV453Dev69();
  assert.ok(victim.hp<hp);
 });
 scenario(side,'Belveth','Q direction recovered',({u,cast})=>{
  u.m44B15BelvethDash={until:14,used:['E']};
  cast('W',{point:{x:.53,y:.5}});
  assert.ok(!u.m44B15BelvethDash.used.includes('E'));
 });
 scenario(side,'Rakan','shield owns ally',({u,ally,cast})=>{
  assert.equal(cast('E',{targetId:ally.id}).shielded,ally.id);
  assert.ok(ally.shield>0);assert.equal(u.id,side+'_MID');
 });
 scenario(side,'Sylas','reuse Akshan R',({a,u,victim,cast})=>{
  u.champ='Sylas';victim.champ='Akshan';
  assert.equal(a.queueSylasHijackV453M14(side,u.id,victim.id).ok,true);
  a.resolveSylasHijacksV453M14();
  assert.equal(cast('R',{targetId:victim.id}).comeuppance,true);
  assert.equal(u.champ,'Sylas');
 });
 scenario(side,'Viego','reuse LeBlanc E',({a,u,victim,other,cast})=>{
  u.champ='Viego';victim.champ='Leblanc';victim.hp=100;
  a.damage(victim,300,u,'true','spell');
  const soul=u.m44B14CSouls?.[0];assert.ok(soul);
  assert.equal(a.queueViegoPossessV453M44B14C(side,u.id,soul.id).ok,true);
  a.resolveBoardSkillsV453Dev69();
  assert.equal(u.champ,'Leblanc');
  const next=a.units.find(v=>v.id===other+'_TOP');
  Object.assign(next,{x:.529,y:.5,hp:10000});
  u.skillCds.E=0;
  assert.equal(cast('E',{point:{x:.53,y:.5}}).etherealChains,true);
  assert.equal(u.id,side+'_MID');assert.equal(u.team,side);
 });
 scenario(side,'Akshan','no target no debit',({a,u})=>{
  assert.equal(a.queueBoardSkillV453Dev69(side,u.id,'R',
   {targetId:'nonexistent'}).ok,false);
  assert.equal(u.mana,10000);
 });
}
for(const f of failures)console.error('M44_B16A_FAIL',JSON.stringify(f));
console.log('M44_B16A '+JSON.stringify({authored:Object.keys(receipts).length,
 passed,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,48);
