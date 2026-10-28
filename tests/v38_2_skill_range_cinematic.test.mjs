import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,abilityRule,abilityCooldown,abilityCost} from '../engine.mjs';
import {presentationEvent,normalizeManifest} from '../cinematics-core.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const make=()=>new Arena(read('coachlol_map_v6.json'),read('masks_128.json'),{seed:77,roundSeconds:10});
function test(label,fn){fn(); console.log('✓ V38.2 '+label)}
test('ranges from PC LoL and distinct cooldown/mana by rank',()=>{
 let a=make(),n=a.units.find(u=>u.champ==='Nami');
 assert.equal(abilityRule(n,'W').range,725);
 assert.equal(abilityRule(n,'R').range,2750);
 assert.equal(abilityCooldown(n,'R'),120);
 n.skillRanks.W=4;assert.equal(abilityCost(n,'W'),85);
 n.champ='Lux';n.skillRanks.R=3;
 assert.equal(abilityRule(n,'R').range,3400);
 assert.equal(abilityCooldown(n,'R'),40);
});
test('Nami W que foi solicitada longe não cura nem gasta mana imediatamente',()=>{
 const a=make(),n=a.units.find(u=>u.id==='blue_SUP'),ally=a.units.find(u=>u.id==='blue_ADC');
 n.skillRanks.W=1;n.x=.42;n.y=.62;ally.x=.47;ally.y=.59;
 ally.hp=ally.maxHp-180;
 a.visible=()=>true;
 const r=a.queueTargetedSkill('blue',n.id,'W',ally.id);assert.ok(r.ok,r.reason);
 const before=n.mana;
 a.resolveTargetedCasts();assert.equal(ally.hp,ally.maxHp-180);assert.equal(n.mana,before);
 assert.ok(a.mapDistance(n,ally)>725);
 a.finishPreparation();a.gameTime=75;const distance=a.mapDistance(n,ally);
 for(let i=0;i<6;i++){a.gameTime++;a.reviveAndMove();a.resolveTargetedCasts();if(!n.pendingTargetedCast)break;}
 assert.ok(a.mapDistance(n,ally)<distance,'deve aproximar até distância válida');
 assert.ok(!n.pendingTargetedCast,'deve lançar após alcançar 725');
 assert.ok(ally.hp>ally.maxHp-180,'cura acontece após aproximação');
 assert.ok(n.skillCds.W>a.gameTime,'cooldown inicia no cast');
});
test('Nami W em recarga é rejeitada e só desbloqueia no tempo simulado',()=>{
 const a=make(),n=a.units.find(u=>u.id==='blue_SUP'),ally=a.units.find(u=>u.id==='blue_ADC');
 n.skillRanks.W=1;n.x=.5;n.y=.5;ally.x=.503;ally.y=.5;
 assert.ok(a.queueTargetedSkill('blue',n.id,'W',ally.id).ok);
 a.resolveTargetedCasts();const cd=n.skillCds.W;
 assert.ok(cd===a.gameTime+10);
 assert.equal(a.queueTargetedSkill('blue',n.id,'W',ally.id).ok,false);
 a.gameTime+=9;assert.equal(a.queueTargetedSkill('blue',n.id,'W',ally.id).ok,false);
 a.gameTime++;assert.ok(a.queueTargetedSkill('blue',n.id,'W',ally.id).ok);
});
test('combo que tenta skill sem range não causa dano nem consome cooldown',()=>{
 const a=make(),n=a.units.find(u=>u.id==='blue_SUP'),foe=a.units.find(u=>u.id==='red_ADC');
 n.skillRanks.Q=1;n.x=.4;n.y=.62;foe.x=.52;foe.y=.62;
 n.order={kind:'attack',targetId:foe.id,combatStyle:'combo',combo:['Q'],comboIndex:0};a.visible=()=>true;
 const initial=foe.hp,mana=n.mana;a.resolveQueuedCombos();assert.equal(foe.hp,initial);assert.equal(n.mana,mana);
 assert.equal(n.order.comboIndex,0);
});
test('Lux R no alcance estendido: cooldown, linha e evento de VFX resolvido',()=>{
 const a=make(),lux=a.units.find(u=>u.id==='blue_MID'),foe=a.units.find(u=>u.id==='red_ADC');
 lux.champ='Lux';lux.skillRanks.R=1;lux.level=6;lux.mana=1000;lux.x=.4;lux.y=.6;foe.x=.58;foe.y=.6;
 lux.order={kind:'attack',targetId:foe.id,combatStyle:'combo',combo:['R'],comboIndex:0};a.visible=()=>true;
 const hp=foe.hp;a.resolveQueuedCombos();assert.ok(foe.hp<hp);
 assert.equal(lux.skillCds.R,a.gameTime+60);
 const visual=a.events.find(e=>e.kind==='skill_vfx'&&e.unitId===lux.id);
 assert.ok(visual?.vfx?.type==='final_spark');assert.ok(visual.id);assert.ok(visual.observedBy.includes('blue'));
 lux.order.comboIndex=0;const mana=lux.mana; a.gameTime++;a.resolveQueuedCombos();assert.equal(lux.mana,mana);
});
test('fog: ações ocultas NÃO chegam à visão do adversário nem ao cinema',()=>{
 const a=make(),red=a.units.find(u=>u.id==='red_JG');
 a.visible=(team,u)=>team===u.team;
 a.event('red_jungle hidden gank','red','ultimate_cast',red.id);
 const ev=a.events[0];assert.deepEqual(ev.observedBy,['red']);
 assert.ok(!a.perspective('blue').events.some(e=>e.id===ev.id));
 const reg=normalizeManifest(read('cinematic_event_manifest_v37.json'));
 assert.equal(presentationEvent(ev,'blue',reg),null);
 assert.ok(presentationEvent(ev,'red',reg));
});
test('presentation never mutates game state or cooldowns',()=>{
 const a=make(),n=a.units.find(u=>u.id==='blue_SUP');
 const before=JSON.stringify({hp:n.hp,mana:n.mana,cd:n.skillCds,time:a.gameTime});
 const reg=normalizeManifest(read('cinematic_event_manifest_v37.json'));
 a.event('Nami ult','blue','ultimate_cast',n.id);
 presentationEvent(a.events[0],'blue',reg);
 assert.equal(JSON.stringify({hp:n.hp,mana:n.mana,cd:n.skillCds,time:a.gameTime}),before);
});

