import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Arena,abilityRule,checksumV40} from '../engine.mjs';
const data=n=>JSON.parse(fs.readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const make=(champ='Ezreal')=>{
 const a=new Arena(map,mask,{seed:43,roundSeconds:10,draft:{blue:{ADC:'Ezreal',TOP:'Irelia'}}});
 const u=a.units.find(x=>x.team==='blue'&&x.champ===champ),v=a.units.find(x=>x.id==='red_MID');
 Object.assign(u,{x:.5,y:.5,hp:500,maxHp:1000,items:['recurve_bow'],mana:400,maxMana:400,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0},ad:100,ap:0});
 Object.assign(v,{x:.532,y:.5,hp:1200,maxHp:1200,shield:0,armor:0,mr:0,projectileGuardUntil:0});
 a.visible=()=>true;return {a,u,v};
};
let count=0;const test=(description,fn)=>{fn();count++;console.log('✓ DEV43 '+description)};
test('Ezreal Q advances only 400 units after 0.2 s, not 1200 units',()=>{
 const {a,u,v}=make();a.castChampionOnHitV453Dev41(u,'Q',v);a.gameTime=.2;a.advanceChampionProjectilesV453Dev42();
 assert.equal(a.championProjectilesV453Dev42[0].traveledV453Dev43,400);assert.equal(v.hp,1200);
 a.gameTime=.25;a.advanceChampionProjectilesV453Dev42();assert.equal(v.hp,1035);assert.equal(a.championProjectilesV453Dev42.length,0);
});
test('no retroactive hit in already traversed section',()=>{
 const {a,u,v}=make();a.castChampionOnHitV453Dev41(u,'Q',v);v.y=.53;a.gameTime=.25;a.advanceChampionProjectilesV453Dev42();
 v.x=.518;v.y=.5;a.gameTime=.5;a.advanceChampionProjectilesV453Dev42();assert.equal(v.hp,1200);
 assert.equal(a.championProjectilesV453Dev42[0].traveledV453Dev43,1000);
 a.gameTime=.7;a.advanceChampionProjectilesV453Dev42();assert.equal(v.hp,1200);
 assert.equal(a.championProjectileHistoryV453Dev42.at(-1).reason,'sem_alvo');
});
test('enemy minion enters upcoming segment while projectile is in flight',()=>{
 const {a,u,v}=make();
 const m={id:'dev43intercept',kind:'caster',team:'red',x:.54,y:.53,hp:400,maxHp:400,armor:0,mr:0,spawnAt:0,lane:'mid'};
 a.minions.push(m);a.castChampionOnHitV453Dev41(u,'Q',v);v.y=.53;
 a.gameTime=.15;a.advanceChampionProjectilesV453Dev42();m.x=.526;m.y=.5;
 a.gameTime=.25;a.advanceChampionProjectilesV453Dev42();assert.equal(m.hp,235);assert.equal(a.championProjectileHistoryV453Dev42.at(-1).hitId,m.id);
});
test('positional enemy barrier intercepts swept ray, allied barrier does not',()=>{
 const {a,u,v}=make();a.projectileBarriersV453Dev43.push({id:'wall',team:'red',x:.515,y:.5,radius:70,until:2});
 a.castChampionOnHitV453Dev41(u,'Q',v);a.gameTime=.2;a.advanceChampionProjectilesV453Dev42();
 assert.equal(v.hp,1200);assert.equal(a.championProjectileHistoryV453Dev42.at(-1).reason,'bloqueio_posicional');
 const q=make();q.a.projectileBarriersV453Dev43.push({id:'ally',team:'blue',x:.515,y:.5,radius:70,until:2});
 q.a.castChampionOnHitV453Dev41(q.u,'Q',q.v);q.a.gameTime=.25;q.a.advanceChampionProjectilesV453Dev42();assert.equal(q.v.hp,1035);
});
test('barrier expires before the segment crosses it',()=>{
 const {a,u,v}=make();a.projectileBarriersV453Dev43.push({team:'red',x:.515,y:.5,radius:70,until:.1});
 a.castChampionOnHitV453Dev41(u,'Q',v);a.gameTime=.25;a.advanceChampionProjectilesV453Dev42();assert.equal(v.hp,1035);
});
test('in-flight progress and positional blockers survive snapshot deterministically',()=>{
 const {a,u,v}=make();a.castChampionOnHitV453Dev41(u,'Q',v);v.y=.53;a.projectileBarriersV453Dev43.push({team:'red',x:.55,y:.5,radius:60,until:3});
 a.gameTime=.3;a.advanceChampionProjectilesV453Dev42();const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(checksumV40(a.snapshotV40()),checksumV40(b.snapshotV40()));
 assert.equal(b.championProjectilesV453Dev42[0].traveledV453Dev43,600);
 a.gameTime=1;b.gameTime=1;a.advanceChampionProjectilesV453Dev42();b.advanceChampionProjectilesV453Dev42();
 assert.deepEqual(a.championProjectileHistoryV453Dev42,b.championProjectileHistoryV453Dev42);
});
test('Irelia E uses official individual range, mana and cooldown instead of training fallback',()=>{
 const {u}=make('Irelia');assert.equal(abilityRule(u,'E').range,775);assert.equal(abilityRule(u,'E').mana[0],50);assert.equal(abilityRule(u,'E').cooldown[0],16);
});
test('Irelia E first blade costs 50 mana and cannot mark instantly',()=>{
 const {a,u,v}=make('Irelia');v.x=.51;const first=a.castIreliaFlawlessDuetV453Dev43(u,{x:.496,y:.5});
 assert.ok(first.ok);assert.ok(first.firstBlade);assert.equal(u.mana,350);assert.equal(v.ireliaMarkV453Dev42,null);
 assert.equal(a.ireliaBladesV453Dev43[u.id].second,null);assert.equal(u.skillCds.E,16);
});
test('Irelia E recast before 0.15 seconds fails without placing blade',()=>{
 const {a,u}=make('Irelia');a.castIreliaFlawlessDuetV453Dev43(u,{x:.496,y:.5});const bad=a.castIreliaFlawlessDuetV453Dev43(u,{x:.520,y:.5});
 assert.equal(bad.ok,false);assert.equal(bad.reason,'recast_aguarde');assert.equal(a.ireliaBladesV453Dev43[u.id].second,null);
});
test('two blades converge after travel and stun, damage and mark only within line',()=>{
 const {a,u,v}=make('Irelia');v.x=.51;const off=a.units.find(x=>x.team==='red'&&x!==v);Object.assign(off,{x:.51,y:.53,hp:1200,maxHp:1200});
 a.castIreliaFlawlessDuetV453Dev43(u,{x:.496,y:.5});a.gameTime=.2;const e=a.castIreliaFlawlessDuetV453Dev43(u,{x:.525,y:.5});
 assert.ok(e.ok&&e.recast);assert.equal(u.mana,350);assert.equal(v.hp,1200);
 a.gameTime=.4;a.advanceIreliaBladesV453Dev43();assert.equal(v.hp,1200);
 a.gameTime=.5;a.advanceIreliaBladesV453Dev43();assert.equal(v.hp,1130);assert.ok(v.stunUntil>a.gameTime);
 assert.equal(v.ireliaMarkV453Dev42?.ownerId,u.id);assert.equal(off.ireliaMarkV453Dev42,null);
 assert.equal(a.ireliaBladeHistoryV453Dev43.at(-1).hitIds.includes(v.id),true);
});
test('Irelia Q can consume only an actual E convergence mark and reset cooldown',()=>{
 const {a,u,v}=make('Irelia');v.x=.51;a.castIreliaFlawlessDuetV453Dev43(u,{x:.496,y:.5});a.gameTime=.2;a.castIreliaFlawlessDuetV453Dev43(u,{x:.525,y:.5});
 a.gameTime=.5;a.advanceIreliaBladesV453Dev43();assert.ok(v.ireliaMarkV453Dev42);
 const q=a.castChampionOnHitV453Dev41(u,'Q',v);assert.ok(q.ok);assert.equal(v.ireliaMarkV453Dev42,null);assert.equal(u.skillCds.Q,.7);
});
test('spell shield blocks E and prevents mark and damage on that enemy',()=>{
 const {a,u,v}=make('Irelia');v.x=.51;a.applyEffectV41(v,'spell_shield',{source:v,duration:4});
 a.castIreliaFlawlessDuetV453Dev43(u,{x:.496,y:.5});a.gameTime=.2;a.castIreliaFlawlessDuetV453Dev43(u,{x:.525,y:.5});
 a.gameTime=.5;a.advanceIreliaBladesV453Dev43();assert.equal(v.hp,1200);assert.equal(v.ireliaMarkV453Dev42,null);
 assert.equal(a.effectResolverV41().has(v,'spell_shield'),false);
});
test('Irelia E auto recast at 3.5s without manual second placement',()=>{
 const {a,u,v}=make('Irelia');v.x=.51;a.castIreliaFlawlessDuetV453Dev43(u,{x:.525,y:.5});
 a.gameTime=3.5;a.advanceIreliaBladesV453Dev43();assert.equal(a.ireliaBladesV453Dev43[u.id].second.x,u.x);
 a.gameTime=4;a.advanceIreliaBladesV453Dev43();assert.equal(v.ireliaMarkV453Dev42?.source,'E');
});
test('E rejects out of range without costing mana and recast snapshots restore',()=>{
 const {a,u}=make('Irelia');const invalid=a.castIreliaFlawlessDuetV453Dev43(u,{x:.8,y:.5});
 assert.equal(invalid.ok,false);assert.equal(u.mana,400);
 a.castIreliaFlawlessDuetV453Dev43(u,{x:.496,y:.5});a.gameTime=.2;a.castIreliaFlawlessDuetV453Dev43(u,{x:.525,y:.5});
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());assert.equal(checksumV40(b.snapshotV40()),checksumV40(a.snapshotV40()));
 a.gameTime=.5;b.gameTime=.5;a.advanceIreliaBladesV453Dev43();b.advanceIreliaBladesV453Dev43();
 assert.deepEqual(a.ireliaBladeHistoryV453Dev43,b.ireliaBladeHistoryV453Dev43);
});
test('Irelia E first cast is prevented by stun with no resources spent',()=>{
 const {a,u}=make('Irelia');a.applyEffectV41(u,'stun',{source:a.units.find(x=>x.team==='red'),duration:2});
 const e=a.castIreliaFlawlessDuetV453Dev43(u,{x:.496,y:.5});assert.equal(e.ok,false);assert.equal(u.mana,400);
});
test('Node and browser have both new methods and explicit E rule',()=>{
 const b=fs.readFileSync(new URL('../engine.browser.js',import.meta.url),'utf8');
 assert.ok(b.includes('castIreliaFlawlessDuetV453Dev43('));assert.ok(b.includes('advanceIreliaBladesV453Dev43('));
 assert.ok(b.includes('traveledV453Dev43'));
});
test('Irelia E can be queued through planning interface without replacing directional kit',()=>{
 const {a,u,v}=make('Irelia');v.x=.51;a.phase='preparation';
 const first=a.queueDirectionalSkill('blue',u.id,'E',{x:.496,y:.5});assert.ok(first.ok);
 a.resolveDirectionalSkills();assert.ok(a.ireliaBladesV453Dev43[u.id]);assert.equal(u.mana,350);
 a.gameTime=.2;
 const second=a.queueDirectionalSkill('blue',u.id,'E',{x:.525,y:.5});assert.ok(second.ok);
 a.resolveDirectionalSkills();assert.ok(a.ireliaBladesV453Dev43[u.id].second);
 a.gameTime=.5;a.advanceIreliaBladesV453Dev43();assert.equal(v.ireliaMarkV453Dev42?.source,'E');
});
test('Irelia combo E E produces real mark and Q consumes it',()=>{
 const {a,u,v}=make('Irelia');v.x=.51;u.order={kind:'attack',targetId:v.id,combo:['E','E','Q'],comboIndex:0,comboNextAt:0};
 a.duelPermission=()=>true;
 a.resolveQueuedCombos();assert.equal(u.order.comboIndex,1);assert.equal(u.mana,350);
 a.gameTime=1;a.resolveQueuedCombos();assert.equal(u.order.comboIndex,2);
 a.gameTime=2;a.advanceIreliaBladesV453Dev43();assert.ok(v.ireliaMarkV453Dev42);
 a.resolveQueuedCombos();assert.equal(u.order.comboIndex,3);assert.equal(v.ireliaMarkV453Dev42,null);
});
test('Irelia second recast works under stun, first paid cast does not',()=>{
 const {a,u}=make('Irelia');assert.ok(a.castIreliaFlawlessDuetV453Dev43(u,{x:.496,y:.5}).ok);
 a.applyEffectV41(u,'stun',{source:a.units.find(x=>x.team==='red'),duration:2});a.gameTime=.2;
 assert.ok(a.castIreliaFlawlessDuetV453Dev43(u,{x:.525,y:.5}).ok);
});
console.log(`DEV43 ${count}/${count} PASS`);
