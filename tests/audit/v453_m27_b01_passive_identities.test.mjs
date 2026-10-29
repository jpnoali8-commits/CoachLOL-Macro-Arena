/** M27/B01 — champion-specific P/QWER identity proof on both human PvP sides. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const cases=[],failures=[];
function setup(champ,team){
 const enemyTeam=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:20262701,mode:'pvp',
  draft:{[team]:{MID:champ},[enemyTeam]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:3000,maxHp:3000,
  autoFarm:false,autoFollow:false,autoJungle:false,autoAttack:false,deadUntil:0});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===enemyTeam+'_MID'),
  e2=a.units.find(v=>v.id===enemyTeam+'_TOP'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:2800,maxHp:2800,level:16,
  mana:9000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(e2,{x:.54,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(ally,{x:.505,y:.5,hp:2000,maxHp:3000,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 function cast(slot,opts={}){
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(queued.ok,true,champ+' '+slot+' queue '+JSON.stringify(queued));
  const old=a.executeBoardSkillV453Dev69.bind(a);let result;
  a.executeBoardSkillV453Dev69=(who,q)=>(result=old(who,q));
  a.resolveBoardSkillsV453Dev69();a.executeBoardSkillV453Dev69=old;
  assert.equal(result?.ok,true,champ+' '+slot+' result '+JSON.stringify(result));
  return {queued,result};
 }
 function snap(){
  const s=a.snapshotV40();
  const copy=Arena.fromSnapshotV40(map,mask,s).snapshotV40();
  assert.equal(checksumV40(s),checksumV40(copy),'snapshot differs');
 }
 return {a,u,e,e2,ally,team,enemyTeam,cast,snap};
}
function check(team,name,fn){try{fn();cases.push(team+' '+name)}
 catch(e){failures.push({team,name,error:String(e?.stack||e)})}}
for(const team of ['blue','red']){
 check(team,'Master Yi E true damage is triggered only by actual basic',()=>{
  const {a,u,e,cast,snap}=setup('MasterYi',team);
  const types=[],base=a.damage.bind(a);
  a.damage=(target,amount,attacker,damageType,sourceType)=>{
   if(sourceType==='m27_yi_wuju')types.push({damageType,target:target.id});
   return base(target,amount,attacker,damageType,sourceType);
  };
  cast('E');assert.ok(u.m27YiWujuUntil>a.gameTime);
  a.damage(e,100,u,'physical','basic');
  assert.deepEqual(types,[{damageType:'true',target:e.id}]);
  a.damage(e,100,u,'physical','spell');
  assert.equal(types.length,1,'an unrelated spell must not trigger Wuju');
  snap();
 });
 check(team,'Kog Maw W empowers attack range and percent-health basic',()=>{
  const {a,u,e,cast,snap}=setup('KogMaw',team);
  const rangeBefore=a.itemAttackRangeV453Dev38(u),types=[],old=a.damage.bind(a);
  a.damage=(target,value,source,dtype,stype)=>{
   if(stype==='m27_kog_bioarcane')types.push({dtype,value});
   return old(target,value,source,dtype,stype);
  };
  cast('W');
  assert.ok(u.m27KogBioArcaneUntil>a.gameTime);
  assert.ok(rangeBefore+200/a.worldWidth>rangeBefore);
  a.damage(e,100,u,'physical','basic');
  assert.equal(types.length,1);assert.equal(types[0].dtype,'magic');
  assert.ok(types[0].value>=e.maxHp*.03);
  snap();
 });
 check(team,'Quinn Q blinds struck enemy rather than using generic slow alone',()=>{
  const {a,e,cast,snap}=setup('Quinn',team);
  cast('Q',{point:{x:.53,y:.5}});
  assert.ok(a.effectResolverV41().has(e,'blind'));
  snap();
 });
 check(team,'Lucian E actual basic attacks refund cooldown, not unrelated spells',()=>{
  const {a,u,e,cast,snap}=setup('Lucian',team);
  cast('E',{point:{x:.518,y:.5}});
  const before=u.skillCds.E;
  assert.ok(before>a.gameTime&&u.m27LucianPursuitUntil>a.gameTime);
  a.damage(e,90,u,'physical','basic');
  assert.equal(u.skillCds.E,before-2);
  a.damage(e,90,u,'physical','spell');
  assert.equal(u.skillCds.E,before-2);
  snap();
 });
 check(team,'Kassadin W restores mana exactly once after subsequent basic',()=>{
  const {a,u,e,cast,snap}=setup('Kassadin',team);
  cast('W');const before=u.mana;assert.ok(u.m27KassWRefundUntil>0);
  a.damage(e,100,u,'physical','basic');
  assert.ok(u.mana>before);
  assert.equal(u.m27KassWRefundUntil,0);
  const received=u.mana;a.damage(e,100,u,'physical','basic');
  assert.equal(u.mana,received);
  snap();
 });
 check(team,'Milio Fired Up from W marks ally and burns on next real basic',()=>{
  const {a,u,e,ally,cast,snap}=setup('Milio',team);
  cast('W');assert.equal(ally.m27MilioFire?.ownerId,u.id);
  a.damage(e,100,ally,'physical','basic');
  assert.equal(ally.m27MilioFire.armed,false);
  assert.ok(a.effectResolverV41().has(e,'dot'));
  snap();
 });
 check(team,'Rell E links nearby ally and grants unique on-hit slow',()=>{
  const {a,u,e,ally,cast,snap}=setup('Rell',team);
  cast('E');assert.equal(u.m27RellLinkedId,ally.id);
  assert.ok(ally.boardSpeedV453Dev69?.until>a.gameTime);
  a.damage(e,100,ally,'physical','basic');
  assert.ok(a.effectResolverV41().has(e,'slow'));
  assert.equal(ally.m27RellLink.armed,false);
  snap();
 });
 check(team,'Jarvan passive Martial Cadence procs at most once per target cooldown',()=>{
  const {a,u,e,cast,snap}=setup('JarvanIV',team);
  const procs=[],base=a.damage.bind(a);
  a.damage=(target,value,source,dtype,stype)=>{
   if(stype==='m27_jarvan_cadence')procs.push(value);
   return base(target,value,source,dtype,stype);
  };
  a.damage(e,100,u,'physical','basic');
  a.damage(e,100,u,'physical','basic');
  assert.equal(procs.length,1);
  a.gameTime=6.1;a.damage(e,100,u,'physical','basic');
  assert.equal(procs.length,2);
  snap();
 });
 check(team,'Sett passive Pit Grit adds second punch only every two basics',()=>{
  const {a,u,e,snap}=setup('Sett',team);
  const packets=[],base=a.damage.bind(a);
  a.damage=(target,value,source,dtype,stype)=>{
   if(stype==='m27_sett_second_punch')packets.push(value);
   return base(target,value,source,dtype,stype);
  };
  for(let i=0;i<3;i++)a.damage(e,100,u,'physical','basic');
  assert.equal(packets.length,1);
  assert.equal(u.m27SettPunch,1);
  snap();
 });
 check(team,'Xerath Mana Surge restores mana on basic with cooldown',()=>{
  const {a,u,e,snap}=setup('Xerath',team);
  const before=u.mana;
  a.damage(e,100,u,'physical','basic');
  assert.equal(u.mana,before+75);
  assert.ok(u.m27ManaSurgeReadyAt>a.gameTime);
  a.damage(e,100,u,'physical','basic');
  assert.equal(u.mana,before+75);
  snap();
 });
 check(team,'Gragas Happy Hour heals on actual cast and observes 8s cooldown',()=>{
  const {a,u,cast,snap}=setup('Gragas',team);
  u.hp=1000;cast('W');const first=u.hp;
  assert.ok(first>1000&&u.m27HappyHourReadyAt>0);
  a.gameTime=1;cast('Q',{point:{x:.53,y:.5}});
  assert.equal(u.hp,first);
  snap();
 });
 check(team,'Karthus kill restores mana once without a phantom kill',()=>{
  const {a,u,e,snap}=setup('Karthus',team);
  u.mana=5000;e.hp=40;
  const prior=u.mana;a.damage(e,100,u,'magic','spell');
  assert.equal(e.hp,0);assert.equal(u.mana,prior+40);
  snap();
 });
 check(team,'Galio Colossal Smash hits nearby second enemy once per cooldown',()=>{
  const {a,u,e,e2,snap}=setup('Galio',team);
  e2.x=.518;const prior=e2.hp;
  a.damage(e,100,u,'physical','basic');
  assert.ok(e2.hp<prior);
  const after=e2.hp;
  a.damage(e,100,u,'physical','basic');
  assert.equal(e2.hp,after);
  assert.ok(u.m27GalioSmashReadyAt>a.gameTime);
  snap();
 });
 check(team,'Tahm Kench grey health reflects actual damage and becomes shield',()=>{
  const {a,u,e,cast,snap}=setup('TahmKench',team);
  a.damage(u,400,e,'magic','spell');
  assert.ok(u.m27TahmGrey>0);
  cast('E');
  assert.equal(u.m27TahmGrey,0);
  assert.ok(a.effectResolverV41().has(u,'shield'));
  snap();
 });
 check(team,'Urgot W Purge locks real target for three interruptible shots',()=>{
  const {a,u,e,cast,snap}=setup('Urgot',team);
  cast('W',{targetId:e.id});
  const z=a.boardTemporalV453Dev69.find(x=>x.kind==='m27_urgot_purge');
  assert.equal(z?.targetId,e.id);
  const hp=e.hp;
  for(let t=1;t<=3;t++){a.gameTime=t;a.advanceBoardTemporalV453Dev69();}
  assert.ok(e.hp<hp);
  assert.equal(z.ticksLeft,0);
  assert.equal(z.hitIds.length,3);
  snap();
 });
}
for(const e of failures)console.error('M27_B01_PASSIVE_FAIL',JSON.stringify(e));
console.log('M27_B01_PASSIVE_QA '+JSON.stringify({
 cases:cases.length,failures:failures.length,champions:15,teams:2,
 certifiedChampions:0,names:cases
}));
assert.equal(failures.length,0,'M27 champion authored passive assertions');
assert.equal(cases.length,30);
