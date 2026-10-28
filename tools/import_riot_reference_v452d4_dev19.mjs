import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {normalizeRiotReferenceV452d4Dev19} from './riot_reference_v452d4_dev19.mjs';
const args=process.argv.slice(2);
const opt=k=>args[args.indexOf(k)+1];
if(!args.includes('--champions')||!args.includes('--items')||!args.includes('--output')){
 console.error('Usage: node tools/import_riot_reference_v452d4_dev19.mjs --champions <DataDragon champion.json> --items <item.json> --output <data/reference.json>');
 process.exitCode=2;
}else{
 const input=path=>JSON.parse(readFileSync(resolve(path),'utf8'));
 const result=normalizeRiotReferenceV452d4Dev19(input(opt('--champions')),input(opt('--items')));
 const target=resolve(opt('--output'));mkdirSync(dirname(target),{recursive:true});writeFileSync(target,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({output:target,patch:result.patch,counts:result.counts,status:result.status},null,2));
}
