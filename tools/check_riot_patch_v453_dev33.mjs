/** Online/offline version checker and optional official Data Dragon file fetch.
 * Does not change engine or activate mechanics. Use --versions-file for offline CI.
 * A check is a one-shot operation, not a background service.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {patchFromDataDragon} from './patch_center_v453_dev33.mjs';
import {SCHEDULE_2026} from './patch_release_v453_dev34.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function selectLatestCompatible(versions,active='16.21.1'){
 if(!Array.isArray(versions)||!versions.length)throw Error('Lista de versões vazia');
 const parse=(x)=>{if(!/^\d+\.\d+\.\d+$/.test(x))return null;return x.split('.').map(Number)};
 const valid=versions.filter(v=>parse(v)).sort((a,b)=>{const x=parse(a),y=parse(b);return(y[0]-x[0])||(y[1]-x[1])||(y[2]-x[2])});
 if(!valid.length)throw Error('Sem versões válidas');
 const cmp=(a,b)=>{const x=parse(a),y=parse(b);return(x[0]-y[0])||(x[1]-y[1])||(x[2]-y[2])};
 return {current:active,latest:valid[0],patch:patchFromDataDragon(valid[0]),hasUpdate:cmp(valid[0],active)>0,olderOrEqual:cmp(valid[0],active)<=0};
}
/** Existence in versions.json != a production launch. PBE/future stays preview-only. */
export function classifyVersionFeed(match,asOf='2026-10-27'){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(asOf))throw Error('asOf inválido');
 const scheduled=SCHEDULE_2026[match.patch]||null;
 const preview=!!match.hasUpdate&&(!scheduled||asOf<scheduled);
 return {scheduled,previewOnly:preview,releaseCandidate:!!match.hasUpdate&&!preview,releaseConfirmed:false,liveCombatUnchanged:true,
  note:preview?'FUTURE_OR_PBE_PREVIEW: never activate; release notes and independent review required':
   'Data Dragon availability never proves official release or authorizes combat changes'};
}
export async function officialFetch(url){
 const parsed=new URL(url);
 if(parsed.hostname!=='ddragon.leagueoflegends.com'||parsed.protocol!=='https:')throw Error('Only official Data Dragon HTTPS endpoints allowed');
 const result=await fetch(url,{signal:AbortSignal.timeout(18000)});
 if(!result.ok)throw Error(`${result.status} ao acessar ${url}`);
 return result.json();
}
const args=process.argv.slice(2),has=k=>args.includes('--'+k),option=(k,defaultValue)=>{const i=args.indexOf('--'+k);return i>=0?args[i+1]:defaultValue};
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const status=JSON.parse(fs.readFileSync(path.join(ROOT,'data/patch_center/current.json'),'utf8'));
  const versions=has('versions-file')?JSON.parse(fs.readFileSync(option('versions-file'),'utf8')):await officialFetch('https://ddragon.leagueoflegends.com/api/versions.json');
  const match=selectLatestCompatible(versions,status.activeDataDragon);
  const stage=classifyVersionFeed(match,new Date().toISOString().slice(0,10));
  const result={...match,...stage,checkedVia:has('versions-file')?'OFFLINE_FIXTURE':'OFFICIAL_DATA_DRAGON',instructions:'Compare release notes and stage full item/champion/champion detail JSON; manually review passives and kit formulas before activation.'};
  console.log(JSON.stringify(result,null,2));
  if(has('fetch')&&match.hasUpdate){
   const version=match.latest,locale=option('locale','en_US');
   if(!/^[a-z]{2}_[A-Z]{2}$/.test(locale))throw Error('Locale inválido');
   if(has('versions-file'))throw Error('Offline version fixtures cannot authorize remote data download');
   const sourceBase=`https://ddragon.leagueoflegends.com/cdn/${version}/data/${locale}`;
   const [items,champions]=await Promise.all([officialFetch(sourceBase+'/item.json'),officialFetch(sourceBase+'/champion.json')]);
   if(items.version!==version||champions.version!==version||Object.keys(items.data||{}).length<150||Object.keys(champions.data||{}).length<120)throw Error('Official payload incomplete or wrong version');
   const dir=path.join(ROOT,'data','patch_center',stage.previewOnly?'previews':'incoming',version,locale);
   if(fs.existsSync(dir))throw Error('Patch files already staged, do not silently replace: '+dir);
   fs.mkdirSync(dir,{recursive:true});
   fs.writeFileSync(path.join(dir,'item.json'),JSON.stringify(items));
   fs.writeFileSync(path.join(dir,'champion.json'),JSON.stringify(champions));
   console.log((stage.previewOnly?'PREVIEW_REFERENCE_STAGED ':'STATIC_REFERENCE_FILES_STAGED ')+dir+' (mechanics NOT updated; official patch release and review still required)');
  }
 }catch(err){console.error('PATCH_CHECK_ERROR',err.message);process.exitCode=1;}
}
