import fs from 'node:fs';
import {CHAMPION_BASE_AA_RANGE,CHAMPION_STATS_V38,CHAMPION_GROWTH_V38,CHAMPION_KITS_V42,catalog,RUNE_PAGES_V43} from '../engine.mjs';
const read=n=>JSON.parse(fs.readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const kits=read('champion_kits_v42.json'),items=read('item_registry_v43.json'),runes=read('rune_pages_v43.json');
const names=[...new Set([...Object.keys(CHAMPION_BASE_AA_RANGE),...Object.keys(CHAMPION_STATS_V38),...Object.keys(kits.champions)])].sort();
const champions=names.map(name=>{const kit=kits.champions[name];return {
 id:name,kitMaturity:kit?.certification||'training_or_not_registered',hasAuditedBaseStats:!!CHAMPION_STATS_V38[name],
 hasAuditedGrowth:!!CHAMPION_GROWTH_V38[name],hasAttackRange:!!CHAMPION_BASE_AA_RANGE[name],
 passiveMaturity:kit?.passive?.status||'not_implemented',
 abilities:Object.fromEntries(['Q','W','E','R'].map(slot=>[slot,kit?.spells?.[slot]? 'manifest_partial_not_certified':'generic_or_missing'])),
 certified:false
};});
const byMaturity=(xs,k)=>Object.fromEntries([...new Set(xs.map(x=>x[k]))].sort().map(s=>[s,xs.filter(x=>x[k]===s).length]));
const result={schema:'coachlol.contentCoverage.v4.5',patchReference:'26.21',asOf:'2026-10-26',mode:'Summoners Rift PC',
 meaning:'Coverage is local to the delivered CoachLOL codebase; NOT all champions/items available in LoL.',
 sourceCatalogs:['data/champion_kits_v42.json','data/champion_stats_v42.json','data/item_registry_v43.json','data/rune_pages_v43.json'],
 summary:{registeredChampionNames:names.length,kitManifests:Object.keys(kits.champions).length,certifiedChampionKits:0,
  auditedBaseStats:champions.filter(c=>c.hasAuditedBaseStats).length,items:items.items.length,
  itemsByMaturity:byMaturity(items.items,'maturity'),runeKeystones:Object.values(runes.pages).filter(p=>p.keystone).length,
  fullyCertifiedRunes:0,certifiedItems:0},
 champions,
 items:items.items.map(({id,name,maturity,effect,source})=>({id,name,maturity,hasModeledEffect:!!effect,source:source||null,fullyCertified:false})),
 runes:Object.entries(runes.pages).map(([id,p])=>({id,keystone:p.keystone,maturity:p.maturity,fullyCertified:false})),
 summonerSpells:[
  {id:'flash',maturity:'functional_partial',openIssues:['walls and cast phases','summoner haste precision']},
  {id:'smite',maturity:'functional_partial',openIssues:['monster vs champion differentiation','item pet progression by patch']},
  ...['ignite','heal','barrier','exhaust','tp'].map(id=>({id,maturity:'functional_partial',openIssues:['full targeting / edge interactions by patch']})),
  {id:'ghost',maturity:'missing'}, {id:'cleanse',maturity:'missing'}
 ],
 sharedMechanics:[
  {id:'targeted_spell',maturity:'partial'}, {id:'line_skillshot',maturity:'partial'},
  {id:'ground_aoe',maturity:'partial'}, {id:'recast',maturity:'partial'},
  {id:'cc_and_status_ledger',maturity:'partial'}, {id:'damage_shields_healing',maturity:'partial'},
  {id:'projectile_frame_collision',maturity:'planned'}, {id:'item_active_cast',maturity:'partial'},
  {id:'rune_proc',maturity:'prototype'}, {id:'build_recipe_and_refund',maturity:'partial'},
  {id:'voidgrubs_three_individual_teams',maturity:'functional_prototype_v45'},
  {id:'rift_herald_eye_pickup_summon_siege',maturity:'functional_prototype_v45'},
  {id:'herald_ride_and_eye_backswing',maturity:'missing'},
  {id:'causal_replay_from_commands',maturity:'planned'},
  {id:'authoritative_server',maturity:'planned'}
 ],
 releaseGate:{completeLolParity:false,mayExtendCatalogWithoutCertification:true,
  requireSourceAndPatch:true,requireEngineEffectsAndUITests:true,requireFogVerification:true,
  prohibitClaimingCertifiedWithoutTestEvidence:true}
};
fs.writeFileSync(new URL('../data/content_coverage_v45.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result.summary,null,2));
