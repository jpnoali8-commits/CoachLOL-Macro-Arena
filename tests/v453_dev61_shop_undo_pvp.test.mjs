import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Arena,catalog} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
const create=()=>new Arena(map,mask,{seed:61,mode:'pvp'});
const hero=(a,team='blue',role='MID')=>a.units.find(x=>x.id===team+'_'+role);
let count=0;async function test(name,fn){await fn();console.log('✓ DEV61',name);count++;}
await test('Compra pode ser desfeita com reembolso integral e sem revenda depreciada',()=>{
 const a=create(),u=hero(a);u.items=[];u.gold=1000;const start=structuredClone(u);
 assert.equal(a.buy('blue',u.id,'boots'),true);assert.equal(u.gold,700);
 assert.deepEqual(a.canUndoShopV453Dev61('blue',u.id).ok,true);
 assert.deepEqual(a.undoShopV453Dev61('blue',u.id),{ok:true,kind:'purchase',itemId:'boots',amount:300});
 assert.equal(u.gold,1000);assert.deepEqual(u.items,[]);assert.equal(u.flatMoveSpeed,start.flatMoveSpeed);
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,false);
});
await test('Venda desfeita restaura o item e o ouro anterior, não desconta 40/70% novamente',()=>{
 const a=create(),u=hero(a);u.items=[];u.gold=1000;
 assert.equal(a.buy('blue',u.id,'dorans_ring'),true);assert.equal(u.gold,600);
 const sold=a.sellItemV43('blue',u.id,0);assert.equal(sold.refund,160);assert.equal(u.gold,760);
 const undo=a.undoShopV453Dev61('blue',u.id);assert.equal(undo.ok,true);assert.equal(undo.kind,'sale');
 assert.equal(u.gold,600);assert.deepEqual(u.items,['dorans_ring']);
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,true);assert.equal(u.gold,1000);assert.deepEqual(u.items,[]);
});
await test('Melhoria de item retorna componentes de receita e restaura atributos',()=>{
 const a=create(),u=hero(a);u.items=[];u.gold=10000;
 for(const id of ['long_sword','agility_cloak'])assert.ok(a.buy('blue',u.id,id));
 const original=structuredClone({gold:u.gold,items:u.items,ad:u.ad,crit:u.critChance});
 assert.equal(a.buy('blue',u.id,'noonquiver'),true);assert.deepEqual(u.items,['noonquiver']);
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,true);
 assert.deepEqual({gold:u.gold,items:u.items,ad:u.ad,crit:u.critChance},original);
});
await test('Múltiplas compras e vendas são desfeitas em ordem LIFO sem lucro duplicado',()=>{
 const a=create(),u=hero(a);u.items=[];u.gold=5000;
 a.buy('blue',u.id,'boots');a.buy('blue',u.id,'long_sword');a.sellItemV43('blue',u.id,1);
 assert.equal(a.undoShopV453Dev61('blue',u.id).kind,'sale');
 assert.equal(a.undoShopV453Dev61('blue',u.id).kind,'purchase');
 assert.equal(a.undoShopV453Dev61('blue',u.id).kind,'purchase');
 assert.equal(u.gold,5000);assert.deepEqual(u.items,[]);
 assert.equal((u.economyLedgerV43||[]).length,0);
});
await test('Undo bloqueado após avanço de tempo, mesmo retornando à fonte',()=>{
 const a=create(),u=hero(a);u.items=[];u.gold=5000;a.buy('blue',u.id,'boots');a.gameTime+=1;
 const balance=u.gold,items=[...u.items];assert.equal(a.undoShopV453Dev61('blue',u.id).ok,false);
 assert.equal(u.gold,balance);assert.deepEqual(u.items,items);
});
await test('Undo bloqueado após ouro ganho, dano, gasto ou mutação da unidade',()=>{
 for(const field of ['hp','gold','mana','level']){
  const a=create(),u=hero(a);u.items=[];u.gold=5000;a.buy('blue',u.id,'boots');u[field]+=1;
  assert.equal(a.undoShopV453Dev61('blue',u.id).ok,false,field);
 }
});
await test('Undo bloqueado fora da fonte e nas fases de combate/confirmado',()=>{
 const a=create(),u=hero(a);u.items=[];u.gold=2000;a.buy('blue',u.id,'boots');
 const source=a.map.objects.find(x=>x.id==='blue_spawn_shop');
 u.x=.5;u.y=.5;assert.equal(a.undoShopV453Dev61('blue',u.id).ok,false);
 u.x=source.x;u.y=source.y;
 for(const phase of ['executing','decision']){a.phase=phase;assert.equal(a.undoShopV453Dev61('blue',u.id).ok,false);}a.phase='planning';
 a.teams.blue.ready=true;assert.equal(a.undoShopV453Dev61('blue',u.id).ok,false);
});
await test('Sair da fonte invalida a pilha de desfazer permanentemente, mesmo voltando no mesmo segundo',()=>{
 const a=create(),u=hero(a);u.items=[];u.gold=1200;
 assert.equal(a.buy('blue',u.id,'boots'),true);
 const shop=a.map.objects.find(x=>x.id==='blue_spawn_shop');
 const outside={x:shop.x+.1,y:shop.y};assert.equal(a.walkable(outside.x,outside.y),true);
 const moved=a.moveAlong(u,{path:[outside],point:outside,action:'move'},1500);
 assert.ok(moved>1125,`movimento real ${moved}`);
 assert.equal(a.canUndoShopV453Dev61('blue',u.id).ok,false);
 assert.equal(u.shopUndoRevokedV453Dev61,true);
 assert.equal(u.shopUndoV453Dev61.length,0);
 const returned=a.moveAlong(u,{path:[{x:shop.x,y:shop.y}],point:shop,action:'move'},1500);
 assert.ok(returned>1125,`volta real ${returned}`);
 assert.equal(a.gameTime,0);
 assert.match(a.canUndoShopV453Dev61('blue',u.id).reason,/saiu da fonte/i);
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,false);
 assert.deepEqual(u.items,['boots']);assert.equal(u.gold,900);
});
await test('Após sair e voltar, somente compras NOVAS na fonte podem ser desfeitas',()=>{
 const a=create(),u=hero(a);u.items=[];u.gold=1200;a.buy('blue',u.id,'boots');
 const shop=a.map.objects.find(x=>x.id==='blue_spawn_shop');
 a.moveAlong(u,{path:[{x:shop.x+.1,y:shop.y}],action:'move',point:{x:shop.x+.1,y:shop.y}},1500);
 u.x=shop.x;u.y=shop.y;
 assert.equal(a.buy('blue',u.id,'long_sword'),true);
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,true);
 assert.deepEqual(u.items,['boots']);assert.equal(u.gold,900);
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,false);
});
await test('Snapshot preserva irrevogabilidade de sair da fonte até depois de reconectar',()=>{
 const a=create(),u=hero(a);u.items=[];u.gold=1200;a.buy('blue',u.id,'boots');
 const shop=a.map.objects.find(x=>x.id==='blue_spawn_shop');
 a.moveAlong(u,{path:[{x:shop.x+.1,y:shop.y}],action:'move',point:{x:shop.x+.1,y:shop.y}},1500);
 u.x=shop.x;u.y=shop.y;
 const loaded=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(loaded.canUndoShopV453Dev61('blue',u.id).ok,false);
 assert.equal(hero(loaded).shopUndoRevokedV453Dev61,true);
});
await test('Servidor PvP 1v1 rejeita undo após sair e voltar, mesmo sem avanço de turno',()=>{
 const registry=new PvPRoomRegistryV453Dev47({map,mask,manifest});
 const created=registry.create(),room=created.room,other=room.join();
 const u=hero(room.arena,'blue','MID');u.items=[];u.gold=1200;
 assert.equal(room.command(created.player,{sequence:1,unitId:u.id,kind:'item.buy',payload:{itemId:'boots'}}).ok,true);
 const shop=room.arena.map.objects.find(x=>x.id==='blue_spawn_shop');
 room.arena.moveAlong(u,{path:[{x:shop.x+.1,y:shop.y}],action:'move',point:{x:shop.x+.1,y:shop.y}},1500);
 u.x=shop.x;u.y=shop.y;
 assert.equal(room.command(created.player,{sequence:2,unitId:u.id,kind:'item.undo',payload:{}}).ok,false);
 assert.equal(room.view(created.player).projection.shopUndoAvailableV453Dev61.blue_MID,null);
 assert.equal(room.command(other.player,{sequence:1,unitId:u.id,kind:'item.undo',payload:{}}).ok,false);
 assert.deepEqual(u.items,['boots']);assert.equal(u.gold,900);
});
await test('Venda seguida de compra de build: desfazer retorna ao estado antes de ambas',()=>{
 const a=create(),u=hero(a);u.items=[];u.gold=1500;
 a.buy('blue',u.id,'boots');a.sellItemV43('blue',u.id,0);a.buy('blue',u.id,'long_sword');
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,true);
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,true);
 assert.deepEqual(u.items,['boots']);assert.equal(u.gold,1200);
});
await test('Snapshots/restauração preservam direito a desfazer sem aceitar mutação fraudulenta',()=>{
 const a=create(),u=hero(a);u.items=[];u.gold=1000;a.buy('blue',u.id,'boots');
 const loaded=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(loaded.canUndoShopV453Dev61('blue',u.id).ok,true);
 assert.equal(loaded.undoShopV453Dev61('blue',u.id).ok,true);
 assert.equal(hero(loaded).gold,1000);
});
await test('PvP duas sessões: Azul e Vermelho desfazem transações de qualquer um de seus cinco campeões',()=>{
 const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest}),one=reg.create(),room=one.room,two=room.join();
 for(const [p,team,role] of [[one.player,'blue','TOP'],[two.player,'red','SUP']]){
  const u=hero(room.arena,team,role);u.items=[];u.gold=1000;
  const id=u.id;
  assert.equal(room.command(p,{sequence:1,unitId:id,kind:'item.buy',payload:{itemId:'boots'}}).ok,true);
  assert.equal(room.command(p,{sequence:2,unitId:id,kind:'item.undo',payload:{}}).ok,true);
  assert.equal(u.gold,1000);assert.deepEqual(u.items,[]);
 }
});
await test('Gateway bloqueia undo de inimigo, payload forjado e replay diferente',()=>{
 const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest}),one=reg.create(),room=one.room,two=room.join();
 const u=hero(room.arena,'blue','ADC');u.items=[];u.gold=1000;
 assert.equal(room.command(one.player,{sequence:1,kind:'item.buy',unitId:u.id,payload:{itemId:'boots'}}).ok,true);
 assert.equal(room.command(two.player,{sequence:1,kind:'item.undo',unitId:u.id,payload:{}}).reason,'unidade_nao_autorizada');
 assert.equal(room.command(one.player,{sequence:2,kind:'item.undo',unitId:u.id,payload:{gold:99999}}).ok,false);
 assert.equal(room.command(one.player,{sequence:2,kind:'item.undo',unitId:u.id,payload:{}}).ok,true);
 assert.equal(room.command(one.player,{sequence:2,kind:'item.undo',unitId:u.id,payload:{}}).ok,true);
 assert.equal(room.command(one.player,{sequence:2,kind:'item.buy',unitId:u.id,payload:{itemId:'boots'}}).reason,'sequencia_reutilizada_com_dados_diferentes');
 assert.equal(u.gold,1000);
});
await test('Reconexão do servidor preserva sequência e undo (sem ouro duplicado)',()=>{
 const path=mkdtempSync(join(tmpdir(),'coachlol-dev61-'));try{
  const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:path}),one=reg.create(),room=one.room;room.join();
  const u=hero(room.arena,'blue','ADC');u.gold=2000;u.items=[];
  assert.equal(room.command(one.player,{sequence:1,kind:'item.buy',unitId:u.id,payload:{itemId:'boots'}}).ok,true);
  const restored=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:path}).get(room.id);
  const p=restored.authenticate(one.token);assert.equal(restored.view(p).nextSequence,2);
  assert.equal(restored.command(p,{sequence:2,kind:'item.undo',unitId:u.id,payload:{}}).ok,true);
  assert.equal(hero(restored.arena,'blue','ADC').gold,2000);
 }finally{rmSync(path,{recursive:true,force:true});}
});
await test('Visão privada do botão Undo: cada jogador vê somente sua equipe',()=>{
 const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest}),one=reg.create(),room=one.room,two=room.join();
 const b=hero(room.arena,'blue','ADC');b.gold=1000;b.items=[];
 room.command(one.player,{sequence:1,kind:'item.buy',unitId:b.id,payload:{itemId:'boots'}});
 const blue=room.view(one.player).projection,red=room.view(two.player).projection;
 assert.equal(blue.shopUndoAvailableV453Dev61.blue_ADC.itemId,'boots');
 assert.ok(!('blue_ADC' in red.shopUndoAvailableV453Dev61));
 assert.ok(red.shopUndoAvailableV453Dev61.red_ADC===null);
});
await test('HTTP: sem preço enviado pelo cliente e sem permitir undo do adversário',async()=>{
 const srv=createPvPServerV453Dev47({tickMs:0}),addr=await srv.listen(0),origin=`http://127.0.0.1:${addr.port}`;
 const post=async(path,payload,cookie='')=>{const r=await fetch(origin+path,{method:'POST',headers:{'content-type':'application/json',origin,...(cookie?{cookie}:{})},body:JSON.stringify(payload)});return {code:r.status,v:await r.json(),cookie:r.headers.get('set-cookie')};};
 try{
  const one=await post('/api/create',{maxSeats:2}),two=await post('/api/join',{roomId:one.v.roomId});const ck1=one.cookie.split(';')[0],ck2=two.cookie.split(';')[0];
  const bought=await post('/api/action',{sequence:1,unitId:'blue_TOP',kind:'item.buy',payload:{itemId:'boots'}},ck1);
  assert.equal(bought.code,200,JSON.stringify(bought));
  assert.equal((await post('/api/action',{sequence:1,unitId:'blue_TOP',kind:'item.undo',payload:{}},ck2)).code,409);
  assert.equal((await post('/api/action',{sequence:2,unitId:'blue_TOP',kind:'item.undo',payload:{refund:99999}},ck1)).code,409);
  assert.equal((await post('/api/action',{sequence:2,unitId:'blue_TOP',kind:'item.undo',payload:{}},ck1)).code,200);
 }finally{await srv.close();}
});

