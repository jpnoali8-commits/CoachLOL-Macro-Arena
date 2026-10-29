/** M17: real board entity collision in delayed projectiles, Jhin R and typed traps.
 *  Test first, before implementation. Neither clones nor summons add a champion.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const file=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=file('coachlol_map_v6.json'),mask=file('masks_128.json');
const teams=['blue','red'];
let total=0;
const check=(label,fn)=>{fn();total++;console.log('M17_PASS '+label)};
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:69172,mode:'pvp',draft:{[team]:{MID:champ},[other]:{MID:'Shaco'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,
  autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),owner=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{champ,x:.5,y:.5,level:16,mana:10000,maxMana:10000,hp:2000,maxHp:2000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(owner,{champ:'Shaco',x:.565,y:.5,level:6,hp:2000,maxHp:2000,
  mana:1000,maxMana:1000,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 a.visible=()=>true;a.canSeePoint=()=>true;
 a.gameTime=1;
 const clone=a.m15Summon('shaco_clone',owner,{x:.528,y:.5},{
  hp:1200,maxHp:1200,stealthUntil:0,until:18,damageTakenMultiplier:1.5,
  explosionPower:100,appearance:{kind:'champion',champ:'Shaco'}});
 assert.equal(a.units.length,10);
 assert.ok(a.perspective(team).units.some(v=>v.id===clone.publicId));
 return {a,u,clone,owner,other};
}
for(const team of teams){
 check(team+' Jhin R collision prioritizes clone and consumes a single shot',()=>{
  const t=fixture('Jhin',team);
  assert.equal(t.a.queueKitSkillV42(team,t.u.id,'R',null).ok,true);
  t.a.resolveBoardSkillsV453Dev69();
  const mana=t.u.mana,cd=t.u.skillCds.R,cloneHp=t.clone.hp,ownerHp=t.owner.hp;
  t.a.gameTime=2.1;
  assert.equal(t.a.queueKitSkillV42(team,t.u.id,'R',{x:.6,y:.5}).ok,true);
  t.a.resolveBoardSkillsV453Dev69();
  assert.ok(t.clone.hp<cloneHp,'Jhin R must collide with the nearest visible decoy');
  assert.equal(t.owner.hp,ownerHp,'a clone intercepted the first shot');
  assert.equal(t.u.mana,mana);assert.equal(t.u.skillCds.R,cd);
  assert.equal(t.u.m16JhinChannel.remaining,3);
  const hp=t.clone.hp;t.a.resolveBoardSkillsV453Dev69();
  assert.equal(t.clone.hp,hp,'same tick cannot duplicate Jhin R shot');
  const snap=t.a.snapshotV40();
  assert.equal(checksumV40(snap),checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
 });
 check(team+' Lux Q swept projectile hits a decoy and only roots real champions',()=>{
  const t=fixture('Lux',team);
  t.clone.x=.532;
  const q=t.a.launchLuxBindingV453Dev68(t.u,{x:.54,y:.5});
  assert.equal(q.ok,true,q.reason);
  const before=t.clone.hp;
  t.a.gameTime=2.0;t.a.advanceChampionProjectilesV453Dev42();
  assert.ok(t.clone.hp<before,'delayed projectile ignores the visible clone');
  assert.ok(!t.a.effectResolverV41().has(t.clone,'root'),'no unsupported movement-CC on clone');
  assert.ok(t.a.championProjectilesV453Dev42.some(p=>p.hitIds?.includes(t.clone.id))||
   t.a.championProjectileHistoryV453Dev42?.some(p=>p.hitIds?.includes(t.clone.id)),
   'one hit must be ledgered on the server');
 });
 for(const kind of ['teemo_mushroom','maokai_sapling','jhin_lotus','nidalee_bushwhack']){
  check(team+' '+kind+' trigger and damage clone on the correct simulation tick',()=>{
   const champ={teemo_mushroom:'Teemo',maokai_sapling:'Maokai',
    jhin_lotus:'Jhin',nidalee_bushwhack:'Nidalee'}[kind];
   const t=fixture(champ,team);
   const trap=t.a.m16TrapCreate(t.u,kind,{x:t.clone.x,y:t.clone.y});
   assert.ok(trap);
   const start=t.clone.hp;
   t.a.gameTime=2.2;
   t.a.advanceMechanicsV453M16();
   if(kind==='jhin_lotus'){
    assert.ok(trap.explodeAt>t.a.gameTime,'lotus detonation must be delayed');
    assert.equal(t.clone.hp,start,'delayed lotus does not damage on trigger');
    t.a.gameTime=trap.explodeAt+.01;
    t.a.advanceMechanicsV453M16();
   }else if(['teemo_mushroom','nidalee_bushwhack'].includes(kind)){
    assert.ok(t.clone.statusEffectsV41?.some(e=>e.type==='dot'),
     'clone should receive a dot state');
    t.a.gameTime=3.25;
    t.a.effectResolverV41().advanceTick();
   }
   assert.ok(t.clone.hp<start,'trap did not affect clone: '+kind);
   assert.equal(t.a.units.length,10);
  });
 }
 check(team+' invisible or expired clones do not block projectiles or trigger traps',()=>{
  const t=fixture('Lux',team);
  t.clone.stealthUntil=5;
  const q=t.a.launchLuxBindingV453Dev68(t.u,{x:.54,y:.5});
  assert.ok(q.ok);const hp=t.clone.hp;
  t.a.gameTime=2;t.a.advanceChampionProjectilesV453Dev42();
  assert.equal(t.clone.hp,hp);
  t.clone.until=2;
  const trap=t.a.m16TrapCreate(t.u,'maokai_sapling',{x:t.clone.x,y:t.clone.y});
  assert.ok(trap);
  t.a.gameTime=3.1;t.a.advanceMechanicsV453M16();
  assert.equal(t.clone.hp,hp);
 });
}
console.log('M17_ENTITY_INTERACTIONS '+total+'/'+total+' PASS');
