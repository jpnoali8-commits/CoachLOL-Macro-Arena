import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,MINION_XP_RADIUS} from '../engine.mjs';
import {interpretCommands,applyCommands} from '../commands.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const fresh=()=>new Arena(load('coachlol_map_v6.json'),load('masks_128.json'),{mode:'manual',roundSeconds:10});
const test=(name,f)=>{f();console.log('✓ '+name)};
test('compra contínua de dois itens não exige fechar loja, nem altera a ordem',()=>{
 const a=fresh(),u=a.units.find(v=>v.id==='blue_ADC');u.gold=1900;a.setOrder('blue',u.id,{kind:'farm'});
 assert.equal(a.purchaseOrPlan('blue',u.id,'bf_sword').bought,true);
 assert.equal(a.purchaseOrPlan('blue',u.id,'long_sword').bought,true);
 assert.deepEqual(u.items,['bf_sword','long_sword']);assert.equal(u.order.kind,'farm');
});
test('loja programa itens fora da fonte sem compras remotas; procesa ao voltar no planejamento',()=>{
 const a=fresh(),u=a.units.find(v=>v.id==='blue_MID');a.finishPreparation();
 u.x=.5;u.y=.5;u.gold=5200;a.setOrder('blue',u.id,{kind:'roam'});
 const r=a.purchaseOrPlan('blue',u.id,'rabadon');assert.equal(r.queued,true);
 assert.equal(u.items.includes('rabadon'),false);assert.deepEqual(u.purchaseQueue,['rabadon']);
 a.processPurchaseQueues('blue');assert.deepEqual(u.purchaseQueue,['rabadon']);
 const base=a.map.objects.find(x=>x.id==='blue_spawn_shop');u.x=base.x;u.y=base.y;u.awaitingShop=true;
 assert.equal(a.processPurchaseQueues('blue').length,1);assert.ok(u.items.includes('rabadon'));
 assert.equal(u.order.kind,'roam','comprar ao voltar não sobrescreve a ordem em vigor');
});
test('item sem ouro suficiente permanece agendado após diferentes rodadas',()=>{
 const a=fresh(),u=a.units.find(v=>v.id==='blue_ADC');a.finishPreparation();
 assert.equal(a.queuePurchase('blue',u.id,'bf_sword').ok,true);
 a.processPurchaseQueues('blue');assert.deepEqual(u.purchaseQueue,['bf_sword']);
 a.phase='executing';a.executionStart=0;a.executionRemaining=0;a.pendingDecision=null;a.finishCompletedRound();
 assert.deepEqual(u.purchaseQueue,['bf_sword']);u.gold=1400;
 assert.equal(a.processPurchaseQueues('blue').length,1);assert.deepEqual(u.purchaseQueue,[]);
});
test('recall e compras compostas: dar b / voltar base / espada GPC / espada longa / Rabadon',()=>{
 for(const word of ['dar b','da b','dar recall','voltar base','voltar pra base']){
  const a=fresh(),u=a.units.find(v=>v.id==='blue_MID');u.x=.5;u.y=.5;
  const preview=interpretCommands(`MID ${word} e comprar espada GPC, espada longa`,a);
  assert.ok(preview.ok,word+': '+JSON.stringify(preview.errors));
  assert.ok(preview.commands[0].actions.some(q=>q.type==='order'&&q.payload.kind==='recall'),word);
  assert.deepEqual(preview.commands[0].actions.filter(q=>q.type==='buy').map(q=>q.payload),['bf_sword','long_sword']);
  assert.ok(applyCommands(preview,a).ok,word);
  assert.deepEqual(u.purchaseQueue,['bf_sword','long_sword']);
 }
 const a=fresh(),u=a.units.find(v=>v.id==='blue_MID');
 const preview=interpretCommands('MID voltar base e comprar rabadon',a);
 assert.ok(preview.ok,JSON.stringify(preview.errors));
 assert.equal(preview.commands[0].actions.some(x=>x.type==='buy'&&x.payload==='rabadon'),true);
});
test('XP apenas perto do minion morto e compartilhada entre aliados presentes',()=>{
 const a=fresh(),mid=a.units.find(v=>v.id==='blue_MID'),sup=a.units.find(v=>v.id==='blue_SUP'),top=a.units.find(v=>v.id==='blue_TOP'),jg=a.units.find(v=>v.id==='blue_JG');
 const m={team:'red',kind:'melee',x:.5,y:.5};
 mid.x=m.x;mid.y=m.y;sup.x=m.x+.01;sup.y=m.y;top.x=.1;top.y=.1;jg.x=.1;jg.y=.1;
 const before=[mid.xp,sup.xp,top.xp,jg.xp];a.awardMinionXP(m);
 assert.ok(mid.xp>before[0]&&sup.xp>before[1]);assert.equal(top.xp,before[2]);assert.equal(jg.xp,before[3]);
 assert.equal(MINION_XP_RADIUS,1500);
});
test('Jungler não recebe XP de qualquer lane automaticamente; somente próximo ao evento',()=>{
 const a=fresh(),jg=a.units.find(v=>v.id==='blue_JG');const m={team:'red',kind:'caster',x:.5,y:.5};
 jg.x=.1;jg.y=.1;const before=jg.xp;a.awardMinionXP(m);assert.equal(jg.xp,before);
 jg.x=.5;jg.y=.5;a.awardMinionXP(m);assert.ok(jg.xp>before);
});
test('fila individual de compras não afeta outros campeões e admite cancelamento',()=>{
 const a=fresh(),mid=a.units.find(v=>v.id==='blue_MID'),adc=a.units.find(v=>v.id==='blue_ADC');
 a.queuePurchase('blue',mid.id,'rabadon');a.queuePurchase('blue',adc.id,'long_sword');
 assert.deepEqual(mid.purchaseQueue,['rabadon']);assert.deepEqual(adc.purchaseQueue,['long_sword']);
 assert.equal(a.cancelQueuedPurchase('blue',mid.id,0),true);assert.deepEqual(mid.purchaseQueue,[]);
 assert.deepEqual(adc.purchaseQueue,['long_sword']);
});
console.log('7 contratos v2.2 XP/loja/recall aprovados');
