import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Arena,catalog,ITEM_RECIPES,ITEM_SELL_VALUES_V453_DEV60,officialSaleValueV453Dev60,recipePurchasePartsV453Dev30} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
const root=new URL('../',import.meta.url),read=n=>JSON.parse(readFileSync(new URL('data/'+n,root),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
const raw=read('riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json').data;
const sr=read('riot_reference/sr_shop_26_21_dev49.json');
const make=()=>new Arena(map,mask,{seed:26,mode:'pvp'});
let checks=0;const test=async(name,run)=>{await run();checks++;console.log('✓ DEV60 '+name)};
const uof=(a,team='blue',role='MID')=>a.units.find(v=>v.id===`${team}_${role}`);
await test('100 preços oficiais por id local em Summoner’s Rift 16.21.1',()=>{
 const rows=Object.values(sr.rows).filter(v=>v.status==='engine_playable');assert.ok(rows.length>=100);
 assert.equal(Object.keys(ITEM_SELL_VALUES_V453_DEV60).length,rows.length);
 for(const r of rows){const item=catalog.find(i=>i.id===r.localId);assert.ok(item,r.localId);assert.equal(item.cost,raw[r.id].gold.total);
  assert.equal(officialSaleValueV453Dev60(item.id),raw[r.id].gold.sell,r.name);
  assert.deepEqual((ITEM_RECIPES[item.id]||[]).map(c=>Object.values(sr.rows).find(r=>r.localId===c)?.id).sort(),(raw[r.id].from||[]).slice().sort(),item.id);
 }
 assert.equal(officialSaleValueV453Dev60('trinket_oracle'),0);
});
await test('Revenda exata: botas 210; Anel Doran 160; ward 30; poções 20/60',()=>{
 for(const [id,value] of [['boots',210],['dorans_ring',160],['ward',30],['health_potion',20],['refillable_potion',60],['dark_seal',140],['mejais_soulstealer',1050]]){
  assert.equal(officialSaleValueV453Dev60(id),value,id);
 }
});
await test('Venda remove item, atributos e retorna ouro inferior à compra (sem lucro no ciclo)',()=>{
 const a=make(),u=uof(a);u.gold=10000;u.items=[];
 const before=u.gold;assert.equal(a.buy('blue',u.id,'boots'),true);assert.equal(u.gold,before-300);
 const speed=a.effectiveMS(u);const sale=a.sellItemV43('blue',u.id,0);assert.deepEqual({...sale},{ok:true,refund:210,itemId:'boots',price:300,loss:90});
 assert.equal(u.gold,before-90);assert.ok(!u.items.includes('boots'));assert.ok(a.effectiveMS(u)<speed);
 assert.equal(a.sellItemV43('blue',u.id,0).ok,false);assert.equal(u.gold,before-90);
 const ledger=u.economyLedgerV43.slice(-2);assert.deepEqual(ledger.map(x=>x.delta),[-300,210]);
});
await test('Troca de build: venda de Doran 40%, compra de componente e receita com desconto sem duplicar ouro',()=>{
 const a=make(),u=uof(a);u.gold=2000;u.items=[];
 assert.equal(a.buy('blue',u.id,'dorans_ring'),true);const refund=a.sellItemV43('blue',u.id,0);
 assert.equal(refund.refund,160);assert.equal(u.gold,1760);
 assert.equal(a.buy('blue',u.id,'long_sword'),true);assert.equal(a.buy('blue',u.id,'agility_cloak'),true);
 const noon=catalog.find(i=>i.id==='noonquiver');assert.ok(noon);
 assert.deepEqual(recipePurchasePartsV453Dev30('noonquiver',u.items).sort(),['agility_cloak','long_sword']);
 assert.equal(a.itemPurchaseCost(u,'noonquiver'),noon.cost-350-catalog.find(i=>i.id==='agility_cloak').cost);
 assert.equal(a.buy('blue',u.id,'noonquiver'),true);assert.deepEqual(u.items,['noonquiver']);
 const expected=1760-noon.cost;assert.equal(u.gold,expected);
 const sale2=a.sellItemV43('blue',u.id,0);assert.equal(sale2.refund,officialSaleValueV453Dev60('noonquiver'));
});
await test('Receita recursiva e componentes duplicados não dão desconto além dos itens possuídos',()=>{
 const a=make(),u=uof(a);u.items=['long_sword'];
 const parts=recipePurchasePartsV453Dev30('caulfields_warhammer',u.items);
 assert.deepEqual(parts,['long_sword']);
 assert.equal(a.itemPurchaseCost(u,'caulfields_warhammer'),catalog.find(i=>i.id==='caulfields_warhammer').cost-350);
});
await test('Venda no campo/execução/confirmado/decisão/fim é rejeitada sem mutação',()=>{
 const a=make(),u=uof(a);u.items=['boots'];u.gold=900;
 const check=()=>{const g=u.gold,items=[...u.items];const r=a.sellItemV43('blue',u.id,0);assert.equal(r.ok,false);assert.equal(u.gold,g);assert.deepEqual(u.items,items);};
 u.x=.5;u.y=.5;check();const shop=a.map.objects.find(x=>x.id==='blue_spawn_shop');u.x=shop.x;u.y=shop.y;
 for(const phase of ['executing','decision']){a.phase=phase;check();}a.phase='planning';a.pendingDecision={kind:'combat_reaction',unitId:u.id};check();a.pendingDecision=null;
 a.teams.blue.ready=true;check();a.teams.blue.ready=false;a.ended=true;check();
});
await test('Pet/itens de missão/trinket não podem ser vendidos e não geram dinheiro',()=>{
 const a=make(),j=uof(a,'blue','JG'),s=uof(a,'blue','SUP');for(const u of [j,s]){u.gold=500;const r=a.sellItemV43('blue',u.id,0);assert.equal(r.ok,false);assert.equal(u.gold,500);}
});
await test('Venda e nova compra respeitam seis espaços e impedem duplicação de item lendário',()=>{
 const a=make(),u=uof(a);u.gold=10000;u.items=['boots','long_sword','long_sword','ruby_crystal','cloth_armor','null_magic_mantle'];
 assert.equal(a.canBuy('blue',u.id,'amp_tome').ok,false);
 assert.equal(a.sellItemV43('blue',u.id,5).ok,true);assert.equal(a.buy('blue',u.id,'amp_tome'),true);assert.equal(u.items.length,6);
 u.items=['rabadon'];assert.equal(a.canBuy('blue',u.id,'rabadon').ok,false);
});
await test('Histórico GoldEarned/Refunded/Spent não trata revenda como ouro produzido',()=>{
 const a=make(),u=uof(a);u.items=[];u.gold=1000;
 a.buy('blue',u.id,'boots');a.sellItemV43('blue',u.id,0);
 const p=a.postgameEntryV452d4Dev7(u);assert.ok(p.goldSpent>=300);assert.equal(p.goldRefunded,210);
 assert.equal(u.gold,910);
});
await test('Dois jogadores comandam economia das suas cinco unidades sem controlar a equipe oposta',()=>{
 const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest}),first=reg.create(),room=first.room,red=room.join();
 const u=uof(room.arena,'blue','TOP');u.gold=4000;u.items=[];
 const buy=room.command(first.player,{sequence:1,kind:'item.buy',unitId:u.id,payload:{itemId:'boots'}});assert.equal(buy.ok,true,JSON.stringify(buy));
 const snapshot=u.gold;
 assert.equal(room.command(first.player,{sequence:1,kind:'item.buy',unitId:u.id,payload:{itemId:'boots'}}).ok,true);assert.equal(u.gold,snapshot);
 assert.equal(room.command(red.player,{sequence:1,kind:'item.sell',unitId:u.id,payload:{index:0}}).reason,'unidade_nao_autorizada');
 const sold=room.command(first.player,{sequence:2,kind:'item.sell',unitId:u.id,payload:{index:0}});assert.equal(sold.ok,true,JSON.stringify(sold));assert.equal(u.gold,3910);
 assert.equal(room.command(first.player,{sequence:3,kind:'item.sell',unitId:u.id,payload:{index:0}}).ok,false);
 assert.equal(u.gold,3910);
 const redU=uof(room.arena,'red','ADC');redU.gold=3000;redU.items=[];
 assert.equal(room.command(red.player,{sequence:1,kind:'item.buy',unitId:redU.id,payload:{itemId:'boots'}}).ok,true);
});
await test('Compra imediata, fila e cancelamento no PvP respeitam validação de equipe e sequência',()=>{
 const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest}),first=reg.create(),room=first.room;room.join();
 const u=uof(room.arena,'blue','TOP');u.gold=0;u.items=[];
 assert.equal(room.command(first.player,{sequence:1,kind:'item.buy',unitId:u.id,payload:{itemId:'boots'}}).ok,false);
 const queued=room.command(first.player,{sequence:1,kind:'item.queue',unitId:u.id,payload:{itemId:'boots'}});assert.equal(queued.ok,true,JSON.stringify(queued));
 assert.equal(u.purchaseQueue.length,1);
 const cancel=room.command(first.player,{sequence:2,kind:'item.cancelQueue',unitId:u.id,payload:{index:0}});assert.equal(cancel.ok,true);assert.equal(u.purchaseQueue.length,0);
});
await test('Validação da forma de input bloqueia índice fracionário, negativo e campo adicional',()=>{
 const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest}),first=reg.create(),room=first.room;room.join();
 for(const payload of [{index:-1},{index:.5},{index:0,refund:99999},{index:'0'},{index:99}]){
  const r=room.command(first.player,{sequence:1,kind:'item.sell',unitId:'blue_MID',payload});assert.equal(r.ok,false);
 }
});
await test('Snapshot/checkpoint mantém compras, vendas, saldo e sequência após reconectar',()=>{
 const path=mkdtempSync(join(tmpdir(),'coachlol60-'));try{
  const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:path}),first=reg.create(),room=first.room;room.join();
  const u=uof(room.arena);u.gold=3000;u.items=[];
  assert.equal(room.command(first.player,{sequence:1,kind:'item.buy',unitId:u.id,payload:{itemId:'boots'}}).ok,true);
  assert.equal(room.command(first.player,{sequence:2,kind:'item.sell',unitId:u.id,payload:{index:0}}).ok,true);
  const reloaded=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:path}).get(room.id);
  const v=reloaded.view(reloaded.authenticate(first.token));assert.equal(v.nextSequence,3);assert.equal(uof(reloaded.arena).gold,u.gold);
  assert.deepEqual(uof(reloaded.arena).items,u.items);
 }finally{rmSync(path,{recursive:true,force:true});}
});
await test('HTTP: 2 cookies isolados, catálogo oficial e venda autoritativa sem preço enviado pelo browser',async()=>{
 const server=createPvPServerV453Dev47({tickMs:0});const addr=await server.listen(0);
 const origin=`http://127.0.0.1:${addr.port}`;
 const post=async(path,data,cookie='')=>{const res=await fetch(origin+path,{method:'POST',headers:{'content-type':'application/json',origin,...(cookie?{cookie}:{})},body:JSON.stringify(data)});return {status:res.status,data:await res.json(),cookie:res.headers.get('set-cookie')};};
 try{
  const first=await post('/api/create',{maxSeats:2});const second=await post('/api/join',{roomId:first.data.roomId});
  const ck1=first.cookie.split(';')[0],ck2=second.cookie.split(';')[0];
  const shop=await fetch(origin+'/api/shop',{headers:{cookie:ck1}}),data=await shop.json();assert.equal(shop.status,200);assert.equal(data.items.find(i=>i.id==='dorans_ring').refund,160);
  assert.equal((await fetch(origin+'/api/shop')).status,401);
  const sold=await post('/api/action',{sequence:1,kind:'item.sell',unitId:'blue_SUP',payload:{index:0}},ck1);
  assert.equal(sold.status,409); // Suporte quest item: cannot sell
  const attack=await post('/api/action',{sequence:1,kind:'item.sell',unitId:'red_MID',payload:{index:0}},ck1);assert.equal(attack.status,409);
  const redSale=await post('/api/action',{sequence:1,kind:'item.sell',unitId:'blue_MID',payload:{index:0}},ck2);assert.equal(redSale.status,409);
 }finally{await server.close();}
});
await test('No PvP os dois humanos escolhem habilidades e reações: vermelho não recebe auto-level de bot',()=>{
 const a=make();for(const team of ['red','blue'])for(const role of ['MID','TOP','JG','ADC','SUP']){
  const u=uof(a,team,role);assert.equal(u.autoLevelSkills,false,team+' '+role);assert.equal(u.autoRespond,false,team+' '+role);
  assert.equal(u.skillPoints,1,team+' '+role);
 }
 assert.equal(a.upgradeSkill('red','red_TOP','Q').ok,true);assert.equal(uof(a,'red','TOP').skillRanks.Q,1);
});
await test('Um humano envia ordens aos cinco campeões sem transferir posse; os dois confirmam após operar a loja',()=>{
 const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest}),first=reg.create(),room=first.room,second=room.join();
 let bs=1,rs=1;for(const role of ['MID','TOP','JG','ADC','SUP']){
  const b=room.command(first.player,{sequence:bs++,kind:'order.stop',unitId:'blue_'+role,payload:{}}),r=room.command(second.player,{sequence:rs++,kind:'order.stop',unitId:'red_'+role,payload:{}});
  assert.equal(b.ok,true,JSON.stringify(b));assert.equal(r.ok,true,JSON.stringify(r));
 }
 assert.equal(room.confirm(first.player).ok,true);assert.equal(room.arena.phase,'preparation');
 assert.equal(room.confirm(second.player).ok,true);assert.equal(room.arena.phase,'executing');
 const step=room.advance(1);assert.ok(step&&typeof step==='object');
});
await test('Visão da loja e saldo não expõem dados privados de campeões inimigos',()=>{
 const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest}),first=reg.create(),room=first.room,red=room.join();
 room.arena.visible=(team,u)=>u.team===team;
 const b=room.view(first.player),r=room.view(red.player);
 assert.deepEqual(Object.keys(b.projection.shopInRangeV453Dev60).sort(),['blue_ADC','blue_JG','blue_MID','blue_SUP','blue_TOP'].sort());
 assert.deepEqual(Object.keys(r.projection.shopInRangeV453Dev60).sort(),['red_ADC','red_JG','red_MID','red_SUP','red_TOP'].sort());
 assert.ok(b.projection.units.every(u=>u.team==='blue'));assert.ok(r.projection.units.every(u=>u.team==='red'));
});
await test('Cliente principal exibe gold.sell e cliente PvP tem inventário, compra, venda e multiseleção',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8'),client=readFileSync(new URL('../multiplayer/pvp_client_v453_dev47.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../multiplayer.html',import.meta.url),'utf8');
 assert.ok(app.includes('canSellItemV453Dev60'));assert.ok(app.includes('Venda indisponível'));
 for(const command of ["'item.buy'","'item.sell'","'item.cancelQueue'"])assert.ok(client.includes(command));
 assert.ok(html.includes('multiple aria-label'));assert.ok(html.includes('shopInventoryPvp'));
});
console.log(`DEV60 ${checks}/${checks} PASS`);
