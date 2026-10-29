/** M17: named travelling projectiles share one entity-collision primitive.
 *  Tests the actual authored launchers; no handcrafted mock missile instances.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const projects=[
 {champ:'Nami',slot:'R',kind:'nami_r',launch:(a,u,p)=>a.launchWaveShadowV453Dev69(u,'R',p)},
 {champ:'Vex',slot:'R',kind:'vex_r',launch:(a,u,p)=>a.launchWaveShadowV453Dev69(u,'R',p)},
 {champ:'Vex',slot:'Q',kind:'vex_q',launch:(a,u,p)=>a.castVexBasicV453Dev69M1(u,'Q',p)},
 {champ:'Jinx',slot:'R',kind:'jinx_r',launch:(a,u,p)=>a.launchJinxRocketV453Dev69M5(u,p)},
 {champ:'Jinx',slot:'W',kind:'jinx_w',launch:(a,u,p)=>a.launchChampionDirectionalV453Dev69M2(u,'W',p)},
 {champ:'Ahri',slot:'E',kind:'ahri_e',launch:(a,u,p)=>a.launchChampionDirectionalV453Dev69M2(u,'E',p)},
 {champ:'Ezreal',slot:'R',kind:'ezreal_r',launch:(a,u,p)=>a.castEzrealBarrageV453Dev69M7(u,p)}
];
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:69173,mode:'pvp',
  draft:{[team]:{MID:champ},[other]:{MID:'Shaco'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,
  autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID');
 const owner=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:1600,maxHp:1600,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(owner,{champ:'Shaco',x:.68,y:.5,level:6,hp:1400,maxHp:1400});
 a.canSeePoint=()=>true;a.visible=()=>true;a.gameTime=1;
 const clone=a.m15Summon('shaco_clone',owner,{x:.528,y:.5},{
  hp:3500,maxHp:3500,stealthUntil:0,until:18,damageTakenMultiplier:1.5,
  explosionPower:90,appearance:{kind:'champion',champ:'Shaco'}});
 assert.equal(a.units.length,10);
 return {a,u,clone,owner,team};
}
const result=[];let failures=0;
for(const team of ['blue','red'])for(const entry of projects){
 try{
  const {a,u,clone,owner}=fixture(entry.champ,team);
  const before=clone.hp,champHP=owner.hp,mp=u.mana;
  const cast=entry.launch(a,u,{x:.54,y:.5});
  assert.equal(cast.ok,true,entry.kind+': '+cast.reason);
  assert.ok(u.mana<mp||u.skillCds[entry.slot]>a.gameTime,'cast must pay once');
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  if(entry.kind==='ezreal_r'){
   a.gameTime=Math.max(a.gameTime+1,a.ezrealBarrageWindsV453Dev69M7[0].dueAt+.1);
   a.advanceEzrealBarrageV453Dev69M7();
   assert.ok(a.championProjectilesV453Dev42.some(v=>v.kind==='ezreal_r'));
   a.gameTime+=1;
  }else a.gameTime=2.5;
  a.advanceChampionProjectilesV453Dev42();
  assert.ok(clone.hp<before,'missile did not collide with visible clone');
  assert.equal(owner.hp,champHP,'owner behind this shot should not get free damage');
  assert.equal(a.units.length,10);
  if(entry.kind==='vex_r'){
   assert.ok(!u.vexMark,'a decoy must not create R2 entitlement');
   assert.ok(!a.queueVexRecast(team,u.id).ok,'R2 cannot target a clone');
  }
  if(entry.kind==='nami_r')assert.ok(!a.effectResolverV41().has(clone,'knockup'));
  if(entry.kind==='vex_q')assert.ok(!a.effectResolverV41().has(clone,'fear'));
  if(entry.kind==='ahri_e')assert.ok(!a.effectResolverV41().has(clone,'charm'));
  if(entry.kind==='jinx_w')assert.ok(!a.effectResolverV41().has(clone,'slow'));
  const hp=clone.hp;
  a.advanceChampionProjectilesV453Dev42();
  assert.equal(clone.hp,hp,'one flight segment cannot double-hit clone');
  result.push({team,champ:entry.champ,slot:entry.slot,status:'PASS',damage:before-clone.hp});
  console.log('M17_PROJECTILE_PASS '+team+' '+entry.champ+' '+entry.slot+' '+entry.kind);
 }catch(e){
  failures++;result.push({team,champ:entry.champ,slot:entry.slot,status:'FAIL',error:String(e?.message||e)});
  console.error('M17_PROJECTILE_FAIL '+JSON.stringify(result.at(-1)));
 }
}
console.log('M17_PROJECTILE_SUMMARY '+JSON.stringify({cases:result.length,passed:result.length-failures,failed:failures}));
assert.equal(failures,0,'Every authored travelling projectile must use shared clone collision');
