import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Arena,catalog,ITEM_EFFECTS_V43,checksumV40} from '../engine.mjs';
const read=n=>JSON.parse(fs.readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),masks=read('masks_128.json');
const make=()=>new Arena(map,masks,{seed:40,roundSeconds:10});
const hero=(a,t='blue',r='ADC')=>a.units.find(u=>u.team===t&&u.role===r);
const prep=(a,u)=>{const shop=a.map.objects.find(o=>o.id===u.team+'_spawn_shop');Object.assign(u,{x:shop.x,y:shop.y,gold:100000,items:[]});};
function setup(...items){const a=make(),u=hero(a),v=hero(a,'red');prep(a,u);for(const id of items)assert.equal(a.buy(u.team,u.id,id),true,'could not purchase '+id);v.hp=v.maxHp=5000;v.shield=0;v.armor=0;v.mr=0;return {a,u,v};}
let passed=0;function test(label,fn){fn();console.log('✓ DEV40 '+label);passed++;}

test('70-item catalog and versioned item effects retained',()=>{
 assert.ok(catalog.length>=70);for(const id of ['recurve_bow','nashors_tooth','kraken_slayer','rapid_firecannon'])assert.match(ITEM_EFFECTS_V43[id].maturity,/dev40/);
});
test('Fully absorbed basic still applies Recurve to remaining ordinary shield',()=>{
 const {a,u,v}=setup('recurve_bow');v.shield=500;
 const before=v.hp;a.attack(u,v,100);assert.equal(v.hp,before);assert.equal(v.shield,385);
});
test('Magic Nashor on-hit consumes typed magic shield after physical basic',()=>{
 const {a,u,v}=setup('nashors_tooth');v.shield=150;
 a.applyEffectV41(v,'magic_shield',{source:v,duration:10,power:40});
 a.attack(u,v,100);assert.equal(v.hp,5000);assert.equal(v.shield,50);
 const layer=a.effectResolverV41().list(v).find(e=>e.type==='magic_shield');assert.ok(layer);assert.equal(layer.power,40-(15+.15*Math.max(0,u.ap||0)));
});
test('Kraken charges across shielded basics and spends third hit on actual shield',()=>{
 const {a,u,v}=setup('kraken_slayer');v.shield=1000;
 for(let k=1;k<=2;k++){a.attack(u,v,100);assert.equal(u.krakenHitV453Dev32.stacks,k);}
 const before=v.shield;a.attack(u,v,100);assert.equal(u.krakenHitV453Dev32.stacks,0);
 assert.ok(before-v.shield>100);assert.equal(v.hp,5000);
});
test('Ordinary spells remain non-on-hit and cannot increment Kraken stacks',()=>{
 const {a,u,v}=setup('kraken_slayer');v.shield=1000;
 a.attack(u,v,100,'skill');assert.equal(u.krakenHitV453Dev32,undefined);
 a.damage(v,100,u,'physical','spell');assert.equal(u.krakenHitV453Dev32,undefined);
});
test('Explicit opted-in physical ability triggers item on-hit, not regular spell',()=>{
 const {a,u,v}=setup('recurve_bow');v.hp=5000;v.shield=0;
 a.attack(u,v,100,'skill_on_hit');assert.equal(v.hp,4885);
 a.attack(u,v,100,'skill');assert.equal(v.hp,4785);
});
test('Explicit magic ability triggers physical Recurve without basic RFC charge',()=>{
 const {a,u,v}=setup('recurve_bow','rapid_firecannon');v.shield=400;
 a.attack(u,v,100,'skill_on_hit_magic');assert.equal(v.hp,5000);assert.equal(v.shield,285);
 assert.equal(u.energizeStacksV453Dev38,0);
});
test('Spell shield rejects opted-in hit and every attached item proc',()=>{
 const {a,u,v}=setup('kraken_slayer','recurve_bow');
 a.applyEffectV41(v,'spell_shield',{source:v,duration:10,power:1});
 const before=v.hp;a.attack(u,v,100,'skill_on_hit');assert.equal(v.hp,before);
 assert.equal(u.krakenHitV453Dev32,undefined);assert.ok(!a.effectResolverV41().has(v,'spell_shield'));
});
test('Invulnerability and stasis block on-hit and do not charge energized shot',()=>{
 const {a,u,v}=setup('rapid_firecannon','kraken_slayer');u.energizeStacksV453Dev38=100;
 v.stasisUntil=10;a.attack(u,v,200);assert.equal(u.energizeStacksV453Dev38,100);
 assert.equal(u.krakenHitV453Dev32,undefined);v.stasisUntil=0;
 a.applyEffectV41(v,'invulnerable',{source:v,duration:10});a.attack(u,v,200);
 assert.equal(u.energizeStacksV453Dev38,100);assert.equal(u.krakenHitV453Dev32,undefined);
});
test('Blind prevents basic hit from generating or consuming Energized charges',()=>{
 const {a,u,v}=setup('rapid_firecannon');u.energizeStacksV453Dev38=100;
 a.applyEffectV41(u,'blind',{source:v,duration:10});a.attack(u,v,200);
 assert.equal(v.hp,5000);assert.equal(u.energizeStacksV453Dev38,100);
});
test('Fully shielded energized shot spends 100 stacks and deals 40 to shield',()=>{
 const {a,u,v}=setup('rapid_firecannon');v.shield=250;u.energizeStacksV453Dev38=100;
 a.attack(u,v,100);assert.equal(v.hp,5000);assert.equal(v.shield,110);
 assert.equal(u.energizeStacksV453Dev38,6);
});
test('Lethal primary hit consumes charged shot but does not hit corpse twice',()=>{
 const {a,u,v}=setup('rapid_firecannon');v.hp=50;u.energizeStacksV453Dev38=100;
 a.attack(u,v,100);assert.equal(v.hp,0);assert.equal(u.energizeStacksV453Dev38,6);
 assert.equal(u.kills,1);assert.equal(v.deaths,1);
});
test('Item finishing shielded target awards only one takedown',()=>{
 const {a,u,v}=setup('recurve_bow');v.hp=10;v.shield=100;
 a.attack(u,v,100);assert.equal(v.hp,0);assert.equal(v.shield,0);
 assert.equal(u.kills,1);assert.equal(v.deaths,1);
});
test('Navori refund is basic-only even when ability explicitly applies on-hit',()=>{
 const {a,u,v}=setup('navori_flickerblade');u.skillCds={Q:20,W:30,E:40,R:60};
 a.attack(u,v,100,'skill_on_hit');assert.deepEqual([u.skillCds.Q,u.skillCds.W],[20,30]);
 a.attack(u,v,100);assert.ok(u.skillCds.Q<20);
});
test('Snapshot remains deterministic with shielded Kraken and charged RFC',()=>{
 const {a,u,v}=setup('kraken_slayer','rapid_firecannon');v.shield=1000;
 a.attack(u,v,100);u.energizeStacksV453Dev38=94;
 const snap=a.snapshotV40(),b=Arena.fromSnapshotV40(map,masks,snap);
 assert.equal(checksumV40(snap),checksumV40(b.snapshotV40()));
 assert.equal(hero(b).krakenHitV453Dev32.stacks,1);assert.equal(hero(b).energizeStacksV453Dev38,94);
 assert.equal(hero(b,'red').shield,v.shield);
});
test('Browser engine contains exact new combat resolver and opt-in tags',()=>{
 const esm=fs.readFileSync(new URL('../engine.mjs',import.meta.url),'utf8');
 const browser=fs.readFileSync(new URL('../engine.browser.js',import.meta.url),'utf8');
 for(const marker of ['landedOnHitV453Dev40','ability_onhit_v453_dev40','const energized=basic&&landed']){
  assert.ok(esm.includes(marker));assert.ok(browser.includes(marker));
 }
});
console.log('DEV40 '+passed+'/'+passed+' PASS');
