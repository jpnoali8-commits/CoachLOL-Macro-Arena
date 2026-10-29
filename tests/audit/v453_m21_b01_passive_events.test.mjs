/**
 * M21/B01 shared combat event passive QA: six additional champion families,
 * both PvP seats. A hit must actually land to trigger a passive; state survives
 * snapshot/restore and cannot proc recursively from passive damage itself.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:20269322,mode:'pvp',draft:{
  [team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:2500,maxHp:2500,
  autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID'),
  e2=a.units.find(v=>v.id===other+'_TOP'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:2500,maxHp:2500,level:16,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:2500,maxHp:2500,armor:0,mr:0});
 Object.assign(e2,{x:.516,y:.5,hp:2500,maxHp:2500,armor:0,mr:0});
 Object.assign(ally,{x:.511,y:.5,hp:1200,maxHp:2500});
 a.canSeePoint=()=>true;a.visible=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,opts)=>{
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,opts||{});
  assert.equal(queued.ok,true,champ+' '+slot+' '+queued.reason);
  let execution=null;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(who,q)=>(execution=original(who,q));
  a.resolveBoardSkillsV453Dev69();a.executeBoardSkillV453Dev69=original;
  assert.equal(execution?.ok,true,'executor '+champ+slot+' '+JSON.stringify(execution));
 };
 return {a,u,e,e2,ally,cast};
}
function snap(a){
 const s=a.snapshotV40();
 assert.equal(checksumV40(s),checksumV40(Arena.fromSnapshotV40(map,mask,s).snapshotV40()));
}
let total=0;const families={};
for(const team of ['blue','red']){
 {
  const {a,u,e,cast}=fixture('Lucian',team);
  cast('E',{point:{x:.505,y:.5}});
  assert.equal(u.m21LightslingerV453?.charges,1);
  const hp=e.hp;a.damage(e,80,u,'physical','basic');
  assert.ok(hp-e.hp>80,'Lucian second shot missing');
  assert.equal(u.m21LightslingerV453,null);
  const after=e.hp;a.damage(e,80,u,'physical','basic');
  assert.ok(after-e.hp<=80.001,'Lucian phantom extra shot');
  snap(a);families.Lucian=(families.Lucian||0)+1;total++;
 }
 {
  const {a,u,e,cast}=fixture('Quinn',team);
  cast('Q',{point:{x:.53,y:.5}});
  assert.ok(e.m20MarksV453?.['harrier_'+u.id]>a.gameTime);
  const hp=e.hp;a.damage(e,80,u,'physical','basic');
  assert.ok(hp-e.hp>80,'Harrier did not empower the marked attack');
  assert.ok(u.boardSpeedV453Dev69?.until>a.gameTime);
  assert.ok(!(e.m20MarksV453?.['harrier_'+u.id]>a.gameTime),'Harrier not consumed');
  snap(a);families.Quinn=(families.Quinn||0)+1;total++;
 }
 {
  const {a,u,e,cast}=fixture('Varus',team);
  for(let n=0;n<3;n++)a.damage(e,30,u,'physical','basic');
  assert.equal(e.m21VarusBlightV453?.stacks,3);
  snap(a);
  const hp=e.hp;cast('Q',{point:{x:.53,y:.5}});
  assert.ok(e.hp<hp,'Blight skill did not damage');
  assert.equal(e.m21VarusBlightV453,null,'Blight not detonated');
  snap(a);families.Varus=(families.Varus||0)+1;total++;
 }
 {
  const {a,u,e,cast}=fixture('Sejuani',team);
  const noStack=a.queueBoardSkillV453Dev69(team,u.id,'E',{targetId:e.id});
  assert.equal(noStack.ok,false,'Permafrost wrongly casts with zero frost');
  assert.equal(noStack.reason,'requer_quatro_frost');
  cast('W',{point:{x:.53,y:.5}});
  assert.equal(e.m21FrostV453?.stacks,2);
  a.damage(e,25,u,'physical','basic');
  a.damage(e,25,u,'physical','basic');
  assert.equal(e.m21FrostV453?.stacks,4);
  snap(a);
  cast('E',{targetId:e.id});
  assert.equal(e.m21FrostV453,null);
  assert.equal(a.effectResolverV41().has(e,'stun'),true);
  families.Sejuani=(families.Sejuani||0)+1;total++;
 }
 {
  const {a,u,e,cast}=fixture('Cassiopeia',team);
  const hp=e.hp;cast('Q',{point:{x:.515,y:.5}});
  assert.ok(u.boardSpeedV453Dev69?.until>a.gameTime,'Noxious Blast failed to grant speed');
  const poison=e.statusEffectsV41||[];
  assert.ok(poison.some(f=>f.type==='dot'),'Poison did not schedule damage');
  a.gameTime=1;a.effectResolverV41().advanceTick();
  assert.ok(e.hp<hp,'Poison did not tick');
  snap(a);families.Cassiopeia=(families.Cassiopeia||0)+1;total++;
 }
 {
  const {a,u,e,e2,ally}=fixture('Alistar',team);
  const hp=ally.hp;a.damage(e,9999,ally,'true','spell');
  assert.equal(e.hp,0);
  assert.ok(ally.hp>hp,'Triumphant Roar failed to heal nearby ally');
  const once=ally.hp;
  a.damage(e2,9999,ally,'true','spell');
  assert.equal(ally.hp,once,'Triumphant Roar triggered again inside cooldown');
  assert.ok(u.m21AlistarRoarNextV453>a.gameTime);
  snap(a);families.Alistar=(families.Alistar||0)+1;total++;
 }
}
console.log('M21_B01_PASSIVE_EVENTS '+JSON.stringify({seats:2,championFamilies:Object.keys(families),
 cases:total,families,certifiedChampions:0}));
assert.equal(total,12);
