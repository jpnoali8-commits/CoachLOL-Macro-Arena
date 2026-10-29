/**
 * M23 B01 death-state PvP gates. Real kills and death credit, without
 * adding champion roster members. Tests are on both human seats.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:20269351,mode:'pvp',draft:{
  [team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.07,y:.07,hp:3000,maxHp:3000,
  autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID'),e2=a.units.find(v=>v.id===other+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:2200,maxHp:2200,level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.512,y:.5,hp:5500,maxHp:5500,armor:0,mr:0});
 Object.assign(e2,{x:.514,y:.5,hp:5500,maxHp:5500,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,opts={})=>{
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(queued.ok,true,champ+' '+slot+' queue '+JSON.stringify(queued));
  const old=a.executeBoardSkillV453Dev69.bind(a);let result=null;
  a.executeBoardSkillV453Dev69=(v,q)=>(result=old(v,q));
  a.resolveBoardSkillsV453Dev69();a.executeBoardSkillV453Dev69=old;
  assert.equal(result?.ok,true,champ+' '+slot+' effect '+JSON.stringify(result));
  return result;
 };
 return {a,u,e,e2,team,other,cast};
}
function snap(a){
 const state=a.snapshotV40();
 assert.equal(checksumV40(state),
  checksumV40(Arena.fromSnapshotV40(map,mask,state).snapshotV40()),'snapshot diverged');
}
const point={x:.512,y:.5};let cases=0;const names=[];
const check=(name,fn)=>{fn();cases++;names.push(name);};
for(const team of ['blue','red']){
 check(team+' Karthus Death Defied 7s and single death score',()=>{
  const {a,u,e}=fixture('Karthus',team);
  const mana=u.mana;
  a.damage(u,9999,e,'true','spell');
  assert.equal(u.hp,0);assert.equal(u.deaths,1);
  assert.ok(u.m23DeathDefiedV453?.until===7);
  assert.equal(u.mana,u.maxMana);
  a.damage(u,1000,e,'true','spell');
  assert.equal(u.deaths,1);
  assert.ok(u.deadUntil>7);
  snap(a);
 });
 check(team+' Karthus free postmortem Q, no duplicate in same tick',()=>{
  const {a,u,e,team:seat,cast}=fixture('Karthus',team);
  a.damage(u,9999,e,'true','spell');
  const before=e.hp,mana=u.mana;
  const result=cast('Q',{point});
  assert.equal(result.postMortem,true);assert.equal(result.spentMana,0);
  assert.equal(u.mana,mana);assert.ok(e.hp<before);
  const duplicate=a.queueBoardSkillV453Dev69(seat,u.id,'W',{point});
  assert.equal(duplicate.ok,false,'two death casts in one tick');
  snap(a);
 });
 check(team+' Karthus R can finish channel after death',()=>{
  const {a,u,e,cast}=fixture('Karthus',team);
  a.damage(u,9999,e,'true','spell');
  a.gameTime=1;
  const old=e.hp;
  const result=cast('R');
  assert.equal(result.postMortem,true);assert.equal(result.scheduled,true);
  a.gameTime=3.9;a.advanceBoardTemporalV453Dev69();assert.equal(e.hp,old);
  snap(a);
  a.gameTime=4.1;a.advanceBoardTemporalV453Dev69();
  assert.ok(e.hp<old,'postmortem requiem failed');
  const after=e.hp;a.advanceBoardTemporalV453Dev69();assert.equal(e.hp,after);
  snap(a);
 });
 check(team+' Karthus expired corpse cannot cast or R too late',()=>{
  const {a,u,e,team:seat}=fixture('Karthus',team);
  a.damage(u,9999,e,'true','spell');
  a.gameTime=4.01;
  const late=a.queueBoardSkillV453Dev69(seat,u.id,'R');
  assert.equal(late.ok,false,'late R should not fit 3s channel');
  a.gameTime=7.1;a.advanceBoardPassivesV453Dev69();
  const expired=a.queueBoardSkillV453Dev69(seat,u.id,'Q',{point});
  assert.equal(expired.ok,false);
  assert.equal(u.hp,0);assert.equal(u.deaths,1);
  snap(a);
 });
 check(team+' Zac splits once into 4 damageable blobs without early kill',()=>{
  const {a,u,e}=fixture('Zac',team);
  const roster=a.units.length,kills=e.kills,deaths=u.deaths;
  a.damage(u,9999,e,'true','spell');
  const blobs=a.boardSummonsV453Dev69.filter(v=>v.kind==='zac_blob'&&v.ownerId===u.id);
  assert.equal(u.hp,u.maxHp*.5);assert.equal(blobs.length,4);
  assert.equal(a.units.length,roster);assert.equal(e.kills,kills);assert.equal(u.deaths,deaths);
  assert.ok(u.m23ZacDivisionV453?.active);
  const b=blobs[0],target=a.boardCombatEntityByIdV453Dev69(b.id);
  assert.equal(target?.id,b.id);
  const protectedHit=a.damage(b,130,e,'physical','spell');assert.equal(protectedHit,0);
  a.gameTime=1.6;
  const n=a.damage(b,130,e,'physical','spell');assert.ok(n>0);
  snap(a);
 });
 check(team+' Zac revives if one blob survives, no death score',()=>{
  const {a,u,e}=fixture('Zac',team);
  a.damage(u,9999,e,'true','spell');
  const blobs=a.boardSummonsV453Dev69.filter(v=>v.kind==='zac_blob');
  a.gameTime=1.6;
  for(const b of blobs.slice(0,3))a.damage(b,9999,e,'true','spell');
  a.gameTime=8;a.advanceBoardPassivesV453Dev69();
  assert.ok(u.hp>1,'Zac did not revive');
  assert.equal(u.deaths,0);assert.equal(u.m23ZacDivisionV453,null);
  assert.equal(a.boardSummonsV453Dev69.filter(v=>v.kind==='zac_blob').length,0);
  assert.equal(a.effectResolverV41().has(u,'stasis'),false);
  snap(a);
 });
 check(team+' Zac all blobs killed -> exactly one ordinary champion death',()=>{
  const {a,u,e}=fixture('Zac',team);
  a.damage(u,9999,e,'true','spell');
  const blobs=a.boardSummonsV453Dev69.filter(v=>v.kind==='zac_blob');
  a.gameTime=1.6;
  for(const b of blobs)a.damage(b,9999,e,'true','spell');
  assert.equal(u.hp,0);assert.equal(u.deaths,1);
  assert.equal(e.kills,1);
  assert.ok(u.deadUntil>a.gameTime);
  assert.equal(a.boardSummonsV453Dev69.filter(v=>v.kind==='zac_blob').length,0);
  a.gameTime=5;a.advanceBoardPassivesV453Dev69();
  assert.equal(u.deaths,1);
  snap(a);
 });
 check(team+' Zac passive cooldown prevents immediate division twice',()=>{
  const {a,u,e}=fixture('Zac',team);
  a.damage(u,9999,e,'true','spell');
  a.gameTime=8;a.advanceBoardPassivesV453Dev69();
  assert.ok(u.hp>0);const cd=u.m23ZacReadyAtV453;
  assert.ok(cd>8);
  a.gameTime=10;a.damage(u,9999,e,'true','spell');
  assert.equal(u.hp,0);assert.equal(u.deaths,1);
  assert.equal(a.boardSummonsV453Dev69.filter(v=>v.kind==='zac_blob').length,0);
  snap(a);
 });
}
assert.equal(cases,16);
console.log('M23_B01_DEATH_STATE_QA '+JSON.stringify({teamSeats:2,cases,
 names,certifiedChampions:0}));
