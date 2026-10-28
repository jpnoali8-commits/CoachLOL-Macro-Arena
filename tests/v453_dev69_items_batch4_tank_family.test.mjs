import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,catalog,ITEM_RECIPES,ITEM_DEFENSE_RULES_V453_DEV69_B4,officialSaleValueV453Dev60} from '../engine.mjs';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const map=read('../data/coachlol_map_v6.json'), mask=read('../data/masks_128.json');
const riot=read('../data/riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json').data;
const sr=read('../data/riot_reference/sr_shop_26_21_dev49.json');
const recipeId={"chain_vest": "1031", "kindlegem": "3067", "ruby_crystal": "1028", "bamis_cinder": "6660", "spectres_cowl": "3211", "giants_belt": "1011", "crystalline_bracer": "3801", "negatron_cloak": "1057", "winged_moonplate": "3066", "steel_sigil": "2019", "bf_sword": "1038", "pickaxe": "1037", "caulfields_warhammer": "3133", "blasting_wand": "1026", "catalyst_of_aeons": "3803", "tear_of_the_goddess": "3070", "lost_chapter": "3802", "fiendish_codex": "3108", "long_sword": "1036", "tunneler": "2021", "dagger": "1042", "phage": "3044"};
const mk=()=>new Arena(map,mask,{seed:694,mode:'pvp'});
const hero=(a,team='blue',role='MID')=>a.units.find(u=>u.id===team+'_'+role);
const equip=(a,id,team='blue')=>{const u=hero(a,team);u.gold=1e6;u.items=[];assert.equal(a.buy(team,u.id,id),true,id);return u;};
const near=(a,u,v)=>{v.x=u.x;v.y=u.y;v.hp=v.maxHp=30000;v.armor=v.mr=0;};
const entries=[['2502','eternal_despair'],['3068','sunfire_aegis'],['6664','hollow_radiance'],['3083','warmogs_armor'],['3084','heartsteel'],['6665','jaksho_the_protean'],['3742','dead_mans_plate'],['3026','guardian_angel'],['6333','deaths_dance'],['6657','rod_of_ages'],['3119','winters_approach'],['3003','archangels_staff'],['3004','manamune'],['3073','experimental_hexplate'],['3161','spear_of_shojin']];
let total=0;const test=(name,fn)=>{try{fn();total++;console.log('✓ B4 '+name)}catch(e){console.error('✗ B4 '+name);throw e}};
test('15 official Riot IDs/recipe/price/sell, monotonic catalog coverage',()=>{
 assert.ok(sr.counts.normalPlayable>=167&&sr.counts.referenceOnly<=35,'catalog coverage must not regress');assert.equal(sr.counts.normalPlayable+sr.counts.referenceOnly,202);
 for(const [id,key] of entries){const o=riot[id],c=catalog.find(v=>v.id===key);assert.ok(c,key);assert.equal(c.riotId,Number(id));assert.equal(c.cost,o.gold.total);assert.equal(officialSaleValueV453Dev60(key),o.gold.sell);assert.deepEqual(ITEM_RECIPES[key].map(p=>recipeId[p]),o.from);assert.equal(sr.rows[id].status,'engine_playable');assert.equal(sr.rows[id].localId,key)}
 assert.equal(Object.values(sr.rows).filter(x=>x.status==='reference_only'&&x.localId).length,0);
});
test('15 individually buy, sale exact, no duplicate sale/gold mint',()=>{
 for(const [id,key] of entries){const a=mk(),u=hero(a);u.gold=20000;u.items=[];const start=u.gold;assert.equal(a.buy('blue',u.id,key),true);assert.equal(u.gold,start-riot[id].gold.total);const sale=a.sellItemV43('blue',u.id,0);assert.equal(sale.ok,true);assert.equal(sale.refund,riot[id].gold.sell);assert.equal(u.gold,start-riot[id].gold.total+riot[id].gold.sell);assert.equal(a.sellItemV43('blue',u.id,0).ok,false)}
});
test('Sunfire: combat tick burns near visible enemy, not an ally',()=>{
 const a=mk(),u=equip(a,'sunfire_aegis'),e=hero(a,'red'),ally=hero(a,'blue','SUP');near(a,u,e);near(a,u,ally);u.combatUntil=10;a.gameTime=1;const hp=e.hp;a.advanceDefensiveItemsV453Dev69B4();assert.ok(e.hp<hp);assert.equal(ally.hp,ally.maxHp);
});
test('Hollow Radiance: magic aura deals non-recursive enemy damage',()=>{
 const a=mk(),u=equip(a,'hollow_radiance'),e=hero(a,'red');near(a,u,e);u.combatUntil=10;a.gameTime=1;const hp=e.hp;a.advanceDefensiveItemsV453Dev69B4();assert.ok(e.hp<hp);
});
test('Eternal Despair: 4s pulse heals proportionally to actual champion damage',()=>{
 const a=mk(),u=equip(a,'eternal_despair'),e=hero(a,'red');near(a,u,e);u.hp=u.maxHp-400;u.combatUntil=10;a.gameTime=1;const before=u.hp;a.advanceDefensiveItemsV453Dev69B4();assert.ok(u.hp>before);const hp=e.hp;a.gameTime=2;a.advanceDefensiveItemsV453Dev69B4();assert.equal(e.hp,hp);
});
test('Warmog: outside combat and at 2000 bonus HP, heals only after 8s',()=>{
 const a=mk(),u=equip(a,'warmogs_armor');u.items.push('heartsteel');u.maxHp+=900;u.items.push('ruby_crystal');u.maxHp+=150;a.advanceDefensiveItemsV453Dev69B4();u.hp=u.maxHp*.6;u.lastChampionDamageAtV453Dev69B4=0;a.gameTime=7;const before=u.hp;a.advanceDefensiveItemsV453Dev69B4();assert.equal(u.hp,before);a.gameTime=9;a.advanceDefensiveItemsV453Dev69B4();assert.ok(u.hp>before);
});
test('Heartsteel: tracks 3 seconds, one gain per target cooldown and no team leakage',()=>{
 const a=mk(),u=equip(a,'heartsteel'),e=hero(a,'red');near(a,u,e);a.gameTime=1;a.advanceDefensiveItemsV453Dev69B4();a.gameTime=5;a.advanceDefensiveItemsV453Dev69B4();const hp=u.maxHp;a.attack(u,e,15);assert.ok(u.maxHp>hp);const again=u.maxHp;a.attack(u,e,15);assert.equal(u.maxHp,again);
});
test('JakSho: increases bonus armor and MR only after 5s of continuous champion combat',()=>{
 const a=mk(),u=equip(a,'jaksho_the_protean'),e=hero(a,'red');const base=a.elementalStatsV452d3(u);a.gameTime=1;a.damage(u,80,e,'physical','basic');a.gameTime=6;a.damage(u,40,e,'physical','basic');const more=a.elementalStatsV452d3(u);assert.ok(more.armor>base.armor&&more.mr>base.mr);
});
test('Dead Man: movement charge empowers next attack and consumes once',()=>{
 const a=mk(),u=equip(a,'dead_mans_plate'),e=hero(a,'red');near(a,u,e);a.gameTime=1;a.advanceDefensiveItemsV453Dev69B4();for(let i=2;i<=6;i++){u.x+=.003;a.gameTime=i;a.advanceDefensiveItemsV453Dev69B4();}assert.ok(u.deadmanChargesV453Dev69B4>0);a.attack(u,e,15);assert.equal(u.deadmanChargesV453Dev69B4,0);
});
test('Guardian Angel: lethal damage goes into stasis, revives once without kill credit',()=>{
 const a=mk(),u=equip(a,'guardian_angel'),e=hero(a,'red');near(a,u,e);a.gameTime=2;u.hp=110;const deaths=u.deaths;a.damage(u,10000,e,'physical','spell');assert.ok(u.hp>0);assert.ok(u.gaReviveAtV453Dev69B4>2);assert.equal(u.deaths,deaths);assert.ok(a.effectResolverV41().canAct(u,'attack').ok===false);a.gameTime=7;a.advanceDefensiveItemsV453Dev69B4();assert.ok(u.hp>u.maxHp*.49);
});
test('Deaths Dance defers part of non-true hit, ticks true damage once each second',()=>{
 const a=mk(),u=equip(a,'deaths_dance'),e=hero(a,'red');const before=u.hp;const dealt=a.damage(u,120,e,'physical','spell');assert.ok(dealt>0);assert.ok(u.deathDanceQueueV453Dev69B4?.length);const after=u.hp;a.gameTime=1;a.advanceDefensiveItemsV453Dev69B4();assert.ok(u.hp<after);assert.ok(u.hp>0);
});
test('Rod of Ages grows once per 60 seconds, caps, sale removes growth',()=>{
 const a=mk(),u=equip(a,'rod_of_ages');const b={hp:u.maxHp,mana:u.maxMana,ap:u.ap};a.gameTime=60;a.growRodV453Dev69B4(u);assert.equal(u.maxHp,b.hp+10);assert.equal(u.maxMana,b.mana+30);assert.equal(u.ap,b.ap+3);a.growRodV453Dev69B4(u);assert.equal(u.ap,b.ap+3);a.gameTime=900;a.growRodV453Dev69B4(u);assert.equal(u.rodStacksV453Dev69B4,10);assert.equal(a.sellItemV43('blue',u.id,0).ok,true);assert.ok(u.ap<b.ap+30);
});
test('Archangel: bonus AP from mana is derived, not multiply-applied on repeated reads',()=>{
 const a=mk(),u=equip(a,'archangels_staff');const base=u.ap;const p=a.elementalStatsV452d3(u).ap;assert.ok(p>base);assert.equal(a.elementalStatsV452d3(u).ap,p);
});
test('Manamune: bonus AD from item mana is derived, not duplicate',()=>{
 const a=mk(),u=equip(a,'manamune');assert.ok(a.elementalStatsV452d3(u).ad>u.ad);assert.equal(a.elementalStatsV452d3(u).ad,a.elementalStatsV452d3(u).ad);
});
test('Winter: derives health from bonus mana and stops granting on sale',()=>{
 const a=mk(),u=equip(a,'winters_approach');const h=u.maxHp;a.advanceDefensiveItemsV453Dev69B4();assert.ok(u.maxHp>h);assert.equal(a.sellItemV43('blue',u.id,0).ok,true);assert.equal(u.itemDerivedHealthV453Dev69B4,0);
});
test('Tear epic upgrade preserves pre-existing mana quest, evolves at 360',()=>{
 const a=mk(),u=hero(a);u.items=[];u.gold=10000;assert.ok(a.buy('blue',u.id,'tear_of_the_goddess'));u.tearManaBonusV453Dev56=350;u.maxMana+=350;assert.ok(a.buy('blue',u.id,'archangels_staff'));assert.equal(u.tearManaBonusV453Dev56,350);const e=hero(a,'red');a.gameTime=5;a.procTearManaV453Dev56(u,e);assert.ok(u.tearManaBonusV453Dev56>=350);assert.ok(u.items.includes('archangels_staff'));
});
test('Hexplate: only valid R cast activates timed buff',()=>{
 const a=mk(),u=equip(a,'experimental_hexplate');u.skillRanks.R=1;u.level=6;u.mana=1000;u.skillCds.R=0;const r=a.performActionV40({actorId:u.id,kind:'skill',slot:'R',source:'qa_b4'});assert.equal(r.ok,true,JSON.stringify(r));assert.ok(u.hexplateBuffUntilV453Dev69B4>a.gameTime);
});
test('Shojin: ability damages stack by distinct real hits, not item recursive hit',()=>{
 const a=mk(),u=equip(a,'spear_of_shojin'),e=hero(a,'red');e.hp=e.maxHp=30000;e.mr=0;let damage0=a.damage(e,100,u,'magic','spell');a.damage(e,100,u,'magic','spell');const damage2=a.damage(e,100,u,'magic','spell');assert.ok(damage2>=damage0);assert.ok(e.shojinDebuffV453Dev69B4?.[u.id]?.stacks>=2);
});
test('PvP ownership prevents other team buying or selling our tank items',()=>{
 const a=mk(),u=equip(a,'eternal_despair');assert.equal(a.canBuy('red',u.id,'guardian_angel').ok,false);assert.equal(a.sellItemV43('red',u.id,0).ok,false);
});
test('Undo correctly restores shop receipt and gold while in fountain',()=>{
 const a=mk(),u=hero(a);u.gold=20000;u.items=[];const start=u.gold;assert.ok(a.buy('blue',u.id,'heartsteel'));const x=a.undoShopV453Dev61('blue',u.id);assert.equal(x.ok,true);assert.equal(u.gold,start);assert.ok(!u.items.includes('heartsteel'));
});
test('Undo is permanently revoked when leaving fountain and returning',()=>{
 const a=mk(),u=hero(a);u.gold=20000;u.items=[];assert.ok(a.buy('blue',u.id,'heartsteel'));const spawn=a.map.objects.find(x=>x.id==='blue_spawn_shop');u.x=.5;u.y=.5;assert.equal(a.canUndoShopV453Dev61('blue',u.id).ok,false);u.x=spawn.x;u.y=spawn.y;assert.equal(a.canUndoShopV453Dev61('blue',u.id).ok,false);
});
test('snapshot preserves guardian cooldown, Rod growth and pending deferred damage',()=>{
 const a=mk(),u=equip(a,'rod_of_ages'),e=hero(a,'red');a.gameTime=60;a.growRodV453Dev69B4(u);const snap=a.snapshotV40(),b=Arena.fromSnapshotV40(map,mask,snap);assert.equal(hero(b).rodStacksV453Dev69B4,1);assert.equal(hero(b).maxHp,u.maxHp);assert.deepEqual(hero(b).items,u.items);
});
test('Hexplate attack interval and movement speed buff actually end after 8 simulated seconds',()=>{
 const a=mk(),u=equip(a,'experimental_hexplate');const baseI=a.basicAttackIntervalV452c(u),baseS=a.effectiveMS(u);
 u.hexplateBuffUntilV453Dev69B4=a.gameTime+8;
 assert.ok(a.basicAttackIntervalV452c(u)<baseI);assert.ok(a.effectiveMS(u)>baseS);
 a.gameTime+=9;assert.equal(a.basicAttackIntervalV452c(u),baseI);assert.equal(a.effectiveMS(u),baseS);
});
test('Guardian Angel cannot trigger twice while cooldown is live',()=>{
 const a=mk(),u=equip(a,'guardian_angel'),e=hero(a,'red');a.gameTime=2;u.hp=100;
 a.damage(u,100000,e,'physical','spell');assert.ok(u.gaReviveAtV453Dev69B4>2);
 a.gameTime=7;a.advanceDefensiveItemsV453Dev69B4();u.hp=80;
 a.damage(u,100000,e,'physical','spell');assert.equal(u.hp,0);assert.equal(u.gaReviveAtV453Dev69B4,0);
});

test('JakSho activates after 5 seconds while only dealing champion damage',()=>{
 const a=mk(),u=equip(a,'jaksho_the_protean'),e=hero(a,'red');e.hp=e.maxHp=30000;e.armor=0;
 const base=a.elementalStatsV452d3(u).armor;
 a.gameTime=1;a.damage(e,20,u,'physical','spell');a.gameTime=6;a.damage(e,20,u,'physical','spell');
 assert.ok(a.elementalStatsV452d3(u).armor>base);
});
test('Deaths Dance pending ticks never damage revived champion after a real death',()=>{
 const a=mk(),u=equip(a,'deaths_dance'),e=hero(a,'red');u.hp=180;
 a.damage(u,100,e,'physical','spell');assert.ok(u.deathDanceQueueV453Dev69B4?.length);
 a.damage(u,100000,e,'true','spell');assert.equal(u.hp,0);assert.deepEqual(u.deathDanceQueueV453Dev69B4,[]);
});

console.log(`DEV69 B4 ${total}/${total} PASS`);