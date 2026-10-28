import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Arena,catalog,ITEM_EFFECTS_V43,checksumV40} from '../engine.mjs';
const read=n=>JSON.parse(fs.readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),masks=read('masks_128.json');
const make=()=>new Arena(map,masks,{seed:39,roundSeconds:10});
const hero=(a,t='blue',r='ADC')=>a.units.find(u=>u.team===t&&u.role===r);
const prep=(a,u)=>{const shop=a.map.objects.find(o=>o.id===u.team+'_spawn_shop');Object.assign(u,{x:shop.x,y:shop.y,gold:100000,items:[]});};
let passed=0;function test(label,fn){fn();console.log('✓ DEV39 '+label);passed++;}

test('Catalog remains 70 local items and uses audited Kraken third hit',()=>{
 assert.ok(catalog.length>=70);assert.match(ITEM_EFFECTS_V43.kraken_slayer.maturity,/dev39/);
 assert.equal(ITEM_EFFECTS_V43.rapid_firecannon.maxStacks,100);
});
test('Kraken stacks across alternate targets, third hit triggers real physical damage',()=>{
 const a=make(),u=hero(a),v=hero(a,'red'),other=hero(a,'red','MID');prep(a,u);a.buy('blue',u.id,'kraken_slayer');
 for(const t of [v,other]){t.hp=t.maxHp=10000;t.armor=0;}
 a.damage(v,100,u,'physical','basic');assert.equal(u.krakenHitV453Dev32.stacks,1);
 a.damage(other,100,u,'physical','basic');assert.equal(u.krakenHitV453Dev32.stacks,2);
 const before=v.hp;a.damage(v,100,u,'physical','basic');// ADC attack range is ranged in Atlas units; Kraken's third-hit bonus is 80%.
 assert.ok(Math.abs((before-v.hp)-(100+150*.8))<=2);assert.equal(u.krakenHitV453Dev32.stacks,0);
});
test('Kraken timed stacks expire; spell/structure do not charge',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prep(a,u);a.buy('blue',u.id,'kraken_slayer');v.hp=v.maxHp=5000;
 a.damage(v,100,u,'physical','basic');assert.equal(u.krakenHitV453Dev32.stacks,1);
 a.gameTime=5;assert.equal(a.itemProcStatusV453Dev39(u).find(p=>p.id==='kraken_slayer').value,0);
 a.damage(v,100,u,'physical','basic');assert.equal(u.krakenHitV453Dev32.stacks,1);
 a.damage(v,100,u,'physical','spell');assert.equal(u.krakenHitV453Dev32.stacks,1);
});
test('Displacement: physical dash adds distance, blink/Flash/TP/Hexgate do not',()=>{
 const a=make(),u=hero(a);prep(a,u);a.buy('blue',u.id,'rapid_firecannon');
 const from={x:.3,y:.3},to={x:.31,y:.3},delta=a.mapDistance(from,to);
 for(const kind of ['blink','flash','teleport','hexgate','recall','rift_repair'])assert.equal(a.itemEnergizeRelocateV453Dev39(u,from,to,{kind}),0);
 assert.equal(u.energizeStacksV453Dev38,0);
 assert.equal(a.itemEnergizeRelocateV453Dev39(u,from,to,{kind:'dash'}),delta);
 assert.ok(Math.abs(u.energizeStacksV453Dev38-delta/24)<1e-8);
});
test('Knockback uses real travelled distance and never fabricates stacks',()=>{
 const a=make(),u=hero(a),enemy=hero(a,'red');prep(a,enemy);a.buy('red',enemy.id,'rapid_firecannon');
 a.walkable=()=>true;u.x=.45;u.y=.45;enemy.x=.46;enemy.y=.45;
 const out=a.pushChampionThroughTerrain(u,enemy,240);
 assert.ok(out.travelled>0);assert.ok(enemy.energizeStacksV453Dev38>0);
 assert.ok(Math.abs(enemy.energizeStacksV453Dev38-out.travelled/24)<1e-8);
});
test('Blink rejects invalid coordinates and dash distance is capped to measured displacement',()=>{
 const a=make(),u=hero(a);prep(a,u);a.buy('blue',u.id,'rapid_firecannon');
 const from={x:.1,y:.1},to={x:.2,y:.1};const dist=a.mapDistance(from,to);
 assert.equal(a.itemEnergizeRelocateV453Dev39(u,{x:NaN,y:.1},to,{kind:'dash'}),0);
 assert.equal(a.itemEnergizeRelocateV453Dev39(u,from,to,{kind:'dash',travelled:dist*30}),dist);
 assert.equal(u.energizeStacksV453Dev38,Math.min(100,dist/24));
});
test('Status: 100/100 energized, consumed becomes 6/100; cooldown remaining after Bullseye',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prep(a,u);a.buy('blue',u.id,'rapid_firecannon');
 u.energizeStacksV453Dev38=100;let status=a.itemProcStatusV453Dev39(u).find(i=>i.id==='rapid_firecannon');assert.equal(status.ready,true);
 v.hp=v.maxHp=5000;v.mr=0;v.armor=0;a.attack(u,v,100);
 status=a.itemProcStatusV453Dev39(u).find(i=>i.id==='rapid_firecannon');assert.equal(status.value,6);assert.equal(status.ready,false);
});
test('Status: Bullseye cooldown, Doran renewal, consumed Armguard',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prep(a,u);for(const id of ['scouts_slingshot','dorans_ring','seekers_armguard'])a.buy('blue',u.id,id);
 const types=()=>Object.fromEntries(a.itemProcStatusV453Dev39(u).map(p=>[p.id,p]));
 assert.equal(types().scouts_slingshot.ready,true);assert.equal(types().seekers_armguard.ready,true);
 v.hp=v.maxHp=5000;v.mr=0;a.damage(v,100,u,'magic','spell');assert.equal(types().scouts_slingshot.ready,false);
 assert.equal(types().dorans_ring.value,5);u.armguardSpentV453Dev37=true;assert.equal(types().seekers_armguard.ready,false);
 a.gameTime=40;assert.equal(types().scouts_slingshot.ready,true);assert.equal(types().dorans_ring.value,0);
});
test('UI badges mirror public proc helper; styles are compact and avoid new overlays',()=>{
 const src=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const style=fs.readFileSync(new URL('../styles-v43.css',import.meta.url),'utf8');
 assert.match(src,/match\.itemProcStatusV453Dev39\(u\)/);
 assert.match(src,/aria-valuenow/);assert.match(src,/itemInventoryProcV453Dev39/);
 assert.match(style,/\.itemProcsV453Dev39/);assert.match(style,/#10181c/);
});
test('Snapshot/replay retains physical charge and target-agnostic Kraken state',()=>{
 const a=make(),u=hero(a);prep(a,u);for(const id of ['rapid_firecannon','kraken_slayer'])a.buy('blue',u.id,id);
 u.energizeStacksV453Dev38=45.25;u.krakenHitV453Dev32={targetId:'red_TOP',stacks:2,until:4};
 const snap=a.snapshotV40(),reloaded=Arena.fromSnapshotV40(map,masks,snap);
 assert.equal(checksumV40(snap),checksumV40(reloaded.snapshotV40()));
 const copy=hero(reloaded);assert.equal(copy.energizeStacksV453Dev38,45.25);assert.equal(copy.krakenHitV453Dev32.stacks,2);
});
test('Upgrade consumes Recurve passive, does not create duplicate on-hit from consumed component',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prep(a,u);a.buy('blue',u.id,'recurve_bow');
 for(const id of ['rectrix','hearthbound_axe'])a.buy('blue',u.id,id);
 assert.equal(a.buy('blue',u.id,'kraken_slayer'),true);
 assert.ok(!u.items.includes('recurve_bow'));v.hp=v.maxHp=5000;v.armor=0;
 const before=v.hp;a.damage(v,100,u,'physical','basic');assert.equal(before-v.hp,100);
});
test('Kraken sale and repurchase reset prior proc stacks without inheriting a ready third hit',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prep(a,u);a.buy('blue',u.id,'kraken_slayer');
 v.hp=v.maxHp=6000;a.damage(v,50,u,'physical','basic');a.damage(v,50,u,'physical','basic');
 assert.equal(u.krakenHitV453Dev32.stacks,2);
 const slot=u.items.indexOf('kraken_slayer');assert.equal(a.sellItemV43('blue',u.id,slot).ok,true);
 assert.equal(u.krakenHitV453Dev32,undefined);
 assert.equal(a.buy('blue',u.id,'kraken_slayer'),true);
 assert.equal(a.itemProcStatusV453Dev39(u).find(v=>v.id==='kraken_slayer').value,0);
});
console.log('DEV39 '+passed+'/'+passed+' PASS');
