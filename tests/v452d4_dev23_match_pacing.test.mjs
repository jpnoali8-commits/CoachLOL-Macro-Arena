import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const raw=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const make=(seed=23)=>new Arena(raw('coachlol_map_v6.json'),raw('masks_128.json'),{seed,mode:'bot',roundSeconds:10});
let count=0;function test(name,fn){fn();count++;console.log(`✓ DEV23 ${name}`)}

test('HP oficial de torres exteriores preservado; meta 30min não é limite rígido',()=>{
 const a=make();assert.equal(a.structures.find(s=>s.id==='red_top_t1').maxHp,9000);
 a.gameTime=1800;a.tick();assert.equal(a.ended,false);assert.equal(a.winner,null);
});
test('redução gradual de resistência da torre entre 11 e 15 minutos sem alterar HP',()=>{
 const a=make(),s=a.structures.find(x=>x.id==='red_top_t1'),hp=s.hp;
 for(const [time,armor,magic] of [[600,60,60],[660,50,45],[780,30,15],[900,20,0],[1800,20,0]]){
  a.gameTime=time;assert.equal(a.structureResistanceV452d4Dev23(s,'physical'),armor);
  assert.equal(a.structureResistanceV452d4Dev23(s,'magic'),magic);
 }
 assert.equal(s.hp,hp);assert.equal(a.structureResistanceV452d4Dev23(a.structures.find(x=>x.id==='red_top_t2'),'physical'),60);
});
test('previsão e dano de minion contra torre usam a mesma resistência decrescente',()=>{
 const a=make(),m={id:'dev23_m',kind:'caster',team:'blue',lane:'top',damage:35,x:.30,y:.068,range:.04,hp:500,maxHp:500},s=a.structures.find(x=>x.id==='red_top_t1');
 a.gameTime=1500;const expected=a.predictMinionAttackDamageV452c(m,s);const before=s.hp;
 a.damage(s,a.baronMinionAttackDamageV452d(m,s),m,'physical','basic');assert.equal(before-s.hp,expected);
});
test('IA prioriza rota legal com inibidor destruído e Nexus vulnerável',()=>{
 const a=make(),inhib=a.structures.find(s=>s.id==='red_top_inhibitor');inhib.hp=0;inhib.alive=false;for(const suffix of ['t1','t2','t3']){const t=a.structures.find(s=>s.id===`red_top_${suffix}`);t.alive=false;t.hp=0;}
 a.gameTime=1750;assert.equal(a.botSiegeFocusLaneV452d4Dev22('blue'),'top');
 const guard=a.structures.find(s=>s.id==='red_nexus_guard_1');assert.equal(a.structureVulnerable(guard),true);
 const m={id:'dev23_front',kind:'melee',team:'blue',lane:'top',hp:450,maxHp:450,progress:.94,spawnAt:0,x:inhib.x,y:inhib.y,range:.014,damage:18,speed:.013,interval:1.6,attackAt:0};a.minions=[m];
 a.botPlan('blue');const adc=a.units.find(u=>u.id==='blue_ADC');
 assert.equal(adc.botSiegeLaneV452d4Dev22,'top');assert.equal(adc.order.kind,'push');
});
test('sem wave real, bots não ganham push nem dano de graça',()=>{
 const a=make(),inhib=a.structures.find(s=>s.id==='red_top_inhibitor');inhib.alive=false;inhib.hp=0;for(const suffix of ['t1','t2','t3']){const t=a.structures.find(s=>s.id===`red_top_${suffix}`);t.alive=false;t.hp=0;}a.gameTime=1750;a.minions=[];
 const before=a.structures.map(x=>x.hp);a.botPlan('blue');const adc=a.units.find(u=>u.id==='blue_ADC');
 assert.equal(adc.order.kind,'farm');assert.deepEqual(a.structures.map(x=>x.hp),before);
});
test('wave só converge para torres do Nexus quando inibidor caiu; sem teleporte',()=>{
 const a=make(),line=a.lanes.top;const m={id:'dev23_m',team:'blue',lane:'top',kind:'siege',progress:.976,x:line.path.at(-1).x,y:line.path.at(-1).y,range:.055,damage:48,speed:.012,hp:835,maxHp:835,spawnAt:0,attackAt:0,interval:2};
 a.gameTime=1750;a.minions=[m];
 assert.equal(a.nexusWaveObjectiveV452d4Dev23(m),null);
 const inhib=a.structures.find(s=>s.id==='red_top_inhibitor');inhib.alive=false;inhib.hp=0;
 assert.ok(a.nexusWaveObjectiveV452d4Dev23(m));
 const x=m.x,y=m.y,guards=a.structures.filter(s=>s.team==='red'&&s.lane==='nexus');const oldHp=guards.map(g=>g.hp);
 a.buildMinionIndex();a.moveMinions();assert.ok(a.walkable(m.x,m.y));
 assert.ok(a.mapDistance({x,y},m)<600,'movimento limitado por velocidade da unidade');
 assert.deepEqual(guards.map(g=>g.hp),oldHp,'movimentação não cria dano à torre');
});
test('estado de aproximação ao Nexus persiste em snapshot/replay',()=>{
 const a=make(),s=a.structures.find(x=>x.id==='red_top_inhibitor');s.alive=false;s.hp=0;a.gameTime=1600;
 const m={id:'dev23_m',team:'blue',lane:'top',kind:'siege',progress:.98,x:.82,y:.09,range:.05,damage:48,speed:.012,hp:835,maxHp:835,spawnAt:0,attackAt:0,interval:2};a.minions=[m];a.buildMinionIndex();a.moveMinions();
 const b=Arena.fromSnapshotV40(a.map,a.mask,a.snapshotV40());
 assert.deepEqual(b.minions[0].nexusSiegeGoalV452d4Dev23,a.minions[0].nexusSiegeGoalV452d4Dev23);
 assert.deepEqual(b.minions[0].nexusSiegePathV452d4Dev23,a.minions[0].nexusSiegePathV452d4Dev23);
});
test('bot compra item real durante retorno à fonte e não altera combate fora da loja',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_ADC'),p=a.map.objects.find(x=>x.id==='blue_spawn_shop');
 a.gameTime=1000;u.x=p.x;u.y=p.y;u.gold=3600;u.awaitingShop=true;
 const oldGold=u.gold,oldAd=u.ad;
 assert.equal(a.botBuyUpgradeV452d4Dev23('blue',u),true);
 assert.ok(u.items.includes('infinity_edge'));
 assert.ok(u.ad>oldAd&&u.gold<oldGold);
 u.awaitingShop=false;assert.equal(a.botBuyUpgradeV452d4Dev23('blue',u),false);
});
test('waves ganham atributos a cada 90s após 5min, com teto e sem quebrar farm inicial',()=>{
 const a=make();
 for(const kind of ['melee','caster','siege','super']){
  const early=a.waveStatsV452d4Dev23(kind,300),slightly=a.waveStatsV452d4Dev23(kind,390),late=a.waveStatsV452d4Dev23(kind,1800);
  assert.equal(early.upgradeLevelV452d4Dev23,0);
  assert.ok(slightly.hp>early.hp&&slightly.damage>early.damage);
  assert.ok(late.hp>=slightly.hp&&late.damage>=slightly.damage);
  const extreme=a.waveStatsV452d4Dev23(kind,99999);
  assert.ok(Number.isFinite(extreme.hp)&&Number.isFinite(extreme.damage));
  assert.deepEqual(extreme,a.waveStatsV452d4Dev23(kind,999999));
 }
});
console.log(`V4.5.2d-4-dev23 ${count}/9 PASS`);
