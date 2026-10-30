/** Dev69 M5: Jinx five-slot PvP contract, rank mechanics, AA/rocket/traps. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,kitSpellV42} from '../engine.mjs';
const get=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=get('coachlol_map_v6.json'),mask=get('masks_128.json');
let passed=0;function test(name,fn){fn();passed++;console.log('✓ M5 '+name);}
function setup(team){
 const other=team==='blue'?'red':'blue',a=new Arena(map,mask,{seed:6955,roundSeconds:10,draft:{[team]:{MID:'Jinx'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFarm:false,autoFollow:false,autoJungle:false});
 const j=a.units.find(v=>v.id===team+'_MID'),foe=a.units.find(v=>v.id===other+'_MID'),
  foe2=a.units.find(v=>v.id===other+'_TOP'),ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(j,{x:.5,y:.5,champ:'Jinx',mana:500,maxMana:500,skillRanks:{Q:1,W:1,E:1,R:1},
  skillCds:{Q:0,W:0,E:0,R:0},ap:0});
 Object.assign(foe,{x:.54,y:.5,hp:2000,maxHp:2000,mr:0,armor:0,shield:0});
 Object.assign(foe2,{x:.545,y:.51,hp:2000,maxHp:2000,mr:0,armor:0,shield:0});
 Object.assign(ally,{x:.53,y:.52});
 a.visible=()=>true;
 return {a,j,foe,foe2,ally,team,other};
}
test('Jinx Q/E/R are no longer data-only; all five kit slots have rules',()=>{
 assert.equal(kitSpellV42('Jinx','Q').kind,'self_toggle');
 assert.equal(kitSpellV42('Jinx','W').kind,'line_projectile');
 assert.equal(kitSpellV42('Jinx','E').kind,'ground_traps');
 assert.equal(kitSpellV42('Jinx','R').kind,'line_global');
 assert.deepEqual(kitSpellV42('Jinx','E').damage,[90,140,190,240,290]);
 assert.deepEqual(kitSpellV42('Jinx','R').damage,[200,350,500]);
});
for(const team of ['blue','red']){
 const x=setup(team),{a,j,foe,foe2,other}=x;
 test(team+' enemy owner cannot toggle Jinx Q or issue R',()=>{
  assert.equal(a.queueKitSkillV42(other,j.id,'Q',{x:.5,y:.5}).ok,false);
  assert.equal(a.queueDirectionalSkill(other,j.id,'R',{x:.9,y:.5}).ok,false);
 });
 const baseRange=a.itemAttackRangeV453Dev38(j),before=j.mana;
 test(team+' Q toggle authorized and only queued until executor',()=>{
  assert.equal(a.queueKitSkillV42(team,j.id,'Q',{x:.5,y:.5}).ok,true);
  assert.equal(j.jinxRocketModeV453Dev69M5??false,false);
  assert.equal(j.mana,before);
 });
 a.resolveKitSkillsV42();
 test(team+' Q Switcheroo rocket mode commits once, extends AA range',()=>{
  assert.equal(j.jinxRocketModeV453Dev69M5,true);
  assert.equal(j.mana,before);
  assert.ok(a.itemAttackRangeV453Dev38(j)>baseRange);
  assert.ok(j.skillCds.Q>a.gameTime);
 });
 const target=foe,pre=foe.hp;
 a.attack(j,target,60);
 test(team+' Fishbones basic costs 20 mana and deals physical damage',()=>{
  assert.equal(j.mana,before-20);
  assert.ok(foe.hp<pre-60);
  assert.ok(foe2.hp<2000);
 });
 const copied=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 test(team+' weapon toggle and attack snapshot survives checkpoint',()=>{
  assert.equal(checksumV40(a.snapshotV40()),checksumV40(copied.snapshotV40()));
 });
 a.gameTime=1;
 assert.equal(a.queueKitSkillV42(team,j.id,'Q',{x:.5,y:.5}).ok,true);
 a.resolveKitSkillsV42();
 test(team+' Jinx Q/P stats produce real attack interval changes',()=>{
  const normal=setup(team);
  const base=normal.a.basicAttackIntervalV452c(normal.j);
  normal.j.jinxPowPowStacksV453Dev69M5=3;normal.j.jinxPowPowUntilV453Dev69M5=5;
  assert.ok(normal.a.basicAttackIntervalV452c(normal.j)<base);
  normal.j.jinxExcitedV453Dev69M5={at:0,until:6,stacks:3};
  assert.ok(normal.a.basicAttackIntervalV452c(normal.j)<base);
  normal.a.gameTime=7;assert.equal(normal.a.basicAttackIntervalV452c(normal.j),base);
 });
 test(team+' Pow-Pow restores baseline range without paying mana',()=>{
  assert.equal(j.jinxRocketModeV453Dev69M5,false);
  assert.equal(a.itemAttackRangeV453Dev38(j),baseRange);
  const old=j.mana;a.attack(j,foe,50);assert.equal(j.mana,old);
  assert.equal(j.jinxPowPowStacksV453Dev69M5,1);
 });
 const traps=setup(team),t=traps;
 const loc={x:.54,y:.5};
 const queued=t.a.queueKitSkillV42(team,t.j.id,'E',loc);
 test(team+' Chompers queue costs no resources until server executes',()=>{
  assert.equal(queued.ok,true);assert.equal(t.j.mana,500);
 });
 t.a.resolveKitSkillsV42();
 test(team+' E spawns 3 serialized traps and costs exactly 90 mana',()=>{
  assert.equal(t.j.mana,410);
  assert.equal(t.a.jinxChompersV453Dev69M5[0].centers.length,3);
  assert.equal(t.foe.hp,2000);
 });
 t.a.gameTime=.5;t.a.advanceJinxChompersV453Dev69M5();
 test(team+' E cannot root before arming at .9 sec and gives team sight on landing',()=>{
  assert.equal(t.foe.hp,2000);assert.equal(t.a.effectResolverV41().has(t.foe,'root'),false);
  assert.ok(t.a.visionSources(team).some(v=>v.kind==='jinx_e'));
  assert.equal(t.a.visionSources(other).some(v=>v.kind==='jinx_e'),false);
 });
 const save=Arena.fromSnapshotV40(map,mask,t.a.snapshotV40());
 t.a.gameTime=save.gameTime=1;t.a.advanceJinxChompersV453Dev69M5();save.advanceJinxChompersV453Dev69M5();
 test(team+' E arms, roots and damages enemy, preserving checkpoint determinism',()=>{
  assert.ok(t.foe.hp<2000);
  assert.ok(t.a.effectResolverV41().has(t.foe,'root'));
  assert.equal(checksumV40(t.a.snapshotV40()),checksumV40(save.snapshotV40()));
 });
 const hp=t.foe.hp;t.a.gameTime=1.5;t.a.advanceJinxChompersV453Dev69M5();
 test(team+' one cast of 3 traps cannot damage same champion twice',()=>assert.equal(t.foe.hp,hp));
 const r=setup(team);
 test(team+' R direction zero is free and does not spawn rocket',()=>{
  assert.equal(r.a.launchJinxRocketV453Dev69M5(r.j,{x:r.j.x,y:r.j.y}).ok,false);
  assert.equal(r.j.mana,500);
 });
 assert.equal(r.a.queueDirectionalSkill(team,r.j.id,'R',{x:.9,y:.5}).ok,true);
 r.a.resolveDirectionalSkills();
 test(team+' R launches global projectile with 1 cooldown/mana cost but no instant damage',()=>{
  assert.equal(r.j.mana,400);assert.equal(r.foe.hp,2000);
  assert.equal(r.a.championProjectilesV453Dev42[0]?.kind,'jinx_r');
 });
 r.a.gameTime=.6;r.a.advanceChampionProjectilesV453Dev42();
 test(team+' global R ignores minions and explodes on first champion',()=>{
  assert.ok(r.foe.hp<2000);
  assert.ok(r.a.championProjectileHistoryV453Dev42.at(-1)?.hitId===r.foe.id);
  assert.equal(r.a.championProjectilesV453Dev42.length,0);
 });
 const hit=r.foe.hp;r.a.gameTime=1.8;r.a.advanceChampionProjectilesV453Dev42();
 test(team+' global R explosion never repeats after impact',()=>assert.equal(r.foe.hp,hit));
 const blocked=setup(team);
 blocked.a.projectileBarriersV453Dev43.push({id:'wall',x:.515,y:.5,team:blocked.other,radius:120,until:3});
 assert.equal(blocked.a.launchJinxRocketV453Dev69M5(blocked.j,{x:.9,y:.5}).ok,true);
 blocked.a.gameTime=.5;blocked.a.advanceChampionProjectilesV453Dev42();
 test(team+' R respects projectile wind wall while leaving enemy unharmed',()=>{
  assert.equal(blocked.foe.hp,2000);
  assert.equal(blocked.a.championProjectilesV453Dev42.length,0);
 });
 const excited=setup(team),initial=excited.a.effectiveMS(excited.j);
 excited.a.jinxExcitedV453Dev69M5(excited.j,{champion:true});
 test(team+' Get Excited grants real movement speed and 25% per champion takedown',()=>{
  assert.ok(excited.a.effectiveMS(excited.j)>initial);
  assert.equal(excited.j.jinxExcitedV453Dev69M5.stacks,1);
 });
 for(let i=0;i<7;i++)excited.a.jinxExcitedV453Dev69M5(excited.j,{champion:true});
 test(team+' Get Excited champion stacks cap at 5, then expire',()=>{
  assert.equal(excited.j.jinxExcitedV453Dev69M5.stacks,5);
  excited.a.gameTime=7;assert.equal(excited.a.effectiveMS(excited.j),initial);
 });
}
console.log('DEV69 MULTI CHAMPIONS M5 '+passed+'/'+passed+' PASS');
