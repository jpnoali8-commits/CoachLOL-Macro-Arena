// M45 B02B-03: second authored effect-family oracle. No new items/gameplay.
// node docs/m45_rust_wasm/inputs/items/golden_b03_effects_extra.test.mjs --write
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {Arena,ITEM_FAMILY_RULES_V453_DEV69,checksumV40} from '../../../../engine.mjs';
import {assertFrozenSourcesB03} from './oracle_source_lock_b03.mjs';
const source_lock=assertFrozenSourcesB03({shop:true});
const read=f=>JSON.parse(readFileSync(new URL('../../../../data/'+f,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const hero=(a,team,role='MID')=>a.units.find(x=>x.id===team+'_'+role);
const names=['overlords_bloodmail','steraks_gage','cosmic_drive','riftmaker',
 'chempunk_chainsword','immortal_shieldbow','seryldas_grudge','bloodletters_curse','abyssal_mask'];
function readUnit(u){
 return {id:u.id,team:u.team,gold:u.gold,hp:u.hp,maxHp:u.maxHp,ad:u.ad,ap:u.ap,mr:u.mr,
  items:[...u.items],tenacity:u.tenacity??0,gameStatus:(u.statusEffectsV41||[]).map(x=>({
   key:x.key,type:x.type,power:x.power,until:x.until})),
  lifelineCd:u.lifelineReadyAtV453Dev69??null,
  bloodletter:u.bloodletterShredV453Dev69??null,
  cosmicSprint:u.cosmicSprintUntilV453Dev69??null};
}
function exercise(a,u,v,id){
 const effects=a.effectResolverV41();
 if(id==='overlords_bloodmail'){
  const full=a.elementalStatsV452d3(u).ad;
  u.hp=u.maxHp*.25;const missing=a.elementalStatsV452d3(u).ad;
  assert.ok(missing>full);
  assert.equal(a.sellItemV43(u.team,u.id,0).ok,true);
  const sold=a.elementalStatsV452d3(u).ad;
  assert.ok(sold<full);
  return {full,missing,sold,rule:'derived AD from bonus HP and missing HP, sale removes'};
 }
 if(id==='steraks_gage'){
  assert.ok(u.tenacity>=20);const ad=a.elementalStatsV452d3(u).ad;
  u.hp=u.maxHp*.31;a.damage(u,90,v,'physical','basic');
  assert.ok(u.lifelineReadyAtV453Dev69>a.gameTime);
  return {bonus_ad:ad,lifeline_cd:u.lifelineReadyAtV453Dev69,rule:'AD + tenacity + reactive shield'};
 }
 if(id==='cosmic_drive'){
  const ms=a.effectiveMS(u);a.damage(v,50,u,'physical','basic');
  assert.equal(a.effectiveMS(u),ms);
  a.damage(v,50,u,'magic','spell');
  const buff=a.effectiveMS(u);assert.ok(buff>ms);
  a.gameTime+=5;assert.equal(a.effectiveMS(u),ms);
  return {before:ms,buffed:buff,after:a.effectiveMS(u),rule:'magic proc only, expires'};
 }
 if(id==='riftmaker'){
  assert.ok(a.elementalStatsV452d3(u).ap-u.ap>0);
  v.mr=0;a.damage(v,100,u,'magic','spell');a.gameTime+=4;v.hp=v.maxHp;
  const amplified=a.damage(v,100,u,'magic','spell');
  // Server-authoritative sale rather than erasing an item without reverting stats.
  assert.equal(a.sellItemV43(u.team,u.id,0).ok,true);
  v.hp=v.maxHp;const plain=a.damage(v,100,u,'magic','spell');
  assert.ok(amplified>plain);
  return {amplified,plain,rule:'health->AP and combat ramp, sale clears item'};
 }
 if(id==='chempunk_chainsword'){
  a.damage(v,90,u,'magic','spell');assert.equal(effects.has(v,'grievous_wounds'),false);
  a.damage(v,80,u,'physical','basic');assert.equal(effects.has(v,'grievous_wounds'),true);
  return {wounds_active:true,rule:'physical only, magic does not trigger'};
 }
 if(id==='immortal_shieldbow'){
  u.hp=u.maxHp*.31;const before=u.hp;
  a.damage(u,80,v,'physical','basic');assert.equal(u.hp,before);
  assert.ok((u.statusEffectsV41||[]).some(x=>x.key==='lifeline_v453_dev69'));
  const sale=a.sellItemV43(u.team,u.id,0);
  assert.equal(sale.refund,2100);assert.equal(effects.has(u,'shield'),false);
  return {before,hp_after:u.hp,sale_refund:sale.refund,rule:'triggering shield + official sale'};
 }
 if(id==='seryldas_grudge'){
  v.hp=v.maxHp*.40;
  a.damage(v,40,u,'physical','basic');assert.equal(effects.has(v,'slow'),false);
  a.damage(v,40,u,'physical','spell');assert.equal(effects.has(v,'slow'),true);
  assert.equal(a.canBuy(u.team,u.id,'lord_dominiks_regards').ok,false);
  return {slow_active:true,rule:'spell only and Fatality exclusivity'};
 }
 if(id==='bloodletters_curse'){
  v.hp=10000;v.maxHp=10000;
  for(let i=0;i<6;i++){a.damage(v,20,u,'magic','spell');a.gameTime++;}
  assert.equal(v.bloodletterShredV453Dev69.stacks,4);
  const until=v.bloodletterShredV453Dev69.until;
  a.gameTime+=7;assert.ok(until<a.gameTime);
  return {stacks:4,until,now:a.gameTime,rule:'four max stacks, six-second expiry'};
 }
 if(id==='abyssal_mask'){
  const s=hero(a,u.team,'SUP');s.items=[];s.gold=30000;
  assert.equal(a.buy(s.team,s.id,'abyssal_mask'),true);
  // Test-only placement, identical to the frozen source audit scenario.
  s.x=v.x;s.y=v.y;v.mr=0;v.armor=0;v.hp=v.maxHp;
  const boosted=a.damage(v,100,u,'magic','spell');
  assert.ok(boosted>100);
  return {boosted,holder:s.id,rule:'ally support aura amplifies magic damage'};
 }
 throw Error('unexpected item '+id);
}
const cases=[];
for(const [i,id] of names.entries()){
 assert.ok(ITEM_FAMILY_RULES_V453_DEV69[id],id+' not in frozen family rules');
 for(const team of ['blue','red']){
  const seed=451000+i*2+(team==='red'?1:0);
  const a=new Arena(map,mask,{seed,mode:'pvp'});
  const u=hero(a,team),v=hero(a,team==='blue'?'red':'blue');
  assert.ok(u&&v);
  u.items=[];u.gold=30000;
  if(id!=='abyssal_mask')assert.equal(a.buy(u.team,u.id,id),true);
  const before={holder:readUnit(u),enemy:readUnit(v),hash_v40:checksumV40(a.snapshotV40())};
  const observations=exercise(a,u,v,id);
  const result={case_id:'M45-B03B-'+id+'-'+team,source_lock,item_id:id,seed,team,
   actor_id:u.id,opponent_id:v.id,before,after:{holder:readUnit(u),enemy:readUnit(v),
    time:a.gameTime,hash_v40:checksumV40(a.snapshotV40())},observations};
  cases.push({...result,fixture_sha256:hash(result)});
 }
}
assert.equal(cases.length,18);
const fixture={schema:'coachlol.m45.items.effects.oracle.b03b.v1',
 source_lock,execution:'EXECUTED',case_count:cases.length,cases};
if(process.argv.includes('--write'))
 writeFileSync(new URL('./GOLDEN_B03B_EFFECTS_EXECUTED.json',import.meta.url),JSON.stringify(fixture,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',cases:cases.length,sha256:hash(fixture)}));
