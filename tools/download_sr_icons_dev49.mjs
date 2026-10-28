/** Download somente dos PNGs do Data Dragon 16.21.1 para cache OFFLINE.
 * Nunca consulta Wiki ou CDN de terceiros. Respeita o registro SR verificado.
 * Execução opcional no ambiente com acesso a rede:
 *    node tools/download_sr_icons_dev49.mjs
 *    node tools/download_sr_icons_dev49.mjs --dry-run
 */
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {get} from 'node:https';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../assets/riot/items_16_21_1');
const manifest=JSON.parse(fs.readFileSync(new URL('../data/riot_reference/sr_shop_26_21_dev49.json',import.meta.url)));
const urls=Object.keys(manifest.rows).sort((a,b)=>Number(a)-Number(b));
const base='https://ddragon.leagueoflegends.com/cdn/16.21.1/img/item/';
if(process.argv.includes('--dry-run')){console.log('Riot Data Dragon oficial patch 16.21.1, '+urls.length+' ícones elegíveis; EXEMPLO '+base+urls[0]+'.png');process.exit(0)}
fs.mkdirSync(dir,{recursive:true});
const valid=b=>b?.length>100&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
const fetch=id=>new Promise((resolve,reject)=>{
 const req=get(base+encodeURIComponent(id)+'.png',{timeout:10000},response=>{
  if(response.statusCode!==200){response.resume();reject(Error('HTTP '+response.statusCode));return;}
  const parts=[];let size=0;response.on('data',b=>{size+=b.length;if(size>1024*1024){req.destroy(Error('Arquivo muito grande'));return;}parts.push(b)});
  response.on('end',()=>resolve(Buffer.concat(parts)));response.on('error',reject);
 });req.on('timeout',()=>req.destroy(Error('Timeout')));req.on('error',reject);
});
let success=0,failed=[];
for(let i=0;i<urls.length;i+=8){await Promise.all(urls.slice(i,i+8).map(async id=>{
 const out=path.join(dir,id+'.png');
 try{if(fs.existsSync(out)&&valid(fs.readFileSync(out))){success++;return;}
  const bytes=await fetch(id);if(!valid(bytes))throw Error('PNG inválido');fs.writeFileSync(out,bytes);success++;
 }catch(e){failed.push({id,reason:e.message})}
 }));}
const report={patch:'26.21',ddVersion:'16.21.1',downloaded:success,total:urls.length,failed};
fs.writeFileSync(new URL('../data/riot_reference/offline_icons_dev49.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
const cached=urls.filter(id=>fs.existsSync(path.join(dir,id+'.png'))&&valid(fs.readFileSync(path.join(dir,id+'.png'))));
fs.writeFileSync(new URL('../data/riot_reference/offline_icons_dev49.js',import.meta.url),
 'window.COACHLOL_ITEM_ICON_CACHE_DEV49 = '+JSON.stringify({patch:'16.21.1',ids:cached})+';\n');
console.log('SR_OFFLINE_ICONS',JSON.stringify({downloaded:success,total:urls.length,failed:failed.length}));
if(failed.length)process.exitCode=2;
