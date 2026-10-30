// M45 B02B-03: gameplay effect oracle. This file changes NO legacy gameplay.
// node docs/m45_rust_wasm/inputs/items/golden_b03_effects.test.mjs --write
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {Arena,ITEM_EFFECTS_V43,ITEM_FAMILY_RULES_V453_DEV69,checksumV40} from '../../../../engine.mjs';
import {assertFrozenSourcesB03} from './oracle_source_lock_b03.mjs';
const sourceLock=assertFrozenSourcesB03({shop:true});
const read=file=>JSON.parse(readFileSync(new URL('../../../../data/'+file,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const sha=obj=>createHash('sha256').update(JSON.stringify(obj)).digest('hex');
const hero=(a,team,role='MID')=>a.units.find(u=>u.id===team+'_'+role);
const specs=[
 ['shadowflame','magic_execute_amplifier'],
 ['the_collector','one_kill_one_reward'],
 ['liandrys_torment','ability_burn_only'],
 ['kaenic_rookern','magic_shield_recharge'],
 ['maw_of_malmortius','magic_lifeline'],
 ['force_of_nature','stacked_magic_resistance'],
 ['verdant_barrier','single_spell_annul_60s'],
 ['banshees_veil','single_cc_annul_40s'],
 ['edge_of_night','single_spell_annul_40s']
];
function observe(u){
 return {id:u.id,team:u.team,hp:u.hp,maxHp:u.maxHp,gold:u.gold,items:[...u.items],
   kills:u.kills,deaths:u.deaths,ad:u.ad,ap:u.ap,armor:u.armor,mr:u.mr,
   effects:(u.statusEffectsV41||[]).map(e=>({key:e.key,type:e.type,until:e.until,power:e.power})),
   annulReadyAt:u.itemAnnulReadyAtV453Dev69Batch2??null,
   kaenicReadyAt:u.kaenicReadyAtV453Dev69??null,
   lifelineReadyAt:u.lifelineReadyAtV453Dev69??null,
   forceStacks:u.forceNatureStacksV453Dev69??null,
   forceUntil:u.forceNatureUntilV453Dev69??null,
   economyLedger:(u.economyLedgerV43||[]).map(x=>({kind:x.kind,delta:x.delta,balance:x.balance}))};
}
function exercise(a,u,v,id){
 const effect=a.effectResolverV41();
 if(id==='shadowflame'){
  v.mr=0;v.hp=v.maxHp*.30;
  const boosted=a.damage(v,100,u,'magic','spell');
  u.items=[];v.hp=v.maxHp*.30;
  const plain=a.damage(v,100,u,'magic','spell');
  assert.ok(boosted>plain,'shadowflame threshold must amplify magic');
  return {boosted,plain,assertion:'boosted > plain'};
 }
 if(id==='the_collector'){
  v.armor=0;v.hp=v.maxHp*.06;const kills=u.kills,deaths=v.deaths;
  assert.ok(a.damage(v,30,u,'physical','basic')>0);
  assert.equal(v.hp,0);assert.equal(u.kills,kills+1);assert.equal(v.deaths,deaths+1);
  assert.equal(a.damage(v,30,u,'physical','basic'),0);
  assert.equal(v.deaths,deaths+1);
  assert.ok((u.economyLedgerV43||[]).some(x=>x.kind==='collector'&&x.delta===25));
  return {kills_before:kills,kills_after:u.kills,deaths_after:v.deaths,assertion:'once-only execute +25g'};
 }
 if(id==='liandrys_torment'){
  a.damage(v,80,u,'magic','spell');assert.equal(effect.has(v,'dot'),true);
  const burn=(v.statusEffectsV41||[]).find(x=>x.key==='liandry_'+u.id);
  assert.equal(burn.damageType,'magic');assert.ok(burn.power>0&&burn.until>a.gameTime);
  return {burn_power:burn.power,burn_until:burn.until,assertion:'timed magical dot'};
 }
 if(id==='kaenic_rookern'){
  a.gameTime+=15;a.refreshKaenicShieldV453Dev69(u);
  const barrier=(u.statusEffectsV41||[]).find(x=>x.key==='kaenic_v453_dev69');
  assert.ok(barrier?.power>0);const before=barrier.power;
  a.damage(u,80,v,'physical','basic');assert.equal(barrier.power,before);
  a.damage(u,80,v,'magic','spell');assert.ok(barrier.power<before);
  assert.equal(u.kaenicReadyAtV453Dev69,a.gameTime+15);
  return {shield_before:before,shield_after:barrier.power,assertion:'physical bypasses; magic consumes; 15s recharge'};
 }
 if(id==='maw_of_malmortius'){
  u.hp=u.maxHp*.31;const hp=u.hp;
  a.damage(u,100,v,'magic','spell');assert.equal(u.hp,hp);
  assert.ok(u.lifelineReadyAtV453Dev69>=a.gameTime+90);
  assert.ok(u.mawVampUntilV453Dev69>a.gameTime);
  return {hp_before:hp,hp_after:u.hp,assertion:'triggering magic absorbed; 90s cooldown'};
 }
 if(id==='force_of_nature'){
  u.maxHp=20000;u.hp=u.maxHp;const mr=a.elementalStatsV452d3(u).mr;
  const ms=a.effectiveMS(u);
  for(let i=0;i<8;i++)a.damage(u,40,v,'magic','spell');
  assert.equal(u.forceNatureStacksV453Dev69,8);
  assert.ok(a.elementalStatsV452d3(u).mr>=mr+70);
  assert.ok(a.effectiveMS(u)>ms);
  const stackedMr=a.elementalStatsV452d3(u).mr;
  a.gameTime+=6;assert.equal(a.elementalStatsV452d3(u).mr,mr);
  return {mr_before:mr,mr_stacked:stackedMr,mr_after:a.elementalStatsV452d3(u).mr,
    assertion:'8 stacks, 70 MR, expires'};
 }
 if(id==='banshees_veil'){
  assert.equal(effect.has(u,'spell_shield'),true);
  assert.equal(effect.apply(u,'root',{source:v,duration:2}).ok,false);
  assert.equal(effect.has(u,'spell_shield'),false);
  assert.equal(effect.apply(u,'root',{source:v,duration:2}).ok,true);
  assert.equal(u.itemAnnulReadyAtV453Dev69Batch2,a.gameTime+40);
  return {assertion:'CC blocked exactly once then accepted; 40s cooldown'};
 }
 if(id==='verdant_barrier'||id==='edge_of_night'){
  assert.equal(effect.has(u,'spell_shield'),true);
  const hp=u.hp;
  assert.equal(a.damage(u,100,v,'magic','spell'),0);
  assert.equal(u.hp,hp);assert.equal(effect.has(u,'spell_shield'),false);
  assert.ok(a.damage(u,100,v,'magic','spell')>0);
  assert.equal(u.itemAnnulReadyAtV453Dev69Batch2,a.gameTime+(id==='verdant_barrier'?60:40));
  return {hp_before:hp,hp_after:u.hp,assertion:'first spell blocked and second hits'};
 }
 throw Error('unknown effect fixture '+id);
}
const cases=[];
for(const [id,behavior] of specs){
 assert.ok(ITEM_EFFECTS_V43[id]||ITEM_FAMILY_RULES_V453_DEV69[id],
   'item must have source rule: '+id);
 for(const team of ['blue','red']){
  const seed=450000+specs.findIndex(x=>x[0]===id)*2+(team==='red'?1:0);
  const a=new Arena(map,mask,{seed,mode:'pvp'});
  const u=hero(a,team),v=hero(a,team==='blue'?'red':'blue');
  assert.ok(u&&v);u.items=[];u.gold=30000;
  assert.equal(a.buy(team,u.id,id),true,team+' buy '+id);
  const before={holder:observe(u),opponent:observe(v),
    checksum_v40:checksumV40(a.snapshotV40())};
  const observations=exercise(a,u,v,id);
  const out={id:'M45-B03-'+id+'-'+team,item_id:id,behavior,seed,team,
   actor_id:u.id,opponent_id:v.id,source_lock:sourceLock,
   before,after:{holder:observe(u),opponent:observe(v),
    game_time:a.gameTime,checksum_v40:checksumV40(a.snapshotV40())},observations};
  cases.push({...out,fixture_sha256:sha(out)});
 }
}
assert.equal(cases.length,18);
const result={schema:'coachlol.m45.items.effects.oracle.b03.v1',
 oracle:'JS LEGACY SOURCE ONLY',source_lock:sourceLock,
 case_count:cases.length,cases,execution:'EXECUTED'};
if(process.argv.includes('--write'))
 writeFileSync(new URL('./GOLDEN_B03_EFFECTS_EXECUTED.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',cases:cases.length,sha256:sha(result)}));
