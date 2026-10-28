/** Audit local shop against real Data Dragon 16.21.1 input, without mutating playable mechanics.
 * Usage: node tools/audit_shop_v453_dev33.mjs [--input PATH] [--output PATH]
 * Never asserts a complete official catalog when input is absent.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
import {catalog,ITEM_RECIPES,ITEM_EFFECTS_V43} from '../engine.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const argv=process.argv.slice(2),arg=(k)=>argv[argv.indexOf(k)+1];
const itemById=new Map(catalog.map(i=>[i.id,i]));
const issues=[],cycles=[];
for(const item of catalog){if(!Number.isFinite(item.cost)||item.cost<0)issues.push({item:item.id,reason:'invalid_cost'});
 if(!item.stats||typeof item.stats!=='object')issues.push({item:item.id,reason:'invalid_stats'});
}
for(const [parent,parts] of Object.entries(ITEM_RECIPES)){
 const node=itemById.get(parent);if(!node)issues.push({item:parent,reason:'parent_not_playable'});
 const subtotal=parts.reduce((n,id)=>n+(itemById.get(id)?.cost||0),0);
 if(node&&subtotal>node.cost)issues.push({item:parent,reason:'ingredients_exceed_item_cost',subtotal,itemCost:node.cost});
 for(const ingredient of parts)if(!itemById.has(ingredient))issues.push({item:parent,reason:'unresolved_ingredient',ingredient});
}
const visit=(id,chain=[])=>{if(chain.includes(id)){cycles.push([...chain,id]);return;}if(chain.length>18){issues.push({item:id,reason:'recipe_depth_gt18'});return;}
 for(const child of ITEM_RECIPES[id]||[])visit(child,[...chain,id]);};
for(const id of Object.keys(ITEM_RECIPES))visit(id);
const effectMaturity=(id)=>ITEM_EFFECTS_V43[id]?.maturity||null;
const audit={schema:'coachlol.shop.audit.v453.dev33',patch:'26.21',localCatalogCount:catalog.length,localRecipeCount:Object.keys(ITEM_RECIPES).length,localEffectDefinitions:Object.keys(ITEM_EFFECTS_V43).length,offlineCatalogComplete:false,source:null,issues,cycles,
 local:[...catalog].map(i=>({id:i.id,riotId:i.riotId||null,name:i.name,cost:i.cost,recipe:ITEM_RECIPES[i.id]||[],effectMaturity:effectMaturity(i.id),sourceType:!i.riotId?'local_training_or_previously_audited':'local_riot_id_reference_not_full_parity'}))};
if(argv.includes('--input')){
 const input=path.resolve(arg('--input')),bytes=fs.readFileSync(input);const payload=JSON.parse(bytes);
 if(payload.version!=='16.21.1'||!payload.data||Array.isArray(payload.data)||typeof payload.data!=='object')throw Error('Expected raw Riot Data Dragon version 16.21.1 item.json');
 const official=Object.entries(payload.data).filter(([id,item])=>/^\d+$/.test(id)&&item?.maps?.['11']===true&&item?.gold?.purchasable===true&&Number(item.gold.total)>0);
 const refIds=new Set(official.map(([id])=>+id));const localIds=new Set(catalog.map(i=>i.riotId).filter(Boolean));
 const missing=official.filter(([id])=>!localIds.has(+id)).map(([id,x])=>({riotId:+id,name:x.name,cost:Number(x.gold.total),from:x.from||[],hasDescription:!!x.description}));
 const mismatched=official.flatMap(([id,x])=>catalog.filter(i=>i.riotId===+id&&i.cost!==Number(x.gold.total)).map(i=>({riotId:+id,local:i.id,localCost:i.cost,officialCost:Number(x.gold.total)})));
 const orphaned=official.flatMap(([id,x])=>(x.from||[]).filter(component=>!refIds.has(Number(component))).map(component=>({riotId:+id,component})));
 Object.assign(audit,{offlineCatalogComplete:missing.length===0&&mismatched.length===0&&orphaned.length===0,source:{fileName:path.basename(input),sha256:crypto.createHash('sha256').update(bytes).digest('hex'),dataDragonVersion:payload.version,format:'external_supplied_file_not_verified_origin'},officialPurchasableSummonersRift:official.length,unmappedOfficialItems:missing,mismatchedCosts:mismatched,unresolvedOfficialRecipeReferences:orphaned});
}
const output=argv.includes('--output')?path.resolve(arg('--output')):path.join(root,'docs/QA_EVIDENCE_V453_DEV33/shop_audit_dev33.json');
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify({localItems:audit.localCatalogCount,officialItems:audit.officialPurchasableSummonersRift??null,localIssues:issues.length,cycles:cycles.length,unmappedOfficialItems:audit.unmappedOfficialItems?.length??null,complete:audit.offlineCatalogComplete,output},null,2));
if(issues.length||cycles.length)process.exitCode=2;
