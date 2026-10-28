import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const mask=load('masks_128.json'),m=load('rift_user_manifest_v452d4.json'),map=load('coachlol_map_v6.json');
map.riftBaseFeaturesV452d4=m.baseFeatures;map.riftBundlesV452d4=m.variants;map.scryerConeMaskV452d4=m.scryerConeMask;
const make=()=>new Arena(map,mask,{seed:612,roundSeconds:10});
let total=0;const test=(name,cb)=>{cb();total++;console.log('✓ DEV12 '+name)};
const cell=(x,y)=>Math.floor(y*128)*128+Math.floor(x*128);
const inside=a=>{const site=a.riftAllFeaturesV452d4('scryers').find(x=>a.walkable(x.x,x.y));assert.ok(site);return site;};

test('15 pontos marcados são Scryers de todos os Rifts; nenhum duplicado Quimtec',()=>{
 assert.equal(m.baseFeatures.scryers.length,15);
 assert.equal(m.baseFeatures.scryers.filter(x=>x.sourcePixels>0).length,15);
 assert.equal(new Set(m.baseFeatures.scryers.map(x=>x.id)).size,15);
 assert.equal(m.variants.chemtech.features.plants?.length||0,0);
 assert.equal(m.baseFeatures.plants.filter(p=>p.kind==='honeyfruit').length,10);
 assert.equal(m.baseFeatures.scryers.filter(p=>p.tier==='late').length,10);
 const a=make();assert.equal(a.riftAllFeaturesV452d4('scryers').length,5);
 for(const rift of ['chemtech','ocean','mountain','hextech','cloud','infernal']){
  const b=make();b.activateRiftV452d4(rift);assert.equal(b.riftAllFeaturesV452d4('scryers').length,15);
 }
});
test('Correção brush base e Ocean: deltas na malha real, sem mutar source',()=>{
 assert.equal(m.metrics.dev12.baseBrushChangedFromDev11,34);
 assert.equal(mask.brush.split('1').length-1,433);
 assert.equal(m.variants.ocean.addBrush.length,92);
 assert.equal(m.variants.ocean.removeBrush.length,4);
 const a=make(),original=a.mask.brush;
 a.activateRiftV452d4('ocean');
 assert.equal(a.mask.brush,original);
 assert.equal(a.riftMaskV452d4('brush').split('1').length-1,521);
 assert.ok(m.variants.ocean.addBrush.some(i=>a.riftMaskV452d4('brush')[i]==='1'&&mask.brush[i]==='0'));
 assert.deepEqual(a.validateInvariants(),[]);
});
test('Origem esquerda e cone de imagem é rotacionável sem trocar a máscara',()=>{
 const a=make(),site=inside(a),shape=m.scryerConeMask;
 assert.equal(shape.leftOrigin,true);assert.ok(shape.polygonLocal.length>=4);
 const p0=a.scryerConeWorldPolygonV452d4({x:site.x,y:site.y,heading:0});
 const p90=a.scryerConeWorldPolygonV452d4({x:site.x,y:site.y,heading:Math.PI/2});
 assert.equal(p0.length,p90.length);
 for(let i=0;i<p0.length;i++){
  assert.ok(Math.abs((p90[i].x-site.x)+(p0[i].y-site.y))<1e-6);
  assert.ok(Math.abs((p90[i].y-site.y)-(p0[i].x-site.x))<1e-6);
 }
 const right={x:site.x+.04,y:site.y},left={x:site.x-.04,y:site.y};
 const pulse={x:site.x,y:site.y,heading:0,kind:'scryer_bloom',enhanced:false};
 assert.equal(a.riftPulseContainsV452d4(pulse,left),false,'não revela atrás da ponta esquerda');
 if(a.riftLineOfSightWallsV452d4(site,right))assert.equal(a.riftPulseContainsV452d4(pulse,right),true);
});
test('Florividente normal revela wards sem danificá-las; Quimtec aplica buff',()=>{
 const makeCase=(chem)=>{
  const a=make();if(chem)a.activateRiftV452d4('chemtech');
  const site=inside(a),u=a.units.find(x=>x.team==='blue'),ally=a.units.find(x=>x.team==='blue'&&x.id!==u.id);
  u.x=site.x;u.y=site.y;
  const angle=Array.from({length:64},(_,i)=>i*Math.PI/32).find(theta=>{
   const q={x:site.x+.015*Math.cos(theta),y:site.y+.015*Math.sin(theta)};
   return a.riftPulseContainsV452d4({x:site.x,y:site.y,heading:theta,kind:'scryer_bloom',enhanced:chem},q);
  });
  assert.ok(Number.isFinite(angle));const q={x:site.x+.015*Math.cos(angle),y:site.y+.015*Math.sin(angle)};
  const ward={id:'ward_enemy',team:'red',type:'stealth',hp:3,x:q.x,y:q.y,until:500};a.wards.push(ward);
  ally.x=q.x;ally.y=q.y;const before=a.effectiveMS(ally);
  const r=a.activateScryerBloomV452d4('blue',u.id,site.id,angle);assert.equal(r.ok,true,JSON.stringify(r));
  assert.equal(a.wardKnownTo('blue',ward),true);assert.equal(ward.hp,chem?1:3);
  if(chem)assert.ok(a.effectiveMS(ally)>before);else assert.equal(a.effectiveMS(ally),before);
  const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());assert.equal(b.riftVisionPulsesV452d4.length,1);
  assert.equal(b.scryerConeWorldPolygonV452d4(b.riftVisionPulsesV452d4[0]).length,shapeVertexCount());
  return r;
 };
 const shapeVertexCount=()=>m.scryerConeMask.polygonLocal.length;
 makeCase(false);makeCase(true);
});
test('Honeyfruit aparece antes do Quimtec; escudo é apenas melhoria elemental',()=>{
 for(const chem of [false,true]){
  const a=make();if(chem)a.activateRiftV452d4('chemtech');
  assert.equal(a.riftAllFeaturesV452d4('plants').length,14);
  const plant=a.riftAllFeaturesV452d4('plants').find(x=>x.kind==='honeyfruit');const u=a.units.find(x=>x.team==='blue');
  u.x=plant.x;u.y=plant.y;u.hp=u.maxHp*.5;u.shield=0;
  const out=a.activateRiftPlantV452d4('blue',u.id,plant.id);
  assert.equal(out.ok,true,JSON.stringify(out));assert.ok(u.hp>u.maxHp*.5);
  assert.equal(u.shield>0,chem);
  const slow=a.effectResolverV41().slowFraction(u);
  assert.equal(slow>0,!chem);
 }
});
test('Cooldown 200–260 padrão, 90–120 após desbloqueio por tempo/Rift, sem RNG de combate',()=>{
 const a=make(),u=a.units.find(x=>x.team==='blue'),site=inside(a);u.x=site.x;u.y=site.y;
 const original=a.rng.getState(),r=a.activateScryerBloomV452d4('blue',u.id,site.id,0);
 assert.equal(r.ok,true);assert.ok(r.respawnSeconds>=200&&r.respawnSeconds<=260);
 assert.equal(a.rng.getState(),original);assert.equal(a.activateScryerBloomV452d4('blue',u.id,site.id,0).ok,false);
 const b=make();b.gameTime=900;assert.equal(b.riftAllFeaturesV452d4('scryers').length,15);
 const late=b.riftAllFeaturesV452d4('scryers').find(x=>x.tier==='late');const v=b.units.find(x=>x.team==='blue');v.x=late.x;v.y=late.y;
 const rr=b.activateScryerBloomV452d4('blue',v.id,late.id,Math.PI/2);assert.equal(rr.ok,true);assert.ok(rr.respawnSeconds>=90&&rr.respawnSeconds<=120);
});
console.log(`V4.5.2d-4-dev12: ${total}/6 PASS`);
