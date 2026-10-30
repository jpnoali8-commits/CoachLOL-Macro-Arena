/* M44 B32A — Talon E terrain traversal + Twitch R penetrating attacks, mirrored PvP. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,m44B14DOriginalBoardRuleV453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
function fixture(team,champ){
 const foe=team==='blue'?'red':'blue',a=new Arena(map,mask,{mode:'pvp',seed:32123,
  draft:{[team]:{MID:champ},[foe]:{MID:'Annie'}}});
 for(const u of a.units)Object.assign(u,{x:.07,y:.07,hp:20000,maxHp:20000,
  armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false,
  level:16,mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 for(const u of a.minions)Object.assign(u,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;
 const u=a.units.find(x=>x.id===team+'_MID'),v=a.units.find(x=>x.id===foe+'_MID');
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.545,y:.5});
 function cast(slot,options={}){
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,options);
  assert.equal(queued.ok,true,JSON.stringify(queued));
  const original=a.executeBoardSkillV453Dev69.bind(a);let receipt;
  a.executeBoardSkillV453Dev69=(actor,q)=>{const r=original(actor,q);
   if(actor.id===u.id)receipt=r;return r;};
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original;}
  assert.equal(receipt?.ok,true,JSON.stringify(receipt));
  return receipt;
 }
 return {a,u,v,foe,cast};
}
let scenarios=0;
for(const team of ['blue','red']){
 const run=(name,fn)=>{try{fn();scenarios++;}catch(e){
  throw Error(team+' '+name+': '+String(e.stack||e));}};
 run('original authorial registry',()=>{
  assert.equal(m44B14DOriginalBoardRuleV453('Talon','E').m44B32AId,'Talon.E');
  assert.equal(m44B14DOriginalBoardRuleV453('Twitch','R').m44B32AId,'Twitch.R');
 });
 run('Talon legal crossing and wall timer',()=>{
  const {a,u,cast}=fixture(team,'Talon');
  a.walkable=x=>x<.513||x>.518;a.obstacleLine=()=>true;
  assert.equal(cast('E',{point:{x:.54,y:.5}}).assassinsPath,true);
  assert.equal(u.x,.54);assert.equal(u.m44B32ATalonWalls[0].until,60);
 });
 run('Talon wall requirement before debit',()=>{
  const {a,u}=fixture(team,'Talon');a.walkable=()=>true;a.obstacleLine=()=>false;
  const mana=u.mana;
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'E',{point:{x:.54,y:.5}}).ok,false);
  assert.equal(u.mana,mana);
 });
 run('Talon rejects multiple barriers',()=>{
  const {a,u}=fixture(team,'Talon');
  a.walkable=x=>!(x>.512&&x<.517||x>.525&&x<.53);a.obstacleLine=()=>true;
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'E',{point:{x:.54,y:.5}}).ok,false);
 });
 run('Talon same-wall cooldown cannot be bypassed',()=>{
  const {a,u,cast}=fixture(team,'Talon');
  a.walkable=x=>x<.513||x>.518;a.obstacleLine=()=>true;
  cast('E',{point:{x:.54,y:.5}});a.round++;a.actionLocksV40={};u.x=.5;
  const mana=u.mana;
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'E',{point:{x:.54,y:.5}}).ok,false);
  assert.equal(u.mana,mana);
 });
 run('Talon commit-time invalidation',()=>{
  const {a,u}=fixture(team,'Talon');
  a.walkable=x=>x<.513||x>.518;a.obstacleLine=()=>true;
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'E',{point:{x:.54,y:.5}}).ok,true);
  a.walkable=()=>true;a.obstacleLine=()=>false;
  const mana=u.mana;
  let receipt;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,q)=>(receipt=original(actor,q));
  a.resolveBoardSkillsV453Dev69();
  assert.equal(receipt.ok,false);assert.equal(u.x,.5);assert.equal(u.mana,mana);
 });
 run('Twitch timed bonus range',()=>{
  const {a,u,cast}=fixture(team,'Twitch');
  const range=a.itemAttackRangeV453Dev38(u);
  assert.equal(cast('R').sprayAndPray,true);
  assert.ok(Math.abs(a.itemAttackRangeV453Dev38(u)-range-300/a.worldWidth)<1e-8);
  a.gameTime=6.1;assert.equal(a.itemAttackRangeV453Dev38(u),range);
 });
 run('Twitch line hit but not off-axis',()=>{
  const {a,u,v,foe,cast}=fixture(team,'Twitch');cast('R');
  const [aligned,off]=a.units.filter(x=>x.team===foe&&x.id!==v.id);
  Object.assign(aligned,{x:.56,y:.5,hp:20000});
  Object.assign(off,{x:.56,y:.54,hp:20000});
  const hp=v.hp;a.attack(u,v,100);
  assert.ok(v.hp<hp);assert.ok(aligned.hp<20000);assert.equal(off.hp,20000);
 });
 run('Twitch no piercing after timer',()=>{
  const {a,u,v,foe,cast}=fixture(team,'Twitch');
  cast('R');a.gameTime=7;
  const aligned=a.units.find(x=>x.team===foe&&x.id!==v.id);
  Object.assign(aligned,{x:.56,y:.5,hp:20000});
  a.attack(u,v,100);assert.equal(aligned.hp,20000);
 });
 run('Twitch V40 snapshot continuity',()=>{
  const {a,u,cast}=fixture(team,'Twitch');cast('R');
  const sn=a.snapshotV40(),re=Arena.fromSnapshotV40(map,mask,sn);
  assert.equal(checksumV40(sn),checksumV40(re.snapshotV40()));
  assert.equal(re.units.find(x=>x.id===u.id).m44B32ATwitchSpray.until,6);
 });
}
console.log('M44_B32A_PASS '+scenarios+'/'+scenarios);
