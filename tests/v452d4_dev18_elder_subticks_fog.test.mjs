import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),user=read('rift_user_manifest_v452d4.json');
map.riftBundlesV452d4=user.variants;map.riftBaseFeaturesV452d4=user.baseFeatures;
const make=()=>new Arena(map,mask,{seed:18018,roundSeconds:10,mode:'bot'});
let passed=0;const test=(label,fn)=>{fn();passed++;console.log('✓ DEV18 '+label)};
const setup=()=>{const a=make(),u=a.units.find(x=>x.id==='blue_TOP'),v=a.units.find(x=>x.id==='red_TOP');a.gameTime=1800;a.grantElderV452d4Dev14('blue');v.shield=0;return {a,u,v};};

test('primeiro tick de queimadura precisamente em t+0,25 e segundo em t+1,25',()=>{
 const {a,u,v}=setup(),hp=v.hp;
 a.damage(v,5,u,'true','spell');const after=v.hp;
 assert.equal(a.advanceElderSubticksV452d4Dev18(1800.24),0);
 assert.equal(v.hp,after);
 assert.equal(a.advanceElderSubticksV452d4Dev18(1800.25),1);
 assert.equal(a.elderSubtickLedgerV452d4Dev18[0].at,1800.25);
 assert.ok(v.hp<after);
 assert.equal(a.advanceElderSubticksV452d4Dev18(1801.24),0);
 assert.equal(a.advanceElderSubticksV452d4Dev18(1801.25),1);
 assert.ok(v.hp<hp);
 assert.equal(a.advanceElderSubticksV452d4Dev18(1802.25),1);
 assert.equal(v.elderBurnV452d,null);
});

test('execução dispara em t+0,5 depois da janela de dano',()=>{
 const {a,u,v}=setup();v.hp=v.maxHp*.17;
 a.damage(v,5,u,'true','spell');assert.ok(v.elderPendingV452);
 a.advanceElderSubticksV452d4Dev18(1800.49);assert.ok(v.hp>0);
 a.advanceElderSubticksV452d4Dev18(1800.5);assert.equal(v.hp,0);
 assert.equal(v.deaths,1);
 assert.equal(a.elderSubtickLedgerV452d4Dev18.find(x=>x.kind==='execute').at,1800.5);
 assert.equal(a.elderSubtickLedgerV452d4Dev18.filter(x=>x.kind==='execute').length,1);
});

test('cura antes da execução remove limiar; marca expira sem dano',()=>{
 const {a,u,v}=setup();v.hp=v.maxHp*.18;
 a.damage(v,4,u,'true','spell');v.hp=v.maxHp*.45;
 a.advanceElderSubticksV452d4Dev18(1800.51);
 assert.equal(v.deaths,0);assert.ok(v.hp>0);assert.equal(v.elderPendingV452,null);
 assert.equal(a.elderSubtickLedgerV452d4Dev18.find(x=>x.kind==='execute').executed,false);
});

test('estase bloqueia a execução mas permite resolver ticks posteriores',()=>{
 const {a,u,v}=setup();v.hp=v.maxHp*.18;
 a.damage(v,4,u,'true','spell');v.stasisUntil=1801;
 a.advanceElderSubticksV452d4Dev18(1800.51);
 assert.ok(v.hp>0);assert.equal(v.deaths,0);
 assert.equal(a.elderSubtickLedgerV452d4Dev18.find(x=>x.kind==='execute').executed,false);
});

test('queimadura não reaplica a si nem marca execução; 3 sub-ticks exatos',()=>{
 const {a,u,v}=setup();v.hp=v.maxHp*.43;
 a.damage(v,5,u,'true','spell');
 a.advanceElderSubticksV452d4Dev18(1803);
 assert.equal(a.elderSubtickLedgerV452d4Dev18.filter(x=>x.kind==='burn').length,3);
 assert.equal(a.elderSubtickLedgerV452d4Dev18.filter(x=>x.kind==='execute').length,0);
 assert.equal(v.elderBurnV452d,null);
});

test('snapshot preserva fila do Ancião, danos e resultado determinístico',()=>{
 const {a,u,v}=setup();v.hp=v.maxHp*.52;
 a.damage(v,5,u,'true','spell');
 a.advanceElderSubticksV452d4Dev18(1800.25);
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 a.advanceElderSubticksV452d4Dev18(1802.3);b.advanceElderSubticksV452d4Dev18(1802.3);
 assert.equal(a.units.find(x=>x.id===v.id).hp,b.units.find(x=>x.id===v.id).hp);
 assert.deepEqual(a.elderSubtickLedgerV452d4Dev18,b.elderSubtickLedgerV452d4Dev18);
 assert.equal(a.validateInvariants().length,0);
});

