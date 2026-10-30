/** B14 simultaneous PvP: two queued intents, 2 humans controlling 5 champs each. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const pairs=[
 ['Hwei','Q','Zed','Q','QE'],['Azir','Q','Aphelios','Q',null],
 ['Bard','W','Ekko','W',null],['Rumble','W','Jayce','Q',null],
 ['Kalista','R','Hwei','Q','QW'],['Leblanc','R','Aphelios','W',null],
 ['AurelionSol','Q','Zed','W',null],['Zed','Q','Ekko','W',null],
 ['Aphelios','W','Hwei','W','WE'],['Jayce','Q','Bard','W',null]
];
let passed=0,snapshots=0;const failures=[];
for(const mirror of [false,true])for(const [ca,sa,cb,sb,verse] of pairs){
 const blueChamp=mirror?cb:ca,redChamp=mirror?ca:cb;
 const blueSlot=mirror?sb:sa,redSlot=mirror?sa:sb;
 try{
  const a=new Arena(map,mask,{seed:144440,mode:'pvp',
   draft:{blue:{MID:blueChamp,TOP:'Annie'},
    red:{MID:redChamp,TOP:'Annie'}}});
  for(const u of a.units)Object.assign(u,{x:.08,y:.08,hp:20000,
   maxHp:20000,autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
  for(const m of a.minions)Object.assign(m,{x:.08,y:.08});
  const blue=a.units.find(u=>u.id==='blue_MID'),
   red=a.units.find(u=>u.id==='red_MID');
  const kalistaPair=blueChamp==='Kalista'||redChamp==='Kalista';
  for(const [u,x] of [[blue,.5],[red,kalistaPair?.571:.527]])
   Object.assign(u,{x,y:.5,hp:15000,maxHp:20000,mana:10000,
    maxMana:10000,level:16,skillRanks:{Q:5,W:5,E:5,R:3},
    skillCds:{Q:0,W:0,E:0,R:0}});
  for(const team of ['blue','red']){
   const ally=a.units.find(u=>u.id===team+'_TOP');
   Object.assign(ally,{x:team==='blue'?.505:kalistaPair?.568:.532,
    y:.5,hp:7000,maxHp:15000});
  }
  a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;
  a.obstacleLine=()=>false;
  for(const u of [blue,red]){
   if(u.champ==='Azir')a.m15Summon('azir_soldier',u,{x:u.x+.008,y:u.y},
    {until:20,hp:400,maxHp:400,nonCombat:true,power:0,attackRange:0,moveSpeed:0});
   if(u.champ==='Leblanc')u.m44B14LastBasicSlot='W';
  }
  const options=(u,slot,enemy)=>{
   const rule=a.boardKitForV453Dev69(u.champ,slot,u);
   assert.ok(rule,'authored descriptor');
   const ally=a.units.find(v=>v.id===u.team+'_TOP');
   const o=rule.shape==='target_ally'?{targetId:ally.id}:
    ['target_enemy','target_any'].includes(rule.shape)?{targetId:enemy.id}:
    ['line_enemy','circle_enemy','cone_enemy','move_point'].includes(rule.shape)?
    {point:{x:enemy.x,y:enemy.y}}:{};
   if(u.champ==='Hwei')o.m44B14Variant=slot==='Q'?
    (verse?.startsWith('Q')?verse:'QQ'):
    (verse?.startsWith('W')?verse:'WW');
   return o;
  };
  const qBlue=a.queueBoardSkillV453Dev69('blue',blue.id,blueSlot,
   options(blue,blueSlot,red));
  const qRed=a.queueBoardSkillV453Dev69('red',red.id,redSlot,
   options(red,redSlot,blue));
  assert.equal(qBlue.ok,true,'blue queue '+JSON.stringify(qBlue));
  assert.equal(qRed.ok,true,'red queue '+JSON.stringify(qRed));
  const receipts=[];const native=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,q)=>{
   const result=native(actor,q);receipts.push({id:actor.id,receipt:result});return result;
  };
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=native;}
  assert.equal(receipts.length,2,'two player intents resolved');
  assert.ok(receipts.every(r=>r.receipt?.ok),
   'both independent effects commit '+JSON.stringify(receipts));
  a.gameTime++;a.round++;a.actionLocksV40={};a.advanceBoardTemporalV453Dev69();
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;snapshots++;
 }catch(e){failures.push({blueChamp,redChamp,blueSlot,redSlot,
  error:String(e?.stack||e)})}
}
for(const e of failures)console.error('M44_B14_MIXED_FAIL',JSON.stringify(e));
console.log('M44_B14_MIXED '+JSON.stringify({pairs:pairs.length,
 mirroredSeats:2,passed,snapshots,failures:failures.length,
 certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,20);
