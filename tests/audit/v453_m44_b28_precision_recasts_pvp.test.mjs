/* M44 B28: source-owned recasts and dagger decisions in PvP (both seats). */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),cases=[];
function fixture(side,mine,theirs='Annie'){
 const opp=side==='blue'?'red':'blue';
 const a=new Arena(map,mask,{mode:'pvp',seed:28028,draft:{[side]:{MID:mine},[opp]:{MID:theirs}}});
 for(const z of a.units)Object.assign(z,{x:.07,y:.07,hp:20000,maxHp:20000,
  armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const z of a.minions)Object.assign(z,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;
 const u=a.units.find(z=>z.id===side+'_MID'),v=a.units.find(z=>z.id===opp+'_MID');
 for(const z of [u,v])Object.assign(z,{level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.525,y:.5});
 const cast=(slot,options={})=>{
  const queued=a.queueBoardSkillV453Dev69(u.team,u.id,slot,options);
  assert.equal(queued.ok,true,JSON.stringify(queued));
  let receipt;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,cmd)=>{
   const result=original(actor,cmd);if(actor.id===u.id)receipt=result;return result;
  };
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original;}
  assert.equal(receipt?.ok,true,JSON.stringify(receipt));
  return receipt;
 };
 const turn=(seconds=.5)=>{a.gameTime+=seconds;a.round++;a.actionLocksV40={};};
 return {a,u,v,cast,turn};
}
const test=(name,mine,fn)=>cases.push({name,mine,fn});
const dagger=(u,id=777,x=.54,y=.5,until=5)=>{u.m44B26Daggers=[
 {id,x,y,until,power:100,m44B28RealmId:u.realmIdV453Dev69||null}]};
