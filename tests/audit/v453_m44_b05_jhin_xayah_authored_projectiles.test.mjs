/**
 * M44 B05 — 9 champion identities / 12 authored slots.
 * Real Arena, both PvP sides, real map and V40 snapshots.
 * NOT the complete P+QWER certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const profiles=[
 ['Jhin','W',null],['Xayah','Q',null],['Kennen','Q',null],
 ['Ezreal','Q',null],['Lux','Q','root'],['Ahri','E','charm'],
 ['Jinx','W','slow'],['Kaisa','W',null],['Caitlyn','E','slow']];
let passed=0,snapshots=0;const failures=[];
function fixture(champ,team){
 const other=team==='blue'?'red':'blue',
  a=new Arena(map,mask,{seed:450505,mode:'pvp',
   draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:6000,maxHp:6000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 for(const m of a.minions||[])Object.assign(m,{x:.08,y:.08});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{x:.5,y:.5,mana:10000,maxMana:10000,level:16,
  hp:5000,maxHp:5000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.527,y:.5,hp:10000,maxHp:10000,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;
 a.walkable=()=>true;a.obstacleLine=()=>false;
 function cast(slot,point={x:.56,y:.5}){
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,{point});
  assert.equal(q.ok,true,'queue '+champ+' '+slot+' '+JSON.stringify(q));
  let receipt;const fn=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,order)=>(receipt=fn(v,order));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=fn}
  assert.equal(receipt?.ok,true,'commit '+champ+' '+JSON.stringify(receipt));
  return receipt;
 }
 function tick(){
  a.gameTime++;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69();
 }
 function snap(){
  const snapshot=a.snapshotV40();
  assert.equal(checksumV40(snapshot),
   checksumV40(Arena.fromSnapshotV40(map,mask,snapshot).snapshotV40()));
  snapshots++;
 }
 return {a,u,e,cast,tick,snap,team,other};
}
function run(champ,team,label,fn){
 try{fn(fixture(champ,team));passed++}
 catch(error){failures.push({champ,team,label,error:String(error?.stack||error)})}
}
for(const team of ['blue','red'])for(const [champ,slot,cc] of profiles){
 run(champ,team,'no launch damage; real swept impact and authored identity',f=>{
  const {a,u,e,cast,tick,snap}=f;
  const hp=e.hp,receipt=cast(slot);
  assert.equal(receipt?.m44Projectile,true);
  assert.equal(e.hp,hp,'no launch damage');
  const flight=a.boardTemporalV453Dev69.filter(z=>
   z.kind==='m44_authored_projectile'&&z.ownerId===u.id);
  assert.equal(flight.length,champ==='Xayah'?2:1,'authored ray count');
  if(champ==='Caitlyn')assert.ok(u.x<.5,'recoil is at launch');
  tick();assert.ok(e.hp<hp,'contact damages champion');
  if(cc)assert.equal(a.effectResolverV41().has(e,cc),true,'individual CC');
  if(champ==='Jhin')assert.equal(a.effectResolverV41().has(e,'root'),false,
   'unmarked champion cannot be rooted by W');
  snap();
 });
 run(champ,team,'one spellshield blocks first packet and CC',f=>{
  const {a,e,cast,tick,snap,u}=f;
  a.applyEffectV41(e,'spell_shield',{source:e,duration:4,key:'b05_shield'});
  cast(slot);tick();
  if(cc)assert.equal(a.effectResolverV41().has(e,cc),false,'CC bypassed shield');
  if(champ==='Kaisa')assert.equal(e.m44KaisaPlasma?.[u.id],undefined,
   'no Plasma on blocked hit');
  if(champ==='Kennen')assert.equal(e.m44KennenStorm?.[u.id],undefined,
   'no passive mark on blocked hit');
  if(champ==='Caitlyn')assert.ok(u.x<.5,'shield must not cancel recoil');
  snap();
 });
 run(champ,team,'minion interception varies by authored ability',f=>{
  const {a,e,cast,tick,snap,u}=f,hp=e.hp;
  const min={id:'m44_b05_min_'+champ+'_'+team,
   kind:'minion',team:e.team,x:.518,y:.5,
   hp:900,maxHp:900,armor:0,mr:0,spawnAt:0};
  a.minions.push(min);cast(slot);tick();
  const pierces=['Jhin','Xayah','Lux'].includes(champ);
  assert.equal(e.hp<hp,pierces,'minion contract '+champ);
  assert.ok(min.hp<900,'minion had genuine projectile contact');
  if(champ==='Jhin')assert.equal(a.effectResolverV41().has(e,'root'),false);
  if(champ==='Caitlyn')assert.ok(u.x<.5,'net recoil independent from hit');
  snap();
 });
 run(champ,team,'hard obstacle prevents effect and leaks',f=>{
  const {a,e,cast,tick,snap,u}=f,hp=e.hp;
  cast(slot);a.obstacleLine=()=>true;tick();
  assert.equal(e.hp,hp,'no damage across wall');
  if(cc)assert.equal(a.effectResolverV41().has(e,cc),false);
  if(champ==='Kaisa')assert.equal(e.m44KaisaPlasma?.[u.id],undefined);
  snap();
 });
}
for(const team of ['blue','red']){
 run('Jhin',team,'allied damage marks, then W roots',f=>{
  const {a,u,e,team,cast,tick,snap}=f;
  const ally=a.units.find(v=>v.id===team+'_TOP');
  a.damage(e,45,ally,'physical','basic');
  assert.ok(e.m44JhinWMarks?.[u.id]>a.gameTime);
  cast('W');tick();assert.equal(a.effectResolverV41().has(e,'root'),true);snap();
 });
 run('Jhin',team,'Lotus trigger marks even before delayed explosion',f=>{
  const {a,u,e,cast,tick,snap}=f;
  const trap=a.m16TrapCreate(u,'jhin_lotus',{x:e.x,y:e.y});
  tick();assert.ok(trap.triggeredAt!==null);
  assert.ok(e.m44JhinWMarks?.[u.id]>a.gameTime);
  cast('W');tick();assert.equal(a.effectResolverV41().has(e,'root'),true);snap();
 });
 run('Jhin',team,'champion-shaped clone absorbs W without leaking true champ',f=>{
  const {a,u,e,cast,tick,snap}=f;
  const clone={id:'m44_b05_clone_'+team,kind:'neeko_clone',
   team:e.team,ownerId:e.id,x:.517,y:.5,
   hp:900,maxHp:900,until:10,stealthUntil:0,
   appearance:{kind:'champion',champ:'Annie'}};
  a.boardSummonsV453Dev69.push(clone);cast('W');tick();
  assert.ok(clone.hp<900,'clone was hit');
  assert.equal(e.hp,10000,'real champion behind clone not hit');
  assert.equal(a.effectResolverV41().has(e,'root'),false);snap();
 });
 for(const [shape,kind,appearance] of [
  ['disguised','neeko_clone',{kind:'minion',appearance:'caster'}],
  ['blob','zac_blob',null]
 ]){
  run('Jhin',team,'W crosses non-champion '+shape+' collision',f=>{
   const {a,u,e,cast,tick,snap}=f;
   const decoy={id:'b05_nontarget_'+shape+'_'+team,kind,
    team:e.team,ownerId:e.id,x:.517,y:.5,
    hp:900,maxHp:900,until:10,stealthUntil:0,
    ...(appearance?{appearance}:{})};
   a.boardSummonsV453Dev69.push(decoy);
   cast('W');tick();
   assert.ok(decoy.hp<900,'body damage applies to '+shape);
   assert.ok(e.hp<10000,'W crosses non-champion body '+shape);
   snap();
  });
 }
 run('Xayah',team,'Q twice + Clean Cuts third feather + E roots',f=>{
  const {a,u,e,cast,tick,snap}=f;
  cast('Q');tick();tick();
  assert.equal(u.m44XayahFeathers?.length,2,'Double Daggers plants two feathers');
  assert.equal(u.m44XayahCleanCuts,3);
  a.damage(e,80,u,'physical','basic');
  assert.equal(u.m44XayahFeathers?.length,3,'Clean Cuts adds third feather');
  cast('E');assert.equal(u.m44XayahFeathers?.length,0,'E removes active blades');
  tick();assert.equal(a.effectResolverV41().has(e,'root'),true,'3 feathers root');
  snap();
 });
 run('Xayah',team,'W bonus + R protected cast and five spread feathers',f=>{
  const {a,u,e,cast,tick,snap}=f;
  const base=a.basicAttackPowerV452c(u,e,'auto',{commit:false});
  cast('W');assert.ok(u.m44XayahPlumageUntil>a.gameTime);
  const buffed=a.basicAttackPowerV452c(u,e,'auto',{commit:false});
  assert.ok(buffed>base,'Deadly Plumage attack bonus');
  tick();a.damage(e,80,u,'physical','basic');
  assert.ok(u.boardSpeedV453Dev69?.until>a.gameTime);
  const n=u.m44XayahFeathers?.length||0;
  cast('R');
  assert.ok(u.m44XayahUntargetableUntil>a.gameTime,
    'Featherstorm is untargetable, not damage invulnerability');
  assert.equal(u.m44XayahFeathers?.length,n+5);
  snap();
 });
 run('Xayah',team,'expired feathers cannot be recovered later',f=>{
  const {a,u,e,cast,tick,snap}=f;
  cast('Q');tick();tick();
  assert.equal(u.m44XayahFeathers?.length,2);
  a.gameTime+=8;u.skillCds.E=0;cast('E');tick();
  assert.equal(a.effectResolverV41().has(e,'root'),false);
  assert.equal(u.m44XayahFeathers?.length,0);snap();
 });
 run('Xayah',team,'two daggers damage second body less',f=>{
  const {a,u,e,other,cast,tick,snap}=f;
  const second=a.units.find(v=>v.id===other+'_TOP');
  Object.assign(e,{x:.516,y:.5});
  Object.assign(second,{x:.527,y:.5,hp:10000,maxHp:10000,armor:0,mr:0});
  cast('Q');tick();
  assert.ok(10000-e.hp>10000-second.hp,
   'unit behind initial contact receives reduced Q damage');
  snap();
 });
 run('Jhin',team,'expired mark cannot root',f=>{
  const {a,u,e,cast,tick,snap,team}=f,
   ally=a.units.find(v=>v.id===team+'_TOP');
  a.damage(e,30,ally,'physical','basic');
  assert.ok(e.m44JhinWMarks?.[u.id]>0);
  a.gameTime=5;cast('W');tick();
  assert.equal(a.effectResolverV41().has(e,'root'),false);snap();
 });
 run('Kennen',team,'three shuriken passive marks stun exactly at three',f=>{
  const {a,u,e,cast,tick,snap}=f;
  for(let i=1;i<=3;i++){
   u.skillCds.Q=0;cast('Q');tick();
   if(i<3){
    assert.equal(e.m44KennenStorm?.[u.id]?.stacks,i);
    assert.equal(a.effectResolverV41().has(e,'stun'),false);
   }
  }
  assert.equal(a.effectResolverV41().has(e,'stun'),true);
  assert.equal(e.m44KennenStorm?.[u.id],undefined);snap();
 });
 run('Ezreal',team,'Mystic Shot refunds Q only on real hit',f=>{
  const {u,cast,tick,snap}=f;
  cast('Q');const before=u.skillCds.Q;
  tick();assert.ok(u.skillCds.Q<before,'Mystic Shot cooldown refunded');snap();
 });
 run('Lux',team,'binding stops exactly after two different bodies',f=>{
  const {a,e,other,cast,tick,snap}=f;
  const second=a.units.find(v=>v.id===other+'_TOP');
  Object.assign(e,{x:.516,y:.5});
  Object.assign(second,{x:.526,y:.5,hp:10000,maxHp:10000});
  const third={id:'m44_b05_third_'+other,kind:'minion',
   team:other,x:.535,y:.5,hp:900,maxHp:900,armor:0,mr:0,spawnAt:0};
  a.minions.push(third);cast('Q');tick();
  assert.ok(e.hp<10000&&second.hp<10000);
  assert.equal(third.hp,900,'third body beyond double-bind cap');snap();
 });
 run('Jinx',team,'Zap reveals contacted champ to caster team',f=>{
  const {a,u,e,team,cast,tick,snap}=f;
  cast('W');tick();
  assert.ok(e.m16TrueSightUntil?.[team]>a.gameTime);
  assert.equal(a.effectResolverV41().has(e,'slow'),true);snap();
 });
 run('Kaisa',team,'Void Seeker delivers two plasma stacks and true sight',f=>{
  const {a,u,e,team,cast,tick,snap}=f;
  cast('W');tick();
  assert.equal(e.m44KaisaPlasma?.[u.id]?.stacks,2);
  assert.ok(e.m16TrueSightUntil?.[team]>a.gameTime);snap();
 });
 run('Caitlyn',team,'recoil occurs before hit even against spellshield',f=>{
  const {a,u,e,cast,tick,snap}=f;
  a.applyEffectV41(e,'spell_shield',{source:e,duration:4,key:'b05_cait'});
  cast('E');assert.ok(u.x<.5,'independent recoil on firing');
  tick();assert.equal(e.hp,10000);
  assert.equal(e.m16CaitHeadshot,undefined);snap();
 });
}
for(const f of failures)console.error('M44_B05_FAIL',JSON.stringify(f));
console.log('M44_B05_AUTHORED '+JSON.stringify({
 champions:[...new Set(profiles.map(p=>p[0]))],slots:12,
 bilateralSeats:2,passed,snapshots,failures:failures.length,
 certifiedKits:0}));
assert.equal(failures.length,0);
assert.equal(passed,104);
assert.equal(snapshots,104);
