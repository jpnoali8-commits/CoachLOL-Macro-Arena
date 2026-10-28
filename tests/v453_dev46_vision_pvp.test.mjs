import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
import {AuthoritativeActionsV453Dev44} from '../multiplayer/authoritative_actions_v453_dev44.mjs';
const load=n=>JSON.parse(fs.readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),manifest=load('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=manifest.baseFeatures;map.riftBundlesV452d4=manifest.variants;
const create=()=>new Arena(map,mask,{seed:46});
const sites=manifest.baseFeatures.faelights;
const pick=(a,late=false)=>a.riftAllFeaturesV452d4('faelights').find(s=>!!(s.unlockAtSeconds>0)===late&&a.walkable(s.x,s.y));
const station=(a,site,team='blue')=>{const u=a.units.find(v=>v.team===team&&v.role==='ADC');u.x=site.x;u.y=site.y;u.wardCharges=4;u.controlWardStock=2;return u};
let passed=0;function test(title,fn){fn();console.log('✓ DEV46 '+title);passed++;}
test('12 marcadores originais em resolucao 4096, 8 iniciais mais 4 tardios',()=>{
 assert.equal(sites.length,12);assert.equal(sites.filter(s=>s.availabilityTier==='early_game').length,8);
 assert.equal(sites.filter(s=>s.availabilityTier==='late_game').length,4);
 assert.equal(sites.filter(s=>s.activationVerified===true).length,12);
 assert.deepEqual(manifest.authorialVisionReconciliationV453Dev46.nativeResolution,[4096,4096]);
 assert.equal(manifest.authorialVisionReconciliationV453Dev46.activationMarkers,12);
 assert.ok(sites.every(s=>s.visionPolygon.length>=4&&s.activationSource==='Point-Vision-Buff-map.jpg'));
 assert.ok(fs.readFileSync(new URL('../assets/user_rift_masks_20261026/masks/Point-Vision-Buff-map.jpg',import.meta.url)).subarray(0,2).equals(Buffer.from([0xff,0xd8])));
 const px=new Set();for(const s of sites){
  assert.deepEqual(s.visionMaskNativeSizePx,[4096,4096]);
  assert.ok(Math.abs(s.x-s.activationMarkerPx.x/4096)<.000002);
  assert.ok(Math.abs(s.y-s.activationMarkerPx.y/4096)<.000002);
  px.add(`${s.activationMarkerPx.x},${s.activationMarkerPx.y}`);
 }assert.equal(px.size,12);
});
test('novo ponto faelight_03 provem da nova marca e nao do centro da mascara',()=>{
 const s=sites.find(x=>x.id==='faelight_03');assert.ok(s.activationVerified);
 assert.ok(Math.abs(s.activationMarkerPx.x-1374.04)<.06);
 assert.ok(Math.abs(s.activationMarkerPx.y-1704.98)<.06);
 const bb=s.visionMaskBBoxPx;assert.ok(s.activationMarkerPx.x>=bb.x&&s.activationMarkerPx.x<=bb.x+bb.w);
 assert.ok(create().walkable(s.x,s.y));
});
test('cliente do navegador e motor usam as mesmas 12 posicoes',()=>{
 const file=fs.readFileSync(new URL('../data/rift_user_assets_v452d4.js',import.meta.url),'utf8');
 const js=JSON.parse(file.split('window.COACH_RIFT_USER_V452D4=')[1].trim().replace(/;$/,''));
 assert.deepEqual(js.baseFeatures.faelights,sites);
});
test('ward amarela ativa area extra temporaria e 25% de alcance',()=>{
 const a=create(),s=pick(a),u=station(a,s);const ret=a.addWard('blue',u.id,s,'stealth');
 assert.ok(ret.ok,ret.reason);assert.equal(ret.ward.faelightSiteId,s.id);
 assert.equal(ret.ward.faelightUntil,a.gameTime+s.bonusSeconds);
 assert.ok(a.wardRadius(ret.ward)>900/a.worldWidth);
 assert.equal(a.visionSources('blue').filter(x=>x.kind==='faelight_region').length,1);
});
test('pink tambem ativa o bonus temporario',()=>{
 const a=create(),s=pick(a),u=station(a,s);const ret=a.addWard('blue',u.id,s,'control');
 assert.ok(ret.ok,ret.reason);assert.equal(ret.ward.faelightSiteId,s.id);
 assert.equal(a.visionSources('blue').filter(x=>x.kind==='faelight_region').length,1);
});
test('sentinela azul tambem ativa a area extra com trinket correto',()=>{
 const a=create(),s=pick(a),u=station(a,s);u.trinket='farsight';const ret=a.addWard('blue',u.id,s,'farsight');
 assert.ok(ret.ok,ret.reason);assert.equal(ret.ward.faelightSiteId,s.id);
 assert.equal(a.visionSources('blue').filter(x=>x.kind==='faelight_region').length,1);
});
test('ward de suporte aprimorada preserva bonus do ponto',()=>{
 const a=create(),s=pick(a),u=a.units.find(v=>v.team==='blue'&&v.role==='SUP');
 u.x=s.x;u.y=s.y;u.supportQuest=450;u.wardCharges=3;
 const ret=a.addWard('blue',u.id,s,'stealth');assert.ok(ret.ok,ret.reason);
 assert.equal(ret.ward.type,'support');assert.equal(ret.ward.faelightSiteId,s.id);
});
test('fora do marcador nao concede area extra',()=>{
 const a=create(),s=pick(a),u=station(a,s);const other={x:s.x+.025,y:s.y+.025};
 const ret=a.addWard('blue',u.id,other,'stealth');
 if(ret.ok){assert.equal(ret.ward.faelightSiteId,undefined);assert.equal(a.visionSources('blue').filter(x=>x.kind==='faelight_region').length,0)}
 else assert.ok(['Posição fora de alcance ou bloqueada.'].includes(ret.reason));
});
test('4 pontos tardios nao concedem bonus antes do desbloqueio',()=>{
 const a=create(),s=sites.find(v=>v.unlockAtSeconds===900),u=station(a,s);const ret=a.addWard('blue',u.id,s,'stealth');
 assert.ok(ret.ok);assert.equal(ret.ward.faelightSiteId,undefined);
});
test('4 pontos tardios passam a funcionar depois do desbloqueio',()=>{
 const a=create();a.gameTime=900;const s=pick(a,true),u=station(a,s);
 const ret=a.addWard('blue',u.id,s,'stealth');assert.ok(ret.ok,ret.reason);assert.equal(ret.ward.faelightSiteId,s.id);
});
test('bonus expira sem permanecer na regiao e sem alongar raio original',()=>{
 const a=create(),s=pick(a),u=station(a,s);const w=a.addWard('blue',u.id,s,'stealth').ward;
 a.gameTime=w.faelightUntil;assert.equal(a.visionSources('blue').filter(x=>x.kind==='faelight_region').length,0);
 assert.equal(a.wardRadius(w),900/a.worldWidth);
});
test('sentinela suprimida nao vaza area do bonus para a equipe',()=>{
 const a=create(),s=pick(a),u=station(a,s);const w=a.addWard('blue',u.id,s,'stealth').ward;
 w.disabledUntil=a.gameTime+30;
 assert.equal(a.visionSources('blue').filter(x=>x.kind==='faelight_region').length,0);
 assert.equal(a.visionSources('red').filter(x=>x.kind==='faelight_region').length,0);
});
test('a visao da regiao pertence somente a equipe da sentinela',()=>{
 const a=create(),s=pick(a),u=station(a,s);assert.ok(a.addWard('blue',u.id,s,'stealth').ok);
 assert.equal(a.visionSources('red').some(x=>x.kind==='faelight_region'),false);
 assert.equal(a.visionSources('blue').some(x=>x.kind==='faelight_region'),true);
});
test('snapshot preserva bonus no prazo e remove depois da expiracao',()=>{
 const a=create(),s=pick(a),u=station(a,s);assert.ok(a.addWard('blue',u.id,s,'stealth').ok);
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());assert.equal(b.visionSources('blue').filter(x=>x.kind==='faelight_region').length,1);
 b.gameTime+=46;assert.equal(b.visionSources('blue').filter(x=>x.kind==='faelight_region').length,0);
});
test('gateway PvP aceita tipo de ward do dono, com sequencia e comando autoritativo',()=>{
 const a=create(),s=pick(a),u=station(a,s);const g=new AuthoritativeActionsV453Dev44(a,[{seatId:'blueplayer',unitId:u.id},{seatId:'redplayer',unitId:'red_ADC'}]);
 const ack=g.submit('blueplayer',{sequence:1,kind:'order.ward',payload:{point:{x:s.x,y:s.y},wardType:'stealth'}});
 assert.ok(ack.ok,JSON.stringify(ack));assert.equal(u.order.wardType,'stealth');
 assert.equal(g.submit('blueplayer',{sequence:1,kind:'order.ward',payload:{point:{x:s.x,y:s.y},wardType:'control'}}).ok,false);
 assert.equal(g.submit('redplayer',{sequence:1,kind:'order.ward',payload:{point:{x:s.x,y:s.y},wardType:'oracle'}}).ok,false);
 a.phase='execution';a.gameTime+=1;a.reviveAndMove();
 assert.equal(a.wards.find(w=>w.team==='blue')?.faelightSiteId,s.id);
});
test('gateway nao permite controle do personagem adversario por identificador forjado',()=>{
 const a=create(),s=pick(a),u=station(a,s);const g=new AuthoritativeActionsV453Dev44(a,[{seatId:'blueplayer',unitId:u.id}]);
 const snap=checksumV40(a.snapshotV40());
 assert.equal(g.submit('blueplayer',{sequence:1,kind:'order.ward',unitId:'red_ADC',payload:{point:{x:s.x,y:s.y},wardType:'control'}}).ok,false);
 assert.equal(checksumV40(a.snapshotV40()),snap);
});
console.log(`V4.5.3-dev46 ${passed}/${passed} PASS`);
