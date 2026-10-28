/** Obtain authentic version-pinned Riot Data Dragon snapshots for local staging.
 * No auto patch switching, no engine/shop/balance mutation.
 * Usage: node tools/acquire_riot_catalog_v453_dev35.mjs --version 16.21.1 --locale en_US
 * Requires internet connectivity in the environment RUNNING this command.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),get=k=>{const i=args.indexOf('--'+k);return i>=0?args[i+1]:null;};
const version=get('version')||'16.21.1',locale=get('locale')||'en_US';
if(!/^\d+\.\d+\.\d+$/.test(version)||!/^[a-z]{2}_[A-Z]{2}$/.test(locale))throw Error('invalid version or locale');
const out=path.join(root,'assets','riot',version,locale,'data');
const content={};
try{
 for(const [part,minimum] of [['item',150],['champion',120]]){
  const url=`https://ddragon.leagueoflegends.com/cdn/${version}/data/${locale}/${part}.json`;
  const res=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{Accept:'application/json'}});
  if(!res.ok)throw Error(`${part} source responded ${res.status}`);
  const bytes=Buffer.from(await res.arrayBuffer());if(bytes.length>15_000_000)throw Error('oversize source');
  const doc=JSON.parse(bytes.toString('utf8'));
  if(doc.version!==version||!doc.data||Object.keys(doc.data).length<minimum)throw Error(`incomplete or mismatched source: ${part}`);
  content[part]={url,bytes,recordCount:Object.keys(doc.data).length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
 }
 await fs.mkdir(out,{recursive:true});
 for(const [part,src] of Object.entries(content))await fs.writeFile(path.join(out,part+'.json'),src.bytes);
 const manifest={schema:'coachlol.riot.source.acquisition.v1',version,locale,patch:`${Number(version.split('.')[0])+10}.${version.split('.')[1].padStart(2,'0')}`,status:'REFERENCE_STAGED_UNAPPROVED',autoGameplayActivation:false,files:Object.fromEntries(Object.entries(content).map(([part,src])=>[part,{url:src.url,recordCount:src.recordCount,sha256:src.sha256}]))};
 await fs.writeFile(path.join(out,'acquisition_manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify({path:out,files:manifest.files,activation:false},null,2));
}catch(err){console.error('DEV35_ACQUISITION_FAILED:',err.message);process.exitCode=1;}
