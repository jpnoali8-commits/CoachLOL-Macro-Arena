import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {Arena,checksumV40} from '../engine.mjs';
const data=name=>JSON.parse(fs.readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const make=(champ='Ezreal')=>{
 const a=new Arena(map,mask,{seed:42,roundSeconds:10,draft:{blue:{ADC:'Ezreal',TOP:'Irelia'}}});
 const u=a.units.find(x=>x.team==='blue'&&x.champ===champ),v=a.units.find(x=>x.team==='red'&&x.role==='MID');
 Object.assign(u,{x:.5,y:.5,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0},mana:400,maxMana:400,ad:100,ap:0,hp:500,maxHp:1000,items:['recurve_bow']});
 Object.assign(v,{x:.532,y:.5,hp:1200,maxHp:1200,armor:0,mr:0,shield:0,projectileGuardUntil:0});
 a.visible=()=>true;return {a,u,v};
};
let count=0;
function test(name,fn){fn();count++;console.log('✓ DEV42 '+name)}
function fire(a,u,v){const q=a.castChampionOnHitV453Dev41(u,'Q',v);assert.equal(q.ok,true);assert.equal(q.pending,true);return q;}
function impact(a){a.gameTime++;a.advanceChampionProjectilesV453Dev42();}
test('Ezreal Q creates a serialized in-flight object, not instant damage',()=>{
 const {a,u,v}=make();const r=fire(a,u,v);assert.ok(r.projectileId);assert.equal(a.championProjectilesV453Dev42.length,1);
 assert.equal(a.championProjectilesV453Dev42[0].speed,2000);assert.equal(v.hp,1200);assert.equal(u.mana,372);
});
test('impact next simulated second damages first enemy + on-hit and refunds cooldown',()=>{
 const {a,u,v}=make();fire(a,u,v);impact(a);assert.equal(v.hp,1035);assert.equal(a.championProjectilesV453Dev42.length,0);
 assert.equal(a.championProjectileHistoryV453Dev42[0].hitId,v.id);assert.equal(u.skillCds.Q,4);
});
test('moving minion intercepts during travel, not at cast',()=>{
 const {a,u,v}=make();const m={id:'travel42',team:'red',kind:'melee',x:.515,y:.52,hp:400,maxHp:400,armor:0,mr:0,spawnAt:0,lane:'mid'};
 a.minions.push(m);fire(a,u,v);m.y=.5;impact(a);assert.equal(m.hp,235);assert.equal(v.hp,1200);
});
test('minion leaving trajectory before impact cannot intercept',()=>{
 const {a,u,v}=make();const m={id:'leave42',team:'red',kind:'melee',x:.515,y:.5,hp:400,maxHp:400,armor:0,mr:0,spawnAt:0,lane:'mid'};
 a.minions.push(m);fire(a,u,v);m.y=.53;impact(a);assert.equal(m.hp,400);assert.equal(v.hp,1035);
});
test('projectile is not homing: moving target off original ray avoids damage',()=>{
 const {a,u,v}=make();fire(a,u,v);v.y=.53;impact(a);assert.equal(v.hp,1200);
 assert.equal(a.championProjectileHistoryV453Dev42.at(-1).reason,'sem_alvo');assert.equal(u.skillCds.Q,5.5);
});
test('projectile cannot reach enemy behind intervening real wall',()=>{
 const {a,u,v}=make();let pair=null;
 for(let x=.40;x<=.61&&!pair;x+=.01)for(let y=.40;y<=.61&&!pair;y+=.01){
  const st={x:+x.toFixed(4),y:+y.toFixed(4)};if(!a.walkable(st.x,st.y))continue;
  for(const off of [[.035,0],[0,.035],[-.035,0],[0,-.035]]){
   const en={x:st.x+off[0],y:st.y+off[1]};if(a.walkable(en.x,en.y)&&a.mapDistance(st,en)<1200&&a.obstacleLine(st,en)){pair=[st,en];break}
  }
 }
 assert.ok(pair);Object.assign(u,pair[0]);Object.assign(v,pair[1]);fire(a,u,v);impact(a);
 assert.equal(v.hp,1200);assert.equal(a.championProjectileHistoryV453Dev42.at(-1).reason,'parede');
});
test('projectile guard activated in transit blocks impact and refund',()=>{
 const {a,u,v}=make();fire(a,u,v);v.projectileGuardUntil=5;impact(a);
 assert.equal(v.hp,1200);assert.equal(u.skillCds.Q,5.5);
 assert.equal(a.championProjectileHistoryV453Dev42.at(-1).reason,'bloqueio_projétil');
});
test('projectile guard expiring by impact time permits collision',()=>{
 const {a,u,v}=make();v.projectileGuardUntil=.5;fire(a,u,v);impact(a);assert.equal(v.hp,1035)
});
test('spell shield gained in transit consumes shield, not on-hit but refunds cooldown',()=>{
 const {a,u,v}=make();fire(a,u,v);a.applyEffectV41(v,'spell_shield',{source:v,duration:10});impact(a);
 assert.equal(v.hp,1200);assert.equal(u.skillCds.Q,4);assert.ok(!a.effectResolverV41().has(v,'spell_shield'));
});
test('shield gained during travel absorbs impact and on-hit',()=>{
 const {a,u,v}=make();fire(a,u,v);v.shield=400;impact(a);assert.equal(v.hp,1200);assert.equal(v.shield,235);
});
test('pending projectile is reproduced deterministically by snapshot and replay',()=>{
 const {a,u,v}=make();fire(a,u,v);const snap=a.snapshotV40(),b=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(checksumV40(snap),checksumV40(b.snapshotV40()));impact(a);impact(b);
 assert.equal(b.units.find(x=>x.id===v.id).hp,v.hp);
 assert.deepEqual(b.championProjectileHistoryV453Dev42,a.championProjectileHistoryV453Dev42);
});
test('old snapshot without dev42 keys remains readable',()=>{
 const {a}=make();const s=a.snapshotV40();delete s.state.championProjectilesV453Dev42;delete s.state.championProjectileSeqV453Dev42;
 for(const u of s.state.units)delete u.ireliaMarkV453Dev42;
 const b=Arena.fromSnapshotV40(map,mask,s);assert.deepEqual(b.championProjectilesV453Dev42,[]);
 assert.equal(b.units[0].ireliaMarkV453Dev42,null);
});
test('Irelia no longer dashes while rooted or grounded, without spending mana',()=>{
 for(const cc of ['root','grounded']){
  const {a,u,v}=make('Irelia');a.applyEffectV41(u,cc,{source:v,duration:5});const x=u.x;
  const q=a.castChampionOnHitV453Dev41(u,'Q',v);assert.equal(q.ok,false);assert.equal(q.reason,'deslocamento_interrompido');
  assert.equal(u.x,x);assert.equal(u.mana,400);
 }
});
test('Irelia Unsteady mark must originate from her E or R contract, not Q',()=>{
 const {a,u,v}=make('Irelia');assert.equal(a.markIreliaTargetV453Dev42(u,v,'Q').ok,false);
 const q=a.castChampionOnHitV453Dev41(u,'Q',v);assert.equal(q.ok,true);
 assert.equal(v.ireliaMarkV453Dev42,null);
});
test('Irelia marked target consumes Unsteady on collision and Q cooldown reduces to 0.2s',()=>{
 const {a,u,v}=make('Irelia');assert.equal(a.markIreliaTargetV453Dev42(u,v,'E').ok,true);
 const q=a.castChampionOnHitV453Dev41(u,'Q',v);assert.equal(q.hitId,v.id);
 assert.equal(v.ireliaMarkV453Dev42,null);assert.equal(u.skillCds.Q,.2);
});
test('expired marks do not reset Q',()=>{
 const {a,u,v}=make('Irelia');a.markIreliaTargetV453Dev42(u,v,'E');a.gameTime=6;
 a.castChampionOnHitV453Dev41(u,'Q',v);assert.equal(u.skillCds.Q,17);
});
test('another Irelia cannot consume a mark owned by different caster',()=>{
 const {a,u,v}=make('Irelia');a.markIreliaTargetV453Dev42(u,v,'R');
 const other=structuredClone(u);other.id='blue_other42';a.units.push(other);other.skillCds={Q:0,W:0,E:0,R:0};
 const result=a.castChampionOnHitV453Dev41(other,'Q',v);assert.equal(result.ok,true);
 assert.equal(v.ireliaMarkV453Dev42?.ownerId,u.id);assert.ok(other.skillCds.Q>=7);
});
test('Irelia spell shield prevents mark consumption and cooldown refund',()=>{
 const {a,u,v}=make('Irelia');a.markIreliaTargetV453Dev42(u,v,'E');a.applyEffectV41(v,'spell_shield',{source:v,duration:10});
 a.castChampionOnHitV453Dev41(u,'Q',v);assert.equal(v.ireliaMarkV453Dev42.ownerId,u.id);
 assert.equal(u.skillCds.Q,11);
});
test('Node and browser share deferred projectile and mark methods',()=>{
 const browser=fs.readFileSync(new URL('../engine.browser.js',import.meta.url),'utf8');const ctx={window:{}};
 vm.createContext(ctx);vm.runInContext(browser,ctx);
 for(const key of ['castEzrealMysticShotV453Dev42','advanceChampionProjectilesV453Dev42','markIreliaTargetV453Dev42'])
 assert.equal(typeof ctx.window.CoachArena.Arena.prototype[key],'function');
});
console.log('DEV42 '+count+'/'+count+' PASS');
