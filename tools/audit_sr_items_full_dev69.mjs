/**
 * CoachLOL dev69: evidence-first full SR item inventory audit.
 *
 * Deliberately DOES NOT grant certification from a catalog flag, a name
 * match, or a syntactic hook. Behavioural certification must be entered
 * through reviewed per-mechanic tests and patch-parity evidence.
 *
 * Usage: node tools/audit_sr_items_full_dev69.mjs
 * Emits JSON/CSV under artifacts/items_full_audit_dev69/.
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {catalog,ITEM_RECIPES,officialSaleValueV453Dev60} from '../engine.mjs';

const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const sr=read('../data/riot_reference/sr_shop_26_21_dev49.json');
const riot=read('../data/riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json').data;
const byLocal=new Map(catalog.map(i=>[i.id,i]));
const issues=[];
const records=[];
const officialId=id=>Number(byLocal.get(id)?.riotId||Object.values(sr.rows).find(row=>row.localId===id)?.id)||null;
const classify=item=>{
 const tags=item?.tags||[];
 if(tags.includes('support'))return 'support';
 if(tags.includes('jungle')||tags.includes('JG'))return 'jungle';
 if(tags.includes('boots')||tags.includes('move'))return 'footwear';
 if(tags.includes('active'))return 'active';
 if(tags.includes('tank')||tags.includes('defense'))return 'defense';
 if(tags.includes('mage'))return 'magic';
 if(tags.includes('assassin')||tags.includes('fighter')||tags.includes('marksman'))return 'offense';
 return 'utility_or_component';
};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
for(const [id,row] of Object.entries(sr.rows)){
 const source=riot[id],item=byLocal.get(row.localId);
 const normal=row.status==='engine_playable'||row.status==='reference_only';
 const flags=[];
 if(!source)flags.push('riot_source_missing');
 if(!item)flags.push('local_item_missing');
 if(item&&item.riotId!==Number(id))flags.push('riot_id_link_mismatch');
 if(source&&row.price!==source.gold.total)flags.push('snapshot_price_mismatch');
 if(source&&row.basePrice!==source.gold.base)flags.push('snapshot_combine_price_mismatch');
 if(source&&item&&item.cost!==source.gold.total)flags.push('engine_price_mismatch');
 if(source&&item&&officialSaleValueV453Dev60(item.id)!==source.gold.sell)flags.push('engine_sale_mismatch');
 const parts=(ITEM_RECIPES[row.localId]||[]).map(officialId);
 if(source&&item&&row.localId!=='trinket_farsight'&&!same(parts,(source.from||[]).map(Number)))flags.push('recipe_components_mismatch');
 const desc=String(row.passiveOrActiveDescription||'');
 const taggedEffect=/<passive>|<active>|<rules>|<mainactive>/i.test(desc)||/<attention>[^<]*<\/attention>[^<]*<br>/i.test(desc);
 const dynamicZero=/>(?:0(?:\.0+)?)(?:<|%)/.test(desc);
 const record={
  riot_id:id,local_id:row.localId||null,riot_name:source?.name||row.name||null,
  category:classify(item),shop_scope:normal?'normal':row.tier||'conditional',
  catalog_flag:row.status||'unclassified',riot_record:!!source,engine_item:!!item,
  economy_verified:!flags.some(f=>f.includes('price')||f.includes('sale')||f.includes('link')),
  recipe_verified:!flags.some(f=>f.startsWith('recipe')),
  mechanics_review_required:taggedEffect,official_dynamic_zero_detected:dynamicZero,
  certification:'uncertified',certification_reason:'No end-to-end patch parity evidence bound to this Riot ID',
  issues:flags
 };
 records.push(record);
 for(const code of flags)issues.push({riot_id:id,local_id:row.localId,code});
}
const normals=records.filter(r=>r.shop_scope==='normal');
const families=Object.fromEntries([...new Set(records.map(r=>r.category))].sort().map(k=>[k,records.filter(x=>x.category===k).length]));
const report={
 schema:'coachlol.items.audit.dev69.v1',
 source:{patch:sr.patch,dataDragon:sr.ddVersion,normalExpected:sr.counts.normalStore},
 summary:{
  normalRows:normals.length,normalCatalogFlags:Object.fromEntries([...new Set(normals.map(r=>r.catalog_flag))].map(k=>[k,normals.filter(r=>r.catalog_flag===k).length])),
  officialRecords:records.filter(r=>r.riot_record).length,localEntries:records.filter(r=>r.engine_item).length,
  certified:0,uncertified:records.length,
  structuralDiscrepancies:issues.length,
  priceAndRecipeRowsWithIssues:records.filter(r=>r.issues.length).length,
  flaggedDynamicZero:records.filter(r=>r.official_dynamic_zero_detected).length,
  families
 },
 issues,records
};
const out=resolve('artifacts/items_full_audit_dev69');
mkdirSync(out,{recursive:true});
writeFileSync(resolve(out,'matrix.json'),JSON.stringify(report,null,2)+'\n');
const cols=['riot_id','local_id','riot_name','category','shop_scope','catalog_flag','economy_verified','recipe_verified','mechanics_review_required','official_dynamic_zero_detected','certification','issues'];
const cell=v=>'"'+String(Array.isArray(v)?v.join(';'):v??'').replaceAll('"','""')+'"';
writeFileSync(resolve(out,'matrix.csv'),cols.join(',')+'\n'+records.map(r=>cols.map(k=>cell(r[k])).join(',')).join('\n')+'\n');
writeFileSync(resolve(out,'discrepancies.json'),JSON.stringify(issues,null,2)+'\n');
console.log('DEV69 SR ITEM FULL-AUDIT',JSON.stringify(report.summary,null,2));
console.log('Artifacts: '+out);
if(normals.length!==202||sr.counts.normalStore!==202||sr.counts.referenceOnly!==0){
 console.error('Full-audit gate: unexpected normal-shop counts');process.exitCode=1;
}
if(records.some(r=>r.catalog_flag==='engine_playable'&&!r.engine_item)){
 console.error('Full-audit gate: playable normal item without local engine registry');process.exitCode=1;
}
