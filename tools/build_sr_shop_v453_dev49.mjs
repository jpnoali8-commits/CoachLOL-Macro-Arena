/** CoachLOL DEV49: fonte canônica SR PC 26.21 / Riot Data Dragon 16.21.1.
 * Não inclui ARAM/TFT/Classic/Arena, registros removidos, nem libera itens não certificados.
 * CommunityDragon/latest foi importado anteriormente como evidência suplementar,
 * nunca como autoridade para forçar preço, receita ou disponibilidade.
 */
import fs from 'node:fs';
import {catalog, ITEM_RECIPES, ITEM_EFFECTS_V43} from '../engine.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const raw=read('../data/riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json');
const old=read('../data/riot_reference/catalog_26_21_dev39.json');
const cross=read('../data/riot_reference/local_id_crosswalk_26_21_dev36.json').localIdToRiotId;
if(raw.version!=='16.21.1'||old.patch!=='26.21')throw Error('Versão do catálogo incorreta');
const mapped=new Map();
for(const item of catalog){let id=String(item.riotId||cross[item.id]||'');if(id&&raw.data[id]){
 if(mapped.has(id))throw Error('ID duplicado: '+id);mapped.set(id,item);
}}
// Data Dragon maps['11'] inclui entradas de modo alternativo por conveniência.
// Não confundir o mapa 453 (League Classic) com SR moderno: ele é OUTRO modo.
// Faixas de IDs reservadas para variantes especiais; Guardian/Cappa = ARAM.
const alternativeModeIds=new Set(['2051','2141','3112','3177','3184']);
const uncertainDuplicatePetIds=new Set(['1105','1106','1107']);
const rows={},rejected=[];
for(const [id,item] of Object.entries(raw.data)){
 const isSR=item.maps?.['11']===true,purchasable=item.gold?.purchasable===true,client=old.items?.[id];
 // A informação da versão fixa do Data Dragon prevalece sobre catálogos antigos.
 if(!isSR||!purchasable||client?.clientInStore===false){rejected.push({id,reason:!isSR?'not_summoners_rift':!purchasable?'not_purchasable':'not_in_client_store'});continue;}
 if(Number(id)>=100000||alternativeModeIds.has(id)||uncertainDuplicatePetIds.has(id)){
  rejected.push({id,reason:Number(id)>=100000?'alternative_mode_variant':alternativeModeIds.has(id)?'aram_specific':'unverified_jungle_pet_duplicate'});continue;
 }
 const conditional=client?.category==='conditional_evolution';
 const exclusive=!!client?.requiredChampion||client?.category==='champion_exclusive';
 const local=mapped.get(id),status=conditional?'conditional_quest':exclusive?'champion_exclusive':local?'engine_playable':'reference_only';
 const ids=(item.from||[]).map(String),into=(item.into||[]).filter(x=>raw.data[x]?.maps?.['11']===true).map(String);
 const epic=ids.length&&into.length>0,legendary=ids.length&&!into.length;
 const tier=conditional?'conditional':exclusive?'exclusive':legendary?'legendary':epic?'epic':item.tags?.includes('Lane')||item.tags?.includes('Jungle')?'starter':'basic';
 const realRecipe=local?(ITEM_RECIPES[local.id]||[]).map(x=>String(catalog.find(y=>y.id===x)?.riotId||cross[x]||'')):[];
 rows[id]={id,name:item.name,price:item.gold.total,basePrice:item.gold.base,from:ids,into,
  icon:`${id}.png`,tags:item.tags||[],tier,status,localId:local?.id||null,
  passiveOrActiveDescription:item.description||'',
  effectCode:local?ITEM_EFFECTS_V43[local.id]?.kind||null:null,
  recipeVerified:local?JSON.stringify([...realRecipe].sort())===JSON.stringify([...ids].sort()):null};
}
const counts={srPurchasable:Object.keys(rows).length,
 normalStore:Object.values(rows).filter(x=>!['conditional','exclusive'].includes(x.tier)).length,
 conditional:Object.values(rows).filter(x=>x.tier==='conditional').length,
 championExclusive:Object.values(rows).filter(x=>x.tier==='exclusive').length,
 normalPlayable:Object.values(rows).filter(x=>x.status==='engine_playable'&&!['conditional','exclusive'].includes(x.tier)).length,
 referenceOnly:Object.values(rows).filter(x=>x.status==='reference_only').length,
 localCatalog:catalog.length};
const mismatch=Object.values(rows).filter(x=>x.localId&&(!x.recipeVerified||catalog.find(i=>i.id===x.localId).cost!==x.price));
const out={schema:'coachlol.sr.shop.dev49',patch:'26.21',ddVersion:'16.21.1',scope:'SOMENTE SUMMONERS RIFT NORMAL / MAPA 11',counts,rows,rejected,mismatch,
 limitation:'Dados oficiais não executam passivas/ativos: itens reference_only não podem ser comprados. Fonte de ícones: Data Dragon versionado, sem Wiki.'};
fs.writeFileSync(new URL('../data/riot_reference/sr_shop_26_21_dev49.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
fs.writeFileSync(new URL('../data/riot_reference/sr_shop_26_21_dev49.js',import.meta.url),'window.COACHLOL_SR_SHOP_DEV49 = '+JSON.stringify(out)+';\n');
console.log('SR_DEV49',JSON.stringify(counts),'mismatches',mismatch.length);
if(mismatch.length)console.log(mismatch.map(x=>x.id+':'+x.localId).join(','));
