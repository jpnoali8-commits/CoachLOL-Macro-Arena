import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Arena,catalog,ITEM_RECIPES,checksumV40} from '../engine.mjs';
const read=n=>JSON.parse(fs.readFileSync(new URL('../data/'+n,import.meta.url)));
const sr=read('riot_reference/sr_shop_26_21_dev49.json'),dd=read('riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json');
const map=read('coachlol_map_v6.json'),masks=read('masks_128.json');
const tests=[];const test=(name,fn)=>{fn();tests.push(name);console.log('✓ DEV49 '+name)};
test('somente 16.21.1 / SR mapa 11 com compra verdadeira',()=>{
 assert.equal(sr.patch,'26.21');assert.equal(sr.ddVersion,'16.21.1');assert.equal(sr.counts.srPurchasable,210);
 for(const [id,row] of Object.entries(sr.rows)){const d=dd.data[id];assert.equal(d.maps['11'],true,id);assert.equal(d.gold.purchasable,true,id);assert.equal(row.price,d.gold.total,id);assert.deepEqual(row.from,d.from||[],id);}
});
test('nenhum ARAM, TFT, modo alternativo ou item removido misturado à loja',()=>{
 for(const id of ['3005','3001','4641','2051','2141','3112','3177','3184','323110','663146','1105','1106','1107'])assert.equal(sr.rows[id],undefined,id);
 assert.equal(sr.rows['3110'].name,'Coração Congelado');
});
test('evoluções condicionais e exclusividades excluídas da compra comum',()=>{
 assert.equal(sr.counts.conditional,5);assert.equal(sr.counts.championExclusive,3);
 assert.equal(sr.rows['3869'].status,'conditional_quest');assert.equal(sr.rows['3599'].status,'champion_exclusive');
 for(const row of Object.values(sr.rows))if(['conditional_quest','champion_exclusive'].includes(row.status))assert.notEqual(row.status,'engine_playable');
});
test('referência sem mecânica não anuncia compra executável',()=>{
 assert.equal(sr.counts.normalStore,202);assert.equal(sr.counts.normalPlayable,202);assert.equal(sr.counts.referenceOnly,0);
 const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.match(app,/row.status==='reference_only'/);assert.match(app,/notPurchasable:true/);
 assert.match(app,/buy.disabled=true;buy.textContent='INDISPONÍVEL'/);
 assert.ok(!app.includes('leagueoflegends.fandom.com'));
});
test('todos os itens locais com ID SR verificável têm preço e receita atual',()=>{
 assert.deepEqual(sr.mismatch,[]);
 for(const r of Object.values(sr.rows).filter(x=>x.localId)){
  assert.equal(catalog.find(x=>x.id===r.localId)?.cost,r.price,r.id);
  assert.equal(r.recipeVerified,true,r.id);
 }
});
test('Sigilo de Aço é componente funcional SR com receita oficial',()=>{
 const item=catalog.find(x=>x.id==='steel_sigil');assert.equal(item.riotId,2019);
 assert.equal(item.cost,1100);assert.deepEqual(item.stats,{ad:15,armor:30});
 assert.deepEqual(ITEM_RECIPES.steel_sigil,['cloth_armor','long_sword','cloth_armor']);
});
test('Brutalizador e Tunelizador usam preços, stats e receitas oficiais',()=>{
 const a=catalog.find(x=>x.id==='brutalizer'),b=catalog.find(x=>x.id==='tunneler');
 assert.equal(a.cost,1337);assert.deepEqual(a.stats,{ad:25,abilityHaste:10,lethality:5});
 assert.deepEqual(ITEM_RECIPES.brutalizer,['glowing_mote','pickaxe']);
 assert.equal(b.cost,1150);assert.deepEqual(b.stats,{ad:15,hp:250});
 assert.deepEqual(ITEM_RECIPES.tunneler,['long_sword','ruby_crystal']);
});
test('inventário e descontos dos 3 novos componentes funcionam no motor',()=>{
 for(const [id,parts] of Object.entries({steel_sigil:['cloth_armor','long_sword','cloth_armor'],brutalizer:['glowing_mote','pickaxe'],tunneler:['long_sword','ruby_crystal']})){
  const a=new Arena(map,masks,{seed:49});const u=a.units.find(x=>x.team==='blue'&&x.role==='MID');
  const shop=a.map.objects.find(x=>x.id==='blue_spawn_shop');Object.assign(u,{x:shop.x,y:shop.y,gold:100000,items:[]});
  const item=catalog.find(x=>x.id===id);const initial=u.gold;
  const old={ad:u.ad,armor:u.armor,hp:u.maxHp,abilityHaste:u.abilityHaste||0,lethality:u.lethality||0};
  for(const part of parts)assert.equal(a.buy('blue',u.id,part),true,id+' -> '+part);
  const componentGold=parts.reduce((sum,x)=>sum+catalog.find(v=>v.id===x).cost,0);
  assert.equal(a.itemPurchaseCost(u,id),item.cost-componentGold,id);
  assert.equal(a.buy('blue',u.id,id),true,id);assert.deepEqual(u.items,[id]);
  assert.equal(initial-u.gold,item.cost,id);
  for(const [key,value] of Object.entries(item.stats)){
   const newVal=key==='hp'?u.maxHp:u[key]||0;assert.ok(Math.abs(newVal-(old[key]||0)-value)<1e-6,id+': '+key+' expected '+value+' got '+(newVal-(old[key]||0)));
  }
 }
});
test('snapshot e replay determinísticos preservam os componentes',()=>{
 const a=new Arena(map,masks,{seed:49});const u=a.units.find(x=>x.team==='blue'&&x.role==='MID');const shop=a.map.objects.find(x=>x.id==='blue_spawn_shop');
 Object.assign(u,{x:shop.x,y:shop.y,gold:100000,items:[]});assert.equal(a.buy('blue',u.id,'brutalizer'),true);
 const snap=a.snapshotV40(),b=Arena.fromSnapshotV40(map,masks,snap);
 assert.equal(checksumV40(snap),checksumV40(b.snapshotV40()));
});
test('árvores oficiais aninhadas incluem componentes e melhorias, cabem na sidebar',()=>{
 const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.ok(app.includes('officialRecipeBranchV453Dev49'));
 assert.ok(app.includes('srShopRowsV453Dev49[ref.id]'));
 assert.ok(app.includes('requestAnimationFrame(fitRecipeTreeV453Dev48)'));
 assert.ok(app.includes('sr.into'));
});
test('fonte única de ícones e receitas: Riot Data Dragon 16.21.1, sem Wiki',()=>{
 const tool=fs.readFileSync(new URL('../tools/download_sr_icons_dev49.mjs',import.meta.url),'utf8');
 assert.ok(tool.includes('ddragon.leagueoflegends.com/cdn/16.21.1/img/item/'));
 assert.ok(!/fandom.com|wiki.leagueoflegends.com/.test(tool));
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.ok(html.includes('sr_shop_26_21_dev49.js'));
});
console.log('DEV49 '+tests.length+'/'+tests.length+' PASS');
