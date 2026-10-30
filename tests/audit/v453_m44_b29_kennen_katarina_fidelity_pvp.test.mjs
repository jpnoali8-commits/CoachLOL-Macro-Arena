/* M44 B29 — Kennen energy/stun/AS, Katarina first-target Q and dagger cooldown, mirrored PvP. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),cases=[];
function fixture(side,mine,other='Annie'){
 const foe=side==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:29029,mode:'pvp',draft:{[side]:{MID:mine},[foe]:{MID:other}}});
 for(const u of a.units)Object.assign(u,{x:.07,y:.07,hp:20000,maxHp:20000,armor:0,mr:0,
  autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const x of a.minions)Object.assign(x,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;
 const u=a.units.find(x=>x.id===side+'_MID'),v=a.units.find(x=>x.id===foe+'_MID');
 for(const x of [u,v])Object.assign(x,{level:16,hp:1000,maxHp:1000,armor:0,mr:0,
  mana:200,maxMana:200,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.525,y:.5});
 function cast(slot,options={}){
  const q=a.queueBoardSkillV453Dev69(u.team,u.id,slot,options);
  assert.equal(q.ok,true,JSON.stringify(q));
  let result;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,cmd)=>{
   const receipt=original(actor,cmd);if(actor.id===u.id)result=receipt;return receipt;};
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original;}
  assert.equal(result?.ok,true,JSON.stringify(result));return result;
 }
 const next=(t=.5)=>{a.gameTime+=t;a.round++;a.actionLocksV40={};};
 return {a,u,v,cast,next,foe};
}
const test=(name,mine,fn)=>cases.push({name,mine,fn});
test('Kennen third mark stuns 1.25s and restores exactly 25 energy','Kennen',({a,u,v})=>{
 u.mana=60;
 a.m44B26KennenMarkV453(u,v,'a');
 a.m44B26KennenMarkV453(u,v,'b');
 const stacks=a.m44B26KennenMarkV453(u,v,'c');
 assert.equal(stacks,3);assert.equal(u.mana,85);
 const cc=a.effectResolverV41().list(v).find(e=>e.type==='stun');
 assert.ok(cc);assert.ok(Math.abs(cc.until-a.gameTime-1.25)<1e-8);
});
test('Kennen repeats stun in six seconds for .5s, each third restores','Kennen',({a,u,v})=>{
 u.mana=30;
 for(let i=0;i<3;i++)a.m44B26KennenMarkV453(u,v,'initial_'+i);
 a.gameTime=2;
 for(let i=0;i<3;i++)a.m44B26KennenMarkV453(u,v,'next_'+i);
 const stun=a.effectResolverV41().list(v).find(e=>e.type==='stun');
 assert.ok(stun);assert.ok(Math.abs(stun.until-2-.5)<1e-8);
 assert.equal(u.mana,80);
});
test('Kennen stun window expires and resets duration','Kennen',({a,u,v})=>{
 for(let i=0;i<3;i++)a.m44B26KennenMarkV453(u,v,'start_'+i);
 a.gameTime=6.1;
 for(let i=0;i<3;i++)a.m44B26KennenMarkV453(u,v,'after_'+i);
 const stun=a.effectResolverV41().list(v).find(e=>e.type==='stun');
 assert.ok(stun);assert.ok(Math.abs(stun.until-6.1-1.25)<1e-8);
});
test('Kennen third mark refunds are capped at maximum energy','Kennen',({a,u,v})=>{
 u.mana=195;
 for(let i=0;i<3;i++)a.m44B26KennenMarkV453(u,v,'cap_'+i);
 assert.equal(u.mana,200);
});
test('Kennen E restores 40 energy only once when damaging target','Kennen',({a,u,v,cast})=>{
 u.mana=200;const receipt=cast('E',{point:{x:.536,y:.5}});
 assert.ok(receipt.hits>0);assert.equal(u.mana,160);
 assert.equal(u.m44B28LightningRush.m44B29Finished,undefined);
});
test('Kennen E hits no targets, spends 80 without refund','Kennen',({a,u,v,cast})=>{
 v.x=.8;u.mana=200;
 const receipt=cast('E',{point:{x:.536,y:.5}});
 assert.equal(receipt.hits,0);assert.equal(u.mana,120);
});
test('Kennen E returns only one refund when hitting two enemies','Kennen',({a,u,v,foe,cast})=>{
 const second=a.units.find(x=>x.team===foe&&x.id!==v.id);
 Object.assign(second,{x:.528,y:.5,hp:1000,maxHp:1000});
 u.mana=200;const receipt=cast('E',{point:{x:.536,y:.5}});
 assert.ok(receipt.hits>=2);assert.equal(u.mana,160);
});
test('Kennen E manual exit grants 4s attack speed and speeds attack clock','Kennen',({a,u,cast,next})=>{
 const baseline=a.basicAttackIntervalV452c(u);
 cast('E',{point:{x:.536,y:.5}});next(.5);
 const r=cast('E');assert.ok(r.recast);
 assert.equal(u.m44B29KennenEAttackSpeed.percent,90);
 assert.ok(a.basicAttackIntervalV452c(u)<baseline);
 next(4.01);assert.ok(Math.abs(a.basicAttackIntervalV452c(u)-baseline)<1e-8);
});
test('Kennen E natural expiry provides AS once, not each scheduler tick','Kennen',({a,u,cast})=>{
 cast('E',{point:{x:.536,y:.5}});
 a.gameTime=2.01;a.advanceBoardTemporalV453Dev69();
 const until=u.m44B29KennenEAttackSpeed?.until;assert.ok(until>5.9);
 a.gameTime=2.5;a.advanceBoardTemporalV453Dev69();
 assert.equal(u.m44B29KennenEAttackSpeed.until,until);
});
test('Kennen E recast never refunds energy twice','Kennen',({a,u,cast,next})=>{
 cast('E',{point:{x:.536,y:.5}});const energy=u.mana;next(.5);
 cast('E');assert.equal(u.mana,energy);assert.equal(u.m44B28LightningRush.m44B29Finished,true);
});
test('Kennen E active combat uses updated rank five 240 base damage','Kennen',({a,u,v,cast})=>{
 const hp=v.hp;cast('E',{point:{x:.536,y:.5}});
 assert.ok(hp-v.hp>=230);
});
test('Katarina Q dagger lands opposite first target at 350 units','Katarina',({a,u,v,foe,cast})=>{
 const other=a.units.filter(x=>x.team===foe&&x.id!==v.id);
 Object.assign(other[0],{x:.54,y:.5,hp:1000,maxHp:1000});
 const r=cast('Q',{targetId:v.id});
 assert.equal(r.pending,true);assert.equal(r.hitIds.length,0);
 a.gameTime=.24;a.advanceBoardTemporalV453Dev69();
 const z=a.boardTemporalV453Dev69.find(x=>x.kind==='m44_b26_katarina_drop');
 assert.ok(z);
 const distance=a.mapDistance(v,z.point);
 assert.ok(Math.abs(distance-350)<1);
 assert.ok(z.point.x>v.x);
 assert.ok(Math.abs(z.nextAt-1.263)<.0001);
});
test('Katarina Q waits 1.02 seconds before placing dagger','Katarina',({a,u,v,cast})=>{
 const hp=v.hp;cast('Q',{targetId:v.id});
 assert.equal(v.hp,hp);
 a.gameTime=.24;a.advanceBoardTemporalV453Dev69();
 assert.ok(v.hp<hp);
 a.gameTime=1.25;a.advanceBoardTemporalV453Dev69();
 assert.equal(u.m44B26Daggers?.length||0,0);
 a.gameTime=1.28;a.advanceBoardTemporalV453Dev69();
 assert.equal(u.m44B26Daggers?.length,1);
});
test('Katarina Q bounce strikes three victims at full spell damage','Katarina',({a,u,v,foe,cast})=>{
 const others=a.units.filter(x=>x.team===foe&&x.id!==v.id).slice(0,2);
 for(let i=0;i<others.length;i++)Object.assign(others[i],{x:.525+(i+1)*.01,y:.5,hp:1000,maxHp:1000,armor:0,mr:0});
 const hp=[v.hp,...others.map(x=>x.hp)];const r=cast('Q',{targetId:v.id});
 assert.equal(r.pending,true);assert.equal(v.hp,hp[0]);
 for(const at of [.24,.39,.54]){a.gameTime=at;a.advanceBoardTemporalV453Dev69();}
 const deltas=[hp[0]-v.hp,...others.map((x,i)=>hp[i+1]-x.hp)];
 assert.ok(deltas.every(x=>x>0));
 assert.ok(Math.max(...deltas)-Math.min(...deltas)<=1);
});
test('Katarina dagger pickup E refund derives from rank/level','Katarina',({a,u})=>{
 u.m44B26Daggers=[{id:501,x:u.x,y:u.y,until:5,power:80}];u.skillCds.E=20;
 assert.equal(a.m44B26KatarinaPickupV453(u),1);
 assert.ok(Math.abs(u.skillCds.E-(20-8*.96))<1e-8);
});
test('Katarina cannot collect a dagger belonging to another realm','Katarina',({a,u})=>{
 u.m44B26Daggers=[{id:502,x:u.x,y:u.y,until:5,power:80,m44B28RealmId:'other-realm'}];
 assert.equal(a.m44B26KatarinaPickupV453(u),0);
 assert.equal(u.m44B26Daggers.length,1);
});
let passed=0,failures=[];
for(const side of ['blue','red'])for(const c of cases){
 try{const f=fixture(side,c.mine);c.fn(f);
  const snap=f.a.snapshotV40(),copy=Arena.fromSnapshotV40(map,mask,snap);
  assert.equal(checksumV40(snap),checksumV40(copy.snapshotV40()));
  passed++;
 }catch(error){failures.push({side,name:c.name,error:String(error?.stack||error)});}
}
for(const failure of failures)console.error('M44_B29_FAIL',JSON.stringify(failure));
console.log('M44_B29',JSON.stringify({cases:cases.length,seats:2,passed,failed:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
