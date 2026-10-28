import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {Arena,catalog,ITEM_RECIPES,ITEM_EFFECTS_V43,recipeTreeV453Dev30,recipePurchasePartsV453Dev30,checksumV40} from '../engine.mjs';
const fixture=f=>JSON.parse(fs.readFileSync(new URL('../data/'+f,import.meta.url),'utf8'));
const make=()=>new Arena(fixture('coachlol_map_v6.json'),fixture('masks_128.json'),{seed:32,roundSeconds:10});
const hero=(a,t='blue',role='ADC')=>a.units.find(u=>u.id===t+'_'+role);
const prep=(a,u)=>{const sp=a.map.objects.find(o=>o.id===u.team+'_spawn_shop');u.x=sp.x;u.y=sp.y;u.gold=60000;u.items=[];};
const buy=(a,u,id)=>assert.equal(a.buy(u.team,u.id,id),true,`Falha compra ${id}`);
let count=0;const t=(label,fn)=>{fn();count++;console.log('✓ DEV32 '+label);};
t('seis novos itens SR auditados e correção de quatro componentes antigos',()=>{
 for(const [id,gold] of Object.entries({zeal:1200,kraken_slayer:3000,rapid_firecannon:2650,navori_flickerblade:2650,health_potion:50,refillable_potion:150}))assert.equal(catalog.find(i=>i.id===id)?.cost,gold);
 assert.equal(catalog.find(i=>i.id==='recurve_bow').stats.attackSpeedPct,15);
 assert.equal(catalog.find(i=>i.id==='agility_cloak').stats.critChance,15);
 assert.equal(catalog.find(i=>i.id==='bf_sword').stats.ad,40);
 assert.equal(catalog.find(i=>i.id==='sapphire_crystal').stats.mana,300);
});
t('árvore Zelo → Navori e Kraken mantém componentes repetidos e intermediários',()=>{
 assert.deepEqual(ITEM_RECIPES.zeal,['agility_cloak','dagger']);
 assert.deepEqual(ITEM_RECIPES.kraken_slayer,['rectrix','hearthbound_axe','recurve_bow']);
 assert.deepEqual(ITEM_RECIPES.navori_flickerblade,['zeal','dagger','dagger']);
 assert.equal(recipeTreeV453Dev30('navori_flickerblade').components.length,3);
});
t('comprar Kraken via componentes desconta intermediários com inventário controlado',()=>{
 const a=make(),u=hero(a);prep(a,u);buy(a,u,'rectrix');buy(a,u,'hearthbound_axe');buy(a,u,'recurve_bow');
 assert.equal(a.itemPurchaseCost(u,'kraken_slayer'),325);
 buy(a,u,'kraken_slayer');assert.deepEqual(u.items,['kraken_slayer']);
});
t('dois componentes Zelo + duplicados Navori são consumidos sem desconto repetido',()=>{
 const a=make(),u=hero(a);prep(a,u);buy(a,u,'zeal');buy(a,u,'dagger');buy(a,u,'dagger');
 assert.deepEqual(recipePurchasePartsV453Dev30('navori_flickerblade',u.items),['zeal','dagger','dagger']);
 assert.equal(a.itemPurchaseCost(u,'navori_flickerblade'),950);
 buy(a,u,'navori_flickerblade');assert.deepEqual(u.items,['navori_flickerblade']);
});
t('Kraken: primeiro e segundo ataques acumulam, terceiro aplica bônus sem recursão',()=>{
 const a=make(),atk=hero(a),def=hero(a,'red');prep(a,atk);buy(a,atk,'kraken_slayer');def.maxHp=9000;def.hp=9000;
 const x=def.hp;a.damage(def,100,atk,'physical','basic');const hit1=x-def.hp;
 const y=def.hp;a.damage(def,100,atk,'physical','basic');const hit2=y-def.hp;
 const z=def.hp;a.damage(def,100,atk,'physical','basic');const hit3=z-def.hp;
 assert.ok(hit1>0&&hit2>0);assert.equal(hit1,hit2);
 assert.ok(hit3>hit2+80,`${hit3} vs ${hit2}`);
 assert.equal(atk.krakenHitV453Dev32.stacks,0);
});
t('Kraken não causa efeito extra em torre, nem ataque não básico',()=>{
 const a=make(),atk=hero(a),def=hero(a,'red');prep(a,atk);buy(a,atk,'kraken_slayer');
 a.damage(def,100,atk,'physical','spell');assert.equal(atk.krakenHitV453Dev32,undefined);
 const tower=a.structures.find(x=>x.type==='tower'&&x.team==='red');
 a.damage(tower,100,atk,'physical','basic');assert.equal(atk.krakenHitV453Dev32,undefined);
});
t('Navori diminui Q/W/E de 15% apenas em ataque básico que atingiu alvo',()=>{
 const a=make(),atk=hero(a),def=hero(a,'red');prep(a,atk);buy(a,atk,'navori_flickerblade');
 atk.skillCds={Q:100,W:110,E:120,R:130};a.damage(def,40,atk,'physical','basic');
 assert.equal(atk.skillCds.Q,85);assert.equal(atk.skillCds.W,93.5);assert.equal(atk.skillCds.E,102);
 assert.equal(atk.skillCds.R,130);
});
t('Arco Recurvo adiciona 15 dano físico on-hit sem duplicação',()=>{
 const a=make(),atk=hero(a),def=hero(a,'red');def.hp=def.maxHp=8000;prep(a,atk);
 const initial=def.hp;a.damage(def,70,atk,'physical','basic');const before=initial-def.hp;
 buy(a,atk,'recurve_bow');def.hp=initial;a.damage(def,70,atk,'physical','basic');
 assert.ok(initial-def.hp>before);
});
t('poção consumível cura por 15 ticks, gasta cópia e não cura morto',()=>{
 const a=make(),u=hero(a);prep(a,u);buy(a,u,'health_potion');u.x=10000;u.y=8000;u.hp=u.maxHp-200;
 const start=u.hp;assert.equal(a.usePotionV453Dev32('blue',u.id,'health_potion').ok,true);
 assert.equal(u.items.includes('health_potion'),false);
 a.gameTime=15;a.advancePotionHealingV453Dev32();assert.equal(Math.round(u.hp-start),120);
 assert.equal(u.potionHealingV453Dev32,null);
});
t('refil: duas cargas, cura 100/12s, restaura ao voltar à fonte',()=>{
 const a=make(),u=hero(a);prep(a,u);buy(a,u,'refillable_potion');u.x=10000;u.y=8000;u.hp=u.maxHp-300;
 const r=a.usePotionV453Dev32('blue',u.id,'refillable_potion');assert.equal(r.ok,true);assert.equal(r.charges,1);
 assert.equal(a.usePotionV453Dev32('blue',u.id,'refillable_potion').ok,false);
 a.gameTime=12;a.advancePotionHealingV453Dev32();assert.equal(Math.round(u.maxHp-u.hp),200);
 assert.equal(a.usePotionV453Dev32('blue',u.id,'refillable_potion').ok,true);
 a.gameTime=24;a.advancePotionHealingV453Dev32();assert.equal(a.usePotionV453Dev32('blue',u.id,'refillable_potion').ok,false);
 const sp=a.map.objects.find(o=>o.id==='blue_spawn_shop');u.x=sp.x;u.y=sp.y;
 a.advancePotionHealingV453Dev32();assert.equal(u.refillableChargesV453Dev32,2);
});
t('impossível misturar tipos de poção e cinco poções comuns é o limite',()=>{
 const a=make(),u=hero(a);prep(a,u);buy(a,u,'health_potion');assert.equal(a.canBuy('blue',u.id,'refillable_potion').ok,false);
 for(let j=1;j<5;j++)buy(a,u,'health_potion');assert.equal(a.canBuy('blue',u.id,'health_potion').ok,false);
});
t('snapshot conserva cargas, intervalo e atributos; navegador expõe métodos',()=>{
 const a=make(),u=hero(a);prep(a,u);buy(a,u,'refillable_potion');u.hp=u.maxHp-300;u.x=9000;u.y=8000;
 assert.equal(a.usePotionV453Dev32('blue',u.id,'refillable_potion').ok,true);
 const snap=a.snapshotV40(),b=Arena.fromSnapshotV40(fixture('coachlol_map_v6.json'),fixture('masks_128.json'),snap);
 assert.equal(checksumV40(snap),checksumV40(b.snapshotV40()));
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../engine.browser.js',import.meta.url),'utf8'),ctx,{timeout:5000});
 assert.equal(typeof ctx.window.CoachArena.Arena.prototype.usePotionV453Dev32,'function');
 assert.ok(fs.readFileSync(new URL('../app.js',import.meta.url),'utf8').includes('potionActiveV453Dev32'));
});
t('venda de consumíveis usa reembolso próprio do patch',()=>{
 const a=make(),u=hero(a);prep(a,u);buy(a,u,'health_potion');
 assert.equal(a.sellItemV43('blue',u.id,u.items.indexOf('health_potion')).refund,20);
 buy(a,u,'refillable_potion');
 assert.equal(a.sellItemV43('blue',u.id,u.items.indexOf('refillable_potion')).refund,60);
});
t('importador bloqueia aplicação de catálogo amostral sem editar motor',()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'coach-dev32-dd-'));
 try{
  const fixture=path.join(folder,'item.json'),source=fs.readFileSync(new URL('../engine.mjs',import.meta.url),'utf8');
  fs.writeFileSync(fixture,JSON.stringify({version:'16.21.1',data:{9999:{name:'Sample',gold:{total:100,purchasable:true},maps:{'11':true},stats:{}}}}));
  assert.throws(()=>execFileSync('node',['tools/import_full_shop_v453_dev30.mjs','--input',fixture,'--apply'],{cwd:new URL('..',import.meta.url).pathname,stdio:'pipe'}),/Command failed/);
  assert.equal(fs.readFileSync(new URL('../engine.mjs',import.meta.url),'utf8'),source);
 }finally{fs.rmSync(folder,{recursive:true,force:true});}
});
console.log('DEV32 '+count+'/'+count+' PASS');
