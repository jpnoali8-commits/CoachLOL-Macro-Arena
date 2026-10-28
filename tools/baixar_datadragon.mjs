/**
 * CoachLOL asset cache import — uses Riot's public Data Dragon only.
 * No Riot API key. Run with Node >= 20 and explicit flags.
 * Not a game rules importer: abilities/passives need dedicated implementation.
 */
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../assets/riot');
const args=process.argv.slice(2);
const getArg=name=>{const token=args.find(x=>x.startsWith(`--${name}=`));return token?.split('=').slice(1).join('=')};
const version=getArg('version')||'16.21.1';
const locale=getArg('locale')||'pt_BR';
const icons=args.includes('--icons')||args.includes('--all');
const splash=args.includes('--splash')||args.includes('--all');
const loading=args.includes('--loading')||args.includes('--all');
const out=path.join(base,version,locale);
const cdn=`https://ddragon.leagueoflegends.com/cdn/${version}`;
const manifest={provider:'Riot Data Dragon',version,locale,downloaded:new Date().toISOString(),assets:[],errors:[]};
const limit=6;let active=0;const wait=[];
async function withSlot(fn){if(active>=limit)await new Promise(r=>wait.push(r));active++;try{return await fn()}finally{active--;wait.shift()?.()}}
async function get(url){return await withSlot(async()=>{
 const res=await fetch(url,{signal:AbortSignal.timeout(20000)});
 if(!res.ok)throw new Error(`${res.status}: ${url}`);
 return new Uint8Array(await res.arrayBuffer());
})}
async function save(url,rel){try{const bytes=await get(url),fname=path.join(out,rel);await mkdir(path.dirname(fname),{recursive:true});await writeFile(fname,bytes);manifest.assets.push({file:rel,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});return true}catch(e){manifest.errors.push({file:rel,url,error:String(e)});return false}}
await mkdir(out,{recursive:true});
const data={};
for(const part of ['champion','item','summoner','runesReforged']){
 const url=`${cdn}/data/${locale}/${part}.json`;
 if(await save(url,`data/${part}.json`))data[part]=JSON.parse(await readFile(path.join(out,'data',`${part}.json`),'utf-8'));
}
let calls=[];
if(icons){
 const champIds=Object.keys(data.champion?.data||{});
 for(const id of champIds)calls.push(save(`${cdn}/img/champion/${id}.png`,`img/champion/${id}.png`));
 for(const [id,item] of Object.entries(data.item?.data||{}))if(item?.image?.full)calls.push(save(`${cdn}/img/item/${item.image.full}`,`img/item/${item.image.full}`));
 const spells=Object.values(data.summoner?.data||{});
 for(const spell of spells)if(spell.image?.full)calls.push(save(`${cdn}/img/spell/${spell.image.full}`,`img/spell/${spell.image.full}`));
 const runes=data.runesReforged||[];
 for(const style of runes){if(style.icon)calls.push(save(`https://ddragon.leagueoflegends.com/cdn/img/${style.icon}`,`img/${style.icon}`));for(const slot of style.slots||[])for(const rune of slot.runes||[])if(rune.icon)calls.push(save(`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`,`img/${rune.icon}`))}
}
if(splash||loading){for(const id of Object.keys(data.champion?.data||{})){
 if(splash)calls.push(save(`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_0.jpg`,`img/splash/${id}_0.jpg`));
 if(loading)calls.push(save(`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_0.jpg`,`img/loading/${id}_0.jpg`));
}}
await Promise.all(calls);
// Optional: cache real QWER icon metadata and images for local offline use.
// Example: node tools/baixar_datadragon.mjs --abilities --roster=Ahri,Jinx,Nami,Volibear,Warwick
if(args.includes('--abilities')){
 const chosen=(getArg('roster')||'Ahri,Jinx,Nami,Volibear,Warwick,Vex,LeeSin,Darius,Caitlyn,Leona').split(',').filter(Boolean);
 for(const id of chosen){
  if(!await save(`${cdn}/data/${locale}/champion/${id}.json`,`data/champion/${id}.json`))continue;
  const detail=JSON.parse(await readFile(path.join(out,'data/champion',`${id}.json`),'utf8'));
  const champion=detail.data?.[id];
  if(champion?.image?.full)await save(`${cdn}/img/champion/${champion.image.full}`,`img/champion/${champion.image.full}`);
  await Promise.all((champion?.spells||[]).filter(v=>v.image?.full).map(v=>save(`${cdn}/img/spell/${v.image.full}`,`img/spell/${v.image.full}`)));
 }
}

await writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
console.log(`Cache Data Dragon ${version}/${locale}: ${manifest.assets.length} arquivos, ${manifest.errors.length} erros.`);
console.log(`Output: ${out}`);
if(manifest.errors.length)process.exitCode=1;
