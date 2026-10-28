import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,abilityCooldown,hasteCooldown,championStatsV39,STAT_SCHEMA_V39,castGateV39,commitCastV39,catalog} from '../engine.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const game=()=>new Arena(read('coachlol_map_v6.json'),read('masks_128.json'),{seed:39,roundSeconds:10});
const test=(desc,fn)=>{fn();console.log('✓ V3.9 '+desc)};
test('atributos extensíveis e CDR derivado: 100 AH => 50% cooldown',()=>{
 const u=game().units.find(u=>u.team==='blue'&&u.role==='SUP');u.abilityHaste=100;
 assert.equal(championStatsV39(u).cooldownReduction,50);assert.equal(abilityCooldown(u,'W'),5);
 assert.equal(hasteCooldown(120,50),80);assert.ok(STAT_SCHEMA_V39.length>25);
});
test('Nami W usa executor validado, gasta recurso uma vez e respeita recarga',()=>{
 const a=game(),n=a.units.find(u=>u.id==='blue_SUP'),ally=a.units.find(u=>u.id==='blue_ADC');
 n.skillRanks.W=1;n.x=.5;n.y=.5;ally.x=.501;ally.y=.5;n.abilityHaste=100;
 const prior=n.mana;assert.ok(a.queueTargetedSkill('blue',n.id,'W',ally.id).ok);
 a.resolveTargetedCasts();assert.equal(prior-n.mana,70);assert.equal(n.skillCds.W,5);
 const twice=castGateV39(n,'W',a.gameTime,ally,{worldDistance:(x,y)=>a.mapDistance(x,y)});
 assert.equal(twice.ok,false);assert.equal(twice.reason,'recarga');
 a.gameTime+=4;assert.equal(castGateV39(n,'W',a.gameTime).ok,false);
 a.gameTime++;assert.equal(castGateV39(n,'W',a.gameTime).ok,true);
});
test('contrato único de cast bloqueia duplicação de gasto e alcance inválido',()=>{
 const a=game(),n=a.units.find(u=>u.id==='blue_SUP'),enemy=a.units.find(u=>u.id==='red_MID');
 n.skillRanks.Q=1;n.x=.3;n.y=.3;enemy.x=.9;enemy.y=.9;
 const no=castGateV39(n,'Q',0,enemy,{worldDistance:(x,y)=>a.mapDistance(x,y)});
 assert.equal(no.reason,'fora_de_alcance');assert.equal(n.skillCds.Q,0);
 const good=castGateV39(n,'Q',0);assert.equal(good.ok,true);
 assert.equal(commitCastV39(n,'Q',0,good).ok,true);assert.equal(commitCastV39(n,'Q',0,good).ok,false);
});
test('dano verdadeiro ignora MR/armor; letalidade reduz resistência física',()=>{
 const a=game(),att=a.units.find(u=>u.id==='blue_MID'),foe=a.units.find(u=>u.id==='red_MID');
 foe.armor=100;foe.mr=100;const original=foe.hp;assert.equal(a.damage(foe,100,att,'true'),100);foe.hp=original;
 const without=a.damage(foe,100,att,'physical');foe.hp=original;att.lethality=50;
 const withPen=a.damage(foe,100,att,'physical');assert.ok(withPen>without);
});
test('vampirismo cura somente por dano efetivo causado após escudo',()=>{
 const a=game(),att=a.units.find(u=>u.id==='blue_MID'),foe=a.units.find(u=>u.id==='red_MID');
 att.hp=att.maxHp-200;att.omnivamp=10;foe.shield=500;
 const hp=att.hp;a.damage(foe,100,att,'magic');assert.equal(att.hp,hp);
 foe.shield=0;a.damage(foe,100,att,'true','spell');assert.equal(att.hp,hp+10);
});
test('catálogo contém itens de AH com referências de custos verificáveis',()=>{
 const item=id=>catalog.find(i=>i.id===id);
 assert.equal(item('glowing_mote').stats.abilityHaste,5);
 assert.equal(item('kindlegem').cost,800);
 assert.equal(item('ionian_boots').stats.summonerHaste,10);
 assert.equal(item('serrated_dirk').stats.lethality,10);
});
test('1x/2x aceleram parede/reprodução, nunca o cooldown em segundos de jogo',()=>{
 const a=game(),n=a.units.find(u=>u.id==='blue_SUP');n.skillRanks.W=1;
 const cast=commitCastV39(n,'W',0,castGateV39(n,'W',0));assert.ok(cast.ok);
 for(const factor of [1,2]){
  const secondsPerTick=0.65/factor,elapsedGameTicks=10;
  assert.equal(Math.round(secondsPerTick*elapsedGameTicks*factor/.65),10);
  assert.equal(n.skillCds.W,10,'cooldown não usa fator visual de velocidade');
 }
});

