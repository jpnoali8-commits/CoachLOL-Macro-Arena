import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Arena,catalog,ITEM_RECIPES,ITEM_EFFECTS_V43,officialSaleValueV453Dev60,recipePurchasePartsV453Dev30} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
const raw=read('riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json').data;
const sr=read('riot_reference/sr_shop_26_21_dev49.json');
const make=()=>new Arena(map,mask,{seed:69,mode:'pvp'});
const hero=(a,team='blue',role='MID')=>a.units.find(u=>u.id===team+'_'+role);
let n=0;const test=(name,fn)=>{fn();n++;console.log('✓ DEV69 B2 '+name)};
const items=[['4632','verdant_barrier',1600,1120,60],['3102','banshees_veil',3000,2100,40],['3814','edge_of_night',3000,2100,40]];
test('três itens SR 26.21: ID, preço, gold.sell, recipe, 3 cooldowns e taxonomia',()=>{
 const sourceMap={'1052':'amp_tome','1033':'null_magic_mantle','1058':'needless_rod','4632':'verdant_barrier','3134':'serrated_dirk','2021':'tunneler'};
 for(const [riot,id,price,sell,cd] of items){
  const item=catalog.find(x=>x.id===id);assert.ok(item);assert.equal(item.riotId,Number(riot));assert.equal(item.cost,price);
  assert.equal(raw[riot].gold.total,price);assert.equal(raw[riot].gold.sell,sell);assert.equal(officialSaleValueV453Dev60(id),sell);
  assert.deepEqual(ITEM_RECIPES[id],(raw[riot].from||[]).map(x=>sourceMap[x]));
  assert.equal(ITEM_EFFECTS_V43[id].cooldown,cd);
  assert.equal(sr.rows[riot].localId,id);assert.equal(sr.rows[riot].status,'engine_playable');
 }
 assert.equal(sr.counts.normalPlayable,122);assert.equal(sr.counts.referenceOnly,80);
});
test('Barreira Verdejante: escudo impede 1 spell e CC, AA não bloqueado',()=>{
 const a=make(),v=hero(a),e=hero(a,'red');v.items=[];v.gold=5000;
 assert.equal(a.buy('blue',v.id,'verdant_barrier'),true);
 assert.equal(a.effectResolverV41().has(v,'spell_shield'),true);
 v.hp=v.maxHp;const before=v.hp;
 assert.equal(a.damage(v,100,e,'magic','spell'),0);assert.equal(v.hp,before);
 assert.equal(a.effectResolverV41().has(v,'spell_shield'),false);
 const dealt=a.damage(v,100,e,'magic','spell');assert.ok(dealt>0&&v.hp<before);
 assert.equal(v.itemAnnulReadyAtV453Dev69Batch2,a.gameTime+60);
});
test('Véu Banshee: CC isolado consome escudo, não gera outro no mesmo tick',()=>{
 const a=make(),v=hero(a),e=hero(a,'red');v.items=[];v.gold=6000;
 assert.equal(a.buy('blue',v.id,'banshees_veil'),true);
 const fx=a.effectResolverV41();assert.equal(fx.apply(v,'root',{source:e,duration:2}).ok,false);
 assert.equal(fx.has(v,'root'),false);assert.equal(fx.has(v,'spell_shield'),false);
 assert.equal(v.itemAnnulReadyAtV453Dev69Batch2,40);
 assert.equal(fx.apply(v,'root',{source:e,duration:2}).ok,true);
});
test('Limiar da Noite: letalidade, AD, HP + imunidade a 1 spell e revenda',()=>{
 const a=make(),v=hero(a),e=hero(a,'red');v.items=[];v.gold=6500;
 const base={ad:v.ad,lethality:v.lethality,hp:v.maxHp};
 assert.equal(a.buy('blue',v.id,'edge_of_night'),true);
 assert.equal(v.ad,base.ad+50);assert.equal(v.lethality,base.lethality+15);assert.equal(v.maxHp,base.hp+250);
 assert.equal(a.damage(v,80,e,'magic','spell'),0);
 const sell=a.sellItemV43('blue',v.id,0);assert.equal(sell.refund,2100);
 assert.equal(v.ad,base.ad);assert.equal(v.maxHp,base.hp);assert.equal(a.effectResolverV41().has(v,'spell_shield'),false);
});
test('descarga, recarga pelo tempo de jogo, dano do campeão reinicia cooldown',()=>{
 const a=make(),v=hero(a),e=hero(a,'red');v.items=[];v.gold=5000;a.buy('blue',v.id,'banshees_veil');
 a.damage(v,45,e,'magic','spell');assert.equal(v.itemAnnulReadyAtV453Dev69Batch2,40);
 a.gameTime=30;a.damage(v,50,e,'physical','basic');assert.equal(v.itemAnnulReadyAtV453Dev69Batch2,70);
 a.gameTime=69;assert.equal(a.effectResolverV41().has(v,'spell_shield'),false);
 a.gameTime=70;assert.equal(a.effectResolverV41().has(v,'spell_shield'),true);
});
test('Barreira evolui para Banshee com desconto 2800 e herda cooldown/proteção sem duplicar efeito',()=>{
 const a=make(),v=hero(a),e=hero(a,'red');v.items=[];v.gold=9000;
 a.buy('blue',v.id,'verdant_barrier');a.buy('blue',v.id,'needless_rod');
 assert.deepEqual(recipePurchasePartsV453Dev30('banshees_veil',v.items).sort(),['needless_rod','verdant_barrier']);
 assert.equal(a.itemPurchaseCost(v,'banshees_veil'),200);
 a.damage(v,100,e,'magic','spell');assert.equal(v.itemAnnulReadyAtV453Dev69Batch2,60);
 assert.equal(a.buy('blue',v.id,'banshees_veil'),true);assert.deepEqual(v.items,['banshees_veil']);
 assert.equal(v.itemAnnulReadyAtV453Dev69Batch2,60);assert.equal(a.effectResolverV41().has(v,'spell_shield'),false);
 assert.equal(a.canBuy('blue',v.id,'edge_of_night').ok,false);
 a.gameTime=60;assert.equal(a.effectResolverV41().has(v,'spell_shield'),true);
});
test('unicidade: proíbe 2 Anular, dupes, ouro insuficiente, inventário protegido',()=>{
 const a=make(),v=hero(a);v.items=[];v.gold=3200;
 assert.ok(a.buy('blue',v.id,'edge_of_night'));const g=v.gold;
 assert.equal(a.canBuy('blue',v.id,'edge_of_night').ok,false);
 assert.equal(a.canBuy('blue',v.id,'verdant_barrier').ok,false);
 assert.equal(a.canBuy('blue',v.id,'banshees_veil').ok,false);
 assert.equal(v.gold,g);assert.deepEqual(v.items,['edge_of_night']);
});
test('Undo: compra/venda restauram ouro, stats, cooldown sem lucro',()=>{
 const a=make(),v=hero(a);v.items=[];v.gold=9000;
 const gold=v.gold,ap=v.ap,mr=v.mr;
 a.buy('blue',v.id,'verdant_barrier');assert.equal(v.gold,gold-1600);
 assert.equal(a.sellItemV43('blue',v.id,0).refund,1120);
 assert.equal(a.undoShopV453Dev61('blue',v.id).ok,true);
 assert.equal(a.effectResolverV41().has(v,'spell_shield'),true);
 assert.equal(v.gold,gold-1600);assert.equal(v.ap,ap+40);assert.equal(v.mr,mr+25);
 assert.equal(a.undoShopV453Dev61('blue',v.id).ok,true);
 assert.equal(v.gold,gold);assert.equal(v.ap,ap);assert.equal(v.mr,mr);
});
test('sair fisicamente da fonte invalida Undo para sempre, retorno não ressuscita histórico',()=>{
 const a=make(),u=hero(a);u.items=[];u.gold=10000;
 assert.equal(a.buy('blue',u.id,'edge_of_night'),true);
 const shop=a.map.objects.find(o=>o.id==='blue_spawn_shop'),off={x:shop.x+.1,y:shop.y};
 assert.ok(a.moveAlong(u,{path:[off],point:off,action:'move'},1500)>1125);
 assert.equal(u.shopUndoRevokedV453Dev61,true);
 a.moveAlong(u,{path:[shop],point:shop,action:'move'},1500);
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,false);
 assert.equal(u.gold,7000);assert.deepEqual(u.items,['edge_of_night']);
 assert.ok(a.buy('blue',u.id,'long_sword'));
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,true);
 assert.deepEqual(u.items,['edge_of_night']);
});
test('snapshot + reconexão preservam cooldown e equipe sem estado adversário',()=>{
 const a=make(),v=hero(a),e=hero(a,'red');v.items=[];v.gold=6000;
 a.buy('blue',v.id,'banshees_veil');a.damage(v,100,e,'magic','spell');a.gameTime=10;
 const snap=Arena.fromSnapshotV40(map,mask,a.snapshotV40());const u=hero(snap);
 assert.equal(u.itemAnnulReadyAtV453Dev69Batch2,40);assert.equal(snap.effectResolverV41().has(u,'spell_shield'),false);
 snap.gameTime=40;assert.equal(snap.effectResolverV41().has(u,'spell_shield'),true);
});
test('PvP duas sessões: sequências idempotentes, proprietário por equipe e checkpoint',()=>{
 const dir=mkdtempSync(join(tmpdir(),'coachlol-items-b2-'));
 try{
  const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:dir}),first=reg.create(),room=first.room,second=room.join();
  for(const [p,team,id] of [[first.player,'blue','verdant_barrier'],[second.player,'red','edge_of_night']]){
   const u=hero(room.arena,team,'MID');u.gold=9000;u.items=[];
   const cmd={sequence:1,unitId:u.id,kind:'item.buy',payload:{itemId:id}};
   assert.equal(room.command(p,cmd).ok,true);
   const g=u.gold;assert.equal(room.command(p,cmd).ok,true);assert.equal(u.gold,g);
  }
  assert.equal(room.command(first.player,{sequence:2,unitId:'red_MID',kind:'item.buy',payload:{itemId:'banshees_veil'}}).ok,false);
  assert.equal(room.command(second.player,{sequence:2,unitId:'blue_MID',kind:'item.sell',payload:{index:0}}).ok,false);
  const restored=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:dir}).get(room.id);
  assert.deepEqual(hero(restored.arena).items,['verdant_barrier']);
  assert.deepEqual(hero(restored.arena,'red').items,['edge_of_night']);
  assert.equal(restored.view(restored.authenticate(first.token)).nextSequence,2);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
console.log(`DEV69 B2 ${n}/${n} PASS`);