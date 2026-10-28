import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,OBJECTIVE_RULES_V45} from '../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const make=()=>new Arena(map,mask,{mode:'manual',seed:2621,roundSeconds:10});
let total=0;const test=(name,fn)=>{fn();total++;console.log('✓ DEV20 '+name);};
function eye(a,u){a.phase='executing';a.gameTime=905;u.hp=u.maxHp;u.trinket='stealth';a.heraldEyeV45={owner:u.team,x:u.x,y:u.y,dropAt:905,expiresAt:925,holderId:null};assert.equal(a.pickupHeraldEyeV45(u.id).ok,true);}
function tower(a,team='red',lane='mid'){return a.structures.find(s=>s.team===team&&s.type==='tower'&&s.lane===lane&&a.structureVulnerable(s));}

test('Arauto 26.1: cabeçada de 3000, vida por nível, sem duplicar recompensa',()=>{
 const a=make(),u=a.units.find(v=>v.id==='blue_JG');eye(a,u);
 assert.equal(OBJECTIVE_RULES_V45.herald.chargeDamage,3000);
 const r=a.summonHeraldV45(u.id,{lane:'mid'});assert.equal(r.ok,true);
 assert.equal(a.summonHeraldV45(u.id).ok,false);
 const m=a.heraldMercenariesV45[0];assert.equal(m.lane,'mid');assert.ok(m.maxHp>=2500);assert.equal(m.hp,m.maxHp);
});

test('portador escolhido ordena posição e só invoca depois de alcançá-la',()=>{
 const a=make(),u=a.units.find(v=>v.id==='blue_JG');eye(a,u);
 const here=a.lanes.mid.path.find(p=>a.walkable(p.x,p.y));assert.ok(here);
 const r=a.orderHeraldSummonV452d4Dev20('blue',u.id,here,'mid');assert.equal(r.ok,true,JSON.stringify(r));
 assert.equal(a.heraldMercenariesV45.length,0);assert.equal(u.trinket,'herald_eye');
 assert.equal(a.orderHeraldSummonV452d4Dev20('red',u.id,here,'mid').ok,false);
 u.x=here.x;u.y=here.y;a.gameTime++;a.advanceHeraldCarrierV452d4Dev20(u);
 assert.equal(a.heraldMercenariesV45.length,1);assert.equal(a.heraldMercenariesV45[0].lane,'mid');
 assert.notEqual(u.trinket,'herald_eye');
});

test('torre sofre primeira cabeçada uma vez e Arauto continua ataques básicos',()=>{
 const a=make(),u=a.units.find(v=>v.id==='blue_JG');eye(a,u);a.summonHeraldV45(u.id,{lane:'mid'});
 const merc=a.heraldMercenariesV45[0],t=tower(a);assert.ok(t);
 merc.x=t.x;merc.y=t.y;t.hp=9000;
 const oldMercHp=merc.hp;
 a.gameTime++;a.advanceObjectivesV45();
 assert.equal(merc.charges,1);assert.deepEqual(merc.hitTowerIds,[t.id]);
 assert.ok(t.hp<=6000,'turret must lose 3000 HP');
 assert.ok(merc.hp<oldMercHp,'charge recoil');const last=t.hp;
 a.gameTime+=2;a.advanceObjectivesV45();assert.equal(merc.charges,1);assert.ok(t.hp<last,'basic siege damage');
});

test('se a primeira torre cai, Arauto vivo passa à segunda, sem repetir a primeira',()=>{
 const a=make(),u=a.units.find(v=>v.id==='blue_JG');eye(a,u);a.summonHeraldV45(u.id,{lane:'mid'});
 const m=a.heraldMercenariesV45[0],first=tower(a);assert.ok(first);
 first.hp=2200;m.x=first.x;m.y=first.y;
 a.gameTime++;a.advanceObjectivesV45();assert.equal(first.alive,false);assert.equal(m.charges,1);
 const second=tower(a);assert.ok(second&&second.id!==first.id);m.x=second.x;m.y=second.y;a.gameTime+=7;a.advanceObjectivesV45();
 const secondDamage=second.maxHp-second.hp;
 assert.equal(m.charges,2);assert.equal(new Set(m.hitTowerIds).size,2);
 assert.ok(secondDamage>=1900&&secondDamage<=2100,`Second charge should be ~2000 true damage: ${secondDamage}`);
});

test('torre atira no Arauto sem minions tankando e pode matá-lo',()=>{
 const a=make(),u=a.units.find(v=>v.id==='blue_JG');eye(a,u);a.summonHeraldV45(u.id,{lane:'mid'});
 const m=a.heraldMercenariesV45[0],t=tower(a);assert.ok(t);
 a.minions=[];for(const v of a.units){v.hp=0;v.deadUntil=100000;}
 m.x=t.x;m.y=t.y;m.hp=200;t.lastShot=-10;a.gameTime++;
 // isolate merc turret selection from other combat
 a.resolveCombat();assert.ok(m.hp<=0,'turret must kill the exposed Herald');
});

test('com minion tankando torre, Arauto não é o alvo principal',()=>{
 const a=make(),u=a.units.find(v=>v.id==='blue_JG');eye(a,u);a.summonHeraldV45(u.id,{lane:'mid'});
 const m=a.heraldMercenariesV45[0],t=tower(a);assert.ok(t);
 a.minions=[{id:'tank_blue',team:'blue',kind:'melee',lane:'mid',x:t.x,y:t.y,hp:500,maxHp:500,armor:0,spawnAt:0,range:.02,progress:.6,interval:3,attackAt:99999,damage:0}];
 for(const v of a.units){v.hp=0;v.deadUntil=100000;}
 m.x=t.x;m.y=t.y;t.lastShot=-10;const hp=m.hp;a.gameTime++;a.buildMinionIndex();a.resolveCombat();
 assert.equal(m.hp,hp);assert.ok(a.minions[0]?.hp<500);
});

test('snapshot e replay preservam portador, rota, cabeçadas e HP do Arauto',()=>{
 const a=make(),u=a.units.find(v=>v.id==='blue_JG');eye(a,u);
 const p=a.lanes.mid.path.find(p=>a.walkable(p.x,p.y));a.orderHeraldSummonV452d4Dev20('blue',u.id,p,'mid');
 const copy=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.deepEqual(copy.units.find(v=>v.id===u.id).heraldSummonOrderV452d4Dev20,u.heraldSummonOrderV452d4Dev20);
 u.x=p.x;u.y=p.y;const v=copy.units.find(v=>v.id===u.id);v.x=p.x;v.y=p.y;
 a.gameTime++;copy.gameTime++;a.advanceHeraldCarrierV452d4Dev20(u);copy.advanceHeraldCarrierV452d4Dev20(v);
 assert.deepEqual(copy.heraldMercenariesV45,a.heraldMercenariesV45);
});
console.log(`V4.5.2d-4-dev20: ${total}/7 PASS`);
// Swiftplay's 2026 objective schedule excludes Rift Herald entirely.
{
 const a=new Arena(map,mask,{mode:'bot',riftMode:'swiftplay',seed:26});a.gameTime=900;a.phase='executing';a.updateObjectives();
 assert.equal(a.camps.some(c=>c.timerKey==='herald'&&c.alive),false);
 assert.notEqual(a.botEpicTargetV452d4Dev20('blue')?.kind,'herald');
 console.log('✓ DEV20 Swiftplay não possui Arauto no patch 26.1');
}
