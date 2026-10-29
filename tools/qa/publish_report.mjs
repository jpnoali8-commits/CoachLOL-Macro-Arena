/** Publish immutable SHA-bound QA evidence to ONE separate branch.
 * No pushes to main/integration/skills/items/assets. No force. Opt-in required.
 */
import {spawnSync,execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,basename} from 'node:path';
const enabled=process.env.COACHLOL_QA_AUTO_PUBLISH==='1'||process.argv.includes('--publish');
if(!enabled){console.error('Evidence publishing disabled; set COACHLOL_QA_AUTO_PUBLISH=1');process.exit(2)}
const reportPath=process.argv.find(v=>v.endsWith('.json'));
if(!reportPath||!existsSync(reportPath))throw Error('QA JSON report path required');
const data=JSON.parse(readFileSync(reportPath,'utf8'));
if(data.schema!=='coachlol.qa.report.v2'||!Array.isArray(data.lanes)||data.lanes.length<1||
 data.lanes.some(l=>typeof l.commit!=='string'||!/^[a-f0-9]{40}$/.test(l.commit)))
 throw Error('Refusing to publish malformed report or one missing exact commit SHA');
const root=execFileSync('git',['rev-parse','--show-toplevel'],{encoding:'utf8'}).trim();
const remote=execFileSync('git',['remote','get-url','origin'],{cwd:root,encoding:'utf8'}).trim();
if(!remote.includes('jpnoali8-commits/CoachLOL-Macro-Arena'))
 throw Error('Wrong remote: evidence publisher refuses unrelated repos');
const target='ops/qa-evidence-dev69';
function git(argv,cwd=root){
 const p=spawnSync('git',argv,{cwd,encoding:'utf8',timeout:120000});
 if(p.status!==0)throw Error('git '+argv.join(' ')+' failed: '+(p.stderr||p.stdout||p.error));
 return p.stdout.trim();
}
const stamp=(data.completedAt||new Date().toISOString()).replace(/[^0-9A-Za-z]/g,'-');
const signature=data.lanes.map(l=>l.commit.slice(0,9)).join('-');
const folder='qa-evidence/'+stamp+'-'+data.profile+'-'+signature;
const scratch=mkdtempSync(join(tmpdir(),'coachlol-evidence-'));
const worktree=join(scratch,'checkout');
try{
 git(['fetch','--no-tags','origin','+refs/heads/'+target+':refs/remotes/origin/'+target]);
 git(['worktree','add','--detach',worktree,'refs/remotes/origin/'+target]);
 const destination=join(worktree,folder);mkdirSync(join(destination,'logs'),{recursive:true});
 const copy=structuredClone(data);
 // Logs can contain raw test fixtures or trace URLs; never upload credentials
 // or unlimited logs. Everything is bounded, scrubbed and private.
 let index=0;
 for(const lane of copy.lanes)for(const job of lane.jobs||[]){
  if(!job.log||!existsSync(job.log)){delete job.log;continue;}
  const name=String(++index).padStart(3,'0')+'-'+lane.name+'.log';
  const raw=readFileSync(job.log,'utf8').slice(-20000);
  const safe=raw.replace(/(ghp_|gho_|ghu_|ghs_|ghr_|github_pat_)[A-Za-z0-9_]+/g,'[REDACTED_GITHUB_CREDENTIAL]')
   .replace(/(Bearer\s+)[^\s"'<>]+/gi,'$1[REDACTED]')
   .replace(/((?:token|password|secret|authorization)\s*[=:]\s*)[^\s"'<>]+/gi,'$1[REDACTED]');
  writeFileSync(join(destination,'logs',name),safe);
  job.log=folder+'/logs/'+name;
 }
 writeFileSync(join(destination,'report.json'),JSON.stringify(copy,null,2)+'\n');
 writeFileSync(join(worktree,'qa-evidence','LATEST.json'),JSON.stringify({
  path:folder+'/report.json',profile:copy.profile,certification:copy.certification,
  completedAt:copy.completedAt,lanes:copy.lanes.map(l=>({branch:l.branch,sha:l.commit,ok:l.ok}))
 },null,2)+'\n');
 git(['add','--','qa-evidence'],worktree);
 const dirty=git(['status','--porcelain','--','qa-evidence'],worktree);
 if(!dirty){console.log('No new QA evidence to publish');process.exitCode=0}
 else{
  git(['-c','user.name=CoachLOL QA','-c','user.email=coachlol-qa@users.noreply.github.com',
   'commit','-m','qa(evidence): '+copy.profile+' '+copy.certification+' '+signature],worktree);
  // This exact ref is hard-coded, a normal non-force fast-forward push.
  git(['push','origin','HEAD:refs/heads/'+target],worktree);
  console.log('EVIDENCE_PUBLISHED '+target+' '+folder+'/report.json');
 }
}finally{
 try{git(['worktree','remove','--force',worktree])}catch{}
 rmSync(scratch,{recursive:true,force:true});
}
