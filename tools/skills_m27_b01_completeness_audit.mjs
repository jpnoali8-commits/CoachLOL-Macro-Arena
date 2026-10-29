/** M27 audit is a certification BLOCKER, not a coverage inflator.
 * Run: node tools/skills_m27_b01_completeness_audit.mjs
 * Or:  node tools/skills_m27_b01_completeness_audit.mjs --out docs/skills_macro_batches_dev69/M27_B01_COMPLETENESS_MANIFEST.json
 */
import {writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {BOARD_M20_B01_V453} from '../engine.mjs';

export const M27_CERTIFICATION_DIMENSIONS=Object.freeze([
 'passive','Q','W','E','R','recast','transform','summon_or_entity',
 'terrain_collision','fog_and_reveal','combat_realm','items',
 'runes','summoner_spells','two_human_pvp','snapshot_replay','undo_and_receipts'
]);
const SLOTS=['Q','W','E','R'];
export function buildM27B01Audit(){
 const keys=Object.keys(BOARD_M20_B01_V453).sort();
 const champions=keys.map(champion=>{
  const kit=BOARD_M20_B01_V453[champion];
  const authoredQWER=Object.fromEntries(SLOTS.map(slot=>{
   const s=kit[slot];
   const uniqueContracts=Object.keys(s||{}).filter(k=>/^(m1[5-9]|m2[0-9]|boardTemporal|boardSummon|transformTo|m26|m27)/.test(k)&&
    k!=='m20Status'&&k!=='m20Missing').sort();
   return [slot,{
    status:'EXECUTABLE_PARTIAL_NOT_CERTIFIED',
    shape:s?.shape??null,range:s?.range??null,baseCooldown:s?.cooldown??s?.cd??null,
    uniqueContracts,unreconciledLegacyDebtTag:s?.m20Missing??null,
    requires:{effect:true,counterplay:true,resource:true,vision:true,realm:true,
     items:true,runes:true,teamVsTeam:true,snapshot:true}
   }];
  }));
  return {
   champion,passiveId:kit.passive,
   passiveStatus:'NOT_FULLY_CERTIFIED',
   QWER:authoredQWER,
   dimensionGates:Object.fromEntries(M27_CERTIFICATION_DIMENSIONS.map(k=>
    [k,'NOT_CERTIFIED_PENDING_ADVERSARIAL_KIT_QA'])),
   certification:'NOT_CERTIFIED',
   priority:'Reconcile champion specific passives, all four skills, recasts and cross-system tests before CERTIFIED'
  };
 });
 const refs=champions.reduce((n,c)=>n+SLOTS.length,0);
 return {
  milestone:'M27_B01_COMPLETE_KIT_AUDIT',
  scope:'fixed B01 cohort; deterministic two-human simultaneous-turn PvP',
  noGenericFallbackCertification:true,
  metrics:{champions:champions.length,QWER:refs,certifiedChampions:0},
  evidence:{
   previousIdentityBatches:['M24','M25','M26'],
   m27PassiveSuite:'tests/audit/v453_m27_b01_passive_identities.test.mjs',
   important:'Successful authored behavior proves that interaction only, not P+QWER full parity'
  },
  dimensions:M27_CERTIFICATION_DIMENSIONS,
  champions
 };
}
const cli=process.argv[1]&&import.meta.url.endsWith('/'+process.argv[1].split('/').at(-1));
if(cli){
 const audit=buildM27B01Audit();
 if(audit.metrics.champions!==35||audit.metrics.QWER!==140)
  throw new Error('B01 cohort unexpectedly changed');
 const outArg=process.argv.indexOf('--out');
 const json=JSON.stringify(audit,null,2)+'\n';
 if(outArg>=0){
  const output=resolve(process.argv[outArg+1]);
  mkdirSync(dirname(output),{recursive:true});
  writeFileSync(output,json,'utf8');
 }
 console.log('M27_B01_CERTIFICATION_AUDIT '+JSON.stringify(audit.metrics));
 if(outArg<0)process.stdout.write(json);
}
