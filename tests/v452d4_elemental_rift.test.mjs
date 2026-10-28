import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,RIFT_ELEMENTS_V452D4,RIFT_MODE_RULES_V452D4} from '../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const create=(mode='standard')=>new Arena(map,mask,{seed:45224,roundSeconds:10,riftMode:mode});
const test=(label,fn)=>{fn();console.log('✓ V4.5.2d-4 '+label);};
const cell=(x,y)=>Math.floor(y*mask.size)*mask.size+Math.floor(x*mask.size);
const free=()=>{for(let y=.26;y<.75;y+=.013)for(let x=.26;x<.75;x+=.013){const a=create();if(a.walkable(x,y)&&a.walkable(x+.012,y)&&!a.maskAt('brush',x,y))return {x,y};}throw Error('sem ponto livre para testes');};

test('Fonte de verdade: seis variantes e gatilhos distintos para SR e Swiftplay',()=>{
 assert.equal(RIFT_ELEMENTS_V452D4.length,6);assert.equal(RIFT_MODE_RULES_V452D4.standard.transformAfter,2);
 assert.equal(RIFT_MODE_RULES_V452D4.swiftplay.transformAfter,1);
 const a=create();assert.equal(a.riftV452d4.phase,'base');
 a.awardElementalDragonV452d3('blue','infernal',{captureId:'d1'});
 assert.equal(a.riftV452d4.phase,'base');
 a.awardElementalDragonV452d3('red','mountain',{captureId:'d2'});
 assert.equal(a.riftV452d4.phase,'active');
 assert.equal(a.riftV452d4.transformDragonIndex,3);
 assert.ok(!['infernal','mountain'].includes(a.riftV452d4.element));
 assert.equal(a.nextDragonElementV452d4(),a.riftV452d4.element);
 assert.equal(a.riftEventsV452d4.length,1);
 const sw=create('swiftplay');sw.awardElementalDragonV452d3('blue','ocean',{captureId:'1'});
 assert.equal(sw.riftV452d4.phase,'active');assert.equal(sw.riftV452d4.transformDragonIndex,2);
});

test('Parede Mountain afeta path/LOS e nunca modifica a máscara base',()=>{
 const a=create(),p=free(),index=cell(p.x,p.y),original=mask.wall;
 a.installRiftBundleV452d4('mountain',{size:mask.size,addWall:[index]});
 assert.equal(a.walkable(p.x,p.y),true);
 a.activateRiftV452d4('mountain');
 assert.equal(a.walkable(p.x,p.y),false);assert.equal(a.maskAt('wall',p.x,p.y),true);
 assert.equal(a.findPath({x:p.x,y:p.y},{x:p.x,y:p.y}),null);
 assert.equal(a.lineOfSight({x:p.x-.02,y:p.y},{x:p.x+.02,y:p.y}),false);
 assert.equal(mask.wall,original);assert.equal(a.mask.wall,original);
});

test('Ocean acrescenta moita efetiva; navegação mantém máscara original',()=>{
 const a=create(),p=free(),i=cell(p.x,p.y),raw=mask.brush;
 a.installRiftBundleV452d4('ocean',{size:mask.size,addBrush:[i]});
 const before=a.brushRegionAt(p.x,p.y);assert.equal(before,0);
 a.activateRiftV452d4('ocean');
 assert.ok(a.brushRegionAt(p.x,p.y)>0);assert.equal(a.walkable(p.x,p.y),true);
 assert.equal(mask.brush,raw);
});

test('Cloud zonas de vento alteram movimento apenas quando transformado',()=>{
 const a=create(),u=a.units[0],p={x:u.x,y:u.y};
 a.installRiftBundleV452d4('cloud',{size:mask.size,features:{windZones:[{id:'certified_wind_1',...p,radius:.04,moveBonus:.2}]}});
 const base=a.effectiveMS(u);assert.equal(a.cloudSpeedBonusV452d4(u),0);
 a.activateRiftV452d4('cloud');assert.equal(a.cloudSpeedBonusV452d4(u),.2);
 assert.ok(a.effectiveMS(u)>base);
 u.x+=.25;assert.equal(a.cloudSpeedBonusV452d4(u),0);
});