test('Anivia Q has no immediate impact and flight state is serializable','Anivia',({a,u,v,cast})=>{
 const hp=v.hp,r=cast('Q',{point:{x:.61,y:.5}});
 assert.equal(r.flashFrost,true);assert.equal(v.hp,hp);
 const z=a.boardTemporalV453Dev69.find(z=>z.id===r.projectileId);
 assert.ok(z);assert.equal(z.m44B28Detonating,false);
});
test('Anivia Q early recast is rejected before the windup','Anivia',({a,u,cast})=>{
 cast('Q',{point:{x:.61,y:.5}});
 const mana=u.mana,cd=u.skillCds.Q;
 const q=a.queueBoardSkillV453Dev69(u.team,u.id,'Q');
 assert.equal(q.ok,false);assert.equal(q.reason,'m44_b28_frost_windup');
 assert.equal(u.mana,mana);assert.equal(u.skillCds.Q,cd);
});
test('Anivia Q recast interpolates in-flight position without second debit','Anivia',({a,u,cast,turn})=>{
 const mana=u.mana,first=cast('Q',{point:{x:.61,y:.5}});
 const after=u.mana,cd=u.skillCds.Q;assert.ok(after<mana);
 turn(.25);const r=cast('Q');
 assert.equal(r.recast,true);assert.equal(r.spentMana,0);
 assert.ok(Math.abs(r.detonationPoint.x-(.5+237.5/a.worldWidth))<.00001);
 assert.equal(u.mana,after);assert.equal(u.skillCds.Q,cd);
 assert.equal(r.projectileId,first.projectileId);
});
test('Anivia Q recast only one detonation, no second queue','Anivia',({a,u,cast,turn})=>{
 cast('Q',{point:{x:.61,y:.5}});turn(.25);cast('Q');
 const q=a.queueBoardSkillV453Dev69(u.team,u.id,'Q');
 assert.equal(q.ok,false);
 a.advanceBoardTemporalV453Dev69();
 assert.equal(a.boardTemporalV453Dev69.some(x=>x.kind==='m44_b26_anivia_frost'&&x.ownerId===u.id),false);
});
test('Anivia Q recast loses authorization when hard controlled','Anivia',({a,u,v,cast,turn})=>{
 cast('Q',{point:{x:.61,y:.5}});turn(.25);
 a.applyEffectV41(u,'stun',{source:v,duration:2,key:'b28_stun'});
 const q=a.queueBoardSkillV453Dev69(u.team,u.id,'Q');
 assert.equal(q.ok,false);assert.equal(q.reason,'m44_b28_frost_incapacitated');
});
test('Anivia Q recast hits a nearby target at detonation point','Anivia',({a,u,v,cast,turn})=>{
 v.x=.517;const hp=v.hp;
 cast('Q',{point:{x:.61,y:.5}});turn(.25);cast('Q');
 a.advanceBoardTemporalV453Dev69();
 assert.ok(v.hp<hp);assert.ok(a.effectResolverV41().has(v,'stun'));
});
test('Katarina E targets exact owned grounded dagger ID','Katarina',({a,u,v,cast})=>{
 dagger(u);v.x=.54;v.y=.5;
 const r=cast('E',{targetId:'dagger_777'});
 assert.equal(r.daggerShunpo,true);assert.ok(u.x>.53);
 assert.equal(u.m44B26Daggers.length,0);
 assert.ok(r.daggersCollected>0);assert.equal(r.targetId,v.id);
});
test('Katarina E can select the nearest legitimate dagger by point','Katarina',({a,u,cast})=>{
 dagger(u,100,.54,.5);u.m44B26Daggers.push({id:101,x:.56,y:.5,until:5,power:10});
 const r=cast('E',{point:{x:.541,y:.5}});
 assert.equal(r.daggerShunpo,true);assert.ok(Math.abs(u.x-.54)<.00001);
 assert.equal(u.m44B26Daggers.some(d=>d.id===101),true);
});
test('Katarina E rejects a fabricated dagger ID without debit','Katarina',({a,u})=>{
 const mana=u.mana,cd=u.skillCds.E;
 const q=a.queueBoardSkillV453Dev69(u.team,u.id,'E',{targetId:'dagger_999999'});
 assert.equal(q.ok,false);assert.equal(q.reason,'m44_b28_dagger_target_invalid');
 assert.equal(u.mana,mana);assert.equal(u.skillCds.E,cd);
});
test('Katarina E rejects expired dagger before queue','Katarina',({a,u})=>{
 dagger(u,777,.54,.5,-1);
 const q=a.queueBoardSkillV453Dev69(u.team,u.id,'E',{targetId:'dagger_777'});
 assert.equal(q.ok,false);
 assert.equal(q.reason,'m44_b28_dagger_target_invalid');
});
test('Katarina E validates dagger expiry again before spending','Katarina',({a,u})=>{
 dagger(u);const q=a.queueBoardSkillV453Dev69(u.team,u.id,'E',{targetId:'dagger_777'});
 assert.equal(q.ok,true);const mana=u.mana,cd=u.skillCds.E;
 u.m44B26Daggers[0].until=-1;
 const r=a.executeBoardSkillV453Dev69(u,u.pendingBoardV453Dev69);
 assert.equal(r.ok,false);assert.equal(r.reason,'m44_b28_dagger_lost_before_commit');
 assert.equal(u.mana,mana);assert.equal(u.skillCds.E,cd);
});
test('Katarina E cannot use an unreachable dagger','Katarina',({a,u})=>{
 dagger(u,777,.9,.9);
 const q=a.queueBoardSkillV453Dev69(u.team,u.id,'E',{targetId:'dagger_777'});
 assert.equal(q.ok,false);
});
test('Kennen E blocks basic attacks for its active duration','Kennen',({a,u,v,cast})=>{
 cast('E',{point:{x:.536,y:.5}});
 assert.equal(a.effectResolverV41().canAct(u,'attack').ok,false);
 const hp=v.hp,stack=u.m44B27KennenBasicCount||0;
 a.attack(u,v,100,'attack');
 assert.equal(v.hp,hp);assert.equal(u.m44B27KennenBasicCount||0,stack);
});
test('Kennen E early recast is not accepted','Kennen',({a,u,cast})=>{
 cast('E',{point:{x:.536,y:.5}});
 const q=a.queueBoardSkillV453Dev69(u.team,u.id,'E');
 assert.equal(q.ok,false);assert.equal(q.reason,'m44_b28_kennen_e_recast_wait');
});
test('Kennen E recast ends active form, no second cost','Kennen',({a,u,cast,turn})=>{
 cast('E',{point:{x:.536,y:.5}});
 const mana=u.mana,cd=u.skillCds.E;
 turn(.5);const r=cast('E');
 assert.equal(r.recast,true);assert.equal(r.spentMana,0);
 assert.equal(a.effectResolverV41().canAct(u,'attack').ok,true);
 assert.equal(u.mana,mana);assert.equal(u.skillCds.E,cd);
});
test('Kennen E attack restriction expires in game time','Kennen',({a,u,cast})=>{
 cast('E',{point:{x:.536,y:.5}});
 a.gameTime=2.01;
 assert.equal(a.effectResolverV41().canAct(u,'attack').ok,true);
});
let passed=0,failures=[];
for(const side of ['blue','red'])for(const scenario of cases){
 try{
  const state=fixture(side,scenario.mine);
  scenario.fn(state);
  const snap=state.a.snapshotV40();
  const restored=Arena.fromSnapshotV40(map,mask,snap);
  assert.equal(checksumV40(snap),checksumV40(restored.snapshotV40()));
  passed++;
 }catch(error){failures.push({side,name:scenario.name,error:String(error?.stack||error)});}
}
for(const fail of failures)console.error('M44_B28_FAIL',JSON.stringify(fail));
console.log('M44_B28',JSON.stringify({cases:cases.length,seats:2,passed,failed:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
