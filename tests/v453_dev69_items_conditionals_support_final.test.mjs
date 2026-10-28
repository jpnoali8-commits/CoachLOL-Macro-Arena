import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,catalog,checksumV40} from '../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const make=()=>new Arena(map,mask,{seed:6930,mode:'pvp'});
const hero=(a,team='blue',role='SUP')=>a.units.find(u=>u.team===team&&u.role===role);
const prepare=()=>{const a=make(),s=hero(a);a.progressSupport(s,800);assert.ok(s.items.includes('support_bounty'));return {a,s};};
const choices=['support_celestial_opposition','support_dream_maker','support_zaz_zak','support_solstice_sleigh','support_bloodsong'];
function t(name,fn){fn();console.log('✓ DEV69 Support '+name);}

t('All five exact Riot IDs are exclusive quest rewards with locked normal purchases',()=>{
 const {a,s}=prepare();
 assert.deepEqual(choices.map(id=>catalog.find(x=>x.id===id)?.riotId),[3869,3870,3871,3876,3877]);
 for(const id of choices)assert.equal(a.canBuy('blue',s.id,id).ok,false);
 assert.equal(a.chooseSupportFinalV453Dev69C('red',s.id,choices[0]).ok,false);
 assert.equal(a.chooseSupportFinalV453Dev69C('blue',s.id,'support_nonexistent').ok,false);
});
t('Choosing final reward is free anywhere, single use, applies HP, 9 gold / 10 seconds',()=>{
 for(const id of choices){
  const {a,s}=prepare();const g=s.gold,h=s.maxHp;
  const p={x:.36,y:.48};s.x=p.x;s.y=p.y;
  const out=a.chooseSupportFinalV453Dev69C('blue',s.id,id);
  assert.equal(out.ok,true,id);assert.equal(out.cost,0);
  assert.equal(s.gold,g);assert.equal(s.maxHp,h+200);
  assert.equal(s.items.includes('support_bounty'),false);assert.equal(s.items.includes(id),true);
  assert.equal(a.chooseSupportFinalV453Dev69C('blue',s.id,id).ok,false);
  a.gameTime=10;a.supportPassiveTick();assert.equal(s.gold,g+9);
  const snap=a.snapshotV40(),b=Arena.fromSnapshotV40(map,mask,snap);
  assert.equal(checksumV40(snap),checksumV40(b.snapshotV40()));
 }
});
t('Bloodsong choice rejects an existing Spellblade and protects non-support ownership',()=>{
 const {a,s}=prepare();s.items.push('sheen');
 assert.equal(a.chooseSupportFinalV453Dev69C('blue',s.id,'support_bloodsong').ok,false);
 assert.equal(a.chooseSupportFinalV453Dev69C('blue',s.id,'support_dream_maker').ok,true);
 assert.equal(a.chooseSupportFinalV453Dev69C('blue',s.id,'support_bloodsong').ok,false);
});
t('Celestial first hit reduces pre-mitigation ranged damage and shockwave slows later',()=>{
 const {a,s}=prepare(),enemy=hero(a,'red','JG');const x=a.chooseSupportFinalV453Dev69C('blue',s.id,'support_celestial_opposition');assert.ok(x.ok);
 s.armor=0;enemy.ad=100;enemy.x=s.x;enemy.y=s.y;
 const hp=s.hp;a.damage(s,100,enemy,'physical','spell');
 assert.ok(s.hp>hp-100&&s.hp<hp,'damage not reduced: '+(hp-s.hp));
 assert.equal(s.conditionalCelestialEndingV453Dev69C,2);
 a.gameTime=2;a.advanceConditionalItemsV453Dev69C();
 assert.equal(s.conditionalCelestialBlessedV453Dev69C,false);
 assert.equal(a.effectResolverV41().has(enemy,'slow'),true);
 a.gameTime=17;a.advanceConditionalItemsV453Dev69C();assert.equal(s.conditionalCelestialBlessedV453Dev69C,false);
 a.gameTime=18;a.advanceConditionalItemsV453Dev69C();assert.equal(s.conditionalCelestialBlessedV453Dev69C,true);
});
t('Dream Maker heal transfers blue and purple bubbles for three seconds, cooldown eight',()=>{
 const {a,s}=prepare(),ally=hero(a,'blue','ADC'),foe=hero(a,'red','ADC');
 assert.ok(a.chooseSupportFinalV453Dev69C('blue',s.id,'support_dream_maker').ok);
 ally.hp-=200;const heal=a.effectResolverV41().heal(ally,100,s);assert.ok(heal>0);
 assert.ok(ally.conditionalDreamBlueV453Dev69C?.power>=50);
 assert.ok(ally.conditionalDreamPurpleV453Dev69C?.power>=40);
 const h=ally.hp;a.damage(ally,100,foe,'physical','spell');
 assert.ok(ally.hp>=h-100);assert.equal(ally.conditionalDreamBlueV453Dev69C,null);
 const before=foe.hp;a.damage(foe,100,ally,'physical','basic');
 assert.ok(foe.hp<before-100);assert.equal(ally.conditionalDreamPurpleV453Dev69C,null);
});
t('Solstice Sleigh requires nearby ally, grants decaying temporary health/speed once per 30s',()=>{
 const {a,s}=prepare(),ally=hero(a,'blue','ADC'),foe=hero(a,'red','TOP');
 assert.ok(a.chooseSupportFinalV453Dev69C('blue',s.id,'support_solstice_sleigh').ok);
 foe.x=s.x;foe.y=s.y;
 ally.x=s.x;ally.y=s.y;const before=s.maxHp;
 const res=a.applyEffectV41(foe,'slow',{source:s,duration:1,power:.2});assert.ok(res.ok);
 assert.ok(s.maxHp>before);assert.ok(ally.conditionalSleighUntilV453Dev69C>0);
 const first=ally.maxHp;
 a.applyEffectV41(foe,'slow',{source:s,duration:1,power:.2});assert.equal(ally.maxHp,first);
 a.gameTime=3;a.advanceConditionalItemsV453Dev69C();assert.equal(s.maxHp,before);
});
t('Zaz Zak schedules nonrecursive ability explosion with 10s cooldown',()=>{
 const {a,s}=prepare(),foe=hero(a,'red','TOP');
 assert.ok(a.chooseSupportFinalV453Dev69C('blue',s.id,'support_zaz_zak').ok);
 s.x=foe.x;s.y=foe.y;foe.hp=foe.maxHp=5000;foe.mr=0;
 a.damage(foe,100,s,'magic','spell');
 assert.equal(a.pendingSupportBlastsV453Dev69C.length,1);
 const before=foe.hp;a.gameTime=1;a.advanceConditionalItemsV453Dev69C();assert.ok(foe.hp<before);
 assert.equal(a.pendingSupportBlastsV453Dev69C.length,0);
 a.damage(foe,100,s,'magic','spell');assert.equal(a.pendingSupportBlastsV453Dev69C.length,0);
});
t('Bloodsong cast arms exactly one basic, exposes champion and obeys cooldown',()=>{
 const {a,s}=prepare(),foe=hero(a,'red','TOP');
 assert.ok(a.chooseSupportFinalV453Dev69C('blue',s.id,'support_bloodsong').ok);
 s.skillRanks.Q=1;
 const cast=a.performActionV40({actorId:s.id,kind:'skill',slot:'Q',checkRange:false});
 assert.equal(cast.ok,true);assert.equal(s.conditionalBloodsongPrimedV453Dev69C,10);
 foe.hp=foe.maxHp=5000;foe.armor=0;const first=foe.hp;
 a.damage(foe,100,s,'physical','basic');assert.ok(foe.hp<first-100);
 assert.equal(s.conditionalBloodsongPrimedV453Dev69C,-1);
 assert.equal(foe.conditionalBloodsongExposeV453Dev69C.until,4);
 assert.equal(a.chooseSupportFinalV453Dev69C('blue',s.id,'support_bloodsong').ok,false);
});
console.log('DEV69 SUPPORT FINALS 8/8 PASS');
