import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena, WARD_RULES_2026} from '../engine.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),user=read('rift_user_manifest_v452d4.json');
map.riftBundlesV452d4=user.variants;map.riftBaseFeaturesV452d4=user.baseFeatures;
const make=()=>new Arena(map,mask,{seed:2626,roundSeconds:10,mode:'bot'});
const ward=(id,team,type,pt,extra={})=>({id,owner:team+'_TOP',team,type,x:pt.x,y:pt.y,hp:type==='control'?4:3,maxHp:type==='control'?4:3,createdAt:0,until:null,disabledUntil:0,...extra});
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('✓ DEV26 '+name);};
const center={x:.5,y:.5};

test('pinks de equipes opostas não desativam visão uma da outra',()=>{
 const a=make();a.wards=[ward('pink_blue','blue','control',center),ward('pink_red','red','control',center)];
 assert.equal(a.wardVisionSuppressedV452d4Dev26(a.wards[0]),false);
 assert.equal(a.wardVisionSuppressedV452d4Dev26(a.wards[1]),false);
 assert.ok(a.visionSources('blue').some(v=>v.kind==='ward'&&v.x===center.x));
 assert.ok(a.visionSources('red').some(v=>v.kind==='ward'&&v.x===center.x));
});

test('pink inimiga desativa ward comum e suporte dentro do alcance',()=>{
 const a=make(),enemy=ward('pink_red','red','control',center);
 const yellow=ward('yellow','blue','stealth',center),support=ward('support','blue','support',center);
 a.wards=[enemy,yellow,support];
 assert.ok(a.wardVisionSuppressedV452d4Dev26(yellow));
 assert.ok(a.wardVisionSuppressedV452d4Dev26(support));
 assert.equal(a.visionSources('blue').filter(s=>s.kind==='ward').length,0);
 assert.ok(a.visionSources('red').some(s=>s.kind==='ward'));
});

test('Lume Feérico suprimido não gera setor adicional nem visibilidade normal',()=>{
 const a=make(),site=a.riftAllFeaturesV452d4('faelights').find(s=>a.walkable(s.x,s.y));
 assert.ok(site);
 const own=ward('faelight_yellow','blue','stealth',site,{faelightSiteId:site.id,faelightUntil:45}),
  pink=ward('pink_red','red','control',site);
 a.wards=[own];assert.equal(a.visionSources('blue').filter(v=>v.kind==='faelight_region').length,1);
 a.wards.push(pink);
 assert.equal(a.visionSources('blue').filter(v=>['ward','faelight_region'].includes(v.kind)).length,0);
 assert.equal(a.wardVisionSuppressedV452d4Dev26(own),true);
 assert.ok(a.visionSources('red').some(v=>v.kind==='ward'));
});

test('visão volta quando pink morre; cooldown de Lume não é reiniciado',()=>{
 const a=make(),site=a.riftAllFeaturesV452d4('faelights').find(s=>a.walkable(s.x,s.y));
 const own=ward('blue_f','blue','stealth',site,{faelightSiteId:site.id,faelightUntil:45}),
  pink=ward('red_p','red','control',site);
 a.wards=[own,pink];assert.equal(a.visionSources('blue').some(v=>v.kind==='faelight_region'),false);
 pink.hp=0;
 assert.equal(a.wardVisionSuppressedV452d4Dev26(own),false);
 assert.equal(a.visionSources('blue').some(v=>v.kind==='faelight_region'),true);
 assert.equal(own.faelightUntil,45);
});

test('control ward não suprime através de parede ou moita sem visão',()=>{
 const a=make();const p={x:.94140625,y:.02734375},q={x:.89453125,y:.05078125};
 assert.ok(a.walkable(p.x,p.y)&&a.walkable(q.x,q.y));
 assert.ok(a.mapDistance(p,q)<WARD_RULES_2026.control.vision);
 assert.equal(a.lineOfSight(p,q),false);
 const pink=ward('red_p','red','control',p),yellow=ward('blue_w','blue','stealth',q);
 a.wards=[pink,yellow];assert.equal(a.wardVisionSuppressedV452d4Dev26(yellow),false);
 assert.equal(a.visionSources('blue').some(v=>v.kind==='ward'&&v.x===q.x),true);
});

test('45s encerram tanto o polígono quanto o bônus radial do Lume',()=>{
 const a=make(),site=a.riftAllFeaturesV452d4('faelights').find(s=>a.walkable(s.x,s.y));
 const own=ward('yellow','blue','stealth',site,{faelightSiteId:site.id,faelightUntil:45});a.wards=[own];
 const radius=a.wardRadius(own);
 assert.ok(Math.abs(radius-(WARD_RULES_2026.stealth.vision/a.worldWidth)*1.25)<1e-10);
 a.gameTime=44;assert.equal(a.visionSources('blue').some(v=>v.kind==='faelight_region'),true);
 a.gameTime=45;assert.equal(a.visionSources('blue').some(v=>v.kind==='faelight_region'),false);
 assert.ok(a.wardRadius(own)<radius);
 assert.equal(a.wardRadius(own),WARD_RULES_2026.stealth.vision/a.worldWidth);
});

test('snapshot preserva supressão com a mesma privacidade de visão',()=>{
 const a=make(),site=a.riftAllFeaturesV452d4('faelights').find(s=>a.walkable(s.x,s.y));
 a.wards=[ward('blue_f','blue','stealth',site,{faelightSiteId:site.id,faelightUntil:45}),ward('red_p','red','control',site)];
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(a.visionSources('blue').filter(v=>v.kind==='faelight_region').length,0);
 assert.equal(b.visionSources('blue').filter(v=>v.kind==='faelight_region').length,0);
 b.wards.find(w=>w.id==='red_p').hp=0;
 assert.equal(b.visionSources('blue').filter(v=>v.kind==='faelight_region').length,1);
 assert.equal(a.visionSources('blue').filter(v=>v.kind==='faelight_region').length,0);
});

test('visão e ocultação mantêm-se nas seis variantes elementais',()=>{
 for(const element of ['infernal','mountain','ocean','cloud','hextech','chemtech']){
  const a=make();a.activateRiftV452d4(element);
  const p={x:.5,y:.5},w=ward('blue_w','blue','stealth',p),c=ward('red_p','red','control',p);
  a.wards=[w,c];assert.equal(a.visionSources('blue').some(v=>v.kind==='ward'),false,element);
  c.hp=0;assert.equal(a.visionSources('blue').some(v=>v.kind==='ward'),true,element);
  assert.deepEqual(a.validateInvariants(),[],element);
 }
});

test('agressor antes oculto é revelado após acerto, sem vazamento permanente',()=>{
 const a=make();a.minions=[];
 for(const u of a.units){u.hp=u.maxHp;u.x=u.team==='blue'?.88:.76;u.y=u.team==='blue'?.88:.76;}
 const blue=a.units.find(u=>u.id==='blue_TOP'),red=a.units.find(u=>u.id==='red_TOP');
 const p={x:.15953125,y:.11265625},q={x:.14453125,y:.09765625};
 assert.ok(a.brushRegionAt(q.x,q.y)>0&&a.brushRegionAt(p.x,p.y)===0);
 blue.x=p.x;blue.y=p.y;red.x=q.x;red.y=q.y;
 assert.equal(a.visible('blue',red),false);
 a.damage(blue,10,red,'physical','basic');
 assert.equal(a.visible('blue',red),true);
 a.gameTime+=2;
 assert.equal(a.visible('blue',red),false);
});
console.log(`V4.5.2d-4-dev26 ${passed}/9 PASS`);
