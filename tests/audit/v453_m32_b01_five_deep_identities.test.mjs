/** M32 five authored champion spell-depth regressions, two PvP human seats. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const champs=['Lucian','Milio','Vi','MasterYi','Seraphine'];let passed=0;const fails=[];
function setup(champ,team){
 const foe=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:320135,mode:'pvp',
  draft:{[team]:{MID:champ},[foe]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:3500,maxHp:3500,
  autoAttack:false,autoFollow:false,autoJungle:false,autoFarm:false});
 const u=a.units.find(v=>v.id===team+'_MID'),e=a.units.find(v=>v.id===foe+'_MID'),
  second=a.units.find(v=>v.id===foe+'_TOP'),ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:3500,maxHp:3500,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(second,{x:.527,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(ally,{x:.51,y:.5,hp:2600,maxHp:3500});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,opts={})=>{
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(q.ok,true,champ+' '+slot+' queue '+JSON.stringify(q));
  let result;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,cmd)=>(result=original(v,cmd));
  a.resolveBoardSkillsV453Dev69();a.executeBoardSkillV453Dev69=original;
  assert.equal(result?.ok,true,champ+' '+slot+' commit '+JSON.stringify(result));
 };
 const next=(seconds=20)=>{
  a.gameTime+=seconds;a.round++;a.actionLocksV40={};
 };
 const snapshot=()=>{
  const s=a.snapshotV40();assert.equal(checksumV40(s),
   checksumV40(Arena.fromSnapshotV40(map,mask,s).snapshotV40()));
 };
 return {a,u,e,second,ally,cast,next,snapshot};
}
for(const team of ['blue','red'])for(const champ of champs)try{
 const {a,u,e,second,ally,cast,next,snapshot}=setup(champ,team);
 if(champ==='Lucian'){
  // Mark only on diagonal arms of W star, no damage across the whole circle.
  e.x=.53;e.y=.51;second.x=.535;second.y=.5;
  const hp=e.hp,miss=second.hp;
  cast('W',{point:{x:.52,y:.5}});
  assert.ok(e.hp<hp,'diagonal ray should strike target');
  assert.equal(second.hp,miss,'off-axis target must not receive old generic circle hit');
  assert.ok(e.m20MarksV453?.['ardent_'+u.id]>a.gameTime,'mark on actual star hit');
 }else if(champ==='Milio'){
  // One primary ball hit, then a single enemy bounced hit with real slow.
  e.x=.515;second.x=.53;
  const first=e.hp,secondHp=second.hp;
  cast('Q',{point:{x:.56,y:.5}});
  assert.ok(e.hp<first,'ball primary must connect');
  assert.ok(second.hp<secondHp,'ball bounce must hit separate nearby enemy');
  assert.equal(a.effectResolverV41().has(second,'slow'),true);
 }else if(champ==='Vi'){
  // Locked R hits primary and physically knocks a secondary path unit aside.
  e.x=.52;second.x=.509;second.y=.503;
  const prior={x:second.x,y:second.y},hp=second.hp;
  cast('R',{targetId:e.id});
  assert.ok(second.hp<hp,'secondary must receive real path damage');
  assert.notDeepEqual({x:second.x,y:second.y},prior,'secondary must be displaced aside');
  assert.ok(a.effectResolverV41().has(second,'knockup'));
 }else if(champ==='MasterYi'){
  const regular=a.basicAttackIntervalV452c(u);
  cast('R');
  assert.ok(u.m32YiHighlanderUntil>a.gameTime);
  assert.ok(a.basicAttackIntervalV452c(u)<regular);
  u.skillCds.Q=a.gameTime+20;u.skillCds.W=a.gameTime+30;u.skillCds.E=a.gameTime+40;
  e.hp=200;e.maxHp=7000;
  a.damage(e,3000,u,'physical','spell');
  assert.equal(e.hp,0,'lethal actual champion kill required');
  assert.ok(u.skillCds.Q<=a.gameTime+6.01);
  assert.ok(u.skillCds.W<=a.gameTime+9.01);
  assert.ok(u.skillCds.E<=a.gameTime+12.01);
  next(8);assert.equal(a.basicAttackIntervalV452c(u),regular,'Highlander haste must expire');
 }else if(champ==='Seraphine'){
  cast('Q',{point:{x:.52,y:.5}});next();
  cast('E',{point:{x:.52,y:.5}});next();
  const before=ally.hp;cast('W');
  const shields=a.effectResolverV41().list(ally).filter(v=>v.type==='shield');
  assert.ok(shields.length>=2,'third-cast Echo W must produce a second unique shield');
  assert.ok(ally.hp>before,'echo W heals nearby ally');
  assert.equal(u.m25SeraphineSpells,0);
 }
 snapshot();passed++;
}catch(err){fails.push({team,champ,error:String(err.stack||err)})}
for(const f of fails)console.error('M32_FIVE_IDENTITY_FAIL',JSON.stringify(f));
console.log('M32_FIVE_IDENTITY_QA '+JSON.stringify({champions:5,seats:2,passed,failed:fails.length,certifiedChampions:0}));
assert.equal(fails.length,0);assert.equal(passed,10);