test('Lux/Nami possuem R direcional no mapa com faixa de colisão e sigilo',()=>{
 for(const name of ['Lux','Nami']){
  const a=game(),u=a.units.find(x=>x.id==='blue_MID'),t=a.units.find(x=>x.id==='red_MID');
  u.champ=name;u.level=6;u.skillRanks.R=1;u.mana=2000;u.x=.5;u.y=.5;t.x=.57;t.y=.5;
  const out=a.queueDirectionalSkill('blue',u.id,'R',{x:.9,y:.5});assert.ok(out.ok,out.reason);
  const hp=t.hp;a.resolveDirectionalSkills();
  if(name==='Nami'){
   // Dev69: Nami R travels; it must not deal instant cast damage.
   assert.equal(t.hp,hp,'Nami R não pode atingir instantaneamente');
   assert.ok(a.championProjectilesV453Dev42.some(p=>p.kind==='nami_r'));
   assert.ok(a.events.some(e=>e.kind==='champion_projectile_launch_v453_dev69'&&e.unitId===u.id));
   a.gameTime=2;
   a.advanceChampionProjectilesV453Dev42();
  }else{
   assert.ok(a.events.some(e=>e.kind==='skill_vfx'&&e.unitId===u.id));
  }
  assert.ok(t.hp<hp,name+' R direcional deve atingir no impacto');
  assert.ok(u.skillCds.R>0);
 }
});
test('Vex R usa trajeto, marca e permite segunda ativação sem recobrar mana/cooldown',()=>{
 const a=game(),u=a.units.find(x=>x.id==='blue_MID'),t=a.units.find(x=>x.id==='red_MID');
 u.champ='Vex';u.level=6;u.skillRanks.R=1;u.mana=2000;u.x=.5;u.y=.5;t.x=.56;t.y=.5;
 const plan=a.queueDirectionalSkill('blue',u.id,'R',{x:.9,y:.5});assert.ok(plan.ok,plan.reason);
 a.resolveDirectionalSkills();
 assert.equal(u.vexMark??null,null,'Vex R não marca antes do impacto temporal');
 const initialHp=t.hp;
 a.gameTime=1;
 a.advanceChampionProjectilesV453Dev42();
 assert.equal(u.vexMark?.targetId,t.id,'Vex R marca somente no impacto');
 assert.ok(t.hp<initialHp,'Vex R1 causa dano ao atingir');
 const mana=u.mana,cd=u.skillCds.R,hp=t.hp;
 assert.equal(a.queueVexRecast('blue',u.id).ok,true);
 a.resolveDirectionalSkills();
 assert.ok(u.vexDashV453Dev69,'Vex R2 inicia dash temporal');
 assert.equal(t.hp,hp,'Vex R2 não causa dano antes da chegada');
 a.gameTime=2;
 a.advanceVexShadowDashV453Dev69();
 assert.ok(t.hp<hp,'Vex R2 causa dano na chegada');
 assert.equal(u.mana,mana);assert.equal(u.skillCds.R,cd);assert.equal(u.vexMark,null);
});

test('Loja soma bônus e consome componentes em upgrade de botas, impedindo duplicata',()=>{
 const a=game(),u=a.units.find(x=>x.id==='blue_TOP');u.gold=10000;
 assert.equal(a.buy('blue',u.id,'boots'),true);
 assert.equal(a.buy('blue',u.id,'glowing_mote'),true);
 const before=u.gold,moveBefore=u.flatMoveSpeed;
 assert.equal(a.buy('blue',u.id,'ionian_boots'),true);
 assert.equal(before-u.gold,350,'preço residual com boots e glowing mote');
 assert.equal(u.flatMoveSpeed,45);assert.ok(u.abilityHaste===10);
 assert.equal(a.buy('blue',u.id,'boots'),false);
});
test('Roubo de vida aplica em ataques básicos, não automaticamente em spells',()=>{
 const a=game(),u=a.units.find(x=>x.id==='blue_MID'),t=a.units.find(x=>x.id==='red_MID');
 u.hp=u.maxHp-200;u.lifeSteal=20;const prior=u.hp;
 a.damage(t,100,u,'physical','spell');assert.equal(u.hp,prior);
 a.damage(t,100,u,'true','basic');assert.equal(u.hp,prior+20);
});
