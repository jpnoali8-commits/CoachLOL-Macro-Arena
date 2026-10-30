/* M44 B31A: Katarina Q terrain-grounded dagger and source-authorial on-hit E/P. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),cases=[];
function fixture(side,mine='Katarina'){
 const foe=side==='blue'?'red':'blue';
 const a=new Arena(map,mask,{mode:'pvp',seed:31031,
  draft:{[side]:{MID:mine},[foe]:{MID:'Annie'}}});
 for(const x of a.units)Object.assign(x,{x:.07,y:.07,hp:20000,maxHp:20000,
  armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const x of a.minions)Object.assign(x,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;
 const u=a.units.find(x=>x.id===side+'_MID'),v=a.units.find(x=>x.id===foe+'_MID');
 for(const x of [u,v])Object.assign(x,{level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(u,{x:.5,y:.5,attackAt:12});Object.assign(v,{x:.525,y:.5});
 const cast=(slot,opts={})=>{
  const q=a.queueBoardSkillV453Dev69(u.team,u.id,slot,opts);
  assert.equal(q.ok,true,JSON.stringify(q));
  let receipt;const fn=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(unit,cmd)=>{
   const r=fn(unit,cmd);if(unit.id===u.id)receipt=r;return r;};
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=fn;}
  assert.equal(receipt?.ok,true,JSON.stringify(receipt));return receipt;
 };
 return {a,u,v,cast,foe};
}
const test=(name,fn)=>cases.push({name,fn});
const dagger=(u,x=.535,y=.5)=>u.m44B26Daggers=[
 {id:813,x,y,until:5,power:110,m44B28RealmId:u.realmIdV453Dev69||null}];
test('E unit source-opted item on-hit occurs without a basic attack',({a,u,v,cast})=>{
 u.items=['nashors_tooth'];const hp=v.hp;const beforeAA=u.lastAttackAt;
 const r=cast('E',{targetId:v.id});
 assert.equal(r.shunpo,true);assert.ok(r.hit);
 assert.ok(hp-v.hp>=75); // 60 E base plus 15 Nashor, zero MR
 assert.equal(u.lastAttackAt,beforeAA);
 assert.equal(u.attackAt,0);
 assert.equal(u.onHitStacks||0,0);
});
test('E dagger blink procs one source on-hit without energize or basic stacks',({a,u,v,cast})=>{
 u.items=['nashors_tooth','rapid_firecannon'];
 u.energizeStacksV453Dev38=100;dagger(u);
 v.x=.535;const hp=v.hp;
 const r=cast('E',{targetId:'dagger_813'});
 assert.equal(r.daggerShunpo,true);assert.equal(r.daggersCollected,1);
 assert.ok(hp-v.hp>130);
 assert.equal(u.energizeStacksV453Dev38,100);
 assert.equal(u.attackAt,0);
});
test('Q dagger pickup uses on-hit per champion hit, not normal basic attack',({a,u,v})=>{
 u.items=['nashors_tooth'];dagger(u,.5,.5);
 const hp=v.hp;v.x=.5;
 const count=a.m44B26KatarinaPickupV453(u);
 assert.equal(count,1);assert.ok(hp-v.hp>=125);
 assert.equal(u.lastAttackAt,undefined);
 assert.equal(u.attackAt,12);
});
test('E and pickup apply exactly once each to the same enemy',({a,u,v,cast})=>{
 u.items=['nashors_tooth'];dagger(u,.525,.5);v.x=.525;
 const hp=v.hp,r=cast('E',{targetId:v.id});
 assert.equal(r.shunpo,true);assert.equal(r.daggersCollected,1);
 assert.equal(u.m44B26Daggers.length,0);
 const after=v.hp;a.m44B26KatarinaPickupV453(u);assert.equal(v.hp,after);
 assert.ok(hp-after>120);
});
test('E spell shield blocks on-hit primary and item effects',({a,u,v,cast})=>{
 u.items=['nashors_tooth'];
 a.applyEffectV41(v,'spell_shield',{source:v,duration:2,key:'b31a_shield'});
 const hp=v.hp,r=cast('E',{targetId:v.id});
 assert.equal(r.shunpo,true);assert.equal(r.hit,false);assert.equal(v.hp,hp);
});
test('E invalid fabricated dagger cannot spend mana or apply on-hit',({a,u,v})=>{
 u.items=['nashors_tooth'];const hp=v.hp,mana=u.mana,cd=u.skillCds.E;
 const q=a.queueBoardSkillV453Dev69(u.team,u.id,'E',{targetId:'dagger_999'});
 assert.equal(q.ok,false);assert.equal(v.hp,hp);assert.equal(u.mana,mana);
 assert.equal(u.skillCds.E,cd);assert.equal(u.attackAt,12);
});
test('Q terrain fallback finds a legal position near preferred drop',({a,u,v,cast})=>{
 const desired={x:v.x+350/a.worldWidth,y:v.y};
 const walk=a.walkable.bind(a);
 a.walkable=(x,y,actor)=>Math.hypot((x-desired.x)*a.worldWidth,
  (y-desired.y)*a.worldHeight)<15?false:walk(x,y,actor);
 const hp=v.hp,r=cast('Q',{targetId:v.id});
 assert.ok(v.hp<hp);
 assert.equal(r.bouncingBlade,true);assert.equal(r.groundBlocked,undefined);
 assert.ok(r.daggerPoint);
 assert.equal(a.walkable(r.daggerPoint.x,r.daggerPoint.y,u),true);
 assert.ok(a.mapDistance(r.daggerPoint,desired)<=100);
 a.gameTime=1.03;a.advanceBoardTemporalV453Dev69();
 assert.ok(u.m44B26Daggers?.length);
});
test('Q no legal terrain emits no fake ground dagger',({a,u,v,cast})=>{
 const walk=a.walkable.bind(a);
 a.walkable=(x,y,actor)=>a.mapDistance({x,y},u)>65?false:walk(x,y,actor);
 const r=cast('Q',{targetId:v.id});
 assert.equal(r.bouncingBlade,true);assert.equal(r.groundBlocked,true);
 assert.equal(r.daggerPoint,null);
 a.gameTime=1.03;a.advanceBoardTemporalV453Dev69();
 assert.equal((u.m44B26Daggers||[]).length,0);
});
test('Q bounce can hit a secondary without requiring secondary visibility',({a,u,v,foe,cast})=>{
 const second=a.units.find(x=>x.team===foe&&x.id!==v.id);
 Object.assign(second,{x:.54,y:.5});
 a.visible=(team,target)=>target.id!==second.id;
 const hp=second.hp,r=cast('Q',{targetId:v.id});
 assert.equal(r.hitIds.includes(second.id),true);assert.ok(second.hp<hp);
});
let passed=0,failures=[];
for(const side of ['blue','red'])for(const scenario of cases){
 try{const x=fixture(side);scenario.fn(x);
  const snap=x.a.snapshotV40(),back=Arena.fromSnapshotV40(map,mask,snap);
  assert.equal(checksumV40(snap),checksumV40(back.snapshotV40()));passed++;
 }catch(error){failures.push({side,name:scenario.name,error:String(error?.stack||error)});}
}
for(const f of failures)console.error('M44_B31A_FAIL',JSON.stringify(f));
console.log('M44_B31A',JSON.stringify({cases:cases.length,seats:2,passed,failed:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