test('Hexgates exigem par autoral recíproco e só emitem ação validável',()=>{
 const a=create(),u=a.units[0];
 a.installRiftBundleV452d4('hextech',{size:mask.size,features:{hexgates:[
  {id:'a',x:u.x,y:u.y,pairId:'b',channelSeconds:2},
  {id:'b',x:u.x+.025,y:u.y,pairId:'a',channelSeconds:2}
 ]}});
 assert.equal(a.previewHexgateV452d4(u.id,'a').ok,false);
 a.activateRiftV452d4('hextech');
 const result=a.previewHexgateV452d4(u.id,'a');assert.equal(result.ok,true);
 assert.equal(result.kind,'hexgate_channel');assert.equal(result.toId,'b');
});

test('Infernal moderno rejeita wall/brush antigos; bundles malformados rejeitados',()=>{
 const a=create(),p=free(),i=cell(p.x,p.y);
 assert.throws(()=>a.installRiftBundleV452d4('infernal',{size:mask.size,removeWall:[i]}),/infernal_14_1/);
 assert.throws(()=>a.installRiftBundleV452d4('mountain',{size:mask.size+1}),/tamanho/);
 assert.throws(()=>a.installRiftBundleV452d4('mountain',{size:mask.size,addWall:[-1]}),/indices/);
 assert.throws(()=>a.installRiftBundleV452d4('hextech',{size:mask.size,features:{hexgates:[{id:'a',x:.5,y:.5,pairId:'b'}]}}),/hexgate_sem_par/);
});

test('Snapshot preserva Rift e deltas, reconstitui cache sem duplicar transformações',()=>{
 const a=create(),p=free(),i=cell(p.x,p.y);
 a.installRiftBundleV452d4('mountain',{size:mask.size,addWall:[i]});
 a.awardElementalDragonV452d3('blue','ocean',{captureId:'one'});
 a.awardElementalDragonV452d3('red','chemtech',{captureId:'two'});
 // Force certified fixture type for separate replay validation.
 const b=create();b.installRiftBundleV452d4('mountain',{size:mask.size,addWall:[i]});b.activateRiftV452d4('mountain');
 const snap=b.snapshotV40();assert.equal(snap.state._riftMaskCacheV452d4,undefined);
 const restored=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(restored.riftV452d4.element,'mountain');assert.equal(restored.walkable(p.x,p.y),false);
 assert.equal(restored.riftEventsV452d4.length,1);
 assert.equal(restored.activateRiftV452d4('mountain').ok,false);
 assert.deepEqual(restored.validateInvariants(),[]);
});

test('Bundle importado pelo mapa é validado e ativado sem carregamento externo',()=>{
 const p=free(),index=cell(p.x,p.y);
 const custom=structuredClone(map);custom.riftBundlesV452d4={mountain:{size:mask.size,addWall:[index]}};
 const a=new Arena(custom,mask,{seed:45224,roundSeconds:10});
 assert.equal(a.walkable(p.x,p.y),true);
 a.activateRiftV452d4('mountain');assert.equal(a.walkable(p.x,p.y),false);
});

test('Transição descarta paths obsoletos mas mantém ordens e não revela posições secretas',()=>{
 const a=create(),u=a.units[0];u.laneFollowPath=[{x:.4,y:.4}];u.plan={index:0,steps:[{action:'move',point:{x:.5,y:.5},path:[{x:.45,y:.45}]}]};
 u.order={kind:'move',point:{x:.5,y:.5},path:[{x:.4,y:.4}]};
 a.activateRiftV452d4('mountain');
 assert.deepEqual(u.laneFollowPath,[]);assert.deepEqual(u.plan.steps[0].path,[]);
 assert.deepEqual(u.order.point,{x:.5,y:.5});assert.equal(u.order.path,undefined);
 assert.equal(a.riftEventsV452d4[0].actorId,undefined);
});
console.log('V4.5.2d-4: 9 contratos Rift Elemental aprovados');
