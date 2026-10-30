/** M44 B11: Twitch W/E/P, Teemo W/E, Shaco E, Caitlyn Q — authored PvP fixtures. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B11_KITS_V453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let passed=0,snapshots=0;const failures=[];
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:441111,mode:'pvp',
  draft:{[team]:{MID:champ,TOP:'Annie'},[other]:{MID:'Annie',TOP:'Malphite'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:8000,maxHp:8000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 for(const m of a.minions)Object.assign(m,{x:.08,y:.08});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID'),
  other2=a.units.find(v=>v.id===other+'_TOP');
 Object.assign(u,{x:.5,y:.5,hp:5000,maxHp:5000,mana:10000,maxMana:10000,
  level:16,skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.527,y:.5,hp:12000,maxHp:12000,armor:0,mr:0});
 Object.assign(other2,{x:.54,y:.5,hp:12000,maxHp:12000,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;
 a.obstacleLine=()=>false;
 function cast(slot,opts={}){
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,
   {point:opts.point??null,targetId:opts.targetId??null});
  assert.equal(queued.ok,true,'queue '+champ+' '+slot+JSON.stringify(queued));
  const original=a.executeBoardSkillV453Dev69.bind(a);let receipt;
  a.executeBoardSkillV453Dev69=(actor,q)=>(receipt=original(actor,q));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=original;}
  assert.equal(receipt?.ok,true,'receipt '+champ+' '+slot+JSON.stringify(receipt));
  return receipt;
 }
 function tick(){a.gameTime++;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69();}
 return {a,u,e,other2,cast,tick};
}
function check(team,champ,label,run){
 try{
  const f=fixture(champ,team);run(f);
  const snap=f.a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;snapshots++;
 }catch(error){failures.push({team,champ,label,error:String(error.stack||error)});}
}
for(const team of ['blue','red']){
 check(team,'Twitch','P poison from AA deals later damage',({a,u,e,tick})=>{
  a.damage(e,30,u,'physical','basic');
  assert.equal(e.m16TwitchPoison[u.id].stacks,1);
  const hp=e.hp;tick();assert.ok(e.hp<hp);
 });
 check(team,'Twitch','P caps at six real stacks',({a,u,e})=>{
  for(let i=0;i<8;i++)a.damage(e,10,u,'physical','basic');
  assert.equal(e.m16TwitchPoison[u.id].stacks,6);
 });
 check(team,'Twitch','W does not move caster and has delayed impact',({u,e,cast,tick})=>{
  const x=u.x;assert.equal(cast('W',{point:{x:e.x,y:e.y}}).venomCask,true);
  assert.equal(u.x,x);assert.equal(e.m16TwitchPoison,undefined);
  tick();assert.ok(e.m16TwitchPoison?.[u.id]?.stacks>0);
 });
 check(team,'Twitch','W applies actual slow',({a,e,cast,tick})=>{
  cast('W',{point:{x:e.x,y:e.y}});tick();
  assert.equal(a.effectResolverV41().has(e,'slow'),true);
 });
 check(team,'Twitch','W persists and stacks over multiple turns',({u,e,cast,tick})=>{
  cast('W',{point:{x:e.x,y:e.y}});tick();tick();tick();
  assert.ok(e.m16TwitchPoison?.[u.id]?.stacks>=3);
 });
 check(team,'Twitch','E requires a visible poisoned target',({a,u})=>{
  assert.equal(a.queueBoardSkillV453Dev69(u.team,u.id,'E').ok,false);
 });
 check(team,'Twitch','E does not consume passive poison',({a,u,e,cast})=>{
  a.damage(e,25,u,'physical','basic');a.damage(e,25,u,'physical','basic');
  const hp=e.hp;assert.equal(cast('E').contaminated,1);
  assert.ok(e.hp<hp);assert.equal(e.m16TwitchPoison[u.id].stacks,2);
 });
 check(team,'Twitch','E poison expiry between queue and commit costs zero',({a,u,e})=>{
  a.damage(e,25,u,'physical','basic');
  assert.equal(a.queueBoardSkillV453Dev69(u.team,u.id,'E').ok,true);
  e.m16TwitchPoison[u.id].until=0;
  const mana=u.mana,r=a.executeBoardSkillV453Dev69(u,u.pendingBoardV453Dev69);
  assert.equal(r.ok,false);assert.equal(u.mana,mana);
 });
 check(team,'Twitch','E cannot leak enemy location through fog',({a,u,e})=>{
  a.damage(e,25,u,'physical','basic');
  a.visible=(seat,target)=>target.id===e.id?false:true;
  assert.equal(a.queueBoardSkillV453Dev69(u.team,u.id,'E').ok,false);
 });
 check(team,'Twitch','E does not target an enemy in another realm',({a,u,e})=>{
  a.damage(e,25,u,'physical','basic');
  const prior=a.sameCombatRealmV453Dev69.bind(a);
  a.sameCombatRealmV453Dev69=(x,y)=>y.id===e.id?false:prior(x,y);
  assert.equal(a.queueBoardSkillV453Dev69(u.team,u.id,'E').ok,false);
 });
 check(team,'Teemo','W active movement buff',({u,cast})=>{
  assert.equal(cast('W').moveQuick,true);
  assert.ok(u.boardSpeedV453Dev69.until>0);
  assert.ok(u.boardSpeedV453Dev69.fraction>=.4);
 });
 check(team,'Teemo','E is a passive not an extra active spell',({a,u})=>{
  assert.equal(a.queueBoardSkillV453Dev69(u.team,u.id,'E').ok,false);
 });
 check(team,'Teemo','E attack continues to apply Toxic Shot DOT',({a,u,e})=>{
  a.damage(e,45,u,'physical','basic');
  assert.equal(a.effectResolverV41().has(e,'dot'),true);
 });
 check(team,'Shaco','E bonus against low health enemy',({a,e,cast})=>{
  e.hp=2000;const rec=cast('E',{targetId:e.id});
  assert.equal(rec.lowHealthBonus,true);assert.ok(e.hp<2000);
  assert.equal(a.effectResolverV41().has(e,'slow'),true);
 });
 check(team,'Shaco','E does not invent low HP bonus at full HP',({e,cast})=>{
  assert.equal(cast('E',{targetId:e.id}).lowHealthBonus,false);
 });
 check(team,'Shaco','E spell shield prevents slow',({a,e,cast})=>{
  a.applyEffectV41(e,'spell_shield',{source:e,duration:4,key:'b11_spellshield'});
  cast('E',{targetId:e.id});
  assert.equal(a.effectResolverV41().has(e,'slow'),false);
 });
 check(team,'Shaco','E cannot target beyond range',({a,u,e})=>{
  e.x=.62;
  assert.equal(a.queueBoardSkillV453Dev69(u.team,u.id,'E',{targetId:e.id}).ok,false);
 });
 check(team,'Caitlyn','Q penetrates with falloff on second champion',({e,other2,cast,tick})=>{
  const first=e.hp,second=other2.hp,r=cast('Q',{point:{x:.57,y:.5}});
  assert.equal(r.m44Projectile,true);assert.equal(e.hp,first);
  tick();tick();assert.ok(e.hp<first&&other2.hp<second);
  assert.ok(first-e.hp>second-other2.hp);
 });
 check(team,'Caitlyn','Q retains full damage on trap-revealed victim',({a,u,e,other2,cast,tick})=>{
  other2.m16CaitHeadshot={ownerId:u.id,until:a.gameTime+4};
  const first=e.hp,second=other2.hp;
  cast('Q',{point:{x:.57,y:.5}});tick();tick();
  assert.ok(e.hp<first&&other2.hp<second);
  assert.ok(Math.abs((first-e.hp)-(second-other2.hp))<=2);
  assert.ok(other2.m16CaitHeadshot?.until>a.gameTime);
 });
 check(team,'Caitlyn','Q cannot pass a new wall before arrival',({a,e,cast,tick})=>{
  const hp=e.hp;cast('Q',{point:{x:.57,y:.5}});
  a.obstacleLine=()=>true;tick();tick();assert.equal(e.hp,hp);
 });
}
for(const err of failures)console.error('M44_B11_FAIL',JSON.stringify(err));
console.log('M44_B11_AUTHORED '+JSON.stringify({
 champions:Object.keys(M44_B11_KITS_V453),newNamedSlots:5,
 explicitPassiveSlots:1,passed,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,40);
