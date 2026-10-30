/** M44 B11 — simultaneous planning PvP collision fixtures, both team assignments.
 * These are offline real-Arena simultaneous intents, NOT network two-client E2E.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const pairs=[
 ['Twitch','Shaco','W','E'],
 ['Caitlyn','Teemo','Q','W'],
 ['Nidalee','Shaco','Q','E'],
 ['Neeko','Caitlyn','W','Q']
];
let passed=0;const failures=[];
function check(swap,profile){
 const [first,second,firstSlot,secondSlot]=profile;
 const blue=swap?second:first,red=swap?first:second,
  blueSlot=swap?secondSlot:firstSlot,redSlot=swap?firstSlot:secondSlot;
 try{
  const a=new Arena(map,mask,{seed:41155,mode:'pvp',
   draft:{blue:{MID:blue},red:{MID:red}}});
  for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:10000,maxHp:10000,
   autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
  for(const m of a.minions)Object.assign(m,{x:.08,y:.08});
  const b=a.units.find(v=>v.id==='blue_MID'),
   r=a.units.find(v=>v.id==='red_MID');
  Object.assign(b,{x:.5,y:.5,hp:5000,maxHp:5000,level:16,
   mana:10000,maxMana:10000,
   skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
  Object.assign(r,{x:.528,y:.5,hp:5000,maxHp:5000,level:16,
   mana:10000,maxMana:10000,
   skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
  a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;
  a.obstacleLine=()=>false;
  function queue(u,slot,enemy){
   const rule=a.boardKitForV453Dev69(u.champ,slot,u);
   const opts=rule.shape==='target_enemy'?{targetId:enemy.id}:
    ['move_point','line_enemy','circle_enemy'].includes(rule.shape)?
     {point:{x:enemy.x+(enemy.x-u.x)*.1,y:enemy.y}}:{};
   return a.queueBoardSkillV453Dev69(u.team,u.id,slot,opts);
  }
  assert.equal(queue(b,blueSlot,r).ok,true,'blue intent');
  assert.equal(queue(r,redSlot,b).ok,true,'red intent');
  const receipts=[];const native=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(u,q)=>{
   const result=native(u,q);receipts.push({champ:u.champ,team:u.team,result});
   return result;
  };
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=native;}
  assert.equal(receipts.length,2,'two PvP sides commit in same turn');
  assert.ok(receipts.every(v=>v.result?.ok),'both authored receipts are legal');
  a.gameTime++;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69();
  if([blue,red].includes('Twitch')){
   const twitch=blue==='Twitch'?b:r;
   assert.ok(a.boardTemporalV453Dev69.some(v=>
    v.kind==='m44_b11_twitch_cask'&&v.ownerId===twitch.id));
  }
  if([blue,red].includes('Teemo')){
   const teemo=blue==='Teemo'?b:r;
   assert.ok(teemo.boardSpeedV453Dev69.until>a.gameTime);
  }
  if([blue,red].includes('Neeko')){
   const neeko=blue==='Neeko'?b:r;
   assert.ok(a.boardSummonsV453Dev69.some(v=>
    v.ownerId===neeko.id&&v.kind==='neeko_clone'));
  }
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;
 }catch(error){failures.push({blue,red,error:String(error?.stack||error)});}
}
for(const flip of [false,true])for(const profile of pairs)check(flip,profile);
for(const x of failures)console.error('M44_B11_MIXED_FAIL',JSON.stringify(x));
console.log('M44_B11_MIXED '+JSON.stringify({passed,failures:failures.length,
 bilateral:true,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,8);
