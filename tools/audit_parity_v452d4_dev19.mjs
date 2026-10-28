import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {CHAMPION_STATS_V38,CHAMPION_GROWTH_V38,CHAMPION_BASE_AA_RANGE,CHAMPION_KITS_V42,ITEM_EFFECTS_V43} from '../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
export function localParityAuditV452d4Dev19({reference=null}={}){
 const kits=load('champion_kits_v42.json'),stats=load('champion_stats_v42.json'),shop=load('item_registry_v43.json'),runes=load('rune_pages_v43.json');
 const names=[...new Set([...Object.keys(CHAMPION_BASE_AA_RANGE),...Object.keys(CHAMPION_STATS_V38),...Object.keys(kits.champions)])].sort();
 const champions=names.map(id=>{
  const manifest=kits.champions[id],p=manifest?.passive,entries=manifest?.spells||{};
  return {id,baseStatsAudited:!!CHAMPION_STATS_V38[id],growthAudited:!!CHAMPION_GROWTH_V38[id],allLevelsAudited:stats.champions[id]?.perLevel?.length===18,
   rangeRegistered:!!CHAMPION_BASE_AA_RANGE[id],passive:p?.status||'missing',spells:Object.fromEntries(['Q','W','E','R'].map(s=>[s,entries[s]?.implemented||'generic_training_fallback'])),
   hasCompleteKit:false,referenceImported:!!reference?.champions?.[id],productionReady:false};
 });
 const items=shop.items.map(i=>({id:i.id,name:i.name,statsMaturity:i.maturity,recipeComponents:(i.recipe||[]).length,
  recipeAudited:false,passiveEffectImplemented:!!i.effect,activeEffectVerified:false,referenceLinked:false}));
 const audited=items.filter(i=>i.statsMaturity==='audited_basic_stats').length;
 return {schema:'coachlol.parityAudit.v1',gamePatch:'26.21',auditedAt:'2026-10-27',state:'PARTIAL_NOT_CERTIFIED',
  referenceImportStatus:reference?'PRESENT_REFERENCE_ONLY':'NOT_AVAILABLE_IN_THIS_EXECUTION',
  summary:{selectableChampions:champions.length,championsWithAuditedStats:champions.filter(x=>x.baseStatsAudited).length,
   championsWithAuditedGrowth:champions.filter(x=>x.growthAudited).length,championsWithAll18LevelsAudited:champions.filter(x=>x.allLevelsAudited).length,
   championKitManifests:Object.keys(kits.champions).length,completeKits:0,shopItems:items.length,itemsWithAuditedBasicStats:audited,
   fullyVerifiedItems:0,prototypeKeystones:Object.values(runes.pages).filter(x=>x.keystone).length,verifiedCompleteRuneTrees:0,
   referenceChampions:reference?reference.counts.champions:null,referenceShopItems:reference?reference.counts.shopItems:null},
  mechanicGaps:[
   {id:'forms_nidalee',champion:'Nidalee',state:'NOT_REGISTERED',requirements:['R human-cougar form toggle','QWER separate forms','hunted target mark','cooldowns per form','combo transitions and fog']},
   {id:'forms_elise',champion:'Elise',state:'NOT_REGISTERED',requirements:['human-spider R','QWER distinct','spiderlings','Rappel untargetable range and landing','shared/independent cooldown transitions']},
   {id:'dragon_form_shyvana',champion:'Shyvana',state:'NOT_REGISTERED',requirements:['Fury resource','dragon form via R','QWER dragon variants','form expiry and temporary movement']},
   {id:'realm_mordekaiser',champion:'Mordekaiser',state:'NOT_REGISTERED',requirements:['7s isolated 1v1 realm','targets/collision/visibility scoped by realm','bounded arena','death/dispel cleanup','stat steal','snapshot/replay']},
   {id:'other_transforms',state:'NOT_AUDITED',requirements:['Jayce','Nidalee','Elise','Gnar','Kayn','Kled','Aphelios','Udyr','Viego','Neeko and others demand kit-specific state machines']},
   {id:'item_passive_active',state:'PARTIAL',requirements:['item recipes/costs from versioned reference','item stats applied by runtime','trigger/target/CD/charges/damage/effect resolver for every active/passive']},
   {id:'champion_base_stats_1_18',state:'PARTIAL',requirements:['stat growth per champion/resource','AS ratio/bonus and range','hp/mana regeneration','champion-specific transforms or growth passives']},
   {id:'full_game_long_match',state:'NOT_CERTIFIED',requirements:['non-scripted 20–40 min match','objectives/teamfights/win condition','endgame/fog/replay']}
  ],champions,items,
  limitations:['A champion in a manifest is not a certified complete playable LoL champion.','The training fallback for skills is NOT that champion real Q/W/E/R.','Data Dragon does not specify all active/passive behavior, dynamic transformations, or realm isolation.','No complete official champion/item set can be asserted unless a version-pinned Data Dragon source was ingested and independently audited.']};
}
if(process.argv[1]&&process.argv[1].endsWith('audit_parity_v452d4_dev19.mjs')){
 const report=localParityAuditV452d4Dev19();
 writeFileSync(new URL('../data/coverage_audit_v452d4_dev19.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report.summary,null,2));
}
