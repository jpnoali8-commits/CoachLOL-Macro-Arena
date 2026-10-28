// Snapshot-only publication. Never mutates the 26.21 raw or prior exports.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {catalog,ITEM_RECIPES,ITEM_EFFECTS_V43} from '../engine.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=path.join(root,'data/riot_reference');
const read=n=>JSON.parse(fs.readFileSync(path.join(data,n),'utf8'));
const dev37=read('catalog_26_21_dev37.json');
if(dev37.ddVersion!=='16.21.1'||catalog.length!==70||dev37.counts.localPlayableItems!==70)throw Error('26.21 baseline incompatible');
const effects={
 scouts_slingshot:{status:'partial_playable',code:'dev38_bullseye',details:'40 magical; 40 seconds cooldown; -1 second per actual basic attack'},
 rapid_firecannon:{status:'partial_playable',code:'dev38_energized',details:'100 stacks from walking and basic attacks, 40 magic, 35% bonus attack range capped at 150 world units'},
 dorans_ring:{status:'partial_playable',code:'dev38_dorans',details:'1/2 mana per second, 5 seconds combat boost, 45% conversion without mana, +5 minion basic attack physical'}
};
const out={...dev37,schema:'coachlol.catalog.reference.v453.dev38',localEffectCoverageV453Dev38:effects};
fs.writeFileSync(path.join(data,'catalog_26_21_dev38.json'),JSON.stringify(out,null,2)+'\n');
fs.writeFileSync(path.join(data,'catalog_26_21_dev38.js'),'window.COACHLOL_OFFICIAL_CATALOG = '+JSON.stringify(out)+';\n');
const coverage=catalog.map(item=>{
 const official=Object.values(out.items).find(v=>v.localId===item.id);
 return {id:item.id,riotId:official?.id||null,name:item.name,cost:item.cost,
 recipe:ITEM_RECIPES[item.id]||[],statsPlayable:Object.keys(item.stats||{}),
 effectKind:ITEM_EFFECTS_V43[item.id]?.kind||null,effectsMaturity:ITEM_EFFECTS_V43[item.id]?.maturity||'not_certified',
 functionalLevel:effects[item.id]?.status||'unchanged_from_dev37_partial_or_stats_only'};
});
const folder=path.join(root,'docs/QA_EVIDENCE_V453_DEV38');fs.mkdirSync(folder,{recursive:true});
fs.writeFileSync(path.join(folder,'item_coverage_dev38.json'),JSON.stringify({schema:'coachlol.item_coverage.v453.dev38',patch:'26.21',total:coverage.length,updatedMechanics:Object.keys(effects),items:coverage},null,2)+'\n');
console.log('DEV38_REFERENCE_PUBLISHED',coverage.length,dev37.counts.all,Object.keys(effects));
