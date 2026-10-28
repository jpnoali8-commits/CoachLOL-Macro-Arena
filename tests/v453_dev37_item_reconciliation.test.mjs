import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Arena,catalog,ITEM_RECIPES,ITEM_EFFECTS_V43,recipePurchasePartsV453Dev30,checksumV40} from '../engine.mjs';
const read=n=>JSON.parse(fs.readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),masks=read('masks_128.json');
const official=read('riot_reference/catalog_26_21_dev36.json').items;
const make=()=>new Arena(map,masks,{seed:37,roundSeconds:10});
const hero=(a,team='blue',role='MID')=>a.units.find(u=>u.team===team&&u.role===role);
const prep=(a,u,gold=100000)=>{const shop=a.map.objects.find(o=>o.id===u.team+'_spawn_shop');Object.assign(u,{x:shop.x,y:shop.y,gold,items:[]});};
const t=[];function test(name,fn){fn();t.push(name);console.log('✓ DEV37 '+name);}
const byId=id=>catalog.find(v=>v.id===id);
const xwalk={dorans_ring:1056,giants_belt:1011,serrated_dirk:3134,rapid_firecannon:3094,void_staff:3135,zhonyas_hourglass:3157,scouts_slingshot:3144,blighting_jewel:4630,seekers_armguard:2420};
const localByOfficial=new Map(Object.entries(xwalk).map(([name,id])=>[String(id),name]));
for(const it of catalog)if(it.riotId)localByOfficial.set(String(it.riotId),it.id);
for(const [key,riotId] of Object.entries({ruby_crystal:1028,zeal:3086,dagger:1042,amp_tome:1052,blasting_wand:1026,needless_rod:1058,cloth_armor:1029,long_sword:1036}))localByOfficial.set(String(riotId),key);

