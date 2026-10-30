/** M44 B13 — mixed authored PvP intents, mirrored blue/red.
 * Both players enqueue in the same preparation phase; engine resolves authoritatively.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const pairs=[
 ['Yorick','R','Azir','W'],['Jayce','R','Briar','W'],
 ['Rumble','Q','Shyvana','E'],['Anivia','R','AurelionSol','E'],
 ['Leblanc','W','Zed','W'],['Ekko','R','Ryze','R'],
 ['Nami','W','Belveth','E'],['Taliyah','W','Diana','R'],
 ['Katarina','E','Samira','W'],['Kalista','E','Volibear','R']
];
let passed=0,snapshots=0;const failures=[];
for(const flip of [false,true])for(const [c1,s1,c2,s2] of pairs){
 const blue=flip?c2:c1,red=flip?c1:c2,
  blueSlot=flip?s2:s1,redSlot=flip?s1:s2;
 try{
  const a=new Arena(map,mask,{seed:131316,mode:'pvp',
   draft:{blue:{MID:blue},red:{MID:red}}});
  for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:9500,maxHp:9500,
   autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
  for(const m of a.minions)Object.assign(m,{x:.08,y:.08});
  const b=a.units.find(v=>v.id==='blue_MID'),
   r=a.units.find(v=>v.id==='red_MID');
  for(const [u,x] of [[b,.5],[r,.522]])
   Object.assign(u,{x,y:.5,hp:8000,maxHp:10000,mana:10000,maxMana:10000,
    level:16,skillRanks:{Q:5,W:5,E:5,R:3},
    skillCds:{Q:0,W:0,E:0,R:0}});
  a.visible=()=>true;a.walkable=()=>true;a.canSeePoint=()=>true;
  a.obstacleLine=()=>false;
  for(const u of [b,r])if(u.champ==='Kalista')
   a.damage(u===b?r:b,30,u,'physical','basic');
  for(const u of [b,r])if(u.champ==='Ekko'){
   a.advanceBoardPassivesV453Dev69();
   a.gameTime=3;u.x+=.005;
  }
  const opts=(u,slot,enemy)=>{
   const rule=a.boardKitForV453Dev69(u.champ,slot,u);
   assert.ok(rule,'authored rule exists');
   return ['target_enemy','target_any'].includes(rule.shape)?
    {targetId:enemy.id}:
    ['line_enemy','circle_enemy','cone_enemy','move_point','deploy_point'].includes(rule.shape)?
    {point:{x:enemy.x,y:enemy.y}}:{};
  };
  const qb=a.queueBoardSkillV453Dev69('blue',b.id,blueSlot,opts(b,blueSlot,r));
  const qr=a.queueBoardSkillV453Dev69('red',r.id,redSlot,opts(r,redSlot,b));
  assert.equal(qb.ok,true,'blue planned');
  assert.equal(qr.ok,true,'red planned');
  const receipts=[];const normal=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(u,q)=>{
   const v=normal(u,q);receipts.push({team:u.team,champ:u.champ,ok:v?.ok,reason:v?.reason});return v;
  };
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=normal;}
  assert.equal(receipts.length,2,'both plans resolved');
  assert.ok(receipts.every(v=>v.ok),'both PvP receipts legal');
  a.gameTime++;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69();
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;snapshots++;
 }catch(error){failures.push({blue,red,blueSlot,redSlot,error:String(error?.stack||error)});}
}
for(const f of failures)console.error('M44_B13_MIXED_FAIL',JSON.stringify(f));
console.log('M44_B13_MIXED '+JSON.stringify({pairs:pairs.length,
 mirroredSeats:2,passed,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,20);
