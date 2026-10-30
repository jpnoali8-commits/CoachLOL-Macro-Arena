/* M44 B17 shared-source integration: Sylas steals original R, Viego borrows QWE. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,m44B14DOriginalBoardRuleV453,m44B14CSylasUltimateRuleV453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const ultimates=['Kindred','Poppy','Rakan','Hwei'],possession=['Kindred','Poppy','Volibear','Malzahar'];
let passed=0,snapshots=0;const failures=[];
function make(side,mine,source){
 const other=side==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:1719,mode:'pvp',draft:{
  [side]:{MID:mine,TOP:'Annie'},[other]:{MID:source,TOP:'Garen'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:20000,maxHp:20000,
  armor:0,mr:0,autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 for(const v of a.minions)Object.assign(v,{x:.08,y:.08});
 const u=a.units.find(v=>v.id===side+'_MID'),
  donor=a.units.find(v=>v.id===other+'_MID'),
  enemy=a.units.find(v=>v.id===other+'_TOP');
 Object.assign(u,{x:.5,y:.5,mana:10000,maxMana:10000,level:16,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(donor,{x:.52,y:.5,hp:20000,maxHp:20000});
 Object.assign(enemy,{x:.53,y:.5,hp:20000});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,args={})=>{
  const queue=a.queueBoardSkillV453Dev69(side,u.id,slot,args);
  assert.equal(queue.ok,true,JSON.stringify(queue));
  let receipt;const orig=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,q)=>{
   const value=orig(actor,q);if(actor.id===u.id)receipt=value;return value;
  };
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=orig}
  assert.equal(receipt?.ok,true,JSON.stringify(receipt));
  return receipt;
 };
 const check=()=>{const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  snapshots++;
 };
 return {a,u,donor,enemy,other,side,cast,check};
}
for(const side of ['blue','red']){
 for(const name of ultimates){
  try{
   const f=make(side,'Sylas',name),{a,u,donor,cast,check}=f;
   const rule=m44B14CSylasUltimateRuleV453(name);
   assert.equal(rule,m44B14DOriginalBoardRuleV453(name,'R'));
   assert.ok(rule?.m44B17BId||rule?.m44B17AId);
   assert.equal(a.queueSylasHijackV453M14(side,u.id,donor.id).ok,true);
   a.resolveSylasHijacksV453M14();
   assert.equal(u.sylasStolenV453M14?.sourceChamp,name);
   const args=rule.shape==='self'?{}:
    ['circle_enemy','line_enemy','cone_enemy','move_point'].includes(rule.shape)?
    {point:{x:donor.x,y:donor.y}}:{targetId:donor.id};
   const out=cast('R',args);
   assert.equal(out.hijacked,true);
   assert.equal(out.spentMana,0);
   assert.equal(u.champ,'Sylas');
   assert.equal(u.sylasStolenV453M14,null);
   assert.equal(u.id,side+'_MID');assert.equal(u.team,side);
   check();passed++;
  }catch(e){failures.push({side,name,kind:'Sylas R',error:String(e?.stack||e)})}
 }
 for(const name of possession)for(const slot of ['Q','W','E']){
  try{
   const f=make(side,'Viego',name),{a,u,donor,enemy,cast,check}=f;
   donor.hp=100;
   a.damage(donor,500,u,'true','spell');
   const soul=u.m44B14CSouls?.[0];assert.ok(soul);
   assert.equal(a.queueViegoPossessV453M44B14C(side,u.id,soul.id).ok,true);
   a.resolveBoardSkillsV453Dev69();
   assert.equal(u.champ,name);
   assert.equal(u.id,side+'_MID');assert.equal(u.team,side);
   const rule=m44B14DOriginalBoardRuleV453(name,slot,u);
   assert.equal(a.boardKitForV453Dev69(name,slot,u),rule);
   if(name==='Kindred'||name==='Poppy'||name==='Volibear')
    assert.ok(rule?.m44B17BId||rule?.m44B17AId);
   if(name==='Malzahar'&&slot==='W')assert.equal(rule?.m44B17AId,'Malzahar.W');
   assert.equal(a.boardKitForV453Dev69(name,'R',u),
    m44B14DOriginalBoardRuleV453('Viego','R'));
   const args=rule.shape==='target_enemy'?{targetId:enemy.id}:
    rule.shape==='target_ally'?{targetId:u.id}:
    rule.shape==='self'?{}:{point:{x:enemy.x,y:enemy.y}};
   if(name==='Poppy'&&slot==='E')u.x=.516;
   if(name==='Volibear'&&['Q','W'].includes(slot))u.x=.516;
   if(name==='Kindred'&&slot==='E')u.x=.516;
   const result=cast(slot,args);
   assert.equal(result.ok,true);
   assert.equal(u.id,side+'_MID');assert.equal(u.team,side);
   assert.equal(u.champ,name,'possessed appearance stable');
   check();passed++;
  }catch(e){failures.push({side,name,slot,kind:'Viego copy',error:String(e?.stack||e)})}
 }
}
for(const f of failures)console.error('M44_B17_COPY_FAIL',JSON.stringify(f));
console.log('M44_B17_COPY '+JSON.stringify({sylasR:ultimates.length,
 viegoSources:possession.length,slotsPerSource:3,seats:2,
 passed,snapshots,failures:failures.length,certifiedFullKits:0}));
assert.equal(failures.length,0);assert.equal(passed,32);
