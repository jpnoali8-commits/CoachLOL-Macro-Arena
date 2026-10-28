import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const mask=load('masks_128.json'),manifest=load('rift_user_manifest_v452d4.json');
const map=load('coachlol_map_v6.json');map.riftBaseFeaturesV452d4=manifest.baseFeatures;map.riftBundlesV452d4=manifest.variants;
const arena=()=>new Arena(map,mask,{seed:9821,roundSeconds:10});
let count=0;function test(name,fn){fn();count++;console.log('✓ DEV8 '+name);}

test('máscara autoral: 5 pontos base e 10 liberados no marco 26.1 (tiers provisórios)',()=>{
 const all=manifest.baseFeatures.scryers;assert.equal(all.length,15);
 assert.equal(all.filter(x=>x.tier==='late').length,10);
 assert.equal(all.filter(x=>x.tier==='default').length,5);
 assert.ok(all.every(x=>x.positionStatus==='USER_AUTHORED_MASK_4096'));
 assert.equal(new Set(all.map(x=>x.id)).size,15);
 const a=arena();assert.equal(a.riftAllFeaturesV452d4('scryers').length,5);
 assert.ok(all.every(x=>x.x>0&&x.x<1&&x.y>0&&x.y<1)); // marked POIs may be beside collision, not inside walkable cell
});

test('novos 10 aparecem em 15min ou Rift; bases continuam',()=>{
 const a=arena();a.gameTime=899;assert.equal(a.riftAllFeaturesV452d4('scryers').length,5);
 const b=arena();b.gameTime=900;assert.equal(b.riftAllFeaturesV452d4('scryers').length,15);
 a.activateRiftV452d4('ocean');assert.equal(a.riftAllFeaturesV452d4('scryers').length,15);
 assert.equal(a.riftAllFeaturesV452d4('faelights').length,12,'lumes 8+4 preservados');
});

test('ponto tardio bloqueado não aceita ativação nem inicia recarga',()=>{
 const a=arena(),site=manifest.baseFeatures.scryers.find(p=>p.tier==='late');
 const u=a.units.find(x=>x.team==='blue');u.x=site.x;u.y=site.y;
 const b=a.activateScryerBloomV452d4('blue',u.id,site.id,0);
 assert.equal(b.ok,false);assert.equal(a.riftScryerCyclesV452d4[site.id],undefined);
});

test('respawn faixa 200–260 base e 90–120 tardio sem tocar RNG',()=>{
 const a=arena(),u=a.units.find(x=>x.team==='blue');
 const base=a.riftAllFeaturesV452d4('scryers')[0];u.x=base.x;u.y=base.y;
 const before=a.rng.getState(),first=a.activateScryerBloomV452d4('blue',u.id,base.id,0);
 assert.equal(first.ok,true,JSON.stringify(first));assert.ok(first.respawnSeconds>=200&&first.respawnSeconds<=260);
 assert.equal(a.rng.getState(),before);
 assert.equal(a.activateScryerBloomV452d4('blue',u.id,base.id,0).ok,false);
 a.gameTime=900;const late=a.riftAllFeaturesV452d4('scryers').find(x=>x.tier==='late');u.x=late.x;u.y=late.y;
 const second=a.activateScryerBloomV452d4('blue',u.id,late.id,0);
 assert.equal(second.ok,true,JSON.stringify(second));assert.ok(second.respawnSeconds>=90&&second.respawnSeconds<=120);
});

test('pulso normal revela sentinelas sem reduzir HP; Quimtec aprimora',()=>{
 const a=arena(),p=a.riftAllFeaturesV452d4('scryers')[0],u=a.units.find(x=>x.team==='blue');
 u.x=p.x;u.y=p.y;
 const angle=Array.from({length:32},(_,i)=>i*Math.PI/16).find(t=>a.riftLineOfSightWallsV452d4(p,{x:p.x+.025*Math.cos(t),y:p.y+.025*Math.sin(t)}));
 assert.ok(Number.isFinite(angle));
 const point={x:p.x+.025*Math.cos(angle),y:p.y+.025*Math.sin(angle)};
 const w={id:'scryer_enemy_ward',team:'red',type:'stealth',hp:3,x:point.x,y:point.y,until:3000};
 a.wards.push(w);
 const out=a.activateScryerBloomV452d4('blue',u.id,p.id,angle);assert.equal(out.ok,true);assert.equal(w.hp,3);
 assert.equal(a.wardKnownTo('blue',w),true);
 assert.equal(a.canSeePoint('blue',point,[]),true);
 assert.equal(w.riftRevealedByV452d4.red,undefined);
 a.gameTime=13;assert.equal(a.wardKnownTo('blue',w),false);
});

test('snapshot restaura cooldown, pulse e ciclo sem multiplicar efeitos',()=>{
 const a=arena(),site=a.riftAllFeaturesV452d4('scryers')[0],u=a.units.find(x=>x.team==='blue');u.x=site.x;u.y=site.y;
 const r=a.activateScryerBloomV452d4('blue',u.id,site.id,0);assert.equal(r.ok,true);
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(b.riftPlantTimersV452d4[site.id],a.riftPlantTimersV452d4[site.id]);
 assert.equal(b.riftScryerCyclesV452d4[site.id],1);
 assert.equal(b.riftVisionPulsesV452d4.length,1);
 assert.equal(b.activateScryerBloomV452d4('blue',u.id,site.id,0).ok,false);
 b.gameTime=r.cooldownUntil;const next=b.activateScryerBloomV452d4('blue',u.id,site.id,0);
 assert.equal(next.ok,true);assert.equal(b.riftScryerCyclesV452d4[site.id],2);
});

test('sem alterações em máscaras base, faelights, gold e CS',()=>{
 const a=arena(),u=a.units.find(x=>x.team==='blue'),site=a.riftAllFeaturesV452d4('scryers')[0];
 u.x=site.x;u.y=site.y;
 const originalWall=a.mask.wall,originalBrush=a.mask.brush,cs=u.cs,gold=u.gold;
 const r=a.activateScryerBloomV452d4('blue',u.id,site.id,0);assert.equal(r.ok,true);
 assert.equal(a.mask.wall,originalWall);assert.equal(a.mask.brush,originalBrush);
 assert.equal(u.cs,cs);assert.equal(u.gold,gold);
 assert.equal(a.riftAllFeaturesV452d4('faelights').length,8);
 assert.deepEqual(a.validateInvariants(),[]);
});
test('snapshot dev7 anterior sem scryers recebe registro novo sem perder estado herdado',()=>{
 const a=arena();const old=a.snapshotV40();delete old.state.riftBaseFeaturesV452d4.scryers;delete old.state.riftScryerCyclesV452d4;
 const b=Arena.fromSnapshotV40(map,mask,old);
 assert.equal(b.riftAllFeaturesV452d4('scryers').length,5);
 assert.equal(b.units.find(u=>u.id==='blue_ADC').cs,a.units.find(u=>u.id==='blue_ADC').cs);
 assert.deepEqual(b.riftScryerCyclesV452d4,{});
});
console.log(`V4.5.2d-4-dev8 SCRYER ${count}/8 PASS`);
