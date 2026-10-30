/** M22 second-stage skill primitives, both human PvP seats. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:20269343,mode:'pvp',draft:{
   [team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:2500,maxHp:2500,
  autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID'),
  e2=a.units.find(v=>v.id===other+'_TOP'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:1800,maxHp:2500,level:16,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:6500,maxHp:6500,armor:0,mr:0});
 Object.assign(e2,{x:.517,y:.5,hp:6500,maxHp:6500,armor:0,mr:0});
 Object.assign(ally,{x:.510,y:.5,hp:2000,maxHp:2500});
 a.canSeePoint=()=>true;a.visible=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,opts={})=>{
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(queued.ok,true,champ+slot+' queue '+JSON.stringify(queued));
  let result=null;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,q)=>(result=original(v,q));
  a.resolveBoardSkillsV453Dev69();a.executeBoardSkillV453Dev69=original;
  assert.equal(result?.ok,true,champ+slot+' execute '+JSON.stringify(result));
  return {queued,result};
 };
 return {a,u,e,e2,ally,team,cast};
}
function snap(a){const state=a.snapshotV40();
 assert.equal(checksumV40(state),checksumV40(Arena.fromSnapshotV40(map,mask,state).snapshotV40()));}
let cases=0;const names=[];const check=(name,fn)=>{fn();cases++;names.push(name);};
for(const team of ['blue','red']){
 check(team+' Lee Sin W2 vamp from real basic hits',()=>{
  const {a,u,e,ally,cast}=fixture('LeeSin',team);
  cast('W',{targetId:ally.id});
  const mana=u.mana,cd=u.skillCds.W;
  a.gameTime=1;
  const second=cast('W');
  assert.equal(second.queued.recast,true);assert.equal(second.result.spentMana,0);
  assert.equal(u.mana,mana);assert.equal(u.skillCds.W,cd);
  const before=u.hp;a.damage(e,150,u,'physical','basic');
  assert.ok(u.hp>before,'Lee Sin W2 did not heal on a landed attack');
  snap(a);
 });
 check(team+' Lee Sin W2 expires and no passive healing afterwards',()=>{
  const {a,u,e,ally,cast}=fixture('LeeSin',team);
  cast('W',{targetId:ally.id});
  a.gameTime=1;cast('W');
  a.gameTime=6;const before=u.hp;
  a.damage(e,130,u,'physical','basic');
  assert.equal(u.hp,before,'W2 vamp continued after expiration');
  snap(a);
 });
 check(team+' Lee Sin E2 slows only champions previously hit',()=>{
  const {a,u,e,e2,cast}=fixture('LeeSin',team);
  cast('E');
  assert.ok(u.m22SecondaryV453.E.targetIds.includes(e.id));
  assert.ok(u.m22SecondaryV453.E.targetIds.includes(e2.id));
  assert.equal(a.effectResolverV41().has(e,'slow'),false);
  a.gameTime=1;cast('E');
  assert.equal(a.effectResolverV41().has(e,'slow'),true);
  assert.equal(a.effectResolverV41().has(e2,'slow'),true);
  assert.equal(u.m22SecondaryV453.E,null);
  snap(a);
 });
 check(team+' Lee Sin E2 respects fog and does not reveal victims',()=>{
  const {a,u,e,e2,cast}=fixture('LeeSin',team);
  cast('E');
  a.visible=(side,v)=>v.id!==e2.id;
  a.gameTime=1;cast('E');
  assert.equal(a.effectResolverV41().has(e,'slow'),true);
  assert.equal(a.effectResolverV41().has(e2,'slow'),false);
  snap(a);
 });
 check(team+' Zac Q second grab moves both enemy targets with stun',()=>{
  const {a,u,e,e2,cast}=fixture('Zac',team);
  cast('Q',{targetId:e.id});
  assert.equal(u.m22SecondaryV453.Q?.firstId,e.id);
  const before=[e.x,e2.x],mana=u.mana,cd=u.skillCds.Q;
  a.gameTime=1;const second=cast('Q',{targetId:e2.id});
  assert.equal(second.queued.recast,true);assert.equal(second.result.spentMana,0);
  assert.equal(u.mana,mana);assert.equal(u.skillCds.Q,cd);
  assert.notDeepEqual([e.x,e2.x],before);
  assert.equal(e.x,e2.x);
  assert.ok(a.effectResolverV41().has(e,'stun'));
  assert.ok(a.effectResolverV41().has(e2,'stun'));
  snap(a);
 });
 check(team+' Zac Q2 rejects reusing first victim and cannot see through fog',()=>{
  const {a,u,e,e2,team:seat,cast}=fixture('Zac',team);
  cast('Q',{targetId:e.id});
  a.gameTime=1;const mana=u.mana,cd=u.skillCds.Q;
  const same=a.queueBoardSkillV453Dev69(seat,u.id,'Q',{targetId:e.id});
  assert.equal(same.ok,false);assert.equal(same.reason,'segundo_alvo_invalido');
  a.visible=(side,v)=>v.id!==e2.id;
  const hidden=a.queueBoardSkillV453Dev69(seat,u.id,'Q',{targetId:e2.id});
  assert.equal(hidden.ok,false);
  assert.equal(u.mana,mana);assert.equal(u.skillCds.Q,cd);
  snap(a);
 });
 check(team+' Zac Q2 checks collision, does not teleport through terrain',()=>{
  const {a,u,e,e2,team:seat,cast}=fixture('Zac',team);
  cast('Q',{targetId:e.id});
  a.gameTime=1;const initial=[e.x,e2.x],mana=u.mana;
  const queued=a.queueBoardSkillV453Dev69(seat,u.id,'Q',{targetId:e2.id});
  assert.equal(queued.ok,true);
  a.obstacleLine=()=>true;
  const out=a.executeBoardSkillV453Dev69(u,u.pendingBoardV453Dev69);
  u.pendingBoardV453Dev69=null;
  assert.equal(out.ok,false);assert.equal(out.reason,'colisor_grab');
  assert.deepEqual([e.x,e2.x],initial);assert.equal(u.mana,mana);
  snap(a);
 });
}
assert.equal(cases,14);
console.log('M22_B01_SECOND_STAGE_QA '+JSON.stringify({
 cases,teamSeats:2,championFamilies:['LeeSin','Zac'],names,certifiedChampions:0}));
