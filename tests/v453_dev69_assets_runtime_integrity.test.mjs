import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const manifest=JSON.parse(readFileSync(resolve(root,'data/dev69_assets_runtime_integrity.json'),'utf8'));
assert.equal(manifest.count,78);
assert.equal(Object.keys(manifest.files).length,78);
assert.equal(manifest.source_zip_sha256,'9d93d4de1f847330bd92671e9798be243b692dc07996ecb736b8f9aef6a06abd');
let bytes=0,seen=0;
for(const [path,record] of Object.entries(manifest.files)){
 assert.match(path,/^(assets|data)\//);
 assert.ok(!path.includes('..')&&!path.startsWith('/'));
 const full=resolve(root,path);
 assert.equal(existsSync(full),true,'missing genuine runtime asset: '+path);
 const data=readFileSync(full);
 assert.equal(data.length,record.size,'byte length mismatch: '+path);
 const gitBlob=createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');
 assert.equal(gitBlob,record.sha,'original Git blob mismatch: '+path);
 if(path.endsWith('.png'))assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a','invalid PNG: '+path);
 if(path.endsWith('.jpg'))assert.equal(data.subarray(0,2).toString('hex'),'ffd8','invalid JPEG: '+path);
 if(path.endsWith('.webp'))assert.equal(data.subarray(8,12).toString('ascii'),'WEBP','invalid WEBP: '+path);
 seen++;bytes+=data.length;
}
for(const name of ['victory_overlay.png','defeat_overlay.png'])assert.ok(manifest.files['assets/ui/endgame/'+name]);
console.log('DEV69 ORIGINAL BINARY ASSETS '+seen+'/78 PASS; '+bytes+' bytes verified');
