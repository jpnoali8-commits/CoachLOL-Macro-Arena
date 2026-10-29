/** QA infrastructure contract: no game-engine mutation, no GitHub Actions. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=new URL('../../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const manifest=JSON.parse(read('tools/qa/qa_manifest_dev69.json'));
const devcontainer=JSON.parse(read('.devcontainer/devcontainer.json'));
assert.equal(manifest.schema,'coachlol.qa.manifest.v1');
assert.deepEqual(manifest.lanes.map(x=>x.name),['integration','skills','items']);
assert.equal(new Set(manifest.lanes.map(x=>x.branch)).size,3);
const skills=manifest.lanes.find(l=>l.name==='skills');
assert.ok(skills.quickRecentMilestones>=3);
assert.ok(skills.fullMinAuditFiles>=49);
const items=manifest.lanes.find(l=>l.name==='items');
for(const id of ['test:v453:dev69:items-bulk','test:v453:dev69:items-batch7'])
 assert.ok(items.fullScripts.includes(id),'Missing item scope '+id);
assert.equal(manifest.release.requiredIntegratedBranches.length,3);
for(const id of ['dev69/skills-batch2','dev69/items-batch7','dev69/assets-import'])
 assert.ok(manifest.release.requiredIntegratedBranches.includes(id));
assert.equal(devcontainer.containerEnv.COACHLOL_QA_AUTO_PUBLISH,'1');
assert.match(devcontainer.postStartCommand,/codespaces_on_start\.sh/);
const src=read('tools/qa/offline_full_project.mjs');
const publisher=read('tools/qa/publish_report.mjs');
const startup=read('tools/qa/codespaces_on_start.sh');
for(const phrase of ['--release','--browser','PASS_RELEASE','PASS_LANES',
 'qa_manifest_dev69.json','merge-base','git','worktree','latest.json'])
 assert.ok(src.includes(phrase),'Missing release/QA mechanism '+phrase);
assert.match(src,/if\(profile==='release'&&!releaseProvenance/);
assert.match(src,/this\.gameTime|manifest\.release|manifest\.lanes/);
assert.match(publisher,/const target='ops\/qa-evidence-dev69'/);
assert.match(publisher,/HEAD:refs\/heads\//);
assert.match(publisher,/COACHLOL_QA_AUTO_PUBLISH/);
assert.match(startup,/flock -n 9/);
assert.match(startup,/last-passed-heads/);
assert.doesNotMatch(startup,/git\s+(?:merge|rebase|reset|push)\s/);
const checks=[
 ['node','tools/qa/offline_full_project.mjs'],
 ['node','tools/qa/publish_report.mjs'],
 ['bash','tools/qa/codespaces_on_start.sh'],
 ['bash','tools/qa/bootstrap_codespaces_m43.sh']
];
for(const [bin,file] of checks){
 const args=bin==='node'?['--check',file]:['-n',file];
 const result=spawnSync(bin,args,{cwd:fileURLToPath(root),encoding:'utf8'});
 assert.equal(result.status,0,file+' syntax '+(result.stderr||result.stdout));
}
console.log('QA_INFRA_CONTRACT PASS: manifest, safety, publisher, Codespaces and source syntax');
