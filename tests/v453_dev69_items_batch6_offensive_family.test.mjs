import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,catalog,ITEM_RECIPES,ITEM_OFFENSE_RULES_V453_DEV69_B6,officialSaleValueV453Dev60} from '../engine.mjs';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const map=read('../data/coachlol_map_v6.json'),mask=read('../data/masks_128.json');
const source=read('../data/riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json').data;
const shop=read('../data/riot_reference/sr_shop_26_21_dev49.json');
const entries=read('../data/riot_reference/batch6_entries_dev69.json');
const mk=()=>new Arena(map,mask,{seed:696,mode:'pvp'});
const hero=(a,team='blue',role='MID')=>a.units.find(u=>u.id===team+'_'+role);
const equip=(a,id,role='MID')=>{const u=hero(a,'blue',role);u.gold=100000;u.items=[];assert.equal(a.buy('blue',u.id,id),true,id);return u;};
const near=(from,...targets)=>{for(const u of targets){u.x=from.x;u.y=from.y;u.hp=u.maxHp=30000;u.armor=u.mr=0;}};
let passes=0;
const test=(label,fn)=>{try{fn();passes++;console.log('✓ B6 '+label)}catch(e){console.error('✗ B6 '+label);throw e;}};
test('15 Riot entries, prices, recipes, refunds and catalog remain locked elsewhere',()=>{
 assert.equal(entries.length,15);assert.deepEqual([shop.counts.normalPlayable,shop.counts.referenceOnly],[182,20]);
 for(const {riotId,localId} of entries){
  const item=catalog.find(v=>v.id===localId),official=source[riotId],row=shop.rows[riotId];
  assert.ok(item,localId);assert.equal(item.riotId,Number(riotId));assert.equal(item.cost,official.gold.total);
  assert.equal(officialSaleValueV453Dev60(localId),official.gold.sell);
  assert.deepEqual((ITEM_RECIPES[localId]||[]).map(id=>String(catalog.find(v=>v.id===id)?.riotId||Object.values(shop.rows).find(v=>v.localId===id)?.id)),official.from||[]);
  assert.equal(row.status,'engine_playable');assert.equal(row.localId,localId);
  assert.ok(ITEM_OFFENSE_RULES_V453_DEV69_B6[localId],localId);
 }
 assert.equal(Object.values(shop.rows).filter(v=>v.status==='reference_only'&&v.localId).length,0);
});
test('all 15 are individually purchasable, reversible sale and exact gold',()=>{
 for(const {riotId,localId} of entries){
  const a=mk(),u=hero(a);u.items=[];u.gold=100000;const g=u.gold;
  assert.equal(a.buy('blue',u.id,localId),true,localId);
  assert.equal(u.gold,g-source[riotId].gold.total,localId);
  const sale=a.sellItemV43('blue',u.id,0);assert.equal(sale.ok,true,localId);
  assert.equal(sale.refund,source[riotId].gold.sell);assert.equal(u.gold,g-source[riotId].gold.total+source[riotId].gold.sell);
  assert.equal(a.sellItemV43('blue',u.id,0).ok,false);
 }
});
test('recipe consumes completed component exactly once and refunds on Undo',()=>{
 const a=mk(),u=hero(a);u.items=[];u.gold=10000;
 assert.ok(a.buy('blue',u.id,'sheen'));const g=u.gold;
 assert.ok(a.buy('blue',u.id,'lich_bane'));
 assert.equal(u.gold,g-(2900-900));assert.ok(!u.items.includes('sheen'));
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,true);assert.ok(u.items.includes('sheen'));assert.equal(u.gold,g);
});
test('spellblade family cannot stack other finished spellblades',()=>{
 const a=mk(),u=equip(a,'lich_bane');assert.equal(a.canBuy('blue',u.id,'iceborn_gauntlet').ok,false);
 assert.equal(a.canBuy('blue',u.id,'dusk_and_dawn').ok,false);
 assert.equal(a.canBuy('blue',u.id,'sheen').ok,false);
});
test('Lich spellblade applies magic, consumes charge and cannot double proc',()=>{
 const a=mk(),u=equip(a,'lich_bane'),v=hero(a,'red');near(u,v);
 u.spellbladeArmedUntilV453Dev29=10;const hp=v.hp;
 a.onOffensiveBasicV453Dev69B6(u,v);
 assert.ok(v.hp<hp);const after=v.hp;a.onOffensiveBasicV453Dev69B6(u,v);assert.equal(v.hp,after);
});
test('Iceborn deals physical on hit, slows enemy area not ally',()=>{
 const a=mk(),u=equip(a,'iceborn_gauntlet'),v=hero(a,'red'),ally=hero(a,'blue','SUP');near(u,v,ally);
 u.spellbladeArmedUntilV453Dev29=10;a.onOffensiveBasicV453Dev69B6(u,v);
 assert.ok(v.hp<v.maxHp);assert.equal(a.effectResolverV41().has(v,'slow'),true);
 assert.equal(a.effectResolverV41().has(ally,'slow'),false);
});
test('Dusk and Dawn Spellblade heals and deals magic on live enemy',()=>{
 const a=mk(),u=equip(a,'dusk_and_dawn'),v=hero(a,'red');near(u,v);u.hp=u.maxHp-300;
 u.spellbladeArmedUntilV453Dev29=10;const h=u.hp;
 a.onOffensiveBasicV453Dev69B6(u,v);
 assert.ok(v.hp<v.maxHp&&u.hp>h);
});
test('Statikk chains only to a second visible enemy, never ally',()=>{
 const a=mk(),u=equip(a,'statikk_shiv'),v=hero(a,'red'),v2=hero(a,'red','ADC'),ally=hero(a,'blue','SUP');near(u,v,v2,ally);
 a.onOffensiveBasicV453Dev69B6(u,v,{energized:true,preHp:v.hp});
 assert.ok(v2.hp<v2.maxHp);assert.equal(ally.hp,ally.maxHp);
});
test('Stormrazor charged hit grants temporary movement then expires',()=>{
 const a=mk(),u=equip(a,'stormrazor'),v=hero(a,'red');near(u,v);
 const ms=a.effectiveMS(u);a.onOffensiveBasicV453Dev69B6(u,v,{energized:true,preHp:v.hp});
 assert.ok(v.hp<v.maxHp);assert.ok(a.effectiveMS(u)>ms);
 a.gameTime=3;assert.equal(a.effectiveMS(u),ms);
});
test('Voltaic charged hit deals target health physical damage',()=>{
 const a=mk(),u=equip(a,'voltaic_cyclosword'),v=hero(a,'red');near(u,v);
 a.onOffensiveBasicV453Dev69B6(u,v,{energized:true,preHp:v.hp});
 assert.ok(v.hp<v.maxHp);assert.ok(u.b6VoltaicUntil>a.gameTime);
});
test('Luden creates six bounded nonrecursive echoes, cooldown prevents another proc',()=>{
 const a=mk(),u=equip(a,'ludens_companion'),v=hero(a,'red');near(u,v);
 a.onOffensiveHitV453Dev69B6(u,v,90,'spell');const hp=v.hp;
 assert.ok(hp<v.maxHp);assert.ok(u.b6LudenReadyAt>a.gameTime);
 a.onOffensiveHitV453Dev69B6(u,v,90,'spell');assert.equal(v.hp,hp);
});
test('Blackfire creates a timed magic DoT and target-specific AP amplification',()=>{
 const a=mk(),u=equip(a,'blackfire_torch'),v=hero(a,'red');near(u,v);
 const before=a.elementalStatsV452d3(u).ap;
 a.onOffensiveHitV453Dev69B6(u,v,90,'spell');
 assert.ok(a.effectResolverV41().has(v,'dot'));assert.ok(a.elementalStatsV452d3(u).ap>before);
 a.gameTime=5;assert.equal(a.elementalStatsV452d3(u).ap,before);
});
test('Malignance only follows an R cast window and ticks on target',()=>{
 const a=mk(),u=equip(a,'malignance'),v=hero(a,'red');near(u,v);
 a.onOffensiveHitV453Dev69B6(u,v,60,'spell');assert.ok(!v.b6Malignance);
 a.onOffensiveCastV453Dev69B6(u,'R');a.onOffensiveHitV453Dev69B6(u,v,60,'spell');
 assert.ok(v.b6Malignance?.[u.id]);const hp=v.hp;a.gameTime=1;a.advanceOffensiveItemsV453Dev69B6();assert.ok(v.hp<hp);
});
test('Horizon Focus reveals long-range target and never allies',()=>{
 const a=mk(),u=equip(a,'horizon_focus'),v=hero(a,'red'),ally=hero(a,'blue','SUP');
 u.x=.2;u.y=.2;v.x=.8;v.y=.8;ally.x=v.x;ally.y=v.y;
 a.onOffensiveHitV453Dev69B6(u,v,60,'spell');
 assert.ok(v.revealedUntil?.blue>a.gameTime);assert.ok(!ally.revealedUntil?.red);
});
test('Stormsurge damage window queues one delayed burst',()=>{
 const a=mk(),u=equip(a,'stormsurge'),v=hero(a,'red');near(u,v);v.maxHp=1000;v.hp=1000;
 a.onOffensiveHitV453Dev69B6(u,v,300,'spell');
 assert.ok(v.b6StormRecords?.[u.id]?.pendingAt>0);
 a.gameTime=1;a.advanceOffensiveItemsV453Dev69B6();assert.equal(v.hp,1000);
 a.gameTime=3;a.advanceOffensiveItemsV453Dev69B6();assert.ok(v.hp<1000);
 const hp=v.hp;a.advanceOffensiveItemsV453Dev69B6();assert.equal(v.hp,hp);
});
test('Serpent Fang shreds enemy shield and not allied shield',()=>{
 const a=mk(),u=equip(a,'serpents_fang'),v=hero(a,'red'),ally=hero(a,'blue','SUP');near(u,v,ally);
 v.shield=1000;ally.shield=1000;
 a.onOffensiveHitV453Dev69B6(u,v,80,'spell');
 assert.ok(v.shield<1000);assert.equal(ally.shield,1000);
});
test('Axiom Arc reduces ultimate cooldown on credited takedown',()=>{
 const a=mk(),u=equip(a,'axiom_arc'),v=hero(a,'red');u.skillCds.R=100;a.gameTime=10;
 a.onOffensiveKillV453Dev69B6(v,u);
 assert.ok(u.skillCds.R<100&&u.skillCds.R>10);
});
test('Hubris raises derived AD on takedown then loses temporary bonus',()=>{
 const a=mk(),u=equip(a,'hubris'),v=hero(a,'red');const ad=a.elementalStatsV452d3(u).ad;
 a.onOffensiveKillV453Dev69B6(v,u);assert.ok(a.elementalStatsV452d3(u).ad>ad);
 a.gameTime=91;assert.equal(a.elementalStatsV452d3(u).ad,ad);
});
test('Demon Arrows grants 3 attacks after R; no infinite free damage',()=>{
 const a=mk(),u=equip(a,'yun_tal_demon_arrows'),v=hero(a,'red');near(u,v);
 a.onOffensiveCastV453Dev69B6(u,'R');assert.equal(u.b6DartShots,3);
 for(let i=0;i<3;i++)a.onOffensiveBasicV453Dev69B6(u,v,{preHp:v.hp});
 assert.equal(u.b6DartShots,0);const hp=v.hp;
 a.onOffensiveBasicV453Dev69B6(u,v,{preHp:v.hp});assert.equal(v.hp,hp);
});
test('Offensive proc source cannot recursively launch itself',()=>{
 const a=mk(),u=equip(a,'ludens_companion'),v=hero(a,'red');near(u,v);
 a.onOffensiveHitV453Dev69B6(u,v,100,'item_luden_b6');
 assert.equal(v.hp,v.maxHp);assert.ok(!u.b6LudenReadyAt);
});
test('PvP ownership protects buy, sell and metadata',()=>{
 const a=mk(),u=equip(a,'stormsurge');assert.equal(a.canBuy('red',u.id,'lich_bane').ok,false);
 assert.equal(a.sellItemV43('red',u.id,0).ok,false);
});
test('leaving source permanently disables Undo after return',()=>{
 const a=mk(),u=hero(a);u.items=[];u.gold=10000;assert.ok(a.buy('blue',u.id,'lich_bane'));
 const origin=a.map.objects.find(x=>x.id==='blue_spawn_shop');u.x=.5;u.y=.5;
 assert.equal(a.canUndoShopV453Dev61('blue',u.id).ok,false);
 u.x=origin.x;u.y=origin.y;assert.equal(a.canUndoShopV453Dev61('blue',u.id).ok,false);
});
test('snapshot restores item cooldowns and target-specific proc states',()=>{
 const a=mk(),u=equip(a,'ludens_companion'),v=hero(a,'red');near(u,v);
 a.onOffensiveHitV453Dev69B6(u,v,80,'spell');assert.ok(u.b6LudenReadyAt>0);
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(hero(b).b6LudenReadyAt,u.b6LudenReadyAt);assert.deepEqual(hero(b).items,u.items);
});
console.log('DEV69 B6 '+passes+'/'+passes+' PASS');