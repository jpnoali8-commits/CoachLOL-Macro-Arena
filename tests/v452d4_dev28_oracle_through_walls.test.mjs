import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,WARD_RULES_2026} from '../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),user=load('rift_user_manifest_v452d4.json');
map.riftBundlesV452d4=user.variants;map.riftBaseFeaturesV452d4=user.baseFeatures;
const make=()=>new Arena(map,mask,{seed:2828,mode:'bot',roundSeconds:10});
const left={x:.94140625,y:.02734375},right={x:.894,y:.04};
const center={x:.5,y:.5};
const ward=(id,team,type,at,extra={})=>({id,team,owner:`${team}_TOP`,type,x:at.x,y:at.y,hp:type==='control'?4:3,maxHp:type==='control'?4:3,createdAt:0,until:null,disabledUntil:0,...extra});
const sweep=(a,p=left)=>{const u=a.units.find(u=>u.id==='blue_JG');u.x=p.x;u.y=p.y;u.hp=u.maxHp;u.deadUntil=0;u.trinket='oracle';u.oracleCd=0;return u;};
let passed=0;
function test(name,fn){fn();++passed;console.log('✓ DEV28 '+name);}

test('Oracle detecta ward por trás de parede sem criar visão normal do local',()=>{
 const a=make();a.gameTime=200;const blue=sweep(a);const w=ward('red_hidden','red','stealth',right);a.wards=[w];
 assert.equal(a.lineOfSight(left,right),false);assert.ok(a.mapDistance(left,right)<WARD_RULES_2026.oracle.radius);
 const plain=a.canSeePoint('blue',right);assert.equal(a.wardKnownTo('blue',w),false);
 const response=a.activateOracle('blue',blue.id);assert.equal(response.ok,true);
 assert.equal(a.wardKnownTo('blue',w),true);
 assert.equal(a.canSeePoint('blue',right),plain);
 assert.ok(a.perspective('blue').wards.some(x=>x.id===w.id));
});

test('Pink não detecta nem desativa ward através de parede',()=>{
 const a=make(),pink=ward('pink','blue','control',left),enemy=ward('hidden','red','stealth',right);a.wards=[pink,enemy];
 assert.equal(a.lineOfSight(pink,enemy),false);
 assert.equal(a.wardKnownTo('blue',enemy),false);
 assert.equal(a.wardVisionSuppressedV452d4Dev26(enemy),false);
});

test('Oracle suprime a ward atrás da parede, mas jamais desativa pink',()=>{
 const a=make(),u=sweep(a);u.oracleUntil=20;
 const w=ward('stealth','red','stealth',right),pink=ward('pink','red','control',right);
 a.wards=[w,pink];assert.equal(a.wardVisionSuppressedV452d4Dev26(w),true);
 assert.equal(a.wardVisionSuppressedV452d4Dev26(pink),false);
 assert.equal(a.wardKnownTo('blue',pink),true,'radar sinaliza uma pink, sem interrompê-la');
});

test('Radar fora do alcance e radar expirado não revelam ward',()=>{
 const a=make(),u=sweep(a,center),w=ward('hidden','red','stealth',right);a.wards=[w];u.oracleUntil=10;
 assert.equal(a.wardKnownTo('blue',w),false);
 u.x=left.x;u.y=left.y;assert.equal(a.wardKnownTo('blue',w),true);
 a.gameTime=10;assert.equal(a.wardKnownTo('blue',w),false);
});

test('Olho eletrônico não dá ataque através da parede, mesmo no alcance',()=>{
 const a=make(),u=sweep(a),w=ward('enemy','red','stealth',right);a.wards=[w];u.oracleUntil=10;
 u.range=0.5;const before=w.hp;
 const r=a.revealWard('blue',u.id,w.id);
 assert.equal(r.ok,false);assert.match(r.reason,/parede/i);assert.equal(w.hp,before);
 u.x=right.x;u.y=right.y;
 assert.equal(a.revealWard('blue',u.id,w.id).ok,true);
 assert.equal(w.hp,before-1);
});

test('Dois segundos de supressão persistem depois de sair do radar',()=>{
 const a=make(),u=sweep(a),w=ward('enemy','red','stealth',right);a.wards=[w];
 a.gameTime=100;u.oracleUntil=109;
 a.refreshOracleWardsV452d4Dev28();assert.equal(w.oracleSuppressedUntilV452d4Dev28,102);
 u.x=center.x;u.y=center.y;
 a.gameTime=101;assert.equal(a.wardVisionSuppressedV452d4Dev26(w),true);
 a.gameTime=102;assert.equal(a.wardVisionSuppressedV452d4Dev26(w),false);
 assert.equal(a.wardKnownTo('blue',w),false);
});

test('Lume também perde a região bônus sob supressão de Oracle e recupera depois',()=>{
 const a=make(),site=a.riftAllFeaturesV452d4('faelights').find(s=>a.walkable(s.x,s.y));assert.ok(site);
 const w=ward('lume','red','stealth',site,{faelightSiteId:site.id,faelightUntil:100});a.wards=[w];
 const u=sweep(a,site);u.oracleUntil=20;
 assert.equal(a.visionSources('red').some(s=>s.kind==='faelight_region'),false);
 a.refreshOracleWardsV452d4Dev28();u.x=center.x;u.y=center.y;
 a.gameTime=3;assert.equal(a.visionSources('red').some(s=>s.kind==='faelight_region'),true);
 assert.equal(w.faelightUntil,100);
});

test('Snapshot conserva contagem de supressão e localização do Oracle',()=>{
 const a=make(),u=sweep(a),w=ward('enemy','red','stealth',right);a.wards=[w];u.oracleUntil=100;
 a.refreshOracleWardsV452d4Dev28();
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(b.wardKnownTo('blue',b.wards[0]),true);
 assert.equal(b.wardVisionSuppressedV452d4Dev26(b.wards[0]),true);
 assert.equal(b.wards[0].oracleSuppressedUntilV452d4Dev28,w.oracleSuppressedUntilV452d4Dev28);
});

test('Seis variantes elementais: varredura radial e pinks com visão de terreno',()=>{
 for(const type of ['infernal','mountain','ocean','cloud','hextech','chemtech']){
  const a=make();a.activateRiftV452d4(type);const u=sweep(a),w=ward('enemy','red','stealth',right);a.wards=[w];u.oracleUntil=10;
  assert.equal(a.wardKnownTo('blue',w),true,type);
  assert.equal(a.wardVisionSuppressedV452d4Dev26(w),true,type);
  u.oracleUntil=0;a.wards.unshift(ward('pink','blue','control',left));
  assert.equal(a.wardKnownTo('blue',w),false,type);
  assert.equal(a.wardVisionSuppressedV452d4Dev26(w),false,type);
  assert.deepEqual(a.validateInvariants(),[],type);
 }
});

test('Radar nunca dá metadados privados da ward inimiga na perspectiva',()=>{
 const a=make(),u=sweep(a),w=ward('enemy','red','stealth',right,{hiddenAction:'secret',createdAt:999});a.wards=[w];u.oracleUntil=10;
 const shown=a.perspective('blue').wards.find(x=>x.id===w.id);assert.ok(shown);
 assert.deepEqual(Object.keys(shown).sort(),['id','team','type','x','y','hp','maxHp'].sort());
});

console.log(`V4.5.2d-4-dev28 ${passed}/10 PASS`);
