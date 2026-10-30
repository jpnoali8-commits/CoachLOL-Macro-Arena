/**
 * M44 B03 — 12 authored projectile identities × 2 human PvP seats.
 * Real Arena + map/masks + V40 snapshot. NOT full-kit certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const profiles=[
 ['Ashe','R'],['Morgana','Q'],['Blitzcrank','Q'],['Brand','Q'],
 ['DrMundo','Q'],['Olaf','Q'],['Sivir','Q'],['KogMaw','Q'],
 ['TahmKench','Q'],['Nidalee','Q'],['Varus','Q'],['Elise','E']];
const failures=[];let scenarios=0,snapshots=0;
function fixture(champ,slot,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:440303,mode:'pvp',
  draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:6000,maxHp:6000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 for(const m of a.minions||[])Object.assign(m,{x:.08,y:.08});
 const u=a.units.find(v=>v.id===team+'_MID'),e=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{x:.5,y:.5,level:16,mana:10000,maxMana:10000,
  hp:5000,maxHp:5000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.527,y:.5,hp:10000,maxHp:10000,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;
 a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=()=>{
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,{point:{x:.56,y:.5}});
  assert.equal(q.ok,true,'queue '+champ+' '+JSON.stringify(q));
  let receipt;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,order)=>(receipt=original(v,order));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=original}
  assert.equal(receipt?.ok,true,'receipt '+champ+' '+JSON.stringify(receipt));
  assert.equal(receipt?.m44Projectile,true,'travelling '+champ);
  return receipt;
 };
 const tick=()=>{a.gameTime++;a.round++;a.actionLocksV40={};a.advanceBoardPassivesV453Dev69()};
 const snap=()=>{
  const v=a.snapshotV40();
  assert.equal(checksumV40(v),checksumV40(Arena.fromSnapshotV40(map,mask,v).snapshotV40()));
  snapshots++;
 };
 return {a,u,e,cast,tick,snap};
}
function identity(champ,{a,u,e}){
 const fx=a.effectResolverV41();
 switch(champ){
  case 'Ashe':return fx.has(e,'stun');
  case 'Morgana':return fx.has(e,'root');
  case 'Blitzcrank':return e.x<.527;
  case 'Brand':return e.boardBrandAblazeV453Dev69?.[u.id]>a.gameTime;
  case 'DrMundo':case 'Olaf':return fx.has(e,'slow');
  case 'Sivir':case 'Varus':return e.hp<10000;
  case 'KogMaw':return e.m26KogShred?.[u.id]?.until>a.gameTime;
  case 'TahmKench':return e.m24TasteV453?.[u.id]?.stacks===1;
  case 'Nidalee':return e.m16HuntedUntil>a.gameTime;
  case 'Elise':return fx.has(e,'stun');
 }
 return false;
}
function run(champ,slot,team,label,fn){
 try{fn(fixture(champ,slot,team));scenarios++}
 catch(e){failures.push({champ,slot,team,label,error:String(e?.stack||e)})}
}
for(const team of ['blue','red'])for(const [champ,slot] of profiles){
 run(champ,slot,team,'true flight, authored hit and snapshot',f=>{
  const {e,cast,tick,snap}=f,start=e.hp;
  cast();assert.equal(e.hp,start,'no damage before impact '+champ);
  assert.equal(identity(champ,f),false,'no effect before impact '+champ);
  tick();assert.ok(identity(champ,f),'unique contact effect '+champ);snap();
 });
 run(champ,slot,team,'spell shield consumes on contact without extra effect',f=>{
  const {a,e,cast,tick,snap}=f;
  a.applyEffectV41(e,'spell_shield',{source:e,duration:4,
   key:'m44_b03_shield_'+champ+'_'+team});
  cast();tick();
  assert.equal(identity(champ,f),false,'shield cannot apply identity '+champ);
  snap();
 });
 run(champ,slot,team,'first minion collision versus piercing and impact splash',f=>{
  const {a,e,cast,tick,snap}=f;
  const min={id:'m44_b03_min_'+team+'_'+champ,kind:'minion',
   team:e.team,x:.518,y:.5,hp:900,maxHp:900,armor:0,mr:0,spawnAt:0};
  a.minions.push(min);cast();tick();
  const pierces=['Ashe','Olaf','Sivir','Varus'].includes(champ);
  assert.equal(identity(champ,f),pierces,'first minion collision '+champ);
  // Ashe R bypasses minion as a COLLIDER, but its real splash can damage it.
  if(champ==='Ashe')assert.ok(min.hp<900,'Ashe R splash affects adjacent minion');
  else if(champ!=='Elise')assert.ok(min.hp<900,'projectile hit minion '+champ);
  if(champ==='Varus'){
   assert.equal(a.effectResolverV41().has(e,'root'),false,'Varus Q never applies R root');
   assert.equal(a.boardTemporalV453Dev69.some(z=>z.kind==='m25_varus_chain'),false,
    'Varus Q never spawns R propagation');
  }
  snap();
 });
 run(champ,slot,team,'hard terrain blocks damage and mark',f=>{
  const {a,e,cast,tick,snap}=f,start=e.hp;
  cast();a.obstacleLine=()=>true;tick();
  assert.equal(e.hp,start,'blocked path may not deal damage '+champ);
  assert.equal(identity(champ,f),false,'blocked path may not apply effect '+champ);
  snap();
 });
}
for(const team of ['blue','red']){
 run('Sivir','Q',team,'outbound + returning boomerang, one hit per leg',f=>{
  const {a,e,cast,tick,snap}=f;
  cast();tick();const first=e.hp;
  tick();assert.equal(e.hp,first,'outgoing cannot hit twice');
  tick();assert.ok(e.hp<first,'return leg hits second time');
  tick();assert.equal(a.boardTemporalV453Dev69.some(z=>
   z.kind==='m44_authored_projectile'&&z.champ==='Sivir'),false);
  snap();
 });
 run('Brand','Q',team,'pre-existing Blaze gates stun',f=>{
  const {a,u,e,cast,tick,snap}=f;
  (e.boardBrandAblazeV453Dev69??={})[u.id]=a.gameTime+5;
  cast();tick();assert.equal(a.effectResolverV41().has(e,'stun'),true);snap();
 });
 run('TahmKench','Q',team,'three Taste stacks consume into stun',f=>{
  const {a,u,e,cast,tick,snap}=f;
  (e.m24TasteV453??={})[u.id]={stacks:3,until:a.gameTime+5};
  cast();tick();assert.equal(a.effectResolverV41().has(e,'stun'),true);
  assert.equal(e.m24TasteV453[u.id],undefined);snap();
 });
 run('Varus','Q',team,'Blight only detonates after genuine Q hit',f=>{
  const {a,u,e,cast,tick,snap}=f;
  e.m21VarusBlightV453={sourceId:u.id,stacks:2,until:a.gameTime+5};
  cast();assert.equal(e.m21VarusBlightV453.stacks,2);
  tick();assert.equal(e.m21VarusBlightV453,null);
  assert.equal(a.effectResolverV41().has(e,'root'),false);snap();
 });
 run('Olaf','Q',team,'axe pickup grants Q cooldown reduction',f=>{
  const {a,u,cast,tick,snap}=f;
  cast();tick();tick();
  const axe=a.boardTemporalV453Dev69.find(z=>z.kind==='m44_olaf_axe_pickup');
  assert.ok(axe,'axe is owned and persists briefly');
  const cd=u.skillCds.Q;u.x=axe.point.x;u.y=axe.point.y;tick();
  assert.ok(u.skillCds.Q<cd,'pickup refunds cooldown');
  assert.equal(a.boardTemporalV453Dev69.some(z=>z.kind==='m44_olaf_axe_pickup'),false);
  snap();
 });
}
for(const f of failures)console.error('M44_B03_FAIL',JSON.stringify(f));
console.log('M44_B03_AUTHORED_PROJECTILE '+JSON.stringify({
 identities:profiles.map(([c,s])=>c+' '+s),seats:2,
 scenarios,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
assert.equal(scenarios,106);
assert.equal(snapshots,106);
