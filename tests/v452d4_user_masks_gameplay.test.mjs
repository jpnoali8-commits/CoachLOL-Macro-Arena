import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const json=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const original=json('coachlol_map_v6.json'),mask=json('masks_128.json'),user=json('rift_user_manifest_v452d4.json');
const map=structuredClone(original);map.riftBundlesV452d4=user.variants;map.riftBaseFeaturesV452d4=user.baseFeatures;
const create=(mode='standard')=>new Arena(map,mask,{seed:20261026,riftMode:mode,roundSeconds:10});
let passed=0;function test(name,fn){fn();passed++;console.log('✓ USER-RIFT '+name);}
const cell=(p)=>Math.floor(p.y*128)*128+Math.floor(p.x*128);
test('fonte autêntica, seis variantes, sem reescrever máscaras base',()=>{
 assert.equal(user.counts.baseJumpFruits,4);assert.equal(user.counts.faelights,12);assert.equal(user.counts.faelightsEarly,8);assert.equal(user.counts.faelightsLate,4);assert.equal(user.counts.stimFruits,10);
 assert.equal(user.counts.firelightBlooms,15);assert.equal(user.counts.hexgatePairs,6);assert.equal(user.counts.cloudZones,4);
 assert.ok(user.metrics.wall.agreement>.99);assert.ok(user.metrics.brush.agreement>.99);
 const a=create();assert.equal(a.mask.wall,mask.wall);assert.equal(a.mask.brush,mask.brush);
});
test('mapa transforma só na terceira criatura padrão e nunca outra vez',()=>{
 const a=create();a.awardElementalDragonV452d3('blue','ocean',{captureId:'test_user_1'});
 assert.equal(a.riftV452d4.phase,'base');a.awardElementalDragonV452d3('red','mountain',{captureId:'test_user_2'});
 assert.equal(a.riftV452d4.phase,'active');assert.equal(a.riftV452d4.transformDragonIndex,3);
 const e=a.riftV452d4.element;a.awardElementalDragonV452d3('red',e,{captureId:'test_user_3'});
 assert.equal(a.riftV452d4.element,e);assert.equal(a.riftEventsV452d4.length,1);
 assert.equal(a.activateRiftV452d4('infernal').ok,false);
 const sw=create('swiftplay');sw.awardElementalDragonV452d3('blue','ocean',{captureId:'sw_1'});
 assert.equal(sw.riftV452d4.transformDragonIndex,2);
});
test('Montanha muda colisão real, LoS e não edita atlas original',()=>{
 const a=create(),p=user.variants.mountain.addWall.find(i=>a.walkable(((i%128)+.5)/128,(Math.floor(i/128)+.5)/128));assert.ok(p>=0);
 const at={x:((p%128)+.5)/128,y:(Math.floor(p/128)+.5)/128};
 assert.equal(a.walkable(at.x,at.y),true);a.activateRiftV452d4('mountain');assert.equal(a.walkable(at.x,at.y),false);
 assert.equal(a.maskAt('wall',at.x,at.y),true);assert.equal(mask.wall[p],'0');
 assert.ok(user.variants.mountain.removeWall.length>0);
});
test('Oceano novos brushes reais obedecem concealment',()=>{
 const a=create(),i=user.variants.ocean.addBrush.find(idx=>mask.brush[idx]==='0'&&mask.wall[idx]==='0');assert.ok(i>=0);
 const p={x:((i%128)+.5)/128,y:(Math.floor(i/128)+.5)/128};
 assert.equal(a.brushRegionAt(p.x,p.y),0);a.activateRiftV452d4('ocean');assert.ok(a.brushRegionAt(p.x,p.y)>0);
 assert.equal(a.walkable(p.x,p.y),true);
});
test('Fruta de pulo: direção escolhida + reação radial de todos ao redor',()=>{
 const a=create(),fruit=user.baseFeatures.plants.find(p=>a.walkable(p.x,p.y));assert.ok(fruit);
 const units=a.units.filter(u=>u.team==='blue').slice(0,2);const [u,ally]=units;u.x=fruit.x+.006;u.y=fruit.y;ally.x=fruit.x;ally.y=fruit.y-.009;
 const original={x:u.x,y:u.y},allyStart={x:ally.x,y:ally.y};
 const r=a.activateBlastConeV452d4('blue',u.id,fruit.id,0);assert.equal(r.ok,true,JSON.stringify(r));
 assert.ok(r.affected.includes(u.id));assert.ok(r.affected.includes(ally.id));
 assert.ok(u.x>original.x,'usuário seleciona leste');assert.ok(ally.y<allyStart.y,'aliado radial segue norte');
 assert.equal(a.activateBlastConeV452d4('blue',u.id,fruit.id,0).ok,false,'não duplica ativação');
 const snap=a.snapshotV40();const b=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(b.riftPlantTimersV452d4[fruit.id],a.riftPlantTimersV452d4[fruit.id]);
});
test('Quimtec só aprimora fruta e visão já existentes antes da transformação',()=>{
 const a=create();assert.equal(a.riftAllFeaturesV452d4('plants').length,14);
 a.activateRiftV452d4('chemtech');assert.equal(a.riftAllFeaturesV452d4('plants').length,14);
 const u=a.units.find(v=>v.team==='blue');const fruit=a.riftAllFeaturesV452d4('plants').find(p=>p.kind==='honeyfruit');
 u.x=fruit.x;u.y=fruit.y;u.hp=u.maxHp*.5;const before=u.hp;
 const r=a.activateRiftPlantV452d4('blue',u.id,fruit.id);
 assert.equal(r.ok,true,JSON.stringify(r));assert.ok(u.hp>before);assert.ok(u.shield>0);
 const bloom=a.riftAllFeaturesV452d4('scryers')[0];u.x=bloom.x;u.y=bloom.y;
 assert.equal(a.activateScryerBloomV452d4('blue',u.id,bloom.id,0).ok,true);assert.equal(a.riftVisionPulsesV452d4.length,1);
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());assert.equal(b.riftVisionPulsesV452d4.length,1);
});
test('Faelight: ward +25% raio e região 45s, sem duplicar estoque',()=>{
 const a=create();const u=a.units.find(v=>v.team==='blue');const site=a.riftAllFeaturesV452d4('faelights').find(p=>a.walkable(p.x,p.y));
 u.x=site.x;u.y=site.y;u.wardCharges=2;u.trinket='farsight';const r=a.addWard('blue',u.id,site,'farsight');
 assert.equal(r.ok,true,JSON.stringify(r));assert.equal(r.ward.faelightSiteId,site.id);
 assert.equal(r.ward.faelightUntil,a.gameTime+45);
 assert.ok(a.wardRadius(r.ward)>(500/a.worldWidth),'faelight radius 25%');assert.equal(u.wardCharges,1);
 const again=a.addWard('blue',u.id,site,'farsight');assert.equal(again.ok,true);assert.equal(a.wards.length,1,'um ward por equipe por faelight');
});
test('Hexgates: 6 linhas, pares recíprocos, canalização e destino livre',()=>{
 const a=create();a.activateRiftV452d4('hextech');const gates=a.riftFeaturesV452d4('hexgates');assert.equal(gates.length,12);
 const actor=a.units.find(u=>u.team==='blue'),g=gates.find(p=>p.id==='hexgate_01_a');actor.x=g.x;actor.y=g.y;
 const start=a.beginHexgateV452d4('blue',actor.id,g.id);assert.equal(start.ok,true,JSON.stringify(start));
 assert.equal(a.beginHexgateV452d4('blue',actor.id,g.id).ok,false);
 const restored=Arena.fromSnapshotV40(map,mask,a.snapshotV40());assert.equal(restored.riftHexChannelsV452d4.length,1);
 a.gameTime=start.until;a.advanceRiftHexgatesV452d4();assert.equal(a.riftHexChannelsV452d4.length,0);
 assert.equal(a.walkable(actor.x,actor.y),true);assert.ok(Math.hypot(actor.x-g.x,actor.y-g.y)>.10);
});
test('Vento usa quatro zonas reais, Infernal sem delta de terreno',()=>{
 const a=create();a.activateRiftV452d4('cloud');const z=a.riftFeaturesV452d4('windZones');assert.equal(z.length,4);
 assert.ok(a.cloudSpeedBonusV452d4(z[0])>0);assert.equal(a.cloudSpeedBonusV452d4({x:.01,y:.01}),0);
 const inf=create();const wall=inf.riftMaskV452d4('wall'),brush=inf.riftMaskV452d4('brush');
 inf.activateRiftV452d4('infernal');assert.equal(inf.riftMaskV452d4('wall'),wall);assert.equal(inf.riftMaskV452d4('brush'),brush);
 assert.deepEqual(inf.validateInvariants(),[]);
});
test('Florividente com Quimtec: cone direcionado revela sentinelas e reduz a 1 HP',()=>{
 const a=create();a.activateRiftV452d4('chemtech');
 const u=a.units.find(v=>v.team==='blue'),bloom=a.riftAllFeaturesV452d4('scryers')[0];
 u.x=bloom.x;u.y=bloom.y;
 const angle=Array.from({length:32},(_,i)=>i*Math.PI/16).find(t=>a.riftLineOfSightWallsV452d4(bloom,{x:bloom.x+.028*Math.cos(t),y:bloom.y+.028*Math.sin(t)}));
 assert.ok(Number.isFinite(angle));
 const point={x:bloom.x+.028*Math.cos(angle),y:bloom.y+.028*Math.sin(angle)};
 const ward={id:'vision_target',team:'red',type:'stealth',x:point.x,y:point.y,hp:3,until:500,owner:'red_dummy'};
 a.wards.push(ward);assert.equal(a.canSeePoint('blue',point,[]),false);
 const result=a.activateScryerBloomV452d4('blue',u.id,bloom.id,angle);assert.equal(result.ok,true);
 assert.equal(ward.hp,1);assert.equal(a.canSeePoint('blue',point,[]),true);
 assert.equal(a.wardKnownTo('blue',ward),true);
 a.gameTime+=13;assert.equal(a.canSeePoint('blue',point,[]),false);
});
console.log(`V4.5.2d-4-dev5 USER MASKS ${passed}/10 PASS`);
