// Export the verified latest playable mapping without changing the archived dev36 export
// or authorizing any automatic engine changes from reference JSON.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadOfficial} from './catalog_official_v453_dev36.mjs';
import {catalog,ITEM_RECIPES,ITEM_EFFECTS_V43} from '../engine.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dest=path.join(root,'data/riot_reference');
const evidence=path.join(root,'docs/QA_EVIDENCE_V453_DEV37');fs.mkdirSync(evidence,{recursive:true});
const built=loadOfficial();
if(built.ddVersion!=='16.21.1'||built.counts.localPlayableItems!==70||built.audit.priceDeltas.length!==2||built.audit.recipeDeltas.length!==0)throw Error('DEV37_RECONCILIATION_INCOMPLETE');
if(built.audit.recipeMissingIds.length||built.audit.recipeCycles.length||built.audit.localMissingFromOfficial.length)throw Error('DEV37_REFERENCE_INTEGRITY');
const out={schema:'coachlol.catalog.reference.v453.dev37',patch:built.patch,ddVersion:built.ddVersion,status:built.status,counts:built.counts,items:built.items};
fs.writeFileSync(path.join(dest,'catalog_26_21_dev37.json'),JSON.stringify(out,null,2)+'\n');
fs.writeFileSync(path.join(dest,'catalog_26_21_dev37.js'),'window.COACHLOL_OFFICIAL_CATALOG = '+JSON.stringify(out)+';\n');
const coverage=catalog.map(item=>{
 const r=Object.values(built.items).find(v=>v.localId===item.id);
 return {id:item.id,riotId:r?.id||null,name:item.name,cost:item.cost,recipe:ITEM_RECIPES[item.id]||[],
  statsPlayable:Object.keys(item.stats||{}),effectKind:ITEM_EFFECTS_V43[item.id]?.kind||null,
  effectsMaturity:ITEM_EFFECTS_V43[item.id]?.maturity||'not_certified',
  functionalLevel:['scouts_slingshot'].includes(item.id)?'stats_only_partial_passive':
   item.id==='seekers_armguard'?'stats_plus_single_use_stasis':
   item.id==='blighting_jewel'?'stats_magic_penetration':
   item.id==='dorans_ring'?'stats_only_regen_not_implemented':
   ITEM_EFFECTS_V43[item.id]?'partial_verified_or_training_effect':'stats_or_utility_only'};
});
fs.writeFileSync(path.join(evidence,'item_coverage_dev37.json'),JSON.stringify({schema:'coachlol.item_coverage.v453.dev37',patch:'26.21',total:coverage.length,items:coverage},null,2)+'\n');
const report={schema:'coachlol.dev37.reconciliation',patch:built.patch,version:built.ddVersion,playable:coverage.length,
 staticRecords:built.counts.all,priceMismatches:built.audit.priceDeltas,
 recipeMismatches:built.audit.recipeDeltas,newItems:['3144','4630','2420'],
 limitations:['Quest upgrades retain internal 0 gold transition despite DDragon 400 cost field',
 'Scout Slingshot Bullseye not simulated; Rapid Firecannon energized effect remains registered_not_implemented',
 'Doran Ring bonus mana regen/damage to minions not simulated; local item currently applies only AP and HP',
 'Seeker Armguard one-time stasis and Zhonya stasis are adapted 2.5s effects; 1:1 game parity not claimed',
 'Full 246 candidates and 173 champion kits remain NOT certified']};
fs.writeFileSync(path.join(evidence,'official_reconciliation_dev37.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({playable:coverage.length,priceMismatches:report.priceMismatches.length,recipeMismatches:0,referenceOnly:true}));
