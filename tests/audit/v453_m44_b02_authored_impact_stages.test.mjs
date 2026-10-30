/**
 * M44 B02 authored impact stages. Red/blue seats; full engine gate for
 * Sejuani R / Milio Q / Lucian W. NEVER a kit certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const failures=[];let scenarios=0,snapshots=0;
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:440244,mode:'pvp',
  draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:6000,
  maxHp:6000,autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 for(const m of a.minions||[])Object.assign(m,{x:.08,y:.08});
 const u=a.units.find(v=>v.id===team+'_MID');
 const e=a.units.find(v=>v.id===other+'_MID');
 const e2=a.units.find(v=>v.id===other+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,level:16,mana:10000,maxMana:10000,
  hp:5000,maxHp:5000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.527,y:.5,hp:10000,maxHp:10000,armor:0,mr:0});
 Object.assign(e2,{x:.545,y:.5,hp:10000,maxHp:10000,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;
 a.walkable=()=>true;a.obstacleLine=()=>false;
 const slot=champ==='Sejuani'?'R':champ==='Lucian'?'W':'Q';
 const cast=()=>{
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,{point:{x:.56,y:.5}});
  assert.equal(q.ok,true,'queue '+JSON.stringify(q));
  let receipt;const old=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,order)=>(receipt=old(v,order));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=old}
  assert.equal(receipt?.ok,true,'commit '+JSON.stringify(receipt));
  assert.equal(receipt?.m44Projectile,true);
  return receipt;
 };
 const tick=()=>{
  a.gameTime++;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69();
 };
 const snap=()=>{
  const v=a.snapshotV40();
  assert.equal(checksumV40(v),
   checksumV40(Arena.fromSnapshotV40(map,mask,v).snapshotV40()));
  snapshots++;
 };
 return {a,u,e,e2,cast,tick,snap,other,team};
}
function run(champ,team,label,fn){
 try{fn(fixture(champ,team));scenarios++}
 catch(error){failures.push({champ,team,label,error:String(error?.stack||error)})}
}
for(const team of ['blue','red']){
 run('Sejuani',team,'first champion, prison and delayed storm',f=>{
  const {a,u,e,e2,cast,tick,snap}=f,primary=e.hp,secondary=e2.hp;
  cast();
  assert.equal(e.hp,primary,'no premature Sejuani R');
  tick();
  assert.ok(e.hp<primary);
  assert.equal(a.effectResolverV41().has(e,'stun'),true);
  assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m44_sejuani_storm'&&z.ownerId===u.id));
  assert.equal(e2.hp,secondary,'Sejuani storm waits until next tick');
  tick();assert.ok(e2.hp<secondary,'storm secondary damage');
  assert.equal(a.boardTemporalV453Dev69.some(z=>z.kind==='m44_sejuani_storm'),false);
  snap();
 });
 run('Milio',team,'first champion kick and subsequent bouncing splash',f=>{
  const {a,u,e,e2,cast,tick,snap}=f,start=e.x,hp=e.hp,extra=e2.hp;
  e2.x=.554;
  cast();assert.equal(e.x,start);assert.equal(e.hp,hp);
  tick();assert.ok(e.x>start,'knockback happens on contact');
  assert.ok(e.hp<hp);
  assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m44_milio_bounce'&&z.ownerId===u.id));
  assert.equal(e2.hp,extra,'bounce cannot land on launch tick');
  tick();assert.ok(e2.hp<extra,'separate bounce splash');
  assert.equal(a.boardTemporalV453Dev69.some(z=>z.kind==='m44_milio_bounce'),false);
  snap();
 });
 run('Lucian',team,'star centered on contact and real ardent marks',f=>{
  const {a,u,e,e2,cast,tick,snap}=f,primary=e.hp,secondary=e2.hp;
  e2.x=.532;e2.y=.505;
  cast();assert.equal(e.hp,primary);
  assert.equal(e.m20MarksV453?.['ardent_'+u.id],undefined);
  tick();assert.ok(e.hp<primary);
  assert.ok(e2.hp<secondary,'secondary star ray must hit');
  assert.ok(e.m20MarksV453?.['ardent_'+u.id]>a.gameTime);
  assert.ok(e2.m20MarksV453?.['ardent_'+u.id]>a.gameTime);
  snap();
 });
 for(const champ of ['Sejuani','Milio','Lucian']){
  run(champ,team,'spell-shield contact does not apply authored CC/mark',f=>{
   const {a,u,e,cast,tick,snap}=f,start=e.x;
   a.applyEffectV41(e,'spell_shield',{source:e,duration:4,
    key:'m44_b02_shield_'+team+'_'+champ});
   cast();tick();
   if(champ==='Sejuani')
    assert.equal(a.effectResolverV41().has(e,'stun'),false);
   if(champ==='Milio'){
    assert.equal(e.x,start,'shielded Milio target cannot be displaced');
    assert.equal(a.effectResolverV41().has(e,'slow'),false);
   }
   if(champ==='Lucian')
    assert.equal(e.m20MarksV453?.['ardent_'+u.id],undefined);
   snap();
  });
  run(champ,team,'first minion is champion-specific collision',f=>{
   const {a,u,e,cast,tick,snap}=f,
    minion={id:'m44_b02_min_'+team+'_'+champ,kind:'minion',
     team:e.team,x:.516,y:.5,hp:900,maxHp:900,armor:0,mr:0,spawnAt:0};
   a.minions.push(minion);
   if(champ==='Lucian'){e.x=.523;e.y=.505}
   const hp=e.hp;cast();tick();
   if(champ==='Sejuani'){
    assert.equal(minion.hp,900,'Sejuani R skips minion collision');
    assert.ok(e.hp<hp);
   }else if(champ==='Milio'){
    assert.ok(minion.hp<900,'Milio Q kicks minion first');
    assert.equal(e.hp,hp,'Milio next bounce not yet resolved');
   }else{
    assert.ok(minion.hp<900,'Lucian W hits first minion');
    assert.ok(e.m20MarksV453?.['ardent_'+u.id]>a.gameTime,
     'star can mark separately exposed champion');
   }
   snap();
  });
 }
}
for(const failure of failures)console.error('M44_B02_FAIL',JSON.stringify(failure));
console.log('M44_B02_AUTHORED_IMPACT '+JSON.stringify({
 champions:['Sejuani R','Milio Q','Lucian W'],seats:2,
 scenarios,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
assert.equal(scenarios,18);
assert.equal(snapshots,18);
