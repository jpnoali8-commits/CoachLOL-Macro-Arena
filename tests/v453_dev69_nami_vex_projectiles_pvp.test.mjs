/** Dev69 skills: Nami Tidal Wave and Vex Shadow Surge temporal PvP contracts.
 * Offline deterministic engine + real HTTP two-seat gateway (no visual certification).
 */
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {Arena,checksumV40} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json'),manifest=data('rift_user_manifest_v452d4.json');
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('✓ DEV69 SKILLS '+name)};
const prepare=(champ='Nami',team='blue')=>{
 const enemyTeam=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:69,roundSeconds:10,draft:{[team]:{MID:champ}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),v=a.units.find(w=>w.id===enemyTeam+'_MID');
 Object.assign(u,{x:.5,y:.5,champ,mana:500,maxMana:500,ap:0,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0},stunUntil:0});
 Object.assign(v,{x:.532,y:.5,hp:2000,maxHp:2000,mr:0,shield:0,stunUntil:0});
 a.visible=()=>true;
 return {a,u,v,enemyTeam};
};
for(const team of ['blue','red']){
 const {a,u,v,enemyTeam}=prepare('Nami',team);
 const second=a.units.find(w=>w.id===enemyTeam+'_TOP');
 Object.assign(second,{x:.570,y:.5,hp:2000,maxHp:2000,mr:0});
 const shot=a.launchWaveShadowV453Dev69(u,'R',{x:.9,y:.5});
 test(team+' Nami R spawns 850u/s wave without immediate hit',()=>{
  assert.ok(shot.ok&&shot.pending);assert.equal(u.mana,400);assert.ok(u.skillCds.R>0);
  assert.equal(v.hp,2000);assert.equal(a.championProjectilesV453Dev42[0].kind,'nami_r');
  assert.equal(a.championProjectilesV453Dev42[0].speed,850);
 });
 const failed=a.launchWaveShadowV453Dev69(u,'R',{x:.9,y:.5});
 test(team+' one R commit, no double mana or cooldown',()=>{assert.equal(failed.ok,false);assert.equal(u.mana,400)});
 a.gameTime=.2;a.advanceChampionProjectilesV453Dev42();
 test(team+' wave does not retroactively strike a distant target',()=>assert.equal(v.hp,2000));
 a.gameTime=.65;a.advanceChampionProjectilesV453Dev42();
 test(team+' wave damages and airborne+slows first champion',()=>{
  assert.ok(v.hp<2000);assert.ok(a.effectResolverV41().has(v,'knockup'));
  assert.ok(a.effectResolverV41().has(v,'slow'));assert.equal(second.hp,2000);
 });
 a.gameTime=1.4;a.advanceChampionProjectilesV453Dev42();
 test(team+' broad wave hits second champion once in later segment',()=>{
  assert.ok(second.hp<2000);assert.equal(a.championProjectilesV453Dev42[0].hitIds.filter(id=>id===v.id).length,1);
 });
 const b=prepare('Nami',team);b.a.applyEffectV41(b.v,'spell_shield',{source:b.v,duration:5});
 b.a.launchWaveShadowV453Dev69(b.u,'R',{x:.9,y:.5});b.a.gameTime=.7;b.a.advanceChampionProjectilesV453Dev42();
 test(team+' spell shield negates wave damage and CC',()=>{
  assert.equal(b.v.hp,2000);assert.ok(!b.a.effectResolverV41().has(b.v,'knockup'));
  assert.ok(!b.a.effectResolverV41().has(b.v,'spell_shield'));
 });
 const c=prepare('Nami',team);c.a.applyEffectV41(c.u,'stun',{source:c.v,duration:2});
 const blocked=c.a.launchWaveShadowV453Dev69(c.u,'R',{x:.9,y:.5});
 test(team+' Nami stunned before launch spends nothing',()=>{assert.equal(blocked.ok,false);assert.equal(c.u.mana,500)});
 const d=prepare('Nami',team);d.a.launchWaveShadowV453Dev69(d.u,'R',{x:.9,y:.5});
 d.a.applyEffectV41(d.u,'stun',{source:d.v,duration:2});d.a.gameTime=.7;d.a.advanceChampionProjectilesV453Dev42();
 test(team+' Nami CC after launch does not erase wave',()=>assert.ok(d.v.hp<2000));
 const {a:va,u:vu,v:vv}=prepare('Vex',team);
 const vx=va.launchWaveShadowV453Dev69(vu,'R',{x:.9,y:.5});
 test(team+' Vex R missile 1600u/s and pending, no instant mark',()=>{
  assert.ok(vx.ok&&vx.pending);assert.equal(vu.mana,400);assert.equal(vv.hp,2000);
  assert.equal(va.championProjectilesV453Dev42[0].kind,'vex_r');
  assert.equal(va.championProjectilesV453Dev42[0].speed,1600);assert.equal(vu.vexMark??null,null);
 });
 va.gameTime=.12;va.advanceChampionProjectilesV453Dev42();
 test(team+' Vex R not homing or instant',()=>assert.equal(vv.hp,2000));
 va.gameTime=.5;va.advanceChampionProjectilesV453Dev42();
 test(team+' Vex first champion hit creates exactly one 4s mark and reveals to owner team',()=>{
  assert.ok(vv.hp<2000);assert.equal(vu.vexMark.targetId,vv.id);
  assert.equal(vu.vexMark.until,4.5);assert.ok(vv.revealedUntil[team]>=4.5);
  assert.equal(va.championProjectilesV453Dev42.length,0);
 });
 const start=va.queueVexRecast(team,vu.id);
 test(team+' Vex recast is owned, available and contains no second mana cost',()=>{assert.ok(start.ok);assert.equal(vu.mana,400)});
 va.resolveDirectionalSkills();
 test(team+' Vex recast begins a dash, not instant damage',()=>{
  assert.ok(vu.vexDashV453Dev69);assert.equal(vu.vexMark,null);assert.equal(vu.mana,400);
  assert.equal(vv.hp,2000-75);
 });
 va.gameTime=.55;va.advanceVexShadowDashV453Dev69();
 test(team+' dash persists while moving towards target',()=>assert.ok(vu.vexDashV453Dev69));
 const saved=Arena.fromSnapshotV40(map,mask,va.snapshotV40());
 test(team+' dash checkpoint is byte-equivalent on restore',()=>assert.equal(checksumV40(va.snapshotV40()),checksumV40(saved.snapshotV40())));
 va.gameTime=saved.gameTime=.9;va.advanceVexShadowDashV453Dev69();saved.advanceVexShadowDashV453Dev69();
 test(team+' dash deals second R damage once, replay deterministic',()=>{
  assert.equal(vu.vexDashV453Dev69,null);assert.equal(saved.units.find(w=>w.id===vv.id).hp,vv.hp);
  assert.ok(vv.hp<2000-75);assert.equal(va.championProjectileHistoryV453Dev42.length,1);
 });
 const deny=va.queueVexRecast(enemyTeam,vu.id);
 test(team+' enemy cannot invoke Vex second activation',()=>assert.equal(deny.ok,false));
 const z=prepare('Vex',team);z.a.applyEffectV41(z.v,'spell_shield',{source:z.v,duration:5});
 z.a.launchWaveShadowV453Dev69(z.u,'R',{x:.9,y:.5});z.a.gameTime=.5;z.a.advanceChampionProjectilesV453Dev42();
 test(team+' Vex spell shield consumes missile without marking',()=>{assert.equal(z.v.hp,2000);assert.equal(z.u.vexMark??null,null)});
 const guarded=prepare('Nami',team);
 guarded.a.projectileBarriersV453Dev43.push({id:'r69_barrier',team:enemyTeam,x:.515,y:.5,radius:70,until:3});
 guarded.a.launchWaveShadowV453Dev69(guarded.u,'R',{x:.9,y:.5});
 guarded.a.gameTime=.7;guarded.a.advanceChampionProjectilesV453Dev42();
 test(team+' Nami wave stops on enemy projectile wall, no CC or HP loss',()=>{
  assert.equal(guarded.v.hp,2000);
  assert.equal(guarded.a.championProjectileHistoryV453Dev42.at(-1).reason,'bloqueio_posicional');
  assert.equal(guarded.a.effectResolverV41().has(guarded.v,'knockup'),false);
 });
 const dodge=prepare('Nami',team);
 dodge.a.launchWaveShadowV453Dev69(dodge.u,'R',{x:.9,y:.5});
 dodge.v.y=.54;dodge.a.gameTime=.7;dodge.a.advanceChampionProjectilesV453Dev42();
 test(team+' moving perpendicular to Nami wave avoids lateral collision',()=>assert.equal(dodge.v.hp,2000));
 const passing=prepare('Vex',team);
 const minion={id:'dev69_vex_minion_'+team,team:enemyTeam,x:.515,y:.5,
  kind:'melee',lane:'mid',hp:400,maxHp:400,spawnAt:0,armor:0,mr:0};
 passing.a.minions.push(minion);
 passing.a.launchWaveShadowV453Dev69(passing.u,'R',{x:.9,y:.5});
 passing.a.gameTime=.5;passing.a.advanceChampionProjectilesV453Dev42();
 test(team+' Vex missile damages minion but only stops on first champion',()=>{
  assert.ok(minion.hp<400);assert.equal(passing.u.vexMark?.targetId,passing.v.id);
 });
 const rooted=prepare('Vex',team);
 rooted.a.launchWaveShadowV453Dev69(rooted.u,'R',{x:.9,y:.5});
 rooted.a.gameTime=.5;rooted.a.advanceChampionProjectilesV453Dev42();
 rooted.a.applyEffectV41(rooted.u,'root',{source:rooted.v,duration:3});
 assert.ok(rooted.a.queueVexRecast(team,rooted.u.id).ok);
 const manaBeforeRooted=rooted.u.mana;rooted.a.resolveDirectionalSkills();
 test(team+' root interrupts Vex R2 before start, without second cost',()=>{
  assert.equal(rooted.u.vexDashV453Dev69??null,null);
  assert.equal(rooted.u.vexMark?.targetId,rooted.v.id);
  assert.equal(rooted.u.mana,manaBeforeRooted);
 });
 rooted.a.gameTime=4.6;
 test(team+' Vex cannot recast after mark expires',()=>assert.equal(rooted.a.queueVexRecast(team,rooted.u.id).ok,false));
 const hidden=prepare('Vex',team);
 const otherHidden=hidden.a.units.find(w=>w.id===enemyTeam+'_TOP');
 hidden.a.launchWaveShadowV453Dev69(hidden.u,'R',{x:.9,y:.5});
 hidden.a.gameTime=.5;hidden.a.advanceChampionProjectilesV453Dev42();
 hidden.a.visible=Arena.prototype.visible.bind(hidden.a);
 hidden.a.canSeePoint=()=>false; // Simulate fog with zero vision sources.
 test(team+' mark reveals only struck target to casting team, no global fog reveal',()=>{
  assert.equal(hidden.a.visible(team,hidden.v),true);
  assert.equal(hidden.a.visible(team,otherHidden),false);
  assert.equal(hidden.a.visible(enemyTeam,hidden.u),false);
  assert.equal(hidden.a.perspective(team).units.some(w=>w.id===otherHidden.id),false);
 });
 hidden.a.gameTime=5;
 test(team+' mark reveal expires and target returns to fog',()=>assert.equal(hidden.a.visible(team,hidden.v),false));
 const combo=prepare('Nami',team);
 combo.u.order={kind:'attack',targetId:combo.v.id,combo:['R'],comboIndex:0,comboNextAt:0};
 combo.a.duelPermission=()=>true;combo.a.resolveQueuedCombos();
 test(team+' offensive R combo uses temporal cast, not generic instant damage',()=>{
  assert.equal(combo.v.hp,2000);
  assert.equal(combo.a.championProjectilesV453Dev42[0]?.kind,'nami_r');
  assert.equal(combo.u.order.comboIndex,1);
 });
 const k=prepare('Vex',team);const invalid=k.a.launchWaveShadowV453Dev69(k.u,'R',{x:.5,y:.5});
 test(team+' zero direction rejected with no cost',()=>{assert.equal(invalid.ok,false);assert.equal(k.u.mana,500)});
}
for(const team of ['blue','red']){
 const tmp=mkdtempSync(join(tmpdir(),'coachlol-skills69-'));
 const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:tmp});
 const server=createPvPServerV453Dev47({registry:reg,tickMs:0});
 const addr=await server.listen(0),base='http://127.0.0.1:'+addr.port;
 const call=async(path,payload,cookie='')=>{
  const res=await fetch(base+'/api/'+path,{method:payload===undefined?'GET':'POST',
   headers:{...(cookie?{cookie}:{}),...(payload===undefined?{}:{'content-type':'application/json',origin:base})},
   body:payload===undefined?undefined:JSON.stringify(payload)});
  return {status:res.status,data:await res.json(),cookie:res.headers.get('set-cookie')};
 };
 try{
  const created=await call('create',{}),joined=await call('join',{roomId:created.data.roomId});
  const own=team==='blue'?created.cookie.split(';')[0]:joined.cookie.split(';')[0];
  const wrong=team==='blue'?joined.cookie.split(';')[0]:created.cookie.split(';')[0];
  const room=reg.get(created.data.roomId),a=room.arena;
  const u=a.units.find(w=>w.id===team+'_MID');
  for(const w of a.units)Object.assign(w,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
  Object.assign(u,{champ:'Nami',x:.5,y:.5,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0},mana:500,maxMana:500});
  const req={sequence:1,unitId:u.id,kind:'skill.directional',payload:{slot:'R',point:{x:.9,y:.5}}};
  const bad=await call('action',req,wrong),good=await call('action',req,own),replay=await call('action',req,own);
  test(team+' PvP 2 seats: rejected cross-team R and idempotent receipt',()=>{
   assert.equal(room.players.length,2);assert.equal(bad.status,409);assert.equal(good.status,200,JSON.stringify(good.data));
   assert.deepEqual(replay.data,good.data);assert.equal(u.mana,500);
  });
  a.resolveDirectionalSkills();room.persist();
  const restored=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:tmp}).get(room.id);
  test(team+' PvP reconnect persists pending R and exactly one cost',()=>{
   const x=restored.arena.units.find(w=>w.id===u.id);
   assert.equal(x.mana,400);assert.equal(restored.arena.championProjectilesV453Dev42.length,1);
   assert.equal(restored.gateway.seats.get(team==='blue'?'p1':'p2').lastSequence,1);
  });
  const vex=a.units.find(w=>w.id===team+'_TOP');
  const marked=a.units.find(w=>w.id===(team==='blue'?'red':'blue')+'_TOP');
  Object.assign(vex,{champ:'Vex',x:.5,y:.5,skillRanks:{Q:1,W:1,E:1,R:1},
   skillCds:{Q:0,W:0,E:0,R:120},mana:500,maxMana:500,vexMark:{targetId:marked.id,until:a.gameTime+4}});
  Object.assign(marked,{x:.532,y:.5,hp:2000,maxHp:2000});
  const recastReq={sequence:2,unitId:vex.id,kind:'skill.recast_vex',payload:{}};
  const foreignR2=await call('action',recastReq,wrong),ownR2=await call('action',recastReq,own),
   againR2=await call('action',recastReq,own);
  test(team+' PvP Vex R2 rejects enemy seat and deduplicates authenticated sequence',()=>{
   assert.equal(foreignR2.status,409);assert.equal(ownR2.status,200,JSON.stringify(ownR2.data));
   assert.deepEqual(againR2.data,ownR2.data);assert.equal(vex.mana,500);
  });
  a.resolveDirectionalSkills();room.persist();
  const restoredR2=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:tmp}).get(room.id);
  test(team+' PvP Vex R2 dash survives checkpoint without extra mana',()=>{
   const copy=restoredR2.arena.units.find(w=>w.id===vex.id);
   assert.ok(copy.vexDashV453Dev69);assert.equal(copy.vexMark,null);
   assert.equal(copy.mana,500);
   assert.equal(restoredR2.gateway.seats.get(team==='blue'?'p1':'p2').lastSequence,2);
  });
  const mine=await call('session',undefined,own),other=await call('session',undefined,wrong);
  test(team+' both human seats scope their 5 champions and exclude hidden projectile state',()=>{
   assert.equal(mine.data.projection.controlledUnitIds.length,5);
   assert.equal(other.data.projection.controlledUnitIds.length,5);
   assert.equal(mine.data.team,team);assert.notEqual(other.data.team,team);
   assert.ok(!Object.hasOwn(other.data.projection,'championProjectilesV453Dev42'));
  });
 }finally{await server.close();rmSync(tmp,{recursive:true,force:true})}
}
console.log('DEV69 SKILLS '+passed+'/'+passed+' PASS');
