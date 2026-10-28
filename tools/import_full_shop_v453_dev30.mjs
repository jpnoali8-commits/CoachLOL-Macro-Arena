/** CoachLOL official items patch importer.
 * Input must be the REAL Data Dragon item.json downloaded separately from
 * https://ddragon.leagueoflegends.com/cdn/16.21.1/data/en_US/item.json
 * It NEVER invents or guesses a passive from HTML. Item stats are only mapped
 * when Data Dragon carries a numeric field explicitly.
 * --apply mutates local engine between paired generated markers and then
 * synchronizes engine.browser.js. Existing functional items are preserved.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);const flag=k=>args[args.indexOf(k)+1];
const input=flag('--input'),apply=args.includes('--apply');
if(!input){console.error('Usage: node tools/import_full_shop_v453_dev30.mjs --input PATH_TO_AUTHENTIC_16.21.1_ITEM_JSON [--apply]');process.exit(2);}
const src=JSON.parse(fs.readFileSync(path.resolve(input),'utf8'));
if(!src?.data||typeof src.data!=='object')throw Error('Input must contain authentic Data Dragon item.data records');
if(src.version!=='16.21.1')throw Error('Expected Data Dragon 16.21.1; got '+String(src.version));
const fromIds={1001:'boots',1011:'giants_belt',1026:'blasting_wand',1027:'sapphire_crystal',1028:'ruby_crystal',1029:'cloth_armor',1033:'null_magic_mantle',1036:'long_sword',1038:'bf_sword',1043:'recurve_bow',1052:'amp_tome',1054:'dorans_shield',1055:'dorans_blade',1056:'dorans_ring',1058:'needless_rod',1101:'jungle_scorchclaw',1102:'jungle_gustwalker',1103:'jungle_mosstomper',2055:'ward',3020:'sorcerers_shoes',3035:'last_whisper',3089:'rabadon',3111:'mercurys_treads',3123:'executioners_calling',3134:'serrated_dirk',3135:'void_staff',3340:'trinket_stealth',3364:'trinket_oracle',3916:'oblivion_orb',3006:'berserkers_greaves',3057:'sheen',3078:'trinity_force',3071:'black_cleaver',3142:'youmuus_ghostblade',1053:'vampiric_scepter',3105:'kindlegem',3133:'caulfields_warhammer',1004:'faerie_charm',1031:'chain_vest',1037:'pickaxe',1018:'agility_cloak',1042:'dagger',3077:'tiamat',3091:'wits_end',3145:'hextech_alternator',3157:'zhonyas_hourglass',3024:'glacial_buckler',3044:'phage'};
const explicit={FlatHPPoolMod:'hp',FlatMPPoolMod:'mana',FlatPhysicalDamageMod:'ad',FlatMagicDamageMod:'ap',FlatArmorMod:'armor',FlatSpellBlockMod:'mr',FlatMovementSpeedMod:'speed',PercentMovementSpeedMod:'movePercent',PercentAttackSpeedMod:'attackSpeedPct',FlatCritChanceMod:'critChance',PercentLifeStealMod:'lifeSteal'};
const records=Object.entries(src.data).filter(([id,v])=>v?.maps?.['11']===true&&v?.gold?.purchasable===true&&Number(v.gold.total)>0);
const accepted=new Set(records.map(([id])=>id));
const normalized=[],recipes={},unmappedStats=new Set(),missingParents=[];
for(const [id,raw] of records){
 const key=fromIds[id]||'riot_'+id,stats={};
 for(const [rawName,value] of Object.entries(raw.stats||{})){
  if(typeof value!=='number'||!Number.isFinite(value)||value===0)continue;
  if(!explicit[rawName]){unmappedStats.add(rawName);continue;}
  const target=explicit[rawName];stats[target]=(target.endsWith('Percent')||target==='attackSpeedPct'||target==='critChance'||target==='lifeSteal')?+(value*100).toFixed(3):value;
 }
 const rawComponents=Array.isArray(raw.from)?raw.from:[];
 const from=rawComponents.filter(c=>accepted.has(String(c))).map(c=>fromIds[String(c)]||'riot_'+String(c));
 if(rawComponents.length!==from.length)missingParents.push({id,components:rawComponents.filter(c=>!accepted.has(String(c)))});
 if(from.length)recipes[key]=from;
 normalized.push({id:key,riotId:+id,name:String(raw.name),cost:Math.trunc(raw.gold.total),stats,tags:[...(Array.isArray(raw.tags)?raw.tags:[]),'official-26.21','reference'],icon:'◈',image:raw.image?.full||null,patch:'26.21',maturity:'official_data_stats_unverified_passives',from});
}
normalized.sort((a,b)=>a.riotId-b.riotId);
const enginePath=path.join(root,'engine.mjs'),before=fs.readFileSync(enginePath,'utf8');
const originalOnly=before.replace(/\/\* DEV30_OFFICIAL_ITEMS_START \(generated only from authentic input\) \*\/[\s\S]*?\/\* DEV30_OFFICIAL_ITEMS_END \*\//,'');
const present=new Set([...originalOnly.matchAll(/\{id:['"]([^'"]+)['"],(?:riotId:[^,]+,)?name:/g)].map(m=>m[1]));
const newItems=normalized.filter(it=>!present.has(it.id));
const applyBetween=(text,begin,end,insert)=>{
 const first=text.indexOf(begin),last=text.indexOf(end);
 if(first<0||last<=first)throw Error('Missing official-only patch markers');
 return text.slice(0,first+begin.length)+'\n'+insert+'\n'+text.slice(last);
};
const generatedRows=newItems.map(item=>`{id:${JSON.stringify(item.id)},riotId:${item.riotId},name:${JSON.stringify(item.name)},cost:${item.cost},stats:${JSON.stringify(item.stats)},tags:${JSON.stringify(item.tags)},icon:'◈',maturity:'official_data_stats_unverified_passives'},`).join('\n');
const itemIDs=new Set([...present,...newItems.map(i=>i.id)]);
const newRecipes=Object.entries(recipes).filter(([key])=>!present.has(key)).map(([key,from])=>`${JSON.stringify(key)}:${JSON.stringify(from.filter(v=>itemIDs.has(v)))},`).join('\n');
const output={schema:'coachlol.ddragon.item_catalog.v453.dev30',version:src.version,patch:'26.21',scope:'Summoners Rift, purchasable only',status:'official_static_metadata_not_passive_parity',records:normalized.length,newItems:newItems.length,existingKept:normalized.length-newItems.length,unmappedStats:[...unmappedStats],missingIngredients:missingParents,items:normalized};
// DEV32 safety gate: one broken official recipe must never silently become a
// discounted item with missing ingredients. A tiny QA fixture is preview-only.
// The --apply path intentionally demands the FULL patch payload; staging previews
// can be generated from small samples, but cannot modify live combat data.
if(apply&&normalized.length<150)throw Error('DEV32: refusing partial Data Dragon input; at least 150 purchasable SR items required for --apply');
if(apply&&missingParents.length)throw Error('DEV32: recipe has unresolved ingredients; manual audit required before --apply ('+missingParents.length+' records)');
const outFile=args.includes('--output')?path.resolve(flag('--output')):path.join(root,'data','riot_reference','shop_26_21_dev30.json');
fs.mkdirSync(path.dirname(outFile),{recursive:true});fs.writeFileSync(outFile,JSON.stringify(output,null,2)+'\n');
if(apply){
 let s=applyBetween(before,'/* DEV30_OFFICIAL_ITEMS_START (generated only from authentic input) */','/* DEV30_OFFICIAL_ITEMS_END */',generatedRows);
 s=applyBetween(s,'/* DEV30_OFFICIAL_RECIPES_START */','/* DEV30_OFFICIAL_RECIPES_END */',newRecipes);
 fs.writeFileSync(enginePath,s);
 execFileSync('python',['tools/sync_browser_v43.py'],{cwd:root,stdio:'inherit'});
}
console.log(JSON.stringify({patch:output.patch,items:normalized.length,alreadyExisting:output.existingKept,newItems:newItems.length,unmappedStats:output.unmappedStats,applied:apply,output:outFile},null,2));
