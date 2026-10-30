/** M45 PLATFORM-A12 — source-pinned legacy rollback diagnostics.
 * Node full checkout: node tests/m45_platform_a12_legacy_rollback_golden.test.mjs
 * Source: dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5.
 * PASS means a legacy defect has been reproduced, NOT safety certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
import {interpretCommands,applyCommands} from '../commands.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json'),manifest=data('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=manifest.baseFeatures;
map.riftBundlesV452d4=manifest.variants;
const scenarios=[
 {name:'rollback retains ghost history and nextId after ADC recall',text:'ADC recall; MID farmar safe',effect:'history'},
 {name:'rollback retains smite announcement after JG policy',text:'JG guardar smite; MID farmar safe',effect:'event-smite'},
 {name:'rollback retains purchase announcement after ADC buy',text:'ADC comprar espada longa; MID farmar safe',effect:'event-purchase'}
];
let pass=0;
for(let i=0;i<scenarios.length;i++){
 const {name,text,effect}=scenarios[i];
 const arena=new Arena(map,mask,{mode:'pvp',seed:7041});
 const p=interpretCommands(text,arena,{team:'blue'});
 assert.equal(p.ok,true,JSON.stringify({text,errors:p.errors}));
 const before={world:checksumV40(arena.snapshotV40()),blue:checksumV40(arena.units.filter(u=>u.team==='blue')),red:checksumV40(arena.units.filter(u=>u.team==='red')),history:arena.orderHistory.length,eventCount:arena.events.length,nextId:arena.nextId};
 const setPolicy=arena.setPolicy;
 arena.setPolicy=()=>false; // deterministic fault injection on second MID step
 let result;
 try{result=applyCommands(p,arena,{team:'blue'});}finally{arena.setPolicy=setPolicy;}
 assert.equal(result.ok,false,'second action must be rejected');
 assert.equal(checksumV40(arena.units.filter(u=>u.team==='blue')),before.blue,'units are rolled back by legacy helper');
 assert.equal(checksumV40(arena.units.filter(u=>u.team==='red')),before.red,'enemy units unchanged');
 assert.notEqual(checksumV40(arena.snapshotV40()),before.world,'whole Arena state still dirty after failure');
 if(effect==='history'){
  assert.equal(arena.orderHistory.length,before.history+1);
  assert.equal(arena.nextId,before.nextId+1);
  assert.equal(arena.orderHistory[0].unitId,'blue_ADC');
  assert.equal(arena.orderHistory[0].label,'recall');
 }else{
  assert.equal(arena.events.length,before.eventCount+1);
  assert.equal(arena.events[0].team,'blue');
  assert.equal(arena.events[0].kind,effect==='event-smite'?'smite_plan':'purchase');
 }
 console.log('PASS A12 LEGACY_GAP '+(++pass)+' '+name);
}
console.log('A12 '+pass+'/3 LEGACY_ROLLBACK_GAPS_REPRODUCED; RUST MUST NOT COPY');
