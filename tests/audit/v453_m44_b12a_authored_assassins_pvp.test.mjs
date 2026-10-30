/** M44 B12A real Arena: champion-owned combat identity fixtures. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B12_KITS_V453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let passed=0,snapshots=0;const failures=[];
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:441212,mode:'pvp',
  draft:{[team]:{MID:champ},[other]:{MID:'Annie',TOP:'Malphite'}}});
 for(const u of a.units)Object.assign(u,{x:.08,y:.08,hp:9000,maxHp:9000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 for(const m of a.minions)Object.assign(m,{x:.08,y:.08});
 const u=a.units.find(v=>v.id===team+'_MID'),e=a.units.find(v=>v.id===other+'_MID'),
  second=a.units.find(v=>v.id===other+'_TOP');
 Object.assign(u,{x:.5,y:.5,hp:5000,maxHp:5000,mana:10000,maxMana:10000,
  level:16,skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.52,y:.5,hp:12000,maxHp:12000,mr:0,armor:0});
 Object.assign(second,{x:.08,y:.08,hp:12000,maxHp:12000,mr:0,armor:0});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;
 a.obstacleLine=()=>false;
 function cast(slot,opts={}){
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,{
   point:opts.point??null,targetId:opts.targetId??null});
  assert.equal(q.ok,true,'queue '+champ+' '+slot+JSON.stringify(q));
  let receipt;const normal=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,intent)=>(receipt=normal(actor,intent));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=normal;}
  assert.equal(receipt?.ok,true,'commit '+champ+' '+slot+JSON.stringify(receipt));
  return receipt;
 }
 function tick(){a.gameTime++;a.round++;a.actionLocksV40={};
  a.advanceBoardPassivesV453Dev69();}
 return {a,u,e,second,cast,tick,team};
}
function check(champ,team,label,run){
 try{
  const f=fixture(champ,team);run(f);
  const snap=f.a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;snapshots++;
 }catch(error){failures.push({champ,team,label,error:String(error?.stack||error)});}
}
for(const team of ['blue','red']){
 check('Evelynn',team,'E Whiplash legal contact',({e,cast})=>{
  const hp=e.hp;assert.equal(cast('E',{targetId:e.id}).whiplash,true);
  assert.ok(e.hp<hp);
 });
 check('Evelynn',team,'Allure mature charmed by E',({a,u,e,cast})=>{
  e.m16EvelynnMark={ownerId:u.id,maturesAt:a.gameTime-1,until:a.gameTime+4};
  assert.equal(cast('E',{targetId:e.id}).charmed,true);
  assert.equal(a.effectResolverV41().has(e,'charm'),true);
 });
 check('Evelynn',team,'Allure immature does not charm',({a,u,e,cast})=>{
  e.m16EvelynnMark={ownerId:u.id,maturesAt:a.gameTime+3,until:a.gameTime+4};
  assert.equal(cast('E',{targetId:e.id}).charmed,false);
 });
 check('Evelynn',team,'E cannot charm through spell shield',({a,u,e,cast})=>{
  e.m16EvelynnMark={ownerId:u.id,maturesAt:a.gameTime-1,until:a.gameTime+4};
  a.applyEffectV41(e,'spell_shield',{source:e,duration:4,key:'b12_eve_shield'});
  assert.equal(cast('E',{targetId:e.id}).charmed,false);
  assert.equal(a.effectResolverV41().has(e,'charm'),false);
 });
 check('Evelynn',team,'E enemy beyond reach rejected',({a,u,e})=>{
  e.x=.54;assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'E',{targetId:e.id}).ok,false);
 });
 check('Evelynn',team,'R escape and front arc hit',({u,e,cast})=>{
  const x=u.x,hp=e.hp;
  const r=cast('R',{point:{x:.535,y:.5}});
  assert.equal(r.lastCaress,true);assert.ok(r.hitCount>0);
  assert.ok(u.x<x&&e.hp<hp);
 });
 check('Evelynn',team,'R ignores behind cone enemies',({a,u,e,cast})=>{
  e.x=.48;const hp=e.hp;
  const r=cast('R',{point:{x:.535,y:.5}});
  assert.equal(r.hitCount,0);assert.equal(e.hp,hp);
 });
 check('Rengar',team,'Q Savagery arms one genuine basic',({a,u,e,cast})=>{
  assert.equal(cast('Q').savagery,true);
  assert.equal(u.m44B12Ferocity,1);
  const hp=e.hp;a.damage(e,40,u,'physical','basic');
  assert.ok(e.hp<hp-40);
  assert.equal(u.boardNextBasicV453Dev69,null);
 });
 check('Rengar',team,'Q empowered spends Ferocity',({u,cast})=>{
  u.m44B12Ferocity=4;
  assert.equal(cast('Q').empowered,true);
  assert.equal(u.m44B12Ferocity,0);
 });
 check('Rengar',team,'W Battle Roar restores recent damage',({a,u,e,cast})=>{
  u.hp=1900;a.damage(u,200,e,'physical','spell');
  const hp=u.hp,r=cast('W');assert.equal(r.battleRoar,true);
  assert.ok(u.hp>hp);
 });
 check('Rengar',team,'W cleanses CC only empowered',({a,u,cast})=>{
  u.m44B12Ferocity=4;
  a.applyEffectV41(u,'root',{source:u,duration:4,key:'b12root'});
  assert.equal(cast('W').empowered,true);
  assert.equal(a.effectResolverV41().has(u,'root'),false);
 });
 check('Rengar',team,'E Bola delayed slow after flight',({a,u,e,cast,tick})=>{
  const hp=e.hp;cast('E',{point:{x:.56,y:.5}});
  assert.equal(e.hp,hp);tick();
  assert.equal(a.effectResolverV41().has(e,'slow'),true);
 });
 check('Rengar',team,'empowered Bola roots and spends fury',({a,u,e,cast,tick})=>{
  u.m44B12Ferocity=4;cast('E',{point:{x:.56,y:.5}});tick();
  assert.equal(a.effectResolverV41().has(e,'root'),true);
  assert.equal(u.m44B12Ferocity,0);
 });
 check('Rengar',team,'Bola blocked by wall before impact',({a,e,cast,tick})=>{
  const hp=e.hp;cast('E',{point:{x:.56,y:.5}});
  a.obstacleLine=()=>true;tick();assert.equal(e.hp,hp);
 });
 check('Khazix',team,'Q isolated bonus registered',({e,cast})=>{
  const hp=e.hp,r=cast('Q',{targetId:e.id});
  assert.equal(r.tasteFear,true);assert.equal(r.isolated,true);
  assert.ok(e.hp<hp);
 });
 check('Khazix',team,'Q no isolated when ally adjacent',({e,second,cast})=>{
  second.x=.523;second.y=.5;
  assert.equal(cast('Q',{targetId:e.id}).isolated,false);
 });
 check('Khazix',team,'E Leap real destination AoE',({u,e,cast})=>{
  const hp=e.hp,r=cast('E',{point:{x:e.x,y:e.y}});
  assert.equal(r.leap,true);assert.ok(r.hitCount>0);
  assert.equal(u.x,e.x);assert.ok(e.hp<hp);
 });
 check('Khazix',team,'E Leap cannot queue blocked terrain',({a,u,e})=>{
  a.walkable=()=>false;
  assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'E',{point:{x:e.x,y:e.y}}).ok,false);
 });
 check('MonkeyKing',team,'Q Crushing Blow physical armor reduction',({a,u,e,cast})=>{
  cast('Q');const hp=e.hp;a.damage(e,40,u,'physical','basic');
  assert.ok(e.hp<hp-40);assert.equal(e.m44B12WukongArmorShred.ownerId,u.id);
 });
 check('MonkeyKing',team,'E Nimbus Strike target and two images',({u,e,second,cast})=>{
  second.x=.525;second.y=.5;
  const hp=second.hp,r=cast('E',{targetId:e.id});
  assert.equal(r.nimbus,true);assert.equal(r.hitCount,2);
  assert.ok(u.x>.5&&second.hp<hp);
 });
 check('MonkeyKing',team,'R Cyclone scheduled and knocks up once',({a,e,cast,tick})=>{
  const hp=e.hp;assert.equal(cast('R').cyclone,true);assert.equal(e.hp,hp);
  tick();assert.ok(e.hp<hp);assert.equal(a.effectResolverV41().has(e,'knockup'),true);
  const z=a.boardTemporalV453Dev69.find(v=>v.kind==='m44_b12_wukong_cyclone');
  assert.ok(z.hitIds.includes(e.id));tick();
  assert.equal(z.hitIds.filter(x=>x===e.id).length,1);
 });
}
for(const err of failures)console.error('M44_B12A_FAIL',JSON.stringify(err));
console.log('M44_B12A_QA '+JSON.stringify({champions:Object.keys(M44_B12_KITS_V453),
 activeSlots:10,passed,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,42);
