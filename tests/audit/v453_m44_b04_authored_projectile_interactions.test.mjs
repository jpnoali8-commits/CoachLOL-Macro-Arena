/**
 * CoachLOL M44/B04: eleven champion-owned skill contracts in real Arena PvP.
 * Two seats, real map/mask, V40 replay. NOT a full-kit certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const profiles=[
 ['Leona','E','root'],['Amumu','Q','stun'],['Janna','Q','knockup'],
 ['Veigar','Q',null],['Sona','R','stun'],['Seraphine','E','slow'],
 ['Seraphine','R','charm'],['Xerath','E','stun'],['TwistedFate','Q',null],
 ['Warwick','R','suppression'],['XinZhao','W','slow']];
let passed=0,snapshots=0;const failures=[];
function fixture(champ,slot,team){
 const other=team==='blue'?'red':'blue',
  a=new Arena(map,mask,{seed:440404,mode:'pvp',
   draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:6000,maxHp:6000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 for(const m of a.minions||[])Object.assign(m,{x:.08,y:.08});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{x:.5,y:.5,mana:10000,maxMana:10000,
  level:16,hp:5000,maxHp:5000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.527,y:.5,hp:10000,maxHp:10000,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;
 a.walkable=()=>true;a.obstacleLine=()=>false;
 function cast(point={x:.56,y:.5}){
  const order=a.queueBoardSkillV453Dev69(team,u.id,slot,{point});
  assert.equal(order.ok,true,'queue '+champ+' '+JSON.stringify(order));
  let receipt;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,q)=>(receipt=original(actor,q));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=original}
  assert.equal(receipt?.ok,true,'commit '+JSON.stringify(receipt));
  assert.equal(receipt?.m44Projectile,true,'travelling identity '+champ);
  return receipt;
 }
 function tick(){a.gameTime++;a.round++;a.actionLocksV40={};a.advanceBoardPassivesV453Dev69()}
 function snap(){
  const v=a.snapshotV40();
  assert.equal(checksumV40(v),checksumV40(Arena.fromSnapshotV40(map,mask,v).snapshotV40()));
  snapshots++;
 }
 return {a,u,e,team,other,cast,tick,snap};
}
function run(champ,slot,team,label,fn){
 try{fn(fixture(champ,slot,team));passed++}
 catch(e){failures.push({champ,slot,team,label,error:String(e?.stack||e)})}
}
for(const team of ['blue','red'])for(const [champ,slot,cc] of profiles){
 run(champ,slot,team,'delayed cast, real contact + V40',f=>{
  const {a,u,e,cast,tick,snap}=f,start=e.hp,origin=u.x;
  cast();assert.equal(e.hp,start,'damage before flight');
  assert.equal(u.x,origin,'dash before confirmed collision');
  const flights=a.boardTemporalV453Dev69.filter(z=>
   z.kind==='m44_authored_projectile'&&z.ownerId===u.id);
  assert.equal(flights.length,champ==='TwistedFate'?3:1);
  tick();assert.ok(e.hp<start,'real collision '+champ);
  if(cc)assert.equal(a.effectResolverV41().has(e,cc),true,'authored CC '+champ);
  if(['Amumu','Warwick'].includes(champ))assert.ok(u.x>.5,'authored contact dash');
  if(champ==='XinZhao')assert.ok(e.m20MarksV453?.['xin_spear_'+u.id]>a.gameTime);
  snap();
 });
 run(champ,slot,team,'spell shield prevents CC, marks and contact dash',f=>{
  const {a,u,e,cast,tick,snap}=f,hp=e.hp;
  a.applyEffectV41(e,'spell_shield',{source:e,duration:4,
   key:'m44_b04_shield_'+champ+'_'+slot+'_'+team});
  cast();assert.equal(u.x,.5,'no preflight dash through shield');
  tick();if(cc)assert.equal(a.effectResolverV41().has(e,cc),false,'spellshield '+champ);
  if(['Warwick','Amumu','Leona'].includes(champ))
   assert.equal(u.x,.5,'shield must prevent authored dash');
  if(champ==='XinZhao')
   assert.equal(e.m20MarksV453?.['xin_spear_'+u.id],undefined);
  if(!cc)assert.equal(e.hp,hp,'shield stops raw damage '+champ);
  snap();
 });
 run(champ,slot,team,'champion-first versus minion intercept',f=>{
  const {a,u,e,cast,tick,snap}=f,hp=e.hp;
  const min={id:'m44_b04_min_'+team+'_'+champ+'_'+slot,
   kind:'minion',team:e.team,x:.518,y:.5,
   hp:900,maxHp:900,armor:0,mr:0,spawnAt:0};
  a.minions.push(min);cast();tick();
  if(['Amumu','Xerath'].includes(champ)){
   assert.equal(e.hp,hp,'first minion intercept '+champ);
   assert.equal(u.x,.5,'must not dash to champion behind minion');
  }else{
   assert.ok(e.hp<hp,'piercing/champion-first must reach champion '+champ);
   if(champ==='Warwick')assert.equal(min.hp,900,'Warwick R ignores minions');
  }
  snap();
 });
 run(champ,slot,team,'hard terrain blocks first segment',f=>{
  const {a,u,e,cast,tick,snap}=f,hp=e.hp;
  cast();a.obstacleLine=()=>true;tick();
  assert.equal(e.hp,hp,'terrain blocks damage '+champ);
  if(cc)assert.equal(a.effectResolverV41().has(e,cc),false);
  if(['Amumu','Warwick'].includes(champ))assert.equal(u.x,.5,'wall prevents dash');
  snap();
 });
}
for(const team of ['blue','red']){
 run('Leona','E',team,'last champion, not first, anchors Zenith arrival',f=>{
  const {a,u,e,cast,tick,snap,other}=f;
  const second=a.units.find(v=>v.id===other+'_TOP');
  Object.assign(second,{x:.545,y:.5,hp:10000,maxHp:10000});
  cast();tick();
  assert.equal(u.x,.5,'Leona cannot arrive until end of flight');
  assert.equal(a.effectResolverV41().has(e,'root'),true,'first champion rooted at contact');
  tick();assert.equal(u.x,second.x,'last collided champion is anchor');snap();
 });
 run('Seraphine','E',team,'slow upgrades to root',f=>{
  const {a,u,e,cast,tick,snap}=f;
  a.applyEffectV41(e,'slow',{source:u,duration:4,power:.3,key:'existing_slow_b04'});
  cast();tick();assert.equal(a.effectResolverV41().has(e,'root'),true);snap();
 });
 run('Seraphine','E',team,'root upgrades to stun',f=>{
  const {a,u,e,cast,tick,snap}=f;
  a.applyEffectV41(e,'root',{source:u,duration:4,key:'existing_root_b04'});
  cast();tick();assert.equal(a.effectResolverV41().has(e,'stun'),true);snap();
 });
 run('Seraphine','R',team,'Encore ally extension, no friendly damage',f=>{
  const {a,u,e,cast,tick,snap,team}=f;
  const ally=a.units.find(v=>v.id===team+'_TOP');
  Object.assign(ally,{x:.525,y:.5,hp:4500,maxHp:4500});
  e.x=.62;const enemyHP=e.hp;
  cast({x:.61,y:.5});tick();
  assert.equal(ally.hp,4500);
  const flight=a.boardTemporalV453Dev69.find(z=>
   z.kind==='m44_authored_projectile'&&z.ownerId===u.id);
  assert.ok(flight?.m44EncoreAllies?.includes(ally.id),'ally extends Encore');
  assert.ok(flight.m44ExtensionCount>=1);
  for(let i=0;i<4;i++)tick();
  assert.ok(e.hp<enemyHP,'extended charm reaches distant enemy');
  assert.equal(a.effectResolverV41().has(e,'charm'),true);snap();
 });
 run('TwistedFate','Q',team,'Wild Cards three rays, one hit per victim',f=>{
  const {a,u,e,cast,tick,snap}=f;
  e.x=.512;const before=e.hp;
  cast();const flights=a.boardTemporalV453Dev69.filter(z=>
   z.kind==='m44_authored_projectile'&&z.ownerId===u.id);
  assert.deepEqual(flights.map(z=>z.m44Ray).sort((a,b)=>a-b),[-1,0,1]);
  const power=flights[0].power;
  tick();assert.ok(e.hp<before&&e.hp>=before-power-1,
   'one combined hit, not three stacked damage packets');
  assert.deepEqual(u.m44WildCardsLedger.hitIds,[e.id]);snap();
 });
 run('Veigar','Q',team,'Baleful Strike maximum two distinct bodies',f=>{
  const {a,e,cast,tick,snap,other}=f;
  const second=a.units.find(v=>v.id===other+'_TOP');
  Object.assign(e,{x:.516,y:.5});
  Object.assign(second,{x:.526,y:.5,hp:10000,maxHp:10000});
  const third={id:'m44_b04_third_'+team,
   kind:'minion',team:other,x:.537,y:.5,
   hp:900,maxHp:900,armor:0,mr:0,spawnAt:0};
  a.minions.push(third);cast();tick();tick();
  assert.ok(e.hp<10000&&second.hp<10000);
  assert.equal(third.hp,900,'never damage third minion');snap();
 });
}
for(const f of failures)console.error('M44_B04_FAIL',JSON.stringify(f));
console.log('M44_B04_AUTHORED '+JSON.stringify({
 identities:profiles.map(([c,s])=>c+' '+s),seats:2,
 passed,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
assert.equal(passed,100);
assert.equal(snapshots,100);
