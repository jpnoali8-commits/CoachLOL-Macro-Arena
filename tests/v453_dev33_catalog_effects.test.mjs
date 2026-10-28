import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {Arena,catalog,ITEM_RECIPES,ITEM_EFFECTS_V43,recipePurchasePartsV453Dev30,checksumV40} from '../engine.mjs';
const data=(name)=>JSON.parse(fs.readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const make=()=>new Arena(data('coachlol_map_v6.json'),data('masks_128.json'),{seed:33,roundSeconds:10});
const hero=(a,team='blue',role='MID')=>a.units.find(u=>u.id===`${team}_${role}`);
function prepare(a,u){const p=a.map.objects.find(x=>x.id===u.team+'_spawn_shop');Object.assign(u,{x:p.x,y:p.y,gold:90000,items:[]});}
const t=[];function test(name,fn){fn();t.push(name);console.log('✓ DEV33 '+name)};
test('five audited entries: metadata, prices, finished recipes, no orphan references',()=>{
 const items={fiendish_codex:850,nashors_tooth:2900,mortal_reminder:3000,morellonomicon:2850,rylais_crystal_scepter:2600};
 for(const [id,cost] of Object.entries(items)){assert.equal(catalog.find(x=>x.id===id)?.cost,cost);assert.ok(ITEM_EFFECTS_V43[id]||id==='fiendish_codex');}
 for(const [id,recipe] of Object.entries(ITEM_RECIPES))for(const part of recipe)assert.ok(catalog.some(x=>x.id===part),`${id} -> ${part}`);
 assert.deepEqual(ITEM_RECIPES.nashors_tooth,['recurve_bow','blasting_wand','fiendish_codex']);
});
test('fiendish codex -> nashor via direct recipe, nested purchases discount once',()=>{
 const a=make(),u=hero(a);prepare(a,u);
 for(const id of ['amp_tome','glowing_mote','recurve_bow','blasting_wand'])assert.equal(a.buy('blue',u.id,id),true,id);
 assert.equal(a.itemPurchaseCost(u,'fiendish_codex'),200);
 assert.equal(a.buy('blue',u.id,'fiendish_codex'),true);
 assert.equal(a.itemPurchaseCost(u,'nashors_tooth'),500);
 assert.deepEqual(recipePurchasePartsV453Dev30('nashors_tooth',u.items).sort(),['blasting_wand','fiendish_codex','recurve_bow'].sort());
 assert.equal(a.buy('blue',u.id,'nashors_tooth'),true);assert.deepEqual(u.items,['nashors_tooth']);
});
test('Mortal Reminder: assembly, antiheal, and single fatality tag',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prepare(a,u);for(const id of ['executioners_calling','last_whisper','agility_cloak'])assert.equal(a.buy('blue',u.id,id),true);
 assert.equal(a.itemPurchaseCost(u,'mortal_reminder'),150);
 assert.equal(a.buy('blue',u.id,'mortal_reminder'),true);
 a.damage(v,55,u,'physical','spell');assert.equal(a.effectResolverV41().has(v,'grievous_wounds'),true);
 assert.ok(u.armorPenPercent>=30);
});
test('Morellonomicon cuts healing from enemy magic damage; no trigger on allied damage',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prepare(a,u);assert.equal(a.buy('blue',u.id,'morellonomicon'),true);
 a.damage(v,35,u,'magic','spell');assert.equal(a.effectResolverV41().has(v,'grievous_wounds'),true);
 const before=v.hp,healed=a.effectResolverV41().heal(v,100,v);assert.ok(healed<=60.0001);assert.ok(v.hp>=before);
});
test('Rylai: magic/physical ability damage applies 30% slow for one second, not basics',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prepare(a,u);assert.equal(a.buy('blue',u.id,'rylais_crystal_scepter'),true);
 a.damage(v,100,u,'magic','basic');assert.equal(a.effectResolverV41().has(v,'slow'),false);
 a.damage(v,100,u,'magic','spell');assert.equal(a.effectResolverV41().has(v,'slow'),true);
 assert.equal(a.effectResolverV41().slowFraction(v),.30);a.gameTime+=1.01;
 assert.equal(a.effectResolverV41().slowFraction(v),0);
});
test('Nashor: basic on-hit magical damage only once, no tower or spell proc',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prepare(a,u);v.hp=v.maxHp=10000;
 const orig=v.hp;a.damage(v,70,u,'physical','basic');const base=orig-v.hp;
 assert.equal(a.buy('blue',u.id,'nashors_tooth'),true);v.hp=v.maxHp=10000;a.damage(v,70,u,'physical','basic');
 assert.ok(10000-v.hp>base+10,`${10000-v.hp} vs ${base}`);
 v.hp=v.maxHp=10000;const spellDealt=a.damage(v,70,u,'physical','spell');assert.ok(spellDealt<100,`unexpected Nashor proc: ${spellDealt}`);
});
test('six-slot full inventory can upgrade when components are consumed',()=>{
 const a=make(),u=hero(a);prepare(a,u);u.items=['oblivion_orb','blasting_wand','kindlegem','boots','ward','dagger'];u.gold=10000;
 assert.equal(a.canBuy('blue',u.id,'morellonomicon').ok,true);assert.equal(a.buy('blue',u.id,'morellonomicon'),true);assert.equal(u.items.length,4);
});
test('snapshot restores Rylai CC and new item inventory deterministically',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prepare(a,u);a.buy('blue',u.id,'rylais_crystal_scepter');a.damage(v,40,u,'magic','spell');
 const x=a.snapshotV40(),b=Arena.fromSnapshotV40(data('coachlol_map_v6.json'),data('masks_128.json'),x);
 assert.equal(checksumV40(x),checksumV40(b.snapshotV40()));assert.equal(b.effectResolverV41().has(hero(b,'red'),'slow'),true);
});
test('authentic Data Dragon import rejects partial fixture without mutating engine',()=>{
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'coach-dev33-'));
 try{const file=path.join(d,'item.json'),source=fs.readFileSync(new URL('../engine.mjs',import.meta.url),'utf8');
  fs.writeFileSync(file,JSON.stringify({version:'16.21.1',data:{3108:{name:'Fiendish Codex',maps:{11:true},gold:{total:850,purchasable:true},from:['1052','2022'],stats:{FlatMagicDamageMod:25}}}}));
  assert.throws(()=>execFileSync('node',['tools/import_full_shop_v453_dev30.mjs','--input',file,'--apply'],{cwd:new URL('..',import.meta.url).pathname,stdio:'pipe'}));
  assert.equal(fs.readFileSync(new URL('../engine.mjs',import.meta.url),'utf8'),source);
 }finally{fs.rmSync(d,{recursive:true,force:true});}
});
console.log(`DEV33 ${t.length}/${t.length} PASS`);
