/* M44 B27 — mirrored PvP passive contracts and deterministic snapshots. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),cases=[];
function fixture(side,mine,theirs='Annie'){
 const opp=side==='blue'?'red':'blue',a=new Arena(map,mask,{mode:'pvp',seed:27027,
  draft:{[side]:{MID:mine},[opp]:{MID:theirs}}});
 for(const z of a.units)Object.assign(z,{x:.07,y:.07,hp:20000,maxHp:20000,
  armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const z of a.minions)Object.assign(z,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;
 const u=a.units.find(z=>z.id===side+'_MID'),v=a.units.find(z=>z.id===opp+'_MID');
 for(const z of [u,v])Object.assign(z,{level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.525,y:.5});
 const cast=(slot,opts={})=>{
  const q=a.queueBoardSkillV453Dev69(u.team,u.id,slot,opts);
  assert.equal(q.ok,true,JSON.stringify(q));
  let receipt;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,cmd)=>{
   const r=original(actor,cmd);if(actor.id===u.id)receipt=r;return r;};
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original;}
  assert.equal(receipt?.ok,true,JSON.stringify(receipt));return receipt;
 };
 return {a,u,v,opp,cast};
}
const test=(name,mine,fn)=>cases.push({name,mine,fn});
test('Anivia lethal becomes egg, never immediate champion kill','Anivia',({a,u,v})=>{
 const d=u.deaths||0,k=v.kills||0;u.hp=100;a.damage(u,10000,v,'true','spell');
 assert.equal(u.m44B27Egg.active,true);assert.equal(u.deaths||0,d);
 assert.equal(v.kills||0,k);assert.ok(u.hp>0);
 assert.equal(a.effectResolverV41().canAct(u,'move').ok,false);
});
test('Anivia egg blocks queueing casts','Anivia',({a,u,v})=>{
 u.hp=100;a.damage(u,10000,v,'true','spell');
 const q=a.queueBoardSkillV453Dev69(u.team,u.id,'E',{targetId:v.id});
 assert.equal(q.ok,false);assert.equal(q.reason,'m44_b27_anivia_egg');
});
test('Anivia egg survives and returns at six game-time seconds','Anivia',({a,u,v})=>{
 u.hp=100;a.damage(u,10000,v,'true','spell');
 const revival=u.m44B27Egg.reviveHp;
 a.gameTime=5.99;a.advanceBoardTemporalV453Dev69();
 assert.equal(u.m44B27Egg.active,true);
 a.gameTime=6.01;a.advanceBoardTemporalV453Dev69();
 assert.equal(u.m44B27Egg.active,false);assert.equal(u.hp,revival);
 assert.equal(u.deaths||0,0);
});
test('Anivia executed egg dies once and does not revive','Anivia',({a,u,v})=>{
 u.hp=100;a.damage(u,10000,v,'true','spell');
 a.damage(u,u.hp+200,v,'true','spell');
 assert.equal(u.hp,0);assert.equal(u.deaths,1);assert.equal(u.m44B27Egg.active,false);
 a.gameTime=7;a.advanceBoardTemporalV453Dev69();
 assert.equal(u.hp,0);assert.equal(u.deaths,1);
});
test('Anivia egg cooldown prevents immediate second egg','Anivia',({a,u,v})=>{
 u.hp=100;a.damage(u,10000,v,'true','spell');
 a.gameTime=6.01;a.advanceBoardTemporalV453Dev69();
 a.damage(u,10000,v,'true','spell');
 assert.equal(u.hp,0);assert.equal(u.deaths,1);
});
test('Katarina takedown resets four cooldowns by fifteen seconds','Katarina',({a,u,v})=>{
 u.skillCds={Q:50,W:100,E:4,R:80};v.hp=5;
 a.damage(v,1000,u,'true','spell');
 assert.deepEqual(u.skillCds,{Q:35,W:85,E:0,R:65});
 assert.equal(u.kills,1);
});
test('Katarina assist resets cooldowns once','Katarina',({a,u,v})=>{
 const ally=a.units.find(z=>z.team===u.team&&z.id!==u.id);
 u.skillCds={Q:50,W:100,E:4,R:80};v.hp=50;
 a.damage(v,1,u,'true','spell');a.damage(v,1000,ally,'true','spell');
 assert.deepEqual(u.skillCds,{Q:35,W:85,E:0,R:65});
 assert.equal(u.assists,1);
});
test('Katarina absent from takedown receives no reset','Katarina',({a,u,v})=>{
 const ally=a.units.find(z=>z.team===u.team&&z.id!==u.id);
 u.skillCds={Q:50,W:100,E:4,R:80};v.hp=5;
 a.damage(v,1000,ally,'true','spell');
 assert.deepEqual(u.skillCds,{Q:50,W:100,E:4,R:80});
});
test('Katarina real minion last hit is not champion reset','Katarina',({a,u,opp})=>{
 a.nextWave=0;a.spawnWaves();const minion=a.minions.find(z=>z.team===opp);
 assert.ok(minion);u.skillCds={Q:50,W:100,E:4,R:80};minion.hp=5;
 a.damage(minion,1000,u,'true','spell');
 assert.deepEqual(u.skillCds,{Q:50,W:100,E:4,R:80});
});
test('Kennen fifth basic hit alone empowers and adds one Storm mark','Kennen',({a,u,v})=>{
 const hp=v.hp;for(let i=0;i<4;i++)a.attack(u,v,5,'attack');
 assert.equal(u.m44B27KennenBasicCount,4);
 assert.equal(v.m44KennenStorm?.[u.id],undefined);
 a.attack(u,v,5,'attack');
 assert.equal(u.m44B27KennenBasicCount,0);
 assert.equal(v.m44KennenStorm?.[u.id]?.stacks,1);
 assert.ok(hp-v.hp>25);
});
test('Kennen passive third mark stuns through shared processor','Kennen',({a,u,v})=>{
 v.m44KennenStorm={[u.id]:{stacks:2,until:6}};
 u.m44B27KennenBasicCount=4;a.attack(u,v,5,'attack');
 assert.equal(v.m44KennenStorm[u.id],undefined);
 assert.ok(a.effectResolverV41().has(v,'stun'));
});
test('Kennen R derived armor and MR without mutating base','Kennen',({a,u,cast})=>{
 const base=a.elementalStatsV452d3(u),armor=u.armor,mr=u.mr;cast('R');
 const current=a.elementalStatsV452d3(u);
 assert.equal(current.armor,base.armor+75);assert.equal(current.mr,base.mr+75);
 assert.equal(u.armor,armor);assert.equal(u.mr,mr);
 a.gameTime=3.1;
 assert.equal(a.elementalStatsV452d3(u).armor,base.armor);
 assert.equal(a.elementalStatsV452d3(u).mr,base.mr);
});
test('Kennen R derived resistance really mitigates physical damage','Kennen',({a,u,v,cast})=>{
 const prior=u.hp;cast('R');a.damage(u,200,v,'physical','spell');
 const protectedDamage=prior-u.hp;assert.ok(protectedDamage>0&&protectedDamage<200);
 a.gameTime=3.1;const hp=u.hp;a.damage(u,200,v,'physical','spell');
 assert.ok(hp-u.hp>protectedDamage);
});
test('Kennen W without rank has no passive charges','Kennen',({a,u,v})=>{
 u.skillRanks.W=0;for(let i=0;i<5;i++)a.attack(u,v,5,'attack');
 assert.equal(u.m44B27KennenBasicCount||0,0);
 assert.equal(v.m44KennenStorm?.[u.id],undefined);
});
let passed=0,failures=[];
for(const side of ['blue','red'])for(const c of cases){
 try{
  const z=fixture(side,c.mine);c.fn(z);
  const snap=z.a.snapshotV40(),copy=Arena.fromSnapshotV40(map,mask,snap);
  assert.equal(checksumV40(snap),checksumV40(copy.snapshotV40()));
  passed++;
 }catch(e){failures.push({side,name:c.name,error:String(e?.stack||e)});}
}
for(const f of failures)console.error('M44_B27_FAIL',JSON.stringify(f));
console.log('M44_B27',JSON.stringify({cases:cases.length,seats:2,passed,failed:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
