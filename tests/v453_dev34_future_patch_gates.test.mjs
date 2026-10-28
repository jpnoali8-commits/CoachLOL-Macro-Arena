import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
import {normalizePatch,diffPatches,buildReviewQueue} from '../tools/patch_center_v453_dev33.mjs';
import {SCHEDULE_2026,inspectRecipeGraph,auditProvenance,classifyCandidate,assessReviewCoverage,createPortReadiness} from '../tools/patch_release_v453_dev34.mjs';
const root=path.resolve(new URL('..',import.meta.url).pathname);
let passed=0;
function test(name,fn){fn();console.log('✓ DEV34 '+name);passed++;}
const hash=buf=>crypto.createHash('sha256').update(buf).digest('hex');
const makeRaw=(ver='16.21.1',add=0)=>{
 const items={};for(let i=1000;i<1160;i++)items[String(i)]={name:'Test item '+i,gold:{total:400+add,base:400+add,purchasable:true},maps:{'11':true},stats:{FlatHPPoolMod:100}};
 items['1100'].gold.total=1500+add;items['1100'].gold.base=700+add;items['1100'].from=['1000','1001'];
 const champs={};for(let i=0;i<125;i++)champs['Champ'+i]={id:'Champ'+i,name:'Champ '+i,key:String(i),stats:{hp:550+add,attackdamage:60}};
 return [{version:ver,data:items},{version:ver,data:champs}];
};
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'coach-dev34-'));
const sources=[];
function makeSnap(ver='16.21.1',add=0){const [items,champions]=makeRaw(ver,add),i=path.join(tmp,ver+'-items.json'),c=path.join(tmp,ver+'-champions.json');fs.writeFileSync(i,JSON.stringify(items));fs.writeFileSync(c,JSON.stringify(champions));
 const detailsDir=path.join(tmp,ver+'-details');fs.mkdirSync(detailsDir);const details={},detailChecksums={};
 for(const key of Object.keys(champions.data)){
  const doc={version:ver,data:{[key]:{passive:{name:'P_'+key,description:'Passive description'},spells:['Q','W','E','R'].map(slot=>({id:key+slot,name:slot,cooldown:[10+add],cost:[50],range:[500],description:'Spell description'}))}}};
  const bytes=JSON.stringify(doc);fs.writeFileSync(path.join(detailsDir,key+'.json'),bytes);details[key]=doc;detailChecksums[key]=hash(bytes);
 }
 const snap=normalizePatch({items,champions,details,version:ver,sources:{items:{sha256:hash(fs.readFileSync(i))},champions:{sha256:hash(fs.readFileSync(c))},detailChecksums}});sources.push({ver,i,c,detailsDir,snap});return snap;}
