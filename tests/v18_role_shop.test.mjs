import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,JUNGLE_PETS,recommendedItems,catalog} from '../engine.mjs';
import {interpretCommands,applyCommands} from '../commands.mjs';
const map=JSON.parse(readFileSync(new URL('../data/coachlol_map_v6.json',import.meta.url)));
const masks=JSON.parse(readFileSync(new URL('../data/masks_128.json',import.meta.url)));
const fresh=(mode='manual')=>new Arena(map,masks,{mode,roundSeconds:10});
const test=(name,f)=>{f(); console.log('✓',name);};
test('suporte recebe Atlas e gasta ouro inicial; demais funções escolhem iniciais',()=>{
 const a=fresh(),sup=a.units.find(v=>v.id==='blue_SUP');
 assert.deepEqual(sup.items,['support_atlas']);assert.equal(sup.gold,100);
 assert.equal(a.units.find(v=>v.id==='blue_JG').items.length,0);
 assert.equal(a.canBuy('blue','blue_ADC','support_atlas').ok,false);
 assert.equal(a.canBuy('blue','blue_ADC','jungle_gustwalker').ok,false);
 assert.equal(a.canBuy('blue','blue_SUP','jungle_mosstomper').ok,false);
 assert.equal(a.canBuy('blue','blue_JG','dorans_blade').ok,false);
 assert.equal(a.canBuy('blue','blue_SUP','support_atlas').ok,false);
});
test('compra de pet manual aplica Smite inicial e bloqueia outros iniciais/pets',()=>{
 const a=fresh(),jg=a.units.find(v=>v.id==='blue_JG');
 assert.equal(a.buy('blue',jg.id,'jungle_mosstomper'),true);
 assert.equal(jg.gold,50);assert.equal(jg.junglePet,'mosstomper');assert.equal(jg.smiteTier,1);assert.equal(a.smitePower(jg),600);
 assert.equal(a.buy('blue',jg.id,'jungle_gustwalker'),false);
 assert.equal(a.buy('blue',jg.id,'dorans_blade'),false);
 assert.ok(recommendedItems(jg).includes('boots'));
 assert.ok(!recommendedItems(jg).includes('jungle_gustwalker'));
});
test('15/35 cargas são thresholds reais; pet evolui e libera slot após 35',()=>{
 const a=fresh(),jg=a.units.find(v=>v.id==='blue_JG');a.buy('blue',jg.id,'jungle_scorchclaw');
 for(let i=0;i<14;i++)a.feedJunglePet(jg);assert.equal(a.smitePower(jg),600);
 a.feedJunglePet(jg);assert.equal(a.smitePower(jg),1000);assert.equal(jg.smiteTier,2);
 for(let i=0;i<20;i++)a.feedJunglePet(jg);assert.equal(a.smitePower(jg),1400);assert.equal(jg.smiteTier,3);
 assert.equal(jg.jungleBuff,'scorchclaw');assert.ok(!jg.items.includes('jungle_scorchclaw'));
 const count=jg.jungleTreats;assert.equal(a.feedJunglePet(jg),false);assert.equal(jg.jungleTreats,count);
});
test('evolução Atlas 400/800 é automática, sem custo ou compra manual',()=>{
 const a=fresh(),sup=a.units.find(v=>v.id==='blue_SUP');
 assert.equal(a.canBuy('blue',sup.id,'support_compass').ok,false);
 a.progressSupport(sup,400);assert.deepEqual(sup.items,['support_compass']);assert.equal(sup.supportQuest,400);assert.ok(sup.wardCharges>=3);
 a.progressSupport(sup,400);assert.deepEqual(sup.items,['support_bounty']);assert.equal(sup.supportQuest,800);assert.ok(sup.wardCharges>=4);
 assert.equal(a.progressSupport(sup,50),false);
});
test('quest SUP não gera ouro por poke sem atingir campeão perto de aliado',()=>{
 const a=fresh(),sup=a.units.find(v=>v.id==='blue_SUP'),adc=a.units.find(v=>v.id==='blue_ADC'),enemy=a.units.find(v=>v.id==='red_ADC');
 a.gameTime=10;enemy.x=sup.x+.015;enemy.y=sup.y;adc.x=sup.x+.01;adc.y=sup.y;
 const gold=sup.gold,charges=sup.supportCharges;
 a.damage(enemy,12,sup);assert.equal(sup.gold,gold+18);assert.equal(sup.supportCharges,charges-1);
 for(const ally of a.units.filter(v=>v.team==='blue'&&v.id!==sup.id)){ally.x=.1;ally.y=.1;}a.damage(enemy,12,sup);assert.equal(sup.gold,gold+18);
});
test('Smite usado contra monstro ao fim do clear, com cooldown e progresso',()=>{
 const a=fresh(),jg=a.units.find(v=>v.id==='blue_JG');a.buy('blue',jg.id,'jungle_gustwalker');
 const camp=a.camps.find(v=>v.timerKey==='red'&&v.y>.5);
 jg.x=camp.x;jg.y=camp.y;jg.order={kind:'jungle'};jg.autoFollow=false;
 a.gameTime=120;a.phase='executing';camp.alive=true;camp.health=560;
 a.updateObjectives();assert.equal(camp.alive,false,'smite finaliza o campo dentro de 600 de vida');
 assert.equal(jg.smiteCd,135);assert.equal(jg.smiteCharges,1);assert.ok(jg.smiteRecoveries.includes(210));assert.ok(jg.jungleTreats>=1);assert.ok(jg.cs>0);
});
test('Smite respeita duas cargas, intervalo entre usos e recarga',()=>{
 const a=fresh(),u=a.units.find(v=>v.id==='blue_JG');a.buy('blue',u.id,'jungle_gustwalker');
 const c={health:550};a.gameTime=80;assert.equal(a.useSmite(u,c),600);assert.equal(u.smiteCharges,1);
 assert.equal(a.useSmite(u,c),0,'não pode usar duas cargas sem intervalo');
 a.gameTime=95;assert.equal(a.useSmite(u,c),600);assert.equal(u.smiteCharges,0);
 a.gameTime=110;assert.equal(a.useSmite(u,c),0,'sem terceira carga');
 a.gameTime=170;assert.equal(a.useSmite(u,c),600,'primeira carga recuperada');
});
test('texto compra pet verde; alias não vira ordem de ir ao blue/red',()=>{
 const a=fresh();const preview=interpretCommands('JG comprar pet verde; ADC comprar lamina de doran',a);
 assert.equal(preview.ok,true,JSON.stringify(preview.errors));
 assert.equal(preview.commands[0].actions.filter(x=>x.type==='buy').length,1);
 assert.equal(preview.commands[0].actions.filter(x=>x.type==='plan').length,0);
 assert.equal(applyCommands(preview,a).ok,true);
 assert.equal(a.units.find(v=>v.id==='blue_JG').junglePet,'mosstomper');
 assert.ok(a.units.find(v=>v.id==='blue_ADC').items.includes('dorans_blade'));
});
test('antes da primeira rodada, iniciais ausentes são comprados sem interromper ordens',()=>{
 const a=fresh('bot'),adc=a.units.find(v=>v.id==='blue_ADC');
 a.setOrder('blue',adc.id,{kind:'farm'});const order=adc.order.kind;
 const started=a.playTurn();assert.equal(started.ok,true);
 for(const role of ['TOP','JG','MID','ADC','SUP']){
  const u=a.units.find(v=>v.id==='blue_'+role);
  assert.ok(u.items.length>=1,`inicial de ${role}`);
 }
 assert.equal(adc.order.kind,order);assert.equal(a.units.find(v=>v.id==='blue_JG').smiteTier,1);
 assert.equal(a.units.find(v=>v.id==='red_JG').junglePet,'mosstomper');
});
test('recomendações não permitem duplicar itens de missão e são específicas',()=>{
 const a=fresh(),j=a.units.find(v=>v.id==='blue_JG'),adc=a.units.find(v=>v.id==='blue_ADC');
 assert.deepEqual(recommendedItems(j).slice(0,3),JUNGLE_PETS);
 assert.ok(recommendedItems(adc).includes('recurve_bow'));
 assert.ok(catalog.some(i=>i.id==='support_bounty'&&i.notPurchasable));
});
console.log('10 contratos de loja e missões v1.8 aprovados');
