import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Arena,ITEM_RECIPES,catalog} from '../engine.mjs';
import {interpretCommands,applyCommands} from '../commands.mjs';
const load=x=>JSON.parse(fs.readFileSync(new URL('../data/'+x,import.meta.url)));
const make=()=>new Arena(load('coachlol_map_v6.json'),load('masks_128.json'),{roundSeconds:10});
const t=(name,fn)=>{fn();console.log('✓',name)};
t('Visão: brush entre observador e alvo bloqueia a visão até o outro lado',()=>{
 const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');const N=mask.size;
 const cells=Array.from({length:N*N},(_,k)=>{const x=k%N,y=Math.floor(k/N);return x>=63&&x<=65&&y>=50&&y<=78?'1':'0'}).join('');
 mask.brush=cells;mask.wall='0'.repeat(N*N);
 const a=new Arena(map,mask);const observer={x:.43,y:.5,r:.35,kind:'champion'};
 assert.equal(a.canSeePoint('blue',{x:.58,y:.5},[observer]),false);
 assert.equal(a.canSeePoint('blue',{x:.475,y:.5},[observer]),true);
 assert.equal(a.canSeePoint('blue',{x:.5,y:.5},[observer]),false);
 assert.equal(a.canSeePoint('blue',{x:.58,y:.5},[{x:.503,y:.5,r:.35,kind:'ward'}]),true);
});
t('Warvick typo accepted; sequence camp → MID is one plan with two steps',()=>{
 const a=make();const p=interpretCommands('warvick depois de finalizar acuaminas gankar mid vex',a);
 assert.ok(p.ok,JSON.stringify(p.errors));
 const plans=p.commands[0].actions.filter(v=>v.type==='plan');
 assert.equal(plans.length,1);assert.equal(plans[0].payload.length,2);
 assert.equal(plans[0].payload[0].action,'jungle');assert.equal(plans[0].payload[1].action,'gank');
 const r=applyCommands(p,a);assert.ok(r.ok,JSON.stringify(r.errors));
 const u=a.units.find(x=>x.id==='blue_JG');assert.equal(u.plan.steps.length,2);
 assert.equal(u.plan.loopJungle,false);
});
t('Gank/focus Vex and 1-3-1 without overwriting other champion orders',()=>{
 const a=make();let prev=a.units.find(x=>x.id==='blue_TOP');prev.order={kind:'hold'};
 const g=interpretCommands('warwick focar vex e fazer 2v1 mid',a);assert.ok(g.ok,JSON.stringify(g.errors));
 const f=interpretCommands('ADC SUP JG rotacionar MID 1-3-1',a);assert.ok(f.ok,JSON.stringify(f.errors));assert.deepEqual(f.commands.map(x=>x.role),['ADC','SUP','JG']);
 assert.ok(applyCommands(f,a).ok);assert.equal(prev.order.kind,'hold');
});
t('Inventário: apenas uma cópia de Gume do Infinito por campeão; componentes repetíveis',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_ADC');u.gold=20000;
 assert.deepEqual(ITEM_RECIPES.infinity_edge,['bf_sword','pickaxe','agility_cloak']);
 assert.ok(catalog.find(i=>i.id==='infinity_edge').tags.includes('legendary'));
 assert.ok(a.buy('blue',u.id,'bf_sword'));assert.ok(a.buy('blue',u.id,'bf_sword'));
 assert.ok(a.buy('blue',u.id,'pickaxe'));assert.ok(a.buy('blue',u.id,'agility_cloak'));
 assert.ok(a.buy('blue',u.id,'infinity_edge'));
 assert.equal(a.canBuy('blue',u.id,'infinity_edge').ok,false);
 assert.equal(a.queuePurchase('blue',u.id,'infinity_edge').ok,false);
});
t('Fila de compra: componente repetido continua legal; item lendário duplicado não',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_ADC');
 assert.ok(a.queuePurchase('blue',u.id,'bf_sword').ok);assert.ok(a.queuePurchase('blue',u.id,'bf_sword').ok);
 assert.ok(a.queuePurchase('blue',u.id,'infinity_edge').ok);assert.ok(!a.queuePurchase('blue',u.id,'infinity_edge').ok);
});
t('Wave de canhão aparece ENTRE guerreiros e magos',()=>{
 const a=make();a.gameTime=90;a.nextWave=30;a.waveIndex=2;a.spawnWaves();
 const kinds=a.minions.filter(x=>x.team==='blue'&&x.lane==='mid').map(m=>m.kind);
 assert.deepEqual(kinds,['melee','melee','melee','siege','caster','caster','caster']);
});
t('Cada campeão pode ter ordem persistente substituída/cancelada sem limpar as demais',()=>{
 const a=make(),mid=a.units.find(x=>x.id==='blue_MID'),adc=a.units.find(x=>x.id==='blue_ADC');
 assert.ok(a.setOrder('blue',mid.id,{kind:'farm'}).ok);assert.ok(a.setOrder('blue',adc.id,{kind:'farm'}).ok);
 assert.ok(a.setOrder('blue',mid.id,{kind:'attack'}).ok);assert.equal(adc.order.kind,'farm');
 assert.ok(a.cancelChampionOrder('blue',mid.id).ok);assert.equal(mid.order.kind,'hold');assert.equal(adc.order.kind,'farm');
 assert.ok(a.orderHistory.some(h=>h.unitId===mid.id&&h.type==='cancel'));
});
t('Histórico UI e rodapé unificado estão ligados no jogo real',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),css=fs.readFileSync(new URL('../styles-v33.css',import.meta.url),'utf8'),app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
 for(const id of ['ordersHistory','objectiveTimes','arenaChat','commandDock','confirm'])assert.ok(html.includes(`id="${id}"`),id);
 assert.match(css,/\.boardColumn\.chatDockOpen \.commandDock/);
 assert.match(app,/function renderOrderHistory/);
 assert.match(app,/cancelChampionOrder/);
});
console.log('8 contratos v3.3 aprovados');
