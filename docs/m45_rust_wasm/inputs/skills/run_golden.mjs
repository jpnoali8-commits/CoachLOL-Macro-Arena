#!/usr/bin/env node
/* M45 legacy skills golden harness. Does NOT certify Rust parity or browser gameplay. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,existsSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const here=dirname(fileURLToPath(import.meta.url));
const repo=resolve(here,'../../../../');
const manifest=JSON.parse(readFileSync(resolve(here,'golden_plan.json'),'utf8'));
const gitHash=buffer=>createHash('sha1').update('blob '+buffer.length+'\0').update(buffer).digest('hex');
function verify(path,expectedSha){
 const abs=resolve(repo,path);
 assert.ok(existsSync(abs),'Missing local file: '+path);
 const actual=gitHash(readFileSync(abs));
 assert.equal(actual,expectedSha,'Source Git blob mismatch: '+path);
 return abs;
}
verify(manifest.engine_path,manifest.engine_git_blob_sha);
const testOnly=process.argv.includes('--verify-only');
const receipts=[];
for(const suite of manifest.suites){
 const abs=verify(suite.test_path,suite.test_git_blob_sha);
 const src=readFileSync(abs,'utf8');
 assert.equal(/['"]blue['"]\s*,\s*['"]red['"]/.test(src),suite.bilateral_in_source,
   suite.id+' bilateral source drift');
 if(testOnly){receipts.push({id:suite.id,status:'SOURCE_VERIFIED_NOT_RUN'});continue}
 const proc=spawnSync(process.execPath,[abs],{cwd:repo,encoding:'utf8',
  timeout:180000,maxBuffer:16*1024*1024,env:{...process.env,CI:'1'}});
 const stdout=proc.stdout||'',stderr=proc.stderr||'';
 const marker=!!suite.expected_output_marker&&stdout.includes(suite.expected_output_marker);
 const pass=proc.status===0&&marker&&!proc.error;
 receipts.push({id:suite.id,status:pass?'PASS':'FAIL',exit_code:proc.status,
  marker_ok:marker,error:proc.error?String(proc.error):null,
  stdout_sha256:createHash('sha256').update(stdout).digest('hex'),
  stderr_sha256:createHash('sha256').update(stderr).digest('hex'),
  stdout_tail:stdout.slice(-1600),stderr_tail:stderr.slice(-1600)});
 console.log(suite.id,pass?'PASS':'FAIL');
}
const report={schema:'coachlol.m45.skills.golden-run.v1',
 source_commit:manifest.source_commit,engine_git_blob_sha:manifest.engine_git_blob_sha,
 run_mode:testOnly?'SOURCE_VERIFY_ONLY':'NODE_GOLDEN',
 node:process.version,platform:process.platform,
 executed:testOnly?0:receipts.length,
 passed:testOnly?0:receipts.filter(x=>x.status==='PASS').length,
 result:testOnly?'NOT_RUN':receipts.every(x=>x.status==='PASS')?'PASS':'FAIL',
 receipts,limits:['Not native Rust','Not browser 2-session E2E','No cross-runtime equivalence']};
const resultPath=resolve(here,'golden_results.local.json');
writeFileSync(resultPath,JSON.stringify(report,null,2)+'\n');
console.log('Golden receipt:',resultPath,report.result);
if(!testOnly&&!receipts.every(x=>x.status==='PASS'))process.exitCode=1;
