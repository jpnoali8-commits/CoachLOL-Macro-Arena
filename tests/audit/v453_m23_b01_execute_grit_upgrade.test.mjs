/** M23 B01 execution, grit and empowered next-cast PvP QA. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:20269352,mode:'pvp',draft:{
  [team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.07,y:.07,hp:3000,maxHp:3000,
  autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID'),e2=a.units.find(v=>v.id===other+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:2200,maxHp:2200,level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:5500,maxHp:5500,armor:0,mr:0});
 Object.assign(e2,{x:.516,y:.5,hp:5500,maxHp:5500,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 function cast(slot,opts={}){
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(queued.ok,true,champ+slot+' queue '+JSON.stringify(queued));
  const execute=a.executeBoardSkillV453Dev69.bind(a);let result;
  a.executeBoardSkillV453Dev69=(who,q)=>(result=execute(who,q));
  a.resolveBoardSkillsV453Dev69();a.executeBoardSkillV453Dev69=execute;
  assert.equal(result?.ok,true,champ+slot+' result '+JSON.stringify(result));
  return {queued,result};
 }
 return {a,u,e,e2,team,cast};
}
function snap(a){
 const s=a.snapshotV40();
 assert.equal(checksumV40(s),checksumV40(Arena.fromSnapshotV40(map,mask,s).snapshotV40()));
}
const point={x:.53,y:.5};let cases=0;const names=[];
function check(name,fn){fn();cases++;names.push(name);}
for(const team of ['blue','red']){
 check(team+' Urgot R marks without immediate execute or extra cost',()=>{
  const {a,u,e,team:seat,cast}=fixture('Urgot',team);
  cast('R',{point});
  assert.equal(u.m23ExecuteMarkV453?.targetId,e.id);
  assert.ok(e.hp>e.maxHp*.25);
  const cost=u.mana,cd=u.skillCds.R;
  a.gameTime=1;
  const denied=a.queueBoardSkillV453Dev69(seat,u.id,'R',{targetId:e.id});
  assert.equal(denied.ok,false);
  assert.equal(denied.reason,'limiar_execucao');
  assert.equal(u.mana,cost);assert.equal(u.skillCds.R,cd);
  snap(a);
 });
 check(team+' Urgot R recast executes below 25pct and fears nearby enemies',()=>{
  const {a,u,e,e2,cast}=fixture('Urgot',team);
  cast('R',{point});e.hp=e.maxHp*.24;
  const cost=u.mana,cd=u.skillCds.R;
  a.gameTime=1;
  const second=cast('R',{targetId:e.id});
  assert.equal(second.queued.recast,true);
  assert.equal(second.result.spentMana,0);
  assert.equal(u.mana,cost);assert.equal(u.skillCds.R,cd);
  assert.ok(e.hp>0,'Urgot must suppress before finishing the chain');
  assert.ok(a.effectResolverV41().has(e,'suppression'));
  assert.equal(second.result.channel,true);
  a.gameTime=2.1;a.advanceBoardPassivesV453Dev69();
  assert.equal(e.hp,0);assert.equal(e.deaths,1);assert.equal(u.kills,1);
  assert.equal(a.effectResolverV41().has(e2,'fear'),true);
  assert.equal(u.m23ExecuteMarkV453,null);
  snap(a);
 });
 check(team+' Urgot R auto execute once at end of duration',()=>{
  const {a,u,e,cast}=fixture('Urgot',team);
  cast('R',{point});e.hp=e.maxHp*.24;
  a.gameTime=4.1;a.advanceBoardPassivesV453Dev69();
  assert.ok(e.hp>0,'automatic Urgot R must respect suppressible reel');
  a.gameTime=5.2;a.advanceBoardPassivesV453Dev69();
  assert.equal(e.hp,0);assert.equal(u.kills,1);
  a.advanceBoardPassivesV453Dev69();
  assert.equal(u.kills,1);
  snap(a);
 });
 check(team+' Urgot R does not execute protected targets or hidden recast',()=>{
  const {a,u,e,team:seat,cast}=fixture('Urgot',team);
  cast('R',{point});e.hp=e.maxHp*.24;
  a.gameTime=1;a.visible=()=>false;
  const blocked=a.queueBoardSkillV453Dev69(seat,u.id,'R',{targetId:e.id});
  assert.equal(blocked.ok,false);assert.equal(blocked.reason,'execucao_sem_alvo');
  a.visible=()=>true;
  assert.equal(a.applyEffectV41(e,'invulnerable',{source:e,duration:3}).ok,true);
  const second=cast('R',{targetId:e.id});
  assert.equal(second.result.executed,false,'channel cannot execute immediately');
  a.gameTime=2.1;a.advanceBoardPassivesV453Dev69();
  assert.ok(e.hp>0);assert.equal(u.kills,0);
  snap(a);
 });
 check(team+' Sett stacks post-mitigation Grit and consumes on W',()=>{
  const {a,u,e,cast}=fixture('Sett',team);
  a.damage(u,180,e,'physical','basic');
  assert.ok(u.m23GritV453?.value>0);
  const grit=u.m23GritV453.value,before=e.hp;
  a.gameTime=1;cast('W',{point});
  assert.equal(e.hp,before,'M40 Haymaker must honor its 0.75s cast time');
  a.gameTime=2;a.advanceBoardPassivesV453Dev69();
  assert.ok(e.hp<before,'Haymaker delayed damage missing');
  assert.equal(u.m23GritV453.value,0);
  assert.ok(a.effectResolverV41().list(u).some(z=>z.type==='shield'&&z.power>=grit),
   'Haymaker Grit shield missing');
  snap(a);
 });
 check(team+' Sett Grit decays only after four seconds without new damage',()=>{
  const {a,u,e}=fixture('Sett',team);
  a.damage(u,160,e,'physical','basic');
  const original=u.m23GritV453.value;
  a.gameTime=4.1;a.advanceBoardPassivesV453Dev69();
  assert.equal(u.m23GritV453.value,original);
  a.gameTime=5.1;a.advanceBoardPassivesV453Dev69();
  assert.ok(u.m23GritV453.value<original);
  snap(a);
 });
 check(team+' Heimer R Q upgraded turret persists and attacks',()=>{
  const {a,u,e,cast}=fixture('Heimerdinger',team);
  cast('R');
  assert.ok(u.m23HeimerEmpowerV453?.until>a.gameTime);
  a.gameTime=1;cast('Q',{point:{x:.51,y:.5}});
  assert.equal(u.m23HeimerEmpowerV453,null);
  const upgraded=a.boardSummonsV453Dev69.find(v=>v.kind==='heimer_turret_upgraded');
  assert.ok(upgraded?.hp>300);
  const hp=e.hp;
  a.gameTime=2;a.advanceBoardSummonsV453Dev69();
  assert.ok(e.hp<hp,'upgraded turret failed to attack');
  snap(a);
 });
 check(team+' Heimer R W consumes empowerment exactly once',()=>{
  const {a,u,e,cast}=fixture('Heimerdinger',team);
  cast('R');a.gameTime=1;const original=e.hp;
  cast('W',{point});
  const empowered=original-e.hp;assert.ok(empowered>0);
  assert.equal(u.m23HeimerEmpowerV453,null);
  const basic=fixture('Heimerdinger',team);
  basic.a.gameTime=1;basic.cast('W',{point});
  assert.ok(empowered>(basic.e.maxHp-basic.e.hp)*1.2);
  snap(a);
 });
}
assert.equal(cases,16);
console.log('M23_B01_EXECUTE_GRIT_UPGRADE_QA '+JSON.stringify({
 cases,teamSeats:2,families:['Urgot','Sett','Heimerdinger'],names,certifiedChampions:0}));
