// CoachLOL Macro Arena V38: source-level regression contracts.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const arena=()=>new Arena(read('coachlol_map_v6.json'),read('masks_128.json'),{seed:36,roundSeconds:10,mode:'bot'});
const run=(name,fn)=>{fn();console.log('✓ V38 '+name)};
run('troca gratuita e exclusiva de trinkets na loja; uso de lente por um turno',()=>{
 const a=arena(),u=a.units.find(v=>v.id==='blue_ADC');
 assert.equal(u.trinket,'stealth');assert.equal(a.activateOracle('blue',u.id).ok,false);
 assert.equal(a.purchaseOrPlan('blue',u.id,'trinket_oracle').ok,true);
 assert.equal(u.trinket,'oracle');assert.equal(u.wardCharges,0);
 assert.equal(a.activateOracle('blue',u.id).ok,true);
 assert.ok(u.oracleUntil-a.gameTime>=a.roundSeconds);
 assert.equal(a.activateOracle('blue',u.id).ok,false);
 assert.equal(a.purchaseOrPlan('blue',u.id,'trinket_stealth').ok,true);
 assert.equal(u.trinket,'stealth');assert.equal(u.oracleUntil,0);
 u.x=.50;u.y=.50;
 assert.equal(a.purchaseOrPlan('blue',u.id,'trinket_oracle').ok,false);
});
run('prioridades arbitrárias EWQ / WQE e R respeitando desbloqueio',()=>{
 const a=arena(),u=a.units.find(v=>v.id==='blue_ADC');
 assert.equal(a.setSkillPlan('blue',u.id,{priority:['E','W','Q'],opening:['E','W','Q'],phases:[{slot:'E',target:5},{slot:'W',target:5},{slot:'Q',target:5}],auto:true}),true);
 assert.equal(u.skillRanks.E,1);
 assert.deepEqual(u.skillPriority,['E','W','Q']);
 u.level=2;u.skillPoints++;a.autoSpendSkills(u);
 assert.equal(u.skillRanks.W,1);
 assert.equal(a.setSkillPlan('blue',u.id,{priority:['W','Q','E'],auto:true}),true);
 assert.deepEqual(u.skillPriority,['W','Q','E']);
 assert.equal(u.skillRanks.R,0);
});
run('ordens de combos multi-champion por time e rollback atômico',()=>{
 const a=arena(),first=a.units.find(v=>v.id==='blue_ADC'),second=a.units.find(v=>v.id==='blue_SUP');
 const enemy=a.units.find(v=>v.id==='red_ADC');
 a.visible=()=>true;
 const ids=[first.id,second.id],orders=[{kind:'attack',targetId:enemy.id,combatStyle:'combo',combo:['FLASH','Q','IGNITE']},{kind:'attack',targetId:enemy.id,combatStyle:'combo',combo:['W','E']}];
 const result=a.setGroupOrders('blue',ids,orders);assert.equal(result.ok,true,result.reason);
 assert.deepEqual(first.order.combo,orders[0].combo);assert.deepEqual(second.order.combo,orders[1].combo);
 const previous=[JSON.stringify(first.order),JSON.stringify(second.order)];
 const rejected=a.setGroupOrders('blue',ids,[orders[0],{kind:'attack',targetId:enemy.id,combo:['WRONG']}]);
 assert.equal(rejected.ok,false);assert.deepEqual([JSON.stringify(first.order),JSON.stringify(second.order)],previous);
 assert.equal(a.setGroupOrders('red',ids,orders).ok,false);
 const enemyVision=a.perspective('red').units.find(v=>v.id===first.id);
 assert.ok(!enemyVision||!JSON.stringify(enemyVision).includes('IGNITE'),'No enemy-side raw combo disclosure');
});
run('resistência mágica individual e Manto Anula-Magia reduzem dano mágico',()=>{
 const a=arena(),target=a.units.find(v=>v.id==='blue_ADC');
 assert.equal(target.mr,33);
 const base=target.hp;const dmg1=a.damage(target,100,null,'magic');
 const before=target.mr;const purchase=a.purchaseOrPlan('blue',target.id,'null_magic_mantle');
 assert.equal(purchase.ok,true,purchase.reason);assert.equal(target.mr,before+20);
 const dmg2=a.damage(target,100,null,'magic');
 assert.ok(dmg2<dmg1,{dmg1,dmg2});assert.ok(target.hp<base);
});
run('contador de farm deriva de mortes reais e cai com ausência de posição na lane',()=>{
 const a=arena();a.finishPreparation();a.deployToLane();a.phase='executing';a.detectEncounters=()=>{};
 for(const u of a.units)if(u.team==='red'){u.hp=0;u.deadUntil=999;u.autoAttack=false}
 // Disallow impossible "free" lane CS for an ADC deliberately ordered away from bot lane.
 const adc=a.units.find(v=>v.id==='blue_ADC');adc.x=.06;adc.y=.94;adc.manualMoveHold=true;adc.autoFollow=false;
 for(let t=0;t<300&&!a.ended;t++){a.gameTime++;a.tick()}
 const top=a.units.find(v=>v.id==='blue_TOP'),mid=a.units.find(v=>v.id==='blue_MID');
 assert.ok(top.cs>=35&&top.cs<=62,'calm top lane 5m must be in realistic 35–62 CS range, got '+top.cs);
 assert.ok(mid.cs>=35&&mid.cs<=62,'calm mid lane 5m must be in realistic 35–62 CS range, got '+mid.cs);
 assert.ok(adc.cs<=4,'ADC away from farm must miss CS, got '+adc.cs);
 assert.ok(a.waveIndex>=9,'natural minion waves should be spawned');
 assert.deepEqual(a.validateInvariants(),[]);
});
run('HUD includes true level portrait badge, MR, tower counters, skill input and group combo modal',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const css=readFileSync(new URL('../styles-v38.css',import.meta.url),'utf8');
 for(const id of ['champLevelTag','skillPriorityInput','skillPriorityApply','scoreTowersBlue','scoreTowersRed','comboModalSteps','duelOverlay'])assert.ok(html.includes(`id="${id}"`),id);
 assert.match(app,/selectedUnitIds=new Set/);assert.match(app,/e\.shiftKey/);assert.match(app,/showComboComposer/);
 assert.match(app,/scoreTowers/);assert.match(app,/\['MR','✦'/);assert.match(css,/stat-mr/);assert.match(css,/comboUnitSteps/);
});
console.log('V38: 6 novos contratos concluídos');
