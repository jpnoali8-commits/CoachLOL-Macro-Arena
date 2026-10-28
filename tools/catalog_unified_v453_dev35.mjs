/**
 * CoachLOL Dev35: audit-only item / internal-unit catalogue staging.
 * Official source of static item fields: Riot Data Dragon; Wiki taxonomy is
 * independently curated because a wiki category is NOT the same as shop eligibility.
 * Never modifies the live shop, minion stats, tower stats, or champion rules.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const SOURCE_URLS=Object.freeze({riot:'https://ddragon.leagueoflegends.com/cdn/16.21.1/data/en_US/item.json',wiki:'https://wiki.leagueoflegends.com/en-us/Item_(League_of_Legends)',community:'https://www.communitydragon.org/docs/assets'});
export const CATEGORIES=Object.freeze(['shop','champion_exclusive','minion_turret_internal','non_summoners_rift','non_purchasable_other']);
const sha=o=>crypto.createHash('sha256').update(o).digest('hex');
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const obj=o=>o&&typeof o==='object'&&!Array.isArray(o);
function assert(cond,msg){if(!cond)throw Error(msg);}
function treeStatus(items){const errors=[],visited=new Set(),stack=new Set();
 function visit(id){if(stack.has(id)){errors.push(`RECIPE_CYCLE:${id}`);return;}if(visited.has(id))return;visited.add(id);stack.add(id);
  const i=items[id];if(i)for(const component of i.from){if(!items[component])errors.push(`MISSING_COMPONENT:${id}:${component}`);else visit(component);}stack.delete(id);
 }
 for(const id of Object.keys(items))visit(id);return [...new Set(errors)];
}
export function normalizeTaxonomyOverrides(manual={}){
 assert(obj(manual),'TAXONOMY_NOT_OBJECT');const rules={};
 for(const [id,entry] of Object.entries(manual)){
  assert(/^\d+$/.test(id),'TAXONOMY_NONNUMERIC_ID:'+id);assert(obj(entry),'TAXONOMY_INVALID:'+id);
  assert(CATEGORIES.includes(entry.category),'TAXONOMY_CATEGORY_INVALID:'+id);
  assert(typeof entry.source==='string'&&/^https:\/\//.test(entry.source),'TAXONOMY_MISSING_EVIDENCE:'+id);
  if(entry.category==='champion_exclusive')assert(Array.isArray(entry.eligibleChampions)&&entry.eligibleChampions.length>0,'TAXONOMY_CHAMPION_ELIGIBILITY_MISSING:'+id);
  if(entry.category==='minion_turret_internal')assert(Array.isArray(entry.appliesTo)&&entry.appliesTo.length>0&&entry.appliesTo.every(x=>['melee','caster','siege','super','turret_outer','turret_inner','turret_inhibitor','turret_nexus','inhibitor','nexus'].includes(x)),'TAXONOMY_UNIT_ELIGIBILITY_MISSING:'+id);
  rules[id]={category:entry.category,source:entry.source,eligibleChampions:entry.eligibleChampions||[],appliesTo:entry.appliesTo||[],reviewStatus:'needs_gameplay_review'};
 }
 return rules;
}
export function buildUnifiedCatalog(data,{version='16.21.1',taxonomy={},strict=true,sourceBytes=null}={}){
 assert(obj(data)&&obj(data.data)&&data.version===version,'DATA_DRAGON_VERSION_OR_SCHEMA_INVALID');
 const ids=Object.keys(data.data).filter(id=>/^\d+$/.test(id));
 if(strict)assert(ids.length>=150,`DATA_DRAGON_PARTIAL_${ids.length}`);
 const overrides=normalizeTaxonomyOverrides(taxonomy);const missingOverrideIds=Object.keys(overrides).filter(id=>!ids.includes(id));
 if(strict)assert(!missingOverrideIds.length,'TAXONOMY_IDS_NOT_FOUND:'+missingOverrideIds.join(','));
 const records={},counts=Object.fromEntries(CATEGORIES.map(k=>[k,0]));
 for(const id of ids.sort((a,b)=>+a-+b)){
  const raw=data.data[id];if(!obj(raw))continue;
  const rift=raw.maps?.['11']===true,purchasable=raw.gold?.purchasable===true;
  const manual=overrides[id]||null;
  // No claim that unknown non-shop entries are internal turret/minion assets.
  const category=manual?.category||(rift&&purchasable?'shop':!rift?'non_summoners_rift':'non_purchasable_other');
  // An explicit internal-unit record is NEVER turned into a shop item.
  const shopAvailable=category==='shop'&&rift&&purchasable;
  const from=(Array.isArray(raw.from)?raw.from:[]).map(String),into=(Array.isArray(raw.into)?raw.into:[]).map(String);
  const cost=Number(raw.gold?.total||0),stats={};
  for(const [k,v] of Object.entries(raw.stats||{}))if(finite(v))stats[k]=v;
  records[id]={id,name:String(raw.name||id),category,shopAvailable,purchasePolicy:category==='champion_exclusive'?'requires_matching_champion':shopAvailable?'shop':'never_shop',sourceClassification:manual?'wiki_manual_review':'datadragon_flags_only',patch:'26.21',dataDragon:version,map11:rift,rawPurchasable:purchasable,gold:{total:finite(cost)?cost:0,base:Number(raw.gold?.base)||0,sell:Number(raw.gold?.sell)||0},from,into,stats,tags:Array.isArray(raw.tags)?raw.tags.map(String):[],image:String(raw.image?.full||''),description:String(raw.description||''),eligibleChampions:manual?.eligibleChampions||[],appliesTo:manual?.appliesTo||[],mechanicsCertified:false};
  counts[category]++;
 }
 const errors=treeStatus(records); // all recipes, including units / mode-exclusive records
 const unsafeShopRecipes=Object.values(records).filter(i=>i.shopAvailable).flatMap(i=>i.from.filter(id=>!records[id]?.shopAvailable).map(id=>`${i.id}:${id}`));
 return {schema:'coachlol.catalog.unified.v1',patch:'26.21',dataDragon:version,source:'Riot Data Dragon',status:'REFERENCE_ONLY_NOT_GAME_RULES',sourceHash:sourceBytes?sha(sourceBytes):null,sourceUrls:SOURCE_URLS,counts,records,validation:{total:Object.keys(records).length,recipeErrors:errors,unsafeShopRecipes,unknownNonShop:Object.values(records).filter(i=>!i.shopAvailable&&i.sourceClassification==='datadragon_flags_only').length,manuallyClassified:Object.keys(overrides).length,missingOverrideIds,readyForLiveActivation:false},note:'Static catalog metadata only. Wiki internal unit entries are NOT purchasable. Patch effects, item actives, champion exclusivity and unit modifiers require manual review and QA.'};
}
export function canShopBuy(record,championId=null){
 if(!record||!record.map11||!record.rawPurchasable)return false;
 if(record.category==='shop')return record.shopAvailable===true;
 if(record.category==='champion_exclusive')return Array.isArray(record.eligibleChampions)&&record.eligibleChampions.includes(String(championId||''));
 return false;
}
export const UNIT_TYPES=Object.freeze(['melee','caster','siege','super','turret_outer','turret_inner','turret_inhibitor','turret_nexus','inhibitor','nexus']);
const FIELDS=Object.freeze(['hp','damage','armor','mr','range','speed','interval','hpGainPer90s','damageGainPer90s','hpCap','damageCap','resistanceDecay']);
export function verifyUnitBalanceSnapshot(s,{strict=true}={}){
 const errors=[];if(s?.schema!=='coachlol.unit.balance.v1')errors.push('INVALID_SCHEMA');
 if(!/^26\.\d{2}$/.test(String(s?.patch||'')))errors.push('INVALID_PATCH');
 if(!obj(s?.units))errors.push('INVALID_UNITS');
 else for(const [id,r] of Object.entries(s.units)){
  if(!UNIT_TYPES.includes(id))errors.push('UNKNOWN_UNIT:'+id);
  if(!obj(r))errors.push('INVALID_UNIT:'+id);
  else for(const [k,v] of Object.entries(r))if(!FIELDS.includes(k)||!(finite(v)&&v>=0||obj(v)&&k==='resistanceDecay'&&Object.values(v).every(x=>finite(x)&&x>=0)))errors.push('UNREVIEWED_OR_INVALID_FIELD:'+id+'.'+k);
 }
 if(strict)for(const t of UNIT_TYPES)if(!s?.units?.[t])errors.push('MISSING_UNIT:'+t);
 return {ok:errors.length===0,errors};
}
export function compareUnitBalance(a,b){
 assert(verifyUnitBalanceSnapshot(a).ok&&verifyUnitBalanceSnapshot(b).ok,'UNIT_SNAPSHOT_INVALID');assert(a.patch!==b.patch,'UNIT_PATCHES_MUST_DIFFER');
 const changes=[];for(const id of UNIT_TYPES)for(const field of FIELDS){const before=a.units[id][field]??null,after=b.units[id][field]??null;
  if(JSON.stringify(before)!==JSON.stringify(after))changes.push({unit:id,field,before,after,requiresReview:true});}
 return {schema:'coachlol.unit.balance.diff.v1',from:a.patch,to:b.patch,status:'NOT_APPLIED',changes,requiredQA:['farm_0_to_5min','minion_waves_5_to_35min','turret_targeting','baron_buffed_minions','herald_charge_and_turret_damage','organic_nexus_matches','match_pacing_multi_seed','snapshot_replay_determinism'],engineActivated:false};
}
const entry=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(entry){
 try{
  const args=process.argv.slice(2),get=k=>{const i=args.indexOf('--'+k);return i>=0?args[i+1]:null;};
  if(args[0]==='stage'){
   const file=get('items'),output=get('output'),taxonomy=get('taxonomy');assert(file&&output,'USAGE: stage --items AUTHENTIC_ITEM_JSON --output STAGED_JSON [--taxonomy reviewed_overrides.json] [--sample]');
   const bytes=fs.readFileSync(file),source=JSON.parse(bytes),overrides=taxonomy?JSON.parse(fs.readFileSync(taxonomy,'utf8')):{};
   const staged=buildUnifiedCatalog(source,{version:get('version')||'16.21.1',taxonomy:overrides,strict:!args.includes('--sample'),sourceBytes:bytes});
   fs.mkdirSync(path.dirname(path.resolve(output)),{recursive:true});fs.writeFileSync(output,JSON.stringify(staged,null,2)+'\n');
   console.log(JSON.stringify({output,counts:staged.counts,validation:staged.validation,status:staged.status},null,2));
   if(staged.validation.recipeErrors.length||staged.validation.unsafeShopRecipes.length)process.exitCode=2;
  }else if(args[0]==='diff-units'){
   assert(get('before')&&get('after')&&get('output'),'USAGE: diff-units --before SNAP --after SNAP --output DIFF');
   const a=JSON.parse(fs.readFileSync(get('before'),'utf8')),b=JSON.parse(fs.readFileSync(get('after'),'utf8'));const diff=compareUnitBalance(a,b);
   fs.writeFileSync(get('output'),JSON.stringify(diff,null,2)+'\n');console.log(JSON.stringify({changes:diff.changes.length,output:get('output'),status:diff.status},null,2));
  }else throw Error('USAGE: stage | diff-units');
 }catch(e){console.error('CATALOG_DEV35_ERROR:',e.message);process.exitCode=1;}
}
