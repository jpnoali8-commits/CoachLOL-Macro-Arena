/** M43 third family: moving cones, blocked channels, mobile support zones.
 * Three distinct champions, two seats, snapshots, real terrain counterplay.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=s=>JSON.parse(readFileSync(new URL('../../data/'+s,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let count=0,snaps=0,negatives=0;const failures=[];
function setup(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:434345,mode:'pvp',
  draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:5000,maxHp:5000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID'),
  e2=a.units.find(v=>v.id===other+'_TOP'),
  ally=a.units.find(v=>v.id===team+'_TOP'),
  adc=a.units.find(v=>v.id===team+'_ADC');
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:4200,maxHp:4200,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.53,y:.5,hp:8000,maxHp:8000});
 Object.assign(e2,{x:.08,y:.08,hp:8000,maxHp:8000});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,opts={})=>{
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(q.ok,true,champ+' '+slot+' '+JSON.stringify(q));
  a.resolveBoardSkillsV453Dev69();
 };
 const tick=(n=1)=>{a.gameTime+=n;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69()};
 const snap=()=>{const s=a.snapshotV40();
  assert.equal(checksumV40(s),checksumV40(Arena.fromSnapshotV40(map,mask,s).snapshotV40()));snaps++};
 return {a,u,e,e2,ally,adc,cast,tick,snap};
}
function test(champ,team,fn){
 try{fn(setup(champ,team));count++}catch(error){
 failures.push({champ,team,error:String(error?.stack||error)})}
}
for(const team of ['blue','red']){
 test('Corki',team,({a,u,e,e2,cast,tick,snap})=>{
  e.x=.53;cast('E',{point:{x:.54,y:.5}});
  const z=a.boardTemporalV453Dev69.find(z=>z.kind==='m26_corki_gatling');
  assert.ok(z);
  const initial=e.hp;
  u.x=.60;e2.x=.63;e2.y=.5;
  const newHP=e2.hp;
  tick(1);
  assert.equal(z.origin.x,u.x,'Corki gatling forward projection must relocate with owner');
  assert.equal(e.hp,initial,'old cast position does not continue damaging enemies');
  assert.ok(e2.hp<newHP,'new frontal enemy suffers real Gatling Gun damage');
  assert.ok(e2.m26CorkiShred?.[u.id]?.stacks>=1);
  snap();
 });
 test('Lucian',team,({a,u,e,e2,cast,tick,snap})=>{
  e.x=.52;e2.x=.54;e2.y=.5;
  cast('R',{point:{x:.57,y:.5}});
  const z=a.boardTemporalV453Dev69.find(z=>z.kind==='m25_lucian_culling');
  assert.ok(z);
  const near=e.hp,blocked=e2.hp;
  a.obstacleLine=(from,v)=>v?.id===e2.id;
  tick(1);
  assert.ok(e.hp<near,'unblocked victim must receive Culling pulse');
  assert.equal(e2.hp,blocked,'cannot penetrate blocked victim in fissure');
  negatives++;snap();
 });
 test('Milio',team,({a,u,ally,adc,cast,tick,snap})=>{
  ally.x=.51;ally.y=.5;adc.x=.08;
  cast('W');
  const z=a.boardTemporalV453Dev69.find(z=>z.kind==='m25_milio_campfire');
  assert.ok(z);
  u.x=.6;adc.x=.605;adc.y=.5;
  ally.hp=3000;adc.hp=3000;
  tick(1);
  assert.equal(z.point.x,u.x,'warm campfire center follows author-owned champion');
  assert.equal(ally.hp,3000,'old location cannot continue grant warm heals');
  assert.ok(adc.hp>3000,'new nearby ally benefits from warm campfire');
  assert.ok(adc.m25MilioRangeUntil>a.gameTime);
  u.hp=0;tick(1);
  assert.equal(a.boardTemporalV453Dev69.some(z=>z.kind==='m25_milio_campfire'),false);
  negatives++;snap();
 });
}
for(const err of failures)console.error('M43_MOBILE_FAMILY_FAIL',JSON.stringify(err));
console.log('M43_B01_MOBILE_FAMILY '+JSON.stringify({
 champions:['Corki','Lucian','Milio'],seats:2,scenarios:count,
 snapshots:snaps,negativeChecks:negatives,failures:failures.length,certifiedKits:0
}));
assert.equal(failures.length,0);
assert.equal(count,6);
assert.equal(snaps,6);