test('backwards-compatible: snapshots sem metadados sub-tick preservam timers inteiros',()=>{
 const {a,u,v}=setup();a.damage(v,5,u,'true','spell');
 delete v.elderBurnV452d.preciseNextAtV452d4Dev18;
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(b.advanceElderSubticksV452d4Dev18(1800.99),0);
 assert.equal(b.advanceElderSubticksV452d4Dev18(1801),1);
});

test('seis variantes: terreno correto e máscaras originais imutáveis no replay',()=>{
 for(const element of ['infernal','mountain','ocean','cloud','hextech','chemtech']){
  const a=make();const originalWall=a.mask.wall,originalBrush=a.mask.brush;
  assert.equal(a.activateRiftV452d4(element).ok,true,element);
  const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
  assert.equal(b.riftV452d4.element,element);assert.equal(b.riftV452d4.phase,'active');
  assert.equal(b.riftMaskV452d4('wall'),a.riftMaskV452d4('wall'));
  assert.equal(b.riftMaskV452d4('brush'),a.riftMaskV452d4('brush'));
  assert.equal(a.mask.wall,originalWall);assert.equal(a.mask.brush,originalBrush);
  assert.equal(b.activateRiftV452d4(element).ok,false);
  assert.deepEqual(b.validateInvariants(),[],element);
 }
});

test('seis variantes: wards invisíveis sem detecção; pink visível sob visão real',()=>{
 for(const element of ['infernal','mountain','ocean','cloud','hextech','chemtech']){
  const a=make();a.activateRiftV452d4(element);
  const observer=a.units.find(x=>x.id==='blue_TOP');
  const probe={x:observer.x,y:observer.y};assert.equal(a.canSeePoint('blue',probe),true,element);
  const stealth={id:'dev18_stealth',team:'red',owner:'red_TOP',x:probe.x,y:probe.y,type:'stealth',hp:3,maxHp:3,until:null,createdAt:0,disabledUntil:0};
  const pink={...stealth,id:'dev18_pink',type:'control'};
  a.wards.push(stealth,pink);
  // An allied control ward is needed to reveal enemy stealth. The red pink
  // cannot reveal its own team's stealth ward for the blue perspective.
  assert.equal(a.wardKnownTo('blue',stealth),false,element);
  assert.equal(a.wardKnownTo('blue',pink),true,element);
  const view=a.perspective('blue');assert.ok(view.wards.some(w=>w.id===pink.id),element);
  assert.ok(!view.wards.some(w=>w.id===stealth.id),element);
 }
});


test('pipeline real tick(): micro-ticks são processados sem avançar segundo de render',()=>{
 const {a,u,v}=setup();a.phase='executing';
 v.hp=v.maxHp*.64;const start=v.hp;
 a.damage(v,5,u,'true','spell');
 a.tick();
 assert.equal(a.gameTime,1800);
 assert.equal(a.elderSubtickLedgerV452d4Dev18.filter(e=>e.kind==='burn').length,1);
 assert.equal(a.elderSubtickLedgerV452d4Dev18[0].at,1800.25);
 assert.ok(v.hp<start);
 a.gameTime++;a.tick();
 assert.equal(a.elderSubtickLedgerV452d4Dev18.filter(e=>e.kind==='burn').length,2);
});

test('eventos simultâneos de campeões múltiplos seguem ordem estável por ID',()=>{
 const a=make();a.gameTime=1800;
 a.grantElderV452d4Dev14('blue');
 const source=a.units.find(u=>u.id==='blue_TOP');
 const v1=a.units.find(u=>u.id==='red_TOP'),v2=a.units.find(u=>u.id==='red_MID');
 a.damage(v1,5,source,'true','spell');a.damage(v2,5,source,'true','spell');
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 a.advanceElderSubticksV452d4Dev18(1800.25);b.advanceElderSubticksV452d4Dev18(1800.25);
 assert.deepEqual(a.elderSubtickLedgerV452d4Dev18,b.elderSubtickLedgerV452d4Dev18);
 const ids=a.elderSubtickLedgerV452d4Dev18.map(e=>e.victimId);
 assert.deepEqual(ids,[v1.id,v2.id].sort());
});

console.log(`V4.5.2d-4-dev18 ${passed}/11 PASS`);
