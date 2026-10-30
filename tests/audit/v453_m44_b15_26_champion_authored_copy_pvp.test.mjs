/* M44 B15 — 26 original champion identities, bilateral future-copy PvP QA. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B15A_KITS_V453,M44_B15B_KITS_V453,m44B14DOriginalBoardRuleV453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const catalog={...M44_B15A_KITS_V453,...M44_B15B_KITS_V453};
const traits={Akshan:'heroicSwing',Hwei:'subjectTorment',
 Aphelios:'moonlightVigil',Leblanc:'sigil',Jayce:'hyperCharge',
 Rumble:'electroHarpoon',Kalista:'pierce',Azir:'shiftingSands',
 Zed:'shadowSlash',Viego:'spectralMaw',Sylas:'kingslayer',
 Ekko:'timewinder',Bard:'cosmicBinding',AurelionSol:'astralFlight',
 Lissandra:'iceShard',Taliyah:'threadedVolley',Yorick:'lastRites',
 Malzahar:'callOfVoid',Fiddlesticks:'bountifulHarvest',
 Nocturne:'duskbringer',Skarner:'shatteredEarth',Briar:'headRush',
 Belveth:'voidSurge',Rakan:'gleamingQuill',Pantheon:'cometSpear',
 Diana:'crescentStrike'};
let passed=0,snapshots=0;const failures=[];
function scenario(side,champ,label,fn){
 try{
 const enemySide=side==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:15157,mode:'pvp',
  draft:{[side]:{MID:champ},[enemySide]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.07,y:.07,hp:10000,maxHp:10000,
  armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const v of a.minions)Object.assign(v,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;
 a.obstacleLine=()=>false;
 const u=a.units.find(v=>v.id===side+'_MID'),
  victim=a.units.find(v=>v.id===enemySide+'_MID');
 Object.assign(u,{x:.5,y:.5,level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(victim,{x:.528,y:.5});
 const cast=(slot,options={})=>{
  const q=a.queueBoardSkillV453Dev69(side,u.id,slot,options);
  assert.equal(q.ok,true,'queue '+JSON.stringify(q));
  let receipt;const native=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,order)=>(receipt=native(actor,order));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=native;}
  assert.equal(receipt?.ok,true,'receipt '+JSON.stringify(receipt));
  return receipt;
 };
 fn({a,u,victim,side,enemySide,cast});
 const snap=a.snapshotV40();
 assert.equal(checksumV40(snap),
  checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
 passed++;snapshots++;
 }catch(err){failures.push({side,champ,label,error:String(err?.stack||err)})}
}
for(const side of ['blue','red']){
 for(const [champ,slots] of Object.entries(catalog))
 scenario(side,champ,'native authored identity',({a,u,victim,cast})=>{
  const [slot,rule]=Object.entries(slots)[0];
  assert.equal(m44B14DOriginalBoardRuleV453(champ,slot),rule);
  if(champ==='Azir')a.m15Summon('azir_soldier',u,
   {x:.525,y:.5},{hp:400,maxHp:400,until:20});
  const options=rule.shape==='target_enemy'?{targetId:victim.id}:
   ['move_point','line_enemy','circle_enemy','cone_enemy'].includes(rule.shape)?
   {point:{x:.53,y:.5}}:{};
  if(champ==='Hwei')options.m44B14Variant='EQ';
  assert.ok(Object.hasOwn(cast(slot,options),traits[champ]));
  assert.equal(u.champ,champ);
 });
 for(const verse of ['EW','EE'])
 scenario(side,'Hwei','torment '+verse,({cast})=>{
  assert.equal(cast('E',{point:{x:.53,y:.5},m44B14Variant:verse})
   .subjectTorment,verse);
 });
 for(const gun of ['calibrum','severum','gravitum','infernum','crescendum'])
 scenario(side,'Aphelios','moon '+gun,({u,cast})=>{
  u.m44B14Aphelios={primary:gun,secondary:'calibrum',
   ammo:{calibrum:50,severum:50,gravitum:50,infernum:50,crescendum:50}};
  assert.equal(cast('R',{point:{x:.53,y:.5}}).moonlightVigil,gun);
 });
 scenario(side,'Sylas','automatic stolen new Aphelios R',({a,u,victim,cast})=>{
  victim.champ='Aphelios';
  assert.equal(a.queueSylasHijackV453M14(side,u.id,victim.id).ok,true);
  a.resolveSylasHijacksV453M14();
  assert.equal(u.sylasStolenV453M14?.sourceChamp,'Aphelios');
  assert.equal(cast('R',{point:{x:.53,y:.5}}).moonlightVigil,'calibrum');
  assert.equal(u.champ,'Sylas');assert.equal(u.sylasStolenV453M14,null);
 });
 scenario(side,'Viego','automatic borrowed new Hwei E',({a,u,victim,cast})=>{
  victim.champ='Hwei';victim.hp=100;
  a.damage(victim,300,u,'true','spell');
  const soul=u.m44B14CSouls?.[0];assert.ok(soul);
  assert.equal(a.queueViegoPossessV453M44B14C(side,u.id,soul.id).ok,true);
  a.resolveBoardSkillsV453Dev69();
  assert.equal(u.champ,'Hwei');assert.equal(u.id,side+'_MID');
  assert.equal(cast('E',{point:{x:.55,y:.5},m44B14Variant:'EQ'})
   .subjectTorment,'EQ');
 });
 scenario(side,'Belveth','direction charges',({a,u,cast})=>{
  assert.equal(cast('Q',{point:{x:.53,y:.5}}).axis,'E');
  a.gameTime+=1;const old=u.mana;
  assert.equal(a.queueBoardSkillV453Dev69(side,u.id,'Q',
   {point:{x:.54,y:.5}}).ok,false);
  assert.equal(u.mana,old);
  assert.equal(cast('Q',{point:{x:.53,y:.47}}).axis,'N');
 });
 scenario(side,'Azir','no owned soldier means no debit',({a,u})=>{
  assert.equal(a.queueBoardSkillV453Dev69(side,u.id,'E',
   {point:{x:.53,y:.5}}).ok,false);assert.equal(u.mana,10000);
 });
 scenario(side,'Hwei','unsupported third verse',({a,u})=>{
  assert.equal(a.queueBoardSkillV453Dev69(side,u.id,'E',
   {point:{x:.53,y:.5},m44B14Variant:'EX'}).ok,false);
  assert.equal(u.mana,10000);
 });
 scenario(side,'Akshan','invalid grappling anchor',({a,u})=>{
  assert.equal(a.queueBoardSkillV453Dev69(side,u.id,'E',
   {point:{x:.5,y:.5}}).ok,false);assert.equal(u.mana,10000);
 });
 scenario(side,'Leblanc','Q sigil consumes once',({a,u,victim,cast})=>{
  assert.equal(cast('Q',{targetId:victim.id}).sigil,true);
  assert.ok(victim.m44B15LeblancSigil?.[u.id]);
  const hp=victim.hp;a.damage(victim,20,u,'magic','spell');
  assert.ok(victim.hp<hp-20);
  assert.equal(victim.m44B15LeblancSigil?.[u.id],undefined);
 });
 scenario(side,'Ekko','Q returning damage',({a,u,victim,cast})=>{
  assert.equal(cast('Q',{point:{x:.53,y:.5}}).timewinder,true);
  const hp=victim.hp;a.gameTime+=1;a.advanceBoardPassivesV453Dev69();
  assert.ok(victim.hp<hp);assert.equal(u.m44B15EkkoQReturn,null);
 });
 scenario(side,'Fiddlesticks','W channel heals and ticks',({a,u,victim,cast})=>{
  u.hp=4000;assert.equal(cast('W').bountifulHarvest,true);
  const hp=victim.hp;a.gameTime+=1;a.advanceBoardPassivesV453Dev69();
  assert.ok(victim.hp<hp);assert.ok(u.hp>4000);
 });
}
for(const f of failures)console.error('M44_B15_FAIL',JSON.stringify(f));
console.log('M44_B15 '+JSON.stringify({authoredChampions:Object.keys(catalog).length,
 passed,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,84);
