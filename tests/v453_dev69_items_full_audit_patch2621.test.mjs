import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,ITEM_DEFENSE_RULES_V453_DEV69_B4,ITEM_ATTACK_RULES_V453_DEV69_B3,ITEM_OFFENSE_RULES_V453_DEV69_B6,ITEM_REMAINDER_RULES_V453_DEV69_B7} from '../engine.mjs';
const json=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const map=json('../data/coachlol_map_v6.json'),mask=json('../data/masks_128.json');
const mk=()=>new Arena(map,mask,{seed:6921,mode:'pvp'});
const hero=(a,team='blue',role='MID')=>a.units.find(u=>u.id===team+'_'+role);
const equip=(a,id,role='MID')=>{const u=hero(a,'blue',role);u.items=[];u.level=12;u.gold=100000;assert.equal(a.buy('blue',u.id,id),true,id);return u;};
let passed=0;
function test(label,fn){fn();passed++;console.log('✓ 26.21 ITEM PARITY '+label);}

test('26.20 Hexplate exact melee and ranged 26.21 buff (not old 30/15)',()=>{
 const a=mk(),melee=equip(a,'experimental_hexplate','TOP'),ranged=equip(a,'experimental_hexplate','ADC');
 melee.hexplateBuffUntilV453Dev69B4=ranged.hexplateBuffUntilV453Dev69B4=8;
 assert.deepEqual(a.hexplateOverdriveV453Dev69Audit(melee),{attackSpeedPct:50,movePercent:20});
 assert.deepEqual(a.hexplateOverdriveV453Dev69Audit(ranged),{attackSpeedPct:25,movePercent:10});
 a.gameTime=8;
 assert.deepEqual(a.hexplateOverdriveV453Dev69Audit(melee),{attackSpeedPct:0,movePercent:0});
});
test('Hexplate buff changes both movement and attack interval and ends on sale',()=>{
 const a=mk(),u=equip(a,'experimental_hexplate','ADC'),i=a.basicAttackIntervalV452c(u),ms=a.effectiveMS(u);
 u.hexplateBuffUntilV453Dev69B4=8;
 assert.ok(a.basicAttackIntervalV452c(u)<i);
 assert.ok(a.effectiveMS(u)>ms);
 assert.equal(a.sellItemV43('blue',u.id,0).ok,true);
 assert.equal(a.basicAttackIntervalV452c(u),i);
 assert.equal(a.effectiveMS(u),ms);
});
test('Hexplate R activation has 30 simulated second cooldown (even after buff expires)',()=>{
 const a=mk(),u=equip(a,'experimental_hexplate','TOP');u.skillRanks.R=1;u.level=12;u.mana=1000;
 let s=a.performActionV40({actorId:u.id,kind:'skill',slot:'R',source:'qa_items_full'});
 assert.equal(s.ok,true,JSON.stringify(s));
 assert.equal(u.hexplateBuffUntilV453Dev69B4,8);
 assert.equal(u.hexplateReadyAtV453Dev69Audit,30);
 a.gameTime=9;u.skillCds.R=0;u.mana=1000;
 s=a.performActionV40({actorId:u.id,kind:'skill',slot:'R',source:'qa_items_full'});
 assert.equal(s.ok,true,JSON.stringify(s));
 assert.equal(u.hexplateBuffUntilV453Dev69B4,8);
 a.gameTime=31;u.skillCds.R=0;u.mana=1000;
 s=a.performActionV40({actorId:u.id,kind:'skill',slot:'R',source:'qa_items_full'});
 assert.equal(s.ok,true,JSON.stringify(s));
 assert.equal(u.hexplateBuffUntilV453Dev69B4,39);
 assert.equal(u.hexplateReadyAtV453Dev69Audit,61);
});
test('26.20 Runaan uses 60% AD on each secondary hit; no ally target',()=>{
 const a=mk(),u=equip(a,'runaans_hurricane','ADC');
 const primary=hero(a,'red','ADC'),secondary=hero(a,'red','SUP'),ally=hero(a,'blue','SUP');
 for(const v of [primary,secondary,ally]){v.x=u.x;v.y=u.y;v.hp=v.maxHp=10000;v.armor=0;}
 const initial=secondary.hp;
 a.afterBasicAttackItemsV453Dev69B3(u,primary,{landed:true,preHp:10000});
 assert.ok(secondary.hp<initial,'runaan bolt must damage second visible target');
 const actual=initial-secondary.hp;
 assert.ok(Math.abs(actual-u.ad*.60)<=2, 'expected 60% AD, got '+actual+' versus '+u.ad*.60);
 assert.equal(ally.hp,10000);
});
test('26.21 Hubris derives melee 15+3 per stack and ranged 10+2',()=>{
 const a=mk(),melee=equip(a,'hubris','TOP'),ranged=equip(a,'hubris','ADC');
 const victim=hero(a,'red','MID');
 a.onOffensiveKillV453Dev69B6(victim,melee);
 a.onOffensiveKillV453Dev69B6(victim,ranged);
 assert.equal(a.derivedItemStatsV453Dev69(melee).ad,18);
 assert.equal(a.derivedItemStatsV453Dev69(ranged).ad,12);
 a.gameTime=90;
 assert.equal(a.derivedItemStatsV453Dev69(melee).ad,0);
 assert.equal(a.derivedItemStatsV453Dev69(ranged).ad,0);
});
test('26.20 Rocketbelt authoritative proc uses 135 + 15% AP, not obsolete scaling',()=>{
 const rule=ITEM_REMAINDER_RULES_V453_DEV69_B7.hextech_rocketbelt;
 assert.equal(rule.magicDamage,135);
 assert.equal(rule.apRatio,.15);
 const a=mk(),u=equip(a,'hextech_rocketbelt');
 const lane=a.lanes.mid.path,p=lane[Math.floor(lane.length/2)];
 u.x=p.x;u.y=p.y;
 const v=hero(a,'red','MID');v.x=p.x;v.y=p.y;v.hp=v.maxHp=10000;v.mr=0;
 const before=v.hp;
 const result=a.activateItemV453Dev59('blue',u.id,'hextech_rocketbelt',v.id);
 assert.equal(result.ok,true,JSON.stringify(result));
 const dealt=before-v.hp;
 assert.ok(Math.abs(dealt-(135+u.ap*.15))<=2,'rocketbelt damage '+dealt);
 assert.equal(a.activateItemV453Dev59('blue',u.id,'hextech_rocketbelt',v.id).ok,false);
});
test('item stats and active cooldown persist through snapshot without multiplication',()=>{
 const a=mk(),u=equip(a,'experimental_hexplate','TOP');u.hexplateBuffUntilV453Dev69B4=15;u.hexplateReadyAtV453Dev69Audit=30;
 const snap=a.snapshotV40(),b=Arena.fromSnapshotV40(map,mask,snap),other=hero(b,'blue','TOP');
 assert.deepEqual(a.hexplateOverdriveV453Dev69Audit(u),b.hexplateOverdriveV453Dev69Audit(other));
 assert.equal(other.hexplateReadyAtV453Dev69Audit,30);
 assert.deepEqual(b.hexplateOverdriveV453Dev69Audit(other),b.hexplateOverdriveV453Dev69Audit(other));
});
assert.equal(ITEM_DEFENSE_RULES_V453_DEV69_B4.experimental_hexplate.cooldown,30);
assert.equal(ITEM_ATTACK_RULES_V453_DEV69_B3.runaans_hurricane.damageRatio,.60);
assert.equal(ITEM_OFFENSE_RULES_V453_DEV69_B6.hubris.rangedBaseBonusAd,10);
console.log('26.20–26.21 ITEM PARITY '+passed+'/'+passed+' PASS');
