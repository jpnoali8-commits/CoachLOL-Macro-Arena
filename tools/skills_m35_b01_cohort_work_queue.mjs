/**
 * M35 B01 cohesive work queue: every individual P+QWER remains an indivisible
 * kit acceptance unit. Group shared-engine work by mechanics, not fake generic
 * champion implementations and not 2-5 hero release fragments.
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {BOARD_M20_B01_V453} from '../engine.mjs';
import {buildM31B01ContractLedger} from './skills_m31_b01_contract_ledger.mjs';
import {M27_CERTIFICATION_DIMENSIONS} from './skills_m27_b01_completeness_audit.mjs';
const SLOT=['Q','W','E','R'];
export const M35_ENGINE_FAMILIES=Object.freeze([
 ['charge_channel',s=>s.m28XerathCharge||s.m28VarusCharge||s.m28GalioCharge||
   s.m29ViCharge||s.m29ZacSlingshot||s.m22ArtilleryShots||s.m16FourShots],
 ['recast_form',s=>s.m21SonicRecast||s.m22SecondStage||s.m24FizzLeap||
   s.m24Arena||s.transformTo||s.m31RellDualForm||s.m26KarthusToggle],
 ['owned_entities',s=>s.boardSummon||s.boardTemporal||s.m20OrbSpawn||
   s.m28HeimerStock||s.m25ShenRefuge||s.m25ViktorGravity],
 ['mark_stacks',s=>s.m20Mark||s.m20MarkRequired||s.m21FrostRequired||
   s.m20OrbConsume||s.m24Devour||s.m30ViktorEvolution],
 ['spatial_targeting',s=>['line_enemy','circle_enemy','cone_enemy',
   'move_point','deploy_point','vision_point','target_enemy','target_ally','target_any'].includes(s.shape)],
 ['owner_buff',s=>s.shape==='self'||s.shape==='circle_ally'||s.shape==='global_ally'||s.shape==='global_enemy']
]);
const authorizedKey=k=>/^(m1[5-9]|m2[0-9]|m3[0-9]|boardTemporal|boardSummon|transformTo)/.test(k)&&
 k!=='m20Missing'&&k!=='m20Status';
export function buildM35B01WorkQueue(){
 const kitLedger=buildM31B01ContractLedger();
 const champions=kitLedger.champions.map(({champion,witness})=>{
  const kit=BOARD_M20_B01_V453[champion];
  const abilities=SLOT.map(slot=>{
   const rule=kit[slot],families=M35_ENGINE_FAMILIES.filter(([,test])=>!!test(rule)).map(([name])=>name);
   const authoredKeys=Object.keys(rule).filter(authorizedKey).sort();
   return {champion,slot,shape:rule.shape,referenceIdentity:witness.identity,
    nativeKeys:authoredKeys,workFamilies:families.length?families:['unclassified_authored_skill'],
    primaryFamily:families[0]||'unclassified_authored_skill',
    debtTag:rule.m20Missing||null,
    blocking:(!authoredKeys.length?['missing_authored_rule']:
      []).concat(rule.m20Missing?['unresolved_legacy_tag']:[])
     .concat(rule.m20Status==='partial_executable'?['not_full_ability']:[]),
    qaRequired:'authoritative hit, separate skill identity, both PvP owners, cross-system adversarial gates',
    status:'PENDING_FULL_KIT_CERTIFICATION'};
  });
  return {champion,passiveId:kit.passive,witness,abilities,
   kitStatus:'NOT_CERTIFIED',dimensions:M27_CERTIFICATION_DIMENSIONS.map(d=>({name:d,
    state:'EVIDENCE_REQUIRED'}))};
 });
 const abilities=champions.flatMap(c=>c.abilities);
 const groups=M35_ENGINE_FAMILIES.map(([name])=>({
  family:name,abilities:abilities.filter(s=>s.workFamilies.includes(name))
   .map(s=>({champion:s.champion,slot:s.slot,debt:s.debtTag})),
  distinctChampions:new Set(abilities.filter(s=>s.workFamilies.includes(name)).map(s=>s.champion)).size
 }));
 const distinct=[...new Set(abilities.map(s=>s.champion))];
 if(abilities.length!==140||distinct.length!==35||champions.length!==35)
  throw Error('B01 35-champion kit or 140 authored slot drift');
 return {schema:'coachlol.skills.m35-b01-work-queue.v1',macroRelease:'B01',
  policy:'Produce all 35 unique complete P+QWER kits before release; groups accelerate shared engine implementation, never replace individual behavior.',
  dimensions:M27_CERTIFICATION_DIMENSIONS,metrics:{
   champions:35,passives:35,qwer:140,unresolvedLegacyTags:
    abilities.filter(s=>s.debtTag).length,slotsWithNativeHooks:
    abilities.filter(s=>s.nativeKeys.length).length,certifiedKits:0},
  groups,champions};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const p=buildM35B01WorkQueue(),idx=process.argv.indexOf('--out');
 if(idx>=0){const out=resolve(process.argv[idx+1]);mkdirSync(dirname(out),{recursive:true});
  writeFileSync(out,JSON.stringify(p,null,2)+'\n');}
 console.log('M35_B01_WORK_QUEUE '+JSON.stringify(p.metrics));
 for(const g of p.groups)console.log('M35_FAMILY '+JSON.stringify({
  family:g.family,skills:g.abilities.length,champions:g.distinctChampions}));
}
