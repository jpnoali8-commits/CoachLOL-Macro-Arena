/** CoachLOL: local/Codespaces QA without GitHub Actions minutes.
 * Never merges branches, pushes commits or changes canonical refs.
 * Reports branch-isolated QA, not fictional combined-release certification.
 */
import {spawnSync, execFileSync} from 'node:child_process';
import {mkdtempSync, mkdirSync, readdirSync, writeFileSync, openSync, closeSync, readFileSync, rmSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const args=new Set(process.argv.slice(2));
if(args.has('--help')||args.has('-h')){
 console.log(`CoachLOL QA, zero GitHub Actions minutes\n  node tools/qa/offline_full_project.mjs --quick  # routine: 3 branches\n  node tools/qa/offline_full_project.mjs --full   # whole integration npm test + all authored B01 suites + items\n  Option: --with-candidate  also tests the independent QA candidate\n  Option: --with-main       also tests main legacy baseline`);
 process.exit(0);
}
const invalid=[...args].filter(a=>!['--quick','--full','--with-candidate','--with-main'].includes(a));
if(invalid.length||args.has('--quick')&&args.has('--full')){
 console.error('Invalid options:',invalid.join(' '));process.exit(2);
}
const full=args.has('--full');
const root=execFileSync('git',['rev-parse','--show-toplevel'],{encoding:'utf8'}).trim();
const scratch=mkdtempSync(join(tmpdir(),'coachlol-full-qa-'));
const reports=join(root,'qa-reports');mkdirSync(reports,{recursive:true});
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const reportFile=join(reports,`offline-${full?'full':'quick'}-${stamp}.json`);
const summary={startedAt:new Date().toISOString(),profile:full?'full':'quick',
 descriptions:'Branch-isolated QA: integration cannot be claimed to include pending Skills/Items commits until merged.',
 lanes:[],completedAt:null,ok:false};
const targets=[
 {name:'integration',branch:'dev69/integration'},
 {name:'skills',branch:'dev69/skills-batch2'},
 {name:'items',branch:'dev69/items-batch7'}
];
if(args.has('--with-candidate'))targets.push({name:'candidate',branch:'dev69/qa-candidate'});
if(args.has('--with-main'))targets.push({name:'main',branch:'main'});
function git(args,cwd=root){const p=spawnSync('git',args,{cwd,encoding:'utf8',timeout:120000});
 if(p.status!==0)throw Error('git '+args.join(' ')+' failed: '+(p.stderr||p.stdout||p.error));
 return (p.stdout||'').trim();
}
function test(lane,cwd,title,cmd,args){
 const out=join(reports,`${stamp}-${lane.name}-${lane.jobs.length+1}.log`),fd=openSync(out,'w');
 console.log(`[${lane.name}] ${title}`);
 const start=Date.now();let result;
 try{result=spawnSync(cmd,args,{cwd,stdio:['ignore',fd,fd],timeout:full?1800000:600000});}
 finally{closeSync(fd)}
 const ok=result.status===0&&!result.error;
 const job={title,command:[cmd,...args].join(' '),ok,exitCode:result.status,
 signal:result.signal||null,elapsedSeconds:Math.round((Date.now()-start)/1000),log:out};
 lane.jobs.push(job);
 if(!ok){
  console.error(`  FAIL: ${job.command} (${job.exitCode??job.signal??result.error})`);
  console.error(readFileSync(out,'utf8').split('\n').slice(-18).join('\n'));
 }else console.log(`  PASS (${job.elapsedSeconds}s)`);
 return ok;
}
function suite(lane,dir){
 test(lane,dir,'Engine syntax','node',['--check','engine.mjs']);
 if(lane.name==='integration'||lane.name==='candidate'||lane.name==='main'){
  test(lane,dir,full?'FULL historical and current test suite':'Combined integration regression',
   'npm',full?['test']:['run','test:v453:dev69:integration']);
 }else if(lane.name==='skills'){
  test(lane,dir,'Legacy Skills regression','npm',['run','test:v453:dev69:skills']);
  const audit=join(dir,'tests','audit');
  const files=existsSync(audit)?readdirSync(audit).filter(name=>
   full?/^v453_m(2[0-9]|3[0-9]|4[0-3])_.*\.test\.mjs$/.test(name):
    /^v453_m(42|43)_.*\.test\.mjs$/.test(name)).sort():[];
  if(!files.length){lane.jobs.push({title:'B01 specialist audit discovery',ok:false,
   reason:'No matching authored-skill tests found on this branch'});return;}
  console.log(`[skills] ${files.length} distinct authored audit tests`);
  for(const file of files)test(lane,dir,file,'node',[join('tests','audit',file)]);
 }else if(lane.name==='items'){
  const p=JSON.parse(readFileSync(join(dir,'package.json'),'utf8'));
  const scripts=full?['test:v453:dev69:items',...Array.from({length:6},(_,i)=>`test:v453:dev69:items-batch${i+2}`)]:
   ['test:v453:dev69:items-batch7'];
  for(const name of scripts){if(!p.scripts?.[name]){
    lane.jobs.push({title:name,ok:false,reason:'Missing npm test script'});
   }else test(lane,dir,name,'npm',['run',name]);}
 }
}
try{
 for(const target of targets){
  const lane={...target,commit:null,jobs:[],ok:false};summary.lanes.push(lane);
  const name=target.branch.replaceAll('/','-');
  const dir=join(scratch,name);
  console.log(`\n=== ${target.name}: ${target.branch} ===`);
  try{
   // Fetch branch tip; preserve every existing local branch and commit.
   git(['fetch','--no-tags','origin',`+refs/heads/${target.branch}:refs/remotes/origin/${target.branch}`]);
   git(['worktree','add','--detach',dir,`refs/remotes/origin/${target.branch}`]);
   lane.commit=git(['rev-parse','HEAD'],dir);
   suite(lane,dir);
  }catch(e){lane.jobs.push({title:'Fetch/setup or runner',ok:false,reason:String(e)});console.error(e)}
  lane.ok=lane.jobs.length>0&&lane.jobs.every(j=>j.ok);
  console.log(`=== ${target.name}: ${lane.ok?'PASS':'FAIL'} ===`);
  if(existsSync(dir)){
   try{git(['worktree','remove','--force',dir])}catch(err){console.error('Cleanup warning',err)}
  }
 }
}finally{
 summary.completedAt=new Date().toISOString();
 summary.ok=summary.lanes.every(l=>l.ok);
 writeFileSync(reportFile,JSON.stringify(summary,null,2)+'\n');
 rmSync(scratch,{recursive:true,force:true});
 console.log(`\n${summary.ok?'ALL CHECKED LANES PASS':'AT LEAST ONE LANE FAILED'} — ${reportFile}`);
 console.log('A full RELEASE certification still requires an integrated code+browser build and explicit PvP QA.');
}
process.exit(summary.ok?0:1);
