/** CoachLOL Dev34 — future-patch preflight and release review gates.
 * Pure validation (including the CLI): NEVER writes to engine, items, snapshots, game state.
 * A passing gate authorizes only human implementation work, NOT activation of new combat rules.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {diffPatches} from './patch_center_v453_dev33.mjs';

export const SCHEDULE_2026=Object.freeze({'26.21':'2026-10-21','26.22':'2026-11-04','26.23':'2026-11-18','26.24':'2026-12-09'});
const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const validISO=date=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&!Number.isNaN(Date.parse(date+'T00:00:00Z'));
const stableValue=x=>JSON.stringify(x);
const isRecord=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);

export function inspectRecipeGraph(snapshot){
 const items=snapshot?.items||{}; const missing=[],cycles=[],invalid=[],visited=new Set(),active=new Set();
 for(const [id,item] of Object.entries(items)){
  if(!item||!Array.isArray(item.components)||!Number.isFinite(item.cost)||item.cost<0){invalid.push(id);continue;}
  for(const comp of item.components)if(!items[comp])missing.push({item:id,ingredient:comp});
 }
 function visit(id,stack){if(active.has(id)){cycles.push([...stack,id]);return;}if(visited.has(id))return;
  active.add(id);for(const comp of items[id]?.components||[])if(items[comp])visit(comp,[...stack,id]);active.delete(id);visited.add(id);
 }
 for(const id of Object.keys(items))visit(id,[]);
 return {items:Object.keys(items).length,missing,cycles,invalid,ok:missing.length===0&&cycles.length===0&&invalid.length===0};
}

export function auditProvenance(snapshot,{itemPath,championPath,detailsDir}={}){
 const issues=[],matches={};
 for(const [kind,file] of [['items',itemPath],['champions',championPath]]){
  const expected=snapshot?.sources?.[kind]?.sha256;
  if(!expected||!/^[a-f0-9]{64}$/i.test(expected)){issues.push(`SOURCE_SHA_MISSING_${kind}`);continue;}
  if(!file||!fs.existsSync(file)){issues.push(`SOURCE_FILE_MISSING_${kind}`);continue;}
  const raw=fs.readFileSync(file),actual=sha256(raw);matches[kind]={expected,actual,match:actual===expected};
  if(actual!==expected)issues.push(`SOURCE_HASH_MISMATCH_${kind}`);
  try{const doc=JSON.parse(raw);if(doc.version!==snapshot.dataDragonVersion)issues.push(`SOURCE_VERSION_MISMATCH_${kind}`);}catch{issues.push(`SOURCE_JSON_INVALID_${kind}`);}
 }
 const expectedDetails=snapshot?.sources?.detailChecksums||{};
 if(snapshot?.validation?.championsWithDetails>0){
  if(Object.keys(expectedDetails).length!==snapshot.validation.championsWithDetails)issues.push('DETAIL_SOURCE_MANIFEST_INCOMPLETE');
  for(const [id,expected] of Object.entries(expectedDetails)){
   const file=detailsDir&&path.join(detailsDir,id+'.json');
   if(!file||!fs.existsSync(file)){issues.push('DETAIL_SOURCE_FILE_MISSING:'+id);continue;}
   if(sha256(fs.readFileSync(file))!==expected)issues.push('DETAIL_SOURCE_HASH_MISMATCH:'+id);
  }
 }
 return {ok:issues.length===0,issues,matches};
}

export function classifyCandidate({currentPatch,candidatePatch,asOf='2026-10-27',releaseDates=SCHEDULE_2026,officialNotesUrl=null,officialReleaseVerified=false,source='Data Dragon'}={}){
 if(!validISO(asOf))throw Error('asOf inválido');
 if(!/^\d{2}\.\d{2}$/.test(currentPatch||'')||!/^\d{2}\.\d{2}$/.test(candidatePatch||''))throw Error('patch inválido');
 const known=releaseDates[candidatePatch];if(known&&!validISO(known))throw Error('data de lançamento inválida');
 const blockers=[];
 if(candidatePatch<=currentPatch)blockers.push('NOT_NEWER_THAN_ACTIVE');
 if(!known)blockers.push('OFFICIAL_RELEASE_DATE_NOT_REGISTERED');
 if(known&&asOf<known)blockers.push('FUTURE_OR_PBE_PREVIEW');
 if(!officialReleaseVerified)blockers.push('OFFICIAL_RELEASE_NOT_ATTESTED');
 if(!/^https:\/\/(www\.)?leagueoflegends\.com\//.test(officialNotesUrl||''))blockers.push('OFFICIAL_PATCH_NOTES_REQUIRED');
 if(source!=='Data Dragon')blockers.push('NONOFFICIAL_DATA_SOURCE');
 return {currentPatch,candidatePatch,asOf,releaseScheduled:known||null,readyForReview:!blockers.length,blockers,status:blockers.length?'PREVIEW_OR_UNVERIFIED':'OFFICIAL_RELEASE_ATTESTED_REVIEW_ONLY',engineActivation:false};
}

function reviewKey(x){return [x.collection,x.id,x.field||'',x.type,x.category].join('::');}
export function assessReviewCoverage(diff,review){
 const issues=[];
 if(diff?.schema!=='coachlol.patch.diff.v1'||review?.schema!=='coachlol.patch.review.v1')return {ok:false,issues:['INVALID_REVIEW_OR_DIFF_SCHEMA'],reviewed:0,expected:diff?.changes?.length||0};
 if(review.from!==diff.from||review.to!==diff.to)issues.push('REVIEW_PATCH_MISMATCH');
 const required=new Map(),duplicates=[];
 for(const item of diff.changes){const key=reviewKey(item);required.set(key,(required.get(key)||0)+1);}
 const submitted=new Map();
 for(const item of review.pending||[]){const key=reviewKey(item);submitted.set(key,(submitted.get(key)||0)+1);
  if(!['approved','rejected','not_applicable'].includes(item.decision))issues.push(`DECISION_PENDING:${key}`);
  if(item.decision==='rejected')issues.push(`REVIEW_REJECTED:${key}`);
  if(!Array.isArray(item.evidence)||!item.evidence.length||item.evidence.some(e=>typeof e!=='string'||e.trim().length<10))issues.push(`EVIDENCE_MISSING:${key}`);
  if(!item.automatedTest||item.automatedTest.status!=='PASS'||typeof item.automatedTest.id!=='string'||!item.automatedTest.id.trim())issues.push(`TEST_EVIDENCE_MISSING:${key}`);
 }
 for(const [key,n] of required)if(submitted.get(key)!==n)issues.push(`REVIEW_ENTRIES_INCOMPLETE:${key}`);
 for(const [key,n] of submitted)if(!required.has(key)||n>1)duplicates.push(key);
 if(duplicates.length)issues.push('DUPLICATE_OR_UNKNOWN_REVIEW_ITEMS');
 return {ok:!issues.length,issues,reviewed:(review.pending||[]).length,expected:diff.changes.length};
}

/** A go/no-go report for beginning MANUAL engine porting, never an engine switch. */
export function createPortReadiness({activeSnapshot,candidateSnapshot,diff,review,provenance,release,qa}={}){
 const blockers=[];
 if(!activeSnapshot||!candidateSnapshot||activeSnapshot.schema!=='coachlol.patch.snapshot.v1'||candidateSnapshot.schema!=='coachlol.patch.snapshot.v1')blockers.push('INVALID_SNAPSHOTS');
 if(!diff||diff.fromVersion!==activeSnapshot?.dataDragonVersion||diff.toVersion!==candidateSnapshot?.dataDragonVersion)blockers.push('DIFF_VERSION_MISMATCH');
 if(diff&&activeSnapshot&&candidateSnapshot){const recalculated=diffPatches(activeSnapshot,candidateSnapshot);
  if(stableValue(diff.changes)!==stableValue(recalculated.changes))blockers.push('DIFF_TAMPERED_OR_STALE');}
 if(candidateSnapshot?.status!=='reference_staged_unapproved'||candidateSnapshot?.validation?.certifiedForCombat!==false)blockers.push('UNSAFE_REFERENCE_STATUS');
 if((candidateSnapshot?.validation?.items||0)<150||(candidateSnapshot?.validation?.champions||0)<120)blockers.push('INCOMPLETE_OFFICIAL_CATALOG');
 if((candidateSnapshot?.validation?.championsWithDetails||0)<(candidateSnapshot?.validation?.champions||0))blockers.push('CHAMPION_DETAILS_INCOMPLETE_FOR_QWER_REVIEW');
 const recipes=inspectRecipeGraph(candidateSnapshot);
 if(!recipes.ok)blockers.push('BROKEN_RECIPE_GRAPH');
 if(!provenance?.ok)blockers.push('SOURCE_PROVENANCE_UNVERIFIED');
 if(!release?.readyForReview)blockers.push('PATCH_UNRELEASED_OR_NOT_VERIFIED');
 if(release?.currentPatch!==activeSnapshot?.patch||release?.candidatePatch!==candidateSnapshot?.patch)blockers.push('RELEASE_VERSION_MISMATCH');
 const reviews=assessReviewCoverage(diff,review);
 if(!reviews.ok)blockers.push('REVIEW_INCOMPLETE');
 for(const key of ['fullNpmTest','nodeBrowserParity','recipePurchases','snapshotsAndReplays','matchCompletion','fogAndObjectives'])if(qa?.[key]!=='PASS')blockers.push(`QA_NOT_CERTIFIED_${key}`);
 return {schema:'coachlol.patch.port-readiness.v1',from:activeSnapshot?.patch,to:candidateSnapshot?.patch,decision:blockers.length?'BLOCKED':'READY_FOR_MANUAL_IMPLEMENTATION_ONLY',readyForManualPort:blockers.length===0,engineActivated:false,automaticCombatActivation:false,blockers,recipes,review:reviews,releaseStatus:release?.status||'UNVERIFIED',note:'Passing this review never edits or enables the live game; every changed behavior must be implemented, tested, and explicitly approved.'};
}

