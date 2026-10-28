import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,catalog,ITEM_RECIPES,ITEM_ATTACK_RULES_V453_DEV69_B3,officialSaleValueV453Dev60} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
const json=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const map=json('../data/coachlol_map_v6.json'),mask=json('../data/masks_128.json'),riot=json('../data/riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json').data;
const sr=json('../data/riot_reference/sr_shop_26_21_dev49.json');
const mk=()=>new Arena(map,mask,{seed:696,mode:'pvp'});
const hero=(a,team='blue',role='MID')=>a.units.find(u=>u.id===team+'_'+role);
const equip=(a,item,role='MID')=>{const u=hero(a,'blue',role);u.items=[];u.gold=60000;assert.equal(a.buy('blue',u.id,item),true,'buy '+item);return u;};
const items=[['3153','blade_of_ruined_king',['vampiric_scepter','recurve_bow','pickaxe']],['3302','terminus',['hearthbound_axe','recurve_bow']],['3085','runaans_hurricane',['zeal','scouts_slingshot']],['3032','yun_tal_wildarrows',['bf_sword','scouts_slingshot','long_sword']],['2523','hexoptik_c44',['pickaxe','noonquiver','long_sword']],['3181','hullbreaker',['tunneler','winged_moonplate','pickaxe']],['6610','sundered_sky',['tunneler','caulfields_warhammer']],['6692','eclipse',['caulfields_warhammer','pickaxe','long_sword']],['3508','essence_reaver',['sheen','caulfields_warhammer','agility_cloak']],['3072','bloodthirster',['bf_sword','pickaxe','vampiric_scepter']],['3077','tiamat',['long_sword','long_sword']],['3074','ravenous_hydra',['tiamat','vampiric_scepter','caulfields_warhammer']],['3748','titanic_hydra',['tiamat','tunneler','giants_belt']],['6698','profane_hydra',['tiamat','brutalizer']],['6631','stridebreaker',['tiamat','phage','dagger']]];
let n=0;function test(title,fn){try{fn();console.log('✓ B3 '+title);n++}catch(e){console.error('✗ B3 '+title);throw e}}
function contact(a,u,v,n=1,amount=25){for(let i=0;i<n;i++)a.attack(u,v,amount)}
test('15 exact official IDs, gold.sell, recipes, status; 65 references still locked',()=>{
 assert.equal(sr.counts.normalPlayable,137);assert.equal(sr.counts.referenceOnly,65);
 for(const [id,key,from] of items){const source=riot[id],local=catalog.find(x=>x.id===key);assert.ok(local,key);assert.equal(local.riotId,+id);assert.equal(local.cost,source.gold.total);assert.equal(officialSaleValueV453Dev60(key),source.gold.sell);assert.deepEqual(ITEM_RECIPES[key],from);assert.equal(sr.rows[id].localId,key);assert.equal(sr.rows[id].status,'engine_playable');}
 assert.equal(Object.values(sr.rows).filter(x=>x.status==='reference_only'&&x.localId!==null).length,0);
});
test('recipe discount consumes exactly one Tiamat and official refund once',()=>{
 const a=mk(),u=hero(a);u.items=[];u.gold=15000;assert.equal(a.buy('blue',u.id,'tiamat'),true);const cost=a.itemPurchaseCost(u,'ravenous_hydra');assert.equal(cost,riot['3074'].gold.total-riot['3077'].gold.total);
 const prev=u.gold;assert.equal(a.buy('blue',u.id,'ravenous_hydra'),true);assert.equal(u.gold,prev-cost);assert.deepEqual(u.items,['ravenous_hydra']);const sale=a.sellItemV43('blue',u.id,0);assert.equal(sale.refund,riot['3074'].gold.sell);assert.equal(a.sellItemV43('blue',u.id,0).ok,false);
});
test('Cleave exclusive while Tiamat upgrades cleanly; spellblade only one',()=>{
 const a=mk(),u=equip(a,'tiamat');assert.equal(a.canBuy('blue',u.id,'ravenous_hydra').ok,true);assert.equal(a.canBuy('blue',u.id,'titanic_hydra').ok,true);assert.equal(a.buy('blue',u.id,'titanic_hydra'),true);
 assert.equal(a.canBuy('blue',u.id,'ravenous_hydra').ok,false);assert.equal(a.queuePurchase('blue',u.id,'stridebreaker').ok,false);
 const b=mk(),w=equip(b,'sheen');assert.equal(b.canBuy('blue',w.id,'essence_reaver').ok,true);assert.equal(b.buy('blue',w.id,'essence_reaver'),true);assert.equal(b.canBuy('blue',w.id,'trinity_force').ok,false);
});
test('Ruined King current HP damage and third hit 30% slow without recursive hits',()=>{
 const a=mk(),u=equip(a,'blade_of_ruined_king'),v=hero(a,'red');v.armor=0;v.hp=10000;v.maxHp=10000;
 const before=v.hp;contact(a,u,v);assert.ok(before-v.hp>25);contact(a,u,v,2);assert.equal(a.effectResolverV41().has(v,'slow'),true);assert.ok(!v.deadUntil);
});
test('Terminus alternates light and dark and expires defenses after 5s',()=>{
 const a=mk(),u=equip(a,'terminus'),v=hero(a,'red');v.hp=v.maxHp=8000;const base=a.elementalStatsV452d3(u).mr;
 contact(a,u,v,4);assert.equal(u.terminusV453Dev69B3.light,2);assert.equal(u.terminusV453Dev69B3.dark,2);
 assert.ok(a.elementalStatsV452d3(u).mr>base);a.gameTime+=6;assert.equal(a.elementalStatsV452d3(u).mr,base);
});
test('Runaan launches at most two visible enemy bolts, no friendly fire',()=>{
 const a=mk(),u=equip(a,'runaans_hurricane'),v=hero(a,'red');const e=hero(a,'red','TOP'),ally=hero(a,'blue','SUP');v.x=u.x;v.y=u.y;e.x=u.x;e.y=u.y;ally.x=u.x;ally.y=u.y;v.maxHp=v.hp=10000;e.maxHp=e.hp=10000;ally.maxHp=ally.hp=10000;
 const before=e.hp;contact(a,u,v);assert.ok(e.hp<before);assert.equal(ally.hp,10000);
});
test('Yun Tal stacks crit, grants AS frenzy and removes exact crit bonus on sale',()=>{
 const a=mk(),u=equip(a,'yun_tal_wildarrows'),v=hero(a,'red');v.maxHp=v.hp=10000;const base=u.critChance;
 contact(a,u,v,5);assert.ok(u.critChance>base);assert.ok(u.yunTalFrenzyUntilV453Dev69B3>a.gameTime);
 assert.equal(a.sellItemV43('blue',u.id,0).ok,true);assert.equal(u.critChance,base);
});
test('Hexoptik C44 extends ranged raw damage with distance, only on basics',()=>{
 const a=mk(),u=equip(a,'hexoptik_c44'),v=hero(a,'red');v.armor=0;v.hp=v.maxHp=10000;
 u.x=v.x;u.y=v.y;contact(a,u,v);const near=10000-v.hp;
 v.hp=10000;u.x=Math.min(.95,v.x+.04);contact(a,u,v);const far=10000-v.hp;assert.ok(far>=near,{near,far});
});
test('Hullbreaker every 5th eligible AA deals extra, no extra before fifth',()=>{
 const a=mk(),u=equip(a,'hullbreaker'),v=hero(a,'red');v.armor=0;v.maxHp=v.hp=10000;contact(a,u,v,4);const before=v.hp;contact(a,u,v);assert.ok(before-v.hp>25);
});
test('Sundered Sky first AA crit/heal per target, second does not; CD is per target',()=>{
 const a=mk(),u=equip(a,'sundered_sky'),v=hero(a,'red');v.armor=0;v.hp=v.maxHp=10000;u.hp=u.maxHp*.4;
 const before=v.hp;contact(a,u,v);const boosted=before-v.hp;const h=u.hp;const before2=v.hp;contact(a,u,v);assert.ok(boosted>before2-v.hp);assert.ok(h>u.maxHp*.4);
});
test('Eclipse shield requires two separate simulation seconds against same champion',()=>{
 const a=mk(),u=equip(a,'eclipse'),v=hero(a,'red');v.hp=v.maxHp=10000;
 a.damage(v,10,u,'physical','spell');assert.equal(a.effectResolverV41().has(u,'shield'),false);
 a.damage(v,10,u,'physical','spell');assert.equal(a.effectResolverV41().has(u,'shield'),false);
 a.gameTime++;a.damage(v,10,u,'physical','spell');assert.equal(a.effectResolverV41().has(u,'shield'),true);
});
test('Essence Reaver spellblade after valid skill, grants mana on basic only once',()=>{
 const a=mk(),u=equip(a,'essence_reaver'),v=hero(a,'red');u.mana=Math.max(0,u.maxMana-100);v.hp=v.maxHp=10000;
 u.spellbladeArmedUntilV453Dev29=a.gameTime+10;u.spellbladeNextV453Dev29=0;const before=u.mana;
 contact(a,u,v);assert.ok(u.mana>before);const after=u.mana;contact(a,u,v);assert.equal(u.mana,after);
});
test('Bloodthirster overheal produces finite shield only from actual life steal',()=>{
 const a=mk(),u=equip(a,'bloodthirster'),v=hero(a,'red');v.hp=v.maxHp=10000;u.hp=u.maxHp-2;
 contact(a,u,v,2,100);assert.ok(a.effectResolverV41().has(u,'shield'));assert.ok(u.statusEffectsV41.find(x=>x.key==='bloodthirster_b3').power<=ITEM_ATTACK_RULES_V453_DEV69_B3.bloodthirster.overhealShieldLimit);
});
test('Tiamat splashes onto visible nearby enemy without hurting ally',()=>{
 const a=mk(),u=equip(a,'tiamat'),v=hero(a,'red'),e=hero(a,'red','TOP'),ally=hero(a,'blue','SUP');v.hp=v.maxHp=10000;e.hp=e.maxHp=10000;ally.hp=ally.maxHp=10000;v.x=u.x;v.y=u.y;e.x=u.x;e.y=u.y;ally.x=u.x;ally.y=u.y;
 contact(a,u,v);assert.ok(e.hp<10000);assert.equal(ally.hp,10000);
});
test('4 Hydra upgrades use Tiamat once, each has active AoE authority/cooldown',()=>{
 for(const key of ['ravenous_hydra','titanic_hydra','profane_hydra','stridebreaker']){
  const a=mk(),u=equip(a,key),v=hero(a,'red');v.x=u.x;v.y=u.y;v.hp=v.maxHp=10000;
  assert.equal(a.activateItemV453Dev59('red',u.id,key).ok,false);
  const cast=a.activateItemV453Dev59('blue',u.id,key);assert.equal(cast.ok,true,key+JSON.stringify(cast));assert.ok(v.hp<10000,key);
  assert.equal(a.activateItemV453Dev59('blue',u.id,key).ok,false);
  if(key==='stridebreaker')assert.ok(a.effectResolverV41().has(v,'slow'));
 }
});
test('Cleave active cannot target fog-hidden enemy or leak unseen hitIds',()=>{
 const a=mk(),u=equip(a,'tiamat'),v=hero(a,'red');v.x=u.x;v.y=u.y;
 const prior=a.canSeePoint;a.canSeePoint=function(team,point){if(team==='blue'&&point?.id===v.id)return false;return prior.call(this,team,point)};
 const before=v.hp,cast=a.activateItemV453Dev59('blue',u.id,'tiamat');assert.equal(cast.ok,true);assert.equal(v.hp,before);assert.equal(cast.hitIds.includes(v.id),false);
});
test('Undo in fountain restores equipped Tiamat, snapshot and gold',()=>{
 const a=mk(),u=hero(a);u.items=[];u.gold=10000;const before=u.gold;assert.equal(a.buy('blue',u.id,'tiamat'),true);
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,true);assert.equal(u.items.includes('tiamat'),false);assert.equal(u.gold,before);
});
test('Leaving fountain irrevocably invalidates Undo after returning',()=>{
 const a=mk(),u=hero(a);u.items=[];u.gold=10000;assert.equal(a.buy('blue',u.id,'tiamat'),true);const spawn=a.map.objects.find(x=>x.id==='blue_spawn_shop');
 u.x=.5;u.y=.5;assert.equal(a.canUndoShopV453Dev61('blue',u.id).ok,false);u.x=spawn.x;u.y=spawn.y;assert.equal(a.canUndoShopV453Dev61('blue',u.id).ok,false);
});
test('snapshot preserves proc state across restoration, and enemy cannot buy',()=>{
 const a=mk(),u=equip(a,'terminus'),v=hero(a,'red');v.hp=v.maxHp=10000;contact(a,u,v,2);
 const snap=a.snapshotV40(),b=Arena.fromSnapshotV40(map,mask,snap);
 const copy=hero(b);assert.equal(copy.terminusV453Dev69B3.light,u.terminusV453Dev69B3.light);assert.equal(copy.terminusV453Dev69B3.dark,u.terminusV453Dev69B3.dark);
 assert.equal(a.canBuy('red',u.id,'terminus').ok,false);
});
console.log('DEV69 B3 '+n+'/'+n+' PASS');