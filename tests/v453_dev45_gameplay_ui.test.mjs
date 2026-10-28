import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),features=load('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=features.baseFeatures;map.riftBundlesV452d4=features.variants;
const create=()=>new Arena(map,mask,{seed:26});
let n=0;function test(title,fn){fn();console.log('✓ dev45 '+title);n++}
test('composicao wave sem catapulta: 3 guerreiros + 3 magos',()=>{
 const a=create(),w=a.waveCompositionV452b(1,100);assert.equal(w.length,6);assert.equal(w.filter(x=>x==='melee').length,3);assert.equal(w.filter(x=>x==='caster').length,3);
});
test('wave canhao tardio: 3+3+1, sem perda de magos/guerreiros',()=>{
 const a=create();for(const [id,time] of [[3,100],[31,900],[50,1900]]){const w=a.waveCompositionV452b(id,time);assert.equal(w.length,7);assert.equal(w.filter(x=>x==='melee').length,3);assert.equal(w.filter(x=>x==='caster').length,3);assert.equal(w.filter(x=>x==='siege').length,1);}
});
test('pedido de retirada autoritativo desliga perseguição e prioriza rota',()=>{
 const a=create(),u=a.units.find(x=>x.id==='blue_JG');u.order={kind:'attack',targetId:'red_MID'};u.reactionCombo={combo:['Q']};u.pendingPlantV453Dev45={id:'none'};
 const res=a.requestRetreatV453Dev45('blue',u.id);assert.equal(res.ok,true,JSON.stringify(res));assert.equal(u.order.kind,'hold');assert.equal(u.policy,'safe');assert.equal(u.pendingPlantV453Dev45,null);assert.equal(u.reactionCombo,null);assert.ok(u.retreatUntil>a.gameTime);
});
test('recuar movimenta fisicamente pelo caminho ao executar',()=>{
 const a=create(),u=a.units.find(x=>x.id==='blue_JG');const first={x:u.x,y:u.y};const r=a.requestRetreatV453Dev45('blue',u.id);assert.equal(r.ok,true);
 const initial=a.mapDistance(u,r.goal);a.phase='execution';a.gameTime++;a.reviveAndMove();
 assert.ok(a.mapDistance(first,u)>0,'retirada nao pode ficar imovel');assert.ok(a.mapDistance(u,r.goal)<initial,'retirada aproxima o campeao da torre');
});
test('time adversario nao pode controlar retirada de aliado',()=>{
 const a=create();assert.equal(a.requestRetreatV453Dev45('red','blue_JG').ok,false);
});
test('intencao remota de planta nao ativa sem estar no alcance',()=>{
 const a=create(),site=a.riftAllFeaturesV452d4('scryers')[0],u=a.units.find(x=>x.id==='blue_JG');u.x=.02;u.y=.02;
 const before=a.riftPlantTimersV452d4[site.id];const ret=a.requestRiftPlantV453Dev45('blue',u.id,site.id,Math.PI/4);
 assert.ok(ret.ok===true||ret.reason==='planta_sem_caminho');assert.equal(a.riftPlantTimersV452d4[site.id],before);if(ret.ok)assert.equal(u.pendingPlantV453Dev45?.id,site.id);
});
test('florividente ativa de perto depois da intencao com angulo',()=>{
 const a=create(),site=a.riftAllFeaturesV452d4('scryers')[0],u=a.units.find(x=>x.id==='blue_JG');u.x=site.x;u.y=site.y;
 assert.equal(a.requestRiftPlantV453Dev45('blue',u.id,site.id,Math.PI/2).ok,true);assert.equal(a.advanceRiftPlantV453Dev45(u),true);assert.equal(u.pendingPlantV453Dev45,null);assert.ok(a.riftPlantTimersV452d4[site.id]>a.gameTime);
});
test('fruta explosiva usa a mesma ordem e respeita alcance',()=>{
 const a=create(),plant=a.riftAllFeaturesV452d4('plants').find(x=>x.kind==='blast_cone'),u=a.units.find(x=>x.id==='blue_JG');u.x=plant.x;u.y=plant.y;
 const ret=a.requestRiftPlantV453Dev45('blue',u.id,plant.id,0);assert.equal(ret.ok,true);assert.equal(a.advanceRiftPlantV453Dev45(u),true);assert.equal(u.pendingPlantV453Dev45,null);
});
test('snapshot preserva intencao de planta sem ativar duas vezes',()=>{
 const a=create(),site=a.riftAllFeaturesV452d4('scryers')[0],u=a.units.find(x=>x.id==='blue_JG');u.x=site.x;u.y=site.y;
 assert.equal(a.requestRiftPlantV453Dev45('blue',u.id,site.id,1).ok,true);
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());assert.equal(b.units.find(x=>x.id===u.id).pendingPlantV453Dev45.id,site.id);
});
test('todos os 70 itens possuem vetor local legivel e nao referencia quebrada',()=>{
 const ids=readFileSync(new URL('../app.js',import.meta.url),'utf8');const match=ids.match(/const shopLocalIdsV453Dev45=new Set\((\[[^\n]+\])\);/);assert.ok(match);const names=JSON.parse(match[1]);assert.ok(names.length>=70);
 for(const id of names)assert.equal(existsSync(new URL('../assets/ui/items/'+id+'.svg',import.meta.url)),true,id);
});
test('loja sem diagnosticos internos e sem runas visiveis',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),css=readFileSync(new URL('../styles-v453-dev45.css',import.meta.url),'utf8');
 assert.ok(!html.includes('Consultar os 863 itens oficiais'));assert.ok(!html.includes('Itens por função: JG escolhe pet'));assert.ok(css.includes('.runesV43{display:none'));
});
test('loja cards compactos com precos, tooltip e arvore de melhorias',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');assert.ok(app.includes('shopFallbackAsset'));assert.ok(app.includes('shopUpgradesV453Dev45'));assert.ok(app.includes('btn.title=item.name'));assert.ok(app.includes('shopIconTabV453Dev45'));
});
test('runas configuradas no champ select e nao na loja',()=>{
 const draftJs=readFileSync(new URL('../draft.js',import.meta.url),'utf8'),draftHtml=readFileSync(new URL('../champ_select.html',import.meta.url),'utf8');assert.ok(draftJs.includes('draftRuneV453Dev45'));assert.ok(draftHtml.includes('runePages:ev.detail.runePages'));
});
test('HUD Recuar e plantas usam contrato autoritativo',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');assert.ok(app.includes("match.requestRetreatV453Dev45('blue',unit.id)"));assert.ok(app.includes("match.requestRiftPlantV453Dev45('blue',actorId,plant.id,angle)"));
});
test('pontos de ativacao das sentinelas seguem pixels 4096 e areas 8 + 4',()=>{
 const sites=features.baseFeatures.faelights;
 assert.equal(sites.length,12);assert.equal(sites.filter(p=>p.activationVerified).length,12);
 assert.equal(sites.filter(p=>!p.activationVerified).length,0);
 assert.equal(sites.filter(p=>p.availabilityTier==='early_game').length,8);
 assert.equal(sites.filter(p=>p.availabilityTier==='late_game').length,4);
 for(const site of sites){
  assert.deepEqual(site.visionMaskNativeSizePx,[4096,4096]);
  assert.ok(site.visionPolygon.length>=4);
  if(site.activationVerified){
   assert.equal(site.activationSource,'Point-Vision-Buff-map.jpg');
   assert.ok(Math.abs(site.x-site.activationMarkerPx.x/4096)<2e-6);
   assert.ok(Math.abs(site.y-site.activationMarkerPx.y/4096)<2e-6);
  }
 }
});
test('wards amarela, pink e azul ativam buff somente nos pontos confirmados',()=>{
 const a=create(),site=a.riftAllFeaturesV452d4('faelights').find(s=>s.activationVerified&&a.walkable(s.x,s.y));
 assert.ok(site);const u=a.units.find(v=>v.team==='blue');u.x=site.x;u.y=site.y;u.wardCharges=2;
 const plain=a.addWard('blue',u.id,site,'stealth');assert.equal(plain.ok,true);assert.equal(plain.ward.faelightSiteId,site.id);
 u.controlWardStock=1;const pink=a.addWard('blue',u.id,site,'control');assert.equal(pink.ok,true,JSON.stringify(pink));assert.equal(pink.ward.faelightSiteId,site.id);
 u.trinket='farsight';const far=a.addWard('blue',u.id,site,'farsight');assert.equal(far.ok,true,JSON.stringify(far));assert.equal(far.ward.faelightSiteId,site.id);
 assert.equal(a.visionSources('blue').filter(v=>v.kind==='faelight_region').length,1);
 a.gameTime+=46;assert.equal(a.visionSources('blue').filter(v=>v.kind==='faelight_region').length,0);
 assert.equal(a.wardRadius(far.ward),500/a.worldWidth);
});
test('rodape de Reagir ao Golpe possui executar voltar e fechar fora da area rolavel',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8'),css=readFileSync(new URL('../styles-v453-dev45.css',import.meta.url),'utf8');
 assert.ok(app.includes("foot.append(cancel,submit,close);panel.append(foot)"));
 assert.ok(app.includes('resetComboFooterV453Dev45'));
 assert.ok(css.includes('.comboStickyFooterV453Dev45'));
 assert.ok(css.includes('max-height:calc(100dvh - 18px)'));
});
test('sentinela azul pode ser equipada na loja e vira recurso utilizavel na HUD',()=>{
 const a=create(),u=a.units.find(v=>v.team==='blue'&&v.role==='ADC'),shop=a.map.objects.find(v=>v.id==='blue_spawn_shop');
 u.x=shop.x;u.y=shop.y;
 const r=a.purchaseOrPlan('blue',u.id,'trinket_farsight');
 assert.equal(r.ok,true,JSON.stringify(r));assert.equal(u.trinket,'farsight');
 assert.ok(a.addWard('blue',u.id,{x:u.x,y:u.y},'farsight').ok);
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.ok(app.includes("['farsight','Azul'"));
 assert.ok(app.includes("itemId==='trinket_farsight'")||readFileSync(new URL('../engine.mjs',import.meta.url),'utf8').includes("itemId==='trinket_farsight'"));
});
console.log(`V4.5.3-dev45 ${n}/${n} PASS`);
