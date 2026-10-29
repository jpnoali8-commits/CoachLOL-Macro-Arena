/** M28/B01 authored, observable mechanics on both authoritative human seats.
 * This proves only named interactions, not complete P+QWER certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=name=>JSON.parse(readFileSync(new URL('../../data/'+name,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const failures=[],seats=['blue','red'],names=[
 'Cassiopeia','Karthus','Sejuani','Heimerdinger','KogMaw','Urgot','Viktor'];
let passed=0;
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:20262829,mode:'pvp',
  draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:3500,maxHp:3500,
  autoFollow:false,autoFarm:false,autoJungle:false,autoAttack:false,deadUntil:0});
 const u=a.units.find(v=>v.id===team+'_MID');
 const e=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:3500,maxHp:3500,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:7000,maxHp:7000});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;
 a.obstacleLine=()=>false;
 return {a,u,e};
}
function cast(a,u,slot,point){
 const q=a.queueBoardSkillV453Dev69(u.team,u.id,slot,{point});
 assert.equal(q.ok,true,slot+' queue: '+JSON.stringify(q));
 a.resolveBoardSkillsV453Dev69();
}
for(const champ of names)for(const team of seats){
 try{
  const {a,u,e}=fixture(champ,team);
  if(champ==='Cassiopeia'){
   e.m28FacingV453={x:-1,y:0};
   cast(a,u,'R',{x:.53,y:.5});
   assert.equal(a.effectResolverV41().has(e,'stun'),true,'facing Cassiopeia is petrified');
  }else if(champ==='Karthus'){
   e.y=.55;
   cast(a,u,'W',{x:.55,y:.5});
   assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m28_karthus_wall'));
   e.x=.55;e.y=.5;a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
   assert.equal(a.effectResolverV41().has(e,'slow'),true,'wall slows later entrant');
  }else if(champ==='Sejuani'){
   cast(a,u,'W',{x:.53,y:.5});
   assert.equal(e.m21FrostV453?.stacks,1,'first W adds one Frost');
   const hp=e.hp;a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
   assert.equal(e.m21FrostV453?.stacks,2,'W2 adds its own Frost');
   assert.ok(e.hp<hp,'second W damages');
  }else if(champ==='Heimerdinger'){
   cast(a,u,'Q',{x:.515,y:.5});
   assert.equal(u.m28HeimerStock?.charges,2);
   u.m28HeimerStock.charges=0;
   const mana=u.mana,cd={...u.skillCds};
   const denial=a.queueBoardSkillV453Dev69(team,u.id,'Q',{point:{x:.52,y:.5}});
   assert.equal(denial.ok,false);
   assert.equal(denial.reason,'m28_turret_stock');
   assert.equal(u.mana,mana);assert.deepEqual(u.skillCds,cd);
   a.gameTime=u.m28HeimerStock.nextAt;a.advanceBoardPassivesV453Dev69();
   assert.equal(u.m28HeimerStock.charges,1,'stock regenerates');
  }else if(champ==='KogMaw'){
   e.y=.54;
   cast(a,u,'E',{x:.55,y:.5});
   assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m28_kog_ooze'));
   e.y=.5;const hp=e.hp;a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
   assert.ok(e.hp<hp,'new entrant receives ooze damage');
  }else if(champ==='Urgot'){
   cast(a,u,'E',{x:.52,y:.5});
   assert.equal(e.x,.5,'E relocates victim behind new Urgot position');
   assert.equal(u.x,.52);
  }else if(champ==='Viktor'){
   e.x=.54;
   cast(a,u,'R',{x:.52,y:.5});
   const z=a.boardTemporalV453Dev69.find(z=>z.kind==='m28_viktor_storm');
   assert.ok(z,'moving storm exists');
   const before=z.point.x;a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
   assert.ok(z.point.x>before,'storm follows eligible enemy');
  }
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;
 }catch(e){failures.push({champ,team,error:String(e?.stack||e)})}
}
for(const x of failures)console.error('M28_AUTHORED_FAIL',JSON.stringify(x));
console.log('M28_AUTHORED_BEHAVIOR '+JSON.stringify({champions:names.length,
 teamSeats:2,passed,failed:failures.length,certifiedChampions:0}));
assert.equal(failures.length,0);
assert.equal(passed,14);
