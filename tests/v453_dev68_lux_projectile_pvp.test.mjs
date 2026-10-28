/** Dev68: Lux Q delayed two-collision projectile + two independent PvP sessions. */
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {Arena,checksumV40} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
let passed=0;const check=(name,fn)=>{fn();passed++;console.log('✓ DEV68 '+name);};
const create=(team='blue')=>{
 const a=new Arena(map,mask,{seed:68,roundSeconds:10,draft:{blue:{MID:'Lux'},red:{MID:'Lux'}}});
 const owner=a.units.find(x=>x.id===team+'_MID'),enemy=a.units.find(x=>x.id===(team==='blue'?'red':'blue')+'_MID');
 for(const u of a.units){Object.assign(u,{x:.05,y:.05,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});}
 Object.assign(owner,{x:.5,y:.5,skillRanks:{Q:1,W:0,E:0,R:0},skillCds:{Q:0,W:0,E:0,R:0},mana:500,maxMana:500,ap:0});
 Object.assign(enemy,{x:.532,y:.5,hp:1000,maxHp:1000,shield:0,mr:0,armor:0});
 a.visible=()=>true;return {a,owner,enemy};
};
for(const team of ['blue','red']){
 const {a,owner,enemy}=create(team),starting=enemy.hp;
 const fired=a.launchLuxBindingV453Dev68(owner,{x:enemy.x,y:enemy.y});
 check(team+' Q spawns an actual in-flight projectile',()=>{assert.ok(fired.ok&&fired.pending);assert.equal(a.championProjectilesV453Dev42.length,1);assert.equal(enemy.hp,starting);assert.equal(owner.mana,450);assert.ok(owner.skillCds.Q>0);});
 const duplicate=a.launchLuxBindingV453Dev68(owner,{x:enemy.x,y:enemy.y});
 check(team+' Q second cast rejected without additional mana',()=>{assert.equal(duplicate.ok,false);assert.equal(owner.mana,450);});
 a.gameTime=.20;a.advanceChampionProjectilesV453Dev42();
 check(team+' Q does not hit before crossing target',()=>{assert.equal(enemy.hp,starting);assert.equal(a.championProjectilesV453Dev42.length,1);});
 a.gameTime=.55;a.advanceChampionProjectilesV453Dev42();
 check(team+' Q deals damage and roots only on arrival',()=>{assert.ok(enemy.hp<starting);assert.ok(a.effectResolverV41().has(enemy,'root'));assert.deepEqual(a.championProjectilesV453Dev42[0].hitIds,[enemy.id]);});
 a.gameTime=1.5;a.advanceChampionProjectilesV453Dev42();
 check(team+' first victim cannot be struck twice in later ticks',()=>{assert.ok(enemy.hp<starting);assert.equal(a.championProjectileHistoryV453Dev42.at(-1).hitIds.filter(x=>x===enemy.id).length,1);});
 const b=create(team);b.a.applyEffectV41(b.owner,'stun',{source:b.enemy,duration:4});
 const before=b.owner.mana,failed=b.a.launchLuxBindingV453Dev68(b.owner,{x:b.enemy.x,y:b.enemy.y});
 check(team+' stun interrupts unlaunched Q without spending mana',()=>{assert.equal(failed.ok,false);assert.equal(b.owner.mana,before);assert.equal(b.a.championProjectilesV453Dev42.length,0);});
 const c=create(team);const q=c.a.launchLuxBindingV453Dev68(c.owner,{x:c.enemy.x,y:c.enemy.y});
 c.a.applyEffectV41(c.owner,'stun',{source:c.enemy,duration:4});c.a.gameTime=.55;c.a.advanceChampionProjectilesV453Dev42();
 check(team+' stunned caster does not erase missile already launched',()=>{assert.ok(q.ok);assert.ok(c.enemy.hp<1000);});
 const d=create(team);d.a.applyEffectV41(d.enemy,'spell_shield',{source:d.enemy,duration:5});d.a.launchLuxBindingV453Dev68(d.owner,{x:d.enemy.x,y:d.enemy.y});d.a.gameTime=.55;d.a.advanceChampionProjectilesV453Dev42();
 check(team+' shield absorbs damage AND root but consumes one slot',()=>{assert.equal(d.enemy.hp,1000);assert.ok(!d.a.effectResolverV41().has(d.enemy,'root'));assert.ok(!d.a.effectResolverV41().has(d.enemy,'spell_shield'));assert.deepEqual(d.a.championProjectilesV453Dev42[0].hitIds,[d.enemy.id]);});
 const e=create(team);e.enemy.projectileGuardUntil=4;e.a.launchLuxBindingV453Dev68(e.owner,{x:e.enemy.x,y:e.enemy.y});e.a.gameTime=.55;e.a.advanceChampionProjectilesV453Dev42();
 check(team+' windwall/proj guard blocks projectile without rooting',()=>{assert.equal(e.enemy.hp,1000);assert.equal(e.a.championProjectilesV453Dev42.length,0);assert.equal(e.a.championProjectileHistoryV453Dev42.at(-1).reason,'bloqueio_projétil');});
 const f=create(team);f.a.launchLuxBindingV453Dev68(f.owner,{x:f.enemy.x,y:f.enemy.y});f.enemy.y=.56;f.a.gameTime=1.2;f.a.advanceChampionProjectilesV453Dev42();
 check(team+' projectile does not homing-follow moved target',()=>{assert.equal(f.enemy.hp,1000);assert.ok(['fim_alcance','parede'].includes(f.a.championProjectileHistoryV453Dev42.at(-1).reason));});
 const g=create(team),second=g.a.units.find(x=>x.id===(team==='blue'?'red':'blue')+'_TOP');
 Object.assign(second,{x:.54,y:.5,hp:1000,maxHp:1000,mr:0});g.a.launchLuxBindingV453Dev68(g.owner,{x:.54,y:.5});
 g.a.gameTime=1.3;g.a.advanceChampionProjectilesV453Dev42();
 check(team+' projectile can hit two separate enemy champions',()=>{assert.ok(g.enemy.hp<1000);assert.ok(second.hp<1000);assert.deepEqual(g.a.championProjectileHistoryV453Dev42.at(-1).hitIds,[g.enemy.id,second.id]);});
 const h=create(team);h.a.launchLuxBindingV453Dev68(h.owner,{x:h.enemy.x,y:h.enemy.y});h.a.gameTime=.2;h.a.advanceChampionProjectilesV453Dev42();
 const restored=Arena.fromSnapshotV40(map,mask,h.a.snapshotV40());
 check(team+' progress and resource cooldown persist in snapshot',()=>{assert.equal(checksumV40(h.a.snapshotV40()),checksumV40(restored.snapshotV40()));assert.equal(restored.championProjectilesV453Dev42.length,1);});
 h.a.gameTime=restored.gameTime=.55;h.a.advanceChampionProjectilesV453Dev42();restored.advanceChampionProjectilesV453Dev42();
 check(team+' replay matches live collision and root',()=>{assert.equal(restored.units.find(x=>x.id===h.enemy.id).hp,h.enemy.hp);assert.deepEqual(restored.championProjectilesV453Dev42,h.a.championProjectilesV453Dev42);});
}
for(const team of ['blue','red']){
 const tmp=mkdtempSync(join(tmpdir(),'coachlol-dev68-'));
 const registry=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:tmp});
 const server=createPvPServerV453Dev47({registry,tickMs:0});let address=await server.listen(0);let base=`http://127.0.0.1:${address.port}`;
 const request=async(path,payload,cookie='')=>{const res=await fetch(base+'/api/'+path,{method:payload===undefined?'GET':'POST',headers:{...(cookie?{cookie}:{}),...(payload===undefined?{}:{'content-type':'application/json',origin:base})},body:payload===undefined?undefined:JSON.stringify(payload)});return {status:res.status,data:await res.json(),cookie:res.headers.get('set-cookie')};};
 try{
  const createRoom=await request('create',{}),bc=createRoom.cookie.split(';')[0],joinRoom=await request('join',{roomId:createRoom.data.roomId}),rc=joinRoom.cookie.split(';')[0];
  const cookie=team==='blue'?bc:rc,wrong=team==='blue'?rc:bc;
  const room=registry.get(createRoom.data.roomId),a=room.arena;
  const owner=a.units.find(x=>x.id===team+'_MID'),enemy=a.units.find(x=>x.id===(team==='blue'?'red':'blue')+'_MID');
  for(const u of a.units){u.autoAttack=false;u.autoFollow=false;u.autoFarm=false;u.autoJungle=false;u.x=u.y=.05;}
  Object.assign(owner,{champ:'Lux',x:.5,y:.5,skillRanks:{Q:1,W:0,E:0,R:0},skillCds:{Q:0,W:0,E:0,R:0},mana:500,maxMana:500});
  Object.assign(enemy,{x:.532,y:.5,hp:1000,maxHp:1000,shield:0});
  check(team+' two seats control their five champions',()=>{assert.equal(room.players.length,2);assert.notEqual(bc,rc);});
  const p={sequence:1,unitId:owner.id,kind:'order.combo',payload:{targetId:enemy.id,steps:['Q']}};
  const denied=await request('action',p,wrong);
  check(team+' foreign seat cannot launch Lux Q',()=>assert.equal(denied.status,409));
  const accepted=await request('action',p,cookie),again=await request('action',p,cookie);
  check(team+' authenticated combo and sequence replay idempotent',()=>{assert.equal(accepted.status,200,JSON.stringify(accepted.data));assert.deepEqual(again.data,accepted.data);});
  const ownView=await request('session',undefined,cookie),enemyView=await request('session',undefined,wrong);
  check(team+' both sessions privately scoped',()=>{assert.equal(ownView.data.team,team);assert.notEqual(ownView.data.team,enemyView.data.team);assert.equal(ownView.data.projection.controlledUnitIds.length,5);});
  a.phase='executing';a.duelPermission=()=>true;const hp=enemy.hp,mana=owner.mana;
  a.resolveQueuedCombos();
  check(team+' planned Lux Q creates delayed missile and commits only once',()=>{assert.equal(owner.order.comboIndex,1);assert.ok(owner.mana<mana);assert.equal(enemy.hp,hp);assert.equal(a.championProjectilesV453Dev42.length,1);});
  room.persist();const resumed=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:tmp}).get(room.id);
  check(team+' reconnection keeps in-flight Q',()=>{assert.equal(resumed.arena.championProjectilesV453Dev42.length,1);assert.equal(resumed.arena.championProjectilesV453Dev42[0].kind,'lux_q');});
  resumed.arena.gameTime=.55;resumed.arena.advanceChampionProjectilesV453Dev42();
  check(team+' restored PvP missile deals damage and roots',()=>{const v=resumed.arena.units.find(x=>x.id===enemy.id);assert.ok(v.hp<hp);assert.ok(resumed.arena.effectResolverV41().has(v,'root'));});
 }finally{await server.close();rmSync(tmp,{recursive:true,force:true});}
}
console.log(`DEV68 ${passed}/${passed} PASS`);
