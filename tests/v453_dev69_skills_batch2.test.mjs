/** FAST LANE dev69 batch2: Nami R passive & Vex R2 interruption, PvP two human seats.
 * Source: wiki.leagueoflegends.com/en-us/Nami and /en-us/Vex
 * Uncertified browser visuals, full LoL 1:1 and asset distribution are out of scope.
 */
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {Arena,checksumV40} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
let total=0;
function check(label,fn){fn();total++;console.log('✓ BATCH2 '+label);}
const make=(champ='Nami',team='blue')=>{
 const rival=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:692,roundSeconds:10,draft:{[team]:{MID:champ}}});
 for(const w of a.units)Object.assign(w,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const caster=a.units.find(w=>w.id===team+'_MID');
 const ally=a.units.find(w=>w.id===team+'_TOP');
 const enemy=a.units.find(w=>w.id===rival+'_MID');
 Object.assign(caster,{x:.5,y:.5,champ,ap:0,mana:500,maxMana:500,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(ally,{x:.532,y:.5,hp:1000,maxHp:1000});
 Object.assign(enemy,{x:.532,y:.5,hp:2000,maxHp:2000,shield:0,mr:0});
 a.visible=()=>true;
 return {a,caster,ally,enemy,team,rival};
};
const fire=(c)=>c.a.launchWaveShadowV453Dev69(c.caster,'R',{x:.9,y:.5});
const strike=(c,when=.5)=>{c.a.gameTime=when;c.a.advanceChampionProjectilesV453Dev42();};
for(const team of ['blue','red']){
 const c=make('Nami',team);c.caster.ap=100;const baseline=c.a.effectiveMS(c.caster),allyBaseline=c.a.effectiveMS(c.ally);
 const cast=fire(c);
 check(team+' paid Nami R grants normal passive on cast, not pre-cast',()=>{
  assert.ok(cast.ok);assert.equal(c.caster.mana,400);
  assert.equal(c.caster.namiSurgingV453Dev69B2.normal.power,125);
  assert.equal(c.a.namiSurgingSpeedV453Dev69B2(c.ally),0);
  assert.ok(c.a.effectiveMS(c.caster)>baseline);
 });
 c.a.gameTime=.2;c.a.advanceChampionProjectilesV453Dev42();
 check(team+' ally not buffed before wave crosses position',()=>{
  assert.equal(c.a.namiSurgingSpeedV453Dev69B2(c.ally),0);
  assert.equal(c.a.effectiveMS(c.ally),allyBaseline);
 });
 c.a.gameTime=.65;c.a.advanceChampionProjectilesV453Dev42();
 check(team+' travelling wave grants exactly one empowered ally passive',()=>{
  assert.deepEqual(c.a.championProjectilesV453Dev42[0].allyIds,[c.ally.id]);
  assert.equal(c.ally.namiSurgingV453Dev69B2.empowered.power,250);
  assert.equal(c.a.namiSurgingSpeedV453Dev69B2(c.ally),250);
  assert.ok(c.a.effectiveMS(c.ally)>allyBaseline);
  assert.equal(c.ally.hp,1000);
 });
 const expires=c.ally.namiSurgingV453Dev69B2.empowered.until;
 c.a.gameTime=.80;c.a.advanceChampionProjectilesV453Dev42();
 check(team+' duplicate projectile sweep never refreshes same ally passive',()=>{
  assert.equal(c.ally.namiSurgingV453Dev69B2.empowered.until,expires);
  assert.equal(c.a.championProjectilesV453Dev42[0].allyIds.filter(id=>id===c.ally.id).length,1);
 });
 const checkpoint=Arena.fromSnapshotV40(map,mask,c.a.snapshotV40());
 check(team+' empowered buff/sweep state persist in snapshot without duplicated effects',()=>{
  assert.equal(checksumV40(checkpoint.snapshotV40()),checksumV40(c.a.snapshotV40()));
  assert.deepEqual(checkpoint.units.find(w=>w.id===c.ally.id).namiSurgingV453Dev69B2,c.ally.namiSurgingV453Dev69B2);
 });
 c.a.gameTime=checkpoint.gameTime=1.4;
 check(team+' both restored and live movement use same simulated decay',()=>{
  assert.equal(c.a.namiSurgingSpeedV453Dev69B2(c.ally),checkpoint.namiSurgingSpeedV453Dev69B2(checkpoint.units.find(w=>w.id===c.ally.id)));
  assert.ok(c.a.namiSurgingSpeedV453Dev69B2(c.ally)<250);
 });
 c.a.gameTime=2.16;
 check(team+' timed passive expires without permanent movement stat mutation',()=>{
  assert.equal(c.a.namiSurgingSpeedV453Dev69B2(c.ally),0);
  assert.equal(c.a.namiSurgingSpeedV453Dev69B2(c.caster),0);
  assert.equal(c.a.effectiveMS(c.ally),allyBaseline);
 });
 const deny=make('Nami',team);
 const failed=deny.a.launchWaveShadowV453Dev69(deny.caster,'R',{x:deny.caster.x,y:deny.caster.y});
 check(team+' invalid Nami cast grants no speed, no mana cost',()=>{
  assert.equal(failed.ok,false);assert.equal(deny.caster.mana,500);
  assert.equal(deny.a.namiSurgingSpeedV453Dev69B2(deny.caster),0);
 });
 const wall=make('Nami',team);
 wall.a.projectileBarriersV453Dev43.push({id:'b2_wall',team:wall.rival,x:.515,y:.5,radius:70,until:3});
 fire(wall);strike(wall,.7);
 check(team+' enemy wall blocks allied buff beyond wave stoppage',()=>{
  assert.equal(wall.a.namiSurgingSpeedV453Dev69B2(wall.ally),0);
  assert.equal(wall.a.championProjectileHistoryV453Dev42.at(-1).reason,'bloqueio_posicional');
 });
 const side=make('Nami',team);side.ally.y=.54;
 fire(side);strike(side,.7);
 check(team+' allied champion outside wave hitbox gets no boost',()=>assert.equal(side.a.namiSurgingSpeedV453Dev69B2(side.ally),0));
 const noFoe=make('Nami',team);noFoe.enemy.x=.08;noFoe.enemy.y=.08;
 fire(noFoe);strike(noFoe,.7);
 check(team+' friendly wave hit works without enemy collision',()=>assert.ok(noFoe.a.namiSurgingSpeedV453Dev69B2(noFoe.ally)>0));
 const vex=make('Vex',team);vex.ally.x=.08;vex.ally.y=.08;
 fire(vex);strike(vex,.5);
 check(team+' Vex R hit produces a mark before R2',()=>assert.equal(vex.caster.vexMark?.targetId,vex.enemy.id));
 assert.ok(vex.a.queueVexRecast(team,vex.caster.id).ok);
 vex.a.resolveDirectionalSkills();const paid=vex.caster.mana;
 vex.a.gameTime=.55;vex.a.advanceVexShadowDashV453Dev69();
 const saved=Arena.fromSnapshotV40(map,mask,vex.a.snapshotV40());
 check(team+' Vex R2 in flight survives checkpoint and has no second mana cost',()=>{
  assert.ok(vex.caster.vexDashV453Dev69);
  assert.equal(paid,400);
  assert.equal(checksumV40(saved.snapshotV40()),checksumV40(vex.a.snapshotV40()));
 });
 vex.a.applyEffectV41(vex.caster,'knockup',{duration:1,source:vex.enemy});
 saved.applyEffectV41(saved.units.find(w=>w.id===vex.caster.id),'knockup',{duration:1,source:saved.units.find(w=>w.id===vex.enemy.id)});
 const firstHp=vex.enemy.hp;
 vex.a.gameTime=saved.gameTime=.65;vex.a.advanceVexShadowDashV453Dev69();saved.advanceVexShadowDashV453Dev69();
 check(team+' airborne interrupts active Vex R2, no arrival damage or replay drift',()=>{
  assert.equal(vex.caster.vexDashV453Dev69,null);assert.equal(vex.enemy.hp,firstHp);
  assert.equal(vex.caster.vexDashLastInterruptV453Dev69B2.reason,'deslocamento_interrompido');
  assert.equal(checksumV40(saved.snapshotV40()),checksumV40(vex.a.snapshotV40()));
 });
 vex.a.gameTime=.8;vex.a.advanceVexShadowDashV453Dev69();
 check(team+' interrupted dash is not revived and cannot double-hit',()=>assert.equal(vex.enemy.hp,firstHp));
 const ordinary=make('Vex',team);ordinary.ally.x=.08;ordinary.ally.y=.08;
 fire(ordinary);strike(ordinary,.5);
 ordinary.a.queueVexRecast(team,ordinary.caster.id);ordinary.a.resolveDirectionalSkills();
 ordinary.a.gameTime=.55;ordinary.a.advanceVexShadowDashV453Dev69();
 ordinary.a.applyEffectV41(ordinary.caster,'root',{source:ordinary.enemy,duration:4});
 ordinary.a.gameTime=.9;ordinary.a.advanceVexShadowDashV453Dev69();
 check(team+' root applied after Vex takeoff does not falsely cancel dash',()=>{
  assert.equal(ordinary.caster.vexDashV453Dev69,null);
  assert.ok(ordinary.enemy.hp<1925);assert.equal(ordinary.caster.mana,400);
 });
 const dead=make('Vex',team);dead.ally.x=.08;dead.ally.y=.08;
 fire(dead);strike(dead,.5);dead.a.queueVexRecast(team,dead.caster.id);dead.a.resolveDirectionalSkills();
 const beforeDead=dead.enemy.hp;dead.caster.hp=0;dead.a.gameTime=.6;dead.a.advanceVexShadowDashV453Dev69();
 check(team+' caster death cancels dash without damaging marked opponent',()=>{
  assert.equal(dead.caster.vexDashV453Dev69,null);assert.equal(dead.enemy.hp,beforeDead);
  assert.equal(dead.caster.vexDashLastInterruptV453Dev69B2.reason,'caster_morto');
 });
 const targetDead=make('Vex',team);targetDead.ally.x=.08;targetDead.ally.y=.08;
 fire(targetDead);strike(targetDead,.5);targetDead.a.queueVexRecast(team,targetDead.caster.id);targetDead.a.resolveDirectionalSkills();
 targetDead.enemy.hp=0;targetDead.a.gameTime=.6;targetDead.a.advanceVexShadowDashV453Dev69();
 check(team+' target death safely cancels tracking dash',()=>{
  assert.equal(targetDead.caster.vexDashV453Dev69,null);
  assert.equal(targetDead.caster.vexDashLastInterruptV453Dev69B2.reason,'alvo_morto');
 });
 const stasis=make('Vex',team);stasis.ally.x=.08;stasis.ally.y=.08;
 fire(stasis);strike(stasis,.5);stasis.a.queueVexRecast(team,stasis.caster.id);stasis.a.resolveDirectionalSkills();
 stasis.a.applyEffectV41(stasis.caster,'stasis',{source:stasis.enemy,duration:2});
 const beforeStasis=stasis.enemy.hp;stasis.a.gameTime=.6;stasis.a.advanceVexShadowDashV453Dev69();
 check(team+' self-stasis interrupts active dash without arrival damage',()=>{
  assert.equal(stasis.caster.vexDashV453Dev69,null);assert.equal(stasis.enemy.hp,beforeStasis);
  assert.equal(stasis.caster.vexDashLastInterruptV453Dev69B2.reason,'stasis');
 });
}
for(const team of ['blue','red']){
 const temp=mkdtempSync(join(tmpdir(),'coachlol-skills-b2-'));
 const registry=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:temp});
 const server=createPvPServerV453Dev47({registry,tickMs:0});
 const {port}=await server.listen(0),base='http://127.0.0.1:'+port;
 const req=async(path,payload,cookie='')=>{
  const response=await fetch(base+'/api/'+path,{method:payload===undefined?'GET':'POST',
   headers:{...(cookie?{cookie}:{}),...(payload===undefined?{}:{'content-type':'application/json',origin:base})},
   body:payload===undefined?undefined:JSON.stringify(payload)});
  return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')};
 };
 try{
  const created=await req('create',{}),joined=await req('join',{roomId:created.data.roomId});
  const own=team==='blue'?created.cookie.split(';')[0]:joined.cookie.split(';')[0];
  const foreign=team==='blue'?joined.cookie.split(';')[0]:created.cookie.split(';')[0];
  const room=registry.get(created.data.roomId),a=room.arena;
  for(const w of a.units)Object.assign(w,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
  const u=a.units.find(w=>w.id===team+'_MID'),ally=a.units.find(w=>w.id===team+'_TOP');
  Object.assign(u,{champ:'Nami',x:.5,y:.5,mana:500,maxMana:500,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
  Object.assign(ally,{x:.532,y:.5});
  const payload={sequence:1,unitId:u.id,kind:'skill.directional',payload:{slot:'R',point:{x:.9,y:.5}}};
  const bad=await req('action',payload,foreign),good=await req('action',payload,own),again=await req('action',payload,own);
  check(team+' HTTP two independent authenticated humans queue Nami R once',()=>{
   assert.equal(room.players.length,2);assert.equal(bad.status,409);
   assert.equal(good.status,200);assert.deepEqual(again.data,good.data);
  });
  a.resolveDirectionalSkills();a.gameTime=.65;a.advanceChampionProjectilesV453Dev42();room.persist();
  const rr=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:temp}).get(room.id);
  check(team+' reconnect retains Nami ally passive and gateway receipt',()=>{
   const restoredAlly=rr.arena.units.find(w=>w.id===ally.id);
   assert.ok(rr.arena.namiSurgingSpeedV453Dev69B2(restoredAlly)>0);
   assert.equal(rr.gateway.seats.get(team==='blue'?'p1':'p2').lastSequence,1);
  });
  const ownView=await req('session',undefined,own),otherView=await req('session',undefined,foreign);
  check(team+' reconnection projections retain five-unit ownership and no raw projectile leaks',()=>{
   assert.equal(ownView.data.projection.controlledUnitIds.length,5);
   assert.equal(otherView.data.projection.controlledUnitIds.length,5);
   assert.ok(!Object.hasOwn(otherView.data.projection,'championProjectilesV453Dev42'));
   assert.ok(!Object.hasOwn(otherView.data.projection,'namiSurgingV453Dev69B2'));
  });
 }finally{await server.close();rmSync(temp,{recursive:true,force:true});}
}
console.log('DEV69 BATCH2 '+total+'/'+total+' PASS');