test('gank na fog por coordenada é privado e não depende de alvo com targetId',()=>{
 const a=make(),jg=a.units.find(u=>u.id==='blue_JG');
 jg.x=.42;jg.y=.62;a.visible=(team,u)=>u.team===team;
 const route=a.setOrder('blue',jg.id,{kind:'gank',destination:{x:.46,y:.59}});
 assert.ok(route.ok,route.reason);assert.ok(jg.plan?.steps[0]?.action==='gank');
 const latest=a.events[0];assert.equal(latest.team,'blue');
 assert.equal(a.perspective('red').events.some(e=>e.id===latest.id),false);
});
test('Nami W em combo não avança antes de cast resolvido',()=>{
 const a=make(),n=a.units.find(u=>u.id==='blue_SUP'),foe=a.units.find(u=>u.id==='red_ADC');
 n.skillRanks.W=1;n.skillRanks.Q=1;n.x=.50;n.y=.5;foe.x=.505;foe.y=.5;a.visible=()=>true;
 n.order={kind:'attack',targetId:foe.id,combatStyle:'combo',combo:['W','Q'],comboIndex:0};
 a.resolveQueuedCombos();
 assert.equal(n.order.comboIndex,0);assert.ok(n.pendingTargetedCast);
 a.gameTime++;a.resolveTargetedCasts();a.resolveQueuedCombos();
 assert.equal(n.order.comboIndex,1);assert.ok(n.skillCds.W>a.gameTime);
 assert.equal(n.skillCds.Q,0,'Q só executa no próximo tick');
 a.gameTime++;a.resolveQueuedCombos();assert.ok(n.skillCds.Q>a.gameTime);
});
