import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {Arena,CHAMPION_ONHIT_SKILLS_V453_DEV41,abilityRule,checksumV40} from '../engine.mjs';
const read=n=>JSON.parse(fs.readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const fresh=()=>new Arena(map,mask,{seed:41,roundSeconds:10,draft:{blue:{ADC:'Ezreal',TOP:'Irelia'}}});
function scene(champ='Ezreal'){
 const a=fresh();a.dev41CompatibilityInstantQ=true;const u=a.units.find(x=>x.team==='blue'&&x.champ===champ),v=a.units.find(x=>x.team==='red'&&x.role==='MID');
 Object.assign(u,{x:.5,y:.5,mana:400,maxMana:400,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0},items:['recurve_bow'],ad:100,ap:0,hp:500,maxHp:1000});
 Object.assign(v,{x:.532,y:.5,armor:0,mr:0,hp:1200,maxHp:1200,shield:0,projectileGuardUntil:0});
 a.visible=()=>true;return {a,u,v};
}
let tests=0;
function test(name,callback){callback();tests++;console.log('✓ DEV41 '+name);}

test('Registry covers exactly Ezreal Q and Irelia Q, ordinary kits remain training fallback',()=>{
 assert.deepEqual(Object.keys(CHAMPION_ONHIT_SKILLS_V453_DEV41).sort(),['Ezreal','Irelia']);
 const {u}=scene();assert.equal(abilityRule(u,'Q').range,1200);assert.equal(abilityRule(u,'W').kind,'training');
 assert.equal(CHAMPION_ONHIT_SKILLS_V453_DEV41.Ezreal.kind,'line_onhit');
});
test('Ezreal Q hits first enemy minion and procs on-hit there, not the champion',()=>{
 const {a,u,v}=scene();const m={id:'m41',kind:'melee',team:'red',x:.517,y:.5,hp:400,maxHp:400,armor:0,mr:0,spawnAt:0,lane:'mid'};a.minions.push(m);
 const res=a.castChampionOnHitV453Dev41(u,'Q',v);
 assert.equal(res.ok,true);assert.equal(res.hitId,m.id);assert.equal(v.hp,1200);assert.equal(m.hp,400-(20+130+15));
 assert.equal(u.mana,372);assert.ok(u.skillCds.Q>0&&u.skillCds.Q<5.5);
});
test('Off-axis minion does not intercept Ezreal Q',()=>{
 const {a,u,v}=scene();a.minions.push({id:'m41_off',kind:'melee',team:'red',x:.517,y:.51,hp:400,maxHp:400,armor:0,spawnAt:0,lane:'mid'});
 const res=a.castChampionOnHitV453Dev41(u,'Q',v);assert.equal(res.hitId,v.id);assert.equal(v.hp,1200-165);
});
test('Real board wall blocks Ezreal projectile and prevents on-hit stack',()=>{
 const {a,u,v}=scene();const wall={x:.50,y:.56};assert.equal(a.walkable(wall.x,wall.y),false);
 // Target beyond the authored wall strip, but still within the spell's range.
 let blockedPair=null;
 for(let x=.40;x<=.61&&!blockedPair;x+=.01)for(let y=.40;y<=.61&&!blockedPair;y+=.01){
  const st={x:+x.toFixed(4),y:+y.toFixed(4)};
  if(!a.walkable(st.x,st.y))continue;
  for(const off of [[.035,0],[0,.035],[-.035,0],[0,-.035]]){
   const en={x:st.x+off[0],y:st.y+off[1]};
   if(a.walkable(en.x,en.y)&&a.mapDistance(st,en)<1200&&a.obstacleLine(st,en)){blockedPair=[st,en];break;}
  }
 }
 assert.ok(blockedPair,'authorial wall crossing fixture exists');
 Object.assign(u,blockedPair[0]);Object.assign(v,blockedPair[1]);
 const hp=v.hp,spent=u.mana;const res=a.castChampionOnHitV453Dev41(u,'Q',v);
 assert.equal(res.ok,true);assert.equal(res.blocked,'parede');assert.equal(v.hp,hp);assert.equal(u.mana,spent-28);
});
test('Projectile guard intercepts Ezreal Q with no on-hit proc or refund',()=>{
 const {a,u,v}=scene();v.projectileGuardUntil=10;const q=a.castChampionOnHitV453Dev41(u,'Q',v);
 assert.equal(q.ok,true);assert.equal(q.hitId,null);assert.equal(q.blocked,'bloqueio_projétil');assert.equal(u.skillCds.Q,5.5);assert.equal(v.hp,1200);
});
test('Spell shield intercepts Ezreal Q: shield spent, zero damage/proc, cooldown refund on impact',()=>{
 const {a,u,v}=scene();a.applyEffectV41(v,'spell_shield',{source:v,duration:10});
 const q=a.castChampionOnHitV453Dev41(u,'Q',v);assert.equal(q.hitId,v.id);assert.equal(v.hp,1200);
 assert.ok(!a.effectResolverV41().has(v,'spell_shield'));assert.equal(u.skillCds.Q,4);
});
test('Ordinary shield absorbs Ezreal Q and its recurve proc without direct HP loss',()=>{
 const {a,u,v}=scene();v.shield=500;const q=a.castChampionOnHitV453Dev41(u,'Q',v);
 assert.equal(q.hitId,v.id);assert.equal(v.hp,1200);assert.equal(v.shield,335);
});
test('Ezreal Q cannot double-cast on same tick or while cooldown remains',()=>{
 const {a,u,v}=scene();assert.equal(a.castChampionOnHitV453Dev41(u,'Q',v).ok,true);
 const before=u.mana;assert.equal(a.castChampionOnHitV453Dev41(u,'Q',v).ok,false);
 assert.equal(u.mana,before);a.gameTime=1;assert.equal(a.castChampionOnHitV453Dev41(u,'Q',v).ok,false);
});
test('Irelia Q traverses a clear dash path and applies on-hit as a skill (not basic attack)',()=>{
 const {a,u,v}=scene('Irelia');const origin={x:u.x,y:u.y};
 u.items=['recurve_bow','rapid_firecannon'];u.energizeStacksV453Dev38=90;
 const q=a.castChampionOnHitV453Dev41(u,'Q',v);
 assert.equal(q.ok,true);assert.equal(q.hitId,v.id);assert.equal(v.hp,1200-(5+70+15));
 assert.ok(a.mapDistance(u,v)<a.mapDistance(origin,v));assert.ok(u.hp>500);
 assert.equal(u.energizeStacksV453Dev38,100,'dash charges energy from physical movement');
});
test('Irelia Q has no ability to dash through board wall; no resources spent',()=>{
 const {a,u,v}=scene('Irelia');
 let pair=null;
 for(let x=.40;x<=.61&&!pair;x+=.01)for(let y=.40;y<=.61&&!pair;y+=.01){
  const st={x:+x.toFixed(4),y:+y.toFixed(4)};if(!a.walkable(st.x,st.y))continue;
  for(const off of [[.035,0],[0,.035],[-.035,0],[0,-.035]]){
   const en={x:st.x+off[0],y:st.y+off[1]};
   if(a.walkable(en.x,en.y)&&a.mapDistance(st,en)<600&&a.obstacleLine(st,en)){pair=[st,en];break;}
  }
 }
 assert.ok(pair,'real walls within 600 units');Object.assign(u,pair[0]);Object.assign(v,pair[1]);
 const mana=u.mana,pos={x:u.x,y:u.y};const q=a.castChampionOnHitV453Dev41(u,'Q',v);
 assert.equal(q.ok,false);assert.equal(q.reason,'parede');assert.equal(u.mana,mana);assert.deepEqual({x:u.x,y:u.y},pos);
});
test('Irelia Q kills a vulnerable enemy, refunds Q cooldown and awards one kill',()=>{
 const {a,u,v}=scene('Irelia');v.hp=10;u.items=['recurve_bow'];
 const q=a.castChampionOnHitV453Dev41(u,'Q',v);
 assert.equal(q.ok,true);assert.equal(v.hp,0);assert.equal(u.skillCds.Q,0);assert.equal(u.kills,1);assert.equal(v.deaths,1);
});
test('Irelia Q spell shield prevents the on-hit proc and heal but preserves path',()=>{
 const {a,u,v}=scene('Irelia');a.applyEffectV41(v,'spell_shield',{source:v,duration:10});const hp=u.hp;
 const q=a.castChampionOnHitV453Dev41(u,'Q',v);
 assert.equal(q.ok,true);assert.equal(q.hitId,null);assert.equal(q.blocked,'escudo_feitiço');assert.equal(u.hp,hp);
 assert.equal(v.hp,1200);assert.ok(!a.effectResolverV41().has(v,'spell_shield'));
});
test('Irelia Q stasis blocks damage, on-hit effects and healing',()=>{
 const {a,u,v}=scene('Irelia');v.stasisUntil=10;const hp=u.hp;
 const q=a.castChampionOnHitV453Dev41(u,'Q',v);
 assert.equal(q.ok,true);assert.equal(q.hitId,null);assert.equal(v.hp,1200);assert.equal(hp,u.hp);
});
test('Combo queue uses champion-specific Ezreal Q, consumes one step, no generic bonus',()=>{
 const {a,u,v}=scene();u.order={kind:'attack',targetId:v.id,combo:['Q'],comboIndex:0,comboNextAt:0};
 a.duelPermission=()=>true;a.resolveQueuedCombos();
 assert.equal(u.order.comboIndex,1);assert.equal(v.hp,1200-165);assert.equal(u.mana,372);
});
test('Combo queue uses champion-specific Irelia Q and validates dash',()=>{
 const {a,u,v}=scene('Irelia');u.order={kind:'attack',targetId:v.id,combo:['Q'],comboIndex:0,comboNextAt:0};
 a.duelPermission=()=>true;a.resolveQueuedCombos();
 assert.equal(u.order.comboIndex,1);assert.ok(u.x>.5);assert.equal(v.hp,1200-90);
});
test('Auto attack explicit Q order routes Ezreal to champion resolver, no generic Q burst',()=>{
 const {a,u,v}=scene();a.units.filter(x=>x!==u&&x!==v).forEach(x=>x.hp=0);
 a.minions=[];u.range=.08;u.order={kind:'attack',targetId:v.id,spell:'Q'};
 a.duelPermission=()=>true;a.resolveCombat();
 const q=a.actionJournalV40.find(e=>e.actorId===u.id&&e.slot==='Q');
 assert.equal(q?.source,'champion_onhit_v453_dev41');assert.equal(q.cost,28);
 assert.equal(u.skillCds.Q,4);assert.equal(u.mana,372);
});
test('Snapshots/replays persist skill cooldown and displacement deterministically',()=>{
 const {a,u,v}=scene('Irelia');a.castChampionOnHitV453Dev41(u,'Q',v);const snap=a.snapshotV40();const b=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(checksumV40(snap),checksumV40(b.snapshotV40()));
 assert.equal(b.units.find(x=>x.id===u.id).x,u.x);
 assert.equal(b.units.find(x=>x.id===u.id).skillCds.Q,u.skillCds.Q);
});
test('Node and browser use the same exported per-champion registry and resolver',()=>{
 const text=fs.readFileSync(new URL('../engine.browser.js',import.meta.url),'utf8');
 const ctx={window:{}};vm.createContext(ctx);vm.runInContext(text,ctx);
 assert.deepEqual(Object.keys(ctx.window.CoachArena.CHAMPION_ONHIT_SKILLS_V453_DEV41).sort(),['Ezreal','Irelia']);
 assert.equal(typeof ctx.window.CoachArena.Arena.prototype.castChampionOnHitV453Dev41,'function');
});
console.log('DEV41 '+tests+'/'+tests+' PASS');