try{
 const old=makeSnap(),next=makeSnap('16.22.1',1),goodSource=sources[1],diff=diffPatches(old,next),review=buildReviewQueue(diff);
 const goodQA={fullNpmTest:'PASS',nodeBrowserParity:'PASS',recipePurchases:'PASS',snapshotsAndReplays:'PASS',matchCompletion:'PASS',fogAndObjectives:'PASS'};
 const official='https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-22-notes/';
 const release=(day,verified=true)=>classifyCandidate({currentPatch:'26.21',candidatePatch:'26.22',asOf:day,officialReleaseVerified:verified,officialNotesUrl:official});
 const proven=auditProvenance(next,{itemPath:goodSource.i,championPath:goodSource.c,detailsDir:goodSource.detailsDir});
 const report=(r=review,l=release('2026-11-04'),q=goodQA,p=proven,d=diff,n=next)=>createPortReadiness({activeSnapshot:old,candidateSnapshot:n,diff:d,review:r,provenance:p,release:l,qa:q});
 const filled=structuredClone(review);for(const a of filled.pending){a.decision='approved';a.evidence=['Verified official patch note and behavior in fixture'];a.automatedTest={id:'dev34-check-'+a.id+'-'+a.field,status:'PASS'};}
 test('official future dates pinned without assuming early release',()=>{assert.equal(SCHEDULE_2026['26.22'],'2026-11-04');assert.equal(SCHEDULE_2026['26.23'],'2026-11-18');});
 test('Data Dragon preview cannot be promoted October 27',()=>{assert.ok(release('2026-10-27').blockers.includes('FUTURE_OR_PBE_PREVIEW'));assert.equal(release('2026-10-27').engineActivation,false);});
 test('even past scheduled date missing official attestation blocks',()=>{assert.ok(release('2026-11-04',false).blockers.includes('OFFICIAL_RELEASE_NOT_ATTESTED'));});
 test('official link required, unknown patch rejected',()=>{const a=classifyCandidate({currentPatch:'26.21',candidatePatch:'26.22',asOf:'2026-11-04',officialReleaseVerified:true,officialNotesUrl:'https://example.com'});assert.ok(a.blockers.includes('OFFICIAL_PATCH_NOTES_REQUIRED'));const b=classifyCandidate({currentPatch:'26.21',candidatePatch:'26.25',asOf:'2026-12-30',officialReleaseVerified:true,officialNotesUrl:official});assert.ok(b.blockers.includes('OFFICIAL_RELEASE_DATE_NOT_REGISTERED'));});
 test('complete fixture recipes have no missing ingredients or cycle',()=>{assert.deepEqual(inspectRecipeGraph(next).missing,[]);assert.equal(inspectRecipeGraph(next).ok,true);});
 test('cycles are detected without changing source',()=>{const bad=structuredClone(next);bad.items['1000'].components=['1100'];const out=inspectRecipeGraph(bad);assert.equal(out.ok,false);assert.ok(out.cycles.length);assert.equal(inspectRecipeGraph(next).ok,true);});
 test('missing ingredient rejects release',()=>{const bad=structuredClone(next);bad.items['1100'].components=['9999'];assert.equal(inspectRecipeGraph(bad).missing[0].ingredient,'9999');});
 test('source payload hashes match official staged bytes',()=>assert.equal(proven.ok,true));
 test('tampered item file fails SHA integrity',()=>{const file=path.join(tmp,'tampered.json');fs.copyFileSync(goodSource.i,file);fs.appendFileSync(file,' ');assert.ok(auditProvenance(next,{itemPath:file,championPath:goodSource.c,detailsDir:goodSource.detailsDir}).issues.includes('SOURCE_HASH_MISMATCH_items'));});
 test('every champion QWER detail is required for future patch review',()=>{const bad=structuredClone(next);bad.validation.championsWithDetails=0;assert.ok(report(filled,release('2026-11-04'),goodQA,proven,diff,bad).blockers.includes('CHAMPION_DETAILS_INCOMPLETE_FOR_QWER_REVIEW'));});
 test('altered QWER detail payload fails SHA-256 gate',()=>{
  const changed=path.join(tmp,'tampered-details');fs.cpSync(goodSource.detailsDir,changed,{recursive:true});
  fs.appendFileSync(path.join(changed,'Champ0.json'),' ');
  const out=auditProvenance(next,{itemPath:goodSource.i,championPath:goodSource.c,detailsDir:changed});
  assert.ok(out.issues.includes('DETAIL_SOURCE_HASH_MISMATCH:Champ0'));
 });
 test('missing physical source files do not claim provenance',()=>{assert.equal(auditProvenance(next).ok,false);});
 test('review queue starts blocked and pending',()=>{assert.equal(assessReviewCoverage(diff,review).ok,false);assert.equal(report().readyForManualPort,false);});
 test('all change-specific reviews need evidence and tests',()=>{const bad=structuredClone(filled);bad.pending[0].evidence=[];assert.equal(assessReviewCoverage(diff,bad).ok,false);bad.pending[0].evidence=['Reviewed official note'];bad.pending[0].automatedTest=null;assert.equal(assessReviewCoverage(diff,bad).ok,false);});
 test('rejected review cannot pass',()=>{const bad=structuredClone(filled);bad.pending[0].decision='rejected';assert.equal(report(bad).readyForManualPort,false);});
 test('incomplete QA cannot pass even after review',()=>{const q={...goodQA,recipePurchases:'NOT_RUN'};assert.ok(report(filled,release('2026-11-04'),q).blockers.includes('QA_NOT_CERTIFIED_recipePurchases'));});
 test('preview release always blocked, even with all reviews PASS',()=>{assert.ok(report(filled,release('2026-10-27')).blockers.includes('PATCH_UNRELEASED_OR_NOT_VERIFIED'));});
 test('stale or tampered diff is rejected',()=>{const tampered=structuredClone(diff);tampered.changes.pop();assert.ok(report(filled,release('2026-11-04'),goodQA,proven,tampered).blockers.includes('DIFF_TAMPERED_OR_STALE'));});
 test('full approval allows manual port only, never combat activation',()=>{const out=report(filled);assert.equal(out.readyForManualPort,true);assert.equal(out.engineActivated,false);assert.equal(out.automaticCombatActivation,false);assert.equal(out.decision,'READY_FOR_MANUAL_IMPLEMENTATION_ONLY');});
 test('preflight CLI exits nonzero on an unreleased patch and never edits engine',()=>{
  const paths={active:path.join(tmp,'active.json'),candidate:path.join(tmp,'candidate.json'),diff:path.join(tmp,'diff.json'),review:path.join(tmp,'review.json'),qa:path.join(tmp,'qa.json')};
  for(const [key,obj] of Object.entries({active:old,candidate:next,diff,review:filled,qa:goodQA}))fs.writeFileSync(paths[key],JSON.stringify(obj));
  const original=fs.readFileSync(path.join(root,'engine.mjs'));
  const command=spawnSync(process.execPath,['tools/patch_release_v453_dev34.mjs','preflight','--active',paths.active,'--candidate',paths.candidate,'--diff',paths.diff,'--review',paths.review,'--qa',paths.qa,'--items',goodSource.i,'--champions',goodSource.c,'--details',goodSource.detailsDir,'--as-of','2026-10-27','--release-verified','yes','--notes-url',official],{cwd:root,encoding:'utf8'});
  assert.equal(command.status,2);assert.ok(command.stdout.includes('PATCH_UNRELEASED_OR_NOT_VERIFIED'));assert.equal(Buffer.compare(original,fs.readFileSync(path.join(root,'engine.mjs'))),0);
 });
 console.log(`DEV34 ${passed}/${passed} PASS`);
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
