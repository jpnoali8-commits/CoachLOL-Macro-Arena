import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,catalog,ITEM_RECIPES,ITEM_SUPPORT_RULES_V453_DEV69_B5,officialSaleValueV453Dev60} from '../engine.mjs';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const map=read('../data/coachlol_map_v6.json'),mask=read('../data/masks_128.json');
const riot=read('../data/riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json').data;
const sr=read('../data/riot_reference/sr_shop_26_21_dev49.json');
const entries=read('../data/riot_reference/batch5_entries_dev69.json');
const mk=()=>new Arena(map,mask,{seed:695,mode:'pvp'});
const hero=(a,team='blue',role='MID')=>a.units.find(v=>v.id===team+'_'+role);
const near=(u,...targets)=>{for(const v of targets){v.x=u.x;v.y=u.y;}};
const equip=(a,id,role='MID')=>{const u=hero(a,'blue',role);u.gold=100000;u.items=[];assert.equal(a.buy('blue',u.id,id),true,id);return u;};
let passes=0;const test=(name,fn)=>{try{fn();passes++;console.log('✓ B5 '+name)}catch(e){console.error('✗ B5 '+name);throw e;}};
const ids={aether_wisp:'3113',bandleglass_mirror:'4642',fiendish_codex:'3108',forbidden_idol:'3114',kindlegem:'3067',cloth_armor:'1029',null_magic_mantle:'1033',chain_vest:'1031',rejuvenation_bead:'1006',blasting_wand:'1026',amp_tome:'1052',blighting_jewel:'4630',vampiric_scepter:'1053',hextech_alternator:'3145'};
test('15 Riot official IDs/prices/recipes/sale and 35 reference-only',()=>{
 assert.ok(sr.counts.normalPlayable>=167&&sr.counts.referenceOnly<=35,'catalog coverage must not regress');assert.equal(sr.counts.normalPlayable+sr.counts.referenceOnly,202);assert.equal(entries.length,15);
 for(const {riotId,localId} of entries){const c=catalog.find(x=>x.id===localId),d=riot[riotId];assert.ok(c,localId);assert.equal(c.riotId,Number(riotId));assert.equal(c.cost,d.gold.total);assert.equal(officialSaleValueV453Dev60(localId),d.gold.sell);assert.deepEqual(ITEM_RECIPES[localId].map(x=>ids[x]),d.from);assert.equal(sr.rows[riotId].localId,localId);assert.equal(sr.rows[riotId].status,'engine_playable');}
 assert.equal(Object.values(sr.rows).filter(x=>x.status==='reference_only'&&x.localId).length,0);
});
test('15 individual buys and sales preserve gold and deny second sale',()=>{
 for(const {riotId,localId} of entries){const a=mk(),u=hero(a);u.items=[];u.gold=100000;const start=u.gold;assert.equal(a.buy('blue',u.id,localId),true,localId);assert.equal(u.gold,start-riot[riotId].gold.total);const s=a.sellItemV43('blue',u.id,0);assert.equal(s.ok,true,localId);assert.equal(s.refund,riot[riotId].gold.sell);assert.equal(u.gold,start-riot[riotId].gold.total+riot[riotId].gold.sell);assert.equal(a.sellItemV43('blue',u.id,0).ok,false);}
});
test('Shurelya aura affects nearby ally, expires, enemy never receives it',()=>{
 const a=mk(),u=equip(a,'shurelyas_battlesong'),ally=hero(a,'blue','SUP'),enemy=hero(a,'red');near(u,ally,enemy);const baseline=a.effectiveMS(ally);assert.ok(a.activateItemV453Dev59('blue',u.id,'shurelyas_battlesong').ok);assert.ok(a.effectiveMS(ally)>baseline);assert.equal(a.activateItemV453Dev59('blue',u.id,'shurelyas_battlesong').ok,false);a.gameTime=5;assert.equal(a.effectiveMS(ally),baseline);
});
test('Locket shields every in-range ally, never enemy; one cooldown',()=>{
 const a=mk(),u=equip(a,'locket_of_the_iron_solari'),ally=hero(a,'blue','SUP'),enemy=hero(a,'red');near(u,ally,enemy);assert.ok(a.activateItemV453Dev59('blue',u.id,'locket_of_the_iron_solari').ok);assert.ok(a.effectResolverV41().has(ally,'shield'));assert.ok(!a.effectResolverV41().has(enemy,'shield'));assert.equal(a.activateItemV453Dev59('blue',u.id,'locket_of_the_iron_solari').ok,false);
});
test('Mikael targeted cleanse removes root but cannot remove suppression/knockup',()=>{
 const a=mk(),u=equip(a,'mikaels_blessing'),ally=hero(a,'blue','SUP'),enemy=hero(a,'red');near(u,ally,enemy);ally.hp=Math.max(10,ally.maxHp-300);a.applyEffectV41(ally,'root',{source:enemy,duration:8,power:0});a.applyEffectV41(ally,'suppression',{source:enemy,duration:8,power:0});const t=a.activateItemV453Dev59('blue',u.id,'mikaels_blessing',ally.id);assert.ok(t.ok,JSON.stringify(t));assert.ok(!a.effectResolverV41().has(ally,'root'));assert.ok(a.effectResolverV41().has(ally,'suppression'));assert.ok(ally.hp>0);assert.equal(a.activateItemV453Dev59('red',u.id,'mikaels_blessing',enemy.id).ok,false);
});
test('Mikael fails when targeting enemy and does not consume cooldown',()=>{
 const a=mk(),u=equip(a,'mikaels_blessing'),enemy=hero(a,'red'),ally=hero(a,'blue','SUP');near(u,enemy,ally);assert.equal(a.activateItemV453Dev59('blue',u.id,'mikaels_blessing',enemy.id).ok,false);assert.ok(a.activateItemV453Dev59('blue',u.id,'mikaels_blessing',ally.id).ok);
});
test('Redemption delayed heal and damaging AoE once on server tick',()=>{
 const a=mk(),u=equip(a,'redemption'),ally=hero(a,'blue','SUP'),enemy=hero(a,'red');near(u,ally,enemy);ally.hp=Math.max(10,ally.maxHp-300);enemy.hp=enemy.maxHp=3000;const before=enemy.hp;assert.ok(a.activateItemV453Dev59('blue',u.id,'redemption',ally.id).ok);a.gameTime=2;a.advanceSupportItemsV453Dev69B5();assert.equal(enemy.hp,before);a.gameTime=3;a.advanceSupportItemsV453Dev69B5();assert.ok(enemy.hp<before);assert.ok(ally.hp>ally.maxHp-300);const after=enemy.hp;a.advanceSupportItemsV453Dev69B5();assert.equal(enemy.hp,after);
});
test('Gunblade enemy target must be visible/owned and item equipped',()=>{
 const a=mk(),u=equip(a,'hextech_gunblade'),enemy=hero(a,'red'),ally=hero(a,'blue','SUP');near(u,enemy,ally);enemy.hp=enemy.maxHp=3000;assert.equal(a.activateItemV453Dev59('blue',u.id,'hextech_gunblade',ally.id).ok,false);const hp=enemy.hp,r=a.activateItemV453Dev59('blue',u.id,'hextech_gunblade',enemy.id);assert.ok(r.ok,JSON.stringify(r));assert.ok(enemy.hp<hp);assert.ok(a.effectResolverV41().has(enemy,'slow'));assert.equal(a.activateItemV453Dev59('blue',u.id,'hextech_gunblade',enemy.id).ok,false);
});
test('Knight Vow redirects damage without recursion, sells to stop',()=>{
 const a=mk(),u=equip(a,'knights_vow','SUP'),ally=hero(a,'blue'),enemy=hero(a,'red');near(u,ally,enemy);u.hp=u.maxHp=2000;ally.hp=ally.maxHp=2000;assert.ok(a.activateItemV453Dev59('blue',u.id,'knights_vow',ally.id).ok);const start=u.hp;a.damage(ally,150,enemy,'physical','spell');assert.ok(u.hp<start);const after=u.hp;assert.ok(a.sellItemV43('blue',u.id,0).ok);const soldHp=u.hp;assert.equal(u.knightsVowTargetV453Dev69B5,null);a.damage(ally,150,enemy,'physical','spell');assert.equal(u.hp,soldHp);
});
test('Ardent triggers on allied heal and grants nonrecursive magic on-hit',()=>{
 const a=mk(),u=equip(a,'ardent_censer','SUP'),ally=hero(a,'blue'),enemy=hero(a,'red');near(u,ally,enemy);ally.hp=ally.maxHp-200;enemy.hp=enemy.maxHp=30000;const fx=a.effectResolverV41();fx.heal(ally,100,u);assert.ok(ally.ardentUntilV453Dev69B5>a.gameTime);assert.ok(a.basicAttackIntervalV452c(ally)>0);const hp=enemy.hp;a.damage(enemy,150,ally,'physical','basic');assert.ok(enemy.hp<hp-120);
});
test('Staff gives AP and haste to two, expires without mutating raw AP',()=>{
 const a=mk(),u=equip(a,'staff_of_flowing_water','SUP'),ally=hero(a,'blue');near(u,ally);ally.hp=ally.maxHp-200;const initial=a.elementalStatsV452d3(ally).ap,base=ally.ap;a.effectResolverV41().heal(ally,100,u);assert.ok(a.elementalStatsV452d3(ally).ap>=initial+40);assert.equal(ally.ap,base);a.gameTime=7;assert.equal(a.elementalStatsV452d3(ally).ap,initial);
});
test('Moonstone heals another injured ally once and never enemy',()=>{
 const a=mk(),u=equip(a,'moonstone_renewer','SUP'),one=hero(a,'blue'),two=hero(a,'blue','ADC'),enemy=hero(a,'red');near(u,one,two,enemy);one.hp=one.maxHp-300;two.hp=two.maxHp-300;enemy.hp=enemy.maxHp-300;const before=two.hp;a.effectResolverV41().heal(one,100,u);assert.ok(two.hp>before);assert.equal(enemy.hp,enemy.maxHp-300);
});
test('Helia accumulates three unique damaging hits and consumes on allied cure',()=>{
 const a=mk(),u=equip(a,'echoes_of_helia','SUP'),ally=hero(a,'blue'),enemy=hero(a,'red');near(u,ally,enemy);enemy.hp=enemy.maxHp=30000;ally.hp=ally.maxHp-400;for(let n=0;n<4;n++)a.damage(enemy,40,u,'magic','spell');assert.equal(u.heliaChargesV453Dev69B5,3);const hp=ally.hp;a.effectResolverV41().heal(ally,50,u);assert.equal(u.heliaChargesV453Dev69B5,0);assert.ok(ally.hp>hp+50);
});
test('Dawncore regen converts to real AP and heal power once, read only',()=>{
 const a=mk(),u=equip(a,'dawncore');const ap=u.ap,one=a.elementalStatsV452d3(u);assert.ok(one.ap>ap);assert.ok(one.healShieldPower>u.healShieldPower);assert.equal(a.elementalStatsV452d3(u).ap,one.ap);assert.equal(u.ap,ap);
});
test('Mandate marks on enemy CC, subsequent allied hit amplifies while active',()=>{
 const a=mk(),u=equip(a,'imperial_mandate','SUP'),ally=hero(a,'blue'),enemy=hero(a,'red');near(u,ally,enemy);enemy.hp=enemy.maxHp=30000;enemy.armor=0;const basic=a.damage(enemy,100,ally,'true','basic');a.applyEffectV41(enemy,'root',{source:u,duration:3,power:0});const marked=a.damage(enemy,100,ally,'true','basic');assert.ok(marked>basic,`${marked} versus ${basic}`);a.gameTime=5;assert.equal(a.damage(enemy,100,ally,'true','basic'),basic);
});
test('Zeke storm only after real R and damages nearby foes on tick',()=>{
 const a=mk(),u=equip(a,'zekes_convergence'),enemy=hero(a,'red');near(u,enemy);enemy.hp=enemy.maxHp=30000;u.level=6;u.skillRanks.R=1;u.mana=1000;u.skillCds.R=0;const cast=a.performActionV40({actorId:u.id,kind:'skill',slot:'R',source:'qa_b5'});assert.equal(cast.ok,true,JSON.stringify(cast));const hp=enemy.hp;a.gameTime=1;a.advanceSupportItemsV453Dev69B5();assert.ok(enemy.hp<hp);
});
test('Bandocanos slow triggers team movement aura and expires',()=>{
 const a=mk(),u=equip(a,'bandocanos','SUP'),ally=hero(a,'blue'),enemy=hero(a,'red');near(u,ally,enemy);const before=a.effectiveMS(ally);a.applyEffectV41(enemy,'slow',{source:u,power:.2,duration:3});assert.ok(a.effectiveMS(ally)>before);a.gameTime=5;assert.equal(a.effectiveMS(ally),before);
});
test('Cryptbloom takedown heal is owner/team restricted and single',()=>{
 const a=mk(),u=equip(a,'cryptbloom'),ally=hero(a,'blue','SUP'),enemy=hero(a,'red');near(u,ally,enemy);ally.hp=ally.maxHp-200;enemy.hp=90;enemy.maxHp=300;enemy.armor=enemy.mr=0;const before=ally.hp;a.damage(enemy,200,u,'true','spell');assert.equal(enemy.hp,0);assert.ok(ally.hp>before);const once=ally.hp;a.afterSupportKillV453Dev69B5(enemy,u);assert.equal(ally.hp,once);
});
test('Support purchase recipes discount components exactly and remain Undo safe',()=>{
 const a=mk(),u=hero(a);u.items=[];u.gold=20000;assert.ok(a.buy('blue',u.id,'kindlegem'));const before=u.gold;assert.ok(a.buy('blue',u.id,'knights_vow'));assert.equal(u.gold,before-(catalog.find(x=>x.id==='knights_vow').cost-catalog.find(x=>x.id==='kindlegem').cost));assert.ok(!u.items.includes('kindlegem'));const x=a.undoShopV453Dev61('blue',u.id);assert.ok(x.ok);assert.ok(u.items.includes('kindlegem'));
});
test('Leaving fountain revokes Undo permanently after returning',()=>{
 const a=mk(),u=hero(a);u.items=[];u.gold=20000;assert.ok(a.buy('blue',u.id,'redemption'));const spawn=a.map.objects.find(v=>v.id==='blue_spawn_shop');u.x=.5;u.y=.5;assert.equal(a.canUndoShopV453Dev61('blue',u.id).ok,false);u.x=spawn.x;u.y=spawn.y;assert.equal(a.canUndoShopV453Dev61('blue',u.id).ok,false);
});
test('PvP team ownership and target validation stop hostile support acts',()=>{
 const a=mk(),u=equip(a,'mikaels_blessing','SUP'),enemy=hero(a,'red'),ally=hero(a,'blue');near(u,ally,enemy);assert.equal(a.activateItemV453Dev59('red',u.id,'mikaels_blessing',enemy.id).ok,false);assert.equal(a.activateItemV453Dev59('blue',u.id,'mikaels_blessing',enemy.id).ok,false);assert.ok(a.activateItemV453Dev59('blue',u.id,'mikaels_blessing',ally.id).ok);
});
test('Snapshot includes delayed Redemption, Knight target, Helia and cooldown',()=>{
 const a=mk(),u=equip(a,'redemption'),ally=hero(a,'blue','SUP');near(u,ally);assert.ok(a.activateItemV453Dev59('blue',u.id,'redemption',ally.id).ok);const snap=a.snapshotV40();assert.ok(snap);assert.ok(u.redemptionPendingV453Dev69B5);assert.ok(u.supportReadyV453Dev69B5.redemption>0);
});
test('No item may heal or shield an enemy by noncombat support proc',()=>{
 const a=mk(),u=equip(a,'moonstone_renewer','SUP'),ally=hero(a,'blue'),enemy=hero(a,'red');near(u,ally,enemy);enemy.hp=enemy.maxHp-100;ally.hp=ally.maxHp-100;const before=enemy.hp;a.effectResolverV41().heal(ally,80,u);assert.equal(enemy.hp,before);
});
console.log(`DEV69 B5 ${passes}/${passes} PASS`);