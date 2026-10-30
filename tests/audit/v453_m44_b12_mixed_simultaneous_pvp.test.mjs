/** M44 B12: mirrored mixed-roster simultaneous planning and combat.
 * One human PvP seat controls five champions per team; this is offline
 * authoritative Arena, NOT a pair of network-connected browser clients.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const pairs=[
 ['Evelynn','R','Rengar','E'],
 ['Rengar','W','Khazix','Q'],
 ['MonkeyKing','R','Kaisa','Q'],
 ['Viego','R','Akshan','Q'],
 ['Talon','W','Khazix','W'],
 ['Akshan','Q','MonkeyKing','E'],
 ['Viego','Q','Rengar','E'],
 ['Kaisa','R','Evelynn','E']
];
let passed=0,snapshots=0;const failures=[];
for(const mirrored of [false,true])for(const pair of pairs){
 const [first,fslot,second,sslot]=pair;
 const blue=mirrored?second:first,red=mirrored?first:second,
  blueSlot=mirrored?sslot:fslot,redSlot=mirrored?fslot:sslot;
 try{
  const a=new Arena(map,mask,{seed:441214,mode:'pvp',
   draft:{blue:{MID:blue},red:{MID:red}}});
  for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:9500,maxHp:9500,
   autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
  for(const m of a.minions)Object.assign(m,{x:.08,y:.08});
  const b=a.units.find(v=>v.id==='blue_MID'),
   r=a.units.find(v=>v.id==='red_MID');
  for(const [u,x] of [[b,.5],[r,.52]])
   Object.assign(u,{x,y:.5,hp:6000,maxHp:6000,mana:10000,maxMana:10000,
    level:16,skillRanks:{Q:5,W:5,E:5,R:3},
    skillCds:{Q:0,W:0,E:0,R:0}});
  a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
  if(blue==='Kaisa')r.m44B12KaisaPlasma={[b.id]:a.gameTime+5};
  if(red==='Kaisa')b.m44B12KaisaPlasma={[r.id]:a.gameTime+5};
  function queue(u,slot,opponent){
   const rule=a.boardKitForV453Dev69(u.champ,slot,u);
   const params=['target_enemy','target_ally'].includes(rule.shape)?
    {targetId:opponent.id}:
    ['line_enemy','move_point','cone_enemy','circle_enemy'].includes(rule.shape)?
    {point:{x:opponent.x+(opponent.x-u.x)*.12,y:opponent.y}}:{};
   return a.queueBoardSkillV453Dev69(u.team,u.id,slot,params);
  }
  assert.equal(queue(b,blueSlot,r).ok,true,'blue can queue authored spell');
  assert.equal(queue(r,redSlot,b).ok,true,'red can queue authored spell');
  const receipts=[],original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(u,intent)=>{
   const result=original(u,intent);
   receipts.push({team:u.team,champ:u.champ,result});return result;
  };
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=original;}
  assert.equal(receipts.length,2,'both seats commit in same phase');
  assert.ok(receipts.every(v=>v.result?.ok),'both real receipts accepted');
  a.gameTime++;a.round++;a.actionLocksV40={};a.advanceBoardPassivesV453Dev69();
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;snapshots++;
 }catch(error){
  failures.push({blue,red,blueSlot,redSlot,error:String(error?.stack||error)});
 }
}
for(const f of failures)console.error('M44_B12_MIXED_FAIL',JSON.stringify(f));
console.log('M44_B12_MIXED '+JSON.stringify({
 passed,snapshots,pairs:pairs.length,mirroredSeats:2,
 failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,16);
