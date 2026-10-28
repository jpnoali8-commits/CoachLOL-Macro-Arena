import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,catalog,ITEM_RECIPES,ITEM_REMAINDER_RULES_V453_DEV69_B7,officialSaleValueV453Dev60} from '../engine.mjs';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const map=read('../data/coachlol_map_v6.json'),mask=read('../data/masks_128.json');
const source=read('../data/riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json').data;
const shop=read('../data/riot_reference/sr_shop_26_21_dev49.json');
const entries=read('../data/riot_reference/batch7_entries_dev69.json');
const mk=()=>new Arena(map,mask,{seed:697,mode:'pvp'});
const hero=(a,team='blue',role='MID')=>a.units.find(u=>u.id===team+'_'+role);
const equip=(a,id,team='blue',role='MID')=>{const u=hero(a,team,role);u.gold=100000;u.level=12;u.items=[];assert.equal(a.buy(team,u.id,id),true,id);return u;};
const near=(a,b)=>{b.x=a.x;b.y=a.y;b.hp=b.maxHp=20000;b.armor=b.mr=0;};
let count=0;
const test=(label,run)=>{try{run();count++;console.log('✓ B7 '+label)}catch(e){console.error('✗ B7 '+label);throw e;}};
test('20 Riot entries resolved 202/202 normal SR and no source records lost',()=>{
 assert.equal(entries.length,20);assert.equal(shop.counts.normalPlayable,202);assert.equal(shop.counts.referenceOnly,0);
 assert.equal(Object.values(shop.rows).filter(x=>x.status==='engine_playable').length,202);
 for(const {riotId,localId} of entries){
  const item=catalog.find(x=>x.id===localId),riot=source[riotId],row=shop.rows[riotId];
  assert.ok(item,localId);assert.equal(item.riotId,Number(riotId));assert.equal(item.cost,riot.gold.total);
  assert.equal(officialSaleValueV453Dev60(localId),riot.gold.sell);
  assert.equal(row.localId,localId);assert.equal(row.status,'engine_playable');
  if(localId!=='trinket_farsight'){
   assert.ok(ITEM_REMAINDER_RULES_V453_DEV69_B7[localId],localId);
   const ids=(ITEM_RECIPES[localId]||[]).map(part=>String(catalog.find(i=>i.id===part)?.riotId||Object.values(shop.rows).find(v=>v.localId===part)?.id));
   assert.deepEqual(ids,riot.from||[],localId);
  }
 }
});
test('quest requires 1350 points and progress belongs only to actual MID role',()=>{
 const a=mk(),u=hero(a),top=hero(a,'blue','TOP'),enemyMid=hero(a,'red');
 assert.equal(a.b7MidQuestAdd(top,1350),0);assert.equal(top.b7MidQuestComplete,undefined);
 assert.equal(a.b7MidQuestAdd(u,1349),1349);assert.ok(!u.b7MidQuestComplete);
 assert.equal(a.b7MidQuestAdd(u,1),1);assert.equal(u.b7MidQuestComplete,true);
 assert.equal(a.b7MidQuestAdd(enemyMid,0),0);assert.ok(!enemyMid.b7MidQuestComplete);
});
test('all seven Tier 3 boots are unpurchasable even after quest completion',()=>{
 const a=mk(),u=hero(a);u.gold=999999;u.level=15;
 a.b7MidQuestAdd(u,1350);
 for(const id of ['immortal_journey','swift_march','scarlet_lucidity','war_greaves','chained_crushers','armored_mobilization','enchanted_footwear']){
  assert.equal(a.canBuy('blue',u.id,id).ok,false,id);
  assert.equal(a.buy('blue',u.id,id),false,id);
 }
});
test('MID equipped Tier 2 boots evolve free at quest completion, cost/slot immutable',()=>{
 const a=mk(),u=equip(a,'berserkers_greaves'),before=u.gold;
 assert.equal(u.items.filter(i=>i==='berserkers_greaves').length,1);
 a.b7MidQuestAdd(u,1350);assert.equal(u.items.includes('war_greaves'),true);
 assert.equal(u.items.includes('berserkers_greaves'),false);assert.equal(u.items.length,1);assert.equal(u.gold,before);
 assert.equal(u.shopUndoV453Dev61?.length||0,0);
});
test('MID buys tier 2 after quest: immediate free tier 3, no duplicate stats',()=>{
 const a=mk(),u=hero(a);u.gold=100000;u.level=12;
 a.b7MidQuestAdd(u,1350);const start=u.gold;
 assert.equal(a.buy('blue',u.id,'sorcerers_shoes'),true);
 assert.equal(u.items.includes('enchanted_footwear'),true);assert.equal(u.items.length,1);
 assert.equal(u.gold,start-catalog.find(i=>i.id==='sorcerers_shoes').cost);
});
test('TOP JG ADC SUP never inherit MID boot reward from teammate',()=>{
 const a=mk(),mid=hero(a);a.b7MidQuestAdd(mid,1350);
 for(const role of ['TOP','JG','ADC','SUP']){
  const u=hero(a,'blue',role);
  assert.equal(u.b7MidQuestComplete,undefined);assert.equal(a.b7MidBootUpgrade(u),false);
  assert.equal(a.canBuy('blue',u.id,'swift_march').ok,false);
 }
});
test('MID champion damage contributes to quest, item child hits do not',()=>{
 const a=mk(),mid=hero(a),target=hero(a,'red');near(mid,target);
 const hp=target.hp;a.damage(target,1000,mid,'true','spell');
 assert.ok(target.hp<hp);assert.ok(mid.b7MidQuestPoints>=14);
 const points=mid.b7MidQuestPoints;
 a.damage(target,100,mid,'true','item_rocketbelt_b7');
 assert.equal(mid.b7MidQuestPoints,points);
});
test('MID passive ticks only once per simulated second and works in lane',()=>{
 const a=mk(),u=hero(a);
 const path=a.lanes.mid.path;const point=path[Math.floor(path.length/2)];u.x=point.x;u.y=point.y;
 a.gameTime=65;u.b7MidQuestLastTick=64;a.b7MidQuestPassive();
 assert.ok((u.b7MidQuestPoints||0)>0);
 const before=u.b7MidQuestPoints;a.b7MidQuestPassive();assert.equal(u.b7MidQuestPoints,before);
});
test('elixirs cannot be purchased under lvl 9 and are single-use 180 s',()=>{
 const a=mk(),u=hero(a);u.gold=100000;u.level=8;
 assert.equal(a.canBuy('blue',u.id,'elixir_of_iron').ok,false);
 u.level=9;assert.equal(a.buy('blue',u.id,'elixir_of_iron'),true);
 const originalHp=u.maxHp,originalGold=u.gold;
 const res=a.activateItemV453Dev59('blue',u.id,'elixir_of_iron');
 assert.ok(res.ok);assert.equal(u.items.includes('elixir_of_iron'),false);
 assert.equal(u.maxHp,originalHp+300);assert.equal(u.gold,originalGold);
 assert.equal(a.activateItemV453Dev59('blue',u.id,'elixir_of_iron').ok,false);
 a.gameTime=181;a.advanceRemainderItemsV453Dev69B7();assert.equal(u.maxHp,originalHp);
});
test('sorcery consumable empowered true hit is per-target cooldown',()=>{
 const a=mk(),u=equip(a,'elixir_of_sorcery'),v=hero(a,'red');near(u,v);
 assert.ok(a.activateItemV453Dev59('blue',u.id,'elixir_of_sorcery').ok);
 const hp=v.hp;a.onRemainderHitV453Dev69B7(u,v,100,'magic','spell');assert.ok(v.hp<hp);
 const after=v.hp;a.onRemainderHitV453Dev69B7(u,v,100,'magic','spell');assert.equal(v.hp,after);
});
test('Actualizer active has cooldown and buffs are temporary',()=>{
 const a=mk(),u=equip(a,'actualizer');
 const result=a.activateItemV453Dev59('blue',u.id,'actualizer');
 assert.equal(result.ok,true);assert.ok(u.b7ActualizerUntil>a.gameTime);
 assert.equal(a.activateItemV453Dev59('blue',u.id,'actualizer').ok,false);
 a.gameTime=9;assert.ok(u.b7ActualizerUntil<a.gameTime);
});
test('Bastion skill proc executes once per cooldown, no recursion',()=>{
 const a=mk(),u=equip(a,'bastionbreaker'),v=hero(a,'red');near(u,v);
 a.onRemainderHitV453Dev69B7(u,v,100,'physical','spell');assert.ok(v.hp<v.maxHp);
 const after=v.hp;a.onRemainderHitV453Dev69B7(u,v,100,'physical','spell');assert.equal(v.hp,after);
});
test('Voracious boots increase temporary vamp only after credited takedown',()=>{
 const a=mk(),u=equip(a,'voracious_greaves'),v=hero(a,'red');
 const before=a.b7DerivedStats(u).omnivamp;
 a.onRemainderKillV453Dev69B7(v,u);assert.ok(a.b7DerivedStats(u).omnivamp>before);
});
test('Protoplasm grants temporary max health only at threshold',()=>{
 const a=mk(),victim=equip(a,'protoplasm_harness','red'),attacker=hero(a);
 near(attacker,victim);victim.hp=victim.maxHp*.35;const original=victim.maxHp;
 a.damage(victim,victim.maxHp*.1,attacker,'physical','spell');
 assert.ok(victim.b7ProtoplasmUntil>a.gameTime);
 assert.equal(victim.maxHp,original+ITEM_REMAINDER_RULES_V453_DEV69_B7.protoplasm_harness.bonusHp);
 a.gameTime=6;a.advanceRemainderItemsV453Dev69B7();assert.equal(victim.maxHp,original);
});
test('Umbra reveals enemy stealth ward locally, not allied control ward',()=>{
 const a=mk(),u=equip(a,'umbral_glaive');
 const enemy={id:'b7_ward_red',team:'red',owner:'red_SUP',type:'stealth',x:u.x,y:u.y,hp:3,until:a.gameTime+200,createdAt:a.gameTime};
 a.wards.push(enemy);a.advanceRemainderItemsV453Dev69B7();
 assert.ok(enemy.riftRevealedByV452d4?.blue>a.gameTime);
 assert.equal(enemy.riftRevealedByV452d4?.red,undefined);
});
test('snapshot retains MID quest state and upgrade, independent per team',()=>{
 const a=mk(),mid=equip(a,'swifties');
 a.b7MidQuestAdd(mid,1350);
 const snap=a.snapshotV40(),restored=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(hero(restored).b7MidQuestComplete,true);assert.equal(hero(restored).b7MidQuestPoints,1350);
 assert.ok(hero(restored).items.includes('swift_march'));assert.ok(!hero(restored,'red').b7MidQuestComplete);
});
test('PvP ownership preserves enemy shop, elixir, upgrade and passive mission state',()=>{
 const a=mk(),u=equip(a,'elixir_of_wrath'),op=hero(a,'red');
 assert.equal(a.activateItemV453Dev59('red',u.id,'elixir_of_wrath').ok,false);
 assert.equal(a.canBuy('red',u.id,'elixir_of_iron').ok,false);
 a.b7MidQuestAdd(u,1350);assert.equal(op.b7MidQuestPoints||0,0);
});
console.log('DEV69 B7 '+count+'/'+count+' PASS');
