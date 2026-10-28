import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),user=read('rift_user_manifest_v452d4.json');
map.riftBundlesV452d4=user.variants;map.riftBaseFeaturesV452d4=user.baseFeatures;
const make=(seed=2700)=>new Arena(map,mask,{seed,roundSeconds:10,mode:'bot'});
const mkWard=(id,team,type,p)=>({id,owner:team+'_TOP',team,type,x:p.x,y:p.y,hp:3,maxHp:3,createdAt:0,until:null,disabledUntil:0});
const wallPoint={x:.94140625,y:.02734375},hiddenPoint={x:.894,y:.04};
let passed=0;
function test(name,fn){fn();passed++;console.log('✓ DEV27 '+name);}

test('pink não detecta sentinela por trás da parede, mesmo com visão fornecida por aliado',()=>{
 const a=make();assert.equal(a.lineOfSight(wallPoint,hiddenPoint),false);
 const near=mkWard('probe','blue','stealth',hiddenPoint),pink=mkWard('pink','blue','control',wallPoint),enemy=mkWard('enemy','red','stealth',hiddenPoint);
 a.wards=[near,pink,enemy];
 assert.equal(a.canSeePoint('blue',hiddenPoint),true);
 assert.equal(a.wardKnownTo('blue',enemy),false);
 assert.ok(!a.perspective('blue').wards.some(w=>w.id==='enemy'));
});

test('regressão corrigida dev28: Oracle detecta através da parede, não concede visão normal',()=>{
 const a=make(),u=a.units.find(u=>u.team==='blue');u.x=wallPoint.x;u.y=wallPoint.y;u.oracleUntil=a.gameTime+25;
 a.wards=[mkWard('probe','blue','stealth',hiddenPoint),mkWard('hidden','red','stealth',hiddenPoint)];
 assert.equal(a.canSeePoint('blue',hiddenPoint),true);
 assert.ok(a.mapDistance(u,hiddenPoint)<750);
 assert.equal(a.wardKnownTo('blue',a.wards[1]),true);
 assert.equal(a.lineOfSight(u,hiddenPoint),false);
});

test('pinks e Oracle detectam normalmente sem obstáculo',()=>{
 const a=make(),p={x:.5,y:.5},q={x:.502,y:.502};
 const pink=mkWard('pink','blue','control',p),own=mkWard('allied','blue','stealth',q),enemy=mkWard('hidden','red','stealth',q);
 a.wards=[pink,own,enemy];assert.equal(a.lineOfSight(p,q),true);
 assert.equal(a.wardKnownTo('blue',enemy),true);
 a.wards=[own,enemy];const u=a.units.find(u=>u.team==='blue');u.x=p.x;u.y=p.y;u.oracleUntil=a.gameTime+20;
 assert.equal(a.wardKnownTo('blue',enemy),true);
});

test('perspectiva deriva visão uma vez e mantém semântica da chamada individual',()=>{
 const a=make(),blue=a.units.find(x=>x.team==='blue');a.wards.push(mkWard('blue_extra','blue','stealth',{x:blue.x,y:blue.y}));
 const visibleBefore=a.units.filter(u=>u.team==='blue'||(u.hp>0&&a.visible('blue',u))).map(x=>x.id);
 let count=0;const original=a.visionSources.bind(a);a.visionSources=team=>{count++;return original(team)};
 const result=a.perspective('blue');assert.equal(count,1,'visão deve ser montada apenas uma vez');
 assert.deepEqual(result.units.map(u=>u.id),visibleBefore);
});

test('detecção na perspectiva não expõe campos internos de wards inimigas',()=>{
 const a=make(),p={x:.5,y:.5},enemy={...mkWard('enemy_control','red','control',p),owner:'red_JG',faelightUntil:999,hiddenOrder:'private',createdAt:712};
 a.wards=[enemy];const scout=a.units.find(u=>u.team==='blue');scout.x=p.x;scout.y=p.y;const result=a.perspective('blue').wards.find(w=>w.id===enemy.id);
 assert.ok(result,'pink visível deve continuar aparecendo');
 assert.deepEqual(Object.keys(result).sort(),['id','team','type','x','y','hp','maxHp'].sort());
 assert.equal(result.owner,undefined);assert.equal(result.hiddenOrder,undefined);
});

test('nova perspectiva usa estado atual após inclusão e remoção de wards no mesmo tick',()=>{
 const a=make(),p={x:.5,y:.5},own=mkWard('own','blue','stealth',p),pink=mkWard('pink','red','control',p);
 a.wards=[own];assert.ok(a.perspective('blue').wards.some(w=>w.id==='own'));
 a.wards.push(pink);assert.equal(a.visionSources('blue').some(s=>s.kind==='ward'&&s.x===p.x),false);
 pink.hp=0;assert.equal(a.visionSources('blue').some(s=>s.kind==='ward'&&s.x===p.x),true);
 assert.equal(a.perspective('blue').wards.some(w=>w.id==='own'),true);
});

test('snapshot mantém a não detecção atrás da parede',()=>{
 const a=make();a.wards=[mkWard('probe','blue','stealth',hiddenPoint),mkWard('blue_pink','blue','control',wallPoint),mkWard('hidden','red','stealth',hiddenPoint)];
 const restored=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(restored.wardKnownTo('blue',restored.wards[2]),false);
 assert.equal(restored.perspective('blue').wards.some(w=>w.id==='hidden'),false);
});

test('seis variantes preservam privacidade dos IDs inimigos e fog da equipe',()=>{
 for(const type of ['infernal','mountain','ocean','cloud','hextech','chemtech']){
  const a=make(2800);a.activateRiftV452d4(type);
  const far={x:.93,y:.07},enemy=mkWard('red_secret','red','stealth',far);enemy.customEnemyPlan='secret';a.wards=[enemy];
  const v=a.perspective('blue');assert.equal(v.wards.some(w=>w.id===enemy.id),false,type);
  assert.deepEqual(a.validateInvariants(),[],type);
 }
});
console.log(`V4.5.2d-4-dev27 ${passed}/8 PASS`);
