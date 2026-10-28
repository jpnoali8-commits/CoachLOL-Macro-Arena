/** Dev69 M2: temporal skills in three OTHER champions (Ahri, Jinx, Lux).
 * Direct contract tests in blue and red teams, preserving Nami/Vex integrations.
 * Patch: 26.21; Ahri/Jinx/Lux kits remain PARTIAL, never "certified".
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,kitSpellV42} from '../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
let passed=0;function test(name,fn){fn();passed++;console.log('✓ DEV69 M2 '+name);}
const make=(champ,team)=>{
 const rival=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:6922,roundSeconds:10,draft:{[team]:{MID:champ}}});
 for(const w of a.units)Object.assign(w,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(w=>w.id===team+'_MID'),ally=a.units.find(w=>w.id===team+'_TOP'),enemy=a.units.find(w=>w.id===rival+'_MID');
 Object.assign(u,{x:.5,y:.5,champ,mana:500,maxMana:500,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(ally,{x:.53,y:.5,hp:1000,maxHp:1000});
 Object.assign(enemy,{x:.532,y:.5,hp:2000,maxHp:2000,armor:0,mr:0,shield:0});
 a.visible=()=>true;
 return {a,u,ally,enemy,team,rival};
};
for(const team of ['blue','red']){
 const a=make('Ahri',team),qRule=kitSpellV42('Ahri','Q');
 test(team+' Ahri Q registry has outbound magic and returning true damage',()=>{
  assert.equal(qRule.kind,'line_return');assert.equal(qRule.range,970);
  assert.equal(qRule.mana[0],55);
 });
 const invalid=a.a.launchChampionDirectionalV453Dev69M2(a.u,'Q',{x:.5,y:.5});
 test(team+' invalid Ahri Q direction costs no mana or cooldown',()=>{
  assert.equal(invalid.ok,false);assert.equal(a.u.mana,500);assert.equal(a.u.skillCds.Q,0);
 });
 const q=a.a.launchChampionDirectionalV453Dev69M2(a.u,'Q',{x:.8,y:.5});
 test(team+' Ahri Q is in-flight after one cost, no instant hit',()=>{
  assert.ok(q.ok&&q.pending);assert.equal(a.u.mana,445);
  assert.equal(a.enemy.hp,2000);assert.equal(a.a.championProjectilesV453Dev42[0].kind,'ahri_q_out');
 });
 a.a.gameTime=.33;a.a.advanceChampionProjectilesV453Dev42();
 const first=a.enemy.hp;
 test(team+' Ahri Q outward sweep hits a target exactly once',()=>{
  assert.ok(first<2000);
  assert.deepEqual(a.a.championProjectilesV453Dev42[0].hitIds,[a.enemy.id]);
 });
 a.a.gameTime=.7;a.a.advanceChampionProjectilesV453Dev42();
 test(team+' Ahri Q outbound generates a distinct return flight with no second cost',()=>{
  assert.equal(a.a.championProjectilesV453Dev42[0].kind,'ahri_q_back');
  assert.equal(a.enemy.hp,first);assert.equal(a.u.mana,445);
 });
 const restored=Arena.fromSnapshotV40(map,mask,a.a.snapshotV40());
 test(team+' Ahri return projectile checkpoint is deterministic',()=>assert.equal(checksumV40(a.a.snapshotV40()),checksumV40(restored.snapshotV40())));
 a.a.gameTime=restored.gameTime=1.08;a.a.advanceChampionProjectilesV453Dev42();restored.advanceChampionProjectilesV453Dev42();
 test(team+' Ahri Q return strikes again with true damage, no third hit',()=>{
  assert.ok(a.enemy.hp<first);assert.equal(a.enemy.hp,restored.units.find(w=>w.id===a.enemy.id).hp);
  const hp=a.enemy.hp;a.a.gameTime=1.8;a.a.advanceChampionProjectilesV453Dev42();assert.equal(a.enemy.hp,hp);
 });
 const e=make('Ahri',team);
 const denied=e.a.queueDirectionalSkill(e.rival,e.u.id,'E',{x:.9,y:.5});
 test(team+' PvP ownership cannot queue foreign Ahri Charm',()=>assert.equal(denied.ok,false));
 const queued=e.a.queueKitSkillV42(team,e.u.id,'E',{x:.9,y:.5});
 test(team+' kit input routes Ahri Charm through temporal combat',()=>{
  assert.equal(queued.ok,true);assert.equal(e.u.pendingKitCastV42??null,null);
  assert.equal(e.u.queuedDirectional?.slot,'E');assert.equal(e.u.mana,500);
 });
 e.a.resolveDirectionalSkills();
 e.a.gameTime=.4;e.a.advanceChampionProjectilesV453Dev42();
 test(team+' Ahri E charms first hit with real CC and paid mana',()=>{
  assert.ok(e.enemy.hp<2000);assert.ok(e.a.effectResolverV41().has(e.enemy,'charm'));
  assert.equal(e.u.mana,440);assert.equal(e.a.championProjectilesV453Dev42.length,0);
 });
 const shield=make('Ahri',team);
 shield.a.applyEffectV41(shield.enemy,'spell_shield',{source:shield.enemy,duration:3});
 shield.a.launchChampionDirectionalV453Dev69M2(shield.u,'E',{x:.9,y:.5});
 shield.a.gameTime=.4;shield.a.advanceChampionProjectilesV453Dev42();
 test(team+' Ahri E spell shield blocks damage/charm and consumes once',()=>{
  assert.equal(shield.enemy.hp,2000);
  assert.equal(shield.a.effectResolverV41().has(shield.enemy,'charm'),false);
  assert.equal(shield.a.effectResolverV41().has(shield.enemy,'spell_shield'),false);
 });
 const j=make('Jinx',team);
 test(team+' Jinx W kit routes to new temporal engine, no early charge',()=>{
  assert.equal(j.a.queueKitSkillV42(team,j.u.id,'W',{x:.9,y:.5}).ok,true);
  assert.equal(j.u.queuedDirectional?.slot,'W');assert.equal(j.u.mana,500);
 });
 j.a.resolveDirectionalSkills();j.a.gameTime=.3;j.a.advanceChampionProjectilesV453Dev42();
 test(team+' Jinx W first physical collision slows and reveals for caster team',()=>{
  assert.ok(j.enemy.hp<2000);assert.ok(j.a.effectResolverV41().has(j.enemy,'slow'));
  assert.ok(j.enemy.revealedUntil?.[team]>=2.3);
  assert.equal(j.u.mana,460);assert.equal(j.a.championProjectilesV453Dev42.length,0);
 });
 const intercepted=make('Jinx',team);
 intercepted.a.minions.push({id:'jinx_intercept_'+team,team:intercepted.rival,x:.514,y:.5,
  kind:'melee',lane:'mid',hp:500,maxHp:500,armor:0,mr:0,spawnAt:0});
 intercepted.a.launchChampionDirectionalV453Dev69M2(intercepted.u,'W',{x:.9,y:.5});
 intercepted.a.gameTime=.3;intercepted.a.advanceChampionProjectilesV453Dev42();
 test(team+' Jinx W minion intercept prevents champion hit and has first-contact order',()=>{
  assert.ok(intercepted.a.minions.at(-1).hp<500);assert.equal(intercepted.enemy.hp,2000);
  assert.equal(intercepted.a.championProjectileHistoryV453Dev42.at(-1).reason,'primeira_colisão');
 });
 const barrier=make('Jinx',team);
 barrier.a.projectileBarriersV453Dev43.push({id:'m2_wall',team:barrier.rival,x:.510,y:.5,radius:80,until:3});
 barrier.a.launchChampionDirectionalV453Dev69M2(barrier.u,'W',{x:.9,y:.5});
 barrier.a.gameTime=.3;barrier.a.advanceChampionProjectilesV453Dev42();
 test(team+' Jinx W stops on enemy projectile blocker, not global cast',()=>{
  assert.equal(barrier.enemy.hp,2000);assert.equal(barrier.a.championProjectileHistoryV453Dev42.at(-1).reason,'bloqueio_posicional');
 });
 const passive=make('Lux',team);
 const qCast=passive.a.launchLuxBindingV453Dev68(passive.u,{x:.56,y:.5});
 test(team+' Lux Q launches genuine temporal binding before passive mark',()=>{
  assert.ok(qCast.ok);assert.equal(passive.enemy.luxIlluminationV453Dev69M2??null,null);
 });
 passive.a.gameTime=1.5;passive.a.advanceChampionProjectilesV453Dev42();
 test(team+' Lux Q marks damaged champion with owner-only illumination',()=>{
  assert.equal(passive.enemy.luxIlluminationV453Dev69M2?.ownerId,passive.u.id);
 });
 passive.ally.champ='Lux';const noDamage=passive.a.luxConsumeIlluminationV453Dev69M2(passive.ally,passive.enemy);
 test(team+' other Lux cannot steal or consume first Lux mark',()=>{
  assert.equal(noDamage,0);assert.equal(passive.enemy.luxIlluminationV453Dev69M2.ownerId,passive.u.id);
 });
 const hpPreAA=passive.enemy.hp;
 passive.a.attack(passive.u,passive.enemy,50);
 test(team+' Lux basic AA detonates own passive exactly once',()=>{
  assert.ok(passive.enemy.hp<hpPreAA-50);
  assert.equal(passive.enemy.luxIlluminationV453Dev69M2,null);
  const hp=passive.enemy.hp;passive.a.attack(passive.u,passive.enemy,50);
  assert.ok(Math.abs(hp-passive.enemy.hp-50)<1e-6);
 });
 const area=make('Lux',team);
 assert.equal(area.a.queueKitSkillV42(team,area.u.id,'E',{x:area.enemy.x,y:area.enemy.y}).ok,true);
 area.a.resolveKitSkillsV42();
 assert.ok(area.u.luxZoneV42);
 area.u.luxZoneV42.detonate=true;area.a.resolveKitSkillsV42();
 test(team+' Lux E detonation applies passive only after actual damage',()=>{
  assert.equal(area.enemy.luxIlluminationV453Dev69M2?.ownerId,area.u.id);
 });
 const lux=make('Lux',team);
 const cast=lux.a.queueDirectionalSkill(team,lux.u.id,'W',{x:.9,y:.5});
 test(team+' Lux W queues as owned directional spell',()=>assert.equal(cast.ok,true));
 lux.a.resolveDirectionalSkills();
 test(team+' Lux Prismatic Barrier shields self on launch, not enemy',()=>{
  assert.equal(lux.u.mana,440);assert.ok(lux.a.effectResolverV41().has(lux.u,'shield'));
  assert.equal(lux.a.effectResolverV41().has(lux.enemy,'shield'),false);
 });
 lux.a.gameTime=.32;lux.a.advanceChampionProjectilesV453Dev42();
 test(team+' Lux W outward flight shields ally once',()=>{
  const layers=lux.a.effectResolverV41().list(lux.ally).filter(x=>x.type==='shield');
  assert.equal(layers.length,1);assert.equal(layers[0].power,40);
 });
 lux.a.gameTime=.53;lux.a.advanceChampionProjectilesV453Dev42();
 test(team+' Lux W starts return flight and adds second self layer',()=>{
  assert.equal(lux.a.championProjectilesV453Dev42[0].kind,'lux_w_back');
  assert.equal(lux.a.effectResolverV41().list(lux.u).filter(x=>x.type==='shield').length,2);
 });
 const save=Arena.fromSnapshotV40(map,mask,lux.a.snapshotV40());
 lux.a.gameTime=save.gameTime=.93;lux.a.advanceChampionProjectilesV453Dev42();save.advanceChampionProjectilesV453Dev42();
 test(team+' Lux W return shield stacks twice and survives reconnect checkpoint',()=>{
  assert.equal(lux.a.effectResolverV41().list(lux.ally).filter(x=>x.type==='shield').length,2);
  assert.equal(checksumV40(lux.a.snapshotV40()),checksumV40(save.snapshotV40()));
 });
}
console.log('DEV69 MULTI CHAMPIONS M2 '+passed+'/'+passed+' PASS');
