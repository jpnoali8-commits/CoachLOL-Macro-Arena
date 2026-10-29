/** M24/B01 shared phases and terrain tested through authoritative queue -> resolve. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
function fixture(champ,team){
 const opponent=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:20262401,mode:'pvp',draft:{
  [team]:{MID:champ},[opponent]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.07,y:.07,hp:3000,maxHp:3000,
  autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID');
 const e=a.units.find(v=>v.id===opponent+'_MID');
 Object.assign(u,{champ,x:.5,y:.5,hp:2200,maxHp:2200,level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:5500,maxHp:5500,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 function cast(slot,opts={}){
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(queued.ok,true,champ+' '+slot+' queue '+JSON.stringify(queued));
  const original=a.executeBoardSkillV453Dev69.bind(a);let result;
  a.executeBoardSkillV453Dev69=(actor,intent)=>(result=original(actor,intent));
  a.resolveBoardSkillsV453Dev69();a.executeBoardSkillV453Dev69=original;
  assert.equal(result?.ok,true,champ+' '+slot+' result '+JSON.stringify(result));
  return {queued,result};
 }
 return {a,u,e,opponent,cast};
}
function snap(a){
 const serialized=a.snapshotV40();
 assert.equal(checksumV40(serialized),
  checksumV40(Arena.fromSnapshotV40(map,mask,serialized).snapshotV40()));
}
const cases=[];
function check(name,fn){fn();cases.push(name);}
for(const team of ['blue','red']){
 check(team+' Jarvan E flag Q knockup movement and snapshot',()=>{
  const {a,u,e,cast}=fixture('JarvanIV',team);
  cast('E',{point:{x:.525,y:.5}});
  assert.equal(a.boardSummonsV453Dev69.filter(x=>x.kind==='jarvan_flag').length,1);
  a.gameTime=1;const before=e.hp;
  const out=cast('Q',{point:{x:.525,y:.5}});
  assert.equal(out.result.flagDash,true);
  assert.equal(u.x,.525);
  assert.ok(e.hp<before);
  assert.ok(a.effectResolverV41().has(e,'knockup'));
  snap(a);
 });
 check(team+' Jarvan R dynamic wall blocks ring and expires',()=>{
  const {a,u,e,cast}=fixture('JarvanIV',team);
  cast('R',{targetId:e.id});
  const wall=a.boardTemporalV453Dev69.find(x=>x.kind==='m24_jarvan_arena');
  assert.ok(wall&&wall.until>0);
  assert.equal(a.m24ArenaWallBlocksV453({x:wall.point.x+wall.radius/a.worldWidth,y:wall.point.y}),true);
  a.gameTime=4;a.advanceBoardTemporalV453Dev69();
  assert.equal(a.m24ArenaWallBlocksV453({x:wall.point.x+wall.radius/a.worldWidth,y:wall.point.y}),false);
  snap(a);
 });
 check(team+' Jarvan Q denied flag dash by colisor',()=>{
  const {a,u,cast}=fixture('JarvanIV',team);
  cast('E',{point:{x:.525,y:.5}});
  a.gameTime=1;a.obstacleLine=()=>true;
  const result=cast('Q',{point:{x:.525,y:.5}});
  assert.notEqual(result.result.flagDash,true);
  assert.equal(u.x,.5);
  snap(a);
 });
 check(team+' Syndra Q orb E scatter stun and snapshot',()=>{
  const {a,u,e,cast}=fixture('Syndra',team);
  cast('Q',{point:{x:.51,y:.5}});
  assert.equal(u.m20SyndraOrbsV453.length,1);
  a.gameTime=1;cast('E',{point:{x:.53,y:.5}});
  assert.ok(a.effectResolverV41().has(e,'stun'));
  assert.ok(u.m20SyndraOrbsV453[0].x>.51);
  snap(a);
 });
 check(team+' Syndra W orb throw and R consumption',()=>{
  const {a,u,e,cast}=fixture('Syndra',team);
  cast('Q',{point:{x:.51,y:.5}});
  a.gameTime=1;cast('W',{point:{x:.52,y:.5}});
  assert.equal(u.m20SyndraOrbsV453[0].x,.52);
  a.gameTime=2;cast('R',{targetId:e.id});
  assert.equal(u.m20SyndraOrbsV453.length,0);
  snap(a);
 });
 check(team+' Fizz E untargetable recast no duplicate cost',()=>{
  const {a,u,e,cast}=fixture('Fizz',team);
  cast('E',{point:{x:.51,y:.5}});
  assert.ok(u.m24FizzLeapV453?.until>0);
  assert.equal(a.boardCombatEntityByIdV453Dev69(u.id),null);
  assert.equal(a.damage(u,300,e,'magic','spell'),0);
  const mana=u.mana,cd=u.skillCds.E;
  a.gameTime=.4;const second=cast('E',{point:{x:.515,y:.5}});
  assert.equal(second.queued.recast,true);
  assert.equal(second.result.spentMana,0);
  assert.equal(u.mana,mana);assert.equal(u.skillCds.E,cd);
  assert.equal(u.m24FizzLeapV453,null);assert.equal(u.x,.515);
  snap(a);
 });
 check(team+' Fizz E automatic landing and R delayed shark',()=>{
  const {a,u,e,cast}=fixture('Fizz',team);
  cast('E',{point:{x:.51,y:.5}});
  a.gameTime=1.6;a.advanceBoardPassivesV453Dev69();
  assert.equal(u.m24FizzLeapV453,null);
  assert.equal(u.x,.51);
  a.gameTime=2;const hp=e.hp;
  cast('R',{point:{x:.515,y:.5}});
  assert.equal(e.hp,hp);
  a.gameTime=4.1;a.advanceBoardTemporalV453Dev69();
  assert.ok(e.hp<hp);
  assert.ok(a.effectResolverV41().has(e,'knockup'));
  snap(a);
 });
 check(team+' Tahm Q taste and unstacked enemy R denied',()=>{
  const {a,u,e,cast}=fixture('TahmKench',team);
  cast('Q',{point:{x:.53,y:.5}});
  assert.equal(e.m24TasteV453?.[u.id]?.stacks,1);
  const blocked=a.queueBoardSkillV453Dev69(team,u.id,'R',{targetId:e.id});
  assert.equal(blocked.ok,false);
  assert.equal(blocked.reason,'devour_requer_tres_marcas');
  snap(a);
 });
 check(team+' Tahm R enemy devour untargetable and timed release',()=>{
  const {a,u,e,opponent,cast}=fixture('TahmKench',team);
  e.m24TasteV453={[u.id]:{stacks:3,until:6}};
  cast('R',{targetId:e.id});
  assert.equal(u.m24DevourV453?.targetId,e.id);
  assert.equal(a.boardCombatEntityByIdV453Dev69(e.id),null);
  assert.equal(a.damage(e,500,u,'magic','spell'),0);
  assert.equal(a.queueBoardSkillV453Dev69(opponent,e.id,'Q',{point:{x:.53,y:.5}}).ok,false);
  a.gameTime=3.2;a.advanceBoardPassivesV453Dev69();
  assert.equal(u.m24DevourV453,null);
  assert.equal(e.m24DevouredByV453,null);
  snap(a);
 });
 check(team+' Tahm R ally devour requires no taste',()=>{
  const {a,u,cast}=fixture('TahmKench',team);
  const ally=a.units.find(v=>v.team===team&&v.id!==u.id);
  Object.assign(ally,{x:.507,y:.5,hp:2200,maxHp:2200});
  cast('R',{targetId:ally.id});
  assert.equal(u.m24DevourV453?.targetId,ally.id);
  a.gameTime=3.1;a.advanceBoardPassivesV453Dev69();
  assert.equal(ally.m24DevouredByV453,null);
  snap(a);
 });
}
assert.equal(cases.length,20);
console.log('M24_B01_SHARED_PVP_QA '+JSON.stringify({
 cases:cases.length,teamSeats:2,families:['JarvanIV','Syndra','Fizz','TahmKench'],
 names:cases,certifiedChampions:0
}));