function opt(args,key){const i=args.indexOf('--'+key);return i>=0?args[i+1]:null;}
function jsonFile(f){if(!f)throw Error('arquivo obrigatório ausente');return JSON.parse(fs.readFileSync(f,'utf8'));}
async function cli(){const [action,...args]=process.argv.slice(2);
 if(action==='inspect'){
  const snapshot=jsonFile(opt(args,'snapshot'));
  console.log(JSON.stringify({patch:snapshot.patch,recipes:inspectRecipeGraph(snapshot),provenance:auditProvenance(snapshot,{itemPath:opt(args,'items'),championPath:opt(args,'champions'),detailsDir:opt(args,'details')})},null,2));
 }else if(action==='preflight'){
  const active=jsonFile(opt(args,'active')),candidate=jsonFile(opt(args,'candidate')),diff=jsonFile(opt(args,'diff')),review=jsonFile(opt(args,'review')),qa=jsonFile(opt(args,'qa'));
  const release=classifyCandidate({currentPatch:active.patch,candidatePatch:candidate.patch,asOf:opt(args,'as-of')||'2026-10-27',officialReleaseVerified:opt(args,'release-verified')==='yes',officialNotesUrl:opt(args,'notes-url')});
  const result=createPortReadiness({activeSnapshot:active,candidateSnapshot:candidate,diff,review,provenance:auditProvenance(candidate,{itemPath:opt(args,'items'),championPath:opt(args,'champions'),detailsDir:opt(args,'details')}),release,qa});
  console.log(JSON.stringify(result,null,2));if(!result.readyForManualPort)process.exitCode=2;
 }else throw Error('Usage: inspect --snapshot SNAP --items RAW_ITEM.json --champions RAW_CHAMPION.json | preflight --active SNAP --candidate SNAP --diff DIFF --review REVIEW --qa QA --items RAW_ITEM --champions RAW_CHAMPION --details DETAILS_DIR --as-of YYYY-MM-DD --release-verified yes --notes-url OFFICIAL_URL');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))cli().catch(e=>{console.error('DEV34_PATCH_PREFLIGHT_ERROR:',e.message);process.exitCode=1});
