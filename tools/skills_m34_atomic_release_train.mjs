/**
 * M34: atomic, fail-closed macro-release train. This is a production gate,
 * not an ability generator and not a replacement for champion-authored rules.
 * Source is the frozen 173 champion roster and actual B01 descriptors.
 *
 * node tools/skills_m34_atomic_release_train.mjs --out docs/skills_macro_batches_dev69/M34_ATOMIC_RELEASE_TRAIN.json
 */
import {readFileSync,existsSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {buildMacroBatches} from './skills_macro_batch_planner_v453_dev69.mjs';
import {M27_CERTIFICATION_DIMENSIONS} from './skills_m27_b01_completeness_audit.mjs';
import {M31_B01_CHAMPION_WITNESSES} from './skills_m31_b01_contract_ledger.mjs';
import {BOARD_M20_B01_V453} from '../engine.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const SLOTS=['P','Q','W','E','R'];
const ABILITIES=['Q','W','E','R'];
const EVIDENCE_SCHEMA='coachlol.skills.atomic-kit-evidence.v1';
const PROOF_MARKER='COACHLOL_KIT_PROOF_V1 ';
export const M34_DIMS=Object.freeze([...M27_CERTIFICATION_DIMENSIONS]);

function assertText(v){return typeof v==='string'&&v.trim().length>3}
function validSuite(v){
 return typeof v==='string'&&/^tests\/skills\/kit_release\/[a-zA-Z0-9_-]+\.test\.mjs$/.test(v)&&
  existsSync(resolve(ROOT,v));
}
function validReceipt(v){
 return !!v&&typeof v==='object'&&validSuite(v.suite)&&assertText(v.case)&&assertText(v.identity);
}
function approvedProofs(champion,claim,runner){
 const blockers=[];
 if(!claim||typeof claim!=='object')return ['no_claim_submitted'];
 if(claim.status!=='READY_FOR_CERTIFICATION')blockers.push('not_ready_claim');
 if(!claim.slots||!claim.dimensions)blockers.push('missing_slot_or_dimension_proof');
 for(const slot of SLOTS)
  if(!validReceipt(claim.slots?.[slot]))blockers.push('missing_identity_proof_'+slot);
 for(const dim of M34_DIMS){
  const proof=claim.dimensions?.[dim];
  if(!validReceipt(proof))blockers.push('missing_dimension_proof_'+dim);
  else if(proof.applicability==='NA'&&(!assertText(proof.rationale)||
    !/not.applicable|does.not.apply/i.test(proof.rationale)))
   blockers.push('unjustified_na_'+dim);
 }
 if(blockers.length)return blockers;
 // Tests must *execute* and emit a machine-readable per-champion proof.
 // A file path, a test name or a green unrelated CI job is NOT proof.
 const suites=[...new Set([...Object.values(claim.slots),
  ...Object.values(claim.dimensions)].map(x=>x.suite))];
 const witnessed=new Map();
 for(const suite of suites){
  const run=runner(suite,champion);
  if(!run?.ok||!Array.isArray(run.proofs)){
   blockers.push('suite_failed_'+suite);continue;
  }
  for(const item of run.proofs){
   if(item.champion!==champion||!assertText(item.case)||!assertText(item.identity))continue;
   const key=suite+'|'+item.case;
   witnessed.set(key,item);
  }
 }
 for(const [slot,proof] of Object.entries(claim.slots)){
  const witness=witnessed.get(proof.suite+'|'+proof.case);
  if(!witness||witness.slot!==slot||witness.identity!==proof.identity)
   blockers.push('unwitnessed_slot_'+slot);
 }
 for(const [dim,proof] of Object.entries(claim.dimensions)){
  const witness=witnessed.get(proof.suite+'|'+proof.case);
  if(!witness||!Array.isArray(witness.dimensions)||
     !witness.dimensions.includes(dim)||witness.identity!==proof.identity)
   blockers.push('unwitnessed_dimension_'+dim);
 }
 return blockers;
}
export function runKitProofSuite(suite,champion){
 if(!validSuite(suite))return {ok:false,proofs:[]};
 const proc=spawnSync(process.execPath,[resolve(ROOT,suite),'--kit-proof',champion],{
  cwd:ROOT,encoding:'utf8',timeout:120000,maxBuffer:1024*1024
 });
 if(proc.status!==0||proc.error)return {ok:false,proofs:[]};
 const lines=String(proc.stdout||'').split('\n').filter(v=>v.startsWith(PROOF_MARKER));
 if(lines.length!==1)return {ok:false,proofs:[]};
 try{
  const data=JSON.parse(lines[0].slice(PROOF_MARKER.length));
  return {ok:data.schema===EVIDENCE_SCHEMA&&data.champion===champion,
   proofs:data.proofs};
 }catch{return {ok:false,proofs:[]}}
}
export function buildM34AtomicReleaseTrain({claims={},runner=runKitProofSuite}={}){
 const plan=buildMacroBatches();
 const batches=plan.batches.map(b=>({id:b.id,champions:b.champions,
  expected:b.count,ready:0,blocked:b.count,status:'BLOCKED_UNTIL_ALL_KITS_CERTIFIED'}));
 const batchFor=new Map(batches.flatMap(b=>b.champions.map(c=>[c,b])));
 const rows=plan.roster.map(ref=>{
  const champion=ref.champion,batch=batchFor.get(champion);
  const board=BOARD_M20_B01_V453[champion]||null;
  const authored=!!board&&!!M31_B01_CHAMPION_WITNESSES[champion];
  const issues=[];
  const slots={P:{reference:ref.passive.name,identity:board?.passive||null,
   status:board?'PARTIAL_NOT_CERTIFIED':'REFERENCE_UNVERIFIED'}};
  for(const a of ref.abilities){
   const rule=board?.[a.slot]||null;
   const keys=rule?Object.keys(rule).filter(k=>
    /^(m1[5-9]|m2[0-9]|m3[0-9]|m4[0-9]|boardTemporal|boardSummon|transformTo)/.test(k)&&
    k!=='m20Status'&&k!=='m20Missing'):[];
   const descriptor=rule?.m20Status||null;
   const legacy=rule?.m20Missing||null;
   // B02-B05 are *not* absent from the real game engine: their routing
   // lives outside B01. Record the M19 abilityRule result truthfully rather
   // than mislabelling every non-B01 skill a generic fallback.
   const generic=!rule&&a.status==='TRAINING_FALLBACK';
   slots[a.slot]={reference:a.name,riotId:a.riotId,
    actualShape:rule?.shape||a.runtimeShape||null,
    authoredRuleKeys:keys,legacyDebt:legacy,
    status:generic?'TRAINING_FALLBACK':!rule?'ROUTED_UNVERIFIED_OUTSIDE_B01':
     descriptor==='partial_executable'?'EXECUTABLE_PARTIAL':'ROUTED_UNVERIFIED'};
   if(generic)issues.push('runtime_generic_'+a.slot);
   if(descriptor==='partial_executable')issues.push('descriptor_still_partial_'+a.slot);
   if(legacy)issues.push('legacy_identity_debt_'+a.slot+':'+legacy);
   if(rule&&!keys.length)issues.push('no_authored_rule_keys_'+a.slot);
  }
  if(!authored)issues.push('atomic_kit_ledger_pending_for_batch');
  if(!claims[champion])issues.push('kit_evidence_not_submitted');
  else issues.push(...approvedProofs(champion,claims[champion],runner));
  const unique=[...new Set(issues)];
  const ready=unique.length===0;
  if(ready)batch.ready++;
  return {champion,batch:batch.id,passive:ref.passive.name,
   slots,mechanicHints:ref.mechanicHints,identityWitness:authored?
    M31_B01_CHAMPION_WITNESSES[champion]:null,
   certification:ready?'CERTIFIED_BY_ATOMIC_GATE':'BLOCKED_NOT_CERTIFIED',
   blockers:unique};
 });
 const unknown=Object.keys(claims).filter(name=>!rows.some(r=>r.champion===name));
 if(unknown.length)throw Error('Unknown certification claims: '+unknown.join(','));
 for(const b of batches){
  b.blocked=b.expected-b.ready;
  if(b.blocked===0)b.status='READY_FOR_INTEGRATOR_REVIEW';
 }
 const metrics={champions:rows.length,batches:batches.length,
  qwer:rows.length*4,fullyCertified:rows.filter(x=>x.certification==='CERTIFIED_BY_ATOMIC_GATE').length,
  readyBatches:batches.filter(x=>x.blocked===0).length,
  trainingFallbackSlots:rows.reduce((n,r)=>n+ABILITIES.filter(s=>r.slots[s].status==='TRAINING_FALLBACK').length,0),
  routedOutsideB01:rows.reduce((n,r)=>n+ABILITIES.filter(s=>r.slots[s].status==='ROUTED_UNVERIFIED_OUTSIDE_B01').length,0),
  legacyB01DebtTags:rows.reduce((n,r)=>n+ABILITIES.filter(s=>r.slots[s].legacyDebt).length,0)};
 if(rows.length!==173||metrics.qwer!==692||batches.map(b=>b.expected).join(',')!=='35,35,35,35,33')
  throw Error('Fixed macro-cohort drift');
 return {schema:'coachlol.skills.atomic-release.v1',sourcePatch:plan.patch,
  policy:'35/35 individually certified kits for a B01-B04 integration-ready package; B05 33/33. No training fallback, per-slot identity and executable 17-dimension evidence required.',
  dimensions:M34_DIMS,batches,metrics,champions:rows};
}
function cli(){
 const i=process.argv.indexOf('--claims'),claims=i<0?{}:
  JSON.parse(readFileSync(resolve(process.argv[i+1]),'utf8')).kits||{};
 const manifest=buildM34AtomicReleaseTrain({claims});
 const out=process.argv.indexOf('--out');
 if(out>=0){
  const p=resolve(process.argv[out+1]);
  mkdirSync(dirname(p),{recursive:true});
  writeFileSync(p,JSON.stringify(manifest,null,2)+'\n');
 }
 console.log('M34_ATOMIC_RELEASE '+JSON.stringify(manifest.metrics));
 for(const b of manifest.batches)
  console.log('M34_BATCH '+JSON.stringify({id:b.id,ready:b.ready,blocked:b.blocked,status:b.status}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))cli();
