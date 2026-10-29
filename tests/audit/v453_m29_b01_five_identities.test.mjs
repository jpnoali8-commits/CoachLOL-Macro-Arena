/** M29 B01: five more champion authored identities, two player seats and V40 determinism. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const names=['Lulu','JarvanIV','Kassadin','Shen','Zac'];
let passed=0;const failures=[];
for(const champ of names)for(const team of ['blue','red'])try{
 const foe=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:290013,mode:'pvp',
  draft:{[team]:{MID:champ},[foe]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:4000,maxHp:4000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  enemy=a.units.find(v=>v.id===foe+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:4000,maxHp:4000,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:.517,y:.5,hp:6500,maxHp:6500,armor:0,mr:0});
 Object.assign(ally,{x:.512,y:.5,hp:4000,maxHp:4000});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,options={})=>{
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,options);
  assert.equal(q.ok,true,champ+' '+slot+': '+JSON.stringify(q));
  a.resolveBoardSkillsV453Dev69();
 };
 const step=(seconds=1)=>{a.gameTime+=seconds;a.round++;a.actionLocksV40={};};
 if(champ==='Lulu'){
  const prior=a.basicAttackIntervalV452c(ally);
  cast('W',{targetId:ally.id});
  assert.ok(ally.m29LuluWhimsyUntil>a.gameTime);
  assert.ok(a.basicAttackIntervalV452c(ally)<prior,'Whimsy reduces board AA interval');
  step(5);
  assert.equal(a.basicAttackIntervalV452c(ally),prior,'temporary haste expires');
 }else if(champ==='JarvanIV'){
  const prior=a.basicAttackIntervalV452c(ally);
  cast('E',{point:{x:.515,y:.5}});
  assert.equal(a.boardSummonsV453Dev69.some(v=>v.kind==='jarvan_flag'&&v.ownerId===u.id),true);
  assert.ok(a.basicAttackIntervalV452c(ally)<prior,'Demacian Standard buffs allied attacks near flag');
  ally.x=.85;
  assert.equal(a.basicAttackIntervalV452c(ally),prior,'flag aura has distance gate');
 }else if(champ==='Kassadin'){
  cast('Q',{targetId:enemy.id});step();
  cast('W');step();
  cast('R',{point:{x:.506,y:.5}});step();
  u.skillCds.Q=0;cast('Q',{targetId:enemy.id});step();
  assert.ok(u.m29KassPulseStacks>=4,'real spell casts must build Force Pulse resource');
  cast('E',{point:{x:.54,y:.5}});
  assert.equal(u.m29KassPulseStacks,0,'E consumes Force Pulse charges');
  assert.equal(a.effectResolverV41().has(enemy,'root'),true,'charged Force Pulse roots its real hit');
 }else if(champ==='Shen'){
  cast('E',{point:{x:.535,y:.5}});
  assert.equal(u.m29ShenBladePoint?.x,.5,'Spirit Blade remains at dash origin');
  step();cast('Q');
  assert.equal(a.effectResolverV41().has(enemy,'slow'),true,'returning blade slows crossed enemy');
  assert.ok(u.boardNextBasicV453Dev69?.base>=135,'crossed Spirit Blade empowers Shen Q attacks');
 }else if(champ==='Zac'){
  const dest={x:.55,y:.5},hp=enemy.hp;
  const denied=a.queueBoardSkillV453Dev69(team,u.id,'E',{point:dest,chargeSeconds:0});
  assert.equal(denied.ok,false,'uncharged Elastic Slingshot cannot travel 750 world units');
  assert.equal(denied.reason,'m29_zac_charge_range');
  assert.equal(u.skillCds.E,0,'denial may not commit cooldown');
  enemy.x=.55;cast('E',{point:dest,chargeSeconds:2});
  assert.equal(u.x,dest.x,'fully charged E moves Zac to destination');
  assert.ok(enemy.hp<hp,'fully charged E hits the opponent');
 }
 const snap=a.snapshotV40(),again=Arena.fromSnapshotV40(map,mask,snap).snapshotV40();
 assert.equal(checksumV40(snap),checksumV40(again),'board snapshot replay');
 passed++;
}catch(err){failures.push({champ,team,error:String(err?.stack||err)})}
for(const x of failures)console.error('M29_FIVE_FAIL',JSON.stringify(x));
console.log('M29_FIVE_AUTHORED_QA '+JSON.stringify({champions:names.length,seats:2,
 passed,failed:failures.length,certifiedChampions:0}));
assert.equal(failures.length,0);assert.equal(passed,names.length*2);
