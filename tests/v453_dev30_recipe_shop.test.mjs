import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {Arena,catalog,ITEM_RECIPES,recipePurchasePartsV453Dev30,recipeTreeV453Dev30} from '../engine.mjs';
const fixture=filename=>JSON.parse(fs.readFileSync(new URL('../data/'+filename,import.meta.url),'utf8'));
const create=()=>new Arena(fixture('coachlol_map_v6.json'),fixture('masks_128.json'),{seed:30,roundSeconds:10});
const prepare=(a,team='blue',role='MID')=>{const u=a.units.find(x=>x.id===team+'_'+role),sp=a.map.objects.find(x=>x.id===team+'_spawn_shop');u.x=sp.x;u.y=sp.y;u.gold=30000;u.items=[];return u;};
const t=(title,fn)=>{fn();console.log('✓ DEV30 '+title);};
t('Rabadon possui duas unidades clicáveis do mesmo componente',()=>{
 assert.deepEqual(recipeTreeV453Dev30('rabadon'),{id:'rabadon',components:[{id:'needless_rod',components:[]},{id:'needless_rod',components:[]}]});
});
t('comprar um bastão deixa desconto exato, sem consumi-lo antes do upgrade',()=>{
 const a=create(),u=prepare(a),start=u.gold;
 assert.equal(a.buy('blue',u.id,'needless_rod'),true);
 assert.equal(u.gold,start-1200);
 assert.deepEqual(recipePurchasePartsV453Dev30('rabadon',u.items),['needless_rod']);
 assert.equal(a.itemPurchaseCost(u,'rabadon'),3500-1200);
 assert.equal(u.items.length,1);
});
t('dois bastões separados na receita abatem o custo só uma vez por cópia',()=>{
 const a=create(),u=prepare(a);
 assert.equal(a.buy('blue',u.id,'needless_rod'),true);assert.equal(a.buy('blue',u.id,'needless_rod'),true);
 assert.equal(a.itemPurchaseCost(u,'rabadon'),1100);
 assert.equal(a.buy('blue',u.id,'rabadon'),true);
 assert.deepEqual(u.items,['rabadon']);
});
t('inventário cheio permite evolução que consome item da sub-receita',()=>{
 const a=create(),u=prepare(a);
 for(let i=0;i<5;i++)assert.equal(a.buy('blue',u.id,'long_sword'),true);
 assert.equal(a.buy('blue',u.id,'glowing_mote'),true);
 assert.equal(u.items.length,6);
 // Trinity's Sheen requires Glowing Mote; buying Trinity consumes it even
 // without an already-assembled Sheen.
 assert.equal(a.itemPurchaseCost(u,'trinity_force'),3333-250-3*350);
 assert.equal(a.canBuy('blue',u.id,'trinity_force').ok,true);
 assert.equal(a.buy('blue',u.id,'trinity_force'),true);
 assert.equal(u.items.length,3);
});
t('preferir intermediário pronto, sem descontar subcomponente residual',()=>{
 assert.deepEqual(recipePurchasePartsV453Dev30('trinity_force',['glowing_mote','sheen']),['sheen']);
});
t('sem receita não há descontos fantasmas; ciclos não travam',()=>{
 assert.deepEqual(recipePurchasePartsV453Dev30('needless_rod',['needless_rod']),[]);
 assert.equal(catalog.some(x=>x.id==='rabadon'),true);
});
t('UI usa botão real de compra nos componentes e preserva a receita aberta',()=>{
 const src=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.ok(src.includes("buyBtn.onclick=()=>{"));
 assert.ok(src.includes("match.purchaseOrPlan('blue',selected.id,id)"));
 assert.ok(src.includes('shopRecipeRoot=item.id;shopSelection=item.id'));
 assert.ok(src.includes('recipeOrigin.id!==chosen.id'));
});
t('importador oficial rejeita sem versão e não altera motor no modo preview',()=>{
 const root=path.resolve(new URL('..',import.meta.url).pathname),folder=fs.mkdtempSync(path.join(os.tmpdir(),'coachlol-dev30-'));
 try{
  const source=path.join(folder,'item.json'),output=path.join(folder,'catalog.json');
  const item=(name,gold,from=[])=>({name,gold:{total:gold,purchasable:true},from,maps:{'11':true},stats:{FlatMagicDamageMod:40},tags:['Magic']});
  fs.writeFileSync(source,JSON.stringify({version:'16.21.1',data:{1058:item('Needlessly Large Rod',1200),3089:item('Rabadon',3500,['1058','1058']),9999:item('Experimental',1700,['1058'])}}));
  const before=fs.readFileSync(path.join(root,'engine.mjs'),'utf8');
  const message=execFileSync('node',['tools/import_full_shop_v453_dev30.mjs','--input',source,'--output',output],{cwd:root,encoding:'utf8'});
  const report=JSON.parse(fs.readFileSync(output));
  assert.equal(report.records,3);assert.ok(report.items.some(x=>x.riotId===9999));
  assert.deepEqual(report.items.find(x=>x.riotId===3089).from,['needless_rod','needless_rod']);
  assert.equal(fs.readFileSync(path.join(root,'engine.mjs'),'utf8'),before);
  assert.ok(message.includes('"applied": false'));
 }finally{fs.rmSync(folder,{recursive:true,force:true});}
});
t('engine.browser mantém os auxiliares recursivos',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../engine.browser.js',import.meta.url),'utf8'),ctx,{timeout:5000});
 assert.equal(typeof ctx.window.CoachArena.recipeTreeV453Dev30,'function');
 assert.equal(ctx.window.CoachArena.recipePurchasePartsV453Dev30('rabadon',['needless_rod']).join(','),'needless_rod');
});
console.log('DEV30 9/9 PASS');
