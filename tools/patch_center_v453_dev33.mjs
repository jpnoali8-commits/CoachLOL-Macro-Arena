/** CoachLOL patch center: trustworthy static reference snapshots and reviewable diffs.
 * No network / engine mutations while staging local files. No automatic effect activation.
 * Official upstream: Data Dragon (ddragon.leagueoflegends.com); patch notes also require manual analysis.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=text=>crypto.createHash('sha256').update(text).digest('hex');
const read=(f)=>JSON.parse(fs.readFileSync(path.resolve(f),'utf8'));
const write=(f,obj)=>{fs.mkdirSync(path.dirname(path.resolve(f)),{recursive:true});fs.writeFileSync(path.resolve(f),JSON.stringify(obj,null,2)+'\n');};
const anyArray=a=>Array.isArray(a)?a:[];
const digits=v=>/^\d+\.\d+\.\d+$/.test(String(v||''));
const validVersion=(v)=>{if(!digits(v))throw Error('Versão Data Dragon inválida: '+String(v));return v};
export function patchFromDataDragon(version){const [yr,seq]=validVersion(version).split('.').map(Number);return (yr+10)+'.'+String(seq).padStart(2,'0');}
function validatePayload(data,version,kind,min){
 if(!data||typeof data!=='object'||data.version!==version||!data.data||typeof data.data!=='object')throw Error(`Arquivo oficial ${kind} inválido ou incompatível com ${version}`);
 if(Object.keys(data.data).length<min)throw Error(`${kind}: catálogo incompleto (${Object.keys(data.data).length} < ${min}); snapshot recusado`);
}
function sanitizeNumbers(obj){return Object.fromEntries(Object.entries(obj||{}).filter(([k,v])=>typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<1e8).sort(([a],[b])=>a.localeCompare(b)));}
function stableHash(data){return sha(JSON.stringify(data||''));}
function itemRecord(id,it){
 const from=anyArray(it.from).map(String), into=anyArray(it.into).map(String);
 return {id,name:String(it.name||''),cost:Math.round(Number(it.gold?.total)||0),baseCost:Math.round(Number(it.gold?.base)||0),sell:Math.round(Number(it.gold?.sell)||0),purchasable:it.gold?.purchasable===true,maps11:it.maps?.['11']===true,components:from,buildsInto:into,stats:sanitizeNumbers(it.stats),tags:anyArray(it.tags).map(String).sort(),descriptionHash:stableHash([it.description||'',it.plaintext||'']),image:String(it.image?.full||'')};
}
function championRecord(name,ch,detail){
 const source=detail?.data?.[name]||detail?.data?.[ch.id]||null;
 const spells=anyArray(source?.spells).map((sp,i)=>({slot:['Q','W','E','R'][i]||String(i),id:String(sp.id||''),name:String(sp.name||''),cooldown:anyArray(sp.cooldown).map(Number),cooldownBurn:String(sp.cooldownBurn||''),cost:anyArray(sp.cost).map(Number),costBurn:String(sp.costBurn||''),range:anyArray(sp.range).map(Number),rangeBurn:String(sp.rangeBurn||''),descriptionHash:stableHash([sp.description,sp.tooltip,sp.effectBurn,sp.vars]),descriptionStatus:'requires_behavior_review'}));
 return {id:String(ch.id||name),key:String(ch.key||''),name:String(ch.name||''),stats:sanitizeNumbers(ch.stats),passive:source?{name:String(source.passive?.name||''),descriptionHash:stableHash(source.passive?.description||'')}:null,spells,abilityDetailsLoaded:!!source};
}
export function normalizePatch({items,champions,details={},version,locale='en_US',strict=true,sources={}}){
 validVersion(version);validatePayload(items,version,'items',strict?150:1);validatePayload(champions,version,'champions',strict?120:1);
 if(!/^[a-z]{2}_[A-Z]{2}$/.test(locale))throw Error('Locale inválido');
 const entries=Object.entries(items.data).filter(([id,i])=>/^\d+$/.test(id)&&i&&i.gold&&i.maps?.['11']===true);
 const itemIndex=Object.fromEntries(entries.map(([id,it])=>[id,itemRecord(id,it)]));
 const recipeGaps=[];
 for(const item of Object.values(itemIndex)){
  if(!item.maps11||!item.purchasable)continue;
  for(const component of item.components)if(!itemIndex[component])recipeGaps.push({item:item.id,missingIngredient:component});
 }
 const champIndex={};
 for(const [key,ch] of Object.entries(champions.data)){
  if(!ch?.id)continue;
  const detailed=details[key]||details[ch.id];
  if(detailed&&detailed.version!==version)throw Error(`Detalhes do campeão ${key} pertencem a outro patch`);
  champIndex[ch.id]=championRecord(key,ch,detailed);
 }
 const normalized={schema:'coachlol.patch.snapshot.v1',patch:patchFromDataDragon(version),dataDragonVersion:version,locale,source:'Riot Data Dragon',status:'reference_staged_unapproved',sources,items:itemIndex,champions:champIndex,validation:{items:Object.keys(itemIndex).length,champions:Object.keys(champIndex).length,championsWithDetails:Object.values(champIndex).filter(c=>c.abilityDetailsLoaded).length,recipeGaps,mechanicsImplementation:'MANUAL_REVIEW_REQUIRED',certifiedForCombat:false}};
 if(strict&&Object.keys(itemIndex).length<150)throw Error('Incompleto: itens');
 if(strict&&Object.keys(champIndex).length<120)throw Error('Incompleto: campeões');
 return normalized;
}
const kinds={items:['cost','baseCost','sell','purchasable','maps11','components','stats','descriptionHash','tags'],champions:['stats','passive','spells']};
function deepSort(obj){if(Array.isArray(obj))return obj.map(deepSort);if(obj&&typeof obj==='object')return Object.fromEntries(Object.keys(obj).sort().map(k=>[k,deepSort(obj[k])]));return obj;}
function stableEq(a,b){return JSON.stringify(deepSort(a))===JSON.stringify(deepSort(b))}
const categories={cost:'gold',baseCost:'gold',sell:'gold',components:'recipe',stats:'numeric',spells:'skill',passive:'passive',descriptionHash:'text_change',maps11:'availability',purchasable:'availability'};
export function diffPatches(oldPatch,newPatch){
 if(oldPatch?.schema!=='coachlol.patch.snapshot.v1'||newPatch?.schema!=='coachlol.patch.snapshot.v1')throw Error('Snapshots inválidos');
 if(oldPatch.locale!==newPatch.locale)throw Error('Não compare idiomas diferentes; descrições gerariam falsos positivos');
 if(oldPatch.dataDragonVersion===newPatch.dataDragonVersion)throw Error('Use dois patches diferentes');
 const changes=[];
 for(const collection of ['items','champions']){
  const oldData=oldPatch[collection]||{},newData=newPatch[collection]||{};
  for(const id of [...new Set([...Object.keys(oldData),...Object.keys(newData)])].sort()){
   const before=oldData[id],after=newData[id];
   if(!before||!after){changes.push({collection,id,name:after?.name||before?.name,type:before?'removed':'added',category:'availability',review:'required',before:before||null,after:after||null});continue;}
   for(const field of kinds[collection]){
    if(stableEq(before[field],after[field]))continue;
    if(collection==='champions'&&field==='spells'){
      const a=Object.fromEntries(before.spells.map(s=>[s.slot,s])),b=Object.fromEntries(after.spells.map(s=>[s.slot,s]));
      for(const slot of new Set([...Object.keys(a),...Object.keys(b)]))if(!stableEq(a[slot],b[slot]))changes.push({collection,id,name:after.name,field:'spells.'+slot,type:'modified',category:'skill',review:'required',before:a[slot]||null,after:b[slot]||null});
    }else changes.push({collection,id,name:after.name,field,type:'modified',category:categories[field]||'metadata',review:'required',before:before[field]??null,after:after[field]??null});
   }
  }
 }
 const summary={};for(const ch of changes)summary[ch.category]=(summary[ch.category]||0)+1;
 return {schema:'coachlol.patch.diff.v1',from:oldPatch.patch,to:newPatch.patch,fromVersion:oldPatch.dataDragonVersion,toVersion:newPatch.dataDragonVersion,status:'pending_manual_review',automaticCombatActivation:false,summary,changes};
}
export function buildReviewQueue(diff){
 if(diff?.schema!=='coachlol.patch.diff.v1')throw Error('diff inválido');
 return {schema:'coachlol.patch.review.v1',from:diff.from,to:diff.to,activation:'BLOCKED_UNTIL_APPROVED_AND_TESTED',pending:diff.changes.map(({collection,id,field,type,category})=>({collection,id,field:field||null,type,category,decision:'pending',evidence:[],automatedTest:null})),requirements:['source official 26.x patch notes','confirm item availability for Summoners Rift','verify item/passive/active behavior and champion Q/W/E/R ratios','test recipe component purchases and full inventory','test 30-minute pacing / winner spread','snapshot migration and replay compatibility'],notes:'Patch notes may change formulas omitted from Data Dragon. Never auto-approve or edit engine.mjs from a raw snapshot.'};
}
function parseArgs(list){const v={};for(let i=0;i<list.length;i++){if(list[i].startsWith('--')){const name=list[i].slice(2);v[name]=(list[i+1]&&!list[i+1].startsWith('--'))?list[++i]:true;}}return v;}
function required(arg,key){if(!arg[key]||arg[key]===true)throw Error('--'+key+' obrigatório');return String(arg[key]);}
async function main(){
 const [action,...opts]=process.argv.slice(2),args=parseArgs(opts);
 if(action==='stage'){
  const ver=validVersion(required(args,'version'));
  const itemFile=required(args,'items'),champFile=required(args,'champions');
  const details={};
  if(args.details){for(const entry of fs.readdirSync(args.details)){if(!entry.endsWith('.json'))continue;const doc=read(path.join(args.details,entry));const key=path.basename(entry,'.json');details[key]=doc;}}
  const snapshot=normalizePatch({items:read(itemFile),champions:read(champFile),details,version:ver,locale:args.locale||'en_US',strict:args['allow-sample']!==true,sources:{items:{filename:path.basename(itemFile),sha256:sha(fs.readFileSync(itemFile))},champions:{filename:path.basename(champFile),sha256:sha(fs.readFileSync(champFile))},detailFiles:Object.keys(details).length,detailChecksums:Object.fromEntries(Object.keys(details).sort().map(name=>[name,sha(fs.readFileSync(path.join(args.details,name+'.json')))]))}});
  const target=path.resolve(required(args,'out'));
  if(fs.existsSync(target)&&!args.replace)throw Error('Snapshot já existe; use --replace explicitamente');
  write(target,snapshot);
  console.log(JSON.stringify({file:target,patch:snapshot.patch,status:snapshot.status,counts:snapshot.validation},null,2));
 }else if(action==='diff'){
  const diff=diffPatches(read(required(args,'from')),read(required(args,'to'))),dest=required(args,'out');write(dest,diff);
  const review=String(args.review||dest.replace(/\.json$/,'_review.json'));write(review,buildReviewQueue(diff));
  console.log(JSON.stringify({file:path.resolve(dest),review:path.resolve(review),summary:diff.summary,total:diff.changes.length,activation:diff.status},null,2));
 }else if(action==='status'){
  const file=path.resolve(args.input||path.join(ROOT,'data','patch_center','current.json'));const o=read(file);
  console.log(JSON.stringify({patch:o.activePatch,dataDragon:o.activeDataDragon,activation:o.activation,currentStatus:o.status,nextPatch:o.nextPatch,warning:o.warning},null,2));
 }else throw Error('Usage: node tools/patch_center_v453_dev33.mjs stage --version 16.21.1 --items ITEM.json --champions CHAMPION.json [--details DIR] --out SNAPSHOT.json | diff --from OLD.json --to NEW.json --out DIFF.json | status');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(err=>{console.error('PATCH_CENTER_ERROR:',err.message);process.exitCode=1;});
