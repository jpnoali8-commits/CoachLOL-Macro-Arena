import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const make=()=>new Arena(map,mask,{mode:'manual',seed:21,roundSeconds:10});
let n=0;function test(label,fn){fn();n++;console.log('✓ DEV21 '+label)}
function setup(){const a=make(),u=a.units.find(x=>x.id==='blue_TOP'),enemy=a.units.find(x=>x.id==='red_TOP');a.phase='executing';a.gameTime=1200;
 const merc={id:'herald_merc_dev21',team:'red',lane:'mid',x:.5,y:.5,spawnAt:1150,expiresAt:1500,lastCharge:0,
 lastBasicAttack:0,charges:0,hitTowerIds:[],hp:5000,maxHp:5000,armor:90,mr:60,facingX:1,facingY:0,eyeReadyAtV452d4Dev21:1200};
 a.heraldMercenariesV45=[merc];u.hp=u.maxHp;u.x=.5-100/a.worldWidth;u.y=.5;u.attackAt=0;u.autoAttack=true;u.manualMoveHold=false;
 enemy.x=.1;enemy.y=.1;
 return {a,u,enemy,merc};}

test('olho posterior do Arauto invocado: 40% HP máximo de bônus verdadeiro',()=>{
 const {a,u,merc}=setup(),hp=merc.hp;
 const result=a.attackSummonedHeraldV452d4Dev21(u,merc,120);
 assert.equal(result.ok,true);assert.equal(result.eyeDamage,2000);
 assert.equal(merc.eyeHitsV452d4Dev21,1);assert.ok(hp-merc.hp>2000);
 assert.equal(merc.eyeReadyAtV452d4Dev21,1203);
});
test('olho fechado bloqueia proc repetido e reabre aos 3s',()=>{
 const {a,u,merc}=setup();a.attack(u,merc,50);
 let second=a.attackSummonedHeraldV452d4Dev21(u,merc,40);assert.equal(second.eyeDamage,0);
 a.gameTime=1202;assert.equal(a.attackSummonedHeraldV452d4Dev21(u,merc,40).eyeDamage,0);
 a.gameTime=1203;assert.equal(a.attackSummonedHeraldV452d4Dev21(u,merc,40).eyeDamage,2000);
 assert.equal(merc.eyeHitsV452d4Dev21,2);
});
test('ataque frontal causa apenas dano normal e não fecha o olho',()=>{
 const {a,u,merc}=setup();u.x=.5+100/a.worldWidth;
 assert.equal(a.attackSummonedHeraldV452d4Dev21(u,merc,90).eyeDamage,0);
 assert.equal(merc.eyeHitsV452d4Dev21||0,0);
});
test('habilidades não acionam o olho e ataques de aliados não podem ferir o próprio Arauto',()=>{
 const {a,u,merc}=setup();assert.equal(a.attackSummonedHeraldV452d4Dev21(u,merc,150,'skill').eyeDamage,0);
 assert.equal(merc.eyeReadyAtV452d4Dev21,1200);merc.team='blue';
 assert.equal(a.attackSummonedHeraldV452d4Dev21(u,merc,90).ok,false);
});
test('alcance, visão e fonte morta impedem ataques diretos',()=>{
 const {a,u,merc}=setup();u.x=.05;assert.equal(a.attackSummonedHeraldV452d4Dev21(u,merc,100).ok,false);
 u.x=.5-100/a.worldWidth;u.hp=0;assert.equal(a.attackSummonedHeraldV452d4Dev21(u,merc,100).ok,false);
 u.hp=u.maxHp;const original=a.canSeePoint.bind(a);a.canSeePoint=()=>false;
 assert.equal(a.attackSummonedHeraldV452d4Dev21(u,merc,100).ok,false);a.canSeePoint=original;
});
test('olho permite que campeões matem rapidamente o Arauto sem acertar torre artificialmente',()=>{
 const {a,u,merc}=setup();for(let i=0;i<3&&merc.hp>0;i++){a.gameTime=1200+i*3;a.attackSummonedHeraldV452d4Dev21(u,merc,30);}
 assert.equal(merc.hp,0);assert.equal(merc.slainByV452d4Dev21,u.id);assert.ok(a.events.some(e=>e.kind==='herald_mercenary_destroyed'));
 const structures=a.structures.filter(x=>x.team==='blue'&&x.type==='tower');assert.ok(structures.every(x=>x.hp===x.maxHp));
});
test('ordem de ataque exige visão e não causa dano sem executar ataque básico',()=>{
 const {a,u,merc}=setup();const hp=merc.hp;
 assert.equal(a.orderAttackSummonedHeraldV452d4Dev21('blue',u.id,merc.id).ok,true);
 assert.equal(u.order.kind,'attack_herald');assert.equal(merc.hp,hp);
 assert.equal(a.orderAttackSummonedHeraldV452d4Dev21('red',u.id,merc.id).ok,false);
});
test('auto-ataque do motor usa cooldown normal para atacar o Arauto inimigo',()=>{
 const {a,u,merc}=setup();u.order={kind:'attack_herald',targetId:merc.id};
 const hp=merc.hp;
 // Other bots and minions are parked away; this probes the standard combat path.
 a.minions=[];for(const other of a.units)if(other.id!==u.id){other.x=.04;other.y=.04;other.attackAt=99999;}
 a.resolveCombat();assert.ok(merc.hp<hp,`esperava dano no Arauto, hp ${merc.hp}`);
 assert.equal(merc.eyeHitsV452d4Dev21,1);
});
test('snapshot preserva HP, cooldown do olho e orientação para replay determinístico',()=>{
 const {a,u,merc}=setup();a.attackSummonedHeraldV452d4Dev21(u,merc,70);
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.deepEqual(b.heraldMercenariesV45[0],merc);
 a.gameTime=1203;b.gameTime=1203;
 const r1=a.attackSummonedHeraldV452d4Dev21(u,merc,30);
 const bu=b.units.find(x=>x.id===u.id),bm=b.heraldMercenariesV45[0];const r2=b.attackSummonedHeraldV452d4Dev21(bu,bm,30);
 assert.deepEqual({hp:merc.hp,dmg:r1.eyeDamage},{hp:bm.hp,dmg:r2.eyeDamage});
});
test('fim de jogo: bot escorta wave real no push sem puxar campeão para trás',()=>{
 const a=make(),u=a.units.find(x=>x.id==='red_TOP');a.gameTime=1300;u.autoFollow=true;u.manualMoveHold=false;u.awaitingShop=false;u.explicitOrder=false;u.plan=null;u.order={kind:'push'};
 const line=a.lanes.top;const location=p=>{const idx=Math.min(line.path.length-1,Math.max(0,Math.round(p*(line.path.length-1))));return line.path[idx]};
 const wave=location(.28);a.minions=[{id:'wave_red',kind:'melee',team:'red',lane:'top',x:wave.x,y:wave.y,progress:.28,hp:150,maxHp:150,spawnAt:0}];
 const goals=[];a.findPath=(src,dest)=>{goals.push(dest);return [dest]};a.moveAlong=()=>0;
 a.autoAdvanceLane(u,200);
 assert.ok(goals.length>0,'deveria perseguir wave aliada');
 const target=goals[0];const stagnant=location(.72);
 assert.ok(a.mapDistance(target,wave)<a.mapDistance(target,stagnant),'deveria escortar wave, não ficar em 72% da rota');
});
console.log(`V4.5.2d-4-dev21 ${n}/10 PASS`);
