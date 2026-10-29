/** M30 B01 allied-combat and channel-counter contracts (two human PvP seats). */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const names=['LeeSin','Sett','Sejuani','Kassadin'];let passed=0;const failures=[];
for(const champ of names)for(const team of ['blue','red'])try{
 const foe=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:303031,mode:'pvp',
  draft:{[team]:{MID:champ},[foe]:{MID:champ==='Kassadin'?'Karthus':'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:3500,maxHp:3500,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),e=a.units.find(v=>v.id===foe+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:3500,maxHp:3500,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,level:16,hp:7000,maxHp:7000,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(ally,{x:.509,y:.5,hp:3500,maxHp:3500,range:125/15000});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(side,id,slot,opts={})=>{
  const q=a.queueBoardSkillV453Dev69(side,id,slot,opts);
  assert.equal(q.ok,true,champ+' '+slot+' '+JSON.stringify(q));
  a.resolveBoardSkillsV453Dev69();
 };
 if(champ==='LeeSin'){
  const regular=a.basicAttackIntervalV452c(u);
  cast(team,u.id,'E');
  assert.equal(u.m30LeeFlurry?.charges,2);
  assert.ok(a.basicAttackIntervalV452c(u)<regular,'real Flurry speeds Lee Sin basics');
  a.damage(e,40,u,'physical','basic');
  assert.equal(u.m30LeeFlurry.charges,1);
  a.damage(e,40,u,'physical','basic');
  assert.equal(u.m30LeeFlurry.charges,0);
  assert.equal(a.basicAttackIntervalV452c(u),regular,'no third Flurry hit');
 }else if(champ==='Sett'){
  cast(team,u.id,'Q');
  const before=e.hp;a.damage(e,40,u,'physical','basic');
  assert.ok(e.hp<before-150,'Knuckle Q adds target max health on actual basic');
  a.damage(e,40,u,'physical','basic');
  assert.equal(u.boardNextBasicV453Dev69,null,'two Q attacks consumed');
  const hp=e.hp;a.damage(e,40,u,'physical','basic');
  assert.ok(hp-e.hp<150,'third basic cannot repeat Q bonus');
 }else if(champ==='Sejuani'){
  // A REAL melee ally can apply Sejuani-owned stacks, not a ranged packet.
  for(let i=0;i<4;i++)a.damage(e,20,ally,'physical','basic');
  assert.equal(e.m21FrostV453?.sourceId,u.id);
  assert.equal(e.m21FrostV453?.stacks,4,'four allied melees must complete Permafrost');
  cast(team,u.id,'E',{targetId:e.id});
  assert.equal(a.effectResolverV41().has(e,'stun'),true,'Sejuani E consumes ally-built Frost');
  assert.equal(e.m21FrostV453,null);
  ally.range=650/15000;
  a.damage(e,20,ally,'physical','basic');
  assert.equal(e.m21FrostV453,null,'ranged ally may not rebuild Sejuani Frost');
 }else if(champ==='Kassadin'){
  assert.equal(e.champ,'Karthus');
  cast(foe,e.id,'R');
  assert.ok(a.boardTemporalV453Dev69.some(z=>
   z.kind==='m20_requiem_channel'&&z.ownerId===e.id));
  const hp=u.hp;
  cast(team,u.id,'Q',{targetId:e.id});
  assert.equal(a.boardTemporalV453Dev69.some(z=>
   z.kind==='m20_requiem_channel'&&z.ownerId===e.id),false,
   'Null Sphere cancels the actual enemy Requiem channel');
  assert.equal(e.boardChannelUntilV453Dev69,0);
  a.gameTime+=4;a.advanceBoardTemporalV453Dev69();
  assert.equal(u.hp,hp,'interrupted Requiem may not deal later damage');
 }
 const snap=a.snapshotV40();
 assert.equal(checksumV40(snap),checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
 passed++;
}catch(err){failures.push({champ,team,error:String(err?.stack||err)})}
for(const e of failures)console.error('M30_FAMILY_FAIL',JSON.stringify(e));
console.log('M30_FAMILY_QA '+JSON.stringify({champions:names.length,seats:2,
 passed,failed:failures.length,certifiedChampions:0}));
assert.equal(failures.length,0);assert.equal(passed,8);
