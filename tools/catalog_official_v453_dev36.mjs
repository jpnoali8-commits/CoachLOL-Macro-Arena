/** CoachLOL Dev36: build a searchable READ-ONLY official patch reference.
 * Data Dragon provides metadata, NOT executable gameplay. CommunityDragon
 * requiredChampion and special forms are supplementary client evidence.
 * Never mutates the authoritative engine or the playable local shop.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {catalog,ITEM_RECIPES,ITEM_EFFECTS_V43} from '../engine.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const home=path.join(root,'data/riot_reference');
const source=path.join(home,'source_16_21_1');
const read=(p)=>JSON.parse(fs.readFileSync(path.join(source,p),'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const plain=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();
const assert=(b,m)=>{if(!b)throw Error(m)};
const idSort=(a,b)=>Number(a)-Number(b);
export function buildCatalog({en,pt,client,local=catalog,recipes=ITEM_RECIPES,effects=ITEM_EFFECTS_V43}={}){
 assert(en?.version==='16.21.1'&&pt?.version==='16.21.1','PATCH_VERSION_MISMATCH');
 assert(Object.keys(en.data||{}).length>=500,'FULL_DATA_DRAGON_REQUIRED');
 assert(Array.isArray(client)&&client.length>=500,'FULL_CLIENT_ITEMS_REQUIRED');
 const c=new Map(client.map(item=>[String(item.id),item]));
 const crosswalk=JSON.parse(fs.readFileSync(path.join(home,'local_id_crosswalk_26_21_dev36.json'),'utf8')).localIdToRiotId;
 const localMap=new Map();
 for(const item of local){
  const id=item.riotId||crosswalk[item.id];
  if(id&&en.data[String(id)]){
   if(localMap.has(String(id))&&localMap.get(String(id)).id!==item.id)throw Error('LOCAL_ID_CONFLICT:'+id);
   localMap.set(String(id),item);
  }
 }
 const results={},classes={},classCounts={},recipeErrors=[],specialEvolutions=[];
 for(const id of Object.keys(en.data).sort(idSort)){
  const item=en.data[id];const ptItem=pt.data?.[id],info=c.get(id)||null;
  const rift=item.maps?.['11']===true,rawPurchasable=item.gold?.purchasable===true;
  const restricted=String(info?.requiredChampion||'').trim();
  const from=(item.from||[]).map(String);
  const conditional=rawPurchasable&&from.some(part=>en.data[part]?.gold?.purchasable===false);
  let kind= 'non_summoners_rift';
  if(rift){
   if(restricted) kind='champion_exclusive';
   else if(id==='1515')kind='minion_turret_internal'; // Client reports Turret Plating, inStore=false.
   else if(!rawPurchasable||info?.inStore===false)kind='non_purchasable';
   else if(conditional)kind='conditional_evolution';
   else kind='shop_reference';
  }
  for(const p of from)if(!en.data[p])recipeErrors.push({item:id,missing:p});
  const candidate=localMap.get(id)||null;
  // A local quest-only registry entry is still NOT an ordinary shop item.
  // Keep the original browse-only certification bit independent of code presence.
  const playable=candidate&&!candidate.notPurchasable&&kind==='shop_reference'?candidate:null;
  const officialPrice=Number(item.gold?.total||0);
  const r={id,name:plain(item.name),namePt:plain(ptItem?.name||item.name),cost:officialPrice,
   priceBase:Number(item.gold?.base||0),sell:Number(item.gold?.sell||0),from,into:(item.into||[]).map(String),
   stats:item.stats||{},tags:item.tags||[],image:item.image?.full||null,
   description:plain(item.description),descriptionPt:plain(ptItem?.description||''),
   map11:rift,ddPurchasable:rawPurchasable,clientInStore:info?.inStore??null,
   category:kind,requiredChampion:restricted||null,
   specialRecipe:info?.specialRecipe||0, localPlayable:!!playable, localId:playable?.id||null,
   localCost:playable?.cost??null, localRecipe:playable?(recipes[playable.id]||[]).map(x=>{const original=local.find(i=>i.id===x);return original?.riotId||crosswalk[x]||null}).filter(Boolean).map(String):[],
   knownEffect:playable?.id&&effects[playable.id]?effects[playable.id].kind:null,
   mechanicsCertified:false,eligibleToBeAddedToGame:false,
   dataPatch:'26.21',clientSource:'CommunityDragon latest captured 2026-10-27 (not patch-pinned)'};
  results[id]=r;classCounts[kind]=(classCounts[kind]||0)+1;
  if(conditional)specialEvolutions.push({id,name:r.name,from});
 }
 const localUnmatched=local.filter(x=>!localMap.has(String(x.riotId||crosswalk[x.id]||''))).map(x=>({localId:x.id,name:x.name,riotId:x.riotId??crosswalk[x.id]??null}));
 const priceDeltas=Object.values(results).filter(x=>x.localPlayable&&x.localCost!==x.cost).map(x=>({id:x.id,name:x.name,localId:x.localId,localCost:x.localCost,officialCost:x.cost}));
 const recipeDeltas=Object.values(results).filter(x=>x.localPlayable&&x.from.length&&JSON.stringify(x.from.slice().sort())!==JSON.stringify(x.localRecipe.slice().sort()))
    .map(x=>({id:x.id,name:x.name,localId:x.localId,officialFrom:x.from,localFrom:x.localRecipe}));
 // Detect loops in the authentic raw recipe graph (including special forms).
 const done=new Set(),stack=new Set(),cycles=[];
 function visit(id){if(stack.has(id)){cycles.push(id);return;}if(done.has(id))return;done.add(id);stack.add(id);for(const next of results[id].from)if(results[next])visit(next);stack.delete(id)}
 for(const id of Object.keys(results))visit(id);
 const counts={all:Object.keys(results).length,rift:Object.values(results).filter(x=>x.map11).length,
  riotPurchasableRift:Object.values(results).filter(x=>x.map11&&x.ddPurchasable).length,
  localPlayableItems:local.length,localMatchedToOfficial:Object.values(results).filter(x=>x.localPlayable).length,
  championProfiles:173,...classCounts};
 const audit={schema:'coachlol.catalog.audit.dev36',patch:'26.21',version:'16.21.1',counts,
  recipeMissingIds:recipeErrors,recipeCycles:cycles,conditionalSupportUpgrades:specialEvolutions,
  localMissingFromOfficial:localUnmatched,priceDeltas,recipeDeltas,
  sourceLimitations:['CommunityDragon/latest not guaranteed to match Data Dragon patch','Data Dragon purchase flag does not alone certify shop availability','No playable mechanics granted for reference-only items','Minion/turret internal items must not be exposed in the normal store'],
  approvedForAutomaticGameplay:false};
 return {schema:'coachlol.catalog.reference.v453.dev36',patch:'26.21',ddVersion:'16.21.1',status:'BROWSE_ONLY_DO_NOT_BUY',counts,items:results,audit};
}
export function loadOfficial(){return buildCatalog({en:read('riot/16.21.1/en_US/item.json'),pt:read('riot/16.21.1/pt_BR/item.json'),client:read('communitydragon/latest/items.json')})}
export function stage(){
 const model=loadOfficial();const dir=home;
 fs.writeFileSync(path.join(dir,'catalog_26_21_dev36.json'),JSON.stringify({schema:model.schema,patch:model.patch,ddVersion:model.ddVersion,status:model.status,counts:model.counts,items:model.items},null,2)+'\n');
 fs.writeFileSync(path.join(dir,'catalog_26_21_dev36.js'),'window.COACHLOL_OFFICIAL_CATALOG = '+JSON.stringify({patch:model.patch,status:model.status,counts:model.counts,items:model.items})+';\n');
 const evidence=path.join(root,'docs/QA_EVIDENCE_V453_DEV36');fs.mkdirSync(evidence,{recursive:true});
 fs.writeFileSync(path.join(evidence,'catalog_audit_26_21.json'),JSON.stringify(model.audit,null,2)+'\n');
 const summary={...model.counts,recipeMissing:model.audit.recipeMissingIds.length,cycles:model.audit.recipeCycles.length,
  specialUpgradeRecipes:model.audit.conditionalSupportUpgrades.length,
  priceMismatches:model.audit.priceDeltas.length,recipeMismatches:model.audit.recipeDeltas.length,
  localUnmatched:model.audit.localMissingFromOfficial.length,referenceOnly:true};
 console.log(JSON.stringify(summary,null,2));return model;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))stage();
