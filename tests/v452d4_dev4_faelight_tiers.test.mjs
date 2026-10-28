import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json'),user=data('rift_user_manifest_v452d4.json');
map.riftBundlesV452d4=user.variants;map.riftBaseFeaturesV452d4=user.baseFeatures;
const arena=()=>new Arena(map,mask,{seed:2621,roundSeconds:10});
let successes=0;function test(name,fn){fn();successes++;console.log('✓ RIFT DEV4 '+name);}

test('10 faelights autenticados pelas máscaras: 6 early + 4 late',()=>{
 assert.equal(user.counts.faelights,10);assert.equal(user.baseFeatures.faelights.length,10);
 const early=user.baseFeatures.faelights.filter(p=>(p.unlockAtSeconds||0)===0);
 const late=user.baseFeatures.faelights.filter(p=>p.unlockAtSeconds===900);
 assert.equal(early.length,6);assert.equal(late.length,4);
 assert.equal(user.baseFeatures.faelights.filter(p=>p.sourcePixels>0).length,10);
 assert.ok(user.baseFeatures.faelights.every(p=>Array.isArray(p.visionPolygon)&&p.visionPolygon.length>=8));
});

test('6 pontos ativos no início; 4 extras surgem aos 15min e não com a transformação',()=>{
 const a=arena();assert.equal(a.riftAllFeaturesV452d4('faelights').length,6);
 a.awardElementalDragonV452d3('blue','ocean',{captureId:'t1'});
 a.awardElementalDragonV452d3('red','mountain',{captureId:'t2'});
 assert.equal(a.riftV452d4.phase,'active');
 assert.equal(a.riftAllFeaturesV452d4('faelights').length,6,'transformação não antecipa os tardios');
 a.gameTime=899;assert.equal(a.riftAllFeaturesV452d4('faelights').length,6);
 a.gameTime=900;assert.equal(a.riftAllFeaturesV452d4('faelights').length,10);
 assert.equal(a.riftAllFeaturesV452d4('faelights').filter(x=>x.unlockAtSeconds===900).length,4);
});

test('ponto tardio só concede superward após 15min, preservando os 6 iniciais',()=>{
 const a=arena();const late=user.baseFeatures.faelights.find(p=>p.unlockAtSeconds===900&&a.walkable(p.x,p.y));
 assert.ok(late);const u=a.units.find(x=>x.team==='blue');u.trinket='farsight';u.x=late.x;u.y=late.y;u.wardCharges=2;
 const pre=a.addWard('blue',u.id,late,'farsight');assert.equal(pre.ok,true,JSON.stringify(pre));assert.equal(pre.ward.faelightSiteId,undefined);
 a.gameTime=900;const post=a.addWard('blue',u.id,late,'farsight');assert.equal(post.ok,true,JSON.stringify(post));assert.equal(post.ward.faelightSiteId,late.id);
 assert.equal(a.riftAllFeaturesV452d4('faelights').filter(x=>(x.unlockAtSeconds||0)===0).length,6);
});

test('região extra usa polígono da máscara, é privada por equipe e expira em 45s',()=>{
 const a=arena();const site=a.riftAllFeaturesV452d4('faelights').find(p=>a.walkable(p.x,p.y));
 assert.ok(site&&site.visionPolygon.length>=8);
 const center={x:site.visionPolygon.reduce((n,p)=>n+p[0],0)/site.visionPolygon.length,y:site.visionPolygon.reduce((n,p)=>n+p[1],0)/site.visionPolygon.length};
 const u=a.units.find(x=>x.team==='blue');u.trinket='farsight';u.x=site.x;u.y=site.y;
 const r=a.addWard('blue',u.id,site,'farsight');assert.equal(r.ok,true);
 assert.equal(a.visionSources('red').some(p=>p.kind==='faelight_region'),false);
 assert.equal(a.visionSources('blue').some(p=>p.kind==='faelight_region'),true);
 assert.equal(a.riftFaelightContainsV452d4(site,{x:.999,y:.999}),false);
 assert.equal(a.riftFaelightContainsV452d4(site,center),a.riftLineOfSightWallsV452d4(site,center));
 a.gameTime+=46;assert.equal(a.visionSources('blue').some(p=>p.kind==='faelight_region'),false);
});

test('snapshot preserva superward e liberação tardia',()=>{
 const a=arena();a.gameTime=900;const site=a.riftAllFeaturesV452d4('faelights').find(p=>p.unlockAtSeconds===900&&a.walkable(p.x,p.y));
 const u=a.units.find(x=>x.team==='blue');u.trinket='farsight';u.x=site.x;u.y=site.y;const r=a.addWard('blue',u.id,site,'farsight');assert.equal(r.ok,true);
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(b.gameTime,900);assert.equal(b.riftAllFeaturesV452d4('faelights').length,10);
 assert.equal(b.visionSources('blue').filter(p=>p.kind==='faelight_region').length,1);
});
console.log(`V4.5.2d-4-dev4 ${successes}/5 PASS`);
