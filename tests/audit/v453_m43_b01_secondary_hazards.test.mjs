/** M43 second family: owner-moving zones, ground entrants, terrain-counterplay.
 * No champion kit certification; 3 additional B01 identities, both owners.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const data=name=>JSON.parse(readFileSync(new URL('../../data/'+name,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const failures=[];let scenarios=0,snapshots=0,negative=0;
function fx(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:434344,mode:'pvp',
  draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:5000,maxHp:5000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID'),
  e2=a.units.find(v=>v.id===other+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:4200,maxHp:4200,level:16,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.525,y:.5,hp:8000,maxHp:8000});
 Object.assign(e2,{x:.08,y:.08,hp:8000,maxHp:8000});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,opts={})=>{
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(queued.ok,true,champ+slot+' queue '+JSON.stringify(queued));
  a.resolveBoardSkillsV453Dev69();
 };
 const tick=(seconds=1)=>{
  a.gameTime+=seconds;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69();
 };
 const snap=()=>{
  const s=a.snapshotV40();
  assert.equal(checksumV40(s),checksumV40(Arena.fromSnapshotV40(map,mask,s).snapshotV40()));
  snapshots++;
 };
 return {a,u,e,e2,cast,tick,snap,team};
}
function test(champ,team,fn){
 try{fn(fx(champ,team));scenarios++}
 catch(e){failures.push({champ,team,error:String(e?.stack||e)})}
}
for(const team of ['blue','red']){
 test('Varus',team,({a,u,e,e2,cast,tick,snap})=>{
  cast('E',{point:{x:.53,y:.5}});
  const zone=a.boardTemporalV453Dev69.find(z=>z.kind==='m26_varus_hail'&&z.ownerId===u.id);
  assert.ok(zone);
  e.x=.08;e.y=.08;e2.x=.53;e2.y=.5;
  assert.equal(a.effectResolverV41().has(e2,'slow'),false);
  tick(1);
  assert.equal(a.effectResolverV41().has(e2,'grievous_wounds'),true,
   'new ground entrant must have anti-heal');
  assert.equal(a.effectResolverV41().has(e2,'slow'),true,
   'new ground entrant must also be slowed');
  snap();
 });
 test('Alistar',team,({a,u,e,e2,cast,tick,snap})=>{
  e.x=.505;e.y=.5;
  cast('E');
  const zone=a.boardTemporalV453Dev69.find(z=>z.kind==='m25_alistar_trample');
  assert.ok(zone);
  const hp=e.hp;
  u.x=.55;e2.x=.55;e2.y=.5;
  const hp2=e2.hp;
  tick(1);
  assert.equal(zone.point.x,u.x,'moving Alistar carries trample field');
  assert.equal(e.hp,hp,'cast-origin enemy outside new field cannot receive ghost tick');
  assert.ok(e2.hp<hp2,'new target close to owner takes actual trample');
  u.hp=0;tick(1);
  assert.equal(a.boardTemporalV453Dev69.some(z=>z.kind==='m25_alistar_trample'&&z.ownerId===u.id),
   false,'dead Alistar cannot leave an attacking aura');
  negative++;snap();
 });
 test('Braum',team,({a,u,e,e2,cast,tick,snap})=>{
  e.x=.52;e.y=.5;e2.x=.54;e2.y=.5;
  cast('R',{point:{x:.57,y:.5}});
  const zone=a.boardTemporalV453Dev69.find(z=>z.kind==='m26_braum_fissure');
  assert.ok(zone);
  a.effectResolverV41().remove(e,{types:['slow']});
  a.effectResolverV41().remove(e2,{types:['slow']});
  a.obstacleLine=(from,v)=>v?.id===e2.id;
  tick(1);
  assert.equal(a.effectResolverV41().has(e,'slow'),true,'unblocked fissure contact slows');
  assert.equal(a.effectResolverV41().has(e2,'slow'),false,
   'blocked enemy cannot receive persistent fissure slow through wall');
  negative++;snap();
 });
}
for(const e of failures)console.error('M43_SECOND_FAMILY_FAIL',JSON.stringify(e));
console.log('M43_B01_SECOND_FAMILY '+JSON.stringify({
 champions:['Varus','Alistar','Braum'],seats:2,
 scenarios,expected:6,snapshots,negative,certifiedKits:0,failures:failures.length
}));
assert.equal(failures.length,0);
assert.equal(scenarios,6);
assert.equal(snapshots,6);
