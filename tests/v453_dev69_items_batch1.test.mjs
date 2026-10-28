import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Arena,catalog,ITEM_RECIPES,ITEM_EFFECTS_V43,officialSaleValueV453Dev60,recipePurchasePartsV453Dev30} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
const source=read('riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json').data;
const sr=read('riot_reference/sr_shop_26_21_dev49.json');
const create=()=>new Arena(map,mask,{seed:69,mode:'pvp'});
const champ=(a,team='blue',role='MID')=>a.units.find(u=>u.id===team+'_'+role);
let checks=0;
const check=(name,fn)=>{fn();checks++;console.log('✓ DEV69 ITENS: '+name);};
check('Auditoria estática 16.21.1: preço, gold.sell, atributos, receita e IDs promovidos',()=>{
 for(const [id,local] of [['1083','cull'],['3036','lord_dominiks_regards']]){
  const raw=source[id],entry=catalog.find(i=>i.id===local);
  assert.equal(sr.rows[id].status,'engine_playable');assert.ok(entry,local);assert.equal(entry.riotId,Number(id));
  assert.equal(entry.cost,raw.gold.total);assert.equal(officialSaleValueV453Dev60(local),raw.gold.sell);
  assert.deepEqual((ITEM_RECIPES[local]||[]).map(x=>Object.values(sr.rows).find(i=>i.localId===x)?.id).sort(),(raw.from||[]).slice().sort());
  assert.ok(ITEM_EFFECTS_V43[local]);
 }
 const c=catalog.find(x=>x.id==='cull'),l=catalog.find(x=>x.id==='lord_dominiks_regards');
 assert.equal(c.stats.ad,7);assert.equal(l.stats.ad,35);assert.equal(l.stats.critChance,25);assert.equal(l.stats.armorPenPercent,35);
 assert.equal(ITEM_EFFECTS_V43.cull.healOnHit,3);assert.equal(ITEM_EFFECTS_V43.lord_dominiks_regards.maxBonusFraction,.15);
 assert.equal(sr.counts.normalPlayable,107);assert.equal(sr.counts.referenceOnly,95);
});
check('Abatedora: ataque válido cura 3; spell e aliado não disparam',()=>{
 const a=create(),u=champ(a);u.items=[];u.gold=3000;assert.equal(a.buy(u.team,u.id,'cull'),true);
 const opponent=champ(a,'red');opponent.hp=opponent.maxHp;u.hp=100;
 a.damage(opponent,40,u,'physical','basic');assert.equal(u.hp,103);
 a.damage(opponent,40,u,'magic','spell');assert.equal(u.hp,103);
 a.damage(champ(a,'blue','TOP'),40,u,'physical','basic');assert.equal(u.hp,103);
 assert.equal(u.cullMinionsV453Dev69,0);
});
check('Abatedora: 100 last-hits concedem 100×1 + 350 uma vez; sem replay de alvo morto',()=>{
 const a=create(),u=champ(a);u.items=[];u.gold=3000;assert.equal(a.buy('blue',u.id,'cull'),true);
 const before=u.gold;
 for(let i=0;i<101;i++){
  const creep={id:'m_dev69_'+i,kind:'caster',team:'red',lane:'mid',hp:2,maxHp:2,armor:0,mr:0,shield:0,x:u.x,y:u.y,progress:0,spawnWaveV452c:1};
  a.damage(creep,500,u,'physical','basic');
  if(i===0){const after=u.gold;a.damage(creep,500,u,'physical','basic');assert.equal(u.gold,after);}
 }
 assert.equal(u.cs,101);assert.equal(u.cullMinionsV453Dev69,100);
 assert.equal(u.gold-before,101*14+450);
 assert.equal((u.economyLedgerV43||[]).filter(x=>x.kind==='cull').reduce((n,x)=>n+x.delta,0),450);
});
check('Abatedora: revenda oficial, restauração do progresso e bloqueio de loja inimiga',()=>{
 const a=create(),u=champ(a);u.items=[];u.gold=2000;
 assert.ok(a.buy('blue',u.id,'cull'));assert.equal(u.gold,1550);
 u.cullMinionsV453Dev69=29;const sale=a.sellItemV43('blue',u.id,0);
 assert.equal(sale.refund,180);assert.equal(u.cullMinionsV453Dev69,0);
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,true);
 assert.equal(u.cullMinionsV453Dev69,29);assert.equal(u.gold,1550);
 assert.equal(a.canBuy('red',u.id,'cull').ok,false);
});
check('Lorde Dominik: receita, desconto, penetração e Mata-Gigantes crescente/cap',()=>{
 const a=create(),u=champ(a);u.gold=12000;u.items=[];const t=champ(a,'red');t.items=[];
 assert.ok(a.buy('blue',u.id,'last_whisper'));assert.ok(a.buy('blue',u.id,'noonquiver'));
 assert.deepEqual(recipePurchasePartsV453Dev30('lord_dominiks_regards',u.items).sort(),['last_whisper','noonquiver']);
 assert.equal(a.itemPurchaseCost(u,'lord_dominiks_regards'),550);
 assert.ok(a.buy('blue',u.id,'lord_dominiks_regards'));assert.deepEqual(u.items,['lord_dominiks_regards']);
 assert.equal(u.armorPenPercent,35);
 t.armor=100;t.maxHp=10000;t.hp=10000;
 const plain=a.damage(t,100,u,'physical','spell');t.hp=10000;
 t.items=['giants_belt','giants_belt','giants_belt','giants_belt','giants_belt'];
 const capped=a.damage(t,100,u,'physical','spell');assert.ok(capped>plain);
 t.hp=10000;t.items=['giants_belt'];
 const partial=a.damage(t,100,u,'physical','spell');assert.ok(partial>plain&&partial<capped);
 assert.ok(a.sellItemV43('blue',u.id,0).ok);assert.equal(u.armorPenPercent,0);
});
check('Lorde Dominik: exclusividade Fatalidade, snapshot, Undo',()=>{
 const a=create(),u=champ(a);u.gold=10000;u.items=[];
 assert.ok(a.buy('blue',u.id,'mortal_reminder'));
 assert.equal(a.canBuy('blue',u.id,'lord_dominiks_regards').ok,false);
 assert.equal(a.sellItemV43('blue',u.id,0).ok,true);
 assert.ok(a.buy('blue',u.id,'lord_dominiks_regards'));
 assert.equal(a.canBuy('blue',u.id,'mortal_reminder').ok,false);
 const restored=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(champ(restored).armorPenPercent,35);
 assert.equal(restored.undoShopV453Dev61('blue',u.id).ok,true);
 assert.equal(champ(restored).armorPenPercent,0);
});
check('Desfazer: saída física da fonte revoga operações anteriores permanentemente',()=>{
 const a=create(),u=champ(a);u.gold=2000;u.items=[];assert.ok(a.buy('blue',u.id,'cull'));
 const shop=a.map.objects.find(x=>x.id==='blue_spawn_shop'),outside={x:shop.x+.1,y:shop.y};
 assert.ok(a.moveAlong(u,{path:[outside],point:outside,action:'move'},1500)>1125);
 assert.equal(u.shopUndoRevokedV453Dev61,true);
 a.moveAlong(u,{path:[shop],point:shop,action:'move'},1500);
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,false);
 assert.ok(a.buy('blue',u.id,'long_sword'));
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,true);
 assert.deepEqual(u.items,['cull']);
});
check('PvP: dois humanos cinco campeões cada, proteção inimiga, checkpoint, replay idempotente',()=>{
 const dir=mkdtempSync(join(tmpdir(),'dev69-items-'));
 try{
  const registry=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:dir}),first=registry.create(),room=first.room,second=room.join();
  for(const [player,team] of [[first.player,'blue'],[second.player,'red']]){
   const u=champ(room.arena,team,'ADC');u.gold=4000;u.items=[];
   const cmd={sequence:1,kind:'item.buy',unitId:u.id,payload:{itemId:'cull'}};
   assert.equal(room.command(player,cmd).ok,true);assert.equal(u.gold,3550);
   assert.equal(room.command(player,cmd).ok,true);assert.equal(u.gold,3550);
   assert.equal(room.command(player,{...cmd,payload:{itemId:'lord_dominiks_regards'}}).ok,false);
  }
  assert.equal(room.command(first.player,{sequence:2,kind:'item.buy',unitId:'red_ADC',payload:{itemId:'cull'}}).ok,false);
  const restored=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:dir}).get(room.id);
  assert.ok(restored);assert.equal(champ(restored.arena,'blue','ADC').gold,3550);
  assert.equal(champ(restored.arena,'red','ADC').gold,3550);
  assert.equal(restored.view(restored.authenticate(first.token)).nextSequence,2);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
console.log('DEV69 ITENS '+checks+'/'+checks+' PASS');