test('DDragon 16.21.1 price and five resolved recipes match Riot item IDs',()=>{
 assert.equal(byId('dorans_ring').cost,400);assert.equal(byId('dorans_ring').stats.hp,90);
 assert.equal(byId('dorans_ring').stats.mana,undefined);
 for(const [item,id] of Object.entries(xwalk))assert.equal(byId(item).cost,official[String(id)].cost,item);
 for(const id of [1011,3094,3134,3135,3157]){
  const item=localByOfficial.get(String(id));
  assert.deepEqual(ITEM_RECIPES[item].map(local=>String([...localByOfficial].find(([key,value])=>value===local)?.[0])),official[String(id)].from,id);
 }
});
test('new components have real stats, correct nested recipes, no zero-cost loop',()=>{
 assert.ok(catalog.length>=70);assert.deepEqual(ITEM_RECIPES.scouts_slingshot,['dagger','dagger']);
 assert.deepEqual(ITEM_RECIPES.blighting_jewel,['amp_tome']);
 assert.deepEqual(ITEM_RECIPES.seekers_armguard,['amp_tome','cloth_armor','amp_tome']);
 for(const [key,recipe] of Object.entries(ITEM_RECIPES)){
  const item=byId(key);assert.ok(item);
  for(const p of recipe)assert.ok(byId(p),key+' -> '+p);
  assert.ok(item.cost>=recipe.reduce((n,c)=>n+byId(c).cost,0),key+' negative craft-cost');
 }
 assert.match(ITEM_EFFECTS_V43.scouts_slingshot.maturity,/stat_only|dev38_partial/); // Historical dev37 assertion accepts certified dev38 upgrade.
});
test('Giant belt and Dirk consume components once, retain gold ledger integrity',()=>{
 const a=make(),u=hero(a);prep(a,u);
 assert.equal(a.buy('blue',u.id,'ruby_crystal'),true);assert.equal(a.itemPurchaseCost(u,'giants_belt'),500);
 assert.equal(a.buy('blue',u.id,'giants_belt'),true);assert.deepEqual(u.items,['giants_belt']);
 assert.equal(a.buy('blue',u.id,'long_sword'),true);assert.equal(a.buy('blue',u.id,'long_sword'),true);
 assert.equal(a.itemPurchaseCost(u,'serrated_dirk'),300);
 const before=u.gold;assert.equal(a.buy('blue',u.id,'serrated_dirk'),true);assert.equal(before-u.gold,300);
 assert.deepEqual(u.items,['giants_belt','serrated_dirk']);
});
test('Rapid Firecannon nested daggers and full inventory upgrade work',()=>{
 const a=make(),u=hero(a,'blue','ADC');prep(a,u);for(const id of ['dagger','dagger','agility_cloak','dagger','dagger','health_potion'])assert.equal(a.buy('blue',u.id,id),true,id);
 assert.equal(u.items.length,6);assert.equal(a.canBuy('blue',u.id,'scouts_slingshot').ok,true);
 assert.equal(a.itemPurchaseCost(u,'scouts_slingshot'),100);
 assert.equal(a.buy('blue',u.id,'scouts_slingshot'),true);
 assert.equal(a.itemPurchaseCost(u,'zeal'),350);assert.equal(a.buy('blue',u.id,'zeal'),true);
 assert.equal(a.itemPurchaseCost(u,'rapid_firecannon'),850);
 assert.equal(a.buy('blue',u.id,'rapid_firecannon'),true);
 assert.deepEqual(u.items.sort(),['dagger','health_potion','rapid_firecannon'].sort());
});
test('Void Staff consumes Blighting Jewel and refunds precise nested cost',()=>{
 const a=make(),u=hero(a);prep(a,u);
 assert.equal(a.buy('blue',u.id,'amp_tome'),true);assert.equal(a.itemPurchaseCost(u,'blighting_jewel'),700);
 assert.equal(a.buy('blue',u.id,'blighting_jewel'),true);
 assert.equal(u.magicPenPercent,13);assert.equal(a.buy('blue',u.id,'blasting_wand'),true);
 assert.equal(a.itemPurchaseCost(u,'void_staff'),1050);assert.equal(a.buy('blue',u.id,'void_staff'),true);
 assert.equal(u.magicPenPercent,40);assert.equal(u.ap>0,true);assert.deepEqual(u.items,['void_staff']);
});
test('Blighting Jewel applies 13% magic penetration to actual engine combat',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prep(a,u);v.hp=v.maxHp=10000;v.mr=100;
 a.damage(v,100,u,'magic','spell');const noPen=10000-v.hp;
 v.hp=10000;assert.equal(a.buy('blue',u.id,'blighting_jewel'),true);
 a.damage(v,100,u,'magic','spell');const withPen=10000-v.hp;
 assert.ok(withPen>noPen,`${withPen} <= ${noPen}`);
});
test('Armguard one-use stasis: authoritative action, damage immunity, no 2nd use',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prep(a,u);
 const originalAP=u.ap,originalArmor=u.armor;
 for(const id of ['amp_tome','amp_tome','cloth_armor'])assert.equal(a.buy('blue',u.id,id),true);
 assert.equal(a.itemPurchaseCost(u,'seekers_armguard'),500);assert.equal(a.buy('blue',u.id,'seekers_armguard'),true);
 assert.equal(u.ap-originalAP,40);assert.equal(u.armor-originalArmor,25);
 const activated=a.activateStasis('blue',u.id);assert.equal(activated.ok,true);assert.equal(activated.itemId,'seekers_armguard');
 assert.equal(u.armguardSpentV453Dev37,true);assert.equal(u.stasisUntil-a.gameTime,2.5);
 assert.equal(a.damage(u,200,v,'magic','spell'),0);
 assert.equal(a.activateStasis('blue',u.id).ok,false);
 assert.equal(a.performActionV40({actorId:u.id,kind:'item',type:'seekers_armguard'}).ok,false);
 // Batch 7 upgrades the spent one-use item to Shattered Armguard,
 // retaining its Zhonya recipe credit while prohibiting reuse.
 assert.deepEqual(u.items,['shattered_armguard']);
});
test('Armguard + Rod => Zhonya 450 gold craft, 105 AP and renewably timed stasis',()=>{
 const a=make(),u=hero(a);prep(a,u);const originalArmor=u.armor,originalAP=u.ap;
 for(const id of ['amp_tome','cloth_armor','amp_tome'])a.buy('blue',u.id,id);
 a.buy('blue',u.id,'seekers_armguard');a.activateStasis('blue',u.id);
 assert.equal(a.buy('blue',u.id,'needless_rod'),true);
 assert.equal(a.itemPurchaseCost(u,'zhonyas_hourglass'),450);
 assert.equal(a.buy('blue',u.id,'zhonyas_hourglass'),true);
 assert.deepEqual(u.items,['zhonyas_hourglass']);assert.equal(u.armor-originalArmor,50);assert.equal(u.ap-originalAP,105);
 a.gameTime=4;assert.equal(a.activateStasis('blue',u.id).ok,true);
 assert.equal(a.activateStasis('blue',u.id).ok,false);
});
test('Armguard charge persists through snapshots, selling and rebuy resets it',()=>{
 const a=make(),u=hero(a);prep(a,u);assert.equal(a.buy('blue',u.id,'seekers_armguard'),true);
 assert.equal(a.activateStasis('blue',u.id).ok,true);
 const snap=a.snapshotV40();const b=Arena.fromSnapshotV40(map,masks,snap),restored=hero(b);
 assert.equal(checksumV40(snap),checksumV40(b.snapshotV40()));assert.equal(restored.armguardSpentV453Dev37,true);
 assert.equal(b.activateStasis('blue',restored.id).ok,false);
 assert.equal(b.sellItemV43('blue',restored.id,0).ok,true);
 assert.equal(b.buy('blue',restored.id,'seekers_armguard'),true);assert.equal(restored.armguardSpentV453Dev37,false);
 // After prior stasis expires, second item can be activated again.
 b.gameTime=3;assert.equal(b.activateStasis('blue',restored.id).ok,true);
});
test('quest upgrades, trinket, internal Riot IDs still cannot be purchased normally',()=>{
 const a=make(),u=hero(a,'blue','SUP');prep(a,u);
 for(const id of ['support_compass','support_bounty','trinket_oracle','riot_1515','riot_3869'])assert.equal(a.canBuy('blue',u.id,id).ok,false,id);
 assert.equal(a.buy('blue',u.id,'support_compass'),false);
 assert.equal(byId('support_compass').cost,0);assert.equal(byId('support_bounty').cost,0);
});
console.log('DEV37 '+t.length+'/'+t.length+' PASS');
