/** M22: shared authoritative serial shots, magazine and attached bombs. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:20269342,mode:'pvp',draft:{
   [team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{
  x:.08,y:.08,hp:2500,maxHp:2500,autoAttack:false,
  autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID'),
  e2=a.units.find(v=>v.id===other+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:2500,maxHp:2500,level:16,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:6500,maxHp:6500,armor:0,mr:0});
 Object.assign(e2,{x:.517,y:.5,hp:6500,maxHp:6500,armor:0,mr:0});
 a.canSeePoint=()=>true;a.visible=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,point)=>{
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,{point});
  assert.equal(queued.ok,true,champ+slot+' queue '+JSON.stringify(queued));
  let result=null;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,q)=>(result=original(v,q));
  a.resolveBoardSkillsV453Dev69();a.executeBoardSkillV453Dev69=original;
  assert.equal(result?.ok,true,champ+slot+' execute '+JSON.stringify(result));
  return {queued,result};
 };
 return {a,u,e,e2,other,cast};
}
function snap(a){
 const state=a.snapshotV40();
 assert.equal(checksumV40(Arena.fromSnapshotV40(map,mask,state).snapshotV40()),
  checksumV40(state),'snapshot changed');
}
const point={x:.515,y:.5};
let cases=0;const names=[];
const check=(name,fn)=>{fn();names.push(name);cases++;};
for(const team of ['blue','red']){
 check(team+' Xerath R charges R once, then 5 aimed shots',()=>{
  const {a,u,e,cast}=fixture('Xerath',team);
  const hp=e.hp,{result}=cast('R',point);
  assert.equal(result.scheduled,true);
  assert.equal(e.hp,hp,'initial channel must not deal instant burst');
  assert.equal(u.m22ArtilleryV453?.remaining,5);
  assert.equal(a.boardTemporalV453Dev69.filter(z=>z.kind==='m22_artillery_channel').length,1);
  const mana=u.mana,cd=u.skillCds.R;
  snap(a);
  for(let i=0;i<5;i++){
   a.gameTime=i+1;
   const shot=cast('R',point);
   assert.equal(shot.queued.recast,true);
   assert.equal(shot.result.spentMana,0);
   assert.equal(u.mana,mana);assert.equal(u.skillCds.R,cd);
   assert.ok(e.hp<hp,'artillery must hit');
   assert.equal(u.m22ArtilleryV453?.remaining??0,Math.max(0,4-i));
  }
  assert.equal(u.m22ArtilleryV453,null);
  assert.equal(a.boardTemporalV453Dev69.some(z=>z.kind==='m22_artillery_channel'),false);
  const final=e.hp;a.resolveBoardSkillsV453Dev69();assert.equal(e.hp,final);
  snap(a);
 });
 check(team+' Xerath R recast rate limited, cannot cast through CC',()=>{
  const {a,u,e,cast}=fixture('Xerath',team);
  cast('R',point);
  const mana=u.mana;
  const fast=a.queueBoardSkillV453Dev69(team,u.id,'R',{point});
  assert.equal(fast.ok,false);assert.equal(fast.reason,'artilharia_aguarde');
  assert.equal(u.mana,mana);
  a.gameTime=1;
  a.applyEffectV41(u,'stun',{source:e,duration:2});
  const cc=a.queueBoardSkillV453Dev69(team,u.id,'R',{point});
  assert.equal(cc.ok,false,'stun allowed an artillery shot');
  a.advanceBoardTemporalV453Dev69();
  assert.equal(u.m22ArtilleryV453,null,'stun failed to interrupt');
  assert.equal(u.boardChannelUntilV453Dev69,0);
  snap(a);
 });
 check(team+' Xerath R cancels on move and expiration',()=>{
  const {a,u,cast}=fixture('Xerath',team);
  cast('R',point);
  a.gameTime=1;u.x=.53;
  a.advanceBoardTemporalV453Dev69();
  assert.equal(u.m22ArtilleryV453,null);
  assert.equal(a.boardTemporalV453Dev69.some(z=>z.kind==='m22_artillery_channel'),false);
  snap(a);
  const b=fixture('Xerath',team);
  b.cast('R',point);b.a.gameTime=11;b.a.advanceBoardTemporalV453Dev69();
  assert.equal(b.u.m22ArtilleryV453,null);
  snap(b.a);
 });
 check(team+' Zilean Q fuse follows attached enemy and fires once',()=>{
  const {a,u,e,cast}=fixture('Zilean',team);
  const initial=e.hp;
  cast('Q',point);
  assert.equal(e.hp,initial);
  const bomb=a.boardTemporalV453Dev69.find(z=>z.kind==='m22_zilean_bomb');
  assert.equal(bomb?.anchorId,e.id);
  e.x=.53; e.y=.5;
  a.gameTime=2.9;a.advanceBoardTemporalV453Dev69();
  assert.equal(e.hp,initial);snap(a);
  a.gameTime=3.01;a.advanceBoardTemporalV453Dev69();
  assert.ok(e.hp<initial,'attached bomb did not follow target');
  assert.equal(a.boardTemporalV453Dev69.some(z=>z.kind==='m22_zilean_bomb'),false);
  const after=e.hp;a.advanceBoardTemporalV453Dev69();assert.equal(e.hp,after);
  snap(a);
 });
 check(team+' Zilean W rewinds Q and double bomb stuns',()=>{
  const {a,u,e,cast}=fixture('Zilean',team);
  const initial=e.hp;
  cast('Q',point);
  a.gameTime=1;cast('W');
  assert.ok(u.skillCds.Q<=a.gameTime,'W did not rewind Q');
  a.gameTime=2;cast('Q',point);
  assert.ok(e.hp<initial,'second Q did not explode first');
  assert.equal(a.effectResolverV41().has(e,'stun'),true);
  assert.equal(a.boardTemporalV453Dev69.filter(z=>z.kind==='m22_zilean_bomb').length,1);
  snap(a);
 });
 check(team+' Corki R seven magazines, third Big One and refill',()=>{
  const {a,u,e,cast}=fixture('Corki',team);
  const hits=[];let first=e.hp;
  for(let i=1;i<=7;i++){
   a.gameTime=i;
   u.skillCds.R=0;
   cast('R',{x:.54,y:.5});
   const delta=first-e.hp;assert.ok(delta>0);hits.push(delta);
   first=e.hp;
  }
  assert.equal(u.m22MagazineV453?.charges,0);
  assert.equal(u.m22MagazineV453.shots,7);
  assert.ok(hits[2]>hits[1]*1.3,'third missile should be Big One');
  assert.ok(hits[5]>hits[4]*1.3,'sixth missile should be Big One');
  u.skillCds.R=0;a.gameTime=8;
  const empty=a.queueBoardSkillV453Dev69(team,u.id,'R',{point:{x:.54,y:.5}});
  assert.equal(empty.ok,false);assert.equal(empty.reason,'municao_insuficiente');
  a.gameTime=11;u.skillCds.R=0;
  cast('R',{x:.54,y:.5});
  assert.equal(u.m22MagazineV453?.charges,0,'exactly one missile should replenish');
  snap(a);
 });
 check(team+' Gragas barrel charge adds damage, timer and recast do not double hit',()=>{
  const early=fixture('Gragas',team);
  early.cast('Q',point);
  const pre=early.e.hp;
  early.a.gameTime=.1;early.cast('Q');
  const baseline=pre-early.e.hp;
  const late=fixture('Gragas',team);
  late.cast('Q',point);
  const hp=late.e.hp;late.a.gameTime=2.5;late.cast('Q');
  const charged=hp-late.e.hp;
  assert.ok(charged>baseline*1.3,'charged barrel damage missing');
  late.a.gameTime=4.2;late.a.advanceBoardTemporalV453Dev69();
  assert.equal(late.e.hp,hp-charged,'barrel duplicate after detonation');
  snap(late.a);snap(early.a);
 });
}
assert.equal(cases,14);
console.log('M22_B01_CHANNEL_FUSE_QA '+JSON.stringify({
 cases,teamSeats:2,championFamilies:['Xerath','Zilean','Corki','Gragas'],
 names,certifiedChampions:0}));
