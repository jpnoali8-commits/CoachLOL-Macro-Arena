/** CoachLOL central QA executor (no GitHub Actions; no merges or pushes).
 * Uses detached worktrees only. PASS_LANES != PASS_RELEASE.
 * Read qa_manifest_dev69.json for the required suites.
 */
import {spawnSync,execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,readdirSync,writeFileSync,openSync,closeSync,readFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const args=new Set(process.argv.slice(2));
const allowed=new Set(['--quick','--full','--browser','--release','--with-main','--with-candidate','--help','-h']);
if(args.has('--help')||args.has('-h')){
 console.log('CoachLOL QA (branch-isolated, no Actions)\n'+
  '  node tools/qa/offline_full_project.mjs --quick\n'+
  '  node tools/qa/offline_full_project.mjs --full\n'+
  '  node tools/qa/offline_full_project.mjs --browser\n'+
  '  node tools/qa/offline_full_project.mjs --release\n'+
  '  Optional: --with-main --with-candidate (quick/full only)');
 process.exit(0);
}
if([...args].some(a=>!allowed.has(a))||
 ['--quick','--full','--browser','--release'].filter(a=>args.has(a)).length>1||
 (args.has('--browser')||args.has('--release'))&&(args.has('--with-main')||args.has('--with-candidate'))){
 console.error('Invalid QA profile/options');process.exit(2);
}
const profile=['release','browser','full'].find(v=>args.has('--'+v))||'quick';
const root=execFileSync('git',['rev-parse','--show-toplevel'],{encoding:'utf8'}).trim();
const manifest=JSON.parse(readFileSync(join(root,'tools','qa','qa_manifest_dev69.json'),'utf8'));
if(manifest.schema!=='coachlol.qa.manifest.v1')throw Error('QA manifest schema mismatch');
const scratch=mkdtempSync(join(tmpdir(),'coachlol-qa-isolated-'));
const reports=join(root,'qa-reports');mkdirSync(reports,{recursive:true});
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const reportFile=join(reports,'offline-'+profile+'-'+stamp+'.json');
const started=Date.now();
const maxMs={quick:12,full:70,browser:30,release:90}[profile]*60*1000;
const summary={schema:'coachlol.qa.report.v2',profile,
 startedAt:new Date().toISOString(),completedAt:null,ok:false,
 certification:'NOT_CERTIFIED',manifest:'tools/qa/qa_manifest_dev69.json',
 branchIsolation:true,mergesPerformed:0,actionsUsed:false,lanes:[]};
const chosen=(profile==='browser'||profile==='release')?
 manifest.lanes.filter(z=>z.name==='integration'):
 manifest.lanes.filter(z=>profile==='full'||!z.fullOnly);
if(args.has('--with-candidate'))chosen.push({name:'candidate',branch:'dev69/qa-candidate',
 quickScripts:['test:v453:dev69:integration'],fullScripts:['test'],requiredFiles:['engine.mjs','engine.browser.js']});
if(args.has('--with-main'))chosen.push({name:'main',branch:'main',
 quickScripts:['test:v40'],fullScripts:['test'],requiredFiles:['engine.mjs','engine.browser.js']});

function git(argv,cwd=root){
 const p=spawnSync('git',argv,{cwd,encoding:'utf8',timeout:120000});
 if(p.status!==0)throw Error('git '+argv.join(' ')+' failed: '+(p.stderr||p.stdout||p.error));
 return (p.stdout||'').trim();
}
function record(lane,title,status,reason=''){
 lane.jobs.push({title,status,ok:status==='PASS',reason});
 console.log('  '+status+': '+title+(reason?' — '+reason:''));
}
function execute(lane,cwd,title,cmd,argv,{timeoutMs}={}){
 if(Date.now()-started>=maxMs){
  record(lane,title,'NOT_RUN','QA execution time budget exceeded');return false;
 }
 const log=join(reports,stamp+'-'+lane.name+'-'+(lane.jobs.length+1)+'.log');
 const fd=openSync(log,'w');const at=Date.now();let result;
 try{
  result=spawnSync(cmd,argv,{cwd,stdio:['ignore',fd,fd],
   timeout:Math.min(timeoutMs|| (profile==='quick'?360000:1800000),
    Math.max(1000,maxMs-(Date.now()-started)))});
 }finally{closeSync(fd)}
 const status=result.error?.code==='ETIMEDOUT'?'TIMEOUT':
  result.status===0&&!result.error?'PASS':'FAIL';
 const j={title,status,ok:status==='PASS',command:[cmd,...argv].join(' '),
  exitCode:result.status,signal:result.signal||null,
  elapsedSeconds:Math.round((Date.now()-at)/1000),log};
 lane.jobs.push(j);
 console.log('  '+status+': '+title+' ('+j.elapsedSeconds+'s)');
 if(status!=='PASS'){
  console.error(readFileSync(log,'utf8').split('\n').slice(-14).join('\n'));
  if(result.error)console.error(String(result.error));
 }
 return j.ok;
}
function required(lane,dir,paths){
 let good=true;
 for(const f of paths||[])if(!existsSync(join(dir,f))){
  record(lane,'Required '+f,'FAIL','File or directory missing at '+lane.commit);
  good=false;
 }
 return good;
}
function syntax(lane,dir){
 const files=profile==='quick'?['engine.mjs','engine.browser.js','app.js']:
  manifest.syntax;
 for(const f of files)if(existsSync(join(dir,f)))execute(lane,dir,'Syntax '+f,'node',['--check',f]);
 else record(lane,'Syntax '+f,'NOT_RUN','Missing source file');
}
function npmScripts(lane,dir,names){
 const scripts=JSON.parse(readFileSync(join(dir,'package.json'),'utf8')).scripts||{};
 for(const name of names||[]){
  if(!scripts[name])record(lane,'npm '+name,'FAIL','Required script missing on '+lane.branch);
  else execute(lane,dir,'npm '+name,'npm',['run',name]);
 }
}
function audits(lane,dir,config){
 const folder=join(dir,config.auditDir);
 if(!existsSync(folder)){
  record(lane,'Authored skill audit discovery','FAIL','tests/audit missing');return;
 }
 const all=readdirSync(folder).filter(f=>/^v453_.*\.test\.mjs$/.test(f)).sort();
 const milestones=[...new Set(all.map(f=>/^v453_m(\d+)_/.exec(f)?.[1]).filter(Boolean).map(Number))].sort((a,b)=>b-a);
 const recent=new Set(milestones.slice(0,config.quickRecentMilestones));
 const selected=profile==='quick'?
  all.filter(f=>recent.has(Number(/^v453_m(\d+)_/.exec(f)?.[1]))):all;
 const minimum=profile==='quick'?config.quickMinAuditFiles:config.fullMinAuditFiles;
 if(selected.length<minimum){
  record(lane,'Authored audit coverage','FAIL',
   'Found '+selected.length+' required files, expected at least '+minimum);
 }else record(lane,'Authored audit coverage','PASS',
  selected.length+' discovered of '+all.length+' total; latest milestones '+[...recent].join(','));
 for(const f of selected)execute(lane,dir,f,'node',[join(config.auditDir,f)]);
}
function parity(lane,dir){
 if(!existsSync(join(dir,'tools/sync_browser_v43.py'))){
  record(lane,'Node/browser regeneration','NOT_RUN','Generator missing');return;
 }
 if(execute(lane,dir,'Regenerate browser in disposable worktree','python3',
  ['tools/sync_browser_v43.py'],{timeoutMs:180000}))
  execute(lane,dir,'Exact engine.browser.js parity','git',
   ['diff','--exit-code','--','engine.browser.js']);
 else record(lane,'Exact engine.browser.js parity','NOT_RUN','Generator failed');
}
function browser(lane,dir){
 if(!existsSync(join(dir,'assets/user_rift_masks_20261026/mapa_atualizado.jpg'))){
  record(lane,'Chromium original maps','BLOCKED',
   'Integrated branch lacks original assets; do not substitute images');
  return;
 }
 const py=execute(lane,dir,'Playwright and Pillow dependencies','python3',
  ['-c','from playwright.sync_api import sync_playwright; from PIL import Image'],{timeoutMs:30000});
 const chromium=execute(lane,dir,'Chromium executable','bash',
  ['-lc','command -v chromium || command -v chromium-browser'],{timeoutMs:30000});
 if(!py||!chromium){record(lane,'Browser PvP scripts','NOT_RUN','Browser prerequisites unavailable');return;}
 for(const file of manifest.release.browser){
  if(!existsSync(join(dir,file))){record(lane,file,'NOT_RUN','Browser script missing');continue;}
  execute(lane,dir,'Chromium '+file,'python3',[file],{timeoutMs:1200000});
 }
}
function releaseProvenance(lane,dir){
 let ready=true;
 for(const branch of manifest.release.requiredIntegratedBranches){
  try{
   git(['fetch','--no-tags','origin',
    '+refs/heads/'+branch+':refs/remotes/origin/'+branch]);
   const sha=git(['rev-parse','refs/remotes/origin/'+branch]);
   const p=spawnSync('git',['merge-base','--is-ancestor',sha,lane.commit],
    {cwd:dir,encoding:'utf8',timeout:120000});
   if(p.status===0)record(lane,'Release provenance '+branch,'PASS','source '+sha);
   else{record(lane,'Release provenance '+branch,'BLOCKED',
    'source '+sha+' is not an ancestor of integrated '+lane.commit);ready=false;}
  }catch(e){record(lane,'Release provenance '+branch,'BLOCKED',String(e));ready=false;}
 }
 return ready;
}
function work(lane,dir,config){
 if(!required(lane,dir,config.requiredFiles))return;
 syntax(lane,dir);
 if(profile==='release'&&!releaseProvenance(lane,dir)){
  record(lane,'Release suite','NOT_RUN','Required Skills, Items and Assets not integrated');return;
 }
 if(profile==='browser'){
  parity(lane,dir);browser(lane,dir);return;
 }
 npmScripts(lane,dir,profile==='quick'?config.quickScripts:config.fullScripts);
 if(lane.name==='skills')audits(lane,dir,config);
 if(Array.isArray(config.auditFiles)){
  for(const file of config.auditFiles){
   if(!existsSync(join(dir,file)))record(lane,'Required Items audit '+file,'FAIL','Audit file missing');
   else execute(lane,dir,'Items full audit '+file,'node',[file]);
  }
 }
 if(lane.name==='integration'||lane.name==='candidate')parity(lane,dir);
 if(profile==='release'){
  const verify=manifest.release.assetsGate;
  if(existsSync(join(dir,verify)))execute(lane,dir,'Assets SHA-256','python3',[verify]);
  else record(lane,'Assets SHA-256','BLOCKED','Assets verifier not integrated');
  browser(lane,dir);
 }
}
try{
 const infra={name:'qa-infra',branch:'ops/qa-orchestrator-dev69',
  commit:git(['rev-parse','HEAD']),jobs:[],ok:false};
 summary.lanes.push(infra);
 execute(infra,root,'QA orchestrator contract','node',
  ['tests/qa/orchestrator_contract.test.mjs'],{timeoutMs:30000});
 infra.ok=infra.jobs.length>0&&infra.jobs.every(j=>j.ok);
 if(!infra.ok)console.error('QA infrastructure validation FAILED; release cannot be certified.');
 for(const config of chosen){
  const lane={name:config.name,branch:config.branch,commit:null,jobs:[],ok:false};
  summary.lanes.push(lane);
  const dir=join(scratch,config.branch.replaceAll('/','-'));
  console.log('\n=== '+lane.name+' '+lane.branch+' ===');
  try{
   git(['fetch','--no-tags','origin',
    '+refs/heads/'+lane.branch+':refs/remotes/origin/'+lane.branch]);
   git(['worktree','add','--detach',dir,'refs/remotes/origin/'+lane.branch]);
   lane.commit=git(['rev-parse','HEAD'],dir);
   console.log('SHA '+lane.commit);
   work(lane,dir,config);
  }catch(e){
   record(lane,'Fetch/worktree/runner','FAIL',String(e));console.error(e);
  }finally{
   if(existsSync(dir)){
    try{git(['worktree','remove','--force',dir])}
    catch(err){console.error('Cleanup warning: '+String(err));}
   }
  }
  lane.ok=lane.jobs.length>0&&lane.jobs.every(j=>j.ok);
  console.log('=== '+lane.name+' '+(lane.ok?'PASS':'FAIL')+' ===');
 }
}finally{
 summary.completedAt=new Date().toISOString();
 summary.ok=summary.lanes.length>0&&summary.lanes.every(l=>l.ok);
 summary.certification=summary.ok?(profile==='release'?'PASS_RELEASE':'PASS_LANES'):
  profile==='release'?'RELEASE_BLOCKED':'NOT_CERTIFIED';
 writeFileSync(reportFile,JSON.stringify(summary,null,2)+'\n');
 writeFileSync(join(reports,'latest.json'),JSON.stringify(summary,null,2)+'\n');
 rmSync(scratch,{recursive:true,force:true});
 console.log('\n'+summary.certification+' — '+reportFile);
 console.log('PASS_LANES is branch-isolated; only PASS_RELEASE on an integrated HEAD can certify release.');
}
process.exit(summary.ok?0:1);
