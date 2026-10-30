/** M36 broad B01 extension: 3 more independent authored champion mechanics
 * on two PvP human seats, with deterministic receipt/snapshot evidence.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,BOARD_M20_B01_V453} from '../../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const failures=[],stats={champions:3,seats:2,scenarios:0,snapshots:0,failed:0,certifiedKits:0};
function setup(champ,team){
 const foe=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:363639,mode:'pvp',draft:{[team]:{MID:champ},[foe]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:3500,maxHp:3500,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===foe+'_MID'),
  secondary=a.units.find(v=>v.id===foe+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:3500,maxHp:3500,level:16,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.52,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(secondary,{x:.54,y:.505,hp:7000,maxHp:7000,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,opts={})=>{
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(q?.ok,true,champ+' '+slot+' queue '+JSON.stringify(q));
  let result;const old=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,o)=>(result=old(v,o));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=old}
  assert.equal(result?.ok,true,champ+' '+slot+' commit '+JSON.stringify(result));
  return result;
 };
 const snap=()=>{
  const snapshot=a.snapshotV40();
  assert.equal(checksumV40(snapshot),checksumV40(Arena.fromSnapshotV40(map,mask,snapshot).snapshotV40()));
  stats.snapshots++;
 };
 return {a,u,e,secondary,cast,snap};
}
function run(champ,team,fn){try{fn(setup(champ,team));stats.scenarios++}catch(err){
 stats.failed++;failures.push({champ,team,error:String(err?.stack||err)})}}
for(const team of ['blue','red']){
 run('Galio',team,({u,e,secondary,cast,snap})=>{
  e.x=.515;secondary.x=.539;secondary.y=.5;
  assert.ok(BOARD_M20_B01_V453.Galio.E.m36GalioJusticePunch);
  cast('E',{point:{x:.54,y:.5}});
  assert.ok(u.m36GalioJusticeBackstep?.back.x<.5,
   'Galio must take distinct BACKWARDS step before punch');
  assert.ok(u.x>.5&&u.x<.53,'forward hit ends near first victim');
  assert.ok(e.hp<7000,'first champion collided with Justice Punch');
  assert.equal(secondary.hp,7000,'first collision prevents remote double hit');
  snap();
 });
 run('Fizz',team,({u,e,cast,snap})=>{
  e.x=.515;
  const hp=e.hp;
  assert.ok(BOARD_M20_B01_V453.Fizz.Q.m36FizzUrchinStrike);
  cast('Q',{targetId:e.id});
  assert.ok(e.m36FizzUrchinOnHit?.ownerId===u.id,
   'Urchin Strike triggers a real unique on-hit packet');
  assert.ok(e.m36FizzUrchinOnHit.damage>0,'physical on-hit damage applied');
  assert.ok(e.hp<hp-90,'on-hit is in addition to the original spell');
  assert.ok(u.x>.5,'Fizz dashed to its own target');
  snap();
 });
 run('Yunara',team,({a,u,e,secondary,cast,snap})=>{
  assert.ok(BOARD_M20_B01_V453.Yunara.W.m36YunaraArcOfRuin);
  e.x=.53;e.y=.5;secondary.x=.54;secondary.y=.505;
  cast('W',{point:{x:.56,y:.5}});
  const normal=7000-e.hp;
  assert.ok(normal>0,'spinning bead hits center');
  assert.ok(secondary.hp<7000,'spinning bead has original broad line');
  a.gameTime+=1;a.round++;a.actionLocksV40={};u.skillCds.R=0;
  cast('R');
  assert.ok(u.m25YunaraTranscendentUntil>a.gameTime);
  a.gameTime+=1;a.round++;a.actionLocksV40={};u.skillCds.W=0;
  e.hp=7000;secondary.hp=7000;
  cast('W',{point:{x:.56,y:.5}});
  const laser=7000-e.hp;
  assert.ok(laser>normal,'Transcendent Arc of Ruin has own empowered laser damage');
  assert.equal(secondary.hp,7000,'laser is narrower than spinning bead');
  snap();
 });
}
for(const failure of failures)console.error('M36_MORE_REAL_IDENTITIES_FAIL',JSON.stringify(failure));
console.log('M36_THREE_MORE_AUTHORED '+JSON.stringify(stats));
assert.equal(stats.failed,0);
assert.equal(stats.scenarios,6);
assert.equal(stats.snapshots,6);