await test('Arco de Doran: 8 AD, 15% AS e 1,5% vampirismo universal, compra e undo',()=>{
 const a=create(),u=hero(a,'blue','ADC');u.items=[];u.gold=1000;
 const {ad,attackSpeedBonusV453Dev29,omnivamp}=u;
 assert.equal(a.buy('blue',u.id,'dorans_bow'),true);
 assert.equal(u.ad,ad+8);assert.equal((u.attackSpeedBonusV453Dev29||0)-(attackSpeedBonusV453Dev29||0),15);
 assert.equal(u.omnivamp,omnivamp+1.5);assert.equal(u.gold,600);
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,true);
 assert.equal(u.ad,ad);assert.equal(u.omnivamp,omnivamp);assert.equal(u.gold,1000);
});
await test('Elmo de Doran: HP150, armadura8, MR8 e 5 dano físico na previsão e no AA a tropas',()=>{
 const a=create(),u=hero(a,'blue','TOP');u.items=[];u.gold=1000;
 const wave={kind:'melee',team:'red',armor:0};
 const base=a.basicAttackPowerV452c(u,wave),hp=u.maxHp,armor=u.armor,mr=u.mr;
 assert.equal(a.buy('blue',u.id,'dorans_helm'),true);
 assert.equal(u.maxHp,hp+150);assert.equal(u.armor,armor+8);assert.equal(u.mr,mr+8);
 assert.equal(a.basicAttackPowerV452c(u,wave),base+5);
 assert.equal(a.predictBasicAttackDamageV452c(u,wave),Math.max(1,Math.round(base+5)));
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,true);
 assert.equal(u.maxHp,hp);assert.equal(u.armor,armor);assert.equal(u.mr,mr);
});
await test('Doran iniciadores: revenda oficial 40%, exclusividade e restauração por Undo',()=>{
 const a=create(),u=hero(a,'blue','ADC');u.items=[];u.gold=1000;
 assert.equal(a.buy('blue',u.id,'dorans_bow'),true);
 assert.equal(a.canBuy('blue',u.id,'dorans_helm').ok,false);
 assert.equal(a.sellItemV43('blue',u.id,0).refund,160);
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,true);
 assert.equal(u.items[0],'dorans_bow');assert.equal(u.gold,600);
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,true);assert.equal(u.gold,1000);
});
await test('Catálogo e valor de revenda para os dois novos iniciadores são fiéis ao Data Dragon arquivado',()=>{
 const sr=read('riot_reference/sr_shop_26_21_dev49.json');
 const raw=read('riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json').data;
 for(const [id,local] of [['1086','dorans_bow'],['1120','dorans_helm']]){
  assert.equal(sr.rows[id].status,'engine_playable');assert.equal(sr.rows[id].localId,local);
  const item=catalog.find(v=>v.id===local);assert.equal(item.cost,raw[id].gold.total);
  assert.equal(sr.rows[id].price,item.cost);assert.equal(sr.rows[id].basePrice,item.cost);
 }
 assert.ok(sr.counts.normalPlayable>=167&&sr.counts.referenceOnly<=35,'catalog coverage must not regress');assert.equal(sr.counts.normalPlayable+sr.counts.referenceOnly,202);
});
console.log(`DEV61 ${count}/${count} PASS`);
