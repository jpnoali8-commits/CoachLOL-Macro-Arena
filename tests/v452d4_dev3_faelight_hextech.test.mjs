import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json'),user=data('rift_user_manifest_v452d4.json');
map.riftBundlesV452d4=user.variants;map.riftBaseFeaturesV452d4=user.baseFeatures;
const arena=()=>new Arena(map,mask,{seed:2621,roundSeconds:10});
let successes=0;function test(name,fn){fn();successes++;console.log('✓ RIFT DEV3 '+name);}
test('12 Faelights: 11 realmente marcados, 1 inferido e auditável',()=>{
 assert.equal(user.counts.faelights,11);assert.equal(user.baseFeatures.faelights.length,12);
 const inferred=user.baseFeatures.faelights.filter(p=>p.sourcePixels===0);
 assert.equal(inferred.length,1);assert.match(inferred[0].provenance,/INFERRED/);
 assert.deepEqual(new Set(user.baseFeatures.faelights.map(x=>x.id)).size,12);
});
test('8 pontos base, 4 liberados no Rift; transformação apenas uma vez',()=>{
 const a=arena();assert.equal(a.riftAllFeaturesV452d4('faelights').length,8);
 assert.equal(a.riftAllFeaturesV452d4('faelights').filter(x=>x.unlockPhase==='post_rift').length,0);
 a.awardElementalDragonV452d3('blue','ocean',{captureId:'l1'});
 assert.equal(a.riftAllFeaturesV452d4('faelights').length,8);
 a.awardElementalDragonV452d3('red','mountain',{captureId:'l2'});
 assert.equal(a.riftAllFeaturesV452d4('faelights').length,12);
 assert.equal(a.riftAllFeaturesV452d4('faelights').filter(x=>x.unlockPhase==='post_rift').length,4);
 a.awardElementalDragonV452d3('blue','hextech',{captureId:'l3'});
 assert.equal(a.riftAllFeaturesV452d4('faelights').length,12);
});
test('não concede superward em ponto ainda bloqueado; mesmo ponto ganha bônus após transformação',()=>{
 const a=arena();const post=user.baseFeatures.faelights.find(p=>p.unlockPhase==='post_rift'&&a.walkable(p.x,p.y));
 assert.ok(post);const u=a.units.find(x=>x.team==='blue');u.trinket='farsight';u.x=post.x;u.y=post.y;
 const pre=a.addWard('blue',u.id,post,'farsight');
 assert.equal(pre.ok,true,JSON.stringify(pre));assert.equal(pre.ward.faelightSiteId,undefined);
 a.activateRiftV452d4('ocean');const result=a.addWard('blue',u.id,post,'farsight');
 assert.equal(result.ok,true,JSON.stringify(result));assert.equal(result.ward.faelightSiteId,post.id);
});
test('região extra respeita o polígono do local, é independente da moita, não infinita',()=>{
 const a=arena();const site=a.riftAllFeaturesV452d4('faelights').find(p=>a.walkable(p.x,p.y));
 assert.ok(site&&site.visionPolygon.length===5);
 const center={x:site.visionPolygon.reduce((n,p)=>n+p[0],0)/5,y:site.visionPolygon.reduce((n,p)=>n+p[1],0)/5};
 assert.equal(a.riftFaelightContainsV452d4(site,{x:.999,y:.999}),false);
 assert.equal(a.riftFaelightContainsV452d4(site,site.visionPolygon[0]),false); // boundary non-certification
 // Engine sources are team scoped, not publicly exposed to opponents.
 const u=a.units.find(x=>x.team==='blue');u.trinket='farsight';u.x=site.x;u.y=site.y;
 const r=a.addWard('blue',u.id,site,'farsight');assert.equal(r.ok,true);
 assert.equal(a.visionSources('red').some(p=>p.kind==='faelight_region'),false);
 assert.equal(a.visionSources('blue').some(p=>p.kind==='faelight_region'),true);
 assert.equal(a.riftFaelightContainsV452d4(site,center),a.riftLineOfSightWallsV452d4(site,center));
 a.gameTime+=46;assert.equal(a.visionSources('blue').some(p=>p.kind==='faelight_region'),false);
});
test('detector suprime superward, serialização restaura região, não duplica custo',()=>{
 const a=arena();const site=a.riftAllFeaturesV452d4('faelights')[0],u=a.units.find(x=>x.team==='blue');u.x=site.x;u.y=site.y;
 u.trinket='farsight';u.wardCharges=2;const before=a.addWard('blue',u.id,site,'farsight');assert.equal(before.ok,true);
 const restored=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(restored.visionSources('blue').filter(p=>p.kind==='faelight_region').length,1);
 a.wards[0].disabledUntil=a.gameTime+20;
 assert.equal(a.visionSources('blue').filter(p=>p.kind==='faelight_region').length,0);
 assert.equal(u.wardCharges,1);
 const after=a.addWard('blue',u.id,site,'farsight');assert.equal(after.ok,true);
 assert.equal(a.wards.filter(w=>w.team==='blue'&&w.faelightSiteId===site.id).length,1);
 assert.equal(u.wardCharges,0);
});
test('portal rejeita canalização com CC, sem perder posição/ganhar cooldown',()=>{
 const a=arena();a.activateRiftV452d4('hextech');const gate=a.riftFeaturesV452d4('hexgates')[0],u=a.units.find(x=>x.team==='blue');u.x=gate.x;u.y=gate.y;
 u.stunUntil=a.gameTime+2;
 const r=a.beginHexgateV452d4('blue',u.id,gate.id);assert.equal(r.ok,false);assert.equal(a.riftHexChannelsV452d4.length,0);
 u.stunUntil=0;assert.equal(a.beginHexgateV452d4('blue',u.id,gate.id).ok,true);
 a.gameTime+=1;u.stunUntil=a.gameTime+2;a.advanceRiftHexgatesV452d4();assert.equal(a.riftHexChannelsV452d4.length,0);
 assert.equal(a.riftHexCooldownsV452d4[u.id],undefined);
});
test('portal concluído tem lock temporal, persiste em snapshot e libera ao vencer cooldown',()=>{
 const a=arena();a.activateRiftV452d4('hextech');const from=a.riftFeaturesV452d4('hexgates')[0],u=a.units.find(x=>x.team==='blue');u.x=from.x;u.y=from.y;
 const begin=a.beginHexgateV452d4('blue',u.id,from.id);assert.equal(begin.ok,true);
 a.gameTime=begin.until;a.advanceRiftHexgatesV452d4();assert.ok(a.riftHexCooldownsV452d4[u.id]>a.gameTime);
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(b.riftHexCooldownsV452d4[u.id],a.riftHexCooldownsV452d4[u.id]);
 u.x=from.x;u.y=from.y;assert.equal(a.beginHexgateV452d4('blue',u.id,from.id).ok,false);
 a.gameTime=a.riftHexCooldownsV452d4[u.id];assert.equal(a.beginHexgateV452d4('blue',u.id,from.id).ok,true);
});
test('floração Quimtec afeta apenas aliados revelados dentro do pulso e velocidade temporária',()=>{
 const a=arena();a.activateRiftV452d4('chemtech');const p=a.riftFeaturesV452d4('plants').find(p=>p.kind==='firelight_bloom');
 const u=a.units.find(x=>x.team==='blue'),ally=a.units.find(x=>x.team==='blue'&&x!==u),enemy=a.units.find(x=>x.team==='red');
 u.x=p.x;u.y=p.y;ally.x=p.x+.005;ally.y=p.y;enemy.x=p.x+.004;enemy.y=p.y;
 const m=a.effectiveMS(ally),mE=a.effectiveMS(enemy);
 assert.equal(a.activateRiftPlantV452d4('blue',u.id,p.id,0).ok,true);
 assert.ok(a.effectiveMS(ally)>m);assert.equal(a.effectiveMS(enemy),mE);
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(b.units.find(x=>x.id===ally.id).riftFirelightSpeedUntilV452d4,ally.riftFirelightSpeedUntilV452d4);
 a.gameTime+=4;assert.equal(a.firelightSpeedBonusV452d4(ally),0);
});
console.log(`V4.5.2d-4-dev3 ${successes}/8 PASS`);
