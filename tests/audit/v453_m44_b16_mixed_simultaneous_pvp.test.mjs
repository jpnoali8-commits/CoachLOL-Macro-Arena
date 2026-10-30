/* B16: simultaneous intentions from both human teams, CC cancellation, receipt and checkpoints. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,m44B14DOriginalBoardRuleV453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const pairs=[
 [['AurelionSol','R'],['Lissandra','W']],
 [['Taliyah','E'],['Rumble','R']],
 [['Yorick','E'],['Malzahar','E']],
 [['Fiddlesticks','Q'],['Nocturne','E']],
 [['Skarner','W'],['Belveth','W']],
 [['Rakan','E'],['Pantheon','W']],
 [['Diana','W'],['Akshan','R']],
 [['Leblanc','E'],['Zed','R']],
 [['Ekko','E'],['Sylas','E']],
 [['Briar','E'],['Azir','R']],
 [['Pantheon','R'],['Fiddlesticks','E']],
 [['Nocturne','W'],['Diana','E']]
];
let passed=0,stoppedByCC=0,successfulCasts=0;const failures=[];
for(const firstSide of ['blue','red'])for(const [[c1,s1],[c2,s2]] of pairs){
 try{
  const secondSide=firstSide==='blue'?'red':'blue';
  const a=new Arena(map,mask,{mode:'pvp',seed:16162,
   draft:{[firstSide]:{MID:c1},[secondSide]:{MID:c2}}});
  for(const v of a.units)Object.assign(v,{x:.07,y:.07,hp:20000,maxHp:20000,
   armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
  for(const v of a.minions)Object.assign(v,{x:.07,y:.07});
  a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
  const blue=a.units.find(v=>v.id==='blue_MID'),red=a.units.find(v=>v.id==='red_MID');
  Object.assign(blue,{x:.5,y:.5});Object.assign(red,{x:.526,y:.5});
  for(const v of [blue,red])Object.assign(v,{level:16,mana:10000,maxMana:10000,
   skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
  for(const team of ['blue','red']){
   const ally=a.units.find(v=>v.team===team&&v.id!==team+'_MID');
   Object.assign(ally,{x:team==='blue'?.505:.521,y:.5,hp:900,maxHp:20000});
  }
  const owner=a.units.find(v=>v.id===firstSide+'_MID'),
   opponent=a.units.find(v=>v.id===secondSide+'_MID');
  const params=(u,enemy,slot)=>{
   const rule=m44B14DOriginalBoardRuleV453(u.champ,slot,u);
   assert.ok(rule&&(rule.m44B16AId||rule.m44B16BId));
   const ally=a.units.find(v=>v.team===u.team&&v.id!==u.id);
   return rule.shape==='target_enemy'?{targetId:enemy.id}:
    rule.shape==='target_ally'?{targetId:ally.id}:
    ['circle_enemy','cone_enemy','line_enemy','move_point'].includes(rule.shape)?
    {point:{x:enemy.x,y:enemy.y}}:{};
  };
  assert.equal(a.queueBoardSkillV453Dev69(firstSide,owner.id,s1,params(owner,opponent,s1)).ok,true);
  assert.equal(a.queueBoardSkillV453Dev69(secondSide,opponent.id,s2,params(opponent,owner,s2)).ok,true);
  assert.ok(owner.pendingBoardV453Dev69&&opponent.pendingBoardV453Dev69);
  const mana={[owner.id]:owner.mana,[opponent.id]:opponent.mana};
  const receipts={},original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(u,q)=>(receipts[u.id]=original(u,q));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original}
  for(const unit of [owner,opponent]){
   const result=receipts[unit.id];
   assert.ok(result,'missing authoritative receipt');
   if(result.ok)successfulCasts++;
   else{
    assert.equal(result.reason,'incapacitado','unexpected cast denial');
    assert.equal(unit.mana,mana[unit.id],'denied spell spent mana');
    stoppedByCC++;
   }
   assert.equal(unit.id,unit.team+'_MID');
   assert.equal(unit.team,unit===owner?firstSide:secondSide);
   assert.equal(unit.pendingBoardV453Dev69,null);
  }
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;
 }catch(e){failures.push({firstSide,c1,s1,c2,s2,error:String(e?.stack||e)})}
}
for(const f of failures)console.error('M44_B16_MIXED_FAIL',JSON.stringify(f));
console.log('M44_B16_MIXED '+JSON.stringify({pairs:pairs.length,passed,
 successfulCasts,stoppedByCC,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,24);
assert.equal(successfulCasts+stoppedByCC,48);
