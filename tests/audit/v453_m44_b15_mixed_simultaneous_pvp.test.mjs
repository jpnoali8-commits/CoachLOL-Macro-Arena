/** M44 B15 two simultaneous human team intents, mirrored PvP. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B15A_KITS_V453,M44_B15B_KITS_V453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const catalog={...M44_B15A_KITS_V453,...M44_B15B_KITS_V453};
const pairs=[['Hwei','Aphelios'],['AurelionSol','Nocturne'],
 ['Jayce','Rumble'],['Kalista','Yorick'],['Skarner','Diana'],
 ['Taliyah','Belveth'],['Ekko','Rakan'],['Azir','Pantheon']];
let passed=0,snapshots=0;const failures=[];
for(const side of ['blue','red'])for(const [first,second] of pairs){
 try{
  const other=side==='blue'?'red':'blue';
  const a=new Arena(map,mask,{mode:'pvp',seed:15159,
   draft:{[side]:{MID:first},[other]:{MID:second}}});
  for(const u of a.units)Object.assign(u,{x:.07,y:.07,hp:25000,maxHp:25000,
   armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
  for(const minion of a.minions)Object.assign(minion,{x:.07,y:.07});
  a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;
  a.obstacleLine=()=>false;
  const blue=a.units.find(u=>u.id==='blue_MID'),
   red=a.units.find(u=>u.id==='red_MID');
  Object.assign(blue,{x:.5,y:.5});Object.assign(red,{x:.535,y:.5});
  for(const u of [blue,red])Object.assign(u,{level:16,mana:10000,
   maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
   skillCds:{Q:0,W:0,E:0,R:0}});
  const choose=(owner,foe)=>{
   const [slot,rule]=Object.entries(catalog[owner.champ])[0];
   const direction=owner.team==='blue'?1:-1;
   if(owner.champ==='Azir')a.m15Summon('azir_soldier',owner,
    {x:owner.x+direction*.012,y:owner.y},{hp:400,maxHp:400,until:20});
   const opts=rule.shape==='target_enemy'?{targetId:foe.id}:
    ['move_point','circle_enemy','line_enemy','cone_enemy'].includes(rule.shape)?
    {point:{x:owner.x+direction*.02,y:owner.y}}:{};
   if(owner.champ==='Hwei')opts.m44B14Variant='EE';
   return {slot,opts};
  };
  const b=choose(blue,red),r=choose(red,blue);
  assert.equal(a.queueBoardSkillV453Dev69('blue',blue.id,b.slot,b.opts).ok,true);
  assert.equal(a.queueBoardSkillV453Dev69('red',red.id,r.slot,r.opts).ok,true);
  assert.ok(blue.pendingBoardV453Dev69&&red.pendingBoardV453Dev69);
  const receipts={};const native=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(u,q)=>(receipts[u.id]=native(u,q));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=native;}
  assert.equal(blue.id,'blue_MID');assert.equal(red.id,'red_MID');
  assert.equal(blue.team,'blue');assert.equal(red.team,'red');
  assert.equal(receipts.blue_MID?.ok,true,JSON.stringify(receipts));
  assert.equal(receipts.red_MID?.ok,true,JSON.stringify(receipts));
  assert.equal(blue.pendingBoardV453Dev69,null);
  assert.equal(red.pendingBoardV453Dev69,null);
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;snapshots++;
 }catch(e){failures.push({side,first,second,error:String(e?.stack||e)})}
}
for(const f of failures)console.error('M44_B15_MIXED_FAIL',JSON.stringify(f));
console.log('M44_B15_MIXED '+JSON.stringify({pairs:pairs.length,
 passed,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,16);
