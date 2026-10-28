import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,catalog,ITEM_RECIPES,ITEM_FAMILY_RULES_V453_DEV69,officialSaleValueV453Dev60,recipePurchasePartsV453Dev30} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const riot=read('riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json').data;
const sr=read('riot_reference/sr_shop_26_21_dev49.json');
const make=()=>new Arena(map,mask,{seed:693,mode:'pvp'});
const hero=(a,team='blue',role='MID')=>a.units.find(u=>u.id===team+'_'+role);
const equip=(a,id,team='blue',role='MID')=>{const u=hero(a,team,role);u.items=[];u.gold=30000;assert.equal(a.buy(team,u.id,id),true,'buy '+id);return u};
const specs=[['6609','chempunk_chainsword'],['6694','seryldas_grudge'],['4645','shadowflame'],['6676','the_collector'],['8020','abyssal_mask'],['4629','cosmic_drive'],['2501','overlords_bloodmail'],['4633','riftmaker'],['6653','liandrys_torment'],['8010','bloodletters_curse'],['2504','kaenic_rookern'],['3156','maw_of_malmortius'],['6673','immortal_shieldbow'],['3053','steraks_gage'],['4401','force_of_nature']];
let count=0;
const test=(title,fn)=>{try{fn();count++;console.log('✓ BULK '+title)}catch(e){console.error('✗ BULK '+title);throw e;}};
test('15 Riot items: IDs, exact prices/sales, recipes, available catalog statuses',()=>{
 const mapIds=new Map(catalog.filter(x=>x.riotId).map(x=>[String(x.riotId),x.id]));
 const known={'1011':'giants_belt','1018':'agility_cloak','1028':'ruby_crystal','1037':'pickaxe','1057':'negatron_cloak','1058':'needless_rod','2021':'tunneler','2508':'fated_ashes','3035':'last_whisper','3066':'winged_moonplate','3067':'kindlegem','3108':'fiendish_codex','3113':'aether_wisp','3123':'executioners_calling','3133':'caulfields_warhammer','3134':'serrated_dirk','3145':'hextech_alternator','3147':'haunting_guise','3155':'hexdrinker','3211':'spectres_cowl','6670':'noonquiver'};for(const [k,v] of Object.entries(known))mapIds.set(k,v);
 assert.equal(sr.counts.normalPlayable,122);assert.equal(sr.counts.referenceOnly,80);
 for(const [id,local] of specs){const row=riot[id],item=catalog.find(i=>i.id===local);assert.ok(item,local);
  assert.equal(item.riotId,+id);assert.equal(item.cost,row.gold.total);assert.equal(officialSaleValueV453Dev60(local),row.gold.sell);
  assert.deepEqual(ITEM_RECIPES[local],(row.from||[]).map(x=>mapIds.get(x)),local+' components');
  assert.equal(sr.rows[id].localId,local);assert.equal(sr.rows[id].status,'engine_playable');
 }
 for(const r of Object.values(sr.rows))if(r.status==='reference_only')assert.equal(r.localId,null);
});
test('components discount and exact sell, no duplicate gold via repeated sale',()=>{
 const a=make(),u=hero(a);u.items=[];u.gold=10000;
 assert.equal(a.buy('blue',u.id,'serrated_dirk'),true);
 const cost=a.itemPurchaseCost(u,'the_collector');assert.equal(cost,riot['6676'].gold.total-catalog.find(x=>x.id==='serrated_dirk').cost);
 const prior=u.gold;assert.equal(a.buy('blue',u.id,'the_collector'),true);assert.equal(u.gold,prior-cost);
 assert.equal(u.items.filter(x=>x==='serrated_dirk').length,0);
 const sale=a.sellItemV43('blue',u.id,0);assert.equal(sale.refund,riot['6676'].gold.sell);
 assert.equal(a.sellItemV43('blue',u.id,0).ok,false);
});
test('Chempunk: physical damage applies grievous wounds; not magic',()=>{
 const a=make(),u=equip(a,'chempunk_chainsword'),v=hero(a,'red');
 a.damage(v,90,u,'magic','spell');assert.equal(a.effectResolverV41().has(v,'grievous_wounds'),false);
 a.damage(v,80,u,'physical','basic');assert.equal(a.effectResolverV41().has(v,'grievous_wounds'),true);
});
test('Serylda: spell slows champions below 50% health, physical basics do not',()=>{
 const a=make(),u=equip(a,'seryldas_grudge'),v=hero(a,'red');v.hp=v.maxHp*.40;
 a.damage(v,40,u,'physical','basic');assert.equal(a.effectResolverV41().has(v,'slow'),false);
 a.damage(v,40,u,'physical','spell');assert.equal(a.effectResolverV41().has(v,'slow'),true);
 assert.equal(a.canBuy('blue',u.id,'lord_dominiks_regards').ok,false);
});
test('Shadowflame: magic damage is amplified below 40%, physical unaffected',()=>{
 const a=make(),u=equip(a,'shadowflame'),v=hero(a,'red');v.mr=0;v.armor=0;
 const get=()=>{v.hp=v.maxHp*.30;return a.damage(v,100,u,'magic','spell')};
 const boosted=get();u.items=[];const normal=get();assert.ok(boosted>normal,{boosted,normal});
});
test('Collector: executes enemy below 5%, awards 1 kill and +25g once',()=>{
 const a=make(),u=equip(a,'the_collector'),v=hero(a,'red');v.armor=0;v.hp=v.maxHp*.06;
 const oldGold=u.gold,oldKills=u.kills,oldDeaths=v.deaths;
 const direct=a.damage(v,30,u,'physical','basic');assert.ok(direct>0);
 assert.equal(v.hp,0);assert.equal(u.kills,oldKills+1);assert.equal(v.deaths,oldDeaths+1);
 assert.ok(u.economyLedgerV43.some(x=>x.kind==='collector'&&x.delta===25));
 assert.equal(a.damage(v,30,u,'physical','basic'),0);
 assert.equal(v.deaths,oldDeaths+1);
});
test('Abyssal: ally aura near enemy empowers magic damage, not physical',()=>{
 const a=make(),u=hero(a),v=hero(a,'red'),support=equip(a,'abyssal_mask','blue','SUP');
 support.x=v.x;support.y=v.y;u.items=[];v.mr=0;v.armor=0;
 v.hp=v.maxHp;const amp=a.damage(v,100,u,'magic','spell');support.items=[];
 v.hp=v.maxHp;const normal=a.damage(v,100,u,'magic','spell');assert.ok(amp>normal,{amp,normal});
});
test('Cosmic Drive: magic contact gives temporary MS only to holder',()=>{
 const a=make(),u=equip(a,'cosmic_drive'),v=hero(a,'red');const before=a.effectiveMS(u);
 a.damage(v,50,u,'physical','basic');assert.equal(a.effectiveMS(u),before);
 a.damage(v,50,u,'magic','spell');assert.ok(a.effectiveMS(u)>before);
 a.gameTime+=5;assert.equal(a.effectiveMS(u),before);
});
test('Overlord: bonus max health becomes AD and missing HP increases AD, sale removes',()=>{
 const a=make(),u=hero(a);u.items=[];u.gold=9000;const base=a.elementalStatsV452d3(u).ad;
 assert.equal(a.buy('blue',u.id,'overlords_bloodmail'),true);const full=a.elementalStatsV452d3(u).ad;
 assert.ok(full>=base+30+550*.025-1);u.hp=u.maxHp*.25;
 assert.ok(a.elementalStatsV452d3(u).ad>full);
 const sale=a.sellItemV43('blue',u.id,0);assert.ok(sale.ok);assert.ok(a.elementalStatsV452d3(u).ad<full);
});
test('Riftmaker: health -> AP, champion combat amp ramps without item recursion',()=>{
 const a=make(),u=equip(a,'riftmaker'),v=hero(a,'red');v.mr=0;
 assert.ok(a.elementalStatsV452d3(u).ap-u.ap>0);
 a.damage(v,100,u,'magic','spell');a.gameTime+=4;v.hp=v.maxHp;
 const amp=a.damage(v,100,u,'magic','spell');u.items=[];v.hp=v.maxHp;
 const plain=a.damage(v,100,u,'magic','spell');assert.ok(amp>plain,{amp,plain});
});
test('Liandry: damaging ability produces timed burn with authoritative source',()=>{
 const a=make(),u=equip(a,'liandrys_torment'),v=hero(a,'red');
 a.damage(v,80,u,'magic','spell');assert.ok(a.effectResolverV41().has(v,'dot'));
 const dot=v.statusEffectsV41.find(x=>x.key==='liandry_'+u.id);
 assert.equal(dot.damageType,'magic');assert.ok(dot.power>0);assert.ok(dot.until>a.gameTime);
});
test('Bloodletter: four independent magical casts cap MR shred, expire after 6s',()=>{
 const a=make(),u=equip(a,'bloodletters_curse'),v=hero(a,'red');v.hp=10000;v.maxHp=10000;
 for(let i=0;i<6;i++){a.damage(v,20,u,'magic','spell');a.gameTime++}
 assert.equal(v.bloodletterShredV453Dev69.stacks,4);
 a.gameTime+=7;assert.ok(v.bloodletterShredV453Dev69.until<a.gameTime);
});
test('Kaenic: 15% maxHP magic shield, timer on hit, physical bypass, full recharge',()=>{
 const a=make(),u=equip(a,'kaenic_rookern'),v=hero(a,'red');
 a.gameTime+=15;a.refreshKaenicShieldV453Dev69(u);
 let shield=u.statusEffectsV41.find(x=>x.key==='kaenic_v453_dev69');assert.ok(shield?.power>0);
 const before=shield.power;a.damage(u,80,v,'physical','basic');assert.equal(shield.power,before);
 a.damage(u,80,v,'magic','spell');assert.ok(shield.power<before);assert.equal(u.kaenicReadyAtV453Dev69,a.gameTime+15);
 a.gameTime+=15;a.refreshKaenicShieldV453Dev69(u);assert.ok(shield.power>=before);
});
test('Maw lifeline: magic-only shield absorbs triggering hit and preserves cooldown',()=>{
 const a=make(),u=equip(a,'maw_of_malmortius'),v=hero(a,'red');u.hp=u.maxHp*.31;
 const before=u.hp;a.damage(u,100,v,'magic','spell');assert.equal(u.hp,before);
 assert.ok(u.lifelineReadyAtV453Dev69>=a.gameTime+90);assert.ok(u.mawVampUntilV453Dev69>a.gameTime);
 assert.equal(a.canBuy('blue',u.id,'immortal_shieldbow').ok,false);
});
test('Shieldbow lifeline: absorbs the activating hit; cooldown/sale preserve gold',()=>{
 const a=make(),u=equip(a,'immortal_shieldbow'),v=hero(a,'red');u.hp=u.maxHp*.31;
 const before=u.hp;a.damage(u,80,v,'physical','basic');assert.equal(u.hp,before);
 assert.ok(u.statusEffectsV41.some(x=>x.key==='lifeline_v453_dev69'));
 assert.equal(a.sellItemV43('blue',u.id,0).refund,2100);
 assert.equal(a.effectResolverV41().has(u,'shield'),false);
});
test('Sterak: bonus AD from base, 20 tenacity, shield scales with bonus HP',()=>{
 const a=make(),u=hero(a);u.items=[];u.gold=8000;const ad=a.elementalStatsV452d3(u).ad;
 assert.ok(a.buy('blue',u.id,'steraks_gage'));assert.ok(a.elementalStatsV452d3(u).ad>ad);assert.ok(u.tenacity>=20);
 u.hp=u.maxHp*.31;const v=hero(a,'red');a.damage(u,90,v,'physical','basic');
 assert.ok(u.lifelineReadyAtV453Dev69>a.gameTime);
});
test('Force of Nature: 8 different magic hits trigger +70 MR and +6% MS',()=>{
 const a=make(),u=equip(a,'force_of_nature'),v=hero(a,'red');u.maxHp=20000;u.hp=u.maxHp;
 const baseMR=a.elementalStatsV452d3(u).mr,baseMS=a.effectiveMS(u);
 for(let i=0;i<8;i++)a.damage(u,40,v,'magic','spell');
 assert.equal(u.forceNatureStacksV453Dev69,8);assert.ok(a.elementalStatsV452d3(u).mr>=baseMR+70);
 assert.ok(a.effectiveMS(u)>baseMS);a.gameTime+=6;assert.equal(a.elementalStatsV452d3(u).mr,baseMR);
});
test('Riftmaker + Maw: vamp heals only while the appropriate item condition is active',()=>{
 const a=make(),u=equip(a,'riftmaker'),v=hero(a,'red');u.hp=u.maxHp*.5;v.hp=v.maxHp;
 a.damage(v,50,u,'magic','spell');a.gameTime+=4;
 const before=u.hp;a.damage(v,80,u,'magic','spell');assert.ok(u.hp>before,'Riftmaker vamp not applied');
 const b=make(),w=equip(b,'maw_of_malmortius'),r=hero(b,'red');w.hp=w.maxHp*.31;
 b.damage(w,100,r,'magic','spell');const prior=w.hp;b.damage(r,100,w,'physical','basic');
 assert.ok(w.hp>prior,'Maw vamp not applied');
});
test('Kaenic purchase requires 15 seconds without incoming magic before the first shield',()=>{
 const a=make(),u=equip(a,'kaenic_rookern'),v=hero(a,'red');
 assert.equal(u.kaenicReadyAtV453Dev69,a.gameTime+15);
 a.damage(u,45,v,'magic','spell');assert.equal(a.effectResolverV41().list(u).some(x=>x.key==='kaenic_v453_dev69'),false);
 a.gameTime+=15;
 assert.ok(a.effectResolverV41().list(u).some(x=>x.key==='kaenic_v453_dev69'));
});
test('Undo in fountain restores complete reactive item state and money',()=>{
 const a=make(),u=hero(a);u.items=[];u.gold=5000;const g=u.gold;
 assert.equal(a.buy('blue',u.id,'shadowflame'),true);
 const x=a.undoShopV453Dev61('blue',u.id);assert.ok(x.ok);assert.equal(u.items.length,0);assert.equal(u.gold,g);
});
test('departure irrevocably prevents old Undo (even after return)',()=>{
 const a=make(),u=hero(a);u.items=[];u.gold=5000;
 a.buy('blue',u.id,'maw_of_malmortius');const source=a.map.objects.find(o=>o.id==='blue_spawn_shop');
 u.x=source.x+.60;u.y=source.y+.60;a.invalidateShopUndoOnDepartureV453Dev61(u);
 u.x=source.x;u.y=source.y;
 assert.equal(a.canUndoShopV453Dev61('blue',u.id).ok,false);
});
test('remote team cannot buy/sell or Undo enemy items',()=>{
 const a=make(),u=equip(a,'steraks_gage'),g=u.gold,items=[...u.items];
 assert.equal(a.buy('red',u.id,'bloodletters_curse'),false);
 assert.equal(a.sellItemV43('red',u.id,0).ok,false);
 assert.equal(a.canUndoShopV453Dev61('red',u.id).ok,false);
 assert.equal(u.gold,g);assert.deepEqual(u.items,items);
});
test('checkpoint reproducibility after combat item events, no resource duplication',()=>{
 const a=make(),u=equip(a,'bloodletters_curse'),v=hero(a,'red');a.damage(v,40,u,'magic','spell');
 const shot=a.snapshotV40(),b=Arena.fromSnapshotV40(map,mask,shot);
 assert.equal(b.units.find(x=>x.id===v.id).bloodletterShredV453Dev69.stacks,1);
 assert.equal(b.units.find(x=>x.id===u.id).gold,u.gold);
 assert.equal(b.units.find(x=>x.id===u.id).items[0],'bloodletters_curse');
});
console.log(`DEV69 BULK ${count}/${count} PASS`);
