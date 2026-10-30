// M45 B02B-04: reproducible Node runner for the frozen ITEMS oracle.
// In a full checkout, run:
// node docs/m45_rust_wasm/inputs/items/run_items_goldens_b04.mjs
// node docs/m45_rust_wasm/inputs/items/run_items_goldens_b04.mjs --write
// No --write outputs unless the entire no-write preflight passes.
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const sourceCommit='182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d';
const dir=new URL('./',import.meta.url),root=fileURLToPath(new URL('../../../../',import.meta.url));
const names=[
 'golden_b01.test.mjs',
 'golden_b02_catalog.test.mjs',
 'golden_b03_effects.test.mjs',
 'golden_b03_effects_extra.test.mjs',
 'golden_b04_trinket_acl.test.mjs',
 'golden_b04_pvp_gap.test.mjs',
 'golden_b06_adversarial.test.mjs'
];
const sha256=s=>createHash('sha256').update(s).digest('hex');
const report={schema:'coachlol.m45.items.qa.execution.b04.v1',source_commit:sourceCommit,
 branch_expected:'dev69/m45-audit-items',node:process.version,
 platform:process.platform,arch:process.arch,entrypoint:import.meta.url,
 timestamp:new Date().toISOString(),planned:{B01:11,B02:244,B03:18,B03B:18,B04_INTERNAL:6,B04_PVP_GAP:2,B06_ADVERSARIAL:92},
 jobs:[],legacy_pvp_trinket_feature:'OPEN_GAP_NOT_A_PASS',status:'NOT_STARTED'};
const wantWrite=process.argv.includes('--write');
const jobs=[
 {mode:'syntax',name:'oracle_source_lock_b03.mjs'},
 ...names.map(name=>({mode:'syntax',name})),
 ...names.map(name=>({mode:'verify',name})),
 ...wantWrite?names.map(name=>({mode:'write',name})):[]
];
for(const job of jobs){
 const script=fileURLToPath(new URL(job.name,dir));
 const args=job.mode==='syntax'?['--check',script]:[script,...(job.mode==='write'?['--write']:[])];
 const result=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',timeout:300000,maxBuffer:32*1024*1024});
 const out=result.stdout||'',err=result.stderr||'';
 const entry={mode:job.mode,name:job.name,command:JSON.stringify([process.execPath,...args]),
  exit_code:result.status,signal:result.signal,error:result.error?.message||null,
  stdout_sha256:sha256(out),stderr_sha256:sha256(err),
  stdout:out.slice(-16000),stderr:err.slice(-16000),
  status:result.status===0&&!result.error?'PASS':'FAIL'};
 report.jobs.push(entry);
 console.log((entry.status==='PASS'?'PASS':'FAIL')+' '+job.mode+' '+job.name);
 if(entry.status!=='PASS')break; // Fail closed, no fabricated goldens.
}
report.status=report.jobs.length===jobs.length&&report.jobs.every(x=>x.status==='PASS')?'PASS':'FAIL';
report.completed_at=new Date().toISOString();
const target=fileURLToPath(new URL('./QA_EXECUTION_B04.json',dir));
writeFileSync(target,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,completed:report.jobs.length,planned:jobs.length,report:target,
  warning:'PASS means fixture runner PASS; the legacy PvP trinket gap is still OPEN'}));
if(report.status!=='PASS')process.exitCode=1;
